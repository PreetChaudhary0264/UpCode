// controllers/courseController.js
const Course = require("../models/Course");

exports.getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user.id; // assuming user is authenticated & middleware sets req.user

    if (!instructorId) {
      return res.status(400).json({
        success: false,
        message: "Instructor ID not found in request",
      });
    }

    const courses = await Course.find({ instructor: instructorId })
      .populate("courseContent") // agar sections bhi chahiye to populate kar lo
      .populate("category")
      .exec();

    return res.status(200).json({
      success: true,
      message: "Instructor courses fetched successfully",
      data: courses,
    });
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch instructor courses",
      error: error.message,
    });
  }
};
