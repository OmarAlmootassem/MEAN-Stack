var mongoose = require('mongoose');

var Schema = new mongoose.Schema({
  name: String,
  category: String,
  numSeats: Number,
  pricePerHour: Number,
  airport: String
});

mongoose.model('Plane', Schema);