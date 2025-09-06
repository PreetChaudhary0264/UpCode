const express = require("express");
const router = express.Router();

const {auth} = require("../middleware/auth");
const {deleteAccount,updateProfile,getUserDetails} = require("../controller/Profile")
const {getEnrolledCourses} = require("../controller/Profile")
const {resetPasswordToken,resetPassword} = require("../controller/ResetPassword")

router.delete("/deleteProfile",auth,deleteAccount);
router.put("/updateProfile",auth,updateProfile);
router.get("/getUserDetails",auth,getUserDetails);
router.get("/getEnrolledCourses",auth,getEnrolledCourses);

router.post("/resetPasswordToken",resetPasswordToken);
router.post("/resetPassword",resetPassword);

module.exports = router