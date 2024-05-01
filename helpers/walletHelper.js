const walletSchema = require('../models/walletModel')

async function checkWallet(userId, orderTotal) {
  try {
    const userWallet = await walletSchema.findOne({ userId: userId });

    if (userWallet && userWallet.wallet >= orderTotal) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error checking wallet balance:', error);
    return false;
  }
}

module.exports = checkWallet;