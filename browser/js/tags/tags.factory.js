'use strict'

app.factory( 'tagsFactory', function($http, $log){

	var service = {};

		service.getAll = function(){
			return $http.get('/api/tags')
					.then(function(response){
						return response.data;
					})
		}

	return service;
});