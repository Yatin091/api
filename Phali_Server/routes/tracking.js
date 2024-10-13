const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// External URL to fetch bus data
const BUS_DATA_URL = 'https://vahantrack.com/api/api.php?api=user&ver=1.0&key=BF6548F8AB41D209BE9E2857F0F06939&cmd=OBJECT_GET_LOCATIONS,864943043343140;864943043343801';

// Corrected paths to the data folder
const trackFilePath = path.join(__dirname, '..', 'data', 'track.json');
const userDataFilePath = path.join(__dirname, '..', 'data', 'data.json');

// Helper function to save data to a JSON file
const saveBusDataToFile = (data) => {
    fs.writeFileSync(trackFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Function to fetch bus data from the external API
const fetchAndSaveBusData = async () => {
    try {
        const response = await axios.get(BUS_DATA_URL);
        const busData = response.data;

        // Save the fetched data to track.json
        saveBusDataToFile(busData);
        // console.log('Bus data successfully updated');
    } catch (error) {
        console.error('Error fetching bus data:', error.message);
    }
};

// Refresh bus data every 11 seconds
setInterval(fetchAndSaveBusData, 11000);

// API to get bus details based on email and bus number (from user data)
router.post('/get-bus-data', (req, res) => {
    const { email, busNo } = req.body;

    if (!email || !busNo) {
        return res.status(400).json({ message: 'Email and Bus Number are required' });
    }

    try {
        // Read the user data from the data.json file
        const userData = JSON.parse(fs.readFileSync(userDataFilePath, 'utf-8'));

        // Find the user by email and busNo
        const user = userData.users.find(u => u.email === email && u.busNo === busNo);

        if (!user) {
            return res.status(404).json({ error: 'No user found with the provided email and bus number' });
        }

        // Read the bus data from the track.json file
        const busData = JSON.parse(fs.readFileSync(trackFilePath, 'utf-8'));

        // Ensure busData is an array or convert it
        const buses = Array.isArray(busData) ? busData : Object.values(busData);

        // Find the bus by busNo
        const filteredBus = buses.find(bus => bus.name === busNo || bus.name.includes(busNo));

        if (!filteredBus) {
            return res.status(404).json({ error: 'Bus not found' });
        }

        // Return the bus data
        res.json(filteredBus);
    } catch (error) {
        console.error('Error reading data:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;