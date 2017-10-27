var moment = require('moment');

module.exports = {
    logMessage: function(message) {
        var timeStamp = moment().format("YYYY-MM-DD HH:mm:ss");
        var toLog = "[" + timeStamp + "]: " + message;
        console.log(toLog);
    }
};
