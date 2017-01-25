var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  name: String,
  category: String,
  numSeats: {type: Number, default: 0},
  pricePerHour: {type: Number, default: 0},
  airport: String
});

mongoose.model('Plane', PostSchema);