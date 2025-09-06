const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {cloudinaryConnect} = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 4000;

database.connect();
app.use(express.json());
app.use(cookieParser());
// app.use(fileUpload());
app.use(
    cors({
        origin:"https://upcodefrontend.netlify.app",
        credentials:true,
    })
)

app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp/",
    })
);

cloudinaryConnect();
app.use("/api/v1",userRoutes);
app.use("/api/v1",profileRoutes);
app.use("/api/v1",courseRoutes);
app.use("/api/v1",paymentRoutes);


app.get("/",(req,res)=>{
    console.log("Hello from backend");
    if (req.query.ping) {
    return res.json({ message: "Backend awake" });
    }
    res.redirect("https://upcodefrontend.netlify.app");
    
})

app.listen(PORT,()=>{
    console.log("App is running");  
})