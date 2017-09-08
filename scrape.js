var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');

scrape();

function scrape() {
    if(!process.argv[3]) {
        console.log("usage: node scrape <seatgeek page> \"<venue>\"");
        console.log("example: node scrape new-york-rangers-tickets \"Madison Square Garden\"");
    }
    else {
        var page = process.argv[2];
        var venue = process.argv[3];
        var SEAT_GEEK = "https://seatgeek.com/";
        getTodaysPrices(SEAT_GEEK + page, venue);
    }
}

function getTodaysPrices(forUrl, forVenue) {
    request(forUrl, function(error, resopnse, html) {
        if(!error) {
            var $ = cheerio.load(html);

            $('.page-event-listing').filter(function() {
                var data = $(this);
                var title = data.children('.event-listing-details').first()
                                .children('.event-listing-title').first()
                                .children().first().text().trim();

                var location = data.children('.event-listing-details').first()
                                   .children('.event-listing-location').first()
                                   .children('.event-listing-location-text').first()
                                   .children('.event-listing-venue-link').first()
                                   .children().first().text().trim();

                var preseason = title.toLowerCase().indexOf('preseason') > -1;

                // TODO pass as parameter
                var atVenue = location.toLowerCase().indexOf(forVenue.toLowerCase()) > -1;
                return (!preseason && atVenue);
            }).each(function() {
                var data = $(this);
                var title = data.children('.event-listing-details').first()
                                .children('.event-listing-title').first()
                                .children().first().text().trim();
                console.log(title);
            });
        }
    });
}
