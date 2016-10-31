app.factory( 'orderDetailsFactory', function($http){
	var services = {};

		services.getOrderById = function(id){
			return $http.get('api/orders/' + id)
					.then(function(response){
						return response.data;
					})
		}

	return services;
})