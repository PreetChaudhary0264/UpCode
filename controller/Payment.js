//proxy server kya hota hai?
//razorpay me webhook
const{instance} = require("../config/RazorPay")
const Course = require("../models/Course")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const mongoose = require("mongoose");
const crypto = require("crypto");
const Purchase = require("../models/Purchase")

//capture the payment and initiate the payment

exports.capturePayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.json({ success: false, message: "Please provide valid course id" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.json({ success: false, message: "Could not find the course" });
    }

    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)) {
      return res.json({ success: false, message: "Student is already enrolled" });
    }

    if (!course.price) {
      return res.json({ success: false, message: "Course price is missing" });
    }

    const options = {
      amount: course.price * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        courseId,
        userId,
      },
    };

    const paymentResponse = await instance.orders.create(options);
    console.log("👉 Razorpay order created:", paymentResponse);

    return res.json({
      success: true,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    console.error("❌ capturePayment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Could not initiate the payment",
    });
  }
};


// verify payment signature (from frontend handler)

exports.verifySignature = async (req, res) => {
  try {
    console.log("👉 Incoming verifySignature body:", req.body);
    console.log("👉 User in req.user:", req.user);

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, courseId } = req.body;
    const userId = req.user?.id;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !courseId) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not found in token" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    console.log("👉 Body to hash:", body);

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    console.log("👉 Expected Signature:", expectedSignature);
    console.log("👉 Received Signature:", razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // ✅ keep your existing course enrollment logic
    const enrolledCourse = await Course.findByIdAndUpdate(
      courseId,
      { $push: { studentsEnrolled: userId } },
      { new: true }
    );

    if (!enrolledCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    await User.findByIdAndUpdate(userId, { $push: { courses: courseId } });

    // ✅ new: save purchase history
    await Purchase.create({
      userId,
      courseId,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: enrolledCourse.price * 100,
      status: "success",
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified & course enrolled successfully",
    });
  } catch (error) {
    console.error("❌ verifySignature error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



exports.getPurchaseHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const purchases = await Purchase.find({ userId })
      .populate("courseId", "courseName courseDescription thumbnail")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      purchases,
    });
    
  } catch (error) {
    console.error("❌ getPurchaseHistory error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not fetch purchase history",
    });
  }
};



