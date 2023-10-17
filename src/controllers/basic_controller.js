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
                return res.status(401).json({ message: 'User not Found! Try to Register.' });
            }

            // Compare passwords
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Password is Incorrect!' });
            }

            // Generate JWT
            const token = jwt.sign({ userId: user._id, role: user.role, email: user.email, username: user.username }, process.env.JWT_SECRET_KEY);

            res.status(200).json({ token, role: user.role });
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

    async changePassword(req, res) {
        try {
            const userId = req.userData.userId;

            const { oldPassword, newPassword } = req.body;

            const user = await user_model.findById(userId).select('_id password');

            if (!user) {
                return res.status(404).json({ message: 'User Not found' });
            }

            const passwordCompareResult = await bcrypt.compare(oldPassword, user.password);

            if (!passwordCompareResult) {
                return res.status(401).json({ message: 'Old Password is Incorrect!' });
            }

            user.password = await bcrypt.hash(newPassword, 10);

            await user.save();

            res.status(201).json({ message: 'Password Updated Succesfully!' });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }

    async forgotPassword(req, res) {
        try {
            const userInput = req.body.userInput;

            const user = await user_model.findOne({
                $or: [{ username: userInput }, { email: userInput }],
            }).select('_id username email');

            if (!user) {
                return res.status(404).json({ message: 'User Not found' });
            }

            const token = jwt.sign({ userId: user._id, email: user.email, username: user.username, date: Math.floor(Date.now() / 1000) }, process.env.JWT_SECRET_KEY);

            const resetPasswordLink = `${process.env.SERVER_URL}/basic/resetPassword?token=${token}`;

            const htmlContent = `
            <p>Hello ${user.username},</p>
            <p>You can reset your password by clicking the link below. This link will be active for only 15 minutes.</p>
            <a href="${resetPasswordLink}">Reset Password</a>`;

            let mailOptions = {
                from: process.env.NODE_MAILER_USER_EMAIL,
                to: user.email,
                subject: `Reset Password for Aniframes account for ${user.username}`,
                text: 'Hi, This is a test mail sent using Nodemailer',
                html: htmlContent,
                contentType: 'text/html', // Add this line
            };            

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });

            res.status(201).json({ message: 'You can reset your password by click on link which is sent to your registered account' });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }

    async resetPassword(req, res) {
        try {
            const token = req.query.token;

            const newPassword = req.body.newPassword;

            const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

            if (!decodedToken || !decodedToken.iat) {
                // Invalid or missing token
                return res.status(401).json({ message: 'Invalid token' });
            }

            const currentTime = Math.floor(Date.now() / 1000); // Convert current time to seconds

            const tokenCreationTime = decodedToken.iat;

            const tokenValidityPeriod = 15 * 60; // 15 minutes in seconds

            if (currentTime - tokenCreationTime > tokenValidityPeriod) {
                // Token has expired
                return res.status(401).json({ message: 'Token has expired please get a new token by doing forgot password again' });
            }

            const user = await user_model.findById(decodedToken.userId).select('_id password');

            console.log(user);

            user.password = await bcrypt.hash(newPassword, 10);

            await user.save();

            res.status(201).json({ message: 'Password Updated Succesfully!' });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }
};