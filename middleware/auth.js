
const User = require("../models/User");
require("dotenv").config();
const jwt = require("jsonwebtoken")

exports.auth = async (req, res, next) => {
  try {
    console.log("👉 Headers:", req.headers);

    const authHeader = req.headers["authorization"];
    console.log("👉 Authorization Header:", authHeader);

    const token =
      (req.body && req.body.token) ||
      (req.query && req.query.token) ||
      (authHeader && authHeader.split(" ")[1]);

    console.log("👉 Extracted Token:", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    // Verify
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log("👉 Decoded Token:", decode);

    req.user = decode;
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "something went wrong while validating the token",
      error: error.message,
    });
  }
};



//isStudent
exports.isStudent = async(req,res,next)=>{
    try {
        //fetch role
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:"This is protected route for students only",
            }) 
        }
        next();
    } catch (error) {
        console.error(error);
         return res.status(500).json({
                success:false,
                message:"User role cannot be verified.Please try again",
            })
    }
}

//isInstructor
exports.isInstructor = async(req,res,next)=>{
    try {
        //fetch role
        if(req.user.accountType !== "Instructor"){
          console.log("isInstructor route does not match");
            return res.status(401).json({
                success:false,
                message:"This is protected route for Instructor only",
            }) 
        }
        next();
    } catch (error) {
        console.error(error);
         return res.status(500).json({
                success:false,
                message:"User role cannot be verified.Please try again",
            })
    }
}

//isAdmin
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Admin only",
      });
    }
    next(); 
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified. Please try again",
    });
  }
};
