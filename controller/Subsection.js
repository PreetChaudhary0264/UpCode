const SubSection = require("../models/SubSection")
const Section = require("../models/Section")
const {uploadImageToCloudinary} = require("../utils/imageUploader");

exports.createSubSection = async(req,res)=>{
    try {
        //fetch data
        const{title,timeDuration,description,sectionId} = req.body;

        //extract video from files
        const  video = req.files.videoFile;
        //validation
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
          
        //upload video to cloudinary for making url and response me secure url mil jayga
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);

        //create a subSection
        const newSubsection  = await SubSection.create({
            title:title,
            description:description,
            videoUrl:uploadDetails.secure_url,
            timeDuration:timeDuration,
        })
        //insert subsection id into section

        const updatedSection = await Section.findByIdAndUpdate(sectionId,
                                                              {
                                                                $push:{
                                                                    subSection:newSubsection._id,
                                                                }
                                                              },
                                                              {new:true}
        ).populate({
            path:"subSection",
            model:"SubSection"
        }).exec();
       // TODO => log updated section here after adding populate
       
       return res.status(200).json({
        success:true,
        message:"Subsection created successfully",
        updatedSection,
       })
    } catch (error) {
        return res.status(500).json({
        success:false,
        message:"Failed to create subsection",
        error:error.message,
       })
    }
}

//hw update subsection and delete subsection