const userSchema = require("../models/userModel");
const productSchema = require("../models/productModel");
const categorySchema = require("../models/categoryModel");
const wishlistSchema = require('../models/wishlistModel')
const walletSchema = require('../models/walletModel')
const offerSchema = require('../models/offermodel')
const couponSchema = require('../models/couponModel')
const { ObjectId } = require('mongodb')
const { cartAggregation } = require('../helpers/aggregation')

module.exports = {
  getHome: async (req, res,next) => {
    try {
      const productData = await productSchema.find();
      const categoryData = await categorySchema.find();


      if (req.session.userId) {
        const useId = req.session.userId;
        res.render("user/home", {
          products: productData,
          useId,
          category: categoryData,
        });
      } else {
        res.render("user/home", {
          products: productData,
          useId: false,
          category: categoryData,
        });
      }
    } catch (error) {
      console.log("Error in get home " + error);
      next(error)
    }
  },

  getProduct: async (req, res,next) => {
    try {
      const productData = await productSchema.find();
      const categoryData = await categorySchema.find();
      const useId = req.session.userId;
      const offerData = await offerSchema.find()

      const wishlistData = await wishlistSchema.aggregate([{ $match: { userId: new ObjectId(useId) } }, {
        $unwind: '$productId'
      }, {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'productData'

        }
      }, { $unwind: '$productData' }])


      res.render("user/product", { products: productData, category: categoryData, useId, wishlist: wishlistData, offers: offerData, error: req.flash("error") });
    } catch (error) {
      console.log("Error in get user product " + error);
      next(error)
    }
  },

  getProductDetail: async (req, res,next) => {
    try {
      console.log("get product detail is called");
      const productData = await productSchema.findOne({ _id: req.params.id });
      const useId = req.session.userId;
      console.log("Product Data " + productData);
      res.render("user/productDetail", { product: productData, useId });
    } catch (error) {
      console.log("Error in get product detail " + error);
      next(error)
    }
  },


  postSearch: async (req, res,next) => {
    try {

      const searchProduct = req.body.value
      console.log("search product " + searchProduct);
      const regex = new RegExp(searchProduct, 'i');
      console.log("Regex: ", regex);
      const filterProduct = await productSchema.find({ product: regex, isDeleted: false });
      console.log("Filtered Products: ", filterProduct);
      if (filterProduct.length == 0) {
        req.flash("error", "No Products")
        res.redirect('/product')
      }
      else {
        console.log("search render page");
        res.json({ found: true, product: filterProduct })
      }
    } catch (error) {
      console.log("Error in post search " + error);
      next(error)
    }

  },
  postFilter: async (req, res,next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const productsPerPage = 12;
      console.log("Filter ", req.body);
      const filters = req.body.filters;
      const sortValue = req.body.sortValue;

      const filterObject = {};

      if (filters.category && filters.category.length > 0) {
        filterObject.category = { $in: filters.category };
      }

      if (filters.color && filters.color.length > 0) {
        filterObject.color = { $in: filters.color };
      }

      if (filters.size && filters.size.length > 0) {
        filterObject.size = { $in: filters.size };
      }
      filterObject.isDeleted = { $ne: true };

      let filteredProducts = await productSchema.find(filterObject);


      if (sortValue === 'ascending' || sortValue === 'descending') {
        filteredProducts.sort((a, b) => {
          if (sortValue === 'ascending') {
            return a.price - b.price;
          } else {
            return b.price - a.price;
          }
        });
      } else if (sortValue === 'a-z' || sortValue === 'z-a') {
        filteredProducts.sort((a, b) => {
          const nameA = a.product.toUpperCase();
          const nameB = b.product.toUpperCase();
          if (sortValue === 'a-z') {
            return nameA.localeCompare(nameB);
          } else {
            return nameB.localeCompare(nameA);
          }
        });
      }

      res.json({ success: true, products: filteredProducts });

    } catch (error) {
      console.log("Error in post filter " + error);
      res.status(500).json({ success: false, error: 'An error occurred while processing the request' });
      next(error)
    }
  },

  getWishlist: async (req, res,next) => {
    try {
      const useId = req.session.userId;
      const wishlistData = await wishlistSchema.aggregate([{ $match: { userId: new ObjectId(useId) } }, {
        $unwind: '$productId'
      }, {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'productData'

        }
      }, { $unwind: '$productData' }])
      console.log("unwind ", wishlistData);

      res.render('user/wishlist', { wishlistData, useId })

    } catch (error) {
      console.log("Error in get wishlist " + error);
      next(error)
    }

  },
  addWishlist: async (req, res,next) => {
    try {
      console.log("clicked");
      const useId = req.session.userId;
      const productId = req.query.productId;
      console.log("productId ", productId);
      const checkProduct = await wishlistSchema.find({ productId: productId })
      console.log("checking product ", checkProduct);
      if (checkProduct.length === 0) {
        await wishlistSchema.updateOne(
          { userId: new ObjectId(useId) },
          { $push: { productId: new ObjectId(productId) } },
          { upsert: true }
        );
        res.status(200).send("Product added to wishlist successfully");
      }
      else {


        res.status(409).send("Product is already in the wishlist");
      }


    } catch (error) {
      console.log("Error in add wishlist " + error);
      next(error)
    }

  },
  deleteWishlist: async (req, res,next) => {
    try {
      const useId = req.session.userId;
      const productId = req.params.id
      console.log("deleteitemsfromw wislist ", req.params.id);
      await wishlistSchema.updateOne(
        { userId: new ObjectId(useId) },
        { $pull: { productId: req.params.id } }
      )
      res.redirect(`/wishlist/${productId}`)

    } catch (error) {
      console.log("Error in deleting wishlist");
      next(error)
    }
  },
  getWallet: async (req, res,next) => {
    try {
      const useId = req.session.userId;


      const wallet = await walletSchema.aggregate([
        { $match: { userId: new ObjectId(useId) } },
        { $unwind: "$walletHistory" }
      ]).exec();



      console.log("walletDaat ", wallet);
      res.render('user/wallet', { wallet, useId })

    } catch (error) {
      console.log("Error in get wallet " + error);
      next(error)
    }

  },
  applyCoupon: async (req, res,next) => {
    try {
      console.log(req.body);
      const couponCode = req.body.code;
      const couponData = await couponSchema.findOne({ couponCode: { $regex: new RegExp(couponCode, "i") } });
      console.log(couponData);

      console.log(couponData.discountPercentage);

      const currentDate = new Date();
      if (currentDate > couponData.expiry) {
        return res.status(400).json({ error: "Coupon has expired" });
      }
      const useId = req.session.userId;
      const cartItem = await cartAggregation(useId);
      const grandTotal = cartItem[0].grandTotal
      console.log("grand total ", grandTotal);
      console.log("discount ", couponData.discountPercentage);
      const discountAmount = (couponData.discountPercentage / 100) * grandTotal;
      const discountedTotal = grandTotal - discountAmount;
      console.log("Discounted Total:", discountedTotal);

      req.session.appliedCoupon = {
        couponCode: couponData.couponCode,
        discountPercentage: couponData.discountPercentage,
        discountAmount: discountAmount
      };


      req.session.discountedTotal = discountedTotal
      res.status(200).json({ discountedTotal, discountAmount, success: true });

    }
    catch (error) {
      console.log("Error in apply coupon ", error);
      next(error)
    }
  },
  removeCoupon: async (req, res,next) => {
    try {
      console.log("Remove coupon");
      if (req.session.appliedCoupon) {
        delete req.session.appliedCoupon;
        delete req.session.discountedTotal;
        res.json({ success: true, msg: "Coupon removed Successfully" });
      }
      else {

        res.json({ couponNotAdded: true, msg: "Coupon is Missing" });
      }

    } catch (error) {
      console.log("Error in removing coupon: ", error);
      res.status(500).json({ success: false, error: 'An error occurred while removing the coupon' });
      next(error)
    }
  },


};
