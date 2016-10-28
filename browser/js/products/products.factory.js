app.factory('ProductsFactory', function($http, $log){

	var services = {};

		services.getAll = function(){

			return $http.get('/api/products/')
					.then(function(response){
						return response.data;
					})
					.catch($log)
		}

		services.deleteOne = function(id){
				return $http.delete('/api/products/' + id)
								.then(function(){
									console.log('product deleted')
								})
								.catch($log)
		}

		services.createOne = function(product){
			return $http.post('/api/products/', product)
							.then(function(created){
								return created;
							})
							.catch($log)


		}

		services.updateOne = function(product){
			console.log('updaaaaaaaaaaate one', product)
			return $http.put('/api/products/' + product.id, product)
							.then(function(updatedProduct){
							console.log('updatedProduct', updatedProduct)
								return updatedProduct;
							})
							.catch($log)
		}

		services.getOne = function(id){
			return $http.get('/api/products/' + id )
						.then(function(response){
							return response.data;
						})
						.catch($log)
		}


	return services;

});
