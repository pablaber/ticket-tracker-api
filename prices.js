var moment = require('moment');

const { Pool, Client } = require('pg');

// pools will use environment variables
// for connection information
const prices = new Pool();

/**
 * Returns the queried database entries based off of the options given.
 * The options object contains the follwing keys:
 * 
 *      scrapeTime  moment - the day of the scrape
 *      gameTime    moment - the day of the game
 *      homeTeam    string - the home team abbreviation
 *      awayTeam    string - the away team abbreviation
 * 
 * Each of these conditions is optional, but when included it will be
 * logically AND'ed together with the other parameters to narrow down the
 * results.
 * 
 * @param {Object} options the options object (see above)
 * @returns {Object[]} the rows of the result in an array
 */
module.exports.getPrices = function(options) {
    return new Promise(function(resolve, reject) {
        var params = [];
        var query = "SELECT * FROM PRICES\n";
        var i = 0;
        for(var key of Object.keys(options)) {
            if(i == 0) {
                query += "WHERE ";
                i++;
            }
            else {
                query += "AND ";
                i++;
            }
            switch(key) {
                case "scrapeTime":
                    query += "scrape_time > $" + i + "::date\n";
                    query += "AND scrape_time < $" + i + "::date + interval '1 day'\n";
                    params.push(options[key].format("YYYY-MM-DD hh:mm:ss"));
                    break;
                case "gameTime":
                    query += "game_time > $" + i + "::date\n";
                    query += "AND game_time < $" + i + "::date + interval '1 day'\n";
                    params.push(options[key].format("YYYY-MM-DD hh:mm:ss"));
                    break;
                case "homeTeam":
                    query += "home_team = $" + i + "\n";
                    params.push(options[key]);
                    break;
                case "awayTeam":
                    query += "away_team = $" + i + "\n";
                    params.push(options[key]);
                    break;
            }
            
        }
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
