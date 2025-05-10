const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  issueTitle: {
    type: String,
    required: true,
    trim: true,
    maxLength: 255,
  },
  issueDescription: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // You can add more fields as needed, such as:
  // priority: {
  //   type: String,
  //   enum: ['low', 'medium', 'high'],
  //   default: 'medium',
  // },
  // assignedTo: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User', // Assuming you have a User model
  // },
  // comments: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Comment', // Assuming you have a Comment model
  // }],
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;