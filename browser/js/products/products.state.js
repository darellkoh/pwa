app.config(function($stateProvider){

	$stateProvider.state('products', {
		url: '/products',
		params: { categoryID: -1 },
		templateUrl: '/js/products/products.html',
		controller: 'ProductsCtrl',
		resolve: {
			products: function(ProductsFactory){
				return ProductsFactory.getAll();
			},
			categories: function(categoryFactory){
				return categoryFactory.getAll();
			},
			cart: function(OrderFactory){
				OrderFactory.setShowCart(false);
			}
		}
	});
});

app.config(function($stateProvider){

	$stateProvider.state('singleProduct', {
		url: '/products/:id',
		templateUrl: '/js/products/product.html',
		controller: 'singleProductCtrl',
		resolve: {
			product: function($stateParams, ProductsFactory){
				return ProductsFactory.getOne($stateParams.id);
			},
			categories: function(categoryFactory){
				return categoryFactory.getAll();
			},
			cart: function(OrderFactory){
				OrderFactory.setShowCart(false);
			},
      reviews: function(ReviewsFactory,$stateParams){
        return ReviewsFactory.getOne($stateParams.id);
      }
		}
	});

});
