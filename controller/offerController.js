const offerSchema = require('../models/offermodel')
const categorySchema = require('../models/categoryModel')
const productSchema = require('../models/productModel')
const { ObjectId } = require('mongodb')
module.exports = {
    getOffer: async (req, res,next) => {
        try {

            const offerData = await offerSchema.find()
            const categoryData = await categorySchema.find()
            const productData = await productSchema.find()
            res.render('admin/offers', { offers: offerData, category: categoryData, product: productData })
        } catch (error) {
            console.log("Error in get offer ", error);
            next(error)
        }

    },
    getAddOffers: async (req, res,next) => {
        try {
            res.render("admin/addOffers", { error: req.flash("error") });
        } catch (error) {
            console.log("Error in get add offers ", error);
            next(error)
        }

    },
    postAddOffers: async (req, res,next) => {
        try {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, "0");
            const day = String(currentDate.getDate()).padStart(2, "0");
            const formattedDate = `${year}-${month}-${day}`;
            const offer = await offerSchema.findOne({ name: req.body.name })
            if (offer) {
                req.flash("error", "Offer already exist");
                res.redirect('/addOffers')
            }
            else if (req.body.expiry < formattedDate) {
                req.flash("error", "Invalid date");
                res.redirect("/addOffers");
            }
            else if (req.body.percentage > 70) {
                req.flash("error", "Offer cannot be more than 70%");
                res.redirect("/addOffers");
            }
            else {
                console.log("offer for ", req.body.offerFor);

                const offerData = new offerSchema({
                    name: req.body.name,
                    offerType: req.body.offerType,
                    offerFor: req.body.offerFor,
                    startDate: req.body.startDate,
                    expiryDate: req.body.expiryDate,
                    percentage: req.body.percentage,
                    status: req.body.status,

                })

                await offerData.save()
                await updateProductsWithOffer(offerData.offerFor);

                res.redirect('/offers')
            }
        } catch (error) {
            console.log("Error in post add offer ", error);
            next(error)
        }

    },

    getOfferItems: async (req, res,next) => {
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
            next(error)
        }
    },


}

const updateProductsWithOffer = async (productId) => {
    try {
        const product = await productSchema.findById(productId);

        if (product) {
            const productOffer = await offerSchema.findOne({ offerFor: productId, expiry: { $gt: Date.now() } });

            if (productOffer) {
                const offerPrice = (productOffer.percentage * product.price) / 100;
                const priceAfterDiscount = product.price - offerPrice;

                product.offerPrice = product.price;
                product.price = priceAfterDiscount;

                await product.save();

                console.log("Product updated successfully with offer. New price:", product.price);
            } else {
                console.log("No offer found for product:", productId);
            }
        } else {
            const categoryOffer = await offerSchema.findOne({ offerFor: productId, expiryDate: { $gt: new Date() } });
            console.log("Cat off ", categoryOffer);
            if (categoryOffer) {
                const category = await categorySchema.findById(productId);
                const categoryName = category.categoryName;
                console.log("name ", categoryName);

                const productsToUpdate = await productSchema.find({ category: categoryName });
                for (const productToUpdate of productsToUpdate) {
                    console.log("price ", productToUpdate.price);
                    const offerPrice = (categoryOffer.percentage * productToUpdate.price) / 100;
                    const priceAfterDiscount = productToUpdate.price - offerPrice;

                    productToUpdate.offerPrice = productToUpdate.price;
                    productToUpdate.price = priceAfterDiscount;
                    await productToUpdate.save();
                }

                console.log(`Updated prices for products in category: ${categoryName}`);
            } else {
                console.log("No offer found for category:", productId);
            }
        }

    } catch (error) {
        console.error("Error updating product with offer:", error);
    }
};


