const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware=require('../middleware/authMiddleware')
const adminMiddleware=require('../middleware/adminMiddleware')
const sendEmail=require('../utils/sendEmail')
const router = express.Router();
router.get('/admin-panel',authMiddleware,adminMiddleware,(req,res)=>{
    res.json({message:"Admin paneline xos gelmisiz"})
})
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -__v -resetCode');
    if (!user) return res.status(404).json({ message: "Istifadeci tapilmadi" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server xətası", error: err.message });
  }
});

router.post('/register',async(req,res)=>{
  const {email,password,role}=req.body;
  try {
    const existingUser=await User.findOne({email})
    if(existingUser){
      return res.status(400).json({message:"Bu email istifade olunub"})
    }
    const salt=await bcrypt.genSalt(10)
    const hashedPassword=await bcrypt.hash(password,salt)
    const newUser=new User({
      email,
      password:hashedPassword,
      role:role||"user"
    })
    await newUser.save()
    res.status(201).json({ message: 'Qeydiyyat uğurla tamamlandı' });
  } catch (err) {
    res.status(500).json({ message: 'Server xətası', error: err.message });
  }
})
router.post('/login',async(req,res)=>{
    const {email,password}=req.body
    try{
        const user=await User.findOne({email})
        if(!user) return res.status(400).json({ message: 'Email və ya şifrə yanlışdır' });
        const isMatch=await bcrypt.compare(password,user.password)
        if (!isMatch) return res.status(400).json({ message: 'Email və ya şifrə yanlışdır' }); 
        const refreshToken=jwt.sign(
            {userId:user._id},
            process.env.JWT_REFRESH_SECRET,
            {expiresIn:'7d'}
        )   
        const accessToken=jwt.sign(
            {userId:user._id,email:user.email,role:user.role},
            process.env.JWT_SECRET,
            {expiresIn:'1h'}
        )
        res.cookie('refreshToken',refreshToken,{
            httpOnly:true,
            secure:false,
            sameSite:'strict',
            maxAge:7*24*60*60*1000
        })
        res.json({ message: 'Daxil olundu', accessToken });
  } catch (err) {
    res.status(500).json({ message: 'Server xətası', error: err.message });
    }
})
router.put('/update',authMiddleware,async(req,res)=>{
    const {email,password}=req.body
    const updates={}
    if(email) updates.email=email
    if(password){
        const salt=await bcrypt.genSalt(10)
        updates.password=await bcrypt.hash(password,salt)
    }
    try{
        const updateUser=await User.findByIdAndUpdate(
            req.user.userId,
            updates,
            {new:true}
        )
        res.json({
            message:"Istifadeci melumatlari yeniledi",
            user:{
                email:updateUser.email,
                id:updateUser._id
            }
        })
    }catch(err){
        res.status(500).json({message:"Yenilenme zamani xeta bas verdi",error:err.message})
    }
})
router.post('/logout',authMiddleware,(req,res)=>{
    res.clearCookie('refreshToken');
    res.json({ message: 'Çıxış edildi. Token silinməlidir.' });
})
router.post('/refresh',(req,res)=>{
    const token=req.cookies.refreshToken
    if(!token) return res.status(401).json({message:'Refresh token yoxdur'})
        try{
    const decoded=jwt.verify(token,process.env.JWT_REFRESH_SECRET)
    const newAccessToken=jwt.sign(
        { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )
    res.json({accessToken:newAccessToken})
    }catch(err){
res.status(403).json({ message: 'Etibarsız refresh token' });
    }

})
router.post('/forgot-password',async (req,res)=>{
    const {email}=req.body
    const user=await User.findOne({email})
    if(!user) return res.status(404).json({message:'Istifadeci tapilmadi'})
    const code=Math.floor(100000+Math.random()*900000).toString()
    user.resetCode=code
    await user.save()   
    await sendEmail(email, 'Şifrə sıfırlama kodu', `Sənin kodun: ${code}`);
     res.json({ message: 'Kod emailə göndərildi' });
})
router.post('/reset-password',async (req,res)=>{
    const{email,code,newPassword}=req.body
    const user=await User.findOne({email,resetCode:code})
    if (!user) return res.status(400).json({ message: 'Yanlış kod və ya email' });
    const hashed=await bcrypt.hash(newPassword,10)
    user.password=hashed
    user.resetCode=null
    await user.save()
    res.json({ message: 'Şifrə uğurla yeniləndi' });
})
module.exports=router;