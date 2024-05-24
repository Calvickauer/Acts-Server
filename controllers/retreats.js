const express = require('express');
const router = express.Router();
const Retreat = require('../models/retreat');

// Get all retreats
router.get('/', (req, res) => {
    Retreat.find()
        .then(retreats => res.json(retreats))
        .catch(err => res.status(500).json(err));
});

// Add a new retreat
router.post('/', (req, res) => {
    const newRetreat = new Retreat(req.body);
    newRetreat.save()
        .then(retreat => res.json(retreat))
        .catch(err => res.status(500).json(err));
});

module.exports = router;
