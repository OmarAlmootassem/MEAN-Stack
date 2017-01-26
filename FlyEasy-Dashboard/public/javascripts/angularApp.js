var app = angular.module('FlyEasy Dashboard', ['ngMaterial']);

app.controller('MainCtrl', function($scope, fleet, $mdDialog){

	$scope.newAircraft = {};
	$scope.fleetList = [];

	fleet.getAll()
		.success(function(response){
			// console.log(response);
			console.log("Init add");
			for (var i = 0; i < response.length; i++){
				$scope.fleetList.push(response[i]);
			}
		});
	
	$scope.addNewAircraft = function(){
		// console.log($scope.newAircraft);
		console.log("Adding");
		fleet.create($scope.newAircraft)
			.success(function(response){
				console.log(response);
				$scope.fleetList.push(response);
				$scope.newAircraft = {};
			});
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

	return o;
});