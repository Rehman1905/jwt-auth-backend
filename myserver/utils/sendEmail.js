const nodemailer=require('nodemailer')
const sendEmail=async (to,subject,text)=>{
    try{
        const transporter=nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASS
            }
        })
        await transporter.sendMail({
            from:`"Sənin Tətbiqin" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text
        })
        console.log("Email gonderildi",to)
    }catch(err){
        console.error("Email xetasi",err)
    }
}
module.exports=sendEmail