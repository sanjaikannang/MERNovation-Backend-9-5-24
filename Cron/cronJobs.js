import cron from 'node-cron';
import Product from '../Models/productModel.js';
import { sendWinningBidEmail } from '../Utils/emailService.js';

// Function to schedule cron job
export const scheduleCronJob = () => {
  // Schedule cron job to check for ended bids every minute
  cron.schedule('* * * * *', async () => {
    try {
      console.log('Checking for ended bids...');

      // Find all products where bidding time has ended and bidding status is not 'Bidding Ended'
      const products = await Product.find({
        bidEndTime: { $lt: new Date(new Date().getTime() + (330 * 60 * 1000)) },
        biddingStatus: { $ne: 'Bidding Ended' }
      }).populate('highestBid.bidder'); // Populate the bidder field to get email

      // Iterate over products and send email to the winning bidder
      for (const product of products) {
        console.log(`Bidding time has ended for product ${product._id}. Sending email to the winning bidder...`);

        // Check if highestBid and bidder fields are populated
        if (!product.highestBid || !product.highestBid.bidder) {
          console.error('Highest bid or bidder not found for product:', product._id);
          continue;
        }

        // Update product bidding status to indicate bidding has ended
        product.biddingStatus = 'Bidding Ended';
        await product.save();

        // Send email to the winning bidder
        await sendWinningBidEmail(product.highestBid.bidder.email, product);
      }
    } catch (error) {
      console.error('Error checking for ended bids:', error);
    }
  });
};
