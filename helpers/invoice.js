const easyinvoice = require('easyinvoice');
const fs =require('fs-extra')
const orderSchema = require('../models/orderModel')
const {ObjectId} = require('mongodb')

async function generateInvoice (orderId) {
    try{
        const order = await orderSchema.aggregate([
            { $match: { orderId: orderId } },
            { $unwind: "$product" },
            { 
                $lookup: {
                    from: "products", 
                    localField: "product.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $project: {
                    _id: 0,
                    orderId: 1,
                    orderedAt: 1,
                    "product.quantity": 1,
                    "productDetails.product": 1,
                    "productDetails.price": 1
                }
            }
        ])
        console.log(order);
        
        // if(!order || order.length === 0){
        //     console.error('Order not found');
        //     return;
        // }
    
var data = {
    apiKey: process.env.INVOICE_KEY, 
    mode: "development", 
    currency: "INR",
    invoiceNumber : order[0].orderId,
    invoiceDate:order[0].orderedAt.toDateString(),
    products: order.map(item => ({
        quantity: item.product.quantity,
        description: item.productDetails.product,
            taxRate: 6,
            price: item.productDetails.price
        })),
};
//console.log(data);
easyinvoice.createInvoice(data, function (result) {
    const pdfFilePath = `./invoices/${Date.now()}invoice.pdf`;
const pdfData = Buffer.from(result.pdf, 'base64');
fs.writeFile(pdfFilePath, pdfData, (err) => {
    if (err) {
        console.error('Error saving PDF file:', err);
    } else {
        console.log('PDF file saved successfully:', pdfFilePath);
    }
});
});
}catch(error){
    console.log("Error in invoice ",error);
}
}


module.exports = {generateInvoice}