

const cartSchema = require("../models/cartModel");
const orderSchema = require("../models/orderModel")
const { ObjectId } = require("mongodb");

module.exports = {

  cartAggregation: async (useId) => {
    const cartData = await cartSchema.aggregate([
      { $match: { userId: new ObjectId(useId) } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $addFields: {
          grandTotal: { $multiply: ["$items.quantity", "$items.price"] },
        },
      },
      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          grandTotal: { $sum: "$grandTotal" },
          products: {
            $push: {
              _id: "$items._id",
              productId: "$items.productId",
              quantity: "$items.quantity",
              totalPrice: "$grandTotal",
              size: "$items.size",
              Product: {
                _id: "$productInfo._id",
                productName: "$productInfo.product",
                price: "$productInfo.price",
                images: "$productInfo.image",
              },
            },
          },
        },
      },


    ]);
    return cartData

  },

  orderAggregation: async (useId, page, pageSize) => {
    // const matchStage = {
    //   userId: new ObjectId(useId)
    // };
    // if (filter && filter.orderStage) {
    //   matchStage.orderStage = filter.orderStage;
    // }
   
    const orders = await orderSchema.aggregate([
      {
        $match: { userId: new ObjectId(useId) }
      },
      {
        $unwind: "$product"
      },
      {
        $lookup: {
          from: "products",
          localField: "product.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $unwind: "$productDetails"
      },
      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          addressId: { $first: "$addressId" },
          orderId: { $first: "$orderId" },
          orderedAt: { $first: "$orderedAt" },
          updatedAt: { $first: "$updatedAt" },
          orderStage: { $first: "$orderStage" },
          orderStatus: { $first: "$orderStatus" },
          cancellationReason: { $first: "$cancellationReason" },
          product: {
            $push: {
              productId: "$product.productId",
              quantity: "$product.quantity",
              size: "$product.size",
              price: "$product.price",
              orderTotal: { $multiply: ['$product.quantity', '$product.price'] },
              productDetails: {
                _id: "$productDetails._id",
                productName: "$productDetails.product",
                images: '$productDetails.images'

              }
            }
          },
          grandTotal: { $first: "$grandTotal" },
          __v: { $first: "$__v" }
        }
      },
      { $sort: { orderedAt: -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize }
    ]);

    return orders

  },
  orderDetailAggregation: async (Id) => {
    const orders = await orderSchema.aggregate([
      {
        $match: { _id: new ObjectId(Id) }
      },
      {
        $unwind: "$product"
      },
      {
        $lookup: {
          from: "products",
          localField: "product.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $unwind: "$productDetails"
      },
      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          addressId: { $first: "$addressId" },
          orderId: { $first: "$orderId" },
          orderedAt: { $first: "$orderedAt" },
          updatedAt: { $first: "$updatedAt" },
          orderStage: { $first: "$orderStage" },
          orderStatus: { $first: "$orderStatus" },
          cancellationReason: { $first: "$cancellationReason" },
          product: {
            $push: {
              productId: "$product.productId",
              quantity: "$product.quantity",
              size: "$product.size",
              price: "$product.price",
              orderTotal: { $multiply: ['$product.quantity', '$product.price'] },
              productDetails: {
                _id: "$productDetails._id",
                productName: "$productDetails.product",
                images: '$productDetails.image'

              }
            }
          },
          grandTotal: { $first: "$grandTotal" },
          __v: { $first: "$__v" }
        }
      }
    ]);

    return orders

  },
  adminOrderAggregation: async () => {
    const orders = await orderSchema.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" }
      ,
      {
        $unwind: "$product"
      },
      {
        $lookup: {
          from: "products",
          localField: "product.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $unwind: "$productDetails"
      },
      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          addressId: { $first: "$addressId" },
          orderId: { $first: "$orderId" },
          orderedAt: { $first: "$orderedAt" },
          updatedAt: { $first: "$updatedAt" },
          orderStage: { $first: "$orderStage" },
          orderStatus: { $first: "$orderStatus" },
          cancellationReason: { $first: "$cancellationReason" },
          paymentMethod: { $first: '$paymentMethod' },
          userInfo: { $first: "$userInfo" },
          product: {
            $push: {
              productId: "$product.productId",
              quantity: "$product.quantity",
              size: "$product.size",
              price: "$product.price",
              orderTotal: { $multiply: ['$product.quantity', '$product.price'] },
              productDetails: {
                _id: "$productDetails._id",
                productName: "$productDetails.product",
                images: '$productDetails.image'

              }
            }
          },
          grandTotal: { $first: "$grandTotal" },
          __v: { $first: "$__v" }
        }
      }, {
        $sort: { orderedAt: 1 }
      }

    ]);
    return orders

  }

}



