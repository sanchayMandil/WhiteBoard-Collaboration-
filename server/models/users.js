const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required:true,
    },
    email: {
        type: String,
        required: true,  // Ensure email is required
        unique: true,    // Ensure email is unique if needed
    },
    password: {
        type: String,
        required: true,  // Password should also be required for most use cases
    },
});

const users = mongoose.model('users', userSchema);

module.exports = users;
