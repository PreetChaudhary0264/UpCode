const mongoose = require("mongoose")
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 5 * 60,   // document auto-deletes after 5 minutes
  },
});



//a function to send email
async function sendVerificationEmail(email,otp) {
    try {
          const mailResponse = await mailSender(email,"Verification email from UpCode",otp)
          console.log("email sent successfully",mailResponse);
          
    } catch (error) {
        console.log("error while sending mail:",error);
        throw error;        
    }
}
//pre middleware(agar post use krte to paramtere me doc pas kr skte thee bcoz us time doc save ho chuka hoga)
// is "save" ka matlab hai ki doc save hone se pehle ye code chlnachaiye
//pre me doc pass nhi kr skte to ya to empty rkho ya fir next pass krdo
OTPSchema.pre("save",async function(next){
     await sendVerificationEmail(this.email,this.otp);
     next(); //next middleware pe chle jao
})



module.exports = mongoose.model("OTP",OTPSchema);