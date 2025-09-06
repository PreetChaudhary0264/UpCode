const Course = require("../models/Course");
const Section = require("../models/Section");
// const Sectione = require("../models/Section");

exports.createSection = async(req,res)=>{
    try {
        //data fetch
        //course create kr liya to course ki id pdi hogi and use request me bhejna bdi baat nhi hai
        const {sectionName,courseId} = req.body;
        //data validation
        if(!sectionName || !courseId){
            console.log("All fields required");
            
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }

        //create section
        const newSection = await Section.create({sectionName});

        //update course with section object id
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
                                       {
                                        $push:{
                                            courseContent:newSection._id,
                                        }
                                       },
                                       {new:true},
        ).populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          model: "SubSection",
        },
      })
      .exec();
        //TODO: HOW TO USE POPULATE HERE?

        //return response
        return res.status(200).json({
            success:true,
            message:"Section creates successfully",
            updatedCourseDetails,
        })
    } catch (error) {
        console.log(error);
         return res.status(500).json({
            success:false,
            message:"Section creation Failed",
            error:error.message,
        })
    }
}

exports.updateSection = async(req,res)=>{
    try {
        //data input
          const{sectionName,sectionId} = req.body;

        //data validation
          if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        //update data = section id se find krke sectionname change krdo
        const updatedSection = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});

        //section update krne prr course me jake update nhi krna pdega bcoz
        //course me section ka data nhi section ki id pdi hai and id to same hi rhegi

        return res.status(200).json({
            success:true,
            message:"Section updated successfully",
        })
    } catch (error) {
         return res.status(500).json({
            success:true,
            message:"Failed to update section",
            error:error.message,
        })
    }
}

//delete section
exports.deleteSection = async(req,res)=>{
    try {
        //get id => assuming we are sending id in parameters
        //tum id kaise bhi nikal kte ho chahe re ki body me bhej do
        const {sectionId} = req.body;

        const deletedSection = await Section.findByIdAndDelete(sectionId);
        //TODO: WE NEED TO DELETE THE ENTRY FROM THE COURSE SCHEMA

        return res.status(200).json({
            success:true,
            message:"Section deleted successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success:true,
            message:"Failed to delete section",
        })
    }
}