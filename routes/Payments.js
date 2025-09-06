const express = require("express");
const router = express.Router();

const {capturePayment,verifySignature,getPurchaseHistory} = require("../controller/Payment")
const {auth,isStudent} = require("../middleware/auth")
router.post("/capturePayment",auth,isStudent,capturePayment)
router.post("/verifySignature",auth,isStudent,verifySignature)
router.get("/getPurchaseHistory",auth,getPurchaseHistory)

module.exports = router