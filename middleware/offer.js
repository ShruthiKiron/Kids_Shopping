const offerSchema = require('../models/offermodel')
const productSchema = require('../models/productModel')


const checkOfferExpiry = async (req, res, next) => {
    try {
        const currentDate = new Date();
        const expiredOffers = await offerSchema.find({ expiryDate: { $lte: currentDate } });

        if (expiredOffers.length > 0) {
            for (const offer of expiredOffers) {
                offer.status = false;
                await offer.save();

                const productsToUpdate = await productSchema.find({ offerFor: offer._id });

                for (const product of productsToUpdate) {
                    product.price = product.offerPrice; 
                    product.offerPrice = 0; 
                    await product.save();
                }
            }
            console.log("Expired offers and associated products updated successfully.");
        } else {
            console.log("No expired offers found.");
        }

        next();
    } catch (error) {
        console.error('Error checking offer expiry:', error);
        return res.json({ error: 'Internal Server Error' });
    }
};

module.exports = checkOfferExpiry;