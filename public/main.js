'use strict';

window.app = angular.module('FullstackGeneratedApp', ['fsaPreBuilt', 'ui.router', 'ui.bootstrap', 'ngAnimate']);

app.filter('priceFilter', function () {
  return function (amount) {
    return '$' + (amount / 100).toFixed(2);
  };
});

app.config(function ($urlRouterProvider, $locationProvider) {
  // This turns off hashbang urls (/#about) and changes it to something normal (/about)
  $locationProvider.html5Mode(true);
  // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
  $urlRouterProvider.otherwise('/');
  // Trigger page refresh when accessing an OAuth route
  $urlRouterProvider.when('/auth/:provider', function () {
    window.location.reload();
  });
});

// This app.run is for controlling access to specific states.
app.run(function ($rootScope, AuthService, $state, OrderFactory, NavFactory) {

  OrderFactory.getSessionCart();
  AuthService.getLoggedInUser().then(function (user) {
    NavFactory.setUser(user);
  });

  // The given state requires an authenticated user.
  var destinationStateRequiresAuth = function destinationStateRequiresAuth(state) {
    return state.data && state.data.authenticate;
  };

  // $stateChangeStart is an event fired
  // whenever the process of changing a state begins.
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

    if (!destinationStateRequiresAuth(toState)) {
      // The destination state does not require authentication
      // Short circuit with return.
      return;
    }

    if (AuthService.isAuthenticated()) {
      // The user is authenticated.
      // Short circuit with return.
      return;
    }

    // Cancel navigating to new state.
    event.preventDefault();

    AuthService.getLoggedInUser().then(function (user) {
      // If a user is retrieved, then renavigate to the destination
      // (the second time, AuthService.isAuthenticated() will work)
      // otherwise, if no user is logged in, go to "login" state.
      if (user) {
        $state.go(toState.name, toParams);
      } else {
        $state.go('login');
      }
    });
  });
});

app.directive('order', function (OrderFactory, ProductsFactory) {
  return {
    restrict: 'E',
    scope: {},
    template: '\n     <div class="row">\n     <div class="col-md-2"><h6></h6></div>\n     <div class="col-md-3"><h6>description</h6></div>\n      <div class="col-md-2" ><h6 class="text-center">qty</h6></div>\n     <div class="col-md-1"><h6>item</h6></div>\n     <div class="col-md-1"><h6></h6></div>\n      <div class="col-md-2" ><h6>sub-total</h6></div>\n     <div class="col-md-1"><h6>remove</h6></div>\n     </div>\n\n      <order-item ng-repeat="product in cart() track by $index" product="product"></order-item>\n      <!-- Subtotal -->\n      <br>\n      <div class="cart-subtotal space-bottom">\n        <div class="column">\n          <h3 style="display: inline" class="toolbar-title">Total:</h3>\n          <h3 style="display: inline" class="amount">{{subTotal() | priceFilter }}</h3>\n        </div>\n\n       <!-- <div class="column">\n          <h3 class="amount">{{subTotal() | priceFilter }}</h3>\n        </div> -->\n      </div><!-- .subtotal -->\n      <!-- Buttons -->\n      <div class="text-right">\n        <a href="#" class="btn btn-default btn-ghost close-dropdown">Continue Shopping</a>\n        <button ng-click="submitOrder(makeItRain)" class="btn btn-primary waves-effect waves-light toggle-section">Proceed to Checkout</button>\n      </div>\n    ',
    controller: function controller($scope) {
      $scope.subTotal = OrderFactory.getSubTotal;
    },
    link: function link(scope) {
      scope.cart = OrderFactory.getCart;
      scope.submitOrder = OrderFactory.submitOrder;
      scope.makeItRain = makeItRain;

      function makeItRain() {
        angular.element("#botImageEnd").css({
          "animation": "stephRoll 2s linear"
        });

        angular.element('#money').css({
          "display": "block",
          "background-image": "url('dollars/dollar01.png'), url('dollars/dollar02.png'), url('dollars/dollar03.png')",
          "animation": "snow 3s linear",
          "-webkit-animation": "snow 3s linear",
          "z-index": "980"
        });
        setTimeout(function () {
          // angular.element("#botImageEnd").hide();
          angular.element("#money").hide();
        }, 3000);
      }
    }
  };
});

app.service('OrderFactory', function ($http) {
  var showCart = false;
  var order = [];
  console.log("HERE ORDER");
  var self = this;

  this.sendCartToSession = function (order) {
    console.log("order!!!!", order);
    $http.post('/api/orders/?sessionSave=true', order).then(function (orderConf) {});
  };
  this.getSessionCart = function () {
    return $http.get('/sessionCart').then(function (cart) {
      if (cart.data.length > 0) order = cart.data;
    });
  };
  this.addToCart = function (product) {
    if (!product.qty) {
      product.qty = 1;
    } else {
      product.qty++;
      return;
    }
    order.push(product);
    self.sendCartToSession(order);
  };
  this.removeFromCart = function (product) {
    var index = order.map(function (item) {
      return item.id;
    }).indexOf(product.id);
    order.splice(index, 1);
    self.sendCartToSession(order);
  };
  this.totalQuantity = function () {
    var subTotal = order.reduce(function (prev, cur) {
      var subTotalLine = cur.qty;
      prev += subTotalLine;
      return prev;
    }, 0);
    return subTotal;
  };
  this.getSubTotal = function () {
    var subTotal = order.reduce(function (prev, cur) {
      var subTotalLine = cur.qty * cur.price;
      prev += subTotalLine;
      return prev;
    }, 0);
    return subTotal;
  };
  this.increaseQty = function (product) {
    console.log("THIS", this);
    product.qty++;
    self.sendCartToSession(order);
  };
  this.decreaseQty = function (product) {
    if (product.qty > 0) {
      product.qty--;
      self.sendCartToSession(order);
    }
    if (product.qty === 0) {
      delete product.qty;
      self.removeFromCart(product);
      self.sendCartToSession(order);
    }
  };
  this.getCart = function () {
    return order;
  };
  this.getShowCart = function () {
    return showCart;
  };
  this.toggleShowCart = function () {
    if (showCart === false) {
      showCart = true;
    } else {
      showCart = false;
    }
  };
  this.setShowCart = function (value) {
    if (value === undefined) {
      value = !showCart;
    } else {
      showCart = value;
    }
  };
  this.submitOrder = function (cb) {
    console.log('submitting order');
    if (order.length === 0) {
      return;
    } else {
      $http.post('/api/orders', order).then(function (response) {
        console.log('orderrrrr', order);
        if (response.status === 201) {
          order = [];
          cb();
        }
      });
    }
  };
});

app.directive('orderItem', function (OrderFactory) {
  return {
    restrict: 'E',
    scope: {
      product: "="
    },
    template: '\n      <!-- Item -->\n      <div class="row">\n\n        <div class="col-md-2" >\n          <a href="shop-single.html" class="item-thumb">\n            <span><img style="height:50px; width:50px" src="{{product.photo}}" alt="Item"></span>\n          </a>\n        </div>\n\n        <div class="col-md-3">\n          <h3 class="item-title"><a href="shop-single.html">{{product.name}}</a></h3>\n        </div>\n\n        <div class="col-md-2">\n          <div class="count-input">\n            <a class="incr-btn" ng-click="decreaseQty(product)" data-action="decrease" href="#">–</a>\n            <input class="quantity" type="text" value="{{ product.qty }}">\n            <a class="incr-btn" ng-click="increaseQty(product)" data-action="increase" href="#">+</a>\n          </div>\n        </div>\n\n        <div class="col-md-1">\n          <h4 class="item-price">{{ product.price | priceFilter }}</h4>\n        </div>\n\n         <div class="col-md-1"></div>\n\n        <div class="col-md-2">\n          <h4 class="item-price">{{ product.price * product.qty | priceFilter }}</h4>\n        </div>\n\n        <div class="col-md-1">\n\n          <a ng-click="removeFromCart(product)" class="item-remove" data-toggle="tooltip" data-placement="top" title="Remove">\n            <i class="material-icons remove_shopping_cart"></i>\n          </a>\n        </div>\n\n\n      </div>\n    ',
    controller: function controller($scope, OrderFactory) {
      $scope.increaseQty = OrderFactory.increaseQty;
      $scope.decreaseQty = OrderFactory.decreaseQty;
      $scope.removeFromCart = OrderFactory.removeFromCart;
    }
  };
});

app.factory('OrdersFactory', function ($http, $log) {

  var services = {};

  services.getAll = function () {
    return $http.get('/api/orders').then(function (response) {
      return response.data;
    }).catch($log);
  };

  return services;
});

app.directive('ordersView', function () {
  return {
    restrict: 'E',
    templateUrl: 'js/Order/ordersView.html',
    controller: function controller($scope, OrdersFactory) {

      OrdersFactory.getAll().then(function (orders) {
        $scope.orders = orders;
      });
    }
  };
});

// TODO : HAVE THIS STATE LOAD FOR AN ADMIN WHEN AN ORDERS BUTTON IS CLICKED
// VIA UI-SREF
app.config(function ($stateProvider) {
  $stateProvider.state('userOrders', {
    url: 'orders',
    template: '<order-view></order-view>'
  });
});

app.config(function ($stateProvider) {

  // Register our *about* state.
  $stateProvider.state('about', {
    url: '/about',
    controller: 'AboutController',
    templateUrl: 'js/about/about.html'
  });
});

app.controller('AboutController', function ($scope, FullstackPics) {

  // Images of beautiful Fullstack people.
  $scope.images = _.shuffle(FullstackPics);
});

app.config(function ($stateProvider) {
  $stateProvider.state('AddProduct', {
    url: '/add-product/',
    templateUrl: '/js/admin/admin.addproduct.html',
    controller: 'AdminCtrl',
    resolve: {
      products: function products(ProductsFactory) {
        return ProductsFactory.getAll();
      },
      categories: function categories(categoryFactory) {
        return categoryFactory.getAll();
      },
      tags: function tags(tagsFactory) {
        return tagsFactory.getAll();
      }
    }
  });
});

app.config(function ($stateProvider) {
  $stateProvider.state('EditProducts', {
    url: '/edit-products/',
    templateUrl: '/js/admin/admin.editproducts.html',
    controller: 'AdminCtrl',
    resolve: {
      products: function products(ProductsFactory) {
        return ProductsFactory.getAll();
      },
      categories: function categories(categoryFactory) {
        return categoryFactory.getAll();
      },
      tags: function tags(tagsFactory) {
        return tagsFactory.getAll();
      }
    }
  });
});

app.controller('AdminCtrl', function ($scope, products, ProductsFactory, tags, category, $state) {

  $scope.products = products;
  $scope.tags = tags;
  $scope.categories = categories;

  $scope.toggleEdit = function () {
    if ($scope.edit) {
      $scope.edit = false;
    } else {
      $scope.edit = true;
    }
  };

  $scope.addNewProduct = function (product) {
    return ProductsFactory.createOne(product).then(function () {
      $state.go('EditProducts');
    });
  };

  $scope.save = function (product) {
    console.log('sssaaaveee', product);
    return ProductsFactory.updateOne(product);
  };

  $scope.deleteProduct = function (id) {
    return ProductsFactory.deleteOne(id).then(function () {
      return ProductsFactory.getAll();
    }).then(function (products) {
      console.log("PRODUCTs", products);
      $scope.products = products;
    });
  };
});

'use strict';

app.factory('categoryFactory', function ($http, $log) {

  var services = {};

  services.getAll = function () {
    return $http.get('/api/category').then(function (response) {
      return response.data;
    }).catch($log);
  };

  return services;
});
app.config(function ($stateProvider) {
  $stateProvider.state('docs', {
    url: '/docs',
    templateUrl: 'js/docs/docs.html'
  });
});

app.config(function ($stateProvider) {
  $stateProvider.state('faq', {
    url: '/faq',
    templateUrl: '/js/faq/faq.html'
  });
});

(function () {

  'use strict';

  // Hope you didn't forget Angular! Duh-doy.

  if (!window.angular) throw new Error('I can\'t find Angular!');

  var app = angular.module('fsaPreBuilt', []);

  app.factory('Socket', function () {
    if (!window.io) throw new Error('socket.io not found!');
    return window.io(window.location.origin);
  });

  // AUTH_EVENTS is used throughout our app to
  // broadcast and listen from and to the $rootScope
  // for important events about authentication flow.
  app.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  });

  app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
    var statusDict = {
      401: AUTH_EVENTS.notAuthenticated,
      403: AUTH_EVENTS.notAuthorized,
      419: AUTH_EVENTS.sessionTimeout,
      440: AUTH_EVENTS.sessionTimeout
    };
    return {
      responseError: function responseError(response) {
        $rootScope.$broadcast(statusDict[response.status], response);
        return $q.reject(response);
      }
    };
  });

  app.config(function ($httpProvider) {
    $httpProvider.interceptors.push(['$injector', function ($injector) {
      return $injector.get('AuthInterceptor');
    }]);
  });

  app.service('AuthService', function ($http, Session, $rootScope, AUTH_EVENTS, $q) {

    function onSuccessfulLogin(response) {
      var user = response.data.user;
      Session.create(user);
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
      return user;
    }

    // Uses the session factory to see if an
    // authenticated user is currently registered.
    this.isAuthenticated = function () {
      return !!Session.user;
    };

    this.getLoggedInUser = function (fromServer) {

      // If an authenticated session exists, we
      // return the user attached to that session
      // with a promise. This ensures that we can
      // always interface with this method asynchronously.

      // Optionally, if true is given as the fromServer parameter,
      // then this cached value will not be used.

      if (this.isAuthenticated() && fromServer !== true) {
        return $q.when(Session.user);
      }

      // Make request GET /session.
      // If it returns a user, call onSuccessfulLogin with the response.
      // If it returns a 401 response, we catch it and instead resolve to null.
      return $http.get('/session').then(onSuccessfulLogin).catch(function () {
        return null;
      });
    };

    this.login = function (credentials) {
      return $http.post('/login', credentials).then(onSuccessfulLogin).catch(function () {
        return $q.reject({ message: 'Invalid login credentials.' });
      });
    };

    this.logout = function () {
      return $http.get('/logout').then(function () {
        Session.destroy();
        $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
      });
    };
  });

  app.service('Session', function ($rootScope, AUTH_EVENTS) {

    var self = this;

    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
      self.destroy();
    });

    $rootScope.$on(AUTH_EVENTS.sessionTimeout, function () {
      self.destroy();
    });

    this.user = null;

    this.create = function (user) {
      this.user = user;
    };

    this.destroy = function () {
      this.user = null;
    };
  });
})();

app.config(function ($stateProvider) {
  $stateProvider.state('home', {
    url: '/',
    templateUrl: 'js/home/home.html'
  });
});

app.directive('login', function (NavFactory, AuthService, $state) {
  return {
    restrict: 'E',
    templateUrl: '/js/login/login.html',
    controller: function controller($scope) {

      $scope.login = {};
      $scope.error = null;

      // $scope.signup = NavFactory.signup;
      $scope.sendLogin = function (loginInfo) {

        $scope.error = null;

        AuthService.login(loginInfo).then(function (user) {
          NavFactory.setLoggedIn(true);
          console.log("USER FROM AUTH LOGIN IN LOGIN DIRECTIVE", user);
          NavFactory.setUser(user);
        }).catch(function () {
          $scope.error = 'Invalid login credentials.';
        });

        $scope.setSignUp = NavFactory.setSignUp;
      };
    }
  };
});

app.config(function ($stateProvider) {

  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'js/login/login.html',
    controller: 'LoginCtrl'
  });
});

app.controller('LoginCtrl', function ($scope, AuthService, $state) {

  $scope.login = {};
  $scope.error = null;

  $scope.sendLogin = function (loginInfo) {

    $scope.error = null;

    AuthService.login(loginInfo).then(function () {
      $state.go('home');
    }).catch(function () {
      $scope.error = 'Invalid login credentials.';
    });
  };
});

app.directive('signup', function (NavFactory, SignUpFactory) {
  return {
    restrict: 'E',
    templateUrl: '/js/login/signup.html',
    controller: function controller($scope) {
      $scope.sendSignUp = SignUpFactory.signUp;
      $scope.setSignUp = NavFactory.setSignUp;
    },
    link: function link(s, e, a) {}
  };
});

app.factory('SignUpFactory', function ($http, NavFactory) {
  return {
    signUp: function signUp(signUpInfo) {
      return $http.post('/api/users/', signUpInfo).then(function (user) {
        console.log("USER FROM SIGNUP", user);
        NavFactory.setLoggedIn(true);
      }).catch(function (err) {
        console.log("err", err);
      });
    }
  };
});

app.directive('userLoggedIn', function (NavFactory, AuthService) {
  return {
    restrict: 'E',
    template: '<h3>you got to the user logged in pg</h3>\n                   <div class="form-submit">\n                   <button ng-click="logOut()" type="submit" class="btn btn-primary btn-block waves-effect waves-light">Log Out</button>\n                    </div>\n\n                   <button ui-sref="EditProducts" type="submit" class="btn btn-primary btn-block waves-effect waves-light">Edit Products</button>\n                    </div>\n\n                     <button ui-sref="AddProduct" type="submit" class="btn btn-primary btn-block waves-effect waves-light">Add New Product</button>\n                    </div>\n\n                    <button ui-sref="EditUsers" type="submit" class="btn btn-primary btn-block waves-effect waves-light">Edit Users</button>\n                    </div>\n\n                    <button ui-sref="AdminGetOrders" type="submit" class="btn btn-primary btn-block waves-effect waves-light">Review Orders</button>\n                    </div>\n\n                     <button ui-sref="UserReviewPastOrders" type="submit" class="btn btn-primary btn-block waves-effect waves-light">Review Past Orders</button>\n                    </div>\n\n                    <button ui-sref="UserEditAccount" type="submit" class="btn btn-primary btn-block waves-effect waves-light">Edit Account</button>\n                    </div>\n                    ',
    controller: function controller($scope) {
      $scope.logOut = function () {
        $scope.error = null;
        AuthService.logout().then(function () {
          NavFactory.setLoggedIn(false);
        }).catch(function () {
          $scope.error = 'Invalid login credentials.';
        });
      };
    }
  };
});

app.config(function ($stateProvider) {

  $stateProvider.state('membersOnly', {
    url: '/members-area',
    template: '<img ng-repeat="item in stash" width="300" ng-src="{{ item }}" />',
    controller: function controller($scope, SecretStash) {
      SecretStash.getStash().then(function (stash) {
        $scope.stash = stash;
      });
    },
    // The following data.authenticate is read by an event listener
    // that controls access to this state. Refer to app.js.
    data: {
      authenticate: true
    }
  });
});

app.factory('SecretStash', function ($http) {

  var getStash = function getStash() {
    return $http.get('/api/members/secret-stash').then(function (response) {
      return response.data;
    });
  };

  return {
    getStash: getStash
  };
});

'use strict';

