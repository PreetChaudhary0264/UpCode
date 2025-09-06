const Category = require("../models/Category");
const Course = require("../models/Course");

exports.createCategory = async(req,res) => {
    try {
        //fetch data
        const{name,description} = req.body;

        //validation
        if(!name || !description){
           return res.status(400).json({
            success:false,
            message:"enter all details",
           })
        }

        //create entry in db
        const categoryDetails = await Category.create({
            name:name,
            description:description,
        })

        console.log(categoryDetails);
        

        return res.status(200).json({
            success:true,
            message:"Category created successfully",
        })


    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//get all details

exports.showAllCategory = async(req,res)=>{
    try {
        //hme find nhi krna but ,make sure ki jo tag aaye usme name and description hona chaiye
        const allCategory = await Category.find({},{name:true,description:true});
                                        //iska matlab hai ki hme kisi basis pe nhi chaiye but jo data la rhe ho usme name and des zarur hona chaiye
        return res.status(200).json({
            success:true,
            message:"All Category returned successfully",
            allCategory,
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};


// categoryPageDetails Controller
exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;
    console.log("REQ.BODY =>", req.body);


    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    // get courses for specified category id
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "course",
        match: { status: "Published" }, // only published
        populate: {
          path: "instructor",
          select: "firstName lastName email",
        },
      })
      .exec();

    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // get courses for different categories
    const differentCategories = await Category.find({
      _id: { $ne: categoryId },
    })
      .populate({
        path: "course",
        match: { status: "Published" },
      })
      .exec();

    // get top-selling courses (sorted by number of enrolled students)
    const topSellingCourses = await Course.find({ status: "Published" })
      .sort({ studentsEnrolled: -1 }) // won’t work directly on array
      .populate("instructor", "firstName lastName email")
      .exec();

    // Fix sorting manually (since studentsEnrolled is an array)
    const sortedTopCourses = topSellingCourses
      .sort((a, b) => b.studentsEnrolled.length - a.studentsEnrolled.length)
      .slice(0, 4); // top 10 courses

    return res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategories,
        topSellingCourses: sortedTopCourses,
      },
    });
  } catch (error) {
    console.error("Error in categoryPageDetails:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

