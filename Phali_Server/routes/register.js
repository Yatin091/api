const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Path to your data.json file
const dataFilePath = path.join(__dirname, '../data/data.json');

// Register route
router.post('/register', (req, res) => {
    const { name, username, phone, email, password, confirmPassword, busNO, startDate, expireDate, address } = req.body;

    // Check if all required fields are provided
    if (!name || !username || !phone || !email || !password || !confirmPassword || !busNO || !startDate || !expireDate || !address) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Read existing users from the data.json file
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading data file.' });
        }

        let usersData = JSON.parse(data);
        const newUser = {
            name,
            username,
            phone,
            email,
            password,  // Normally, you should hash the password before saving it
            busNO,
            startDate,
            expireDate,
            address
        };

        // Add the new user to the array
        usersData.users.push(newUser);

        // Write updated data back to the data.json file
        fs.writeFile(dataFilePath, JSON.stringify(usersData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error writing to data file.' });
            }

            // Return success response
            res.status(201).json({ message: 'User registered successfully!' });
        });
    });
});

module.exports = router;