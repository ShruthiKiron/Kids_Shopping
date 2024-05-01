const couponSchema = require("../models/couponModel");

module.exports = {
  getCoupon: async (req, res) => {
    try {

      const coupon = await couponSchema.find();
      res.render("admin/coupons", { coupon });
    } catch (error) {
      console.log("Error in get coupon page " + error);
    }
  },
  getAddCoupons: async (req, res) => {
    try {
      res.render("admin/addCoupons", { error: req.flash("error") });
    } catch (error) {
      console.log("Error in get add coupons " + error);
    }
  },
  postAddCoupons: async (req, res) => {
    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      console.log(formattedDate);
      console.log(req.body.endDate);
      const coupon = await couponSchema.findOne({ couponCode: req.body.code });
      if (coupon) {
        req.flash("error", "Coupon code already exist");
        res.redirect("/addCoupons");
      } else if (req.body.endDate < formattedDate) {
        req.flash("error", "Invalid date");
        res.redirect("/addCoupons");
      } else if (req.body.discount > 70) {
        req.flash("error", "Discount cannot be more than 70%")
        res.redirect("/addCoupons");
      }
      else {
        const couponDetails = new couponSchema({
          couponCode: req.body.code,
          discountPercentage: req.body.discount,
          expiry: req.body.endDate,
          minOrderAmount: req.body.minAmount,
          isActive: req.body.status,
        });
        await couponDetails.save();
        res.redirect("/coupons");
      }
    } catch (error) {
      console.log("Error in post add coupons " + error);
    }
  },
  deleteCoupon: async (req, res) => {
    try {
      console.log("Delete item " + req.params.id);
      await couponSchema.findOneAndDelete({ _id: req.params.id });
      res.redirect("/coupons");
    } catch (error) {
      console.log("Error in delete coupon " + error);
    }
  },
};
