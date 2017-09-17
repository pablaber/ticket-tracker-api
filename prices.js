var mongoose = require('mongoose');
var moment = require('moment');

var pricesSchema = mongoose.Schema({
    dayOfScrape: String,
    todaysPrices: {}
});

/**
 * Returns the mongoose collection with the given name
 * 
 * @param {string} name the name of the model
 * @returns {mongoose collection} the mongoose collection with the specified name
 */
module.exports.getCollection = function(name) {
    pricesSchema.set('collection', name);
    return mongoose.model(name, pricesSchema);
};

/**
 * Returns all the prices in the collection
 * 
 * @param {mongoose collection} collection
 * @param {function} callback the callback function
 * @returns {Object[]} a list of all prices in the collection 
 */
module.exports.getTicketPrices = function(collection, callback) {
    return collection.find({}, callback);
};

/**
 * Returns the prices for the specified date in the specified collection
 * 
 * @param {mongoose collection} collection
 * @param {string} date in the form YYYYMMDD
 * @param {function} callback the callback function
 * @returns {Object} the list of prices for the given date
 */
module.exports.getTicketPricesForDate = function(collection, date, callback) {
    return collection.findOne({dayOfScrape: date}, callback);
};
