app.controller( 'orderDetailsCtrl', function($scope, $stateParams, orderDetailsFactory) {

	orderDetailsFactory.getOrderById($stateParams.id)
	.then(function(order){

		$scope.order = order;
		$scope.orderItems = order.orderItems;

		$scope.orderTotal = function(){
			return $scope.orderItems.reduce( function(prev, curr){
				prev += curr.productCost;
				return prev;
			}, 0);
		}


	});
	
});