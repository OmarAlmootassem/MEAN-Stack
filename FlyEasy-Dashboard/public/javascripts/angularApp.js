var app = angular.module('FlyEasy Dashboard', ['ngMaterial', 'ngMessages']);

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
				response[i].departureDate_formatted = moment(response[i].departureDate).format('MMMM Do YYYY');
				for (var j = 0; j < $scope.fleetList.length; j++){
					if ($scope.fleetList[j]._id == response[i].airplane){
						response[i].airplane_name = $scope.fleetList[j].name;
					}
				}
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

	var mdFlightDialogCtrl = function($scope, field, flight, fleet){
		$scope.field = field;
		$scope.flight = flight;
		$scope.fleet = fleet;
		$scope.info = flight[field];

		if (field == 'departureDate') $scope.info = new Date(flight[field]);

		$scope.saveInfo = function(){
			flight[field] = $scope.info;
			flight.departureDate_formatted = moment(flight.departureDate).format('MMMM Do YYYY');
			for (var j = 0; j < $scope.fleet.length; j++){
				if ($scope.fleet[j]._id == flight.airplane){
					flight.airplane_name = $scope.fleet[j].name;
				}
			}
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
		//TODO: handle deleting aircraft with flights scheduled
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
				locals: {field: field, flight: flight, fleet: $scope.fleetList},
				clickOutsideToClose: true,
				templateUrl: 'templates/dialogs/dialog-text.ejs',
				controller: mdFlightDialogCtrl
			});
		} else if (field == "airplane"){
			$mdDialog.show({
				locals: {field: field, flight: flight, fleet: $scope.fleetList},
				clickOutsideToClose: true,
				templateUrl: 'templates/dialogs/dialog-select-airplane.ejs',
				controller: mdFlightDialogCtrl
			});
		} else if (field == "departureDate"){
			$mdDialog.show({
				locals: {field: field, flight: flight, fleet: $scope.fleetList},
				clickOutsideToClose: true,
				templateUrl: 'templates/dialogs/dialog-date.ejs',
				controller: mdFlightDialogCtrl
			});
		} else if (field == "price"){
			$mdDialog.show({
				locals: {field: field, flight: flight, fleet: $scope.fleetList},
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
				response.departureDate_formatted = moment(response.departureDate).format('MMMM Do YYYY');
				for (var j = 0; j < $scope.fleetList.length; j++){
					if ($scope.fleetList[j]._id == response.airplane){
						response.airplane_name = $scope.fleetList[j].name;
					}
				}
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

	o.get = function(planeId){
		return $http.get('/fleet/' + planeId)
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