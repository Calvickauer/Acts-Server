const express = require('express');
const router = express.Router();
const passport = require('passport');
const Message = require('../models/message');

// Fetch messages for a user
router.get('/:userId', passport.authenticate('jwt', { session: false }), (req, res) => {
  Message.find({ $or: [{ sender: req.params.userId }, { recipient: req.params.userId }] })
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .then(messages => res.json(messages))
    .catch(err => res.status(400).json(err));
});

// Send a message
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const newMessage = new Message({
    sender: req.body.sender,
    recipient: req.body.recipient,
    content: req.body.content,
  });

  newMessage.save()
    .then(message => res.json(message))
    .catch(err => res.status(400).json(err));
});

module.exports = router;
