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
    res.sendFile(path.join(__dirname, 'public', 'static', 'cloudflare.html'));
    //res.sendFile(path.join(__dirname, 'public', 'vue-app', 'index.html'));
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

app.post('/submit', async (req, res) => {
    const { token, email } = req.body;

    // Your secret key from Cloudflare
    const TURNSTILE_SECRET_KEY = '<TURNSTILE_SECRET_KEY>';

    // Verify the token with Cloudflare
    const formData = new URLSearchParams();
    formData.append('secret', TURNSTILE_SECRET_KEY);
    formData.append('response', token);

    try {
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        console.log('Token verification response:', data, email);

        if (data.success) {
            // Token is valid, process the form submission
            // Add your business logic here
            res.json({ success: true, message: 'Verification successful' });
        } else {
            // Token verification failed
            res.json({ success: false, message: 'Verification failed', errors: data['error-codes'] });
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
