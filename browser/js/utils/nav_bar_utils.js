app.directive('navBarUtil', function(OrderFactory){
    return {
        restrict: 'A',
        link: function(s,e,a){
            var toolbarToggle = $('.toolbar-toggle'),
                toolbarDropdown = $('.toolbar-dropdown'),
                toolbarSection = $('.toolbar-section');

            function closeToolBox() {
                toolbarToggle.removeClass('active');
                toolbarSection.removeClass('current');
            }

            toolbarToggle.on('click', function(e) {
                console.log("this",$(this))
                console.log("this href", $(this).attr('href'))
                console.log("toolbarToggle")
                var currentValue = $(this).attr('href');
                if ($(e.target).is('.active')) {
                    closeToolBox();
                    toolbarDropdown.removeClass('open');
                } else {
                    toolbarDropdown.addClass('open');
                    closeToolBox();
                    $(this).addClass('active');
                    $(currentValue).addClass('current');
                    if (currentValue === "#cart"){
                        $('#cart-toolbar-section').addClass('current');
                    }
                }
                e.preventDefault();
            });
            toolbarToggle.find("a").on('click', function(e){
                console.log("a getting clicked")
                closeToolBox();
            });

            $('.close-dropdown').on('click', function() {
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

            $('#main').on('click', function(e) {
                console.log(e.target.tagName == "EM");
               if(e.target.tagName !== "EM"){
                toolbarDropdown.removeClass('open');
                toolbarToggle.removeClass('active');
                toolbarSection.removeClass('current');
                OrderFactory.setShowCart(false);
                }else{
                    console.log("else");
                }
            });
            $('#main').on('click', function(e) {
                console.log(e.target.tagName == "EM");
                  closeToolBox();
               if(e.target.tagName === "EM"){
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
            $('.toolbar-section a').on('click',  function() {
                toolbarDropdown.removeClass('open');
                toolbarToggle.removeClass('active');
                toolbarSection.removeClass('current');
            });
        }
    }
})



