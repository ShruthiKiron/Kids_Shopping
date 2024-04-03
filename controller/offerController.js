const offerSchema = require('../models/offermodel')
module.exports = {
    getOffer : async(req,res) =>{
        try {
            const offerData = await offerSchema.find()
            res.render('admin/offers',{offers : offerData})
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
                const offerData = new offerSchema({
                    name : req.body.name,
                    offerType : req.body.offerType,
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
}