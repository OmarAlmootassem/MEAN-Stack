var mongoose = require('mongoose');

var Schema = new mongoose.Schema({
  airplane: String,
  departureDate: Date,
  departureAirport: String,
  arrivalAirport: String,
  price: {type: Number, default: 0}
});

mongoose.model('Flight', Schema);