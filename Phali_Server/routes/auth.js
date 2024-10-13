const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken'); // Import the jsonwebtoken library

const router = express.Router();

// Load user data from the data folder
const loadUserData = () => {
    const data = fs.readFileSync('./data/data.json');
    return JSON.parse(data);
};

// Secret key for JWT
const SECRET_KEY = 'your_secret_key'; // Change this to a strong secret

// Login API
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Load users
    const usersData = loadUserData();
    const users = usersData.users;

    // Check for user credentials
    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        // Create a token
        const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' }); // Token expires in 1 hour

        // Send user data along with the token
        res.status(200).json({
            message: 'Login successful',
            user: {
                name: user.name,
                username: user.username,
                phone: user.phone,
                email: user.email,
                vehicleName: user.vehicleName,
                startDate: user.startDate,
                expireDate: user.expireDate,
                address: user.address,
                busNO: user.busNO

            },
            token // Send the token to the client
        });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
});

module.exports = router; // Export the router