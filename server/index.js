const express = require('express')
const app = express()
const port = 3000
const cors = require('cors');
const morgan = require('morgan');

const db = require('./configs/mongodb');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("tiny"));



app.use('/api/', require('./routes/routes'));






db.on('connected', () => {
  console.log('MongoDB connected successfully');
});

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});