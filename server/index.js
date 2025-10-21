const express = require('express')
const app = express()
const port = 3000
const cors = require('cors');
const morgan = require('morgan');



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(morgan("tiny"));




app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});