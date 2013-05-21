(function($) {

    Hit.provide('Hit.Views.Venues');

    _(Hit.Views.Venues).extend({
        _files: [],
        _currentSearch: null,
        _timeout: null,
        _venueListTemplate: _.template('<li>' +
            '<div class="well well-large">' +
                '<% if(venue.pictures && !_(venue.pictures).isEmpty()) { %>' +
                    '<img class="venue-list-img img-polaroid" src="<%= _(venue.pictures).first() %>"></img>' +
                '<% } %>' +
                '<p class="help-inline venue-list-name"><%= venue.name %></p>' +
            '</div></li>'),

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

            $('#create-venue-modal').on('hide', function() {
                self._files = [];
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
                        $('#venue-list').append(Hit.Views.Venues._venueListTemplate({ venue: v }));
                    });
                }).fail(function() {
                    //todo
                });
            });
        }
    });

    $('#logout').on('click', function() {
        Hit.User.logOut();
        window.location.href = '../index.html';
    });

})(jQuery);