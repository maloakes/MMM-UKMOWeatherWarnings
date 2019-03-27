/* Magic Mirror
 * Module: MMM-UKMOWeatherWarnings
 *
 * By Malcolm Oakes https://github.com/maloakes
 *
 * MIT Licensed.
 *
 * Gets Weather warnings from the UK Met Office feed.
 * These can be dispayed in tabular format.
 * Optionally Notify waring data for use by other modules.
 */

Module.register("MMM-UKMOWeatherWarnings", {
	defaults: {
		updateInterval: 900000, //15 mins
		retryDelay: 5000,
		tableClass: "small",
		apiBase: null,
		region: null,
		colored: true,
		broadcastCurrent: true,
		broadcastForecast: true,
		broadcastListSize: 5, // size of the forecast warnings list to broadcast
		useTestData: false,
		testUrl: null,
		backgroundMode: false,
		delta: 0, //minutes
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		var self = this;
		var dataRequest = null;
		var dataNotification = null;
		var warningsData = null;

		//Flag for check if module is loaded
		this.loaded = false;

		//Do this once first
		self.sendSocketNotification("MMM-UKMOWeatherWarnings-WARNINGS-REQ", this.getUrl());


		// Schedule update timer.
		setInterval(function() {
			self.sendSocketNotification("MMM-UKMOWeatherWarnings-WARNINGS-REQ", self.getUrl());
			self.updateDom();
		}, this.config.updateInterval);
	},

	/*
	 * build the URL string
	 */
	getUrl: function() {
		return this.config.useTestData ? this.config.testUrl : this.config.apiBase + this.config.region
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.sendSocketNotification("\"MMM-UKMOWeatherWarnings-WARNINGS-REQ", null);
		}, nextLoad);
	},



	getScripts: function() {
		return [
			"warningsobject.js",
			"warningitemobject.js",
		];
	},

	getStyles: function () {
		return [
			"font-awesome.css",
			"MMM-UKMOWeatherWarnings.css",
		];
	},

	getTemplate: function () {
		return "MMM-UKMOWeatherWarnings.njk"
	},

	getTemplateData: function () {
		return {
			config: this.config,
			warnings: this.warningsData
		}
	},

	// Load translations files
	getTranslations: function() {
		return {
			en: "translations/en.json",
			es: "translations/es.json"
		};
	},


	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {

		if(notification === "MMM-UKMOWeatherWarnings-WARNINGS-RESULT") {
			// set dataNotification

			this.warningsData = new WarningsObject(payload);
			this.broadcastWarnings()

			this.updateDom();
		}
	},

	/*
	 * broadcast notifications to other modules if required
	 */
	broadcastWarnings: function() {
		if (this.config.broadcastCurrent) {
			var resCurr = this.warningsData.getMaxCurrentWarn(this.config.delta)
			this.sendNotification("WEATHER-WARNING-CURRENT", resCurr)
		}
		if (this.config.broadcastForecast) {
			var resFcList = this.warningsData.getMaxWarnFcList(this.config.broadcastListSize)
			this.sendNotification("WEATHER-WARNING-FORECAST", resFcList)
		}
	},


});
