const userSchema = require("../models/userModel");
const productSchema = require("../models/productModel");
const authController = require("../controller/authController");
const addressSchema = require("../models/addressModel");
const cartSchema = require("../models/cartModel");
const orderSchema = require("../models/orderModel");
const bcrypt = require("bcrypt");

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
      res.render("user/changePassword", { useId, error: req.flash("error") });
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

      //    // console.log("User id in get cart "+useId);
      //    console.log("product in cart "+ productData.product);

      res.render("user/cart", { useId, items, grandTotal, products });
      // res.render('user/cart',{useId})
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

      res.json({ success: true });
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
      req.session.cart = true;
      const address = await addressSchema.find({
        userId: useId,
        isDeleted: false,
      });
      const cartData = await cartAggregation(useId);
      res.render("user/checkout", {
        useId,
        address,
        cartItem: cartData[0].products,
        grandTotal: cartData[0].grandTotal,
      });
    } catch (error) {
      console.log("Error in get checkout " + error);
    }
  },

  postPlaceOrder: async (req, res) => {
    try {
      const { address, payment } = req.body;

      const cartData = await cartAggregation(req.session.userId);
      const data = await consolidateDocuments(cartData[0].products);
      const inStock = await checkStock(data);

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
        }
      } else {
        console.log(inStock);
        res.json({
          outOfStock: true,
          message: `${inStock} is Not Available in this quantity remove from the cart and proceed`,
        });
      }
    } catch (error) {
      console.log(error);
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
