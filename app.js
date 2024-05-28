require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const messageRoutes = require('./controllers/message');
const retreatsRoutes = require('./controllers/retreats');
require('./config/passport')(passport);

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(passport.initialize());

app.use('/messages', messageRoutes);
app.use('/retreats', retreatsRoutes); 

const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;
mongoose.connect(MONGO_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;

db.once('open', () => {
  console.log(`Connected to MongoDB at HOST: ${db.host} and PORT: ${db.port}`);
});

db.on('error', (error) => {
  console.log(`Database Error: ${error}`);
});

app.get('/', (req, res) => {
  res.json({ name: 'MERN Auth API', greeting: 'Welcome to our API', author: 'YOU', message: "Smile, you are being watched by the Backend Engineering Team" });
});

app.use('/examples', require('./controllers/example'));
app.use('/users', require('./controllers/user'));

const server = app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));

module.exports = server;
