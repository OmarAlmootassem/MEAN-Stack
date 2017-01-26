var app = angular.module('FlyEasy Dashboard', ['ngMaterial']);

app.controller('MainCtrl', function($scope, fleet){

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

	$scope.deleteAircraft1 = function(plane, index){
		// console.log(plane);
		console.log("Deleting: " + index);
		$scope.fleetList.splice(index, 1);
		$scope.$applyAsync();
		// console.log(index);
		// fleet.remove(plane)
		// 	.success(function(response){
		// 		$scope.fleet.splice(index, 1);
		// 		console.log($scope.fleet);
		// 		$scope.$applyAsync();
		// 	});
	}

	$scope.deleteAircraft = function(rows){
		console.log(rows);

		 fleet.remove(rows[0][0].attributes.editableField)
		 .success(function(response){
		 	console.log(response);
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
		return $http.delete('/fleet/' + plane)
			.success(function(data){
				angular.copy(data, o.fleet);
			});
	}

	return o;
});