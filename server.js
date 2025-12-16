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

/**
 * @api {get} /health Health Check
 * @apiName GetHealth
 * @apiGroup Server
 *
 * @apiSuccess {String} status Status of the server.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "ok"
 *     }
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

/**
 * @api {get} /ip Get Client IP
 * @apiName GetIp
 * @apiGroup Server
 *
 * @apiSuccess {String} ip The client's IP address.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "ip": "::1"
 *     }
 */
app.get('/ip', (req, res) => {
    res.json({ ip: req.ip });
});

/**
 * @api {get} /ipinfo Get Client IP Info
 * @apiName GetIpInfo
 * @apiGroup Server
 *
 * @apiSuccess {Object} data Information about the client's IP address from ipinfo.io.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "ip": "8.8.8.8",
 *       "hostname": "dns.google",
 *       "city": "Mountain View",
 *       "region": "California",
 *       "country": "US",
 *       "loc": "37.4056,-122.0775",
 *       "org": "AS15169 Google LLC",
 *       "postal": "94043",
 *       "timezone": "America/Los_Angeles"
 *     }
 * @apiError {String} error Error message.
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "Error fetching IP info"
 *     }
 */
app.get('/ipinfo', async (req, res) => {
    try {
        const ip = req.ip;
        const response = await axios.get(`https://ipinfo.io/${ip}/json`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching IP info:', error);
        res.status(500).json({ error: 'Error fetching IP info' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
