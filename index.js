const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const bodyParser = require('body-parser');

// Database connection
const mongoose = require('mongoose');
mongoose
  .connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>console.log('Connected to database.'))
  .catch(e=>console.log("No connection to database.",e));

const Schema = mongoose.Schema;

let userSchema = new Schema({
  username: { type: String, required: true },
  count: Number,
 log: [{
      description: String,
  duration: Number,
  date: Date
 }]
});
let User = mongoose.model('User', userSchema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
