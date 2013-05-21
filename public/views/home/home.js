(function($) {

    $(function() {
        var user = Hit.User.getCurrent();
        if(user) {
            window.location.href = 'views/venues.html';
        }
    });

    $('#hit-signin-button').on('click', function(e) {
        e.preventDefault();
        var email = $('#hit-signin-email').val();
        if(_(email).isEmpty()) {
            // TODO
            return;
        }
        var password = $('#hit-signin-password').val();
        if(_(email).isEmpty()) {
            // TODO
            return;
        }
        Hit.User.logIn(email, password).done(function() {
            window.location.href = 'views/venues.html';
        }).fail(function() {
            alert('LOGIN FAILED');
        });
    });

})(jQuery);