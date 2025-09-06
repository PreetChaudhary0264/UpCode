const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
 
//create rating
exports.createRating = async(req,res)=>{
    try {
        //getuserid
        const userId = req.body.id;
        //fetch data from req body
        const{courseId,rating,review} = req.body;

        //check if user is enrolled or not(tbhi rating de payga)
        const courseDetails = await Course.findOne({_id:courseId,
                                                   studentsEnrolled:{$elemMatch:{$eq:userId}},
                                                   });
        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"Student is not enrolled in this course",
            })
        }                                           
        //check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
                                                    user:userId,
                                                    course:courseId,})

        if(alreadyReviewed){
            return res.status(404).json({
                success:false,
                message:"Course is already reviewed by the user",
            })
        }                                             
        //create rating and RatingAndReview
        const ratingReview = await RatingAndReview.create({
                                                          rating,
                                                          review,
                                                          course:courseId,
                                                          user:userId, 
                                                          })
        //update course ke schema ke ander
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
                                              {
                                                $push:{
                                                    ratingAndReviews:ratingReview._id,
                                                }
                                              },
                                            {new:true});

        console.log(updatedCourseDetails);
                                            

        //return response
        return res.status(200).json({
                success:true,
                message:"Rating and reviewed successfully",
                ratingReview,
        })
    } catch (error) {
        return res.status(500).json({
                success:false,
                message:"error.message",
        })
    }
}

//getAverageRating
exports.getAverageRating = async(req,res)=>{
    try {
        //get course id
        const {courseId} = req.body.courseId;

        //calculate average rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),
                },
            },
            {
               $group:{
                _id:null,
                averageRating:{ $avg: "$rating"},
               }
            }
        ])
        //return rating
        if(result.length > 0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,  //aggregate wala function array return krra hai to value 0th inde prr store hui pdi hai
            })
        }

        //if no rating exist
        return res.status(200).json({
            success:true,
            message:"Average rating is 0 till now",
            averageRating:0,
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"error.message",
        })
    }
}

//getallrating
exports.getAllRating = async(req,res)=>{
    try {
        //koi criteris nhi hai saari utha ke lao
        const allReviews = await RatingAndReview.find({})
                                                    .sort({rating:"des"})
                                                    .populate({
                                                        path:"user",
                                                        select:"firstName lastName email image"
                                                    })
                                                    .populate({
                                                        path:"course",
                                                        select:"courseName",
                                                    })
                                                    .exec();

         return res.status(200).json({
            success:true,
            message:"All reviews fetched successfully",
            data:allReviews,
        })                                           
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"error.message",
        })
    }
}