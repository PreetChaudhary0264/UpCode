const User = require("../models/User")
const Profile = require("../models/Profile")

//hmne signup krte time db me sab kuch null set kr diya tha to ab hme yha profile create krne ki zarurat nhi hai sidha update kro
//agar null nhi krte to oehle profile create krte then push krle user and db me

exports.updateProfile = async(req,res) => {
    try {
        //get data and user id
        const{dateOfBirth="",about="",gender,contactNumber} = req.body;
        const userId = req.user.id;

        console.log("Printing userId",req.user.id);
        
        //validation
        if(!gender || !contactNumber || !userId){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        //find profile
        const userDetails = await User.findById(userId);
        const profileId = userDetails.additionalDetails;

        const profileDetails = await Profile.findById(profileId);
        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        //DB me save krne ke liye save method
        //agar db me pehle se object nhi bna hua to create method ka use hoga 
        //age obj bna hua hai to save use hoga;
        await profileDetails.save();
        //return response

        return res.status(200).json({
            success:true,
            message:"profile updated successfully",
            profileDetails,
        })
    } catch (error) {
         return res.status(500).json({
            success:true,
            message:"Profile updation failed",
            error:error.message,
        })
    }
}

//delete accounts
exports.deleteAccount = async(req,res)=>{
    try {
        //get id
        const id = req.user.id;
        
        const userDetails = await User.findById(id);
        //validate
        if(!userDetails){
           return res.status(400).json({
            success:false,
            message:"User not found",
        })  
        }

        //delete additional details
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        //delete user
        await User.findOneAndDelete({_id:id});
        //return response

        //TODO: UNENROLL USER FROM ALL ENROLLED COURSES
        //explore how can we schedule a request
        //find what is chronejob
         return res.status(200).json({
            success:true,
            message:"Account deletion successfull",
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Deletion of acc failed",
        })
    }
}

exports.getUserDetails = async(req,res)=>{
    try {
         //get id
        const id = req.user.id;
        
        //user ke ander dateofbirth wagera nhi pda hai isliye populate kra hai
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        //validate
        if(!userDetails){
           return res.status(400).json({
            success:false,
            message:"User not found",
        })  
        }
        

        return res.status(200).json({
            success:true,
            message:"User data fetched successfully",
            userDetails,
        })
    } catch (error) {
         return res.status(500).json({
            success:false,
            message:"user data fetching failed",
        })
    }
}

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const userDetails = await User.findById(userId)
      .populate("courses")
      .exec();

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User enrolled courses fetched successfully",
      data: userDetails.courses || [],
    });

  } catch (error) {
    console.error("Get enrolled courses error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
