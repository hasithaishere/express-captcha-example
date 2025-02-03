// Project structure:
// - server.js
// - public/
//   - index.html

const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

// Replace with your reCAPTCHA secret key
const RECAPTCHA_SECRET_KEY = '<RECAPTCHA_SECRET_KEY>';

// Middleware
app.use(express.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Serve the frontend
app.get('/', (req, res) => {
    //res.sendFile(path.join(__dirname, 'public', 'static', 'index.html'));
    res.sendFile(path.join(__dirname, 'public', 'vue-app', 'index.html'));
});

// Signup API endpoint
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password, recaptchaToken } = req.body;

        // Verify reCAPTCHA
        const recaptchaResponse = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
        );

        if (!recaptchaResponse.data.success) {
            return res.status(400).json({ error: 'Invalid captcha' });
        }

        // Here you would typically:
        // 1. Validate user input
        // 2. Hash the password
        // 3. Save to database
        // For this example, we'll just send back success

        console.log('Signup successful:', name, email, password);

        res.json({ 
            success: true, 
            message: 'Signup successful' 
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            error: 'Server error' 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
