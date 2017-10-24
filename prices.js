var moment = require('moment');

require('dotenv').config();

const { Pool, Client } = require('pg');

// pools will use environment variables
// for connection information
const prices = new Pool({
    user: process.env.PSQL_USER,
    host: process.env.PSQL_HOST,
    database: process.env.PSQL_DB,
    password: process.env.PSQL_PASS,
    port: process.env.PSQL_PORT
});

// stored functions
const PRICES_FOR_GAME_TWO       = "SELECT * FROM prices_for_game($1, $2, $3)";
const PRICES_FOR_GAME_ONE       = "SELECT * FROM prices_for_game($1, $2)";
const PRICES_FOR_SCRAPE         = "SELECT * FROM prices_for_scrape($1)";
const CURRENT_PRICES_FOR_TEAM   = "SELECT * FROM current_prices_for_team($1)";
const CURRENT_PRICES_FOR_DAY    = "SELECT * FROM current_prices_for_day($1)";
const INSERT_PRICES             = "SELECT insert_price($1, $2, $3, $4, $5)";

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

module.exports.insertPrice = function(scrapeTime, gameTime, homeTeam, awayTeam, price) {
    return new Promise(function(resolve, reject) {
        var query = INSERT_PRICES;
        var params = [
            scrapeTime.format("YYYY-MM-DD HH:mm:ss"),
            gameTime.format("YYYY-MM-DD HH:mm:ss"),
            homeTeam,
            awayTeam,
            price
        ];
        prices.query(query, params)
            .then(function (res) {
                // prices.end();
                resolve(res);
            })
            .catch(function (error) {
                prices.end();
                reject(error);
            });

    });
};

module.exports.endPool = function() {
    prices.end();
};
// var gameDate = moment('2017-10-22 12:31:22', "YYYY-MM-DD HH:mm:ss");
// this.currentPricesForDay(gameDate).then(function(res) {
//     console.log(res);
// });

// var gameTime = moment('2017-10-20 19:30:00', "YYYY-MM-DD HH:mm:ss");
// this.insertPrice(
//     moment("2017-10-20 12:00:00", "YYYY-MM-DD HH:mm:ss"), gameTime, "STL", "PIT", 200 
// ).catch(function(error) {
//     console.log(error);
// });

// this.getPrices({
//     // scrapeTime: moment()
//     // gameTime: moment()
//     homeTeam: "NYR",
//     awayTeam: "NYI"
// }).then(function(res) {
//     console.log(res);
// });
