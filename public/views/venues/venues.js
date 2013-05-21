(function($) {

    $(function() {
        var user = Hit.User.getCurrent();
        if(!user) {
            window.location.href = 'index.html';
        }
        $('#logged-in-as').text(user.displayname);
    });

    $("#create-venue").on('click', function(e) {
        e.preventDefault();
        Hit.Venue.create({
            name: $('#venue-name').val(),
            phone: $('#venue-phone').val(),
            address: {
                address: $('#venue-address').val(),
                city: $('#venue-city').val(),
                state: $('#venue-state').val(),
                zip: $('#venue-zip').val()
            },
            hours: 'bla'
        }).done(function() {
            $('#create-venue-modal').modal('hide');
        }).fail(function(error) {
            $('#create-venue-error').removeClass('hide').text(error.message);
        });
    });

    $('#logout').on('click', function() {
        Hit.User.logOut();
        window.location.href = '../index.html';
    });

})(jQuery);