const orderSchema = require('../models/orderModel');
const excel = require('exceljs');
module.exports = {


    generateSalesReport: async (startDate, endDate) => {
        try {
            if (!startDate || !endDate) {
                startDate = new Date();
                endDate = new Date();
            }
            const dateRange = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;

            const reportData = await orderSchema.aggregate([
                {
                    $match: {
                        orderedAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
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
                    $addFields: {
                        "product.name": { $arrayElemAt: ["$productDetails.product", 0] },
                        "product.category": { $arrayElemAt: ["$productDetails.category", 0] }
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        orderId: { $first: "$orderId" },
                        customerName: { $first: { $arrayElemAt: ["$user.firstName", 0] } },
                        phone: { $first: { $arrayElemAt: ["$user.mobile", 0] } },
                        product: { $push: "$product.name" },
                        category: { $push: "$product.category" },
                        quantitySold: { $sum: "$product.quantity" },
                        dateRangeStart: { $first: startDate.toLocaleDateString() }, // Accumulate start date
                        dateRangeEnd: { $first: endDate.toLocaleDateString() },
                        totalRevenue: { $first: "$grandTotal" }
                    }
                }
            ]);
            console.log("reportData ", reportData);

            let totalSales = 0;
            let overallOrderAmount = 0;
            let overallDiscount = 0;
            let overallSalesCount = 0;

            reportData.forEach(order => {
                totalSales += order.totalRevenue;
                overallOrderAmount += order.totalRevenue;
                overallDiscount += order.discountAmount || 0;
                overallSalesCount++;
            });

            const summary = {
                totalSales,
                overallOrderAmount,
                overallDiscount,
                overallSalesCount
            };


            return { reportData, summary, dateRange };
        } catch (error) {
            console.error("Error generating sales report:", error);
            throw error;
        }
    },
    getDownloadExcel: async (startDate, endDate, res) => {
        try {
            const { reportData, dateRange } = await module.exports.generateSalesReport(startDate, endDate);
            if (!reportData || reportData.length === 0) {
                throw new Error("No sales data found for the specified date range.");
            }
            const workbook = new excel.Workbook();
            const worksheet = workbook.addWorksheet('Sales Report');
            worksheet.addRow(['Order ID', 'Product', 'Category', 'Quantity Sold', 'Date Range', 'Total Revenue']);
            reportData.forEach(order => {
                worksheet.addRow([
                    order.orderId,
                    order.product.join(', '),
                    order.category.join(', '),
                    order.quantitySold,
                    dateRange,

                    order.totalRevenue.toFixed(2)
                ]);
            });
            // worksheet.getCell('E1').value = dateRange;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');
            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error("Error generating Excel file:", error);
            res.status(500).send("Error generating Excel file");
        }
    },

}
