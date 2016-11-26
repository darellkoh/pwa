app.directive('order', function(OrderFactory, ProductsFactory){
  return {
    restrict: 'E',
    scope: {
    },
    controller: function($scope){
      $scope.subTotal = OrderFactory.getSubTotal;
    },
    link: function(scope){
      scope.cart = OrderFactory.getCart;
      scope.submitOrder = OrderFactory.submitOrder;
      scope.makeItRain = makeItRain;

      function makeItRain(){
        angular.element("#botImageEnd").css({
          "animation": "stephRoll 2s linear",
        })

        angular.element('#money').css({
          "display": "block",
          "background-image": "url('dollars/dollar01.png'), url('dollars/dollar02.png'), url('dollars/dollar03.png')",
          "animation": "snow 3s linear",
          "-webkit-animation": "snow 3s linear",
          "z-index": "980"
        })
        setTimeout(function(){
          angular.element("#money").hide();
        },3000)
      }
    }
  }
})





