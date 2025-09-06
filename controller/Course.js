const Course = require("../models/Course");
const Category = require("../models/Category")
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader")

//create course handler
exports.createCourse = async(req,res)=>{
     try {
        //fetch data
        const {courseName,courseDescription,whatYouWillLearn,price,category,tag} = req.body;

        //get thumbnail(fetch files)
        const thumbnail = req.files.thumbnail;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !tag){
            return res.status(400).json({
                success:false,
                message:"All fields required",
            })
        }

        //check for instructor=> course bnate time instructor ki id bhi to store krni pdti hai(check in Course model)
        const userId = req.user.id;
        console.log(userId);
        
        //instructor ki hmare pass userId hai but object id nhi hai isliye DB call mari
        const instructorDetails = await User.findById(userId);
        // console.log(instructorDetails);
        //TODO:verify that user id and instructor id are same or different?

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor details not found",
            })
        }

        //check given tag is valid or not
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails){
             return res.status(404).json({
                success:false,
                message:"Category details not found",
            })
        }
        
        //upload image to cloudinary=> do chiz pass krte hai ek to jo file hai wo and dusri folder
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

        //create entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            category: categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
            tag,
        })
        // console.log(newCourse);
        
        
        //addnew course to user schema of instructor
        await User.findByIdAndUpdate({_id:instructorDetails._id},
                                     {
                                        $push:{
                                            courses:newCourse._id,
                                        }
                                     },
                                     {new:true},
        )

        //update the Tag Ka Schema
        await Category.findByIdAndUpdate({_id:categoryDetails._id},
                                    {
                                        $push:{
                                            course:newCourse._id,
                                        }
                                    },
                                    {new:true},
        )

        //return response
        return res.status(200).json({
            success:true,
            message:"Course Created Successfully",
            course:newCourse,
        })

     } catch (error) {
        console.log("error in create course backend",error);
        return res.status(500).json({
            success:false,
            message:"Failed to create course",
            error:error.message,
        })
     }
}


//get all courses
exports.getAllCourses = async(req,res)=>{
    try {
        const allCourses = await Course.find({},
                                             {
                                               courseName:true,
                                               price:true,
                                               thumbnail:true,
                                               instructor:true,
                                               ratingAndReviews:true,
                                               studentsEnrolled:true,
                                             }
                                             //jo bhi ans aaya use populate kr diya and execute kr diya
        ).populate("instructor").exec();

        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched successfully",
            data:allCourses,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:true,
            message:"cannot fetch course data",
            error:error.message,
        })
    }
}

exports.getCourseDetails = async(req,res)=>{
    try {
        const {courseId} = req.body;

        //find course details
        //object IDs ko corresponding data ke sath replace krwa diya hai
        const courseDetails = await Course.findById({_id:courseId})
                                               .populate(
                                                {
                                                    path:"instructor",
                                                    populate:{
                                                        path:"additionalDetails",
                                                    },
                                                }
                                               )
                                               .populate("category")
                                            //    .populate("ratingAndReviews")
                                               .populate({
                                                path:"courseContent",
                                                populate:{
                                                    path:"subSection",
                                                },
                                               })
                                               .exec();


        //validation
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`could not find the course with ${courseId}`,
            })
        } 
        
        //return response;
        return res.status(200).json({
            success:true,
            message:"Course details fetched successfully",
            courseDetails,
        })
    } catch (error) {
        return res.status(500).json({
                success:false,
                message:error.message,
        })
    }
}

// DELETE Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      })
    }

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // delete course
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Error deleting course",
      error: error.message,
    })
  }
}

