var mongoose = require('mongoose');

var Prices = require('./prices');

main();

function main() {
    /*
        planning
        node query <seatgeek page> <query type>
    */
    query("new-york-giants-tickets");
}

function query(page) {
    mongoose.connect('mongodb://localhost/ticket-tracker', {
        useMongoClient: true
    });
    var db = mongoose.connection;
    var priceCollection = Prices.getCollection(page);
    Prices.getTicketPrices(priceCollection, "20170914", function(error, docs) {
        console.log(docs);
    }); 
    db.close();
}
