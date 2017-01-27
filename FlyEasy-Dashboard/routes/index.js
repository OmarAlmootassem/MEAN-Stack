var express = require('express');
var mongoose = require('mongoose');
var Plane = mongoose.model("Plane");
var Flight = mongoose.model('Flight');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/fleet', function(req, res){
	Plane.find(function(err, data){
		if (err) throw err;
		res.json(data);
	});
});

router.get('/fleet/:id', function(req, res){
	Plane.findOne({_id: req.params.id}, function(err, data){
		if (err) throw err;
		res.json(data);
	});
});

router.post('/fleet', function(req, res, next){
	var plane  = new Plane(req.body);

	plane.save(function(err, plane){
		if (err) throw err;
		res.json(plane);
	});
});

router.delete('/fleet/:id', function(req, res){
	Plane.remove({_id: req.params.id}, function(err){
		res.json({result: err ? 'error' : 'ok'});
	});
});

router.post('/fleet/:id', function(req, res){
	Plane.findOne({_id: req.params.id}, function (err, data){
		var plane = data;
		plane.name = req.body.name;
		plane.airport = req.body.airport;
		plane.category = req.body.category;
		plane.numSeats = req.body.numSeats;
		plane.pricePerHour = req.body.pricePerHour;
		plane.save(function(err, data){
			if (err) throw err;
			res.json(data);
		});
	});
});

router.get('/flights', function(req, res){
	Flight.find(function(err, data){
		if (err) throw err;
		res.json(data);
	});
});

router.get('/flights/:id', function(req, res){
	Flight.findOne({_id: req.params.id}, function(err, data){
		if (err) throw err;
		res.json(data);
	});
});

router.post('/flights', function(req, res, next){
	var flight  = new Flight(req.body);

	flight.save(function(err, flight){
		if (err) throw err;
		res.json(flight);
	});
});

router.delete('/flights/:id', function(req, res){
	Flight.remove({_id: req.params.id}, function(err){
		res.json({result: err ? 'error' : 'ok'});
	});
});

router.post('/flights/:id', function(req, res){
	Flight.findOne({_id: req.params.id}, function (err, data){
		var flight = data;
		flight.airplane = req.body.airplane;
		flight.departureDate = req.body.departureDate;
		flight.departureAirport = req.body.departureAirport;
		flight.arrivalAirport = req.body.arrivalAirport;
		flight.price = req.body.price;
		flight.save(function(err, data){
			if (err) throw err;
			res.json(data);
		});
	});
});

router.param('plane', function(req, res, next, id){
	var query = Plane.findById(id);

	query.exec(function(err, plane){
		if (err) return next(err);
		if (!plane) return next(new Error("Can't find plane"));

		req.plane = plane;
		return next();
	});
});

module.exports = router;
