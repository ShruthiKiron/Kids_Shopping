const orderSchema = require("../models/orderModel");
const userSchema = require("../models/userModel");
const {adminOrderAggregation }  =  require("../helpers/aggregation")
const {checkOrderTransition}  =  require("../helpers/util")

module.exports = {
  getOrder: async (req, res) => {
    try {
     const orderData = await adminOrderAggregation()
   console.log(orderData)
      res.render("admin/orders", { order: orderData }); 
    } catch (error) {
      console.log("Error in admin get order " + error);
    }
  },
  postUpdateStage : async (req,res) => {
    try {
      const order = await orderSchema.findById(req.params.id)
      // if (order.orderStage !== "CANCELLATION REQUESTED") {
      //   if (order.orderStage !== "CANCELLED") {
          
      //   }else{
      //     await orderSchema.updateOne({_id : req.params.id},{$set : {orderStage : $stage}})
      //   }
      // }else{

      // }
      const valid = await checkOrderTransition(order.orderStage,req.body.stage)
      console.log(valid)
      
    } catch (error) {
      console.log("Error in post update stage "+error);
    }

  },

};
