const productSchema = require("../models/productModel");

const { ObjectId } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const cartSchema = require("../models/cartModel");
module.exports = {
  checkStock: async (cartData) => {
    try {
      for (let cartProduct of cartData) {
        const product = await productSchema.findById(cartProduct.productId);
        console.log(product);
        if (product.stock < cartProduct.quantity) {
          return product.product;
        }
      }
      return true;
    } catch (er) {
      console.log(er);
    }
  },
  consolidateDocuments: async (documents) => {
    const consolidated = {};

    documents.forEach((doc) => {
      const productId = doc.productId.toString();

      if (consolidated.hasOwnProperty(productId)) {
        consolidated[productId].quantity += doc.quantity;
      } else {
        consolidated[productId] = {
          productId: doc.productId,
          quantity: doc.quantity,
        };
      }
    });

    return Object.values(consolidated);
  },
  makeOrder: async (orderGrandTotal, address, payment, userId) => {
    console.log(userId);
    const uuid = uuidv4();
    const cart = await cartSchema.findOne({ userId: new ObjectId(userId) });
    const order = {
      userId: new ObjectId(userId),
      addressId: new ObjectId(address),
      orderId: `#${uuid}`,
      orderStage:
        payment == "ONLINE" ? "PAYMENT PENDING" : "PREPARING FOR DISPATCH",
      orderStatus: payment == "ONLINE" ? "PAYMENT PENDING" : "ACTIVE",
      product: cart.items,
      grandTotal: orderGrandTotal,
      paymentMethod:payment
    };

    return order;
  },
  updateStock: async (req, products) => {
    try {
      for (let items of products) {
        await productSchema.updateOne(
          { _id: new ObjectId(items.productId) },
          { $inc: { stock: -items.quantity } }
        );
      }
      await cartSchema.updateOne({userId:new ObjectId(req.session.userId)},{$set:{items:[]}})

      return true
    } catch (er) {
      console.log(er);
    }
  },
  checkOrderTransition:async (currentStage, requestedStage) => {
    const allowedStages = [
      "PREPARING FOR DISPATCH",
      "DISPATCHED",
      "ORDER SHIPPED",
      "OUT FOR DELIVERY",
      "DELIVERED",
      "RETURN REQUESTED",
      "RETURNED",
    ];
  
    if (!allowedStages.includes(requestedStage)) {
      return false;
    }
  
    const currentIndex = allowedStages.indexOf(currentStage);
    const requestedIndex = allowedStages.indexOf(requestedStage);
  
    if (requestedIndex <= currentIndex) {
      return false;
    }
  
    return true;
  }
};
