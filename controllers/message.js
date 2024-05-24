const express = require('express');
const router = express.Router();
const passport = require('passport');
const Message = require('../models/message');

// Get messages for a user
router.get('/:userId', passport.authenticate('jwt', { session: false }), (req, res) => {
    Message.find({ $or: [{ sender: req.params.userId }, { recipient: req.params.userId }] })
      .populate('sender recipient', 'name email')
      .then(messages => res.json(messages))
      .catch(err => res.status(500).json(err));
  });
  
  // Send a new message
  router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const newMessage = new Message(req.body);
    newMessage.save()
      .then(message => res.json(message))
      .catch(err => res.status(500).json(err));
  });
module.exports = router;