app.directive('product', function () {
  return {
    restrict: 'E',
    scope: {
      product: "=",
      sale: '='
    },
    template: '\n\t\t\t<div class="col-lg-4 col-md-4 col-sm-6" >\n\t\t\t  <div class="shop-item">\n\n\t\t\t    <div class="shop-thumbnail">\n\t\t\t      <!-- <span class="shop-label text-danger">Sale</span> -->\n            <a ui-sref=\'singleProduct({id: product.id})\' class="item-link"></a>\n\t\t\t      <img src="{{product.photo}}" alt="Shop item"  style="min-width:150px;min-height:150px">\n\t\t\t      <div class="shop-item-tools">\n\t\t\t        <a href="#" class="add-to-whishlist" data-toggle="tooltip" data-placement="top" title="Wishlist">\n\t\t\t          <i class="material-icons favorite_border"></i>\n\t\t\t        </a>\n\t\t\t        <a ng-click="addToCart(product)" class="add-to-cart">\n\t\t\t          <em>Add to Cart</em>\n\t\t\t          <svg x="0px" y="0px" width="32px" height="32px" viewBox="0 0 32 32">\n\t\t\t            <path stroke-dasharray="19.79 19.79" stroke-dashoffset="19.79" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="square" stroke-miterlimit="10" d="M9,17l3.9,3.9c0.1,0.1,0.2,0.1,0.3,0L23,11"/>\n\t\t\t          </svg>\n\t\t\t        </a>\n\t\t\t      </div>\n\t\t\t    </div>\n\t\t\t    <div class="shop-item-details">\n\t\t\t      <h3 class="shop-item-title"><a href="shop-single.html">{{product.name}}</a></h3>\n\t\t\t      <span class="shop-item-price">\n\t\t\t        {{ product.price | priceFilter }}\n\t\t\t      </span>\n\t\t\t    </div>\n\t\t\t  </div><!-- .shop-item -->\n\t\t\t</div><!-- .col-md-4.col-sm-6 -->\n\t\t',
    controller: function controller($scope, OrderFactory) {
      $scope.addToCart = function (product) {
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
      };
    }
  };
});

app.filter('categoryFilter', function () {

  return function (products, selectedCatId) {

    if (selectedCatId > 0) {
      return products.filter(function (product) {
        return product.categoryId === selectedCatId;
      });
    } else return products;
  };
});

app.controller('ProductsCtrl', function ($scope, $filter, $stateParams, products, categories, OrderFactory) {
  angular.element("#money").css({
    "display": "none"
  });

  $scope.products = products;

  $scope.categories = categories;

  $scope.categoryCount = function (categoryId) {
    var catCount = 0;

    products.forEach(function (product) {
      if (product.categoryId === categoryId) {
        catCount++;
      }
    });

    return catCount;
  };

  $scope.selectedCategoryId = $stateParams.categoryID; // Initialize to all on initial page load

  $scope.selectedCategoryStr = function () {

    return $scope.selectedCategoryId === -1 ? '' : categories[$scope.selectedCategoryId - 1].name;
  };

  $scope.filteredCategories = products;

  $scope.setSelected = function (categoryId) {
    $scope.selectedCategoryId = categoryId;
    $scope.filteredCategories = $filter("categoryFilter")(products, categoryId);
    console.log("scope filtered cats", $scope.filteredCategories);
  };

  $scope.isActive = function (id) {

    return +id === $scope.selectedCategoryId ? 'active' : '';
  };

  $scope.addToCart = function (product) {
    OrderFactory.addToCart(product);
    OrderFactory.toggleShowCart();
  };
});

app.controller('singleProductCtrl', function ($scope, categories, OrderFactory, reviews, product, ReviewsFactory) {

  $scope.product = product;
  console.log("PRODUCT", $scope.product);

  $scope.reviews = reviews;
  console.log("REVIEWS", $scope.reviews);

  $scope.getCategoryStr = function (categoryId) {
    return categories[categoryId - 1].name;
  };

  var products = [];
  for (var i = 0; i < 4; i++) {
    products.push(product);
  }

  $scope.leaveReview = {};

  $scope.submitReview = function () {
    ReviewsFactory.postOne($scope.leaveReview).then(function (review) {
      return ReviewsFactory.getOne($scope.product.id);
    }).then(function (reviews) {
      console.log("here with reviews after submit");
      $scope.reviews = reviews;
    });
  };

  $scope.addToCart = function (product) {
    var showCart = OrderFactory.getShowCart();
    console.log('SHOW CART', showCart);
    if (showCart) {
      OrderFactory.addToCart(product);
      console.log('SHOW CART whe show cart is true', showCart);
    } else {
      OrderFactory.addToCart(product);
      OrderFactory.setShowCart(true);
      console.log('SHOW CART whe show cart is false -else', showCart);
    }
  };
});

app.factory('ProductsFactory', function ($http, $log) {

  var services = {};

  services.getAll = function () {

    return $http.get('/api/products/').then(function (response) {
      return response.data;
    }).catch($log);
  };

  services.deleteOne = function (id) {
    return $http.delete('/api/products/' + id).then(function () {
      console.log('product deleted');
    }).catch($log);
  };

  services.createOne = function (product) {
    return $http.post('/api/products/', product).then(function (created) {
      return created;
    }).catch($log);
  };

  services.updateOne = function (product) {
    console.log('updaaaaaaaaaaate one', product);
    return $http.put('/api/products/' + product.id, product).then(function (updatedProduct) {
      console.log('updatedProduct', updatedProduct);
      return updatedProduct;
    }).catch($log);
  };

  services.getOne = function (id) {
    return $http.get('/api/products/' + id).then(function (response) {
      return response.data;
    }).catch($log);
  };

  return services;
});

app.config(function ($stateProvider) {

  $stateProvider.state('products', {
    url: '/products',
    params: { categoryID: -1 },
    templateUrl: '/js/products/products.html',
    controller: 'ProductsCtrl',
    resolve: {
      products: function products(ProductsFactory) {
        return ProductsFactory.getAll();
      },
      categories: function categories(categoryFactory) {
        return categoryFactory.getAll();
      },
      cart: function cart(OrderFactory) {
        OrderFactory.setShowCart(false);
      }
    }
  });
});

app.config(function ($stateProvider) {

  $stateProvider.state('singleProduct', {
    url: '/products/:id',
    templateUrl: '/js/products/product.html',
    controller: 'singleProductCtrl',
    resolve: {
      product: function product($stateParams, ProductsFactory) {
        return ProductsFactory.getOne($stateParams.id);
      },
      categories: function categories(categoryFactory) {
        return categoryFactory.getAll();
      },
      cart: function cart(OrderFactory) {
        OrderFactory.setShowCart(false);
      },
      reviews: function reviews(ReviewsFactory, $stateParams) {
        return ReviewsFactory.getOne($stateParams.id);
      }
    }
  });
});

app.directive("reviews", function () {
  return {
    restrict: "E",
    scope: {
      review: "="
    },
    template: '\n    <div class="review">\n      <div class="review-body">\n        <div class="review-meta">\n          <div class="column">\n            <h4 class="review-title">{{review.title}}</h4>\n          </div>\n          <div>\n            <review-rating rate="review.rating">\n            </review-rating>\n          </div>\n        </div>\n        <p>{{review.content}}</p>\n        <cite>{{review.user}}</cite>\n      </div>\n    </div>\n    ',
    link: function link(s, e, a) {}
  };
});

app.factory('ReviewsFactory', function ($http, $log) {

  var services = {};

  services.getAll = function () {

    return $http.get('/api/reviews/').then(function (response) {
      return response.data;
    }).catch($log);
  };

  services.getOne = function (id) {
    return $http.get('/api/reviews/' + id).then(function (response) {
      return response.data;
    }).catch(function (err) {
      if (err) {
        return [{}];
      }
    });
  };

  services.postOne = function (review) {

    console.log("REVIEW FOR POST ONE", review);
    return $http.post('/api/reviews/', review).then(function (response) {
      return response.data;
    }).catch($log);
  };

  return services;
});

app.directive("reviewLeave", function () {
  return {
    restrict: "E",
    scope: {
      submitReview: "&",
      product: "=",
      leaveReview: "="
    },
    template: '\n    <form name="review" class="row padding-top">\n      <div class="col-sm-8">\n        <div class="form-element">\n          <input type="text" ng-model="leaveReview.title" class="form-control" placeholder="Title*" required>\n        </div>\n      </div>\n      <div class="col-sm-4">\n        <div class="form-element form-select">\n          <select class="form-control" ng-model="leaveReview.rating">\n            <option value="5">5 stars</option>\n            <option value="4">4 stars</option>\n            <option value="3">3 stars</option>\n            <option value="2">2 stars</option>\n            <option value="1">1 star</option>\n          </select>\n        </div>\n      </div>\n      <div class="col-sm-12">\n        <div class="form-element">\n          <textarea rows="8" ng-model="leaveReview.content" class="form-control" placeholder="Review*" required></textarea>\n        </div>\n        <div class="row">\n          <div class="col-lg-3 col-md-4 col-sm-6 col-lg-offset-9 col-md-offset-8 col-sm-offset-6">\n            <button ng-click="submitReview()" class="btn btn-block btn-primary waves-effect waves-light space-top-none space-bottom-none">Leave Review</button>\n          </div>\n        </div>\n      </div>\n    {{user}}\n    </form>\n    ',
    link: function link(s, e, a) {
      console.log("scope!!!");
      s.leaveReview = {};
      s.leaveReview.productId = s.product.id;
    }
  };
});

app.directive("reviewRating", function () {
  return {
    restrict: "E",
    scope: {
      rate: "="
    },
    template: '\n    <div class="column pull-right">\n      <span class="product-rating text-warning">\n        <i class="material-icons star" ng-repeat="t in getTimes(rate) track by $index"></i>\n      </span>\n\n    </div>\n    ',
    link: function link(s, e, a) {
      s.getTimes = function (n) {
        return new Array(n);
      };
    }
  };
});

app.directive('chatBot', function () {
  return {
    restrict: 'E',
    template: '\n    <!-- -->\n    <div>\n        <h1 class="text-center" style="background-color: skyblue" id="botText">{{botText[selectArray]}}</h1>\n        <img style="width:350px; height:350px" id="botImage" src="chatbot/chat-0{{selectArray+1}}.png" />\n        <button style="padding:20px; margin:30px" id="botTextButton">Cilck me for help</button>\n    <div>\n    ',
    controller: function controller($scope) {
      $scope.selectArray = 0;
      $scope.getSelectArray = function () {
        return s.selectArray;
      };
      $scope.botText = ["Hi! How can I help you today", "Are you sure you don't want any help?", "Seriously if there is anything you need just hit the button", "I mean really I can do whatever for you, I'm like friggen google over here", "Ooooooooh I forgot I got this thing! Hey good luck with that!"];
      $scope.buttonText = ["Click here to start a chat!", "Are you sure no chat?", "WAS IT SOMETHING I SAID?!", "PLEASE PLEASE CLICK ME!!"];
    },
    link: function link(s, e, a) {
      $("#floatButton").on('click', function () {
        $("#chat-bot").css({
          "visibility": "visible"
        });
        $("#chat-bot").animate({ left: 350 + 'px', top: 150 + 'px' });
        $(this).css({
          "visibility": "hidden"
        });
      });
      e.on('mouseenter', function () {
        // console.log("this is e", s.botText, s.selectArray)
        var botTextLength = s.botText.length;
        if (s.selectArray < botTextLength - 2) s.selectArray++;
        angular.element('#botText').text(s.botText[s.selectArray]);
        angular.element('#botTextButton').text(s.buttonText[s.selectArray]);
        angular.element('#botImage').attr('src', 'chatbot/chat-0' + (s.selectArray + 1) + '.png');
        var dWidth = angular.element(document).width() / 10,
            // 100 = image width
        dHeight = angular.element(document).height() / 30,
            // 100 = image height
        nextX = Math.floor(Math.random() * dWidth + 100),
            nextY = Math.floor(Math.random() * dHeight + 50);
        $("#chat-bot").animate({ left: nextX + 'px', top: nextY + 'px' });
        $("#botTextButton").on('click', function () {
          s.selectArray++;
          angular.element('#botText').text(s.botText[s.selectArray]);
          console.log("botTextButton");
          if (s.selectArray === 5) {
            angular.element('#botTextButton').hide();
            angular.element('#botImage').attr('src', 'chatbot/chat-05.png');
            setTimeout(function () {

              $("#chat-bot").animate({ left: nextX + 2500 + 'px', top: nextY + 2500 + 'px' });
            }, 2500);
          }
        });
      });

      // height: ($("#chat-bot").css("height") + 50)
      e.css({
        "visibility": "hidden",
        "margin": "30px",
        "padding": "20px",
        "position": "fixed",
        "background-color": "rgba(0,0,0,0)",
        "height": "800px",
        "width": "800px",
        "top": "-1000",
        "left": "-1000",
        "z-index": "999"
      });
    }
  };
});

'use strict';

app.factory('tagsFactory', function ($http, $log) {

  var service = {};

  service.getAll = function () {
    return $http.get('/api/tags').then(function (response) {
      return response.data;
    });
  };

  return service;
});
app.directive('navBarUtil', function (OrderFactory) {
  return {
    restrict: 'A',
    link: function link(s, e, a) {
      var toolbarToggle = $('.toolbar-toggle'),
          toolbarDropdown = $('.toolbar-dropdown'),
          toolbarSection = $('.toolbar-section');

      function closeToolBox() {
        toolbarToggle.removeClass('active');
        toolbarSection.removeClass('current');
      }

      toolbarToggle.on('click', function (e) {
        console.log("this", $(this));
        console.log("this href", $(this).attr('href'));
        console.log("toolbarToggle");
        var currentValue = $(this).attr('href');
        if ($(e.target).is('.active')) {
          closeToolBox();
          toolbarDropdown.removeClass('open');
        } else {
          toolbarDropdown.addClass('open');
          closeToolBox();
          $(this).addClass('active');
          $(currentValue).addClass('current');
          if (currentValue === "#cart") {
            $('#cart-toolbar-section').addClass('current');
          }
        }
        e.preventDefault();
      });
      toolbarToggle.find("a").on('click', function (e) {
        console.log("a getting clicked");
        closeToolBox();
      });

      $('.close-dropdown').on('click', function () {
        toolbarDropdown.removeClass('open');
        toolbarToggle.removeClass('active');
        toolbarSection.removeClass('current');
      });

      var toggleSection = $('.toggle-section');

      // toggleSection.on('click', function(e) {
      //     console.log("HERE toggleSection")
      //     var currentValue = $(this).attr('href');
      //     toolbarSection.removeClass('current');
      //     $(currentValue).addClass('current');
      //     e.preventDefault();
      // });

      $('#main').on('click', function (e) {
        console.log(e.target.tagName == "EM");
        if (e.target.tagName !== "EM") {
          toolbarDropdown.removeClass('open');
          toolbarToggle.removeClass('active');
          toolbarSection.removeClass('current');
          OrderFactory.setShowCart(false);
        } else {
          console.log("else");
        }
      });
      $('#main').on('click', function (e) {
        console.log(e.target.tagName == "EM");
        closeToolBox();
        if (e.target.tagName === "EM") {
          // if ($(e.target).is('.active')) {
          //     closeToolBox();
          //     toolbarDropdown.removeClass('open');
          // } else {
          $('#cart-toolbar-toggle').addClass('active');
          $('#toolbar-dropdown-id').addClass('open');
          // closeToolBox();

          $('#cart-toolbar-section').addClass('current');
          // }
          e.preventDefault();
        }
      });
      $('.toolbar-section a').on('click', function () {
        toolbarDropdown.removeClass('open');
        toolbarToggle.removeClass('active');
        toolbarSection.removeClass('current');
      });
    }
  };
});

app.controller('orderDetailsCtrl', function ($scope, $stateParams, orderDetailsFactory) {

  orderDetailsFactory.getOrderById($stateParams.id).then(function (order) {

    $scope.order = order;
    $scope.orderItems = order.orderItems;

    $scope.orderTotal = function () {
      return $scope.orderItems.reduce(function (prev, curr) {
        prev += curr.productCost;
        return prev;
      }, 0);
    };
  });
});
app.directive('orderDetails', function () {

  return {
    restrict: 'E',
    templateUrl: 'js/Order/orderDetails/orderDetails.html'
  };
});
app.factory('orderDetailsFactory', function ($http) {
  var services = {};

  services.getOrderById = function (id) {
    return $http.get('api/orders/' + id).then(function (response) {
      return response.data;
    });
  };

  return services;
});
app.config(function ($stateProvider) {
  $stateProvider.state('orderDetails', {
    url: '/order/:id',
    template: '<order-details></order-details>',
    controller: 'orderDetailsCtrl'
  });
});
app.factory('FullstackPics', function () {
  return ['https://pbs.twimg.com/media/B7gBXulCAAAXQcE.jpg:large', 'https://fbcdn-sphotos-c-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/10862451_10205622990359241_8027168843312841137_o.jpg', 'https://pbs.twimg.com/media/B-LKUshIgAEy9SK.jpg', 'https://pbs.twimg.com/media/B79-X7oCMAAkw7y.jpg', 'https://pbs.twimg.com/media/B-Uj9COIIAIFAh0.jpg:large', 'https://pbs.twimg.com/media/B6yIyFiCEAAql12.jpg:large', 'https://pbs.twimg.com/media/CE-T75lWAAAmqqJ.jpg:large', 'https://pbs.twimg.com/media/CEvZAg-VAAAk932.jpg:large', 'https://pbs.twimg.com/media/CEgNMeOXIAIfDhK.jpg:large', 'https://pbs.twimg.com/media/CEQyIDNWgAAu60B.jpg:large', 'https://pbs.twimg.com/media/CCF3T5QW8AE2lGJ.jpg:large', 'https://pbs.twimg.com/media/CAeVw5SWoAAALsj.jpg:large', 'https://pbs.twimg.com/media/CAaJIP7UkAAlIGs.jpg:large', 'https://pbs.twimg.com/media/CAQOw9lWEAAY9Fl.jpg:large', 'https://pbs.twimg.com/media/B-OQbVrCMAANwIM.jpg:large', 'https://pbs.twimg.com/media/B9b_erwCYAAwRcJ.png:large', 'https://pbs.twimg.com/media/B5PTdvnCcAEAl4x.jpg:large', 'https://pbs.twimg.com/media/B4qwC0iCYAAlPGh.jpg:large', 'https://pbs.twimg.com/media/B2b33vRIUAA9o1D.jpg:large', 'https://pbs.twimg.com/media/BwpIwr1IUAAvO2_.jpg:large', 'https://pbs.twimg.com/media/BsSseANCYAEOhLw.jpg:large', 'https://pbs.twimg.com/media/CJ4vLfuUwAAda4L.jpg:large', 'https://pbs.twimg.com/media/CI7wzjEVEAAOPpS.jpg:large', 'https://pbs.twimg.com/media/CIdHvT2UsAAnnHV.jpg:large', 'https://pbs.twimg.com/media/CGCiP_YWYAAo75V.jpg:large', 'https://pbs.twimg.com/media/CIS4JPIWIAI37qu.jpg:large'];
});

