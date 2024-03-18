const userSchema = require("../models/userModel");
const productSchema = require("../models/productModel");
const categorySchema = require("../models/categoryModel");

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
      // console.log("pro "+productData);

      res.render("user/product", { products: productData,category: categoryData, useId ,error : req.flash("error")});
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

};
