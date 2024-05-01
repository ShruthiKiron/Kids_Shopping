const orderSchema = require("../models/orderModel");
const userSchema = require("../models/userModel");
const walletSchema = require("../models/walletModel")
const addressSchema = require("../models/addressModel")
const { adminOrderAggregation } = require("../helpers/aggregation")
const { checkOrderTransition } = require("../helpers/util")
const { ObjectId } = require("mongodb")

module.exports = {
  getOrder: async (req, res) => {
    try {

      const orderData = await adminOrderAggregation()
      console.log("orderData ", orderData)
      res.render("admin/orders", { order: orderData });
    } catch (error) {
      console.log("Error in admin get order " + error);
    }
  },

  postUpdateStage: async (req, res) => {
    try {
      const order = await orderSchema.findById(req.params.id);
      console.log("Update order: ", order);

      if (order.orderStage !== "CANCELLATION REQUESTED") {
        if (order.orderStage !== "CANCELLED") {
          if (order.orderStage !== "PAYMENT PENDING") {
            if (order.orderStage !== "RETURNED REQUESTED") {
              if (order.orderStage !== "RETURNED") {
                if (order.orderStage !== req.body.stage) {
                  if (req.body.stage == "RETURNED") {
                    await orderSchema.updateOne({ _id: req.params.id }, { $set: { orderStage: req.body.stage, orderStatus: 'RETURNED' } });

                    if (order.paymentMethod == 'ONLINE') {
                      const orderPrice = order.grandTotal;
                      const userId = req.session.userId;
                      await walletSchema.findOneAndUpdate(
                        { userId: userId },
                        { $inc: { wallet: orderPrice }, $push: { walletHistory: { date: Date.now(), amount: orderPrice, message: "Order return amount is added" } } },
                        { new: true }
                      );
                    }

                    res.json({ success: true, msg: "Order updated successfully", stage: 'RETURNED' });

                  }
                  else {
                    const valid = await checkOrderTransition(order.orderStage, req.body.stage);
                    console.log(valid);
                    if (valid) {
                      await orderSchema.updateOne({ _id: req.params.id }, { $set: { orderStage: req.body.stage, orderStatus: 'ACTIVE' } });
                      res.json({ success: true, msg: "Order updated successfully" });
                    } else {
                      res.json({ success: false, msg: "Invalid order stage" });
                    }
                  }
                } else {
                  res.json({ success: false, msg: "ORDER IS ALREADY IN SAME STAGE" });
                }
              } else {
                res.json({ success: false, msg: "ORDER IS ALREADY RETURNED" });
              }

            } else {
              res.json({ success: false, msg: "ORDER IS ALREADY REQUESTED FOR RETURN" });
            }
          }
          else {
            res.json({ success: false, msg: "ORDER IS WAITING FOR PAYMENT" });
          }
        }
        else {
          res.json({ success: false, msg: "ORDER IS ALREADY CANCELLED" });
        }
      } else {
        res.json({ success: false, msg: "ORDER IS ALREADY REQUESTED FOR CANCEL" });
      }

    } catch (error) {
      console.log("Error in post update stage: ", error);
      res.json({ success: false, msg: "Internal server error" });
    }
  },
  cancelOrder: async (req, res) => {
    try {
      console.log(req.params);
      const orderData = await orderSchema.findOne({ _id: new ObjectId(req.params.id) })

      if (orderData.orderStage !== 'CANCELLED') {
        if (orderData.orderStage !== 'RETURN REQUESTED') {
          if (orderData.orderStage !== 'RETURNED') {

            await orderSchema.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { orderStage: 'CANCELLED', orderStatus: 'CANCELLED' } })
            if (orderData.paymentMethod == 'ONLINE') {
              const orderPrice = orderData.grandTotal;
              const userId = req.session.userId;
              await walletSchema.findOneAndUpdate(
                { userId: userId },
                { $inc: { wallet: orderPrice }, $push: { walletHistory: { date: Date.now(), amount: orderPrice, message: "Order cancel amount is added" } } },
                { new: true }
              );
            }
            res.json({ success: true, message: 'ORDER CANCELLED SUCCESSFULLY' })

          }
          else {
            res.json({ invalid_stage: true, message: "ORDER IS ALREADY RETURNED" })
          }
        } else {
          res.json({ invalid_stage: true, message: "ORDER IS REQUESTED FOR RETURN" })
        }
      } else {
        res.json({ invalid_stage: true, message: "ORDER IS ALREADY CANCELLED" })
      }

    } catch (error) {

    }
  },

  getOrderDetails: async (req, res) => {
    try {
      const orderId = req.params.id;
      const orderData = await orderSchema.findOne({ _id: new ObjectId(orderId) });
      if (!orderData) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      const userInfoId = orderData.userId;
      const userInfo = await userSchema.findById(userInfoId);
      if (!userInfo) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const addressData = await addressSchema.findById(orderData.addressId);
      const address = `${addressData.address}, ${addressData.city}, ${addressData.state}, ${addressData.country}, ${addressData.zip}`;
      const orderedAt = orderData.orderedAt;
      const orderStage = orderData.orderStage;
      const orderStatus = orderData.orderStatus;
      const grandTotal = orderData.grandTotal;

      res.render("admin/orderDetail", {
        orderDetails: {
          userInfo: userInfo,
          address: address,
          orderedAt: orderedAt,
          orderStage: orderStage,
          orderStatus: orderStatus,
          grandTotal: grandTotal
        }
      });
    } catch (error) {
      console.error("Error in getOrderDetails: ", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }


};