app.factory('RandomGreetings', function () {

  var getRandomFromArray = function getRandomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  var greetings = ['Why get the milk for free when you can buy the cow??!', 'Because Paying for things make you feel important!', 'All the fun of Google with all the fun of paying for it!.', 'Step 1 - We find Free things\n        Step 2 - You pay a Fee for those things\n        Step 3 - We make Money! ', 'FREE???  GROSS\n        FEE!!! NOT GROSS!!!', 'Now you can be the owner of your own google search!', 'Because the best things in life are free with a surcharge!', 'Because when you pay for things, it\'s usually better\n        -KIN', 'Because paying for things is American and we need to make America great\n        -Donald Trump'];

  return {
    greetings: greetings,
    getRandomGreeting: function getRandomGreeting() {
      return getRandomFromArray(greetings);
    }
  };
});

app.factory('NavFactory', function (AuthService, $http) {
  var signup = false;
  var login = true;
  var loggedIn = false;
  var _setUser = null;

  return {
    setUser: function setUser(user) {
      _setUser = user;
      signup = false;
      login = false;
      loggedIn = true;
    },
    setLoggedIn: function setLoggedIn(value) {
      signup = false;
      login = !value;
      loggedIn = value;
    },

    isLoggedIn: function isLoggedIn() {
      return AuthService.isAuthenticated().then(function (user) {
        if (!user) {
          loggedIn = false;
        } else {
          loggedIn = true;
        }
        return loggedIn;
      });
    },

    getSignUp: function getSignUp() {
      return signup;
    },

    setSignUp: function setSignUp(value) {
      signup = value;
      login = !value;
    },

    getLogin: function getLogin() {
      return login;
    },

    setLogin: function setLogin(value) {
      login = value;
      signup = !value;
    },

    getLoggedIn: function getLoggedIn() {
      return loggedIn;
    }
  };
});

app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state, OrderFactory, NavFactory) {

  return {
    restrict: 'E',
    scope: {},
    templateUrl: 'js/common/directives/navbar/navbar.html',
    link: function link(scope) {

      scope.items = [{ label: 'Home', state: 'home' }, { label: 'Products', state: 'about' }, { label: 'FAQ', state: 'docs' }, { label: 'Members Only', state: 'membersOnly', auth: true }];

      // scope.clickedMenuIcon = false;

      scope.user = null;

      scope.isLoggedIn = function () {
        return AuthService.isAuthenticated();
      };

      scope.logout = function () {
        AuthService.logout().then(function () {
          $state.go('home');
        });
      };

      var setUser = function setUser() {
        AuthService.getLoggedInUser().then(function (user) {
          scope.user = user;
        });
      };

      var removeUser = function removeUser() {
        scope.user = null;
      };

      setUser();

      $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
      $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
      $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);
    },
    controller: function controller($scope) {
      $scope.showCart = OrderFactory.getShowCart;
      $scope.toggleCartView = OrderFactory.toggleShowCart;
      $scope.totalQuantity = OrderFactory.totalQuantity;
      $scope.isLoggedIn = NavFactory.isLoggedIn;
      $scope.setSignUp = NavFactory.setSignUp;
      $scope.getSignUp = NavFactory.getSignUp;
      $scope.getLogin = NavFactory.getLogin;
      $scope.getLoggedIn = NavFactory.getLoggedIn;
    }

  };
});

app.directive('logo', function () {
  return {
    restrict: 'E',
    templateUrl: 'js/common/directives/logo/logo.html',
    link: function link(s, e, a) {
      e.css({
        "width": "50px",
        "height": "50px"
      });
    }
  };
});

