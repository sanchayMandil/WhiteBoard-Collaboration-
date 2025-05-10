const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  whiteboard_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  inviteLink: { type: String, required: true, unique: true },
  participants: [{ email: { type: String, required: true } }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Room', roomSchema);