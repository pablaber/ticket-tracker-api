var mongoose = require('mongoose');

var pricesSchema = mongoose.Schema({
    dayOfScrape: String,
    todaysPrices: {}
});

module.exports.getCollection = function(name) {
    pricesSchema.set('collection', name);
    return mongoose.model(name, pricesSchema);
};
