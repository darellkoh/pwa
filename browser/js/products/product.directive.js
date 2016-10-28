'use strict'

app.directive('product', function(){
	return {
		restrict: 'E',
		scope: {
			product: "=",
			sale: '='
		},
		template: `
			<div class="col-lg-4 col-md-4 col-sm-6" >
			  <div class="shop-item">

			    <div class="shop-thumbnail">
			      <!-- <span class="shop-label text-danger">Sale</span> -->
            <a ui-sref='singleProduct({id: product.id})' class="item-link"></a>
			      <img src="{{product.photo}}" alt="Shop item"  style="min-width:150px;min-height:150px">
			      <div class="shop-item-tools">
			        <a href="#" class="add-to-whishlist" data-toggle="tooltip" data-placement="top" title="Wishlist">
			          <i class="material-icons favorite_border"></i>
			        </a>
			        <a ng-click="addToCart(product)" class="add-to-cart">
			          <em>Add to Cart</em>
			          <svg x="0px" y="0px" width="32px" height="32px" viewBox="0 0 32 32">
			            <path stroke-dasharray="19.79 19.79" stroke-dashoffset="19.79" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="square" stroke-miterlimit="10" d="M9,17l3.9,3.9c0.1,0.1,0.2,0.1,0.3,0L23,11"/>
			          </svg>
			        </a>
			      </div>
			    </div>
			    <div class="shop-item-details">
			      <h3 class="shop-item-title"><a href="shop-single.html">{{product.name}}</a></h3>
			      <span class="shop-item-price">
			        {{ product.price | priceFilter }}
			      </span>
			    </div>
			  </div><!-- .shop-item -->
			</div><!-- .col-md-4.col-sm-6 -->
		`,
	 controller: function($scope, OrderFactory) {
    $scope.addToCart = function(product){
    var showCart = OrderFactory.getShowCart();
    //if(showCart){
    	OrderFactory.setShowCart(true);
      OrderFactory.addToCart(product);
      OrderFactory.setShowCart(true);
      //OrderFactory.toggleShowCart();
  //   }else{
  //     OrderFactory.setShowCart(false);
  //     OrderFactory.addToCart(product);
  //     OrderFactory.toggleShowCart();
		// }
	}
	}
	}
})
