const categorySchema = require('../models/categoryModel')
const productSchema = require('../models/productModel')
const path = require('path')
const { cropAndSaveImage } = require('../helpers/imageCrop')

module.exports = {

    getProduct : async(req,res) => {
        try {
            const productData = await productSchema.find().sort({date : -1})
            const pro = productData
            
        res.render('admin/products',{products : productData })
        } catch (error) {
           console.log("Error in get product "+error); 
        }
        
    },

    getAddProducts : async(req,res) => {
        try {
            const categories = await categorySchema.find()

           res.render('admin/addProducts',{category : categories,error: req.flash("error")}) 
            
        } catch (error) {
            console.log('Error in post products '+error);
        }
    },
    postAddProducts : async (req,res) => {
        try {

            console.log("At post add products ");


            for(let file of req.files){
                if(
                    file.mimetype !== 'image/jpg' &&
                    file.mimetype !== 'image/jpeg' &&
                    file.mimetype !== 'image/png' &&
                    file.mimetype !== 'image/gif' &&
                    file.mimetype !== 'image/webp'
                ){
                    req.flash("error","Check the image type")
                    return res.redirect('/addProducts')
                }
            }

            console.log(req.files);
            console.log(req.body);
            const img = []
            for( let items of req.files) {

                // const croppedImage = await cropAndSaveImage(items);
                // img.push(path.basename(croppedImage));

                img.push(items.filename)
            }
            if(req.body.price < 0)
            {
                req.flash('error','Invalid price')
                res.redirect('/addProducts')
            }
            else if(req.body.stock < 0){
                req.flash('error','Invalid stock')
                res.redirect('/addProducts')
            }
            else{

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

        }

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

            for(let file of req.files){
                if(
                    file.mimetype !== 'image/jpg' &&
                    file.mimetype !== 'image/jpeg' &&
                    file.mimetype !== 'image/png' &&
                    file.mimetype !== 'image/gif' &&
                    file.mimetype !== 'image/webp'
                ){
                    req.flash("error","Check the image type")
                    return res.redirect('/ediProducts')
                }
            }

            console.log("Uploaded Files: ", req.files);
            let img = []
            img = image
           
            for (let items of req.files) {
                // const croppedImage = await cropAndSaveImage(items);
                // image.push(path.basename(croppedImage));
                // console.log("Pushed Image: ", path.basename(croppedImage));
                img.push(items.filename)
            }
            console.log("Final Image Array: ", image);

           
            
            
            await productSchema.updateOne({_id : req.params.id},
                {$set : {
                product : req.body.productName,
                category : req.body.categoryName,
                size : (productData.size)? productData.size : req.body.size,
                color : req.body.colour,
                price : req.body.price,
                stock : req.body.stock,
                description : req.body.description,
                image : img,
    
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
     postSearch : async (req,res) => {
        try {
            const value = req.body.value
            const searchData = await categorySchema.find({$or : [{categoryName}]})
            
        } catch (error) {
            console.log("Error in search "+error);
        }
     },
   

}