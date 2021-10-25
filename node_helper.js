/* Magic Mirror
 * Node Helper: MMM-UKMOWeatherWarnings
 *
 * By Malcolm Oakes https://github.com/maloakes
 *
 * MIT Licensed.
 */
const FeedMe = require("feedme")
const http = require("http")
const moment = require("moment")
const fs = require("fs")
var NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

	// Subclass start method.
	start: function() {
		console.log("Started node_helper.js for MMM-UKMOWeatherWarnings.");
	},

	// Override socketNotificationReceived method.

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
	socketNotificationReceived: function(notification, payload) {

		if (notification === "MMM-UKMOWeatherWarnings-WARNINGS-REQ") {
			this.warningsRequest(payload)
		}
	},

	/*
	 * request for the warning message
	 * get the message from the feed
	 * notify the module
	 */
	warningsRequest: function(url) {
		self = this

		https.get(url, (res) => {
		  if (res.statusCode != 200) {
		    console.error(new Error(`status code ${res.statusCode}`))
		    return
		  }
		  var parser = new FeedMe(true)

		  res.pipe(parser)
		  parser.on("end", () => {
		    res = parser.done()
				self.sendSocketNotification("MMM-UKMOWeatherWarnings-WARNINGS-RESULT", res);

		  })
		})
	},

});
