const User=  require("../models/User")
const OTP = require("../models/OTP")
const Profile = require("../models/Profile")
const otpGenerator = require("otp-generator")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//send otp
exports.sendOTP = async (req,res)=>{
    try{
    //fetch email from req body
    const {email} = req.body
     const checkUserPresent = await User.findOne({email})

     if(checkUserPresent){
        return res.status(401).json({
            success:false,
            message:"User Already Registered",
        })
     }

     //generate otp
      var otp = otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
      })
      console.log("otp generated:",otp);

     //check unique otp or not
     let result = await OTP.findOne({otp: otp});

     //brute force lekin company me libraries ka use krna pdega jo ki hr baar unique otp hi generate kree
     while(result){
        otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        })
         result = await OTP.findOne({otp: otp});
     }
    
     //otp object
     const otpPayload = {email,otp}

     // create an entry for otp in DB
     const otpBody = await OTP.create(otpPayload);
     console.log(otpBody);

     //return response
     res.status(200).json({
         success:true,
         message:"OTP sent successfully",
         data:otp,
     })
 
    }catch(error){
          console.log(error);
          return res.status(500).json({
            success:false,
            message:error.message,
          })
    }

};


//SignUp 

exports.signup = async(req,res)=>{
    try {
        //data fetch
        const{firstName,lastName,email,password,confirmPassword,accountType,contactNumber} = req.body;
        

        //validate krlo

        if(!firstName || !lastName || !email || !password || !confirmPassword){
            return res.status(403).json({
                success:false,
                message:"All fields are required",
            })
        }


        //confirm password ko match krlo

        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password & confirm passwprd doesn not match.Please  try again",
            })
        }


        //check user exist already or not

        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User is already registered",
            })
        }

        //find most recent otp stored for the user

        // const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });

        // console.log(recentOtp);
  
        //  //validate otp

        // if (!recentOtp) {
        //    return res.status(400).json({
        //    success: false,
        //    message: "OTP not found",
        //    });
        // } else if (otp !== recentOtp.otp) {
        //   return res.status(400).json({
        //   success: false,
        //   message: "Invalid OTP",
        //    });
        // }

        
       
        //hash password
 
        const hashedPassword = await bcrypt.hash(password,10);


        //entry create in db

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        })


        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })
        // return response

        return res.status(200).json({
            success:true,
            message:"User is registered successfully",
            user,
        })
    } catch (error) {
        console.log("Signup error", error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered .Please try again",
            error: error.message, 
        })
    }
}

//login

// LOGIN CONTROLLER
exports.login = async (req, res) => {
  try {
    const { email, password, accountType } = req.body;

    // Check if email and password exist
    if (!email || !password || !accountType) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (email, password, role)",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not registered. Please sign up.",
      });
    }

    //  Check role
    console.log("User.accountType in DB:", user.accountType);
    console.log("Role coming from frontend:", accountType);

    if (user.accountType !== accountType) {
      return res.status(403).json({
        success: false,
        message: `This account is not registered as ${accountType}`,
      });
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Generate token
    const payload = {
      email: user.email,
      id: user._id,
      accountType: user.accountType,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // Remove password before sending user
    user.password = undefined;

    return res.status(200).json({
      success: true,
      token,
      user,
      message: "Login successful",
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
      error: err.message,
    });
  }
};


//changePassword

exports.changePassword = async(req,res)=>{
    //get data from req body
    //get oldpass,new pass,confirmpass
    //validation
    //update in DB
    //send mail- password updated
    //return response
}
