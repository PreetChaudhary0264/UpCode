const Course = require("../models/Course");

exports.publishCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { status: "Published" },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Course published successfully",
      data: updatedCourse
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
