var express = require('express');
var mongoose = require('mongoose');
var Plane = mongoose.model("Plane");
var Flight = mongoose.model('Flight');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/fleet', function(req, res, next){
	Plane.find(function(err, fleet){
		if (err) return next(err);

		res.json(fleet);
	});
});

router.post('/fleet', function(req, res, next){
	var plane  = new Plane(req.body);

	plane.save(function(err, plane){
		if (err) return next(err);

		res.json(plane);
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
