app.service('OrderFactory', function($http){
  var showCart = false;
  var order = [];
  console.log("HERE ORDER")
  var self = this;

    this.sendCartToSession = function(order){
      console.log("order!!!!", order)
      $http.post('/api/orders/?sessionSave=true', order)
      .then(function(orderConf){
      })
    }
    this.getSessionCart = function(){
      return $http.get('/sessionCart')
      .then(function(cart){
       if(cart.data.length > 0)
        order = cart.data
      })
    }
    this.addToCart = function(product){
      if(!product.qty){
        product.qty = 1;
      }else{
        product.qty++;
        return;
      }
      order.push(product);
      self.sendCartToSession(order);
    }
    this.removeFromCart = function(product){
      var index = order.map(function(item){
        return item.id
      }).indexOf(product.id);
      order.splice(index, 1);
      self.sendCartToSession(order);
    }
    this.totalQuantity = function(){
      var subTotal = order.reduce(function(prev, cur){
        var subTotalLine = cur.qty;
        prev += subTotalLine;
        return prev;
      },0)
      return subTotal;
    }
    this.getSubTotal= function(){
      var subTotal = order.reduce(function(prev, cur){
        var subTotalLine = cur.qty * cur.price;
        prev += subTotalLine;
        return prev;
      },0)
      return subTotal;
    }
    this.increaseQty = function(product){
      console.log("THIS", this)
      product.qty++;
      self.sendCartToSession(order);
    }
    this.decreaseQty = function(product){
      if(product.qty > 0){
        product.qty--;
        self.sendCartToSession(order);
      }
      if(product.qty === 0){
        delete product.qty;
        self.removeFromCart(product);
        self.sendCartToSession(order);
      }

    }
    this.getCart =  function(){
      return order;
    }
    this.getShowCart = function(){
      return showCart;
    }
    this.toggleShowCart = function(){
      if(showCart === false){
        showCart = true;
      } else {
        showCart = false;
      }
    }
    this.setShowCart = function(value){
      if(value === undefined){
        value = !showCart;
      }else{
        showCart = value;
      }
    }
    this.submitOrder = function(cb){
      console.log('submitting order');
      if(order.length === 0){
        return;
      } else {
          $http.post('/api/orders', order)
          .then(function(response){
            console.log('orderrrrr', order);
            if(response.status === 201){
              order = [];
              cb();
            }
          })
      }
    }
})
