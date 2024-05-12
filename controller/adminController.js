const adminSchema = require('../models/adminModel')
const userSchema = require('../models/userModel')
const categorySchema = require('../models/categoryModel')
const productSchema = require('../models/productModel')
const orderSchema = require('../models/orderModel')
const salesHelper = require('../helpers/salesHelper');
const bcrypt = require('bcrypt')
const excel = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');
const { adminOrderAggregation } = require('../helpers/aggregation')
const { findTopSellingProducts, findTopSellingCategories } = require('../helpers/topThree')

module.exports = {
    //admin signup

    getAdminSignup: async (req, res, next) => {
        try {
            res.render('admin/adminSignup', { error: req.flash("error") })
        } catch (error) {
           console.log(error); 
           next(error)
        }
        
    },

    postAdminSignup: async (req, res, next) => {
        try {

            const adminData = await adminSchema.findOne({ email: req.body.email })

            console.log(req.body.password)

            if (adminData) {
                req.flash("error", "Admin already exist");
                res.redirect('/adminSignup')
            }
            else {

                const adminInfo = new adminSchema({
                    email: req.body.email,
                    password: await bcrypt.hash(req.body.password, 12),
                })
                await adminInfo.save()
                console.log("hashed password " + adminInfo.password)

                res.redirect('/admin')
            }


        } catch (error) {
            console.log("Error in admin signup " + error)
           
           next(error)

        }
    },

    //get Admin login

    getAdminLogin: async (req, res,next) => {
        try {
            
            if(req.session.admin){
                res.redirect('/dashboard')
            }
            
            res.render('admin/admin', { error: req.flash("error") })

        } catch (error) {
            console.log(error); 
           next(error)
        }
        
    },

    //post Admin login

    postAdminLogin: async (req, res, next) => {
        try {
            const adminData = await adminSchema.findOne({ email: req.body.email })
            if (!adminData) {
                req.flash("error", "Admin dosen't exist");
                res.redirect('/admin')
            }
            else {
                const passwordMatch = await bcrypt.compare(req.body.password, adminData.password)
                if (passwordMatch) {
                    req.session.admin = true;
                    req.session.adminId = adminData._id;
                    console.log("admin id " + req.session.adminId);
                    res.redirect('/dashboard')
                }
                else {
                    req.flash("error", "Incorrect Password");
                    res.redirect('/admin')
                }
            }

        } catch (error) {

            console.log("Error in admin login " + error);
            
           next(error)

        }
    },
    adminLogout: async (req, res,next) => {
        try {
            console.log('logout')
            delete req.session.adminId
            delete req.session.admin

            res.redirect('/admin')
        } catch (error) {
            console.log(error); 
           next(error)

        }
    },

    getDashboard: async (req, res, next) => {
        try {
            const orderData = await adminOrderAggregation();
            console.log(req.session.admin);
            console.log(req.session.adminId);

            res.render("admin/dashboard", { order: orderData });
        } catch (error) {
            console.log("Error in dashboard " + error);
            next(error)
        }

    },
    getDashboardStat: async (req, res,next) => {

        try {
            const { timeRange } = req.query;
            let aggregationPipeline = [];

            switch (timeRange) {
                case "yearly":
                    aggregationPipeline = [
                        {
                            $group: {
                                _id: { year: { $year: "$orderedAt" } },
                                count: { $sum: 1 }
                            }
                        }
                    ];
                    break;
                case "monthly":
                    aggregationPipeline = [
                        {
                            $group: {
                                _id: { year: { $year: "$orderedAt" }, month: { $month: "$orderedAt" } },
                                count: { $sum: 1 }
                            }
                        }
                    ];
                    break;
                case "weekly":
                    aggregationPipeline = [
                        {
                            $group: {
                                _id: { year: { $isoWeekYear: "$orderedAt" }, week: "$_id.week" },
                                count: { $sum: "$count" }
                            }
                        }
                    ];
                    break;
                case "daily":
                    aggregationPipeline = [
                        {
                            $group: {
                                _id: { year: { $year: "$orderedAt" }, month: { $month: "$orderedAt" }, day: { $dayOfMonth: "$orderedAt" } },
                                count: { $sum: 1 }
                            }
                        }
                    ];
                    break;
                default:

                    // Handle invalid time range option
                    break;
            }

            const orderStats = await orderSchema.aggregate(aggregationPipeline);

            console.log("orderStats:", orderStats); // Log orderStats array

            if (orderStats.length === 0) {
                // Return a response indicating no data available for the selected time range
                return res.json({ message: "No data available for the selected time range" });
            }

            const labels = orderStats.map(stat => {
                if (timeRange === "yearly") {
                    return stat._id.year;
                } else if (timeRange === "monthly") {
                    return `${stat._id.year}-${stat._id.month}`;
                } else if (timeRange === "weekly") {
                    return `${stat._id.year}-W${stat._id.week}`;
                } else if (timeRange === "daily") {
                    return `${stat._id.year}-${stat._id.month}-${stat._id.day}`;
                } else {
                    return 'Unknown';
                }
            });

            const data = orderStats.map(stat => stat.count);

            res.json({ labels, data });
        } catch (error) {
            console.log("Error in dashboard stat ", error);
            res.json({ message: "Internal server error" });
            next(error)
        }
    },



    getSalesreport: async (req, res,next) => {
        try {

            if (!req.session.adminId) {
                req.flash("error", "Please login");
                return res.redirect('/admin');
            }

            const { startDate, endDate } = req.query;

            const start = new Date(startDate);
            const end = new Date(endDate);
            console.log(req.query);
            req.session.dates = { startDate, endDate };
            const { reportData, summary } = await salesHelper.generateSalesReport(start, end);
            const dateRange = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
            res.render('admin/salesreport', { reportData, summary, dateRange });

        } catch (error) {
            console.error("Error in getSalesreport:", error);
            next(error)

        }
    },
    downloadExcelHandler: async (req, res,next) => {
        try {
            const { startDate, endDate } = req.session.dates;
            //const { startDate, endDate } = req.query; 
            console.log("start date ", startDate);
            const start = new Date(startDate);
            const end = new Date(endDate);
            await salesHelper.getDownloadExcel(start, end, res);
            // const { reportData, dateRange } = await salesHelper.generateSalesReport(start, end);           

            //  await salesHelper.getDownloadExcel(reportData, dateRange, res);
        } catch (error) {
            console.error("Error handling download Excel request:", error);
            res.status(500).send("Error generating Excel file");
            next(error)

        }
    },
    downloadPdfHandler: async (req, res,next) => {
        try {
            const { startDate, endDate } = req.session.dates;
            const start = new Date(startDate);
            const end = new Date(endDate);
            const { reportData, dateRange } = await salesHelper.generateSalesReport(start, end);

            const pdfDoc = new PDFDocument();
            const pdfPath = path.join(__dirname, '..', 'sales_report.pdf');
            pdfDoc.pipe(fs.createWriteStream(pdfPath));

            pdfDoc.fontSize(20).text('Sales Report', { align: 'center' }).moveDown();
            pdfDoc.fontSize(12).text(`Date Range: ${dateRange}`).moveDown();

            pdfDoc.fontSize(10);
            reportData.forEach((order, index) => {
                pdfDoc.text(`Order ID: ${order.orderId}`);
                pdfDoc.text(`Product: ${order.product.join(', ')}`);
                pdfDoc.text(`Category: ${order.category.join(', ')}`);
                pdfDoc.text(`Quantity Sold: ${order.quantitySold}`);
                pdfDoc.text(`Total Revenue: ₹${order.totalRevenue.toFixed(2)}`).moveDown();
            });

            pdfDoc.end();

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="sales_report.pdf"`);
            fs.createReadStream(pdfPath).pipe(res);
        } catch (error) {
            console.error("Error handling download PDF request:", error);
            res.status(500).send("Error generating PDF file");
            next(error)

        }
    },
    getTopProducts: async (req, res, next) => {
        try {
            const topSellingProducts = await findTopSellingProducts();
            const productsWithNames = await Promise.all(topSellingProducts.map(async product => {
                const productDetails = await productSchema.findOne({ _id: product.productId });
                return {
                    productName: productDetails ? productDetails.product : 'Unknown Product',
                    count: product.count
                };
            }));
            res.json(productsWithNames);
        } catch (error) {
            console.log("Error in get top products ", error);
            res.status(500).json({ error: "Internal server error" });
            next(error)

        }
    },
    getTopCategories: async (req, res,next) => {
        try {
            const topSellingCategories = await findTopSellingCategories();
            res.json(topSellingCategories);
        } catch (error) {
            console.log("Error in get top categories ", error);
            next(error)

        }
    }

}