var app = angular.module('FlyEasy Dashboard', ['ngMaterial']);

app.controller('MainCtrl', function($scope, fleet, flights, $mdDialog, $mdToast){

	$scope.newAircraft = {};
	$scope.newFlight = {};
	$scope.fleetList = [];
	$scope.flightList = [];

	fleet.getAll()
		.success(function(response){
			for (var i = 0; i < response.length; i++){
				$scope.fleetList.push(response[i]);
			}
		});

	flights.getAll()
		.success(function(response){
			for (var i = 0; i < response.length; i++){
				$scope.flightList.push(response[i]);
			}
		});
	
	$scope.addNewAircraft = function(){
		console.log("Add Aircraft");
		fleet.create($scope.newAircraft)
			.success(function(response){
				console.log(response);
				$scope.fleetList.push(response);
				$scope.newAircraft = {};
			});
	}

	$scope.editAircraft = function(ev, plane, field){
		console.log(field);

		if (field == "name" || field == "airport"){
			$mdDialog.show({
				locals: {field: field, plane: plane},
				clickOutsideToClose: true,
				templateUrl: 'templates/dialogs/dialog-text.ejs',
				controller: mdPlaneDialogCtrl
			});
		} else if (field == "category"){
			$mdDialog.show({
				locals: {field: field, plane: plane},
				clickOutsideToClose: true,
				templateUrl: 'templates/dialogs/dialog-select.ejs',
				controller: mdPlaneDialogCtrl
			});
		} else if (field == "numSeats"){
			$mdDialog.show({
				locals: {field: field, plane: plane},
				clickOutsideToClose: true,
				templateUrl: 'templates/dialogs/dialog-num.ejs',
				controller: mdPlaneDialogCtrl
			});
		} else if (field == "pricePerHour"){
			$mdDialog.show({
				locals: {field: field, plane: plane},
				clickOutsideToClose: true,
				templateUrl: 'templates/dialogs/dialog-dec.ejs',
				controller: mdPlaneDialogCtrl
			});
		}
	};

	var mdPlaneDialogCtrl = function($scope, field, plane){
		$scope.field = field;
		$scope.plane = plane;
		$scope.info = plane[field];

		$scope.saveInfo = function(){
			console.log($scope.plane);
			plane[field] = $scope.info;
			fleet.update($scope.plane)
				.success(function(response){
					console.log(response);
					$mdDialog.cancel();
				});
		}

		$scope.cancel = function(){
			$mdDialog.cancel();
		}
	}

	var mdFlightDialogCtrl = function($scope, field, flight){
		$scope.field = field;
		$scope.flight = flight;
		$scope.info = flight[field];

		$scope.saveInfo = function(){
			console.log($scope.plane);
			flight[field] = $scope.info;
			flights.update($scope.flight)
				.success(function(response){
					console.log(response);
					$mdDialog.cancel();
				});
		}

		$scope.cancel = function(){
			$mdDialog.cancel();
		}
	}

	$scope.deleteAircraft = function(plane, index){
		var confirm = $mdDialog.confirm()
			.title("Are you Sure?")
			.ariaLabel("Delete confirmation")
			.ok("Delete")
			.cancel("Cancel");

		$mdDialog.show(confirm).then(function(){
			fleet.remove(plane)
				.success(function(response){
					console.log(response);
					$scope.fleetList.splice(index, 1);
				});
		});
		 
	}

	$scope.deleteFlight = function(flight, index){
		var confirm = $mdDialog.confirm()
			.title("Are you Sure?")
			.ariaLabel("Delete confirmation")
			.ok("Delete")
			.cancel("Cancel");

		$mdDialog.show(confirm).then(function(){
			flights.remove(flight)
				.success(function(response){
					console.log(response);
					$scope.flightList.splice(index, 1);
				});
		});
	}

	$scope.editFlight = function(ev, flight, field){
		console.log(field);

		if (field == "departureAirport" || field == "arrivalAirport"){
			$mdDialog.show({
				locals: {field: field, flight: flight},
				clickOutsideToClose: true,
				templateUrl: 'templates/dialogs/dialog-text.ejs',
				controller: mdFlightDialogCtrl
			});
		} else if (field == "airplane"){
			$mdDialog.show({
				locals: {field: field, flight: flight},
				clickOutsideToClose: true,
				templateUrl: 'templates/dialogs/dialog-select-airplane.ejs',
				controller: mdFlightDialogCtrl
			});
		} else if (field == "departureDate"){
			$mdDialog.show({
				locals: {field: field, flight: flight},
				clickOutsideToClose: true,
				templateUrl: 'templates/dialogs/dialog-date.ejs',
				controller: mdFlightDialogCtrl
			});
		} else if (field == "price"){
			$mdDialog.show({
				locals: {field: field, flight: flight},
				clickOutsideToClose: true,
				templateUrl: 'templates/dialogs/dialog-dec.ejs',
				controller: mdFlightDialogCtrl
			});
		}
	}

	$scope.addNewFlight = function(){
		console.log("Add Flight");
		flights.create($scope.newFlight)
			.success(function(response){
				console.log(response);
				$scope.flightList.push(response);
				$scope.newFlight = {};
			});
	}
});

app.factory('fleet', function($http){
	var o = {
		fleet: []
	};

	o.getAll = function(){
		return $http.get('/fleet')
			.success(function(data){
				angular.copy(data, o.fleet);
			});
	}

	o.create = function(plane){
		return $http.post('/fleet', plane)
			.success(function(data){
				o.fleet.push(data);
			});
	}

	o.remove = function(plane){
		return $http.delete('/fleet/' + plane._id);
	}

	o.update = function(plane){
		return $http.post('/fleet/' + plane._id, plane)
			.success(function(data){

			});
	}

	return o;
});

app.factory('flights', function($http){
	var o = {
		fleet: []
	};

	o.getAll = function(){
		return $http.get('/flights')
			.success(function(data){
				angular.copy(data, o.fleet);
			});
	}

	o.create = function(flight){
		return $http.post('/flights', flight)
			.success(function(data){
				o.fleet.push(data);
			});
	}

	o.remove = function(flight){
		return $http.delete('/flights/' + flight._id);
	}

	o.update = function(flight){
		return $http.post('/flights/' + flight._id, flight)
			.success(function(data){

			});
	}

	return o;
});