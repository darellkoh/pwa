app.directive('orderItem', function(OrderFactory){
  return {
    restrict: 'E',
    scope:{
      product: "="
    },
    template: `
      <!-- Item -->
      <div class="row">

        <div class="col-md-2" >
          <a href="shop-single.html" class="item-thumb">
            <span><img style="height:50px; width:50px" src="{{product.photo}}" alt="Item"></span>
          </a>
        </div>

        <div class="col-md-3">
          <h3 class="item-title"><a href="shop-single.html">{{product.name}}</a></h3>
        </div>

        <div class="col-md-2">
          <div class="count-input">
            <a class="incr-btn" ng-click="decreaseQty(product)" data-action="decrease" href="#">–</a>
            <input class="quantity" type="text" value="{{ product.qty }}">
            <a class="incr-btn" ng-click="increaseQty(product)" data-action="increase" href="#">+</a>
          </div>
        </div>

        <div class="col-md-1">
          <h4 class="item-price">{{ product.price | priceFilter }}</h4>
        </div>

         <div class="col-md-1"></div>

        <div class="col-md-2">
          <h4 class="item-price">{{ product.price * product.qty | priceFilter }}</h4>
        </div>

        <div class="col-md-1">

          <a ng-click="removeFromCart(product)" class="item-remove" data-toggle="tooltip" data-placement="top" title="Remove">
            <i class="material-icons remove_shopping_cart"></i>
          </a>
        </div>


      </div>
    `,
    controller: function($scope, OrderFactory){
      $scope.increaseQty = OrderFactory.increaseQty;
      $scope.decreaseQty = OrderFactory.decreaseQty;
      $scope.removeFromCart = OrderFactory.removeFromCart;
    }
  }
})
