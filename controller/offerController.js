const offerSchema = require('../models/offermodel')
const categorySchema = require('../models/categoryModel')
const productSchema = require('../models/productModel')
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
    }
    
}