
app.directive( 'ordersView', function(){
	return {
		restrict: 'E',
		templateUrl: 'js/Order/ordersView.html',
		controller: function($scope, OrdersFactory){
			
			OrdersFactory.getAll()
			.then(function(orders){
				$scope.orders = orders;
			})
			
		}
	}
})