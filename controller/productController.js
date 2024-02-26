const categorySchema = require('../models/categoryModel')
const productSchema = require('../models/productModel')
const path = require('path')
const { cropAndSaveImage } = require('../helpers/imageCrop')

module.exports = {

    getProduct : async(req,res) => {
        try {
            const productData = await productSchema.find()
            
        res.render('admin/products',{products : productData })
        } catch (error) {
           console.log("Error in get product "+error); 
        }
        
    },

    getAddProducts : async(req,res) => {
        try {
            const categories = await categorySchema.find()

           res.render('admin/addProducts',{category : categories}) 
            
        } catch (error) {
            console.log('Error in post products '+error);
        }
    },
    postAddProducts : async (req,res) => {
        try {

            console.log(req.files);
            console.log(req.body);
            const img = []
            for( let items of req.files) {
                const croppedImage = await cropAndSaveImage(items);
                img.push(path.basename(croppedImage));
               // img.push(items.filename)
            }



            const productDetail = new productSchema({
                product : req.body.productName,
                category : req.body.categoryName,
                size : req.body.size,
                color : req.body.colour,
                price : req.body.price,
                stock : req.body.stock,
                description : req.body.description,
                image : img
            })



             await productDetail.save()
            res.redirect('/products')



        } catch (error) {
            console.log("Error in post add products "+error);
        }




    },
    getEditProduct : async (req,res) => {
        try {

            console.log("edit Product")
            const productData = await productSchema.findOne({_id : req.params.id})
            console.log(productData)
            
            if(productData)
            {
                const category = await categorySchema.find()
                const selectedCategory = productData.category
                console.log(selectedCategory);

                // console.log(productData.image);

                res.render('admin/editProduct',{ productData ,category,selectedCategory})
            }            

        } catch (error) {
            console.log("Error in get product "+error);
        }
    },

    patchEditProduct : async (req,res) => {
        try {
            console.log("patch edit product");

            const productData = await productSchema.findOne({_id : req.params.id})
             const image = productData.image
            // console.log("Image "+image)
            console.log("Uploaded Files: ", req.files);

           
            for (let items of req.files) {
                const croppedImage = await cropAndSaveImage(items);
                image.push(path.basename(croppedImage));
                console.log("Pushed Image: ", path.basename(croppedImage));
            }
            console.log("Final Image Array: ", image);

           
            console.log("Image to be Updated: ", img);

            
            await productSchema.updateOne({_id : req.params.id},
                {$set : {
                product : req.body.product,
                category : req.body.categoryName,
                size : (productData.size)? productData.size : req.body.size,
                color : req.body.colour,
                price : req.body.price,
                stock : req.body.stock,
                description : req.body.description,
                image : image,
    
            }})
            
            res.redirect('/products')

            
        } catch (error) {
            console.log("Error in patch edit product " +error);
        }
    },
    
    deleteProduct : async (req,res) =>{
        try {
            const productData = await productSchema.find({_id : req.params.id})
            await productSchema.updateOne({_id : req.params.id},{$set : {isDeleted : true}})
            res.redirect('/products')
        } catch (error) {
            console.log("Error in delete product "+error);
            
        }
    },
    
   

}