const express = require("express");
const router = express.Router();

const {createCourse,getAllCourses,getCourseDetails} = require("../controller/Course")

const {showAllCategory,createCategory,categoryPageDetails} = require("../controller/Category")
const {createSection,updateSection,deleteSection} = require("../controller/Section")
const {createSubSection,updateSubSection,deleteSubSection} = require("../controller/Subsection")
const {createRating,getAverageRating,getAllRating} = require("../controller/RatingAndReview")

const {auth,isInstructor,isStudent,isAdmin} = require("../middleware/auth")
const {publishCourse} = require("../controller/PublishCourse");
const { getInstructorCourses } = require("../controller/getInstructorCourses");
const {deleteCourse} = require("../controller/Course")

router.post("/createCourse",auth,isInstructor,createCourse)
router.get("/getAllCourses",getAllCourses)
router.post("/getCourseDetails",getCourseDetails)
router.delete("/deleteCourse/:courseId",deleteCourse)
//section
router.post("/createSection",auth,isInstructor,createSection)
router.post("/updateSection",auth,isInstructor,updateSection)
router.post("/deleteSection",auth,isInstructor,deleteSection)
//subsection
router.post("/createSubSection",auth,isInstructor,createSubSection)
// router.post("/updateSubSection",auth,isInstructor,updateSection)
// router.post("/deleteSubSection",auth,isInstructor,deleteSubSection)

//category
router.post("/createCategory",auth,isAdmin,createCategory)
router.get("/showAllCategory",showAllCategory)
router.post("/getCategoryPageDetails",categoryPageDetails)
//rating
router.post("/createRating",auth,isStudent,createRating)
router.get("/getAverageRating",getAverageRating)
router.get("/getReviews",getAllRating)

//publish
router.post("/publishCourse",publishCourse);
//getInstructorCourses
router.get("/instructor-courses", auth, isInstructor, getInstructorCourses);

module.exports = router
