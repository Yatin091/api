const express = require('express');
const fs = require('fs');

const router = express.Router();

// Load user data from the data folder
const loadUserData = () => {
    const data = fs.readFileSync('./data/data.json');
    return JSON.parse(data);
};

// Save updated user data to the data file
const saveUserData = (data) => {
    fs.writeFileSync('./data/data.json', JSON.stringify(data, null, 2));
};

// Change Password API
router.post('/change-password', (req, res) => {
    const { email, currentPassword, newPassword, confirmPassword } = req.body;

    if (!email || !currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const usersData = loadUserData();
    const userIndex = usersData.users.findIndex(user => user.email === email);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }

    const user = usersData.users[userIndex];

    // Verify current password
    if (user.password !== currentPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'New passwords do not match' });
    }

    // Update password
    usersData.users[userIndex].password = newPassword;
    saveUserData(usersData); // Save updated user data

    res.status(200).json({ message: 'Password changed successfully' });
});

module.exports = router;