const jwt = require('jsonwebtoken');
const users = require("../models/users");

const secretKey ='SaaS';

function generateToken(user) {
    const payload = {
        email: user.email,
        username: user.username,
    };
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

async function loginVerify(req, res) {
    const { email, password } = req.body;
    const query = { email: email };
    try {
        const userResult = await users.findOne(query);
        if (!userResult) {
            return res.status(401).json({ error: 'Invalid User' }); // User not found
        }

        if (userResult.password === password) {
            // User is valid
            const userData = {
                email: userResult.email,
                username: userResult.username
            };
            const token = generateToken(userData);
            return res.status(200).json({ token: token }); // Send token in the response body
        } else {
            // User password is incorrect
            return res.status(401).json({ error: 'Incorrect password' }); // Send error as JSON
        }
    } catch (err) {
        console.error("Error during login:", err);
        return res.status(500).json({ error: 'Login failed' }); // Send a more general error
    }
}

function authenticationToken(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('Access Denied: No token provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send('Access Denied: Invalid token format');
    }

    try {
        const verified = jwt.verify(token, secretKey);
        req.user = verified;
        next(); // Proceed to the next middleware/route handler
    } catch (err) {
        return res.status(400).send('Invalid token');
    }
}
async function register(req, res) {
      const { username, email, password } = req.body;
      await users.create(req.body)
        .then((user) => res.json(user))
        .catch((err) => res.status(500).json(err));
}

module.exports = { authenticationToken, loginVerify, register };