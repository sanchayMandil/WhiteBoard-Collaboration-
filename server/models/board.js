const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Untitled',
  },
  layers: [
    {
      id:{
        type:String,
        required: true,
      },name:{
        type:String,
        require:true,
      },lines:[],
      isVisible:{
        type:Boolean,
        require:true,
      }
    }
  ],
  creatorEmail: {
    type: String,
    required: true, // Ensure every whiteboard is tied to a user
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('board',boardSchema);