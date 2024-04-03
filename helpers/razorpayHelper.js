const CryptoJS = require("crypto-js");

module.exports = {
    createRazorpayOrder : async(razorpayInstance, options, callback)=>{
        razorpayInstance.orders.create(options, function (err, order) {
            if (err) {
              // Handle error
              console.error(err);
              callback(err, null);
            } else {
              // Order created successfully
              callback(null, order);
            }
          });
    },
    verifyPayment : async(req,res) => {
        try {
            const { razorpay_order_id,razorpay_payment_id,razorpay_signature} = req.body
            const sign = razorpay_order_id +"|"+razorpay_payment_id
            const expectedSign = CryptoJS
            .createHmac("sha256",process.env.RAZORPAY_SECRET_KEY)
            .update(sign.toString())
            .digest("hex")
            if(razorpay_signature === expectedSign){
                return res.json({message : "Payment verified successfully"})
            }
            else{
                return res.json({message : "Invalid signature"})
            }

        } catch (error) {
            console.log("Error in verify Payment "+error);
        }
        
    },
}
