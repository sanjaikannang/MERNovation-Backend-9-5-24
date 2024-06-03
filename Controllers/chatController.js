import Message from '../Models/chatModel.js';

// Get messages for a specific user (farmer or buyer)
export const getMessages = async (req, res) => {
    const userId = req.user._id; // Get the userId from the authenticated user
    try {
      // Fetch messages where the authenticated user is either the sender or the receiver
      const messages = await Message.find({
        $or: [
          { sender: userId },
          { receiver: userId }
        ]
      })
      .populate('sender', 'name role')
      .populate('receiver', 'name role')
      .sort({ timestamp: 1 });
  
      res.status(200).json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Post a new message from farmer or buyer
  export const postMessage = async (req, res) => {
    const { content, receiverId } = req.body;
    const userId = req.user._id; // Get the userId from the authenticated user
  
    try {
      const message = new Message({
        sender: userId,
        receiver: receiverId,
        content
      });
      await message.save();
      res.status(201).json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Post a reply message from admin
export const postAdminReply = async (req, res) => {
  const { userId } = req.params;
  const { content } = req.body; // Only need content from the request body
  try {
      // Ensure the user is an admin
      if (req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Forbidden' });
      }

      // Assuming the receiver is the user with the ID in the request parameters
      const receiverId = userId;

      const message = new Message({
          sender: req.user._id, // Admin's ID
          receiver: receiverId,
          content
      });
      await message.save();
      res.status(201).json(message);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
};

  
  // Get all messages for admin
  export const getAllMessages = async (req, res) => {
    try {
      // Ensure the user is an admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }
  
      const messages = await Message.find()
      .populate('sender', 'name role')
      .populate('receiver', 'name role')
      .sort({ timestamp: 1 });
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };


// Get messages for a specific user
export const getUserMessages = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch messages where the authenticated user is either the sender or the receiver
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    })
    .populate('sender', 'name role')
    .populate('receiver', 'name role')
    .sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
