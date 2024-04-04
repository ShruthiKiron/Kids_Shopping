const userSchema = require("../models/userModel");
const productSchema = require("../models/productModel");
const categorySchema = require("../models/categoryModel");
const wishlistSchema = require('../models/wishlistModel')
const walletSchema = require('../models/walletModel')
const {ObjectId} = require('mongodb')

module.exports = {
  getHome: async (req, res) => {
    try {
      const productData = await productSchema.find();
      const categoryData = await categorySchema.find();

      //const categoryNames = categoryData.map(category => category.image);
      console.log(categoryData[0]);

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
    }
  },

  getProduct: async (req, res) => {
    try {
      const productData = await productSchema.find();
      const categoryData = await categorySchema.find();
      const useId = req.session.userId;
      const wishlistData = await wishlistSchema.aggregate([{$match : {userId : new ObjectId(useId)}},{$unwind : '$productId'
    },{$lookup : {
      from : 'products',
      localField : 'productId',
      foreignField : '_id',
      as : 'productData'
      
    }},{$unwind : '$productData'}])
    console.log(wishlistData);

      res.render("user/product", { products: productData,category: categoryData, useId ,wishlist : wishlistData,error : req.flash("error")});
    } catch (error) {
      console.log("Error in get user product " + error);
    }
  },

  getProductDetail: async (req, res) => {
    try {
      console.log("get product detail is called");
      const productData = await productSchema.findOne({ _id: req.params.id });
      const useId = req.session.userId;
      console.log("Product Data " + productData);
      res.render("user/productDetail", { product: productData, useId });
    } catch (error) {
      console.log("Error in get product detail " + error);
    }
  },

   
  postSearch : async (req,res) => {
    try {
    
    const searchProduct = req.body.value
    console.log("search product "+searchProduct);
    const regex = new RegExp(searchProduct, 'i');
    console.log("Regex: ", regex);
    const filterProduct = await productSchema.find({ product: regex ,isDeleted:false});
    console.log("Filtered Products: ", filterProduct);
    if(filterProduct.length == 0)
    {
      req.flash("error","No Products")
      res.redirect('/product')
    }
    else{
      console.log("search render page");
     res.json({found:true,product:filterProduct}) 
    }
      // const filterProduct =await productSchema.find({product: { $regex: new RegExp(`^${searchProduct}`, 'i') }})
      // console.log("search "+filterProduct);
    } catch (error) {
      console.log("Error in post search "+error);
    }

  },
  postFilter : async(req,res)=>{
    try {
      console.log(req.body);
      
      
    } catch (error) {
      console.log("Error in post filter "+error);
    }
  },
  getWishlist : async(req,res)=>{
    try {
      const useId = req.session.userId;
    // const products = await productSchema.find()
    // const wishlistData = await wishlistSchema.find()
    const wishlistData = await wishlistSchema.aggregate([{$match : {userId : new ObjectId(useId)}},{$unwind : '$productId'
    },{$lookup : {
      from : 'products',
      localField : 'productId',
      foreignField : '_id',
      as : 'productData'
      
    }},{$unwind : '$productData'}])
    console.log("unwind ",wishlistData);
    
    res.render('user/wishlist',{wishlistData,useId})

    } catch (error) {
      console.log("Error in get wishlist "+error);
    }

  },
  addWishlist : async(req,res) => {
    try {
      console.log("clicked");
      const useId = req.session.userId;
      const productId = req.query.productId;
      console.log("productId ",productId);
      const checkProduct = await wishlistSchema.find({productId : productId})
      console.log("checking product ",checkProduct);
      if (checkProduct.length === 0){
      await wishlistSchema.updateOne(
        { userId: new ObjectId(useId) },
        { $push: {  productId: new ObjectId(productId)}  },
        { upsert: true }
      );
      res.status(200).send("Product added to wishlist successfully");
    }
    else{
      

      res.status(409).send("Product is already in the wishlist");
    }
     // console.log("Wishlist data "+wishlistData);
      
      
    } catch (error) {
      console.log("Error in add wishlist "+error);
    }

  },
  deleteWishlist : async(req,res) => {
    try {
      const useId = req.session.userId;
      const productId = req.params.id
      console.log("deleteitemsfromw wislist " , req.params.id);
      await wishlistSchema.updateOne(
        {userId : new ObjectId(useId)},
        {$pull : {productId : req.params.id}}
        )
        res.redirect(`/wishlist/${productId}`)
     
    } catch (error) {
      console.log("Error in deleting wishlist");
    }
  },
  getWallet : async (req,res)=>{
    try {
      const useId = req.session.userId;
      //const wallet = await walletSchema.find({userId : new ObjectId(useId)})
      const wallet = await walletSchema.aggregate([{ $unwind: '$walletHistory' }]);
      console.log("walletDaat ",wallet);
      //console.log("wallet ",wallet);
      res.render('user/wallet',{wallet,useId})
      
    } catch (error) {
      console.log("Error in get wallet "+error);
    }

  },

};
