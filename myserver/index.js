const express = require('express');
const mongoose=require('mongoose');
const cookieParser=require('cookie-parser')
require('dotenv').config();
const authRoutes = require('./routes/auth');
const postRoutes=require('./routes/posts')
const app = express();
const PORT = 3000;
app.use(express.json());
app.use(cookieParser())
mongoose.connect(process.env.MONGO_URI).then(()=>console.log("MongoDB qosuldu"))
.catch(err=>console.log("Baqlanti xetasi",err))

app.use('/api',authRoutes)
app.use('/posts',postRoutes)
app.listen(PORT, () => {
  console.log(`Server işə düşdü: http://localhost:${PORT}`);
});
