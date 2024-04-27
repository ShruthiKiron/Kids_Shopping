const offerSchema = require('../models/offermodel')
const categorySchema = require('../models/categoryModel')
const productSchema = require('../models/productModel')
const {ObjectId} = require('mongodb')
module.exports = {
    getOffer : async(req,res) =>{
        try {
            
            const offerData = await offerSchema.find()
            const categoryData = await categorySchema.find()
            const productData = await productSchema.find()
            res.render('admin/offers',{offers : offerData,category : categoryData,product : productData})
        } catch (error) {
            console.log("Error in get offer ",error);
        }

    },
    getAddOffers : async(req,res) =>{
        try {
            res.render("admin/addOffers", { error: req.flash("error") });
        } catch (error) {
            console.log("Error in get add offers ",error);
        }

    },
    postAddOffers : async(req,res)=>{
        try {
            const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
            const offer = await offerSchema.findOne({name : req.body.name})
            if(offer){
                req.flash("error", "Offer already exist");
            res.redirect('/addOffers')
            }
            else if(req.body.expiry < formattedDate){
                req.flash("error", "Invalid date");
        res.redirect("/addOffers");
            }
            else if(req.body.percentage > 70){
                req.flash("error", "Offer cannot be more than 70%");
        res.redirect("/addOffers");
            }
            else { 
                console.log("offer for ",req.body.offerFor);

                const offerData = new offerSchema({
                    name : req.body.name,
                    offerType : req.body.offerType,
                    offerFor : req.body.offerFor,
                    startDate : req.body.startDate,
                    expiryDate : req.body.expiryDate,
                    percentage : req.body.percentage,
                    status : req.body.status,

                })
                
                await offerData.save()
                await updateProductsWithOffer(offerData.offerFor);
               
                res.redirect('/offers')
            }
        } catch (error) {
            console.log("Error in post add offer ",error);
        }

    },
    
    getOfferItems: async (req, res) => {
        try {
            const offerType = req.query.offerType;
            let items;
            if (offerType === 'Product Offer') {
                items = await productSchema.find();
            } else if (offerType === 'Category Offer') {
                items = await categorySchema.find();
            }
            if (items) {
                res.json(items);
            } else {
                console.log("No items found for the offer type:", offerType);
                res.status(404).json({ error: 'No items found for the offer type' });
            }
        } catch (error) {
            console.log("Error in fetching offer items:", error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    
}
const updateProductsWithOffer = async (productId) => {
    try {
        const product = await productSchema.findById(productId);
       
        if(product){
            const productOffer = await offerSchema.findOne({ offerFor: productId });
            if (productOffer) {
                const offerPrice = (productOffer.percentage * product.price) / 100;
                const priceAfterDiscount = product.price - offerPrice;
                product.offerPrice = priceAfterDiscount;
                console.log("Offer price for product: ", product.offerPrice);
                
            }
            await product.updateOne({_id : productId},{$set : {offerPrice : product.offerPrice}});
        console.log("Product updated successfully with offer.");
        }
        
        else{
            const categoryOffer = await offerSchema.findOne({ offerFor: productId });
            if (categoryOffer) {
                const cat = await categorySchema.findOne({_id : new ObjectId(productId) })
               
                const pro = await productSchema.find({category : cat.categoryName})
                console.log("pro ",pro);
                // console.log("cat ",cat);
                console.log(categoryOffer);
                for (const pros of pro) {
                 let offerPrice = (pros.price * categoryOffer.percentage);
                 pros.offerPrice = pros.offerPrice/100
                     const priceAfterDiscount = pros.price - pros.offerPrice;
                     console.log(priceAfterDiscount);
                    pros.offerPrice = priceAfterDiscount;
                    console.log(`Offer price for product ${pros._id} with category offer: ${offerPrice}`);
        await pros.save();
                
                }
                }
             
        }
        
   
    } catch (error) {
        console.error("Error updating product with offer:", error);
    }
};
