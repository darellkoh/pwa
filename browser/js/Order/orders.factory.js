app.factory( 'OrdersFactory', function($http, $log){

	var services = {};

		services.getAll = function(){
			return $http.get('/api/orders')
					.then(function(response){
						return response.data;
					})
					.catch($log)
		}

	return services;
});