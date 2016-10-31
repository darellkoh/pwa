
// TODO : HAVE THIS STATE LOAD FOR AN ADMIN WHEN AN ORDERS BUTTON IS CLICKED
// VIA UI-SREF
app.config( function($stateProvider){
	$stateProvider.state( 'userOrders', {
		url: 'orders',
		template: '<order-view></order-view>'
	})
});
