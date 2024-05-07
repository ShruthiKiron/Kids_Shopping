const userSchema = require("../models/userModel");
const productSchema = require("../models/productModel");
const authController = require("../controller/authController");
const addressSchema = require("../models/addressModel");
const cartSchema = require("../models/cartModel");
const orderSchema = require("../models/orderModel");
const couponSchema = require('../models/couponModel')
const walletSchema = require('../models/walletModel')
const bcrypt = require("bcrypt");
const Razorpay = require("razorpay");
const CryptoJS = require("crypto-js");
const crypto = require('crypto')


const { generateInvoice } = require('../helpers/invoice')
//generateInvoice()
const checkWallet = require('../helpers/walletHelper')

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

const { createRazorpayOrder, verifyPayment } = require('../helpers/razorpayHelper')

const { generateOrderID } = require('../helpers/orderHelper')

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
  getUserProfile: async (req, res, next) => {
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

    } catch (error) {
      console.log("Error in get user profile " + error);
      next(error)
    }
  },

  getEditProfile: async (req, res, next) => {
    try {
      const useId = req.session.userId;
      console.log("at edit " + useId);
      const userData = await userSchema.findOne({ _id: useId });
      console.log(userData);

      res.render("user/editProfile", { useId, user: userData });
    } catch (error) {
      console.log("Error in get edit profile " + error);
      next(error)
    }
  },

  patchEditProfile: async (req, res, next) => {
    try {
      const useId = req.session.userId;
      const userData = await userSchema.findOne({ _id: useId });
      console.log(userData.mobile);
      console.log(req.body);

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
      next(error)
    }
  },

  getAddAddress: async (req, res, next) => {
    try {
      const useId = req.session.userId;
      res.render("user/addAddress", { useId });
    } catch (error) {
      console.log("Error in get add address " + error);
      next(error)
    }
  },

  postAddAddress: async (req, res, next) => {
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
        return res.redirect("/checkout");
      }
      if (userAddress) {
        return res.redirect("/userProfile/" + useId);
      }
    } catch (error) {
      console.log("Error in post add address " + error);
      next(error)
    }
  },

  getEditAddress: async (req, res, next) => {
    try {
      const addressData = await addressSchema.findOne({ _id: req.params.id });
      const useId = req.session.userId;
      res.render("user/editAddress", { address: addressData, useId });
    } catch (error) {
      console.log("Error in get edit address " + error);
      next(error)
    }
  },

  postEditAddress: async (req, res, next) => {
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
      next(error)
    }
  },
  patchDeleteAddress: async (req, res, next) => {
    try {
      const useId = req.session.userId;
      const addressData = await addressSchema.updateOne(
        { _id: req.params.id },
        { $set: { isDeleted: true } }
      );
      res.redirect("/userProfile/" + useId);
    } catch (error) {
      console.log(error);
      next(error)
    }
  },
  getChangePassword: async (req, res, next) => {
    try {
      const useId = req.session.userId;
      console.log("Get Change password");
      res.render("user/changePassword", { useId, error: req.flash("error"), passwordChanged: req.session.passwordChanged });
      req.session.passwordChanged = false;
      console.log("passwordChanged value in get ", req.session.passwordChanged);
    } catch (error) {
      console.log("Error in get change password " + error);
      next(error)
    }
  },

  postChangePassword: async (req, res, next) => {
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
        if (currentPass == newPass) {
          req.flash("error", "Current password and new password must not be same");
          res.redirect("/changePassword/" + useId);
        }
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
          res.json({ success: true, useId: useId });

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
      next(error)
    }
  },





  getUserCart: async (req, res, next) => {
    try {
      const useId = req.session.userId;

      const cartData = await cartAggregation(useId);

      const items = cartData.length > 0 ? cartData[0].products.length : 0;
      let grandTotal = cartData.length > 0 ? cartData[0].grandTotal : 0;
      let shippingCharge = 0;
      if (grandTotal < 500) {
        shippingCharge = 50;
      }
      grandTotal += shippingCharge;



      const products = cartData.length > 0 ? cartData[0].products : [];

      const coupon = await couponSchema.find()

      if (coupon.length > 0) {

        res.render('user/cart', { useId, items, grandTotal, products, coupon, error: req.flash("error") })
      }
      else {
        console.log("GT ", grandTotal);
        res.render("user/cart", { useId, items, grandTotal, products, coupon: false, error: req.flash("error") });

      }


    } catch (error) {
      console.log("Error in get user cart ", error);
      next(error)
    }
  },

  postAddCart: async (req, res, next) => {
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
      next(error)
    }
  },
  changeCartQuantity: async (req, res, next) => {
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


    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  deleteItemCart: async (req, res, next) => {
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
      next(error)
    }
  },

  getCheckout: async (req, res, next) => {
    try {
      const useId = req.session.userId;
      const cartData = await cartAggregation(useId);
      const data = await consolidateDocuments(cartData[0].products);
      const inStock = await checkStock(data);
      console.log("instock " + inStock);
      if (inStock == true) {

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
          grandTotal: req.session.discountedTotal ? req.session.discountedTotal : cartData[0].grandTotal,
        });
      }
      else {
        req.flash("error", `${inStock} is not available at this quantity`)
        res.redirect(`/cart/${useId}`)
      }
    } catch (error) {
      console.log("Error in get checkout " + error);
      next(error)
    }
  },


  postPlaceOrder: async (req, res, next) => {
    try {
      const { address, payment } = req.body;

      const cartData = await cartAggregation(req.session.userId);
      const data = await consolidateDocuments(cartData[0].products);
      const inStock = await checkStock(data);
      console.log("post place order ", req.body);
      if (inStock == true) {
        const orderTotal = req.session.discountedTotal ? Number(req.session.discountedTotal) : cartData[0].grandTotal;
        if (req.body.payment == "COD" && orderTotal < 1000) {
          const order = await makeOrder(
            req.session.discountedTotal ? Number(req.session.discountedTotal) :
              cartData[0].grandTotal,
            address,
            payment,
            req.session.userId
          );
          const updated = await orderSchema.insertMany(order);
          if (updated) {
            const updatedStock = await updateStock(req, cartData[0].products);
            if (updatedStock) {
              console.log("order : ", order.orderId);
              await generateInvoice(order.orderId);
              res.json({ orderPlaced: true });
            }
          }
        }
        else if (req.body.payment == "COD" && orderTotal >= 1000) {
          return res.json({
            error: true,
            message: "COD is not possible for orders above Rs 1000. Please choose another payment method."
          });
        }
        else if (req.body.payment == "ONLINE") {
          console.log("Razopay");
          const order = await makeOrder(
            req.session.discountedTotal ? Number(req.session.discountedTotal) :
              cartData[0].grandTotal,
            address,
            payment,
            req.session.userId
          );
          let orders = await orderSchema.insertMany(order);
          const orderId = generateOrderID();
          const options = {

            amount: req.session.discountedTotal ? Number(req.session.discountedTotal) * 100 : cartData[0].grandTotal * 100,
            currency: "INR",
            receipt: "" + order.orderId,

          };

          instance.orders.create(options, (err, order) => {
            if (err) {
              console.log(err);
            }
            else {

              res.json({ order })
            }
          })
          await generateInvoice(order.orderId);
        } else if (payment === "WALLET") {
          const walletBalanceSufficient = await checkWallet(req.session.userId, orderTotal);
          if (walletBalanceSufficient) {
            const userWallet = await walletSchema.findOne({ userId: req.session.userId });
            const newWalletBalance = userWallet.wallet - orderTotal;
            await walletSchema.updateOne({ userId: req.session.userId }, { $set: { wallet: newWalletBalance } });
            const transaction = {
              date: new Date(),
              amount: -orderTotal,
              message: "Order placed"
            };
            await walletSchema.updateOne({ userId: req.session.userId }, { $push: { walletHistory: transaction } });

            const order = await makeOrder(orderTotal, address, payment, req.session.userId);
            const updated = await orderSchema.insertMany(order);
            if (updated) {
              const updatedStock = await updateStock(req, cartData[0].products);
              if (updatedStock) {
                await generateInvoice(order.orderId);
                res.json({ orderPlaced: true });
              }
            }
          } else {
            return res.json({ error: true, message: "Insufficient balance in wallet for payment" });
          }

        } else {
          console.log("Out of stock " + inStock);
          res.json({
            outOfStock: true,
            message: `${inStock} is Not Available in this quantity remove from the cart and proceed`,
          });
        }
      }
    }
    catch (error) {
      console.log("Error in placing order" + error);
      next(error)
    }

  },
  postVerifyPayment: async (req, res, next) => {
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
        await orderSchema.updateOne({ orderId: req.body["order[order][receipt]"] },
          {
            $set: {
              orderStage: "PREPARING FOR DISPATCH", orderStatus: "ACTIVE"

            }
          })
        const useId = req.session.userId;
        await cartSchema.updateOne({ userId: new Object(useId) }, { $set: { items: [] } })
        res.json({ paymentSuccess: true })
      }



    } catch (error) {
      console.error(error);
      next(error)

    }
  },

  getOrderSuccess: async (req, res, next) => {
    try {
      res.render("user/order-success", { useId: req.session.userId });
    } catch (error) {
      console.log("Error in get order success message " + error);
      next(error)
    }
  },

  getOrderHistory: async (req, res, next) => {
    try {
      let page = parseInt(req.query.page) || 1;
      let pageSize = 5;


      let orderDetails = await orderAggregation(req.params.id, page, pageSize)

      orderDetails.forEach((item) => {
        item.orderedAt = new Date(item.orderedAt);
      });

      orderDetails.sort((a, b) => b.orderedAt - a.orderedAt);

      const totalOrdersCount = await orderSchema.countDocuments({ userId: req.params.id });

      res.render("user/orderHistory", {
        useId: req.params.id,
        orderDetails,
        currentPage: page,
        totalPages: Math.ceil(totalOrdersCount / pageSize),
        //selectedStatus
      });
    } catch (error) {
      console.log("Error in get order history " + error);
      next(error)
    }
  },
  getfilteredOrders: async (req, res, next) => {
    try {
      let selectedStatus = req.body.status || req.query.status || 'ALL';
      selectedStatus = selectedStatus.trim().toUpperCase();
      if (!req.params.id) {
        throw new Error('User ID is missing');
      }

      const allOrders = await orderSchema.aggregate([
        { $match: { userId: new ObjectId(req.params.id) } },
        {
          $lookup: {
            from: 'products',
            localField: 'product.productId',
            foreignField: '_id',
            as: 'productDetails'
          }

        },

      ])
      let filteredOrders;
      if (selectedStatus === 'ALL') {
        filteredOrders = allOrders;

      } else {

        filteredOrders = await orderSchema.aggregate([
          { $match: { userId: new ObjectId(req.params.id), orderStatus: selectedStatus } },
          {
            $lookup: {
              from: 'products',
              localField: 'product.productId',
              foreignField: '_id',
              as: 'productDetails'
            }

          },

        ])


      }
      res.json(filteredOrders);
    } catch (error) {
      console.log("Error in get filtered orders ", error);
      res.json({ error: 'Error fetching filtered orders' });
      next(error)
    }
  },

  getOrderDetail: async (req, res, next) => {
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
      next(error)
    }
  },
  postCancelOrder: async (req, res, next) => {
    try {
      const orderData = await orderSchema.findOne({ _id: new ObjectId(req.params.id) })
      console.log("Or ", orderData.orderStage);
      if (orderData.orderStage !== 'OUT OF DELIVERY') {
        await orderSchema.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { orderStage: 'CANCELLATION REQUESTED', } })
        res.json({ success: true, msg: 'Order Cancelled Successfully' })
      }
      else {
        res.json({ invalid_request: true, msg: 'ORDER CANCELLATION IS NOT POSSIBLE IN THIS STAGE' })
      }

    } catch (error) {
      console.log("Error in post cancel order " + error);
      next(error)
    }

  },
  returnOrder: async (req, res, next) => {
    try {
      console.log(req.params);
      await orderSchema.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { orderStage: "RETURN REQUESTED" } })
      res.json({ success: true, msg: "ORDER IS REQUESTED FOR RETURN" })
    } catch (error) {
      console.log("Error in return order ", error);
      next(error)
    }
  },

  retryPayment: async (req, res, next) => {
    try {
      let orders = await orderSchema.find({ _id: req.params.id })
      console.log("Order Detailssss ", orders);
      const options = {

        amount: orders[0].grandTotal * 100,
        currency: "INR",
        receipt: "" + orders[0].orderId,

      };
      instance.orders.create(options, (err, order) => {
        if (err) {
          console.log(err);
        }
        else {
          res.json({ order })
        }
      })
    } catch (error) {
      console.log("Errror in retry payment ", error);
      next(error)
    }
  },
  postCancelSingleProduct: async (req, res, next) => {
    try {

      const orderId = req.params.id;
      const productId = req.body.productId;

      const order = await orderSchema.findOne({ _id: new ObjectId(orderId) });
      const product = await productSchema.findOne({ _id: productId })

      const productIndex = order.product.findIndex(product => {
        console.log(product.productId);
        return product.productId.equals(new ObjectId(productId));
      });

      console.log("indexx ", productIndex);

      if (productIndex !== -1) {
        order.product.splice(productIndex, 1);
        const balance = Number(order.grandTotal) - Number(product.price)
        order.grandTotal = balance

        await order.save();
        const wallet = await walletSchema.findOne({ userId: order.userId })
        const walletUpdate = {
          date: new Date(),
          amount: product.price,
          message: 'Credited from single product cancelation'
        }
        wallet.wallet += product.price
        wallet.walletHistory.push(walletUpdate)
        await wallet.save()
        console.log("Item has been cancelled");
        product.stock += 1
        await product.save()

        return res.json({ success: true, msg: 'Item has been cancelled successfully' });
      } else {
        return res.json({ success: false, msg: 'Product not found in order' });
      }

    } catch (error) {
      console.log("Error in canceling single product: ", error);
      return res.json({ success: false, msg: 'Internal server error' });
      next(error)
    }
  }



};
