const userSchema = require("../models/userModel");
const productSchema = require("../models/productModel");
const authController = require("../controller/authController");
const addressSchema = require("../models/addressModel");
const cartSchema = require("../models/cartModel");
const orderSchema = require("../models/orderModel");
const couponSchema = require('../models/couponModel')
const bcrypt = require("bcrypt");
const Razorpay = require("razorpay");
const CryptoJS = require("crypto-js");
const crypto = require('crypto')

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});  

const {createRazorpayOrder,verifyPayment } = require('../helpers/razorpayHelper')

const {generateOrderID } = require('../helpers/orderHelper')

const { ObjectId } = require("mongodb");
const {
  cartAggregation,
  orderAggregation,
  orderDetailAggregation,
} = require("../helpers/aggregation");
const {
  checkStock,
  consolidateDocuments,
  makeOrder,
  updateStock,
} = require("../helpers/util");

module.exports = {
  getUserProfile: async (req, res) => {
    try {
      console.log("At userProfile");
      const useId = req.session.userId;
      console.log("useId in get user Profile " + useId);

      const userData = await userSchema.findOne({ _id: useId });
      const address = await addressSchema.find({
        userId: useId,
        isDeleted: false,
      });
      console.log("address" + address);
      console.log("User name " + userData);

      res.render("user/userProfile", { useId, user: userData, address });

      // const userData = await userSchema.findOne({_id : req.session.user})
      // res.render('user/userProfile',{user : userData})
    } catch (error) {
      console.log("Error in get user profile " + error);
    }
  },

  getEditProfile: async (req, res) => {
    try {
      const useId = req.session.userId;
      console.log("at edit " + useId);
      const userData = await userSchema.findOne({ _id: useId });
      console.log(userData);

      res.render("user/editProfile", { useId, user: userData });
    } catch (error) {
      console.log("Error in get edit profile " + error);
    }
  },

  patchEditProfile: async (req, res) => {
    try {
      const useId = req.session.userId;
      const userData = await userSchema.findOne({ _id: useId });
      console.log(userData.mobile);
      console.log(req.body);
      // console.log(req.body.firstName, req.body.lastName, req.body.mobile);

      await userSchema.updateOne(
        { _id: useId },
        {
          $set: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            mobile: req.body.mobile,
          },
        }
      );
      console.log(
        " updated " + req.body.firstName,
        req.body.lastName,
        req.body.mobile
      );

      res.redirect("/userProfile/" + useId);
    } catch (error) {
      console.log("Error in post edit profile " + error);
    }
  },

  getAddAddress: async (req, res) => {
    try {
      const useId = req.session.userId;
      res.render("user/addAddress", { useId });
    } catch (error) {
      console.log("Error in get add address " + error);
    }
  },

  postAddAddress: async (req, res) => {
    try {
      const useId = req.session.userId;
      const { houseName, country, state, city, zip } = req.body;
      const data = {
        userId: new ObjectId(useId),
        address: houseName,
        country: country,
        state: state,
        city: city,
        zip: zip,
      };
      const cart = req.session.cart;
      const userAddress = await addressSchema.insertMany(data);
      if (cart) {
        res.redirect("/checkout");
      }
      if (userAddress) {
        res.redirect("/userProfile/" + useId);
      }
    } catch (error) {
      console.log("Error in post add address " + error);
    }
  },

  getEditAddress: async (req, res) => {
    try {
      const addressData = await addressSchema.findOne({ _id: req.params.id });
      const useId = req.session.userId;
      res.render("user/editAddress", { address: addressData, useId });
    } catch (error) {
      console.log("Error in get edit address " + error);
    }
  },

  postEditAddress: async (req, res) => {
    try {
      const { houseName, country, state, city, zip } = req.body;
      const useId = req.session.userId;
      const data = {
        address: houseName,
        country: country,
        state: state,
        city: city,
        zip: zip,
      };
      const cart = req.session.cart;
      const addressData = await addressSchema.updateOne(
        { _id: req.params.id },
        { $set: data }
      );
      if (cart) {
        res.redirect("/checkout");
      }
      if (addressData) {
        res.redirect("/userProfile/" + useId);
      }
    } catch (error) {
      console.log("Error in post edit address " + error);
    }
  },
  patchDeleteAddress: async (req, res) => {
    const useId = req.session.userId;
    const addressData = await addressSchema.updateOne(
      { _id: req.params.id },
      { $set: { isDeleted: true } }
    );
    res.redirect("/userProfile/" + useId);
  },
  getChangePassword: async (req, res) => {
    try {
      const useId = req.session.userId;
      console.log("Get Change password");
      res.render("user/changePassword", { useId, error: req.flash("error"),passwordChanged: req.session.passwordChanged });
    } catch (error) {
      console.log("Error in get change password " + error);
    }
  },

  postChangePassword: async (req, res) => {
    try {
      console.log("Change Password");
      const useId = req.session.userId;
      const userData = await userSchema.findOne({ _id: useId });
      console.log("userData " + userData);
      console.log(req.body.currentPassword);
      const originalPass = userData.password;
      const currentPass = req.body.currentPassword;
      const newPass = req.body.newPassword;
      const confirmPass = req.body.confirmPassword;

      const passwordMatch = await bcrypt.compare(
        req.body.currentPassword,
        originalPass
      );
      if (passwordMatch) {
        console.log("Password is match");
        if (newPass == confirmPass) {
          const passwordMatch = await bcrypt.hash(newPass, 12);
          await userSchema.updateOne(
            { _id: useId },
            {
              $set: {
                password: passwordMatch,
              },
            }
          );
          req.session.passwordChanged = true;
          res.redirect("/userProfile/" + useId);
        } else {
          req.flash("error", "Password not match");
          res.redirect("/changePassword/" + useId);
        }
      } else {
        req.flash("error", "Current password is wrong");
        res.redirect("/changePassword/" + useId);
      }
      
      res.redirect("/userProfile/" + useId);
    } catch (error) {
      console.log("Error in post change password " + error);
    }
  },

  getUserCart: async (req, res) => {
    try {
      const useId = req.session.userId;

      const cartData = await cartAggregation(useId);

      const items = cartData.length > 0 ? cartData[0].products.length : 0;
      const grandTotal = cartData.length > 0 ? cartData[0].grandTotal : 0;
      const products = cartData.length > 0 ? cartData[0].products : [];

      const coupon = await couponSchema.find()
     console.log(coupon);

      if(coupon.length > 0 && coupon[0].isActive == true){
        if(grandTotal >= coupon[0].minOrderAmount){
          const updateCoupon = await couponSchema.updateOne(
            { _id: coupon.id }, 
            { $addToSet: { usedUsers: { user_id: useId } } }
          );
          console.log(updateCoupon);
          res.render('user/cart',{useId,items,grandTotal,products,coupon : coupon[0],error: req.flash("error")})
        }

      }

      //    // console.log("User id in get cart "+useId);
      //    console.log("product in cart "+ productData.product);
      // else{

      // res.render("user/cart", { useId, items, grandTotal, products,coupon :false });
      // }
      // res.render('user/cart',{useId})
      res.render("user/cart", { useId, items, grandTotal, products,coupon :false,error: req.flash("error") });
    } catch (error) {
      console.log("Error in get user cart ", error);
    }
  },

  postAddCart: async (req, res) => {
    try {
      const useId = req.session.userId;
      const cartExist = await cartSchema.findOne({
        userId: useId,
        "items.productId": new ObjectId(req.body.productId),
        "items.size": req.body.size,
      });

      if (cartExist) {
        const index = cartExist.items.findIndex((product) => {
          return (
            product.productId.equals(new ObjectId(req.body.productId)) &&
            product.size == req.body.size
          );
        });
        await cartSchema.updateOne(
          {
            userId: useId,
            "items.productId": new ObjectId(req.body.productId),
            "items.size": req.body.size,
          },
          {
            $inc: { [`items.${index}.quantity`]: 1 },
          }
        );
        res.json({ success: true });
      } else {
        await cartSchema.updateOne(
          { userId: useId },
          {
            $push: {
              items: {
                productId: new ObjectId(req.body.productId),
                quantity: 1,
                price: Number(req.body.price),
                size: req.body.size,
              },
            },
          },
          { upsert: true }
        );
      }

      res.json({ success: true });
    } catch (error) {
      console.log("Error in add to cart " + error);
    }
  },
  changeCartQuantity: async (req, res) => {
    try {
      const cartData = await cartSchema.find({
        userId: req.session.userId,
        "items._id": req.params.id,
      });
      console.log(req.params.id);
      console.log(cartData[0].items);

      const updatedCart = await cartSchema.updateOne(
        {
          userId: new ObjectId(req.session.userId),
          "items._id": new ObjectId(req.params.id),
        },
        { $inc: { "items.$.quantity": Number(req.body.quantity) } }
      );
      const useId = req.session.userId;

      const cartItem = await cartAggregation(useId);
      const grandTotal = cartItem[0].grandTotal
      res.json({ success: true ,grandTotal});

    } catch (error) {
      console.log(error);
    }
  },

  deleteItemCart: async (req, res) => {
    try {
      const useId = req.session.userId;

      const itemId = req.params.id;

      console.log("deleteitems " + req.params.id);
      await cartSchema.updateOne(
        { userId: new ObjectId(useId) },
        { $pull: { items: { _id: new ObjectId(req.params.id) } } }
      );
      res.redirect(`/cart/${useId}`);
    } catch (error) {
      console.log("Error in delete items from cart " + error);
    }
  },

  getCheckout: async (req, res) => {
    try {
      const useId = req.session.userId;
      const cartData = await cartAggregation(useId);
      const data = await consolidateDocuments(cartData[0].products);
      const inStock = await checkStock(data);
      console.log("instock "+inStock);
      if(inStock == true){
      
      req.session.cart = true;
      const address = await addressSchema.find({
        userId: useId,
        isDeleted: false,
      });
      
      console.log("Received cart data");
      res.render("user/checkout", {
        useId,
        address,
        cartItem: cartData[0].products,
        grandTotal: cartData[0].grandTotal,
      });}
      else{
        req.flash("error",`${inStock} is not available at this quantity`)
        res.redirect(`/cart/${useId}`)
      }
    } catch (error) {
      console.log("Error in get checkout " + error);
    }
  },
  // createRazorpayOrder : async(req,res) => {
  //   try {
  //     const cartData = await cartAggregation(req.session.userId);
  //       const orderId = generateOrderID();
  //       const options = {
  //           amount: cartData[0].grandTotal * 100, // amount in the smallest currency unit
  //           currency: "INR",
  //           receipt: "" + orderId,
  //           //receipt: CryptoJS.randomBytes(10).toString("hex")
  //       };

  //       createRazorpayOrder(instance, options, async (err, order) => {
  //           if (err) {
  //               console.error("Error creating Razorpay order:", err);
  //               res.status(500).json({ error: "Failed to create Razorpay order" });
  //               return;
  //           }
  //           console.log("Razorpay order created:", order);
  //           res.json({ order });
  //       });
  //   } catch (error) {
      
  //   }

  // },

  postPlaceOrder: async (req, res) => {
    try {
      const { address, payment } = req.body;
     
      const cartData = await cartAggregation(req.session.userId);
      const data = await consolidateDocuments(cartData[0].products);
      const inStock = await checkStock(data);
      console.log("post place order ",req.body);
      if (inStock == true) {
        if (req.body.payment == "COD") {
          const order = await makeOrder(
            cartData[0].grandTotal,
            address,
            payment,
            req.session.userId
          );
          const updated = await orderSchema.insertMany(order);
          if (updated) {
            const updatedStock = await updateStock(req, cartData[0].products);
            if (updatedStock) {
              res.json({ orderPlaced: true });
            }
          }
        } else if (req.body.payment == "ONLINE") {
          console.log("Razopay");
          const order = await makeOrder(
            cartData[0].grandTotal,
            address,
            payment,
            req.session.userId
          );
          let orders = await orderSchema.insertMany(order);
          const orderId = generateOrderID();
          const options = {
                      amount: cartData[0].grandTotal * 100, 
                      currency: "INR",
                      receipt: "" + order.orderId,
                      
                  };
          instance.orders.create(options,(err,order)=>{
            if(err)
            {
              console.log(err);
            }
            else{
              res.json({order})
            }
          })
      }

      } else {
        console.log("Out of stock "+ inStock);
        res.json({
          outOfStock: true,
          message: `${inStock} is Not Available in this quantity remove from the cart and proceed`,
        });
      }
    } 
    catch (error) {
      console.log("Error in placing order"+error);
    }

  },
  postVerifyPayment: async (req, res) => {
    try {
      console.log(req.body);
      let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);

    hmac.update(
      req.body["payment[razorpay_order_id]"] +
        "|" +
        req.body["payment[razorpay_payment_id]"]
    );
    hmac = hmac.digest("hex");
    if (hmac == req.body["payment[razorpay_signature]"]) {
      await orderSchema.updateOne({orderId : req.body["order[order][receipt]"]},
      {$set : {orderStage : "PREPARING FOR DISPATCH",orderStatus : "ACTIVE"
      
    }})
    const useId = req.session.userId;
    await cartSchema.updateOne({userId : new Object (useId)},{$set : {items : []}})
    res.json({paymentSuccess:true})
    }


        
    } catch (error) {
        console.error(error);
        
    }
},
  
  getOrderSuccess: async (req, res) => {
    try {
      res.render("user/order-success", { useId: req.session.userId });
    } catch (error) {
      console.log("Error in get order success message " + error);
    }
  },
  
  getOrderHistory: async (req, res) => {
    try {
      console.log(req.params.id);
      const orderDetails = await orderAggregation(req.params.id);
      orderDetails.forEach((item) => {
        item.orderedAt = item.orderedAt.toLocaleString();
      });

      res.render("user/orderHistory", {
        useId: req.session.userid,
        orderDetails,
      });
    } catch (error) {
      console.log("Error in get order history " + error);
    }
  },
  getOrderDetail: async (req, res) => {
    try {
      const orderDetail = await orderDetailAggregation(req.params.id);
      const grandTotal = orderDetail[0].grandTotal;
      const orderId = orderDetail[0].orderId;
      console.log(orderDetail);
      res.render("user/orderDetail", {
        useId: req.session.userId,
        orderDetail: orderDetail[0],
        grandTotal,
        orderId,
        
      });
    } catch (error) {
      console.log("Error in order detail " + error);
    }
  },
  postCancelOrder : async (req,res) =>{
    try {
        await orderSchema.updateOne({_id:new ObjectId(req.params.id)},{$set:{orderStage:'CANCELLATION REQUESTED' ,}})
        res.json({success:true,msg:'Order Cancelled Successfully'})
    } catch (error) {
      console.log("Error in post cancel order "+error);
    }

  },
};
