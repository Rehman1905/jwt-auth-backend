const express=require('express')
const Post=require('../models/Post')
const authMiddleware=require('../middleware/authMiddleware')
const router=express.Router();
router.post('/',authMiddleware,async(req,res)=>{
    try{
        const newPost=new Post({
            ...req.body,
            author:req.user._id
        })
        await newPost.save()
        res.status(201).json({message:"Yazi yazildi",post:newPost})
    }catch(err){
        return res.status(500).json({message:"Xeta bas verdi",error:err.message})
    }
})
router.get('/',async(req,res)=>{
    try{
        const posts=await Post.find().populate("author","email").exec()
        res.json(posts)
    }catch(err){
        res.status(500).json({message:"Xeta bas verdi",error:err.message})
    }
})
router.put('/:id',authMiddleware,async (req,res)=>{
    try{
        const post=await Post.findById(req.params.id)
        if(!post) return res.status(404).json({message:"Yazi tapilmadi"})
        
        if(post.author.toString()!==req.user._id.toString())
            return res.status(403).json({message:"Bu yaznin redakte etmeye icazeniz yoxdur"})
        post.set(req.body)
        await post.save()
        res.json({message:"Yazi yazildi",post})
    }catch(err){
        res.status(500).json({message:"Xeta bas verdi",error:err.message})
    }
})
router.delete('/:id',authMiddleware,async (req,res)=>{
    try{
        const post=await Post.findById(req.params.id)
        if(!post) return res.status(404).json({message:"Yazi tapilmadi"})
        
        if(post.author.toString()!==req.user._id.toString())
            return res.status(403).json({message:"Bu yaznini silmeye icazeniz yoxdur"})
        await post.deleteOne()
        res.json({message:"Yazi silindi"})
    }catch(err){
        res.status(500).json({message:"Xeta bas verdi",error:err.message})
    }
})
router.get('/admin',authMiddleware,async(req,res)=>{
    try{
        if(req.user.role!=="admin")
            return res.status(403).json({message:"Admin deyilsiniz"})

        const posts=await Post.find().populate("author","email").exec()
        res.json(posts)
    }catch(err){
        res.status(500).json({message:"Xeta bas verdi",error:err.message})
    }
})
module.exports=router