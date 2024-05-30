const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/user');
const Retreat = require('../models/retreat');

// @route POST /users/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    user = new User({ name, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    res.json({ user });
  } catch (err) {
    console.error('Error signing up user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// @route POST /users/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email or Password is incorrect' });
    }
    const payload = { id: user.id, email: user.email, name: user.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token: `Bearer ${token}`, userData: payload });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// @route GET /users/profile
router.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
      const user = await User.findById(req.user.id).populate('retreats').select('-password');
      res.json(user);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // router.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  //   try {
  //     // Ensure req.user.id is available
  //     if (!req.user || !req.user.id) {
  //       return res.status(400).json({ message: 'Invalid user ID' });
  //     }
  
  //     const user = await User.findById(req.user.id).select('-password');
  //     if (!user) {
  //       return res.status(404).json({ message: 'User not found' });
  //     }
  
  //     // Fetch full retreat details for each retreat ID stored in user profile
  //     const retreats = await Promise.all(user.retreats.map(async retreatId => {
  //       const retreat = await Retreat.findById(retreatId);
  //       if (!retreat) {
  //         console.error(`Retreat not found for ID: ${retreatId}`);
  //       }
  //       return retreat;
  //     }));
  
  //     // Filter out any null retreats (in case some were not found)
  //     const validRetreats = retreats.filter(retreat => retreat !== null);
  
  //     // Include retreat details in the response
  //     res.json({ ...user.toObject(), retreats: validRetreats });
  //   } catch (err) {
  //     console.error('Error fetching user profile:', err);
  //     res.status(500).json({ message: 'Internal server error' });
  //   }
  // });

// @route POST /users/profile
router.post('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { bio, profilePicture } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (bio) user.profile.bio = bio;
    if (profilePicture) user.profile.profilePicture = profilePicture;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
