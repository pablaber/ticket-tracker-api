var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var mongoose = require('mongoose');

var Prices = require('./prices');

var SEAT_GEEK = "https://seatgeek.com/";

scrape();

function scrape() {
    validateParameters(process.argv);
    if(!process.argv[3]) {
        console.log("usage: node scrape <seatgeek page> \"<venue>\"");
        console.log("example: node scrape new-york-rangers-tickets \"Madison Square Garden\"");
    }
    else {
        var page = process.argv[2];
        var venue = process.argv[3];
        getTodaysPrices(SEAT_GEEK + page, venue).then(function(todaysPrices) {
            updateDb(todaysPrices, page);
        }, function(error) {
            console.log(error);
        });
    }
}

function getTodaysPrices(forUrl, forVenue) {
    return new Promise(function(resolve, reject) {
        var todaysPrices = {};

        request(forUrl, function(error, resopnse, html) {
            if(!error) {
                var $ = cheerio.load(html);

                var dates = [];
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

                    var date = data.children('.event-listing-datetime').first()
                                   .children('.event-listing-date').first().text().trim();

                    var duplicate = dates.indexOf(date) > -1;

                    if(!duplicate) {
                        dates.push(date);
                    }

                    var preseason = title.toLowerCase().indexOf('preseason') > -1;

                    var atVenue = location.toLowerCase().indexOf(forVenue.toLowerCase()) > -1;
                    return (!preseason && atVenue && !duplicate);
                }).each(function() {
                    var data = $(this);
                    var title = data.children('.event-listing-details').first()
                                    .children('.event-listing-title').first()
                                    .children().first().text().trim();

                    var date = data.children('.event-listing-datetime').first()
                                   .children('.event-listing-date').first().text().trim().replace(/ +(?= )/g,'');

                    var time = data.children('.event-listing-datetime').first()
                                   .children('.event-listing-time').first().text().trim().replace(/ +(?= )/g,'');

                    var price = parseInt(data.children('.event-listing-button').first().text().trim().substring(6));

                    var datetime = moment(date + " " + time, "MMM D ddd h:mm a");

                    if(datetime.diff(moment()) < 0) {
                        datetime.add(1, 'years');
                    }

                    var gameid = datetime.format("YYYYMMDD");

                    todaysPrices[gameid] = {
                        title: title,
                        datetime: datetime.format("YYYY-MM-DD h:mm a"),
                        price: price
                    };
                });

                resolve(todaysPrices);
            }
            else {
                reject(-1);
            }
        });

    });

}

function updateDb(todaysPrices, page) {
    mongoose.connect('mongodb://localhost/ticket-tracker', {
        useMongoClient: true
    });
    var db = mongoose.connection;
    var priceCollection = Prices.getCollection(page);
    var todaysKey = moment().format("YYYYMMDD");
    var newEntry = {
        dayOfScrape: todaysKey,
        todaysPrices: todaysPrices
    };

    priceCollection.update({dayOfScrape: todaysKey}, newEntry, {upsert: true}, function(err, resp) {
        console.log(resp);
    });

    db.close();
}

function validateParameters(parameters) {
    var error = false;
    var message = "";
    if(process.argv.length !== 4 ) {
       error = true;
       message = "Invalid Parameters\n";
       message += "Number of parameters is incorrect.\n";
    }

    message += "Usage: node scrape <seatgeek page> \"<venue>\""; 
    if(error) {
        throw new Error(message);
    }
}
