(function($) {

    Hit.provide('Hit.Views.Venues');

    _(Hit.Views.Venues).extend({
        _files: [],
        _currentSearch: null,
        _timeout: null,
        _venueListTemplate: _.template('<li>' +
            '<div class="well well-large">' +
                '<p class="help-inline venue-list-name"><%= data.venue.name %></p>' +
                '<button venueid="<%= data.venue._parseVenue.id %>" class="btn btn-primary view-venue-button">View</button>' +
            '</div></li>'),

        _venueViewTemplate: _.template(
                '<div class="address">' +
                    '<h5>Address:</h5>' +
                    '<p><%= venue.address.address %></p>' +
                    '<p><%= venue.address.city %>, <%= venue.address.state %>, <%= venue.address.zip %></p>' +
                '</div>' +
                '<div class="phone">' +
                    '<h5>Phone:</h5>' +
                    '<p><%= venue.phone %></p>' +
                '</div>'
        ),

        _imageCarouselTemplate: _.template(

            '<div id="<%= id %>" class="carousel slide">' +
                '<ol class="carousel-indicators">' +
                    '<% _(pictures).each(function(picture, i) { %>' +
                        '<li data-target="#carousel-item<%= i %>" data-slide-to="<%= i %>"></li>' +
                    '<% }); %>' +
                '</ol>' +
                '<div class="carousel-inner">' +
                    '<% _(pictures).each(function(picture, i) { %>' +
                        '<div class="<%= (i == 0) ? "item active" : "item" %>">' +
                            '<img class="carousel-image" <%= (i == 0) ? "src" : "srcimg" %>="<%= picture.get("url") %>"></img>' +
                            '<div class="carousel-caption">' +
                                '<h4><%= new Date(picture.createdAt).toDateString() %></h4>' +
                            '</div>' +
                        '</div>' +
                    '<% }); %>' +
                '</div>' +
                '<a class="left carousel-control" href="#<%= id %>" data-slide="prev">‹</a>' +
                '<a class="right carousel-control" href="#<%= id %>" data-slide="next">›</a>' +
              '</div>'

        ),
        delayedSearch: function(ms, action) {
            clearTimeout(this._timeout);
            this._timeout = setTimeout(action, ms);
        },

        _fileDragHover: function(e) {
            e.stopPropagation();
            e.preventDefault();
            e.target.className = (e.type == "dragover" ? "hover" : "");
        },

        _fileSelectHandler: function(e) {
            e.preventDefault();
            Hit.Views.Venues._fileDragHover(e);
            var files = e.target.files || e.dataTransfer.files;
            for (var i = 0, f; f = files[i]; i++) {
                Hit.Views.Venues._files.push(f);
            }
        },

        initVenueCreate: function() {
            var self = this;
            var xhr = new XMLHttpRequest();
            if (xhr.upload) {

                // file drop
                var filedrag = document.getElementById('filedrag');
                filedrag.addEventListener("dragover", this._fileDragHover, false);
                filedrag.addEventListener("dragleave", this._fileDragHover, false);
                filedrag.addEventListener("drop", this._fileSelectHandler, false);
                filedrag.style.display = "block";
            }

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
                }).done(function(venue) {
                    venue.addPictures(Hit.Views.Venues._files).done(function(v) {
                        
                    }).fail(function() {

                    }).always(function() {
                        $('#create-venue-modal').modal('hide');
                    });
                }).fail(function(error) {
                    $('#create-venue-error').removeClass('hide').text(error.message);
                });
            });
        }
    });

    $(function() {
        var user = Hit.User.getCurrent();
        if(!user) {
            window.location.href = '/../../index.html';
        }
        $('#logged-in-as').text(user.displayname);
        Hit.Views.Venues.initVenueCreate();
    });

    $('#venue-search-input').on('keyup', function() {
        var val = $(this).val();
        if(!_(val).isEmpty() && val !== Hit.Views.Venues._currentSearch) {
            Hit.Views.Venues.delayedSearch(500, function() {
                $('#venue-list').empty();
                Hit.Views.Venues._currentSearch = val;
                Hit.Venue.searchByName(val).done(function(venues) {
                    _(venues).each(function(v) {
                        $('#venue-list').append(Hit.Views.Venues._venueListTemplate({ data: { venue: v } }));
                    });
                }).fail(function() {
                    //todo
                });
            });
        }
    });

    $(document).on('click', '.view-venue-button', function(e) {
        e.preventDefault();
        var id = $(this).attr('venueId');
        var getVenue = Hit.Venue.getById(id);
        var getPics = Hit.Venue.getPicturesById(id);
        $.when(getVenue, getPics).done(function(venue, pictures) {
            $('#view-venue-label').text(venue.name);
            var carousel = Hit.Views.Venues._imageCarouselTemplate( { id: 'view-venue-carousel', pictures: pictures } )
            $('#view-venue-body').html(carousel + Hit.Views.Venues._venueViewTemplate( { venue: venue } ));
            $('#view-venue-modal').modal();
        }).fail(function() {
            // TODO
        });
    });

    $(document).on('slide', '#view-venue-carousel', function() {

        // Load the next 2 images
        $('#view-venue-carousel .item.active').nextAll('.item').slice(0,2).each(function() {
            var image = $(this).find('.carousel-image');
            if($(this).attr('src') === undefined) {
                image.attr('src', image.attr('srcimg'));
            }
        });
    });

    $('#create-venue-modal').on('hide', function() {
        Hit.Views.Venues._files = [];
    });

    $('#logout').on('click', function() {
        Hit.User.logOut();
        window.location.href = '../index.html';
    });

})(jQuery);