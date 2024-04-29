const walletSchema = require('../models/walletModel')

async function checkWallet(userId, orderTotal) {
    try {
      // Find the user's wallet document
      const userWallet = await walletSchema.findOne({ userId: userId });
  
      // Check if the user's wallet balance is sufficient
      if (userWallet && userWallet.wallet >= orderTotal) {
        return true; // Sufficient balance
      } else {
        return false; // Insufficient balance
      }
    } catch (error) {
      console.error('Error checking wallet balance:', error);
      return false; // Error occurred
    }
  }
  
  module.exports = checkWallet;