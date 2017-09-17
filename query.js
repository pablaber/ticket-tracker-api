var mongoose = require('mongoose');
var moment = require('moment');

var Prices = require('./prices');

main();

/**
 * Validates parameters and then calls the main query method.
 */
function main() {
    /*
        planning
        node query <seatgeek page> <query type>
    */
    query("new-york-giants-tickets", "game");
}

/**
 * Queries the database and returns the output
 * 
 * @param {string} page the seat geek page to be queried
 */
function query(page, type) {
    mongoose.connect('mongodb://localhost/ticket-tracker', {
        useMongoClient: true
    });
    var db = mongoose.connection;
    var priceCollection = Prices.getCollection(page);
    if(type === "date") {
        getPricesForDate(priceCollection, "20170916").then(function(daysPrices) {
            printPricesForDate(daysPrices);
        });
    }
    else if(type === "game") {
        getPricesForGame(priceCollection, "20170918").then(function(gamesPrices) {
            printPricesForGame(gamesPrices);
        });
    }
    db.close();
}

/**
 * Returns all of the prices for a specified date
 * 
 * @param {obj} priceCollection the mongoose object for the collection of prices
 * @param {string} date the date that is being queried in the databse
 */
function getPricesForDate(priceCollection, date) {
    return new Promise(function (resolve) {
        Prices.getTicketPricesForDate(priceCollection, date, function (error, docs) {
            resolve(docs.todaysPrices);
        }); 
    });  
}

/**
 * Returns an array of prices for a specified game
 * 
 * @param {obj} priceCollection 
 * @param {string} gameDate 
 */
function getPricesForGame(priceCollection, gameDate) {
    return new Promise(function(resolve) {
        Prices.getTicketPrices(priceCollection, function(error, docs) {
            var gamePrice = docs.map(function(scrapeDay) {
                return {
                    dayOfScrape: scrapeDay.dayOfScrape,
                    price: scrapeDay.todaysPrices[gameDate]
                };
            });
            resolve(gamePrice);
        });
    });
}

/**
 * Prints the results of 'getPricesForDate' to the terminal
 * 
 * @param {*} priceObj the price object returned from getPricesForDate
 */
function printPricesForDate(priceObj) {
    console.log("---------------------------------------");
    Object.keys(priceObj).forEach(function(val) {
        var obj = priceObj[val];
        var gameTime = moment(obj.datetime, "YYYY-MM-DD h:mm a");
        console.log(gameTime.format("dddd, MMMM Do YYYY, h:mm a"));
        console.log(obj.title);
        console.log("Price: $%d", obj.price);
        console.log("---------------------------------------");
        
    });
}

function printPricesForGame(priceObj) {
    console.log("---------------------------------------");
    priceObj.forEach(function(val) {
        var scrapeDate = moment(val.dayOfScrape, "YYYYMMDD");
        console.log(scrapeDate.format("ddd, MMM D"));
        console.log("$%d", val.price.price);
        console.log("---------------------------------------");
    });  
}