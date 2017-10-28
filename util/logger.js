var moment = require('moment');

module.exports = {
    INFO: "INFO",
    ERROR: "ERROR",
    logMessage: function(level, message) {
        var timeStamp = moment().format("YYYY-MM-DD HH:mm:ss");
        var toLog = "[" + timeStamp + "] " + level + ": " + message;
        console.log(toLog);
    }
};
