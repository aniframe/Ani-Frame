const user_model = require('../models/user_model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: process.env.NODE_MAILER_EMAIL_SERVICE, // Use your email service provider
    auth: {
        user: process.env.NODE_MAILER_USER_EMAIL,
        pass: process.env.NODE_MAILER_APP_PASSWORD,
    },
});

module.exports = class Basic {
    async base_url(req, res) {
        res.send('Welcome to Ani-Frame base url');
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Find user by email
            const user = await user_model.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Authentication failed' });
            }

            // Compare passwords
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Authentication failed' });
            }

            // Generate JWT
            const token = jwt.sign({ userId: user._id, role: user.role, email: user.email, username: user.username }, process.env.JWT_SECRET_KEY);

            res.status(200).json({ token });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }

    async register(req, res) {
        try {
            const { username, email, password } = req.body;

            // Check if user already exists
            const existingUser = await user_model.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ message: 'User already exists' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user
            const user = new user_model({
                username,
                email,
                password: hashedPassword,
                role: 'customer', // Set default role
                cart: [],
                orders: [],
                addresses: []
            });

            const mailOptions = {
                from: process.env.NODE_MAILER_USER_EMAIL,
                to: email,
                subject: 'Welcome to Ani-Frames',
                text: 'Thank you for registration with Ani-Frames',
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });

            await user.save();

            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }
};