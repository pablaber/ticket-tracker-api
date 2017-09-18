var mongoose = require('mongoose');
var moment = require('moment');

var Prices = require('./prices');

main();

/**
 * Validates parameters and then calls the main query method.
 */
function main() {
    validateParameters(process.argv).then(function() {
        var seatgeekPage = process.argv[2];
        var type = process.argv[3];
        var date = process.argv[4];
        query(seatgeekPage, type, date);
    });
}

/**
 * Queries the database and returns the output
 * 
 * @param {string} page the seat geek page to be queried
 * @param {string} type the type of query to execute, either "date" or "game"
 * @param {string} date the date of the query to execute 
 */
function query(page, type, date) {
    mongoose.connect('mongodb://localhost/ticket-tracker', {
        useMongoClient: true
    });
    var db = mongoose.connection;
    var priceCollection = Prices.getCollection(page);
    if(type === "date") {
        getPricesForDate(priceCollection, date).then(function(daysPrices) {
            printPricesForDate(daysPrices);
        });
    }
    else if(type === "game") {
        getPricesForGame(priceCollection, date).then(function(gamesPrices) {
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
 * Prints the results of 'getPricesForDate' to the terminal
 * 
 * @param {Object} priceObj the price object returned from getPricesForDate
 */
function printPricesForDate(priceObj) {
    console.log("---------------------------------------");
    Object.keys(priceObj).forEach(function (val) {
        var obj = priceObj[val];
        var gameTime = moment(obj.datetime, "YYYY-MM-DD h:mm a");
        console.log(gameTime.format("dddd, MMMM Do YYYY, h:mm a"));
        console.log(obj.title);
        console.log("Price: $%d", obj.price);
        console.log("---------------------------------------");

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
 * Prints the results of 'getPricesForGame' to the terminal
 * 
 * @param {Object} priceObj the price object returned from getPricesForGame
 */
function printPricesForGame(priceObj) {
    console.log("---------------------------------------");
    priceObj.forEach(function(val) {
        var scrapeDate = moment(val.dayOfScrape, "YYYYMMDD");
        console.log(scrapeDate.format("ddd, MMM D"));
        console.log("$%d", val.price.price);
        console.log("---------------------------------------");
    });  
}

/**
 * Validates the input parameters when calling the main method.
 * Throws an error if there are problems with the parameters.
 * 
 * @param {string[]} parameters 
 */
function validateParameters(parameters) {
    return new Promise(function(resolve) {
        var error = false;
        var message = "";
        var types = ["date", "game"];
        if (parameters.length != 5) {
            error = true;
            message += "Invalid Parameters\n";
            message += "Number of parameters is incorrect.\n";
        }
        else if(types.indexOf(parameters[3]) === -1) {
            error = true;
            message += "Invalid <type> Parameter\n";
            message += "<type> must be either \"date\" or \"game\".\n";
        }
        else if(!moment(parameters[4], "YYYYMMDD").isValid()) {
            error = true;
            message += "Invalid <date> Parameter\n";
            message += "<date> must be a valid date in the form YYYYMMDD.\n";
        }
        message += "Usage: node query <seatgeek page> <type> <date>";
        if (error) {
            throw new Error(message);
        }
        resolve();
    });
    
}