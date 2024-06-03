import Shipping from '../Models/shippingModel.js';

// Controller function to post shipping update using product ID
export const postShippingUpdate = async (req, res) => {
  try {
    const { productId, stage } = req.body;

    if (!stage) {
      return res.status(400).json({ message: 'Stage is required' });
    }

    // Create a new shipping update document
    const newShippingUpdate = new Shipping({
      productId,
      stage,
    });

    // Save the shipping update to the database
    await newShippingUpdate.save();

    res.status(201).json({ message: 'Shipping update posted successfully', shippingUpdate: newShippingUpdate });
  } catch (error) {
    console.error('Error posting shipping update:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



// Controller function to get shipping updates for a product
export const getShippingUpdatesForProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Find all shipping updates for the specified product
    const shippingUpdates = await Shipping.find({ productId });

    if (!shippingUpdates) {
      return res.status(404).json({ message: 'No shipping updates found for the product' });
    }

    res.status(200).json({ shippingUpdates });
  } catch (error) {
    console.error('Error getting shipping updates:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
