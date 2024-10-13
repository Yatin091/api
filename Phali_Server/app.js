const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const jwt = require('jsonwebtoken'); // Import the jsonwebtoken library
const authRoutes = require('./routes/auth');
const forgotPasswordRoutes = require('./routes/forgotPassword'); // Import the forgot password routes
const changePassword = require('./routes/change-password')
const tracking = require('./routes/tracking');
const register = require('./routes/register')
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Use the authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', forgotPasswordRoutes); // Use the forgot password routes
app.use('/api/auth',changePassword);
app.use('/api/auth',tracking);
app.use('/api/auth',register);
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});