app.config(function($stateProvider){
	$stateProvider.state( 'orderDetails', {
		url: '/order/:id',
		template: '<order-details></order-details>',
		controller: 'orderDetailsCtrl'
	})
})