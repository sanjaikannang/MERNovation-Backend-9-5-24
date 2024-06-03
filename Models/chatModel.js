import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const messageSchema = new Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  content: {
    type: String,
    required: true
  },
  
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Message = model('Message', messageSchema);

export default Message;
