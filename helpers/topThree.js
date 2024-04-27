const productSchema = require('../models/productModel')
const categorySchema = require('../models/categoryModel')
const orderSchema = require('../models/orderModel')
const {ObjectId} = require('mongodb')
// async function findTopSellingProducts() {
//     const orders = await orderSchema.find({});
//     const productCounts = {};
    
//     orders.forEach(order => {
//         order.product.forEach(item => {
//             const productId = item.productId.toString();
//             if (!productCounts[productId]) {
//                 productCounts[productId] = 0;
//             }
//             productCounts[productId] += item.quantity;
//         });
//     });
//     const sortedProductCounts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]);
//     const topThreeProducts = sortedProductCounts.slice(0, 3).map(([productId, count]) => ({
//         productId,
//         count
//     }));
    
//     return topThreeProducts;
// }

async function findTopSellingProducts() {
    const topThreeProducts = await orderSchema.aggregate([
        {
            $unwind: "$product"
        },
        {
            $group: {
                _id: "$product.productId",
                totalQuantity: { $sum: "$product.quantity" }
            }
        },
        {
            $sort: { totalQuantity: -1 }
        },
        {
            $limit: 3
        },
        {
            $project: {
                _id: 0,
                productId: "$_id",
                count: "$totalQuantity"
            }
        }
    ]);

    return topThreeProducts;
}



async function findTopSellingCategories() {
    const orders = await orderSchema.find({});
    const categoryCounts = {};

    for (const order of orders) {
        for (const item of order.product) {
            const productId = item.productId.toString();
            const product = await productSchema.findOne({ _id: productId });
            if (product) {
                const category = product.category;
                if (!categoryCounts[category]) {
                    categoryCounts[category] = 0;
                }
                categoryCounts[category] += item.quantity;
            }
        }
    }

    const sortedCategoryCounts = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    const topThreeCategories = sortedCategoryCounts.slice(0, 3).map(([category, count]) => ({
        category,
        count
    }));

    return topThreeCategories;
}
 module.exports = {findTopSellingProducts,findTopSellingCategories}