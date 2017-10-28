var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var mongoose = require('mongoose');

var Prices = require('./prices');
var Logger = require('./logger');
var Teams = require('./teamAbbreviations');

var SEAT_GEEK = "https://seatgeek.com/";

scrape();

function scrape() {
    Logger.logMessage(Logger.INFO, "Starting scrape");
    validateParameters(process.argv);
    if(!process.argv[2]) {
        console.log("usage: node scrape <seatgeek page>");
        console.log("example: node scrape new-york-rangers-tickets");
    }
    else {
        var page = process.argv[2];
        getTodaysPrices(SEAT_GEEK + page).then(function(todaysPrices) {
            updateDb(todaysPrices);
        }, function(error) {
            console.log(error);
        });
    }
}

function getTodaysPrices(forUrl) {
    Logger.logMessage(Logger.INFO, "Getting prices for url: " + forUrl);
    return new Promise(function(resolve, reject) {
        var todaysPrices = {};

        request(forUrl, function(error, resopnse, html) {
            if(!error) {
                var $ = cheerio.load(html);

                var pages = [forUrl];
                $('ul.pagination-list').children()
                    .not('.paging-first')
                    .not('.next-template')
                    .children().each(function() {
                        pages.push($(this).attr("href"));
                    });

                var scrapedPages = 0;
                var prices = new Array(pages.length).fill([]);
                for(let i in pages) {
                    request(pages[i], function(e, r, h) {
                        if(!e) {
                            var $ = cheerio.load(h);

                            $(".page-event-listing").each(function() {
                                var datetimeString = $(this).children(".event-listing-datetime").first()
                                    .children(".event-listing-time").first().attr("datetime").split("T").join(" ");
                                var gameTime = moment(datetimeString, "YYYY-MM-DD HH:mm");
                                var titleString = $(this).children(".event-listing-details").first()
                                    .children(".event-listing-title").first().children().first().text();
                                var teams = titleString.split(" at ");
                                var awayTeam = Teams.getAbbreviation(teams[0].trim());
                                var homeTeam = Teams.getAbbreviation(teams[1].trim());
                                if(!awayTeam || !homeTeam) {
                                    var errmsg = "Unable to parse home or away team with titleString: " + titleString;
                                    Logger.logMessage(Logger.ERROR, errmsg);
                                    throw new Error(errmsg);
                                }
                                var price = parseInt($(this).children('.event-listing-button').first().text().trim().substring(6));
                                var uniqueKey = datetimeString + awayTeam + homeTeam;
                                var toInsert = {
                                    uniqueKey: uniqueKey,
                                    gameTime: gameTime,
                                    awayTeam: awayTeam,
                                    homeTeam: homeTeam,
                                    price: price
                                };
                                prices[i].push(toInsert);

                            });

                            scrapedPages++;
                            if(scrapedPages === pages.length) {
                                Logger.logMessage(Logger.INFO, "Finished getting prices");
                                resolve(prices);
                            }
                        }
                        else {
                            Logger.logMessage(Logger.ERROR, "Error in pagination URL");
                            reject("Error in pagination URL");
                        }
                    });
                }
            }
            else {
                Logger.logMessage(Logger.ERROR, "Error in input URL");
                reject("Error in input URL");
            }
        });

    });

}

function updateDb(todaysPrices) {
    Logger.logMessage(Logger.INFO, "Updating database");
    var scrapeTime = moment();
    var uniqueKeys = [];
    var uniquePrices = [];
    for(let i in todaysPrices) {
        for(let j in todaysPrices[i]) {
            var todaysPrice = todaysPrices[i][j];
            if(uniqueKeys.indexOf(todaysPrice.uniqueKey) === -1) {
                uniqueKeys.push(todaysPrice.uniqueKey);
                uniquePrices.push(todaysPrice);
            }
        }
    }
    var pricesUploaded = 0;
    for(var uniquePrice of uniquePrices) {
        
        Prices.insertPrice(scrapeTime, uniquePrice.gameTime, uniquePrice.homeTeam, uniquePrice.awayTeam, uniquePrice.price).then(function() {
            pricesUploaded++;
            if(pricesUploaded === uniquePrices.length) {
                Logger.logMessage(Logger.INFO, "Updating database finished");
                Prices.endPool();
            }
        }).catch(function(error) {
            Logger.logMessage(Logger.ERROR, "Error in updating database: " + error);
        });
    }
}

function validateParameters(parameters) {
    var error = false;
    var message = "";
    if(process.argv.length !== 3 ) {
       error = true;
       message = "Invalid Parameters\n";
       message += "Number of parameters is incorrect.\n";
    }

    message += "Usage: node scrape <seatgeek page>"; 
    if(error) {
        throw new Error(message);
    }
}
