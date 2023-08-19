const express = require('express');
const mongoose = require('./src/config/mongoDB');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./src/models/user_model');
const nodemailer = require('nodemailer');
const cors = require('cors');

const SECRET_KEY = 'your-secret-key';

const app = express();

app.use(bodyParser.json());
app.use(cors());

const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email service provider
    auth: {
        user: 'Aniframe20@gmail.com',
        pass: 'reuhqumyfdxnxqjx',
    },
});

app.get('/', (req, res) => {
    res.send('Welcome to Ani-Frame base url');
})

// Register API
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: 'customer', // Set default role
            cart: [],
            orders: [],
            addresses: []
        });

        const mailOptions = {
            from: 'Aniframe20@gmail.com',
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
});

// Login API
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

        // Generate JWT
        const token = jwt.sign({ userId: user._id, role: user.role }, SECRET_KEY);

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.listen(3000, () => {
    console.log('server is listening on port 3000');
});