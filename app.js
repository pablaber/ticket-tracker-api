var express = require("express");
var app = express();
var moment = require("moment");

var Prices = require("./scrape/prices");

require("dotenv").config({ path: __dirname + "/.env" });

app.get("/api/prices_for_game", function(req, res) {
    var params = req.query;
    var gameTime = params.game_time;
    var homeTeam = params.home_team;
    var awayTeam = params.away_team;
    var team = params.team;
    if(!gameTime) {
        res.status(422);
        res.send("Invalid Request: must have 'game_time' parameter in the format YYYYMMDDHHmm.");
    }
    else if(!((!homeTeam && !awayTeam) || !team)) {
        res.status(422);
        res.send("Invalid Request: must have at least 'home_team' and 'away_team', or just 'team' parameter.");
    }
    else if(!!homeTeam && !!awayTeam && !!team) {
        res.status(422);
        res.send("Invalid Request: can't have 'home_team', 'away_team', and 'team' parameters.")
    }
    else {
        var gameTimeMoment = moment(gameTime, "YYYYMMDDHHmm");
        if(!team) {
            Prices.pricesForGame(gameTimeMoment, homeTeam, awayTeam).then(function(response) {
                res.send(response);
            }).catch(function(error) {
                res.send(error);
            });
        }
        else {
            Prices.pricesForGame(gameTimeMoment, team).then(function(response) {
                res.send(response);
            }).catch(function(error) {
                res.send(error);
            });
        }
    }
});

app.get("/api/prices_for_scrape", function(req, res) {
    var params = req.query;
    var scrapeTime = params.scrape_time;
    if(!scrapeTime) {
        res.status(422);
        res.send("Invalid Request: must have 'scrape_time' parameter in the format YYYYMMDDHHmmss");
    }
    else {
        var scrapeTimeMoment = moment(scrapeTime, "YYYYMMDDHHmmss");
        Prices.pricesForScrape(scrapeTimeMoment).then(function(response) {
            res.send(response);
        }).catch(function(error) {
            res.send(error);
        });
    }
});

app.get("/api/current_prices_for_team", function(req, res) {
    var params = req.query;
    var team = params.team;
    if(!team) {
        res.status(422);
        res.send("Inalid Request: must have 'team' parameter.");
    }
    else {
        Prices.currentPricesForTeam(team).then(function(response) {
            res.send(response);
        }).catch(function(error) {
            res.send(error);
        });
    }
});

app.get("/api/current_prices_for_day", function(req, res) {
    var params = req.query;
    var day = params.day;
    if(!day) {
        res.status(422);
        res.send("Invalid Request: must have 'day' parameter in the format YYYYMMDD");
    }
    else {
        var dayMoment = moment(day, "YYYYMMDD");
        Prices.currentPricesForDay(dayMoment).then(function(response) {
            res.send(response)
        }).catch(function(error) {
            res.send(error);
        });
    }
});

app.get("*", function(req, res) {
    res.status(404);
    res.send();
});

app.listen(process.env.API_PORT);
console.log("app started on port " + process.env.API_PORT);