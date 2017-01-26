var app = angular.module('FlyEasy Dashboard', ['ngMaterial', 'mdDataTable']);

app.controller('MainCtrl', function($scope, fleet){

	$scope.newAircraft = {};

	fleet.getAll()
		.success(function(response){
			console.log(response);
			$scope.fleet = response;
		});
	
	$scope.addNewAircraft = function(){
		console.log($scope.newAircraft);
		fleet.create($scope.newAircraft)
			.success(function(response){
				console.log(response);
				$scope.fleet.push(response);
				$scope.newAircraft = {};
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
		console.log(plane);
		return $http.post('/fleet', plane)
			.success(function(data){
				o.fleet.push(data);
			});
	}
	return o;
});