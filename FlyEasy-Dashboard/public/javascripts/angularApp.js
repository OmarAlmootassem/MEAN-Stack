var app = angular.module('FlyEasy Dashboard', ['ngMaterial', 'ngMessages']);

app.controller('MainCtrl', function($scope, fleet, flights, $mdDialog, $mdToast){

	$scope.newAircraft = {};
	$scope.newFlight = {};
	$scope.fleetList = [];
	$scope.flightList = [];

	//Get all planes and save in $scope.fleetList
	fleet.getAll()
		.success(function(response){
			for (var i = 0; i < response.length; i++){
				$scope.fleetList.push(response[i]);
			}
		});

	//Get all flights and save in $scope.flightList
	flights.getAll()
		.success(function(response){
			for (var i = 0; i < response.length; i++){
				response[i].departureDate_formatted = moment(response[i].departureDate).format('MMMM Do YYYY');	//Format date
				//Get aircraft name from airplane in response
				for (var j = 0; j < $scope.fleetList.length; j++){
					if ($scope.fleetList[j]._id == response[i].airplane){
						response[i].airplane_name = $scope.fleetList[j].name;
					}
				}
				$scope.flightList.push(response[i]);
			}
		});
	
	/**
	 *	Adds new aircraft to the db
	 */
	$scope.addNewAircraft = function(){
		fleet.create($scope.newAircraft)
			.success(function(response){
				console.log(response);
				$scope.fleetList.push(response);
				$scope.newAircraft = {};
			});
	}

	/**
	 *	Adds a new flight to the db
	 */
	$scope.addNewFlight = function(){
		flights.create($scope.newFlight)
			.success(function(response){
				console.log(response);
				response.departureDate_formatted = moment(response.departureDate).format('MMMM Do YYYY');	//Formats the date
				//Gets the aircraft name
				for (var j = 0; j < $scope.fleetList.length; j++){
					if ($scope.fleetList[j]._id == response.airplane){
						response.airplane_name = $scope.fleetList[j].name;
					}
				}
				$scope.flightList.push(response);
				$scope.newFlight = {};
			});
	}

	/**
	 * Edits a field in the aircraft db
	 */
	$scope.editAircraft = function(ev, plane, field){
		if (field == "name" || field == "airport"){	//If field is a text field
			$mdDialog.show({
				locals: {field: field, plane: plane, flights: $scope.flightList},
				clickOutsideToClose: true,
				templateUrl: 'templates/dialogs/dialog-text.ejs',
				controller: mdPlaneDialogCtrl
			});
		} else if (field == "category"){	//If field is a select field
			$mdDialog.show({
				locals: {field: field, plane: plane, flights: $scope.flightList},
				clickOutsideToClose: true,
				templateUrl: 'templates/dialogs/dialog-select.ejs',
				controller: mdPlaneDialogCtrl
			});
		} else if (field == "numSeats"){	//If field is a numeric field with a step of 1
			$mdDialog.show({
				locals: {field: field, plane: plane, flights: $scope.flightList},
				clickOutsideToClose: true,
				templateUrl: 'templates/dialogs/dialog-num.ejs',
				controller: mdPlaneDialogCtrl
			});
		} else if (field == "pricePerHour"){	//If field is a numeric field with a step of 0.01
			$mdDialog.show({
				locals: {field: field, plane: plane, flights: $scope.flightList},
				clickOutsideToClose: true,
				templateUrl: 'templates/dialogs/dialog-dec.ejs',
				controller: mdPlaneDialogCtrl
			});
		}
	};

	/**
	 *	Edits a field in the flights db
	 */
	$scope.editFlight = function(ev, flight, field){
		console.log(field);

		if (field == "departureAirport" || field == "arrivalAirport"){	//If field is a text field
			$mdDialog.show({
				locals: {field: field, flight: flight, fleet: $scope.fleetList},
				clickOutsideToClose: true,
				templateUrl: 'templates/dialogs/dialog-text.ejs',
				controller: mdFlightDialogCtrl
			});
		} else if (field == "airplane"){	//If field is a selection field
			$mdDialog.show({
				locals: {field: field, flight: flight, fleet: $scope.fleetList},
				clickOutsideToClose: true,
				templateUrl: 'templates/dialogs/dialog-select-airplane.ejs',
				controller: mdFlightDialogCtrl
			});
		} else if (field == "departureDate"){	//If field is a date field
			$mdDialog.show({
				locals: {field: field, flight: flight, fleet: $scope.fleetList},
				clickOutsideToClose: true,
				templateUrl: 'templates/dialogs/dialog-date.ejs',
				controller: mdFlightDialogCtrl
			});
		} else if (field == "price"){	//If field is a numeric field with a step of 0.01
			$mdDialog.show({
				locals: {field: field, flight: flight, fleet: $scope.fleetList},
				clickOutsideToClose: true,
				templateUrl: 'templates/dialogs/dialog-dec.ejs',
				controller: mdFlightDialogCtrl
			});
		}
	}

	/**
	 *	Deletes the aircraft from the db
	 */
	$scope.deleteAircraft = function(plane, index){
		var flightsList = [];
		var flightIndex = [];

		//Check if there are any flights scheduled for that aircraft
		for (var i = 0; i < $scope.flightList.length; i++){
			if (plane._id == $scope.flightList[i].airplane){
				flightsList.push($scope.flightList[i]);
				flightIndex.push(i);
			} 
		}

		console.log(flightsList);
		console.log(flightIndex);

		//If no flights are scheduled, then procede with simple confirmation dialog
		if (flightsList.length == 0){
			var confirm = $mdDialog.confirm()
				.title("Are you sure?")
				.ariaLabel("Delete confirmation")
				.ok("Delete")
				.cancel("Cancel");

			//On confirmation, delete the aircraft from the db
			$mdDialog.show(confirm).then(function(){
				fleet.remove(plane)
					.success(function(response){
						console.log(response);
						$scope.fleetList.splice(index, 1);
					});
			});
		} else {
			//If there are flights scheduled for that aircraft, show more information in confirmation dialog
			var confirmFlights = $mdDialog.confirm()
				.title("Are you sure? There " + (flightsList.length == 1 ? "is " : "are ") + flightsList.length + (flightsList.length == 1? " flight" : " flights") + " for this plane.")
				.textContent("Deleting this plane will delete the assigned flights.")
				.ariaLabel("Delete confirmation")
				.ok("Delete")
				.cancel("Cancel");

			//On confirmation, delete all the flights for the plane then delete the plane
			$mdDialog.show(confirmFlights).then(function(){
				for (var i = 0; i < flightsList.length; i++){
					flights.remove(flightsList[i]);
				}
			fleet.remove(plane)
				.success(function(response){
					console.log(response);
					$scope.fleetList.splice(index, 1);
					//Remove flights from flightList
					for (var i = flightIndex.length - 1; i >= 0; i--){
						$scope.flightList.splice(flightIndex[i], 1);
					}
				});
			});
		}		 
	}

	/**
	 *	Deletes the flight from the db with a confirmation dialog
	 */
	$scope.deleteFlight = function(flight, index){
		var confirm = $mdDialog.confirm()
			.title("Are you sure?")
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

	/**
	 *	Controller for mdDialog used to edit fleet information
	 */
	var mdPlaneDialogCtrl = function($scope, field, plane, flights){
		$scope.field = field;
		$scope.plane = plane;
		$scope.info = plane[field];
		$scope.flights = flights;

		/**
		 *	Updates the db entry and closes the dialog
		 */
		$scope.saveInfo = function(){

			if (field == 'name'){
				//Update the name for any scheduled flights
				for (var i = 0; i < flights.length; i++){
					if (plane._id == flights[i].airplane){
						flights[i].airplane_name = $scope.info;
					} 
				}
			}

			plane[field] = $scope.info;
			fleet.update($scope.plane)
				.success(function(response){
					$mdDialog.cancel();
				});
		}

		/**
		 *	Closes the dialog
		 */
		$scope.cancel = function(){
			$mdDialog.cancel();
		}
	}

	/**
	 *	Controller for mdDialog used to edit flight information
	 */
	var mdFlightDialogCtrl = function($scope, field, flight, fleet){
		$scope.field = field;
		$scope.flight = flight;
		$scope.fleet = fleet;
		$scope.info = flight[field];

		//If the edited field is a date field, then create a new date object
		if (field == 'departureDate') $scope.info = new Date(flight[field]);

		/**
		 *	Updates the db entry and closes the dialog
		 */
		$scope.saveInfo = function(){
			flight[field] = $scope.info;
			flight.departureDate_formatted = moment(flight.departureDate).format('MMMM Do YYYY');	//Format the date
			//Get the aircraft name
			for (var j = 0; j < $scope.fleet.length; j++){
				if ($scope.fleet[j]._id == flight.airplane){
					flight.airplane_name = $scope.fleet[j].name;
				}
			}
			// Update the db
			flights.update($scope.flight)
				.success(function(response){
					$mdDialog.cancel();
				});
		}

		/**
		 *	Closes the dialog
		 */
		$scope.cancel = function(){
			$mdDialog.cancel();
		}
	}
});

app.factory('fleet', function($http){
	var o = {
		fleet: []
	};

	//Gets all the planes from /fleet
	o.getAll = function(){
		return $http.get('/fleet')
			.success(function(data){
				angular.copy(data, o.fleet);
			});
	}

	//Gets single plane from /fleet/:id
	o.get = function(planeId){
		return $http.get('/fleet/' + planeId)
			.success(function(data){
				angular.copy(data, o.fleet);
			});
	}

	//Creates a new plane in /fleet
	o.create = function(plane){
		return $http.post('/fleet', plane)
			.success(function(data){
				o.fleet.push(data);
			});
	}

	//Removes a plane from /fleet/:id
	o.remove = function(plane){
		return $http.delete('/fleet/' + plane._id);
	}

	//Updates a plane in /fleet/:id
	o.update = function(plane){
		return $http.post('/fleet/' + plane._id, plane);
	}

	return o;
});

app.factory('flights', function($http){
	var o = {
		flights: []
	};

	//Gets all flights from /flights
	o.getAll = function(){
		return $http.get('/flights')
			.success(function(data){
				angular.copy(data, o.flights);
			});
	}

	//Creates a new flight in /flights
	o.create = function(flight){
		return $http.post('/flights', flight)
			.success(function(data){
				o.flights.push(data);
			});
	}

	//Removes a flight from /flights/:id
	o.remove = function(flight){
		return $http.delete('/flights/' + flight._id);
	}

	//Updates a flights in /flights/:id
	o.update = function(flight){
		return $http.post('/flights/' + flight._id, flight);
	}

	return o;
});