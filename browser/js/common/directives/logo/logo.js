app.directive('logo', function () {
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/logo/logo.html',
        link: function(s,e,a){
          e.css({
            "width":"50px",
            "height":"50px"
          })
        }
    };
});
