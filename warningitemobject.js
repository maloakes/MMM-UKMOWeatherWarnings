/* Magic Mirror
 * WarningObjectItem: MMM-UKMOWeatherWarnings
 *
 * By Malcolm Oakes https://github.com/maloakes
 *
 * MIT Licensed.
 *
 * This class represents an item from a Weather Warning message data from the UK Met Office.
 */

class WarningItemObject {
	constructor(warningItem) {

		this.validFrom = null
		this.validTo = null
		this.title = null
		this.description = null
		this.type = null
		this.kind = null
		this.level = null
		this.region = null

		this.parseItem(warningItem)
	}


	/*
	 * is this warning item in the isFuture?
	 * i.e. after now
	 */
	isFuture() {
		return this.validTo.isAfter()
	}

	/*
	 * parse the JSON to populate this object
	 */
	parseItem(item) {
		this.title = item.title
		this.description = item.description
		let validity = this.parseTimes(this.description)
		this.validFrom = validity[0]
		this.validTo = validity[1]
		this.region = this.parseRegion(item.link)
		this.level = item["metadata:warninglevel"]
		this.kind = item["metadata:warningkind"]
		this.type = item["metadata:warningtype"]
	}

	/*
	 * extract the region code
	 */
	parseRegion(link) {
		let rg = link.indexOf("regionName=")
		const region = link.substr(rg + 11, 2)

		return region
	}

	/*
	 * extract the valid from and valid to times
	 */
	parseTimes(description) {
		const times = []

		let vf = description.indexOf("valid from")
		let to = description.lastIndexOf(" to ")
		let fs = description.substr(vf + 11, to - vf - 11)
		let ts = description.substr(to + 4, description.length - to - 4)

		let format = "HHmm ddd DD MMM"

		let vfTime = moment(fs, format)
		let vtTime = moment(ts, format)

		times.push(vfTime)
		times.push(vtTime)

		// handle crossing the year boundary
		if(vtTime.diff(vfTime) < 0) {
			vtTime.add(1, "years")
		}

		return times
	}

	/*
	 * get the colour (level) of the warning
	 * translate AMBER to ORANGE for display
	 */
	getColor() {
		return this.level === "AMBER" ? "orange" : this.level.toLowerCase()
	}

	/*
	 * extract the type and convert to title case
	 */
	getTypeTc() {
		var str = this.type.toLowerCase().split(" ");
		for (var i = 0; i < str.length; i++) {
			if (str[i] != "and") {
				str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
			}
		}
		return str.join(" ");
	};

	/*
	 * get the validity time range
	 */
	getValidity() {
		let fmt = "ddd HH:mm"
		return this.validFrom.format(fmt) + " - " + this.validTo.format(fmt)
	}

	/*
	 * get the code for the level by extracting the first character,
	 * i.e. 'R', 'A', 'Y'
	 */
	getLevelCode() {
		return this.level.substr(0, 1)
	}

}
