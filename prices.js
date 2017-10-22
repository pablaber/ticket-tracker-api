var moment = require('moment');

const { Pool, Client } = require('pg');

// pools will use environment variables
// for connection information
const prices = new Pool();

// stored functions
const PRICES_FOR_GAME_TWO       = "SELECT * FROM prices_for_game($1, $2, $3)";
const PRICES_FOR_GAME_ONE       = "SELECT * FROM prices_for_game($1, $2)";
const PRICES_FOR_SCRAPE         = "SELECT * FROM prices_for_scrape($1)";
const CURRENT_PRICES_FOR_TEAM   = "SELECT * FROM current_prices_for_team($1)";
const CURRENT_PRICES_FOR_DAY    = "SELECT * FROM current_prices_for_day($1)";

module.exports.pricesForGame = function(gameTime, homeTeam, awayTeam) {
    return new Promise(function(resolve, reject) {
        var query = PRICES_FOR_GAME_TWO;
        var params = [gameTime.format("YYYY-MM-DD HH:mm:ss"), homeTeam, awayTeam];
        prices.query(query, params)
            .then(function (res) {
                prices.end();
                resolve(res.rows);
            })
            .catch(function (error) {
                prices.end();
                reject(error);
            });
    });
};

module.exports.pricesForGame = function(gameTime, team) {
    return new Promise(function (resolve, reject) {
        var query = PRICES_FOR_GAME_ONE;
        var params = [gameTime.format("YYYY-MM-DD HH:mm:ss"), team];
        prices.query(query, params)
            .then(function (res) {
                prices.end();
                resolve(res.rows);
            })
            .catch(function (error) {
                prices.end();
                reject(error);
            });
    });
};

module.exports.pricesForScrape = function(scrapeTime) {
    return new Promise(function (resolve, reject) {
        var query = PRICES_FOR_SCRAPE;
        var params = [scrapeTime.format("YYYY-MM-DD HH:mm:ss")];
        prices.query(query, params)
            .then(function (res) {
                prices.end();
                resolve(res.rows);
            })
            .catch(function (error) {
                prices.end();
                reject(error);
            });
    });
};

module.exports.currentPricesForTeam = function(team) {
    return new Promise(function (resolve, reject) {
        var query = CURRENT_PRICES_FOR_TEAM;
        var params = [team];
        prices.query(query, params)
            .then(function (res) {
                prices.end();
                resolve(res.rows);
            })
            .catch(function (error) {
                prices.end();
                reject(error);
            });
    });
};

module.exports.currentPricesForDay = function (gameTime) {
    return new Promise(function (resolve, reject) {
        var query = CURRENT_PRICES_FOR_DAY;
        var params = [gameTime.format("YYYY-MM-DD HH:mm:ss")];
        prices.query(query, params)
            .then(function (res) {
                prices.end();
                resolve(res.rows);
            })
            .catch(function (error) {
                prices.end();
                reject(error);
            });
    });
};

/**
 * Inserts multiple prices into the price database.
 * The priceArray is an array of objects similar to the object from getPrices:
 * 
 *      scrapeTime  moment    the day of the scrape
 *      gameTime    moment    the day of the game
 *      homeTeam    string    the home team abbreviation
 *      awayTeam    string    the away team abbreviation
 *      price       integer   the price of the game
 * 
 * All of these conditions are mandatory for each row that is to be inserted.
 */
module.exports.insertPrices = function(priceArray) {
    return new Promise(function(resolve, reject) {
        var query = "INSERT INTO prices (scrape_time, game_time, home_team, away_team, price) VALUES\n";
        var i = 0;
        for(var priceObj of priceArray) {
            i++;
            var params = [
                "'" + priceObj.scrapeTime.format("YYYY-MM-DD hh:mm:ss") + "'",
                "'" + priceObj.gameTime.format("YYYY-MM-DD hh:mm:ss") + "'",
                "'" + priceObj.homeTeam + "'",
                "'" + priceObj.awayTeam + "'",
                priceObj.price
            ];
            query += "( " + params.join(', ') + " )";
            if(i != priceArray.length) {
                query += ",\n";
            }
            
        }
        prices.query(query)
            .then(function (res) {
                prices.end();
                resolve(res.rows);
            })
            .catch(function (error) {
                prices.end();
                reject(error);
            });

    });
};

var gameDate = moment('2017-10-22 12:31:22', "YYYY-MM-DD HH:mm:ss");
this.currentPricesForDay(gameDate).then(function(res) {
    console.log(res);
});

// this.insertPrices([
//     {scrapeTime: moment(), gameTime: moment(), homeTeam: "NYR", awayTeam: "NYI", price: 200},
//     {scrapeTime: moment(), gameTime: moment(), homeTeam: "STL", awayTeam: "PIT", price: 250 }    
// ]);

// this.getPrices({
//     // scrapeTime: moment()
//     // gameTime: moment()
//     homeTeam: "NYR",
//     awayTeam: "NYI"
// }).then(function(res) {
//     console.log(res);
// });
