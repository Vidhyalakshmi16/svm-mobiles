import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const refundPayment = async (paymentId, amount) => {
  return await razorpay.payments.refund(paymentId, {
    amount: Math.round(amount * 100), // rupees → paise
  });
};

export default razorpay;
