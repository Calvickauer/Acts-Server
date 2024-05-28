require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { JWT_SECRET } = process.env;
const User = require('../models/user');

router.get('/test', (req, res) => {
    res.json({ message: 'User endpoint OK! ✅' });
});

router.post('/signup', (req, res) => {
    console.log('===> Inside of /signup');
    console.log('===> /register -> req.body', req.body);

    User.findOne({ email: req.body.email })
    .then(user => {
        if (user) {
            return res.status(400).json({ message: 'Email already exists' });
        } else {
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            });

            bcrypt.genSalt(10, (err, salt) => {
                if (err) throw Error;

                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) console.log('==> Error inside of hash', err);
                    newUser.password = hash;
                    newUser.save()
                    .then(createdUser => res.json({ user: createdUser }))
                    .catch(err => {
                        console.log('Error with creating new user', err);
                        res.json({ message: 'Error occurred... Please try again.' });
                    });
                });
            });
        }
    })
    .catch(err => { 
        console.log('Error finding user', err);
        res.json({ message: 'Error occurred... Please try again.' });
    });
});

router.post('/login', async (req, res) => {
    console.log('===> Inside of /login');
    console.log('===> /login -> req.body', req.body);

    const foundUser = await User.findOne({ email: req.body.email });

    if (foundUser) {
        let isMatch = await bcrypt.compare(req.body.password, foundUser.password);
        console.log('Does the passwords match?', isMatch);
        if (isMatch) {
            const payload = {
                id: foundUser.id,
                email: foundUser.email,
                name: foundUser.name
            };

            jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
                if (err) {
                    res.status(400).json({ message: 'Session has ended, please log in again' });
                }
                res.json({ success: true, token: `Bearer ${token}`, userData: payload });
            });

        } else {
            return res.status(400).json({ message: 'Email or Password is incorrect' });
        }
    } else {
        return res.status(400).json({ message: 'User not found' });
    }
});

router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
    User.findById(req.user.id)
      .select('-password')
      .populate('retreats')
      .then(user => res.json(user))
      .catch(err => res.status(400).json(err));
});

router.post('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { bio, profilePicture } = req.body;
    User.findByIdAndUpdate(req.user.id, { $set: { 'profile.bio': bio, 'profile.profilePicture': profilePicture } }, { new: true })
      .select('-password')
      .populate('retreats')
      .then(user => res.json(user))
      .catch(err => res.status(400).json(err));
});

module.exports = router;
