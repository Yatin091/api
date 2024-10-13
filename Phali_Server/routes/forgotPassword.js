const express = require('express');
const fs = require('fs');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); // For generating OTP

const router = express.Router();

// Load user data from the data folder
const loadUserData = () => {
    const data = fs.readFileSync('./data/data.json');
    return JSON.parse(data);
};

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: '9020recordskalra@gmail.com',
        pass: 'vfjpnzcnottebxff'
    },
    connectionTimeout: 10000, // 10 seconds
});

// Generate OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString(); // Generates a random 6-digit OTP
};

// Store OTP and verification status in-memory (or use a database for persistence)
let otpStore = {};
let otpVerifiedStatus = {};

// Send OTP API
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const usersData = loadUserData();
    const user = usersData.users.find(user => user.email === email);

    if (user) {
        const otp = generateOTP();
        otpStore[email] = otp; // Store the OTP for the email
        otpVerifiedStatus[email] = false; // Reset OTP verified status

        // Send the OTP via email
        const mailOptions = {
            from: '9020recordskalra@gmail.com',
            to: email,
            subject: 'Your OTP for Password Reset',
            text: `Your OTP is ${otp}`,
        };

        try {
            await transporter.sendMail(mailOptions); // Use async/await
            res.status(200).json({ message: 'OTP sent to your email' });
        } catch (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'Error sending email' });
        }
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Verify OTP API
router.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (otpStore[email] && otpStore[email] === otp) {
        otpVerifiedStatus[email] = true; // Set OTP verification status to true
        delete otpStore[email]; // OTP is valid, remove it from store
        res.status(200).json({ message: 'OTP verified successfully' });
    } else {
        res.status(400).json({ message: 'Invalid OTP' });
    }
});

// Reset Password API
router.post('/reset-password', (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    // Check if OTP was verified
    if (!otpVerifiedStatus[email]) {
        return res.status(403).json({ message: 'OTP not verified. Please verify OTP before resetting password.' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    const usersData = loadUserData();
    const userIndex = usersData.users.findIndex(user => user.email === email);

    if (userIndex !== -1) {
        usersData.users[userIndex].password = newPassword; // Update the password
        fs.writeFileSync('./data/data.json', JSON.stringify(usersData, null, 2)); // Save updated data in a readable format

        otpVerifiedStatus[email] = false; // Reset OTP verification status after successful password reset
        res.status(200).json({ message: 'Password reset successfully' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

module.exports = router;