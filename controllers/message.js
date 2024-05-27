const express = require('express');
const router = express.Router();
const passport = require('passport');
const Message = require('../models/message');

// Get messages for a user, grouped by thread
router.get('/:userId', passport.authenticate('jwt', { session: false }), (req, res) => {
  Message.find({ $or: [{ sender: req.params.userId }, { recipient: req.params.userId }] })
    .populate('sender recipient', 'name email')
    .exec((err, messages) => {
      if (err) return res.status(500).json({ message: 'Internal server error' });

      // Group messages by threadId
      const threads = messages.reduce((acc, message) => {
        if (!acc[message.threadId]) {
          acc[message.threadId] = [];
        }
        acc[message.threadId].push(message);
        return acc;
      }, {});

      res.json(threads);
    });
});

// Send a new message
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { sender, recipient, content, threadId } = req.body;

  if (!sender || !recipient || !content || !threadId) {
    return res.status(400).json('All fields are required');
  }

  const newMessage = new Message({
    sender,
    recipient,
    content,
    threadId
  });

  newMessage.save()
    .then(message => res.json(message))
    .catch(err => {
      console.error('Error saving message:', err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

module.exports = router;