app.directive('randoGreeting', function (RandomGreetings) {

  return {
    restrict: 'E',
    templateUrl: 'js/common/directives/rando-greeting/rando-greeting.html',
    link: function link(scope, e) {
      scope.greeting = RandomGreetings.getRandomGreeting();
      e.css({
        "margin": "500px"
      });
    }
  };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIk9yZGVyL29yZGVyLmRpcmVjdGl2ZS5qcyIsIk9yZGVyL29yZGVyLmZhY3RvcnkuanMiLCJPcmRlci9vcmRlckl0ZW0uZGlyZWN0aXZlLmpzIiwiT3JkZXIvb3JkZXJzLmZhY3RvcnkuanMiLCJPcmRlci9vcmRlcnNWaWV3LmRpcmVjdGl2ZS5qcyIsIk9yZGVyL3VzZXJPcmRlcnMuc3RhdGUuanMiLCJhYm91dC9hYm91dC5qcyIsImFkbWluL0FkZEVkaXRQcm9kdWN0cy5zdGF0ZS5qcyIsImFkbWluL2FkbWluLmNvbnRyb2xsZXIuanMiLCJjYXRlZ29yeS9jYXRlZ29yeS5mYWN0b3J5LmpzIiwiZG9jcy9kb2NzLmpzIiwiZmFxL2ZhcS5zdGF0ZXMuanMiLCJmc2EvZnNhLXByZS1idWlsdC5qcyIsImhvbWUvaG9tZS5qcyIsImxvZ2luL2xvZ2luLmRpcmVjdGl2ZS5qcyIsImxvZ2luL2xvZ2luLmpzIiwibG9naW4vc2lnbnVwLmRpcmVjdGl2ZS5qcyIsImxvZ2luL3NpZ251cC5mYWN0b3J5LmpzIiwibG9naW4vdXNlckxvZ2dlZEluLmRpcmVjdGl2ZS5qcyIsIm1lbWJlcnMtb25seS9tZW1iZXJzLW9ubHkuanMiLCJwcm9kdWN0cy9wcm9kdWN0LmRpcmVjdGl2ZS5qcyIsInByb2R1Y3RzL3Byb2R1Y3RzLmNvbnRyb2xsZXIuanMiLCJwcm9kdWN0cy9wcm9kdWN0cy5mYWN0b3J5LmpzIiwicHJvZHVjdHMvcHJvZHVjdHMuc3RhdGUuanMiLCJyZXZpZXdzL3Jldmlld3MuZGlyZWN0aXZlLmpzIiwicmV2aWV3cy9yZXZpZXdzLmZhY3RvcnkuanMiLCJyZXZpZXdzL3Jldmlld3NMZWF2ZS5kaXJlY3RpdmUuanMiLCJyZXZpZXdzL3Jldmlld3NSYXRpbmcuZGlyZWN0aXZlLmpzIiwic3R1cGlkVGhpbmdzL2NoYXRCb3QuZGlyZWN0aXZlLmpzIiwidGFncy90YWdzLmZhY3RvcnkuanMiLCJ1dGlscy9uYXZfYmFyX3V0aWxzLmpzIiwiT3JkZXIvb3JkZXJEZXRhaWxzL29yZGVyRGV0YWlscy5jb250cm9sbGVyLmpzIiwiT3JkZXIvb3JkZXJEZXRhaWxzL29yZGVyRGV0YWlscy5kaXJlY3RpdmUuanMiLCJPcmRlci9vcmRlckRldGFpbHMvb3JkZXJEZXRhaWxzLmZhY3RvcnkuanMiLCJPcmRlci9vcmRlckRldGFpbHMvb3JkZXJEZXRhaWxzLnN0YXRlLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9GdWxsc3RhY2tQaWNzLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9SYW5kb21HcmVldGluZ3MuanMiLCJjb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmZhY3RvcnkuanMiLCJjb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uanMiLCJjb21tb24vZGlyZWN0aXZlcy9yYW5kby1ncmVldGluZy9yYW5kby1ncmVldGluZy5qcyJdLCJuYW1lcyI6WyJ3aW5kb3ciLCJhcHAiLCJhbmd1bGFyIiwibW9kdWxlIiwiZmlsdGVyIiwiYW1vdW50IiwidG9GaXhlZCIsImNvbmZpZyIsIiR1cmxSb3V0ZXJQcm92aWRlciIsIiRsb2NhdGlvblByb3ZpZGVyIiwiaHRtbDVNb2RlIiwib3RoZXJ3aXNlIiwid2hlbiIsImxvY2F0aW9uIiwicmVsb2FkIiwicnVuIiwiJHJvb3RTY29wZSIsIkF1dGhTZXJ2aWNlIiwiJHN0YXRlIiwiT3JkZXJGYWN0b3J5IiwiTmF2RmFjdG9yeSIsImdldFNlc3Npb25DYXJ0IiwiZ2V0TG9nZ2VkSW5Vc2VyIiwidGhlbiIsInVzZXIiLCJzZXRVc2VyIiwiZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCIsInN0YXRlIiwiZGF0YSIsImF1dGhlbnRpY2F0ZSIsIiRvbiIsImV2ZW50IiwidG9TdGF0ZSIsInRvUGFyYW1zIiwiaXNBdXRoZW50aWNhdGVkIiwicHJldmVudERlZmF1bHQiLCJnbyIsIm5hbWUiLCJkaXJlY3RpdmUiLCJQcm9kdWN0c0ZhY3RvcnkiLCJyZXN0cmljdCIsInNjb3BlIiwidGVtcGxhdGUiLCJjb250cm9sbGVyIiwiJHNjb3BlIiwic3ViVG90YWwiLCJnZXRTdWJUb3RhbCIsImxpbmsiLCJjYXJ0IiwiZ2V0Q2FydCIsInN1Ym1pdE9yZGVyIiwibWFrZUl0UmFpbiIsImVsZW1lbnQiLCJjc3MiLCJzZXRUaW1lb3V0IiwiaGlkZSIsInNlcnZpY2UiLCIkaHR0cCIsInNob3dDYXJ0Iiwib3JkZXIiLCJjb25zb2xlIiwibG9nIiwic2VsZiIsInNlbmRDYXJ0VG9TZXNzaW9uIiwicG9zdCIsIm9yZGVyQ29uZiIsImdldCIsImxlbmd0aCIsImFkZFRvQ2FydCIsInByb2R1Y3QiLCJxdHkiLCJwdXNoIiwicmVtb3ZlRnJvbUNhcnQiLCJpbmRleCIsIm1hcCIsIml0ZW0iLCJpZCIsImluZGV4T2YiLCJzcGxpY2UiLCJ0b3RhbFF1YW50aXR5IiwicmVkdWNlIiwicHJldiIsImN1ciIsInN1YlRvdGFsTGluZSIsInByaWNlIiwiaW5jcmVhc2VRdHkiLCJkZWNyZWFzZVF0eSIsImdldFNob3dDYXJ0IiwidG9nZ2xlU2hvd0NhcnQiLCJzZXRTaG93Q2FydCIsInZhbHVlIiwidW5kZWZpbmVkIiwiY2IiLCJyZXNwb25zZSIsInN0YXR1cyIsImZhY3RvcnkiLCIkbG9nIiwic2VydmljZXMiLCJnZXRBbGwiLCJjYXRjaCIsInRlbXBsYXRlVXJsIiwiT3JkZXJzRmFjdG9yeSIsIm9yZGVycyIsIiRzdGF0ZVByb3ZpZGVyIiwidXJsIiwiRnVsbHN0YWNrUGljcyIsImltYWdlcyIsIl8iLCJzaHVmZmxlIiwicmVzb2x2ZSIsInByb2R1Y3RzIiwiY2F0ZWdvcmllcyIsImNhdGVnb3J5RmFjdG9yeSIsInRhZ3MiLCJ0YWdzRmFjdG9yeSIsImNhdGVnb3J5IiwidG9nZ2xlRWRpdCIsImVkaXQiLCJhZGROZXdQcm9kdWN0IiwiY3JlYXRlT25lIiwic2F2ZSIsInVwZGF0ZU9uZSIsImRlbGV0ZVByb2R1Y3QiLCJkZWxldGVPbmUiLCJFcnJvciIsImlvIiwib3JpZ2luIiwiY29uc3RhbnQiLCJsb2dpblN1Y2Nlc3MiLCJsb2dpbkZhaWxlZCIsImxvZ291dFN1Y2Nlc3MiLCJzZXNzaW9uVGltZW91dCIsIm5vdEF1dGhlbnRpY2F0ZWQiLCJub3RBdXRob3JpemVkIiwiJHEiLCJBVVRIX0VWRU5UUyIsInN0YXR1c0RpY3QiLCJyZXNwb25zZUVycm9yIiwiJGJyb2FkY2FzdCIsInJlamVjdCIsIiRodHRwUHJvdmlkZXIiLCJpbnRlcmNlcHRvcnMiLCIkaW5qZWN0b3IiLCJTZXNzaW9uIiwib25TdWNjZXNzZnVsTG9naW4iLCJjcmVhdGUiLCJmcm9tU2VydmVyIiwibG9naW4iLCJjcmVkZW50aWFscyIsIm1lc3NhZ2UiLCJsb2dvdXQiLCJkZXN0cm95IiwiZXJyb3IiLCJzZW5kTG9naW4iLCJsb2dpbkluZm8iLCJzZXRMb2dnZWRJbiIsInNldFNpZ25VcCIsIlNpZ25VcEZhY3RvcnkiLCJzZW5kU2lnblVwIiwic2lnblVwIiwicyIsImUiLCJhIiwic2lnblVwSW5mbyIsImVyciIsImxvZ091dCIsIlNlY3JldFN0YXNoIiwiZ2V0U3Rhc2giLCJzdGFzaCIsInNhbGUiLCJzZWxlY3RlZENhdElkIiwiY2F0ZWdvcnlJZCIsIiRmaWx0ZXIiLCIkc3RhdGVQYXJhbXMiLCJjYXRlZ29yeUNvdW50IiwiY2F0Q291bnQiLCJmb3JFYWNoIiwic2VsZWN0ZWRDYXRlZ29yeUlkIiwiY2F0ZWdvcnlJRCIsInNlbGVjdGVkQ2F0ZWdvcnlTdHIiLCJmaWx0ZXJlZENhdGVnb3JpZXMiLCJzZXRTZWxlY3RlZCIsImlzQWN0aXZlIiwicmV2aWV3cyIsIlJldmlld3NGYWN0b3J5IiwiZ2V0Q2F0ZWdvcnlTdHIiLCJpIiwibGVhdmVSZXZpZXciLCJzdWJtaXRSZXZpZXciLCJwb3N0T25lIiwicmV2aWV3IiwiZ2V0T25lIiwiZGVsZXRlIiwiY3JlYXRlZCIsInB1dCIsInVwZGF0ZWRQcm9kdWN0IiwicGFyYW1zIiwicHJvZHVjdElkIiwicmF0ZSIsImdldFRpbWVzIiwibiIsIkFycmF5Iiwic2VsZWN0QXJyYXkiLCJnZXRTZWxlY3RBcnJheSIsImJvdFRleHQiLCJidXR0b25UZXh0IiwiJCIsIm9uIiwiYW5pbWF0ZSIsImxlZnQiLCJ0b3AiLCJib3RUZXh0TGVuZ3RoIiwidGV4dCIsImF0dHIiLCJkV2lkdGgiLCJkb2N1bWVudCIsIndpZHRoIiwiZEhlaWdodCIsImhlaWdodCIsIm5leHRYIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwibmV4dFkiLCJ0b29sYmFyVG9nZ2xlIiwidG9vbGJhckRyb3Bkb3duIiwidG9vbGJhclNlY3Rpb24iLCJjbG9zZVRvb2xCb3giLCJyZW1vdmVDbGFzcyIsImN1cnJlbnRWYWx1ZSIsInRhcmdldCIsImlzIiwiYWRkQ2xhc3MiLCJmaW5kIiwidG9nZ2xlU2VjdGlvbiIsInRhZ05hbWUiLCJvcmRlckRldGFpbHNGYWN0b3J5IiwiZ2V0T3JkZXJCeUlkIiwib3JkZXJJdGVtcyIsIm9yZGVyVG90YWwiLCJjdXJyIiwicHJvZHVjdENvc3QiLCJnZXRSYW5kb21Gcm9tQXJyYXkiLCJhcnIiLCJncmVldGluZ3MiLCJnZXRSYW5kb21HcmVldGluZyIsInNpZ251cCIsImxvZ2dlZEluIiwiaXNMb2dnZWRJbiIsImdldFNpZ25VcCIsImdldExvZ2luIiwic2V0TG9naW4iLCJnZXRMb2dnZWRJbiIsIml0ZW1zIiwibGFiZWwiLCJhdXRoIiwicmVtb3ZlVXNlciIsInRvZ2dsZUNhcnRWaWV3IiwiUmFuZG9tR3JlZXRpbmdzIiwiZ3JlZXRpbmciXSwibWFwcGluZ3MiOiJBQUFBOztBQUNBQSxPQUFBQyxHQUFBLEdBQUFDLFFBQUFDLE1BQUEsQ0FBQSx1QkFBQSxFQUFBLENBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxDQUFBLENBQUE7O0FBRUFGLElBQUFHLE1BQUEsQ0FBQSxhQUFBLEVBQUEsWUFBQTtBQUNBLFNBQUEsVUFBQUMsTUFBQSxFQUFBO0FBQ0EsV0FBQSxNQUFBLENBQUFBLFNBQUEsR0FBQSxFQUFBQyxPQUFBLENBQUEsQ0FBQSxD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LEVBQUFDLENBQUEsRUFBQTtBQUNBRCxRQUFBNUcsR0FBQSxDQUFBO0FBQ0EsaUJBQUEsTUFEQTtBQUVBLGtCQUFBO0FBRkEsT0FBQTtBQUlBO0FBUkEsR0FBQTtBQVVBLENBWEE7O0FDQUFwRCxJQUFBcUMsU0FBQSxDQUFBLGVBQUEsRUFBQSxVQUFBNE4sZUFBQSxFQUFBOztBQUVBLFNBQUE7QUFDQTFOLGNBQUEsR0FEQTtBQUVBNEQsaUJBQUEseURBRkE7QUFHQXJELFVBQUEsY0FBQU4sS0FBQSxFQUFBd0gsQ0FBQSxFQUFBO0FBQ0F4SCxZQUFBME4sUUFBQSxHQUFBRCxnQkFBQWIsaUJBQUEsRUFBQTtBQUNBcEYsUUFBQTVHLEdBQUEsQ0FBQTtBQUNBLGtCQUFBO0FBREEsT0FBQTtBQUdBO0FBUkEsR0FBQTtBQVdBLENBYkEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnRnVsbHN0YWNrR2VuZXJhdGVkQXBwJywgWydmc2FQcmVCdWlsdCcsICd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nQW5pbWF0ZSddKTtcblxuYXBwLmZpbHRlciggJ3ByaWNlRmlsdGVyJywgZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gZnVuY3Rpb24oYW1vdW50KXtcbiAgICAgICAgcmV0dXJuICckJyArIChhbW91bnQvMTAwKS50b0ZpeGVkKDIpO1xuICAgIH1cbn0pXG5cbmFwcC5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcbiAgICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgIC8vIElmIHdlIGdvIHRvIGEgVVJMIHRoYXQgdWktcm91dGVyIGRvZXNuJ3QgaGF2ZSByZWdpc3RlcmVkLCBnbyB0byB0aGUgXCIvXCIgdXJsLlxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbiAgICAvLyBUcmlnZ2VyIHBhZ2UgcmVmcmVzaCB3aGVuIGFjY2Vzc2luZyBhbiBPQXV0aCByb3V0ZVxuICAgICR1cmxSb3V0ZXJQcm92aWRlci53aGVuKCcvYXV0aC86cHJvdmlkZXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9KTtcbn0pO1xuXG4vLyBUaGlzIGFwcC5ydW4gaXMgZm9yIGNvbnRyb2xsaW5nIGFjY2VzcyB0byBzcGVjaWZpYyBzdGF0ZXMuXG5hcHAucnVuKGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlLCBPcmRlckZhY3RvcnksIE5hdkZhY3RvcnkpIHtcblxuICAgIE9yZGVyRmFjdG9yeS5nZXRTZXNzaW9uQ2FydCgpO1xuICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpXG4gICAgLnRoZW4oZnVuY3Rpb24odXNlcil7XG4gICAgICAgIE5hdkZhY3Rvcnkuc2V0VXNlcih1c2VyKTtcbiAgICB9KVxuXG4gICAgLy8gVGhlIGdpdmVuIHN0YXRlIHJlcXVpcmVzIGFuIGF1dGhlbnRpY2F0ZWQgdXNlci5cbiAgICB2YXIgZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmF1dGhlbnRpY2F0ZTtcbiAgICB9O1xuXG4gICAgLy8gJHN0YXRlQ2hhbmdlU3RhcnQgaXMgYW4gZXZlbnQgZmlyZWRcbiAgICAvLyB3aGVuZXZlciB0aGUgcHJvY2VzcyBvZiBjaGFuZ2luZyBhIHN0YXRlIGJlZ2lucy5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zKSB7XG5cbiAgICAgICAgaWYgKCFkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoKHRvU3RhdGUpKSB7XG4gICAgICAgICAgICAvLyBUaGUgZGVzdGluYXRpb24gc3RhdGUgZG9lcyBub3QgcmVxdWlyZSBhdXRoZW50aWNhdGlvblxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuICAgICAgICAgICAgLy8gVGhlIHVzZXIgaXMgYXV0aGVudGljYXRlZC5cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYW5jZWwgbmF2aWdhdGluZyB0byBuZXcgc3RhdGUuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgLy8gSWYgYSB1c2VyIGlzIHJldHJpZXZlZCwgdGhlbiByZW5hdmlnYXRlIHRvIHRoZSBkZXN0aW5hdGlvblxuICAgICAgICAgICAgLy8gKHRoZSBzZWNvbmQgdGltZSwgQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkgd2lsbCB3b3JrKVxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBpZiBubyB1c2VyIGlzIGxvZ2dlZCBpbiwgZ28gdG8gXCJsb2dpblwiIHN0YXRlLlxuICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28odG9TdGF0ZS5uYW1lLCB0b1BhcmFtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxufSk7XG4iLCJhcHAuZGlyZWN0aXZlKCdvcmRlcicsIGZ1bmN0aW9uKE9yZGVyRmFjdG9yeSwgUHJvZHVjdHNGYWN0b3J5KXtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHNjb3BlOiB7XG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogYFxuICAgICA8ZGl2IGNsYXNzPVwicm93XCI+XG4gICAgIDxkaXYgY2xhc3M9XCJjb2wtbWQtMlwiPjxoNj48L2g2PjwvZGl2PlxuICAgICA8ZGl2IGNsYXNzPVwiY29sLW1kLTNcIj48aDY+ZGVzY3JpcHRpb248L2g2PjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImNvbC1tZC0yXCIgPjxoNiBjbGFzcz1cInRleHQtY2VudGVyXCI+cXR5PC9oNj48L2Rpdj5cbiAgICAgPGRpdiBjbGFzcz1cImNvbC1tZC0xXCI+PGg2Pml0ZW08L2g2PjwvZGl2PlxuICAgICA8ZGl2IGNsYXNzPVwiY29sLW1kLTFcIj48aDY+PC9oNj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJjb2wtbWQtMlwiID48aDY+c3ViLXRvdGFsPC9oNj48L2Rpdj5cbiAgICAgPGRpdiBjbGFzcz1cImNvbC1tZC0xXCI+PGg2PnJlbW92ZTwvaDY+PC9kaXY+XG4gICAgIDwvZGl2PlxuXG4gICAgICA8b3JkZXItaXRlbSBuZy1yZXBlYXQ9XCJwcm9kdWN0IGluIGNhcnQoKSB0cmFjayBieSAkaW5kZXhcIiBwcm9kdWN0PVwicHJvZHVjdFwiPjwvb3JkZXItaXRlbT5cbiAgICAgIDwhLS0gU3VidG90YWwgLS0+XG4gICAgICA8YnI+XG4gICAgICA8ZGl2IGNsYXNzPVwiY2FydC1zdWJ0b3RhbCBzcGFjZS1ib3R0b21cIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbHVtblwiPlxuICAgICAgICAgIDxoMyBzdHlsZT1cImRpc3BsYXk6IGlubGluZVwiIGNsYXNzPVwidG9vbGJhci10aXRsZVwiPlRvdGFsOjwvaDM+XG4gICAgICAgICAgPGgzIHN0eWxlPVwiZGlzcGxheTogaW5saW5lXCIgY2xhc3M9XCJhbW91bnRcIj57e3N1YlRvdGFsKCkgfCBwcmljZUZpbHRlciB9fTwvaDM+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgPCEtLSA8ZGl2IGNsYXNzPVwiY29sdW1uXCI+XG4gICAgICAgICAgPGgzIGNsYXNzPVwiYW1vdW50XCI+e3tzdWJUb3RhbCgpIHwgcHJpY2VGaWx0ZXIgfX08L2gzPlxuICAgICAgICA8L2Rpdj4gLS0+XG4gICAgICA8L2Rpdj48IS0tIC5zdWJ0b3RhbCAtLT5cbiAgICAgIDwhLS0gQnV0dG9ucyAtLT5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LXJpZ2h0XCI+XG4gICAgICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHQgYnRuLWdob3N0IGNsb3NlLWRyb3Bkb3duXCI+Q29udGludWUgU2hvcHBpbmc8L2E+XG4gICAgICAgIDxidXR0b24gbmctY2xpY2s9XCJzdWJtaXRPcmRlcihtYWtlSXRSYWluKVwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IHdhdmVzLWVmZmVjdCB3YXZlcy1saWdodCB0b2dnbGUtc2VjdGlvblwiPlByb2NlZWQgdG8gQ2hlY2tvdXQ8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIGAsXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlKXtcbiAgICAgICRzY29wZS5zdWJUb3RhbCA9IE9yZGVyRmFjdG9yeS5nZXRTdWJUb3RhbDtcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlKXtcbiAgICAgIHNjb3BlLmNhcnQgPSBPcmRlckZhY3RvcnkuZ2V0Q2FydDtcbiAgICAgIHNjb3BlLnN1Ym1pdE9yZGVyID0gT3JkZXJGYWN0b3J5LnN1Ym1pdE9yZGVyO1xuICAgICAgc2NvcGUubWFrZUl0UmFpbiA9IG1ha2VJdFJhaW47XG5cbiAgICAgIGZ1bmN0aW9uIG1ha2VJdFJhaW4oKXtcbiAgICAgICAgYW5ndWxhci5lbGVtZW50KFwiI2JvdEltYWdlRW5kXCIpLmNzcyh7XG4gICAgICAgICAgXCJhbmltYXRpb25cIjogXCJzdGVwaFJvbGwgMnMgbGluZWFyXCIsXG4gICAgICAgIH0pXG5cbiAgICAgICAgYW5ndWxhci5lbGVtZW50KCcjbW9uZXknKS5jc3Moe1xuICAgICAgICAgIFwiZGlzcGxheVwiOiBcImJsb2NrXCIsXG4gICAgICAgICAgXCJiYWNrZ3JvdW5kLWltYWdlXCI6IFwidXJsKCdkb2xsYXJzL2RvbGxhcjAxLnBuZycpLCB1cmwoJ2RvbGxhcnMvZG9sbGFyMDIucG5nJyksIHVybCgnZG9sbGFycy9kb2xsYXIwMy5wbmcnKVwiLFxuICAgICAgICAgIFwiYW5pbWF0aW9uXCI6IFwic25vdyAzcyBsaW5lYXJcIixcbiAgICAgICAgICBcIi13ZWJraXQtYW5pbWF0aW9uXCI6IFwic25vdyAzcyBsaW5lYXJcIixcbiAgICAgICAgICBcInotaW5kZXhcIjogXCI5ODBcIlxuICAgICAgICB9KVxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgLy8gYW5ndWxhci5lbGVtZW50KFwiI2JvdEltYWdlRW5kXCIpLmhpZGUoKTtcbiAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoXCIjbW9uZXlcIikuaGlkZSgpO1xuICAgICAgICB9LDMwMDApXG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuXG5cblxuXG5cbiIsImFwcC5zZXJ2aWNlKCdPcmRlckZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCl7XG4gIHZhciBzaG93Q2FydCA9IGZhbHNlO1xuICB2YXIgb3JkZXIgPSBbXTtcbiAgY29uc29sZS5sb2coXCJIRVJFIE9SREVSXCIpXG4gIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuc2VuZENhcnRUb1Nlc3Npb24gPSBmdW5jdGlvbihvcmRlcil7XG4gICAgICBjb25zb2xlLmxvZyhcIm9yZGVyISEhIVwiLCBvcmRlcilcbiAgICAgICRodHRwLnBvc3QoJy9hcGkvb3JkZXJzLz9zZXNzaW9uU2F2ZT10cnVlJywgb3JkZXIpXG4gICAgICAudGhlbihmdW5jdGlvbihvcmRlckNvbmYpe1xuICAgICAgfSlcbiAgICB9XG4gICAgdGhpcy5nZXRTZXNzaW9uQ2FydCA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvc2Vzc2lvbkNhcnQnKVxuICAgICAgLnRoZW4oZnVuY3Rpb24oY2FydCl7XG4gICAgICAgaWYoY2FydC5kYXRhLmxlbmd0aCA+IDApXG4gICAgICAgIG9yZGVyID0gY2FydC5kYXRhXG4gICAgICB9KVxuICAgIH1cbiAgICB0aGlzLmFkZFRvQ2FydCA9IGZ1bmN0aW9uKHByb2R1Y3Qpe1xuICAgICAgaWYoIXByb2R1Y3QucXR5KXtcbiAgICAgICAgcHJvZHVjdC5xdHkgPSAxO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHByb2R1Y3QucXR5Kys7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIG9yZGVyLnB1c2gocHJvZHVjdCk7XG4gICAgICBzZWxmLnNlbmRDYXJ0VG9TZXNzaW9uKG9yZGVyKTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVGcm9tQ2FydCA9IGZ1bmN0aW9uKHByb2R1Y3Qpe1xuICAgICAgdmFyIGluZGV4ID0gb3JkZXIubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICByZXR1cm4gaXRlbS5pZFxuICAgICAgfSkuaW5kZXhPZihwcm9kdWN0LmlkKTtcbiAgICAgIG9yZGVyLnNwbGljZShpbmRleCwgMSk7XG4gICAgICBzZWxmLnNlbmRDYXJ0VG9TZXNzaW9uKG9yZGVyKTtcbiAgICB9XG4gICAgdGhpcy50b3RhbFF1YW50aXR5ID0gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBzdWJUb3RhbCA9IG9yZGVyLnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpe1xuICAgICAgICB2YXIgc3ViVG90YWxMaW5lID0gY3VyLnF0eTtcbiAgICAgICAgcHJldiArPSBzdWJUb3RhbExpbmU7XG4gICAgICAgIHJldHVybiBwcmV2O1xuICAgICAgfSwwKVxuICAgICAgcmV0dXJuIHN1YlRvdGFsO1xuICAgIH1cbiAgICB0aGlzLmdldFN1YlRvdGFsPSBmdW5jdGlvbigpe1xuICAgICAgdmFyIHN1YlRvdGFsID0gb3JkZXIucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cil7XG4gICAgICAgIHZhciBzdWJUb3RhbExpbmUgPSBjdXIucXR5ICogY3VyLnByaWNlO1xuICAgICAgICBwcmV2ICs9IHN1YlRvdGFsTGluZTtcbiAgICAgICAgcmV0dXJuIHByZXY7XG4gICAgICB9LDApXG4gICAgICByZXR1cm4gc3ViVG90YWw7XG4gICAgfVxuICAgIHRoaXMuaW5jcmVhc2VRdHkgPSBmdW5jdGlvbihwcm9kdWN0KXtcbiAgICAgIGNvbnNvbGUubG9nKFwiVEhJU1wiLCB0aGlzKVxuICAgICAgcHJvZHVjdC5xdHkrKztcbiAgICAgIHNlbGYuc2VuZENhcnRUb1Nlc3Npb24ob3JkZXIpO1xuICAgIH1cbiAgICB0aGlzLmRlY3JlYXNlUXR5ID0gZnVuY3Rpb24ocHJvZHVjdCl7XG4gICAgICBpZihwcm9kdWN0LnF0eSA+IDApe1xuICAgICAgICBwcm9kdWN0LnF0eS0tO1xuICAgICAgICBzZWxmLnNlbmRDYXJ0VG9TZXNzaW9uKG9yZGVyKTtcbiAgICAgIH1cbiAgICAgIGlmKHByb2R1Y3QucXR5ID09PSAwKXtcbiAgICAgICAgZGVsZXRlIHByb2R1Y3QucXR5O1xuICAgICAgICBzZWxmLnJlbW92ZUZyb21DYXJ0KHByb2R1Y3QpO1xuICAgICAgICBzZWxmLnNlbmRDYXJ0VG9TZXNzaW9uKG9yZGVyKTtcbiAgICAgIH1cblxuICAgIH1cbiAgICB0aGlzLmdldENhcnQgPSAgZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBvcmRlcjtcbiAgICB9XG4gICAgdGhpcy5nZXRTaG93Q2FydCA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gc2hvd0NhcnQ7XG4gICAgfVxuICAgIHRoaXMudG9nZ2xlU2hvd0NhcnQgPSBmdW5jdGlvbigpe1xuICAgICAgaWYoc2hvd0NhcnQgPT09IGZhbHNlKXtcbiAgICAgICAgc2hvd0NhcnQgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2hvd0NhcnQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRTaG93Q2FydCA9IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgIGlmKHZhbHVlID09PSB1bmRlZmluZWQpe1xuICAgICAgICB2YWx1ZSA9ICFzaG93Q2FydDtcbiAgICAgIH1lbHNle1xuICAgICAgICBzaG93Q2FydCA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnN1Ym1pdE9yZGVyID0gZnVuY3Rpb24oY2Ipe1xuICAgICAgY29uc29sZS5sb2coJ3N1Ym1pdHRpbmcgb3JkZXInKTtcbiAgICAgIGlmKG9yZGVyLmxlbmd0aCA9PT0gMCl7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJGh0dHAucG9zdCgnL2FwaS9vcmRlcnMnLCBvcmRlcilcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnb3JkZXJycnJyJywgb3JkZXIpO1xuICAgICAgICAgICAgaWYocmVzcG9uc2Uuc3RhdHVzID09PSAyMDEpe1xuICAgICAgICAgICAgICBvcmRlciA9IFtdO1xuICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxufSlcbiIsImFwcC5kaXJlY3RpdmUoJ29yZGVySXRlbScsIGZ1bmN0aW9uKE9yZGVyRmFjdG9yeSl7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICBzY29wZTp7XG4gICAgICBwcm9kdWN0OiBcIj1cIlxuICAgIH0sXG4gICAgdGVtcGxhdGU6IGBcbiAgICAgIDwhLS0gSXRlbSAtLT5cbiAgICAgIDxkaXYgY2xhc3M9XCJyb3dcIj5cblxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLW1kLTJcIiA+XG4gICAgICAgICAgPGEgaHJlZj1cInNob3Atc2luZ2xlLmh0bWxcIiBjbGFzcz1cIml0ZW0tdGh1bWJcIj5cbiAgICAgICAgICAgIDxzcGFuPjxpbWcgc3R5bGU9XCJoZWlnaHQ6NTBweDsgd2lkdGg6NTBweFwiIHNyYz1cInt7cHJvZHVjdC5waG90b319XCIgYWx0PVwiSXRlbVwiPjwvc3Bhbj5cbiAgICAgICAgICA8L2E+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtbWQtM1wiPlxuICAgICAgICAgIDxoMyBjbGFzcz1cIml0ZW0tdGl0bGVcIj48YSBocmVmPVwic2hvcC1zaW5nbGUuaHRtbFwiPnt7cHJvZHVjdC5uYW1lfX08L2E+PC9oMz5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbC1tZC0yXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNvdW50LWlucHV0XCI+XG4gICAgICAgICAgICA8YSBjbGFzcz1cImluY3ItYnRuXCIgbmctY2xpY2s9XCJkZWNyZWFzZVF0eShwcm9kdWN0KVwiIGRhdGEtYWN0aW9uPVwiZGVjcmVhc2VcIiBocmVmPVwiI1wiPuKAkzwvYT5cbiAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInF1YW50aXR5XCIgdHlwZT1cInRleHRcIiB2YWx1ZT1cInt7IHByb2R1Y3QucXR5IH19XCI+XG4gICAgICAgICAgICA8YSBjbGFzcz1cImluY3ItYnRuXCIgbmctY2xpY2s9XCJpbmNyZWFzZVF0eShwcm9kdWN0KVwiIGRhdGEtYWN0aW9uPVwiaW5jcmVhc2VcIiBocmVmPVwiI1wiPis8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtbWQtMVwiPlxuICAgICAgICAgIDxoNCBjbGFzcz1cIml0ZW0tcHJpY2VcIj57eyBwcm9kdWN0LnByaWNlIHwgcHJpY2VGaWx0ZXIgfX08L2g0PlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgPGRpdiBjbGFzcz1cImNvbC1tZC0xXCI+PC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbC1tZC0yXCI+XG4gICAgICAgICAgPGg0IGNsYXNzPVwiaXRlbS1wcmljZVwiPnt7IHByb2R1Y3QucHJpY2UgKiBwcm9kdWN0LnF0eSB8IHByaWNlRmlsdGVyIH19PC9oND5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbC1tZC0xXCI+XG5cbiAgICAgICAgICA8YSBuZy1jbGljaz1cInJlbW92ZUZyb21DYXJ0KHByb2R1Y3QpXCIgY2xhc3M9XCJpdGVtLXJlbW92ZVwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtcGxhY2VtZW50PVwidG9wXCIgdGl0bGU9XCJSZW1vdmVcIj5cbiAgICAgICAgICAgIDxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnMgcmVtb3ZlX3Nob3BwaW5nX2NhcnRcIj48L2k+XG4gICAgICAgICAgPC9hPlxuICAgICAgICA8L2Rpdj5cblxuXG4gICAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgT3JkZXJGYWN0b3J5KXtcbiAgICAgICRzY29wZS5pbmNyZWFzZVF0eSA9IE9yZGVyRmFjdG9yeS5pbmNyZWFzZVF0eTtcbiAgICAgICRzY29wZS5kZWNyZWFzZVF0eSA9IE9yZGVyRmFjdG9yeS5kZWNyZWFzZVF0eTtcbiAgICAgICRzY29wZS5yZW1vdmVGcm9tQ2FydCA9IE9yZGVyRmFjdG9yeS5yZW1vdmVGcm9tQ2FydDtcbiAgICB9XG4gIH1cbn0pXG4iLCJhcHAuZmFjdG9yeSggJ09yZGVyc0ZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCwgJGxvZyl7XG5cblx0dmFyIHNlcnZpY2VzID0ge307XG5cblx0XHRzZXJ2aWNlcy5nZXRBbGwgPSBmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9vcmRlcnMnKVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKCRsb2cpXG5cdFx0fVxuXG5cdHJldHVybiBzZXJ2aWNlcztcbn0pOyIsIlxuYXBwLmRpcmVjdGl2ZSggJ29yZGVyc1ZpZXcnLCBmdW5jdGlvbigpe1xuXHRyZXR1cm4ge1xuXHRcdHJlc3RyaWN0OiAnRScsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9PcmRlci9vcmRlcnNWaWV3Lmh0bWwnLFxuXHRcdGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgT3JkZXJzRmFjdG9yeSl7XG5cdFx0XHRcblx0XHRcdE9yZGVyc0ZhY3RvcnkuZ2V0QWxsKClcblx0XHRcdC50aGVuKGZ1bmN0aW9uKG9yZGVycyl7XG5cdFx0XHRcdCRzY29wZS5vcmRlcnMgPSBvcmRlcnM7XG5cdFx0XHR9KVxuXHRcdFx0XG5cdFx0fVxuXHR9XG59KSIsIlxuLy8gVE9ETyA6IEhBVkUgVEhJUyBTVEFURSBMT0FEIEZPUiBBTiBBRE1JTiBXSEVOIEFOIE9SREVSUyBCVVRUT04gSVMgQ0xJQ0tFRFxuLy8gVklBIFVJLVNSRUZcbmFwcC5jb25maWcoIGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKXtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoICd1c2VyT3JkZXJzJywge1xuXHRcdHVybDogJ29yZGVycycsXG5cdFx0dGVtcGxhdGU6ICc8b3JkZXItdmlldz48L29yZGVyLXZpZXc+J1xuXHR9KVxufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgLy8gUmVnaXN0ZXIgb3VyICphYm91dCogc3RhdGUuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Fib3V0Jywge1xuICAgICAgICB1cmw6ICcvYWJvdXQnLFxuICAgICAgICBjb250cm9sbGVyOiAnQWJvdXRDb250cm9sbGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hYm91dC9hYm91dC5odG1sJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0Fib3V0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIEZ1bGxzdGFja1BpY3MpIHtcblxuICAgIC8vIEltYWdlcyBvZiBiZWF1dGlmdWwgRnVsbHN0YWNrIHBlb3BsZS5cbiAgICAkc2NvcGUuaW1hZ2VzID0gXy5zaHVmZmxlKEZ1bGxzdGFja1BpY3MpO1xuXG59KTtcbiIsIlxuYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcil7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdBZGRQcm9kdWN0Jyx7XG4gICAgdXJsOiAnL2FkZC1wcm9kdWN0LycsXG4gICAgdGVtcGxhdGVVcmw6ICcvanMvYWRtaW4vYWRtaW4uYWRkcHJvZHVjdC5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnQWRtaW5DdHJsJyxcbiAgICByZXNvbHZlOiB7XG4gICAgcHJvZHVjdHM6IGZ1bmN0aW9uKFByb2R1Y3RzRmFjdG9yeSl7XG4gICAgICAgIHJldHVybiBQcm9kdWN0c0ZhY3RvcnkuZ2V0QWxsKCk7XG4gICAgfSxcbiAgICBjYXRlZ29yaWVzOiBmdW5jdGlvbihjYXRlZ29yeUZhY3Rvcnkpe1xuICAgICAgcmV0dXJuIGNhdGVnb3J5RmFjdG9yeS5nZXRBbGwoKVxuICAgIH0sXG4gICAgdGFnczogZnVuY3Rpb24odGFnc0ZhY3Rvcnkpe1xuICAgICAgcmV0dXJuIHRhZ3NGYWN0b3J5LmdldEFsbCgpXG4gICAgfVxuICB9XG4gIH0pXG5cbn0pXG5cbmFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpe1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnRWRpdFByb2R1Y3RzJyx7XG4gICAgdXJsOiAnL2VkaXQtcHJvZHVjdHMvJyxcbiAgICB0ZW1wbGF0ZVVybDogJy9qcy9hZG1pbi9hZG1pbi5lZGl0cHJvZHVjdHMuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0FkbWluQ3RybCcsXG4gICAgcmVzb2x2ZToge1xuICAgICAgcHJvZHVjdHM6IGZ1bmN0aW9uKFByb2R1Y3RzRmFjdG9yeSl7XG4gICAgICAgIHJldHVybiBQcm9kdWN0c0ZhY3RvcnkuZ2V0QWxsKCk7XG4gICAgICB9LFxuICAgICAgY2F0ZWdvcmllczogZnVuY3Rpb24oY2F0ZWdvcnlGYWN0b3J5KXtcbiAgICAgICAgcmV0dXJuIGNhdGVnb3J5RmFjdG9yeS5nZXRBbGwoKVxuICAgICAgfSxcbiAgICAgIHRhZ3M6IGZ1bmN0aW9uKHRhZ3NGYWN0b3J5KXtcbiAgICAgICAgcmV0dXJuIHRhZ3NGYWN0b3J5LmdldEFsbCgpXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG59KVxuXG5cbiIsImFwcC5jb250cm9sbGVyKCdBZG1pbkN0cmwnLCBmdW5jdGlvbigkc2NvcGUsIHByb2R1Y3RzLCBQcm9kdWN0c0ZhY3RvcnksIHRhZ3MsIGNhdGVnb3J5LCAkc3RhdGUpe1xuXG4kc2NvcGUucHJvZHVjdHMgPSBwcm9kdWN0cztcbiRzY29wZS50YWdzID0gdGFncztcbiRzY29wZS5jYXRlZ29yaWVzID0gY2F0ZWdvcmllcztcblxuJHNjb3BlLnRvZ2dsZUVkaXQgPSBmdW5jdGlvbigpe1xuICBpZigkc2NvcGUuZWRpdCl7XG4gICAgJHNjb3BlLmVkaXQgPSBmYWxzZTtcbiAgfWVsc2V7XG4gICAgJHNjb3BlLmVkaXQgPSB0cnVlO1xuICB9XG59XG5cbiRzY29wZS5hZGROZXdQcm9kdWN0ID0gZnVuY3Rpb24ocHJvZHVjdCl7XG4gIHJldHVybiBQcm9kdWN0c0ZhY3RvcnkuY3JlYXRlT25lKHByb2R1Y3QpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgJHN0YXRlLmdvKCdFZGl0UHJvZHVjdHMnKTtcbiAgICAgICAgfSlcbn1cblxuJHNjb3BlLnNhdmUgPSBmdW5jdGlvbihwcm9kdWN0KXtcbiAgY29uc29sZS5sb2coJ3Nzc2FhYXZlZWUnLCBwcm9kdWN0KTtcbiAgcmV0dXJuIFByb2R1Y3RzRmFjdG9yeS51cGRhdGVPbmUocHJvZHVjdClcbn1cblxuJHNjb3BlLmRlbGV0ZVByb2R1Y3QgPSBmdW5jdGlvbihpZCl7XG4gIHJldHVybiBQcm9kdWN0c0ZhY3RvcnkuZGVsZXRlT25lKGlkKVxuICAgLnRoZW4oZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gUHJvZHVjdHNGYWN0b3J5LmdldEFsbCgpXG4gICB9KVxuICAgLnRoZW4oZnVuY3Rpb24ocHJvZHVjdHMpe1xuICAgICAgY29uc29sZS5sb2coXCJQUk9EVUNUc1wiLCBwcm9kdWN0cylcbiAgICAgICRzY29wZS5wcm9kdWN0cyA9IHByb2R1Y3RzO1xuICAgfSlcbn1cblxufSlcbiIsIid1c2Ugc3RyaWN0J1xuXG5hcHAuZmFjdG9yeSgnY2F0ZWdvcnlGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHAsICRsb2cpe1xuXG5cdHZhciBzZXJ2aWNlcyA9IHt9O1xuXG5cdFx0c2VydmljZXMuZ2V0QWxsID0gZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvY2F0ZWdvcnknKVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKCRsb2cpXG5cdFx0fVxuXG5cdHJldHVybiBzZXJ2aWNlcztcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2RvY3MnLCB7XG4gICAgICAgIHVybDogJy9kb2NzJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9kb2NzL2RvY3MuaHRtbCdcbiAgICB9KTtcbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcil7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdmYXEnLCB7XG4gICAgdXJsOiAnL2ZhcScsXG4gICAgdGVtcGxhdGVVcmw6ICcvanMvZmFxL2ZhcS5odG1sJ1xuICB9KVxufSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBIb3BlIHlvdSBkaWRuJ3QgZm9yZ2V0IEFuZ3VsYXIhIER1aC1kb3kuXG4gICAgaWYgKCF3aW5kb3cuYW5ndWxhcikgdGhyb3cgbmV3IEVycm9yKCdJIGNhblxcJ3QgZmluZCBBbmd1bGFyIScpO1xuXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmc2FQcmVCdWlsdCcsIFtdKTtcblxuICAgIGFwcC5mYWN0b3J5KCdTb2NrZXQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF3aW5kb3cuaW8pIHRocm93IG5ldyBFcnJvcignc29ja2V0LmlvIG5vdCBmb3VuZCEnKTtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5pbyh3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcbiAgICB9KTtcblxuICAgIC8vIEFVVEhfRVZFTlRTIGlzIHVzZWQgdGhyb3VnaG91dCBvdXIgYXBwIHRvXG4gICAgLy8gYnJvYWRjYXN0IGFuZCBsaXN0ZW4gZnJvbSBhbmQgdG8gdGhlICRyb290U2NvcGVcbiAgICAvLyBmb3IgaW1wb3J0YW50IGV2ZW50cyBhYm91dCBhdXRoZW50aWNhdGlvbiBmbG93LlxuICAgIGFwcC5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XG4gICAgICAgIGxvZ2luU3VjY2VzczogJ2F1dGgtbG9naW4tc3VjY2VzcycsXG4gICAgICAgIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxuICAgICAgICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXG4gICAgICAgIHNlc3Npb25UaW1lb3V0OiAnYXV0aC1zZXNzaW9uLXRpbWVvdXQnLFxuICAgICAgICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXG4gICAgICAgIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xuICAgIH0pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ0F1dGhJbnRlcmNlcHRvcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRxLCBBVVRIX0VWRU5UUykge1xuICAgICAgICB2YXIgc3RhdHVzRGljdCA9IHtcbiAgICAgICAgICAgIDQwMTogQVVUSF9FVkVOVFMubm90QXV0aGVudGljYXRlZCxcbiAgICAgICAgICAgIDQwMzogQVVUSF9FVkVOVFMubm90QXV0aG9yaXplZCxcbiAgICAgICAgICAgIDQxOTogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsXG4gICAgICAgICAgICA0NDA6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXNwb25zZUVycm9yOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChzdGF0dXNEaWN0W3Jlc3BvbnNlLnN0YXR1c10sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLmNvbmZpZyhmdW5jdGlvbigkaHR0cFByb3ZpZGVyKSB7XG4gICAgICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goW1xuICAgICAgICAgICAgJyRpbmplY3RvcicsXG4gICAgICAgICAgICBmdW5jdGlvbigkaW5qZWN0b3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJGluamVjdG9yLmdldCgnQXV0aEludGVyY2VwdG9yJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIF0pO1xuICAgIH0pO1xuXG4gICAgYXBwLnNlcnZpY2UoJ0F1dGhTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bExvZ2luKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgdXNlciA9IHJlc3BvbnNlLmRhdGEudXNlcjtcbiAgICAgICAgICAgIFNlc3Npb24uY3JlYXRlKHVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XG4gICAgICAgICAgICByZXR1cm4gdXNlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzZXMgdGhlIHNlc3Npb24gZmFjdG9yeSB0byBzZWUgaWYgYW5cbiAgICAgICAgLy8gYXV0aGVudGljYXRlZCB1c2VyIGlzIGN1cnJlbnRseSByZWdpc3RlcmVkLlxuICAgICAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICEhU2Vzc2lvbi51c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0TG9nZ2VkSW5Vc2VyID0gZnVuY3Rpb24oZnJvbVNlcnZlcikge1xuXG4gICAgICAgICAgICAvLyBJZiBhbiBhdXRoZW50aWNhdGVkIHNlc3Npb24gZXhpc3RzLCB3ZVxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1c2VyIGF0dGFjaGVkIHRvIHRoYXQgc2Vzc2lvblxuICAgICAgICAgICAgLy8gd2l0aCBhIHByb21pc2UuIFRoaXMgZW5zdXJlcyB0aGF0IHdlIGNhblxuICAgICAgICAgICAgLy8gYWx3YXlzIGludGVyZmFjZSB3aXRoIHRoaXMgbWV0aG9kIGFzeW5jaHJvbm91c2x5LlxuXG4gICAgICAgICAgICAvLyBPcHRpb25hbGx5LCBpZiB0cnVlIGlzIGdpdmVuIGFzIHRoZSBmcm9tU2VydmVyIHBhcmFtZXRlcixcbiAgICAgICAgICAgIC8vIHRoZW4gdGhpcyBjYWNoZWQgdmFsdWUgd2lsbCBub3QgYmUgdXNlZC5cblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNBdXRoZW50aWNhdGVkKCkgJiYgZnJvbVNlcnZlciAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS53aGVuKFNlc3Npb24udXNlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE1ha2UgcmVxdWVzdCBHRVQgL3Nlc3Npb24uXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgdXNlciwgY2FsbCBvblN1Y2Nlc3NmdWxMb2dpbiB3aXRoIHRoZSByZXNwb25zZS5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSA0MDEgcmVzcG9uc2UsIHdlIGNhdGNoIGl0IGFuZCBpbnN0ZWFkIHJlc29sdmUgdG8gbnVsbC5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9zZXNzaW9uJykudGhlbihvblN1Y2Nlc3NmdWxMb2dpbikuY2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9naW4gPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9sb2dpbicsIGNyZWRlbnRpYWxzKVxuICAgICAgICAgICAgICAgIC50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7IG1lc3NhZ2U6ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLicgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uKCRyb290U2NvcGUsIEFVVEhfRVZFTlRTKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgICAgdGhpcy51c2VyID0gdXNlcjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IG51bGw7XG4gICAgICAgIH07XG5cbiAgICB9KTtcblxufSgpKTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvaG9tZS5odG1sJ1xuICAgIH0pO1xufSk7XG4iLCJhcHAuZGlyZWN0aXZlKCdsb2dpbicsIGZ1bmN0aW9uKE5hdkZhY3RvcnksIEF1dGhTZXJ2aWNlLCAkc3RhdGUpe1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRScsXG4gICAgdGVtcGxhdGVVcmw6ICcvanMvbG9naW4vbG9naW4uaHRtbCcsXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlKXtcblxuICAgICAgJHNjb3BlLmxvZ2luID0ge307XG4gICAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgICAvLyAkc2NvcGUuc2lnbnVwID0gTmF2RmFjdG9yeS5zaWdudXA7XG4gICAgICAkc2NvcGUuc2VuZExvZ2luID0gZnVuY3Rpb24gKGxvZ2luSW5mbykge1xuXG4gICAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgICBBdXRoU2VydmljZS5sb2dpbihsb2dpbkluZm8pLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIE5hdkZhY3Rvcnkuc2V0TG9nZ2VkSW4odHJ1ZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVTRVIgRlJPTSBBVVRIIExPR0lOIElOIExPR0lOIERJUkVDVElWRVwiLCB1c2VyKVxuICAgICAgICAgICAgTmF2RmFjdG9yeS5zZXRVc2VyKHVzZXIpXG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLic7XG4gICAgICB9KTtcblxuICAgICAgJHNjb3BlLnNldFNpZ25VcCA9IE5hdkZhY3Rvcnkuc2V0U2lnblVwO1xuXG4gICAgICB9XG5cbiAgICB9XG59XG59KVxuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9sb2dpbi9sb2dpbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlKSB7XG5cbiAgICAkc2NvcGUubG9naW4gPSB7fTtcbiAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgJHNjb3BlLnNlbmRMb2dpbiA9IGZ1bmN0aW9uIChsb2dpbkluZm8pIHtcblxuICAgICAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmxvZ2luKGxvZ2luSW5mbykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJztcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG59KTtcbiIsImFwcC5kaXJlY3RpdmUoJ3NpZ251cCcsIGZ1bmN0aW9uKE5hdkZhY3RvcnksIFNpZ25VcEZhY3Rvcnkpe1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRScsXG4gICAgdGVtcGxhdGVVcmw6ICcvanMvbG9naW4vc2lnbnVwLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSl7XG4gICAgICAkc2NvcGUuc2VuZFNpZ25VcCA9IFNpZ25VcEZhY3Rvcnkuc2lnblVwO1xuICAgICAgJHNjb3BlLnNldFNpZ25VcCA9IE5hdkZhY3Rvcnkuc2V0U2lnblVwO1xuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24ocywgZSwgYSkge1xuXG4gICAgfVxuICB9XG59IClcbiIsImFwcC5mYWN0b3J5KCdTaWduVXBGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHAsIE5hdkZhY3Rvcnkpe1xuICByZXR1cm4ge1xuICAgIHNpZ25VcDogZnVuY3Rpb24oc2lnblVwSW5mbyl7XG4gICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS91c2Vycy8nLCBzaWduVXBJbmZvKVxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVTRVIgRlJPTSBTSUdOVVBcIiwgdXNlcik7XG4gICAgICAgICAgICAgICAgTmF2RmFjdG9yeS5zZXRMb2dnZWRJbih0cnVlKTtcbiAgICAgICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImVyclwiLCBlcnIpXG4gICAgICAgICAgICAgIH0pXG4gICAgfVxuICB9XG59KVxuIiwiYXBwLmRpcmVjdGl2ZSgndXNlckxvZ2dlZEluJywgZnVuY3Rpb24oTmF2RmFjdG9yeSwgQXV0aFNlcnZpY2UpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZTogYDxoMz55b3UgZ290IHRvIHRoZSB1c2VyIGxvZ2dlZCBpbiBwZzwvaDM+XG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tc3VibWl0XCI+XG4gICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBuZy1jbGljaz1cImxvZ091dCgpXCIgdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1ibG9jayB3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHRcIj5Mb2cgT3V0PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB1aS1zcmVmPVwiRWRpdFByb2R1Y3RzXCIgdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1ibG9jayB3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHRcIj5FZGl0IFByb2R1Y3RzPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHVpLXNyZWY9XCJBZGRQcm9kdWN0XCIgdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1ibG9jayB3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHRcIj5BZGQgTmV3IFByb2R1Y3Q8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB1aS1zcmVmPVwiRWRpdFVzZXJzXCIgdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1ibG9jayB3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHRcIj5FZGl0IFVzZXJzPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdWktc3JlZj1cIkFkbWluR2V0T3JkZXJzXCIgdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1ibG9jayB3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHRcIj5SZXZpZXcgT3JkZXJzPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHVpLXNyZWY9XCJVc2VyUmV2aWV3UGFzdE9yZGVyc1wiIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSBidG4tYmxvY2sgd2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0XCI+UmV2aWV3IFBhc3QgT3JkZXJzPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdWktc3JlZj1cIlVzZXJFZGl0QWNjb3VudFwiIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSBidG4tYmxvY2sgd2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0XCI+RWRpdCBBY2NvdW50PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICBgLFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSkge1xuICAgICAgICAkc2NvcGUubG9nT3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuICAgICAgICAgICAgQXV0aFNlcnZpY2UubG9nb3V0KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBOYXZGYWN0b3J5LnNldExvZ2dlZEluKGZhbHNlKVxuICAgICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICB9XG59KVxuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdtZW1iZXJzT25seScsIHtcbiAgICAgICAgdXJsOiAnL21lbWJlcnMtYXJlYScsXG4gICAgICAgIHRlbXBsYXRlOiAnPGltZyBuZy1yZXBlYXQ9XCJpdGVtIGluIHN0YXNoXCIgd2lkdGg9XCIzMDBcIiBuZy1zcmM9XCJ7eyBpdGVtIH19XCIgLz4nLFxuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHNjb3BlLCBTZWNyZXRTdGFzaCkge1xuICAgICAgICAgICAgU2VjcmV0U3Rhc2guZ2V0U3Rhc2goKS50aGVuKGZ1bmN0aW9uIChzdGFzaCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5zdGFzaCA9IHN0YXNoO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgZGF0YS5hdXRoZW50aWNhdGUgaXMgcmVhZCBieSBhbiBldmVudCBsaXN0ZW5lclxuICAgICAgICAvLyB0aGF0IGNvbnRyb2xzIGFjY2VzcyB0byB0aGlzIHN0YXRlLiBSZWZlciB0byBhcHAuanMuXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuZmFjdG9yeSgnU2VjcmV0U3Rhc2gnLCBmdW5jdGlvbiAoJGh0dHApIHtcblxuICAgIHZhciBnZXRTdGFzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9tZW1iZXJzL3NlY3JldC1zdGFzaCcpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldFN0YXNoOiBnZXRTdGFzaFxuICAgIH07XG5cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmFwcC5kaXJlY3RpdmUoJ3Byb2R1Y3QnLCBmdW5jdGlvbigpe1xuXHRyZXR1cm4ge1xuXHRcdHJlc3RyaWN0OiAnRScsXG5cdFx0c2NvcGU6IHtcblx0XHRcdHByb2R1Y3Q6IFwiPVwiLFxuXHRcdFx0c2FsZTogJz0nXG5cdFx0fSxcblx0XHR0ZW1wbGF0ZTogYFxuXHRcdFx0PGRpdiBjbGFzcz1cImNvbC1sZy00IGNvbC1tZC00IGNvbC1zbS02XCIgPlxuXHRcdFx0ICA8ZGl2IGNsYXNzPVwic2hvcC1pdGVtXCI+XG5cblx0XHRcdCAgICA8ZGl2IGNsYXNzPVwic2hvcC10aHVtYm5haWxcIj5cblx0XHRcdCAgICAgIDwhLS0gPHNwYW4gY2xhc3M9XCJzaG9wLWxhYmVsIHRleHQtZGFuZ2VyXCI+U2FsZTwvc3Bhbj4gLS0+XG4gICAgICAgICAgICA8YSB1aS1zcmVmPSdzaW5nbGVQcm9kdWN0KHtpZDogcHJvZHVjdC5pZH0pJyBjbGFzcz1cIml0ZW0tbGlua1wiPjwvYT5cblx0XHRcdCAgICAgIDxpbWcgc3JjPVwie3twcm9kdWN0LnBob3RvfX1cIiBhbHQ9XCJTaG9wIGl0ZW1cIiAgc3R5bGU9XCJtaW4td2lkdGg6MTUwcHg7bWluLWhlaWdodDoxNTBweFwiPlxuXHRcdFx0ICAgICAgPGRpdiBjbGFzcz1cInNob3AtaXRlbS10b29sc1wiPlxuXHRcdFx0ICAgICAgICA8YSBocmVmPVwiI1wiIGNsYXNzPVwiYWRkLXRvLXdoaXNobGlzdFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGRhdGEtcGxhY2VtZW50PVwidG9wXCIgdGl0bGU9XCJXaXNobGlzdFwiPlxuXHRcdFx0ICAgICAgICAgIDxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnMgZmF2b3JpdGVfYm9yZGVyXCI+PC9pPlxuXHRcdFx0ICAgICAgICA8L2E+XG5cdFx0XHQgICAgICAgIDxhIG5nLWNsaWNrPVwiYWRkVG9DYXJ0KHByb2R1Y3QpXCIgY2xhc3M9XCJhZGQtdG8tY2FydFwiPlxuXHRcdFx0ICAgICAgICAgIDxlbT5BZGQgdG8gQ2FydDwvZW0+XG5cdFx0XHQgICAgICAgICAgPHN2ZyB4PVwiMHB4XCIgeT1cIjBweFwiIHdpZHRoPVwiMzJweFwiIGhlaWdodD1cIjMycHhcIiB2aWV3Qm94PVwiMCAwIDMyIDMyXCI+XG5cdFx0XHQgICAgICAgICAgICA8cGF0aCBzdHJva2UtZGFzaGFycmF5PVwiMTkuNzkgMTkuNzlcIiBzdHJva2UtZGFzaG9mZnNldD1cIjE5Ljc5XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCIjRkZGRkZGXCIgc3Ryb2tlLXdpZHRoPVwiMlwiIHN0cm9rZS1saW5lY2FwPVwic3F1YXJlXCIgc3Ryb2tlLW1pdGVybGltaXQ9XCIxMFwiIGQ9XCJNOSwxN2wzLjksMy45YzAuMSwwLjEsMC4yLDAuMSwwLjMsMEwyMywxMVwiLz5cblx0XHRcdCAgICAgICAgICA8L3N2Zz5cblx0XHRcdCAgICAgICAgPC9hPlxuXHRcdFx0ICAgICAgPC9kaXY+XG5cdFx0XHQgICAgPC9kaXY+XG5cdFx0XHQgICAgPGRpdiBjbGFzcz1cInNob3AtaXRlbS1kZXRhaWxzXCI+XG5cdFx0XHQgICAgICA8aDMgY2xhc3M9XCJzaG9wLWl0ZW0tdGl0bGVcIj48YSBocmVmPVwic2hvcC1zaW5nbGUuaHRtbFwiPnt7cHJvZHVjdC5uYW1lfX08L2E+PC9oMz5cblx0XHRcdCAgICAgIDxzcGFuIGNsYXNzPVwic2hvcC1pdGVtLXByaWNlXCI+XG5cdFx0XHQgICAgICAgIHt7IHByb2R1Y3QucHJpY2UgfCBwcmljZUZpbHRlciB9fVxuXHRcdFx0ICAgICAgPC9zcGFuPlxuXHRcdFx0ICAgIDwvZGl2PlxuXHRcdFx0ICA8L2Rpdj48IS0tIC5zaG9wLWl0ZW0gLS0+XG5cdFx0XHQ8L2Rpdj48IS0tIC5jb2wtbWQtNC5jb2wtc20tNiAtLT5cblx0XHRgLFxuXHQgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCBPcmRlckZhY3RvcnkpIHtcbiAgICAkc2NvcGUuYWRkVG9DYXJ0ID0gZnVuY3Rpb24ocHJvZHVjdCl7XG4gICAgdmFyIHNob3dDYXJ0ID0gT3JkZXJGYWN0b3J5LmdldFNob3dDYXJ0KCk7XG4gICAgLy9pZihzaG93Q2FydCl7XG4gICAgXHRPcmRlckZhY3Rvcnkuc2V0U2hvd0NhcnQodHJ1ZSk7XG4gICAgICBPcmRlckZhY3RvcnkuYWRkVG9DYXJ0KHByb2R1Y3QpO1xuICAgICAgT3JkZXJGYWN0b3J5LnNldFNob3dDYXJ0KHRydWUpO1xuICAgICAgLy9PcmRlckZhY3RvcnkudG9nZ2xlU2hvd0NhcnQoKTtcbiAgLy8gICB9ZWxzZXtcbiAgLy8gICAgIE9yZGVyRmFjdG9yeS5zZXRTaG93Q2FydChmYWxzZSk7XG4gIC8vICAgICBPcmRlckZhY3RvcnkuYWRkVG9DYXJ0KHByb2R1Y3QpO1xuICAvLyAgICAgT3JkZXJGYWN0b3J5LnRvZ2dsZVNob3dDYXJ0KCk7XG5cdFx0Ly8gfVxuXHR9XG5cdH1cblx0fVxufSlcbiIsImFwcC5maWx0ZXIoICdjYXRlZ29yeUZpbHRlcicsIGZ1bmN0aW9uKCl7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24ocHJvZHVjdHMsIHNlbGVjdGVkQ2F0SWQpe1xuXG4gICAgICAgIGlmKCBzZWxlY3RlZENhdElkID4gMCApe1xuICAgICAgICBcdHJldHVybiBwcm9kdWN0cy5maWx0ZXIoZnVuY3Rpb24ocHJvZHVjdCl7XG4gICAgICAgIFx0XHRyZXR1cm4gKHByb2R1Y3QuY2F0ZWdvcnlJZCA9PT0gc2VsZWN0ZWRDYXRJZCk7XG4gICAgICAgIFx0fSlcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIFx0cmV0dXJuIHByb2R1Y3RzO1xuICAgIH1cbn0pXG5cbmFwcC5jb250cm9sbGVyKCdQcm9kdWN0c0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRmaWx0ZXIsICRzdGF0ZVBhcmFtcywgcHJvZHVjdHMsIGNhdGVnb3JpZXMsIE9yZGVyRmFjdG9yeSl7XG4gIGFuZ3VsYXIuZWxlbWVudChcIiNtb25leVwiKS5jc3Moe1xuICAgIFwiZGlzcGxheVwiOiBcIm5vbmVcIlxuICB9KTtcblxuXHQkc2NvcGUucHJvZHVjdHMgPSBwcm9kdWN0cztcblxuXHQkc2NvcGUuY2F0ZWdvcmllcyA9IGNhdGVnb3JpZXM7XG5cblx0JHNjb3BlLmNhdGVnb3J5Q291bnQgPSBmdW5jdGlvbihjYXRlZ29yeUlkKXtcblx0XHR2YXIgY2F0Q291bnQgPSAwO1xuXG5cdFx0cHJvZHVjdHMuZm9yRWFjaChmdW5jdGlvbihwcm9kdWN0KXtcblx0XHRcdGlmKCBwcm9kdWN0LmNhdGVnb3J5SWQgPT09IGNhdGVnb3J5SWQgKXtcblx0XHRcdFx0Y2F0Q291bnQrK1xuXHRcdFx0fVxuXHRcdH0pXG5cblx0XHRyZXR1cm4gY2F0Q291bnQ7XG5cdH1cblxuXHQkc2NvcGUuc2VsZWN0ZWRDYXRlZ29yeUlkID0gJHN0YXRlUGFyYW1zLmNhdGVnb3J5SUQ7IC8vIEluaXRpYWxpemUgdG8gYWxsIG9uIGluaXRpYWwgcGFnZSBsb2FkXG5cblx0JHNjb3BlLnNlbGVjdGVkQ2F0ZWdvcnlTdHIgPSBmdW5jdGlvbigpe1xuXG5cdFx0cmV0dXJuICRzY29wZS5zZWxlY3RlZENhdGVnb3J5SWQgPT09IC0xICA/XG5cdFx0JycgOlxuXHRcdGNhdGVnb3JpZXNbJHNjb3BlLnNlbGVjdGVkQ2F0ZWdvcnlJZCAtIDFdLm5hbWU7XG5cdH1cblxuICAkc2NvcGUuZmlsdGVyZWRDYXRlZ29yaWVzID0gcHJvZHVjdHM7XG5cblx0JHNjb3BlLnNldFNlbGVjdGVkID0gZnVuY3Rpb24oY2F0ZWdvcnlJZCl7XG5cdFx0JHNjb3BlLnNlbGVjdGVkQ2F0ZWdvcnlJZCA9IGNhdGVnb3J5SWQ7XG4gICAgJHNjb3BlLmZpbHRlcmVkQ2F0ZWdvcmllcyA9ICRmaWx0ZXIoXCJjYXRlZ29yeUZpbHRlclwiKShwcm9kdWN0cywgY2F0ZWdvcnlJZClcbiAgICBjb25zb2xlLmxvZyhcInNjb3BlIGZpbHRlcmVkIGNhdHNcIiwgJHNjb3BlLmZpbHRlcmVkQ2F0ZWdvcmllcyk7XG5cdH07XG5cblx0JHNjb3BlLmlzQWN0aXZlID0gZnVuY3Rpb24oaWQpe1xuXG5cdFx0cmV0dXJuICtpZCA9PT0gJHNjb3BlLnNlbGVjdGVkQ2F0ZWdvcnlJZCA/ICdhY3RpdmUnIDogJyc7XG5cblx0fVxuXG4gICAgJHNjb3BlLmFkZFRvQ2FydCA9IGZ1bmN0aW9uKHByb2R1Y3Qpe1xuICAgIE9yZGVyRmFjdG9yeS5hZGRUb0NhcnQocHJvZHVjdCk7XG4gICAgT3JkZXJGYWN0b3J5LnRvZ2dsZVNob3dDYXJ0KCk7XG4gIH1cbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdzaW5nbGVQcm9kdWN0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgY2F0ZWdvcmllcywgT3JkZXJGYWN0b3J5LCByZXZpZXdzLCBwcm9kdWN0LCBSZXZpZXdzRmFjdG9yeSl7XG5cbiAgJHNjb3BlLnByb2R1Y3QgPSBwcm9kdWN0O1xuICBjb25zb2xlLmxvZyhcIlBST0RVQ1RcIiwkc2NvcGUucHJvZHVjdCk7XG5cblxuICAkc2NvcGUucmV2aWV3cyA9IHJldmlld3M7XG4gIGNvbnNvbGUubG9nKFwiUkVWSUVXU1wiLCRzY29wZS5yZXZpZXdzKTtcblxuICAkc2NvcGUuZ2V0Q2F0ZWdvcnlTdHIgPSBmdW5jdGlvbihjYXRlZ29yeUlkKXtcbiAgXHRyZXR1cm4gY2F0ZWdvcmllc1tjYXRlZ29yeUlkIC0gMV0ubmFtZTtcbiAgfVxuXG4gIHZhciBwcm9kdWN0cyA9IFtdO1xuICBmb3IodmFyIGkgPSAwOyBpIDwgNDsgaSsrKXtcbiAgICBwcm9kdWN0cy5wdXNoKHByb2R1Y3QpXG4gIH1cblxuICAkc2NvcGUubGVhdmVSZXZpZXcgPSB7fTtcblxuICAkc2NvcGUuc3VibWl0UmV2aWV3ID0gZnVuY3Rpb24oKXtcbiAgICBSZXZpZXdzRmFjdG9yeS5wb3N0T25lKCRzY29wZS5sZWF2ZVJldmlldylcbiAgICAudGhlbihmdW5jdGlvbihyZXZpZXcpe1xuICAgICAgcmV0dXJuIFJldmlld3NGYWN0b3J5LmdldE9uZSgkc2NvcGUucHJvZHVjdC5pZClcbiAgICB9KVxuICAgIC50aGVuKGZ1bmN0aW9uKHJldmlld3Mpe1xuICAgICAgY29uc29sZS5sb2coXCJoZXJlIHdpdGggcmV2aWV3cyBhZnRlciBzdWJtaXRcIilcbiAgICAgICRzY29wZS5yZXZpZXdzID0gcmV2aWV3c1xuICAgIH0pXG5cbiAgfVxuXG4gICRzY29wZS5hZGRUb0NhcnQgPSBmdW5jdGlvbihwcm9kdWN0KXtcbiAgICB2YXIgc2hvd0NhcnQgPSBPcmRlckZhY3RvcnkuZ2V0U2hvd0NhcnQoKTtcbiAgICBjb25zb2xlLmxvZygnU0hPVyBDQVJUJywgc2hvd0NhcnQpO1xuICAgIGlmKHNob3dDYXJ0KXtcbiAgICAgIE9yZGVyRmFjdG9yeS5hZGRUb0NhcnQocHJvZHVjdCk7XG4gICAgICAgY29uc29sZS5sb2coJ1NIT1cgQ0FSVCB3aGUgc2hvdyBjYXJ0IGlzIHRydWUnLCBzaG93Q2FydCk7XG4gICAgfWVsc2V7XG4gICAgICBPcmRlckZhY3RvcnkuYWRkVG9DYXJ0KHByb2R1Y3QpO1xuICAgICAgT3JkZXJGYWN0b3J5LnNldFNob3dDYXJ0KHRydWUpO1xuICAgICAgY29uc29sZS5sb2coJ1NIT1cgQ0FSVCB3aGUgc2hvdyBjYXJ0IGlzIGZhbHNlIC1lbHNlJywgc2hvd0NhcnQpO1xuICAgIH1cbiAgfVxufSlcbiIsImFwcC5mYWN0b3J5KCdQcm9kdWN0c0ZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCwgJGxvZyl7XG5cblx0dmFyIHNlcnZpY2VzID0ge307XG5cblx0XHRzZXJ2aWNlcy5nZXRBbGwgPSBmdW5jdGlvbigpe1xuXG5cdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3Byb2R1Y3RzLycpXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goJGxvZylcblx0XHR9XG5cblx0XHRzZXJ2aWNlcy5kZWxldGVPbmUgPSBmdW5jdGlvbihpZCl7XG5cdFx0XHRcdHJldHVybiAkaHR0cC5kZWxldGUoJy9hcGkvcHJvZHVjdHMvJyArIGlkKVxuXHRcdFx0XHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZygncHJvZHVjdCBkZWxldGVkJylcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdC5jYXRjaCgkbG9nKVxuXHRcdH1cblxuXHRcdHNlcnZpY2VzLmNyZWF0ZU9uZSA9IGZ1bmN0aW9uKHByb2R1Y3Qpe1xuXHRcdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvcHJvZHVjdHMvJywgcHJvZHVjdClcblx0XHRcdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24oY3JlYXRlZCl7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGNyZWF0ZWQ7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdC5jYXRjaCgkbG9nKVxuXG5cblx0XHR9XG5cblx0XHRzZXJ2aWNlcy51cGRhdGVPbmUgPSBmdW5jdGlvbihwcm9kdWN0KXtcblx0XHRcdGNvbnNvbGUubG9nKCd1cGRhYWFhYWFhYWFhYXRlIG9uZScsIHByb2R1Y3QpXG5cdFx0XHRyZXR1cm4gJGh0dHAucHV0KCcvYXBpL3Byb2R1Y3RzLycgKyBwcm9kdWN0LmlkLCBwcm9kdWN0KVxuXHRcdFx0XHRcdFx0XHQudGhlbihmdW5jdGlvbih1cGRhdGVkUHJvZHVjdCl7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCd1cGRhdGVkUHJvZHVjdCcsIHVwZGF0ZWRQcm9kdWN0KVxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB1cGRhdGVkUHJvZHVjdDtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0LmNhdGNoKCRsb2cpXG5cdFx0fVxuXG5cdFx0c2VydmljZXMuZ2V0T25lID0gZnVuY3Rpb24oaWQpe1xuXHRcdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9wcm9kdWN0cy8nICsgaWQgKVxuXHRcdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQuY2F0Y2goJGxvZylcblx0XHR9XG5cblxuXHRyZXR1cm4gc2VydmljZXM7XG5cbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcil7XG5cblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3Byb2R1Y3RzJywge1xuXHRcdHVybDogJy9wcm9kdWN0cycsXG5cdFx0cGFyYW1zOiB7IGNhdGVnb3J5SUQ6IC0xIH0sXG5cdFx0dGVtcGxhdGVVcmw6ICcvanMvcHJvZHVjdHMvcHJvZHVjdHMuaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ1Byb2R1Y3RzQ3RybCcsXG5cdFx0cmVzb2x2ZToge1xuXHRcdFx0cHJvZHVjdHM6IGZ1bmN0aW9uKFByb2R1Y3RzRmFjdG9yeSl7XG5cdFx0XHRcdHJldHVybiBQcm9kdWN0c0ZhY3RvcnkuZ2V0QWxsKCk7XG5cdFx0XHR9LFxuXHRcdFx0Y2F0ZWdvcmllczogZnVuY3Rpb24oY2F0ZWdvcnlGYWN0b3J5KXtcblx0XHRcdFx0cmV0dXJuIGNhdGVnb3J5RmFjdG9yeS5nZXRBbGwoKTtcblx0XHRcdH0sXG5cdFx0XHRjYXJ0OiBmdW5jdGlvbihPcmRlckZhY3Rvcnkpe1xuXHRcdFx0XHRPcmRlckZhY3Rvcnkuc2V0U2hvd0NhcnQoZmFsc2UpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59KTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcil7XG5cblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3NpbmdsZVByb2R1Y3QnLCB7XG5cdFx0dXJsOiAnL3Byb2R1Y3RzLzppZCcsXG5cdFx0dGVtcGxhdGVVcmw6ICcvanMvcHJvZHVjdHMvcHJvZHVjdC5odG1sJyxcblx0XHRjb250cm9sbGVyOiAnc2luZ2xlUHJvZHVjdEN0cmwnLFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdHByb2R1Y3Q6IGZ1bmN0aW9uKCRzdGF0ZVBhcmFtcywgUHJvZHVjdHNGYWN0b3J5KXtcblx0XHRcdFx0cmV0dXJuIFByb2R1Y3RzRmFjdG9yeS5nZXRPbmUoJHN0YXRlUGFyYW1zLmlkKTtcblx0XHRcdH0sXG5cdFx0XHRjYXRlZ29yaWVzOiBmdW5jdGlvbihjYXRlZ29yeUZhY3Rvcnkpe1xuXHRcdFx0XHRyZXR1cm4gY2F0ZWdvcnlGYWN0b3J5LmdldEFsbCgpO1xuXHRcdFx0fSxcblx0XHRcdGNhcnQ6IGZ1bmN0aW9uKE9yZGVyRmFjdG9yeSl7XG5cdFx0XHRcdE9yZGVyRmFjdG9yeS5zZXRTaG93Q2FydChmYWxzZSk7XG5cdFx0XHR9LFxuICAgICAgcmV2aWV3czogZnVuY3Rpb24oUmV2aWV3c0ZhY3RvcnksJHN0YXRlUGFyYW1zKXtcbiAgICAgICAgcmV0dXJuIFJldmlld3NGYWN0b3J5LmdldE9uZSgkc3RhdGVQYXJhbXMuaWQpO1xuICAgICAgfVxuXHRcdH1cblx0fSk7XG5cbn0pO1xuIiwiYXBwLmRpcmVjdGl2ZShcInJldmlld3NcIiwgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgc2NvcGU6IHtcbiAgICAgIHJldmlldzogXCI9XCJcbiAgICB9LFxuICAgIHRlbXBsYXRlOiBgXG4gICAgPGRpdiBjbGFzcz1cInJldmlld1wiPlxuICAgICAgPGRpdiBjbGFzcz1cInJldmlldy1ib2R5XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJyZXZpZXctbWV0YVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2x1bW5cIj5cbiAgICAgICAgICAgIDxoNCBjbGFzcz1cInJldmlldy10aXRsZVwiPnt7cmV2aWV3LnRpdGxlfX08L2g0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8cmV2aWV3LXJhdGluZyByYXRlPVwicmV2aWV3LnJhdGluZ1wiPlxuICAgICAgICAgICAgPC9yZXZpZXctcmF0aW5nPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPHA+e3tyZXZpZXcuY29udGVudH19PC9wPlxuICAgICAgICA8Y2l0ZT57e3Jldmlldy51c2VyfX08L2NpdGU+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGxpbms6IGZ1bmN0aW9uKCBzLCBlLCBhICl7XG5cbiAgICB9XG4gIH1cbn0pO1xuIiwiYXBwLmZhY3RvcnkoJ1Jldmlld3NGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHAsICRsb2cpe1xuXG4gIHZhciBzZXJ2aWNlcyA9IHt9O1xuXG4gICAgc2VydmljZXMuZ2V0QWxsID0gZnVuY3Rpb24oKXtcblxuICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9yZXZpZXdzLycpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goJGxvZylcbiAgICB9XG5cbiAgICBzZXJ2aWNlcy5nZXRPbmUgPSBmdW5jdGlvbihpZCl7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3Jldmlld3MvJyArIGlkIClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgIGlmIChlcnIpe1xuICAgICAgICAgICAgICAgICByZXR1cm4gW3t9XTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIHNlcnZpY2VzLnBvc3RPbmUgPSBmdW5jdGlvbihyZXZpZXcpe1xuXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUkVWSUVXIEZPUiBQT1NUIE9ORVwiLCByZXZpZXcpXG4gICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9yZXZpZXdzLycsIHJldmlldyApXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgkbG9nKVxuICAgIH1cblxuXG4gIHJldHVybiBzZXJ2aWNlcztcblxufSk7XG4iLCJhcHAuZGlyZWN0aXZlKFwicmV2aWV3TGVhdmVcIiwgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgc2NvcGU6IHtcbiAgICAgIHN1Ym1pdFJldmlldzogXCImXCIsXG4gICAgICBwcm9kdWN0OiBcIj1cIixcbiAgICAgIGxlYXZlUmV2aWV3OiBcIj1cIlxuICAgIH0sXG4gICAgdGVtcGxhdGU6IGBcbiAgICA8Zm9ybSBuYW1lPVwicmV2aWV3XCIgY2xhc3M9XCJyb3cgcGFkZGluZy10b3BcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJjb2wtc20tOFwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1lbGVtZW50XCI+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmctbW9kZWw9XCJsZWF2ZVJldmlldy50aXRsZVwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgcGxhY2Vob2xkZXI9XCJUaXRsZSpcIiByZXF1aXJlZD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJjb2wtc20tNFwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1lbGVtZW50IGZvcm0tc2VsZWN0XCI+XG4gICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImZvcm0tY29udHJvbFwiIG5nLW1vZGVsPVwibGVhdmVSZXZpZXcucmF0aW5nXCI+XG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiNVwiPjUgc3RhcnM8L29wdGlvbj5cbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCI0XCI+NCBzdGFyczwvb3B0aW9uPlxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjNcIj4zIHN0YXJzPC9vcHRpb24+XG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiMlwiPjIgc3RhcnM8L29wdGlvbj5cbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIxXCI+MSBzdGFyPC9vcHRpb24+XG4gICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiY29sLXNtLTEyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWVsZW1lbnRcIj5cbiAgICAgICAgICA8dGV4dGFyZWEgcm93cz1cIjhcIiBuZy1tb2RlbD1cImxlYXZlUmV2aWV3LmNvbnRlbnRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIHBsYWNlaG9sZGVyPVwiUmV2aWV3KlwiIHJlcXVpcmVkPjwvdGV4dGFyZWE+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwicm93XCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNvbC1sZy0zIGNvbC1tZC00IGNvbC1zbS02IGNvbC1sZy1vZmZzZXQtOSBjb2wtbWQtb2Zmc2V0LTggY29sLXNtLW9mZnNldC02XCI+XG4gICAgICAgICAgICA8YnV0dG9uIG5nLWNsaWNrPVwic3VibWl0UmV2aWV3KClcIiBjbGFzcz1cImJ0biBidG4tYmxvY2sgYnRuLXByaW1hcnkgd2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IHNwYWNlLXRvcC1ub25lIHNwYWNlLWJvdHRvbS1ub25lXCI+TGVhdmUgUmV2aWV3PC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAge3t1c2VyfX1cbiAgICA8L2Zvcm0+XG4gICAgYCxcbiAgICBsaW5rOiBmdW5jdGlvbiggcywgZSwgYSApe1xuICAgICAgY29uc29sZS5sb2coIFwic2NvcGUhISFcIiApO1xuICAgICAgcy5sZWF2ZVJldmlldyA9IHt9O1xuICAgICAgcy5sZWF2ZVJldmlldy5wcm9kdWN0SWQgPSBzLnByb2R1Y3QuaWQ7XG4gICAgfVxuICB9XG59KTtcbiIsImFwcC5kaXJlY3RpdmUoXCJyZXZpZXdSYXRpbmdcIiwgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgc2NvcGU6IHtcbiAgICAgIHJhdGU6IFwiPVwiXG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogYFxuICAgIDxkaXYgY2xhc3M9XCJjb2x1bW4gcHVsbC1yaWdodFwiPlxuICAgICAgPHNwYW4gY2xhc3M9XCJwcm9kdWN0LXJhdGluZyB0ZXh0LXdhcm5pbmdcIj5cbiAgICAgICAgPGkgY2xhc3M9XCJtYXRlcmlhbC1pY29ucyBzdGFyXCIgbmctcmVwZWF0PVwidCBpbiBnZXRUaW1lcyhyYXRlKSB0cmFjayBieSAkaW5kZXhcIj48L2k+XG4gICAgICA8L3NwYW4+XG5cbiAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGxpbms6IGZ1bmN0aW9uKCBzLCBlLCBhICl7XG4gICAgICBzLmdldFRpbWVzPWZ1bmN0aW9uKG4pe1xuICAgICAgICByZXR1cm4gbmV3IEFycmF5KG4pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSk7XG4iLCJhcHAuZGlyZWN0aXZlKCdjaGF0Qm90JywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHRlbXBsYXRlOiBgXG4gICAgPCEtLSAtLT5cbiAgICA8ZGl2PlxuICAgICAgICA8aDEgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogc2t5Ymx1ZVwiIGlkPVwiYm90VGV4dFwiPnt7Ym90VGV4dFtzZWxlY3RBcnJheV19fTwvaDE+XG4gICAgICAgIDxpbWcgc3R5bGU9XCJ3aWR0aDozNTBweDsgaGVpZ2h0OjM1MHB4XCIgaWQ9XCJib3RJbWFnZVwiIHNyYz1cImNoYXRib3QvY2hhdC0we3tzZWxlY3RBcnJheSsxfX0ucG5nXCIgLz5cbiAgICAgICAgPGJ1dHRvbiBzdHlsZT1cInBhZGRpbmc6MjBweDsgbWFyZ2luOjMwcHhcIiBpZD1cImJvdFRleHRCdXR0b25cIj5DaWxjayBtZSBmb3IgaGVscDwvYnV0dG9uPlxuICAgIDxkaXY+XG4gICAgYCxcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUpe1xuICAgICAgJHNjb3BlLnNlbGVjdEFycmF5ID0gMDtcbiAgICAgICRzY29wZS5nZXRTZWxlY3RBcnJheSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBzLnNlbGVjdEFycmF5O1xuICAgICAgfVxuICAgICAgJHNjb3BlLmJvdFRleHQgPSBbXCJIaSEgSG93IGNhbiBJIGhlbHAgeW91IHRvZGF5XCIsIFwiQXJlIHlvdSBzdXJlIHlvdSBkb24ndCB3YW50IGFueSBoZWxwP1wiLCBcIlNlcmlvdXNseSBpZiB0aGVyZSBpcyBhbnl0aGluZyB5b3UgbmVlZCBqdXN0IGhpdCB0aGUgYnV0dG9uXCIsIFwiSSBtZWFuIHJlYWxseSBJIGNhbiBkbyB3aGF0ZXZlciBmb3IgeW91LCBJJ20gbGlrZSBmcmlnZ2VuIGdvb2dsZSBvdmVyIGhlcmVcIiwgXCJPb29vb29vb2ggSSBmb3Jnb3QgSSBnb3QgdGhpcyB0aGluZyEgSGV5IGdvb2QgbHVjayB3aXRoIHRoYXQhXCJdO1xuICAgICAgJHNjb3BlLmJ1dHRvblRleHQgPSBbXCJDbGljayBoZXJlIHRvIHN0YXJ0IGEgY2hhdCFcIiwgXCJBcmUgeW91IHN1cmUgbm8gY2hhdD9cIiwgXCJXQVMgSVQgU09NRVRISU5HIEkgU0FJRD8hXCIsIFwiUExFQVNFIFBMRUFTRSBDTElDSyBNRSEhXCJdXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzLCBlLCBhKXtcbiAgICAgICAgICAkKFwiI2Zsb2F0QnV0dG9uXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgJChcIiNjaGF0LWJvdFwiKS5jc3Moe1xuICAgICAgICAgICAgICBcInZpc2liaWxpdHlcIjpcInZpc2libGVcIlxuICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgJChcIiNjaGF0LWJvdFwiKS5hbmltYXRlKHsgbGVmdDogMzUwICsgJ3B4JywgdG9wOiAxNTAgKyAncHgnIH0pO1xuICAgICAgICAgICAgICQodGhpcykuY3NzKHtcbiAgICAgICAgICAgICAgXCJ2aXNpYmlsaXR5XCI6XCJoaWRkZW5cIlxuICAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgICBlLm9uKCdtb3VzZWVudGVyJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInRoaXMgaXMgZVwiLCBzLmJvdFRleHQsIHMuc2VsZWN0QXJyYXkpXG4gICAgICAgICAgICAgIHZhciBib3RUZXh0TGVuZ3RoID0gcy5ib3RUZXh0Lmxlbmd0aDtcbiAgICAgICAgICAgICAgaWYgKHMuc2VsZWN0QXJyYXkgPCBib3RUZXh0TGVuZ3RoLTIpIHMuc2VsZWN0QXJyYXkrKztcbiAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCcjYm90VGV4dCcpLnRleHQocy5ib3RUZXh0W3Muc2VsZWN0QXJyYXldKTtcbiAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCcjYm90VGV4dEJ1dHRvbicpLnRleHQocy5idXR0b25UZXh0W3Muc2VsZWN0QXJyYXldKTtcbiAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCcjYm90SW1hZ2UnKS5hdHRyKCdzcmMnLGBjaGF0Ym90L2NoYXQtMCR7cy5zZWxlY3RBcnJheSsxfS5wbmdgIClcbiAgICAgICAgICAgICAgdmFyIGRXaWR0aCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkud2lkdGgoKSAvIDEwLCAvLyAxMDAgPSBpbWFnZSB3aWR0aFxuICAgICAgICAgICAgICAgICAgZEhlaWdodCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkuaGVpZ2h0KCkgLyAzMCwgLy8gMTAwID0gaW1hZ2UgaGVpZ2h0XG4gICAgICAgICAgICAgICAgICBuZXh0WCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGRXaWR0aCArIDEwMCksXG4gICAgICAgICAgICAgICAgICBuZXh0WSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGRIZWlnaHQgKyA1MCk7XG4gICAgICAgICAgICAgICQoXCIjY2hhdC1ib3RcIikuYW5pbWF0ZSh7IGxlZnQ6IG5leHRYICsgJ3B4JywgdG9wOiBuZXh0WSArICdweCcgfSk7XG4gICAgICAgICAgICAgICQoXCIjYm90VGV4dEJ1dHRvblwiKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHMuc2VsZWN0QXJyYXkrKztcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJyNib3RUZXh0JykudGV4dChzLmJvdFRleHRbcy5zZWxlY3RBcnJheV0pXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJib3RUZXh0QnV0dG9uXCIpO1xuICAgICAgICAgICAgICAgICBpZihzLnNlbGVjdEFycmF5ID09PSA1KXtcbiAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgnI2JvdFRleHRCdXR0b24nKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCcjYm90SW1hZ2UnKS5hdHRyKCdzcmMnLCdjaGF0Ym90L2NoYXQtMDUucG5nJyApXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgICAgICAgICAgICQoXCIjY2hhdC1ib3RcIikuYW5pbWF0ZSh7IGxlZnQ6IG5leHRYICsgMjUwMCArICdweCcsIHRvcDogbmV4dFkgKyAyNTAwICsgJ3B4JyB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwyNTAwKVxuICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICB9KTtcblxuICAgICAgLy8gaGVpZ2h0OiAoJChcIiNjaGF0LWJvdFwiKS5jc3MoXCJoZWlnaHRcIikgKyA1MClcbiAgICAgIGUuY3NzKHtcbiAgICAgICAgXCJ2aXNpYmlsaXR5XCI6IFwiaGlkZGVuXCIsXG4gICAgICAgIFwibWFyZ2luXCI6IFwiMzBweFwiLFxuICAgICAgICBcInBhZGRpbmdcIjogXCIyMHB4XCIsXG4gICAgICAgIFwicG9zaXRpb25cIjogXCJmaXhlZFwiLFxuICAgICAgICBcImJhY2tncm91bmQtY29sb3JcIjogXCJyZ2JhKDAsMCwwLDApXCIsXG4gICAgICAgIFwiaGVpZ2h0XCI6IFwiODAwcHhcIixcbiAgICAgICAgXCJ3aWR0aFwiOiBcIjgwMHB4XCIsXG4gICAgICAgIFwidG9wXCI6IFwiLTEwMDBcIixcbiAgICAgICAgXCJsZWZ0XCI6IFwiLTEwMDBcIixcbiAgICAgICAgXCJ6LWluZGV4XCI6IFwiOTk5XCJcbiAgICAgIH0pXG5cbiAgICB9XG4gIH1cbn0pXG4iLCIndXNlIHN0cmljdCdcblxuYXBwLmZhY3RvcnkoICd0YWdzRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwLCAkbG9nKXtcblxuXHR2YXIgc2VydmljZSA9IHt9O1xuXG5cdFx0c2VydmljZS5nZXRBbGwgPSBmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS90YWdzJylcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdFx0XHR9KVxuXHRcdH1cblxuXHRyZXR1cm4gc2VydmljZTtcbn0pOyIsImFwcC5kaXJlY3RpdmUoJ25hdkJhclV0aWwnLCBmdW5jdGlvbihPcmRlckZhY3Rvcnkpe1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHMsZSxhKXtcbiAgICAgICAgICAgIHZhciB0b29sYmFyVG9nZ2xlID0gJCgnLnRvb2xiYXItdG9nZ2xlJyksXG4gICAgICAgICAgICAgICAgdG9vbGJhckRyb3Bkb3duID0gJCgnLnRvb2xiYXItZHJvcGRvd24nKSxcbiAgICAgICAgICAgICAgICB0b29sYmFyU2VjdGlvbiA9ICQoJy50b29sYmFyLXNlY3Rpb24nKTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gY2xvc2VUb29sQm94KCkge1xuICAgICAgICAgICAgICAgIHRvb2xiYXJUb2dnbGUucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgIHRvb2xiYXJTZWN0aW9uLnJlbW92ZUNsYXNzKCdjdXJyZW50Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRvb2xiYXJUb2dnbGUub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidGhpc1wiLCQodGhpcykpXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0aGlzIGhyZWZcIiwgJCh0aGlzKS5hdHRyKCdocmVmJykpXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0b29sYmFyVG9nZ2xlXCIpXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9ICQodGhpcykuYXR0cignaHJlZicpO1xuICAgICAgICAgICAgICAgIGlmICgkKGUudGFyZ2V0KS5pcygnLmFjdGl2ZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsb3NlVG9vbEJveCgpO1xuICAgICAgICAgICAgICAgICAgICB0b29sYmFyRHJvcGRvd24ucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0b29sYmFyRHJvcGRvd24uYWRkQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VUb29sQm94KCk7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICAkKGN1cnJlbnRWYWx1ZSkuYWRkQ2xhc3MoJ2N1cnJlbnQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRWYWx1ZSA9PT0gXCIjY2FydFwiKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNjYXJ0LXRvb2xiYXItc2VjdGlvbicpLmFkZENsYXNzKCdjdXJyZW50Jyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0b29sYmFyVG9nZ2xlLmZpbmQoXCJhXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYSBnZXR0aW5nIGNsaWNrZWRcIilcbiAgICAgICAgICAgICAgICBjbG9zZVRvb2xCb3goKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkKCcuY2xvc2UtZHJvcGRvd24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0b29sYmFyRHJvcGRvd24ucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICAgICAgICB0b29sYmFyVG9nZ2xlLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICB0b29sYmFyU2VjdGlvbi5yZW1vdmVDbGFzcygnY3VycmVudCcpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciB0b2dnbGVTZWN0aW9uID0gJCgnLnRvZ2dsZS1zZWN0aW9uJyk7XG5cbiAgICAgICAgICAgIC8vIHRvZ2dsZVNlY3Rpb24ub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiSEVSRSB0b2dnbGVTZWN0aW9uXCIpXG4gICAgICAgICAgICAvLyAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9ICQodGhpcykuYXR0cignaHJlZicpO1xuICAgICAgICAgICAgLy8gICAgIHRvb2xiYXJTZWN0aW9uLnJlbW92ZUNsYXNzKCdjdXJyZW50Jyk7XG4gICAgICAgICAgICAvLyAgICAgJChjdXJyZW50VmFsdWUpLmFkZENsYXNzKCdjdXJyZW50Jyk7XG4gICAgICAgICAgICAvLyAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgICAgICQoJyNtYWluJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUudGFyZ2V0LnRhZ05hbWUgPT0gXCJFTVwiKTtcbiAgICAgICAgICAgICAgIGlmKGUudGFyZ2V0LnRhZ05hbWUgIT09IFwiRU1cIil7XG4gICAgICAgICAgICAgICAgdG9vbGJhckRyb3Bkb3duLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgICAgICAgICAgdG9vbGJhclRvZ2dsZS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgdG9vbGJhclNlY3Rpb24ucmVtb3ZlQ2xhc3MoJ2N1cnJlbnQnKTtcbiAgICAgICAgICAgICAgICBPcmRlckZhY3Rvcnkuc2V0U2hvd0NhcnQoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImVsc2VcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkKCcjbWFpbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlLnRhcmdldC50YWdOYW1lID09IFwiRU1cIik7XG4gICAgICAgICAgICAgICAgICBjbG9zZVRvb2xCb3goKTtcbiAgICAgICAgICAgICAgIGlmKGUudGFyZ2V0LnRhZ05hbWUgPT09IFwiRU1cIil7XG4gICAgICAgICAgICAgICAgLy8gaWYgKCQoZS50YXJnZXQpLmlzKCcuYWN0aXZlJykpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgY2xvc2VUb29sQm94KCk7XG4gICAgICAgICAgICAgICAgLy8gICAgIHRvb2xiYXJEcm9wZG93bi5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICAgICAgICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgJCgnI2NhcnQtdG9vbGJhci10b2dnbGUnKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICQoJyN0b29sYmFyLWRyb3Bkb3duLWlkJykuYWRkQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gY2xvc2VUb29sQm94KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICQoJyNjYXJ0LXRvb2xiYXItc2VjdGlvbicpLmFkZENsYXNzKCdjdXJyZW50Jyk7XG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgJCgnLnRvb2xiYXItc2VjdGlvbiBhJykub24oJ2NsaWNrJywgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRvb2xiYXJEcm9wZG93bi5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICAgICAgICAgICAgIHRvb2xiYXJUb2dnbGUucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgIHRvb2xiYXJTZWN0aW9uLnJlbW92ZUNsYXNzKCdjdXJyZW50Jyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn0pXG5cblxuXG4iLCJhcHAuY29udHJvbGxlciggJ29yZGVyRGV0YWlsc0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZVBhcmFtcywgb3JkZXJEZXRhaWxzRmFjdG9yeSkge1xuXG5cdG9yZGVyRGV0YWlsc0ZhY3RvcnkuZ2V0T3JkZXJCeUlkKCRzdGF0ZVBhcmFtcy5pZClcblx0LnRoZW4oZnVuY3Rpb24ob3JkZXIpe1xuXG5cdFx0JHNjb3BlLm9yZGVyID0gb3JkZXI7XG5cdFx0JHNjb3BlLm9yZGVySXRlbXMgPSBvcmRlci5vcmRlckl0ZW1zO1xuXG5cdFx0JHNjb3BlLm9yZGVyVG90YWwgPSBmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuICRzY29wZS5vcmRlckl0ZW1zLnJlZHVjZSggZnVuY3Rpb24ocHJldiwgY3Vycil7XG5cdFx0XHRcdHByZXYgKz0gY3Vyci5wcm9kdWN0Q29zdDtcblx0XHRcdFx0cmV0dXJuIHByZXY7XG5cdFx0XHR9LCAwKTtcblx0XHR9XG5cblxuXHR9KTtcblx0XG59KTsiLCJhcHAuZGlyZWN0aXZlKCdvcmRlckRldGFpbHMnLCBmdW5jdGlvbigpe1xuXG5cdHJldHVybiB7XG5cdFx0cmVzdHJpY3Q6ICdFJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL09yZGVyL29yZGVyRGV0YWlscy9vcmRlckRldGFpbHMuaHRtbCdcblx0fVxuXG59KTsiLCJhcHAuZmFjdG9yeSggJ29yZGVyRGV0YWlsc0ZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCl7XG5cdHZhciBzZXJ2aWNlcyA9IHt9O1xuXG5cdFx0c2VydmljZXMuZ2V0T3JkZXJCeUlkID0gZnVuY3Rpb24oaWQpe1xuXHRcdFx0cmV0dXJuICRodHRwLmdldCgnYXBpL29yZGVycy8nICsgaWQpXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRcdFx0fSlcblx0XHR9XG5cblx0cmV0dXJuIHNlcnZpY2VzO1xufSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKXtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoICdvcmRlckRldGFpbHMnLCB7XG5cdFx0dXJsOiAnL29yZGVyLzppZCcsXG5cdFx0dGVtcGxhdGU6ICc8b3JkZXItZGV0YWlscz48L29yZGVyLWRldGFpbHM+Jyxcblx0XHRjb250cm9sbGVyOiAnb3JkZXJEZXRhaWxzQ3RybCdcblx0fSlcbn0pIiwiYXBwLmZhY3RvcnkoJ0Z1bGxzdGFja1BpY3MnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CN2dCWHVsQ0FBQVhRY0UuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vZmJjZG4tc3Bob3Rvcy1jLWEuYWthbWFpaGQubmV0L2hwaG90b3MtYWsteGFwMS90MzEuMC04LzEwODYyNDUxXzEwMjA1NjIyOTkwMzU5MjQxXzgwMjcxNjg4NDMzMTI4NDExMzdfby5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItTEtVc2hJZ0FFeTlTSy5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3OS1YN29DTUFBa3c3eS5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItVWo5Q09JSUFJRkFoMC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I2eUl5RmlDRUFBcWwxMi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFLVQ3NWxXQUFBbXFxSi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFdlpBZy1WQUFBazkzMi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFZ05NZU9YSUFJZkRoSy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFUXlJRE5XZ0FBdTYwQi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NDRjNUNVFXOEFFMmxHSi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBZVZ3NVNXb0FBQUxzai5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBYUpJUDdVa0FBbElHcy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBUU93OWxXRUFBWTlGbC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItT1FiVnJDTUFBTndJTS5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I5Yl9lcndDWUFBd1JjSi5wbmc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I1UFRkdm5DY0FFQWw0eC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I0cXdDMGlDWUFBbFBHaC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0IyYjMzdlJJVUFBOW8xRC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0J3cEl3cjFJVUFBdk8yXy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0JzU3NlQU5DWUFFT2hMdy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NKNHZMZnVVd0FBZGE0TC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NJN3d6akVWRUFBT1BwUy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NJZEh2VDJVc0FBbm5IVi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NHQ2lQX1lXWUFBbzc1Vi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NJUzRKUElXSUFJMzdxdS5qcGc6bGFyZ2UnXG4gICAgXTtcbn0pO1xuIiwiYXBwLmZhY3RvcnkoJ1JhbmRvbUdyZWV0aW5ncycsIGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBnZXRSYW5kb21Gcm9tQXJyYXkgPSBmdW5jdGlvbiAoYXJyKSB7XG4gICAgICAgIHJldHVybiBhcnJbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYXJyLmxlbmd0aCldO1xuICAgIH07XG5cbiAgICB2YXIgZ3JlZXRpbmdzID0gW1xuICAgICAgICAnV2h5IGdldCB0aGUgbWlsayBmb3IgZnJlZSB3aGVuIHlvdSBjYW4gYnV5IHRoZSBjb3c/PyEnLFxuICAgICAgICAnQmVjYXVzZSBQYXlpbmcgZm9yIHRoaW5ncyBtYWtlIHlvdSBmZWVsIGltcG9ydGFudCEnLFxuICAgICAgICAnQWxsIHRoZSBmdW4gb2YgR29vZ2xlIHdpdGggYWxsIHRoZSBmdW4gb2YgcGF5aW5nIGZvciBpdCEuJyxcbiAgICAgICAgYFN0ZXAgMSAtIFdlIGZpbmQgRnJlZSB0aGluZ3NcbiAgICAgICAgU3RlcCAyIC0gWW91IHBheSBhIEZlZSBmb3IgdGhvc2UgdGhpbmdzXG4gICAgICAgIFN0ZXAgMyAtIFdlIG1ha2UgTW9uZXkhIGAsXG4gICAgICAgIGBGUkVFPz8/ICBHUk9TU1xuICAgICAgICBGRUUhISEgTk9UIEdST1NTISEhYCxcbiAgICAgICAgJ05vdyB5b3UgY2FuIGJlIHRoZSBvd25lciBvZiB5b3VyIG93biBnb29nbGUgc2VhcmNoIScsXG4gICAgICAgICdCZWNhdXNlIHRoZSBiZXN0IHRoaW5ncyBpbiBsaWZlIGFyZSBmcmVlIHdpdGggYSBzdXJjaGFyZ2UhJyxcbiAgICAgICAgYEJlY2F1c2Ugd2hlbiB5b3UgcGF5IGZvciB0aGluZ3MsIGl0J3MgdXN1YWxseSBiZXR0ZXJcbiAgICAgICAgLUtJTmAsXG4gICAgICAgIGBCZWNhdXNlIHBheWluZyBmb3IgdGhpbmdzIGlzIEFtZXJpY2FuIGFuZCB3ZSBuZWVkIHRvIG1ha2UgQW1lcmljYSBncmVhdFxuICAgICAgICAtRG9uYWxkIFRydW1wYCxcbiAgICBdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ3JlZXRpbmdzOiBncmVldGluZ3MsXG4gICAgICAgIGdldFJhbmRvbUdyZWV0aW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UmFuZG9tRnJvbUFycmF5KGdyZWV0aW5ncyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KTtcbiIsImFwcC5mYWN0b3J5KCdOYXZGYWN0b3J5JywgZnVuY3Rpb24oQXV0aFNlcnZpY2UsICRodHRwKXtcbiAgdmFyIHNpZ251cCA9IGZhbHNlO1xuICB2YXIgbG9naW4gPSB0cnVlO1xuICB2YXIgbG9nZ2VkSW4gPSBmYWxzZTtcbiAgdmFyIHNldFVzZXIgPSBudWxsO1xuXG4gIHJldHVybiB7XG4gICAgc2V0VXNlcjogZnVuY3Rpb24odXNlcil7XG4gICAgICBzZXRVc2VyID0gdXNlcjtcbiAgICAgIHNpZ251cCA9IGZhbHNlO1xuICAgICAgbG9naW4gPSBmYWxzZTtcbiAgICAgIGxvZ2dlZEluID0gdHJ1ZTtcbiAgICB9LFxuICAgIHNldExvZ2dlZEluOiBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICBzaWdudXAgPSBmYWxzZTtcbiAgICAgIGxvZ2luID0gIXZhbHVlO1xuICAgICAgbG9nZ2VkSW4gPSB2YWx1ZTtcbiAgICB9LFxuXG4gICAgaXNMb2dnZWRJbiA6IGZ1bmN0aW9uKCl7XG4gICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24odXNlcil7XG4gICAgICAgICAgICAgIGlmKCF1c2VyKXtcbiAgICAgICAgICAgICAgICBsb2dnZWRJbiA9IGZhbHNlO1xuICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBsb2dnZWRJbiA9IHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIGxvZ2dlZEluO1xuICAgICAgICAgICAgfSlcbiAgICB9LFxuXG4gICAgIGdldFNpZ25VcCA6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gc2lnbnVwO1xuICAgICB9LFxuXG4gICAgIHNldFNpZ25VcCA6IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgc2lnbnVwID0gdmFsdWU7XG4gICAgICAgIGxvZ2luID0gIXZhbHVlO1xuICAgICAgfSxcblxuICAgICBnZXRMb2dpbiA6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gbG9naW47XG4gICAgIH0sXG5cbiAgICAgc2V0TG9naW4gOiBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgIGxvZ2luID0gdmFsdWU7XG4gICAgICAgIHNpZ251cCA9ICF2YWx1ZTtcbiAgICAgIH0sXG5cbiAgICAgZ2V0TG9nZ2VkSW4gOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGxvZ2dlZEluO1xuICAgICB9XG4gIH1cblxufSlcbiIsImFwcC5kaXJlY3RpdmUoJ25hdmJhcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgQVVUSF9FVkVOVFMsICRzdGF0ZSwgT3JkZXJGYWN0b3J5LCBOYXZGYWN0b3J5KSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge30sXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG5cbiAgICAgICAgICAgIHNjb3BlLml0ZW1zID0gW1xuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdIb21lJywgc3RhdGU6ICdob21lJyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdQcm9kdWN0cycsIHN0YXRlOiAnYWJvdXQnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0ZBUScsIHN0YXRlOiAnZG9jcycgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnTWVtYmVycyBPbmx5Jywgc3RhdGU6ICdtZW1iZXJzT25seScsIGF1dGg6IHRydWUgfVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAvLyBzY29wZS5jbGlja2VkTWVudUljb24gPSBmYWxzZTtcblxuICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG5cbiAgICAgICAgICAgIHNjb3BlLmlzTG9nZ2VkSW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHNldFVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gdXNlcjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2V0VXNlcigpO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MsIHNldFVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9nb3V0U3VjY2VzcywgcmVtb3ZlVXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgcmVtb3ZlVXNlcik7XG5cbiAgICAgICAgfSxcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlKXtcbiAgICAgICAgICAgJHNjb3BlLnNob3dDYXJ0ID0gT3JkZXJGYWN0b3J5LmdldFNob3dDYXJ0O1xuICAgICAgICAgICAkc2NvcGUudG9nZ2xlQ2FydFZpZXcgPSBPcmRlckZhY3RvcnkudG9nZ2xlU2hvd0NhcnQ7XG4gICAgICAgICAgICRzY29wZS50b3RhbFF1YW50aXR5ID0gT3JkZXJGYWN0b3J5LnRvdGFsUXVhbnRpdHk7XG4gICAgICAgICAgICRzY29wZS5pc0xvZ2dlZEluID0gTmF2RmFjdG9yeS5pc0xvZ2dlZEluO1xuICAgICAgICAgICAkc2NvcGUuc2V0U2lnblVwID0gTmF2RmFjdG9yeS5zZXRTaWduVXA7XG4gICAgICAgICAgICRzY29wZS5nZXRTaWduVXAgPSBOYXZGYWN0b3J5LmdldFNpZ25VcDtcbiAgICAgICAgICAgJHNjb3BlLmdldExvZ2luID0gTmF2RmFjdG9yeS5nZXRMb2dpbjtcbiAgICAgICAgICAgJHNjb3BlLmdldExvZ2dlZEluID0gTmF2RmFjdG9yeS5nZXRMb2dnZWRJbjtcbiAgICAgICAgfVxuXG4gICAgfTtcblxufSk7XG4iLCJhcHAuZGlyZWN0aXZlKCdmdWxsc3RhY2tMb2dvJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHMsZSxhKXtcbiAgICAgICAgICBlLmNzcyh7XG4gICAgICAgICAgICBcIndpZHRoXCI6XCI1MHB4XCIsXG4gICAgICAgICAgICBcImhlaWdodFwiOlwiNTBweFwiXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH07XG59KTtcbiIsImFwcC5kaXJlY3RpdmUoJ3JhbmRvR3JlZXRpbmcnLCBmdW5jdGlvbiAoUmFuZG9tR3JlZXRpbmdzKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL3JhbmRvLWdyZWV0aW5nL3JhbmRvLWdyZWV0aW5nLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsZSkge1xuICAgICAgICAgICAgc2NvcGUuZ3JlZXRpbmcgPSBSYW5kb21HcmVldGluZ3MuZ2V0UmFuZG9tR3JlZXRpbmcoKTtcbiAgICAgICAgICAgICAgZS5jc3Moe1xuICAgICAgICAgICAgICAgIFwibWFyZ2luXCI6IFwiNTAwcHhcIlxuICAgICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfTtcblxufSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
