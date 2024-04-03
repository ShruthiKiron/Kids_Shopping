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
      console.log("update order "+order);
      if (order.orderStage !== "CANCELLATION REQUESTED") {
        if (order.orderStage !== "CANCELLED") {
          if(order.orderStage !== "PAYMENT PENDING"){
            const valid = await checkOrderTransition(order.orderStage,req.body.stage)
      console.log(valid)
      if(valid){
        await orderSchema.updateOne({_id : req.params.id},{$set : {orderStage : req.body.stage, orderStatus : 'CANCELLED'}})
      }
          }
          else{
            console.log("PAyment is pending");
          }
          
        }else{
          console.log("cancelled");
        }
      }else{
        console.log("cancel");
      }
      console.log("stage ",req.body.stage);
      // const valid = await checkOrderTransition(order.orderStage,req.body.stage)
      // console.log(valid)
      // if(!valid){
      //   await orderSchema.updateOne({_id : req.params.id},{$set : {orderStage : req.body.stage, orderStatus : 'CANCELLED'}})
      // }
      
    } catch (error) {
      console.log("Error in post update stage "+error);
    }

  },

};
