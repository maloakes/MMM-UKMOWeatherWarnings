/* Magic Mirror
 * WarningsObject: MMM-UKMOWeatherWarnings
 *
 * By Malcolm Oakes https://github.com/maloakes
 *
 * MIT Licensed.
 *
 * This class represents Weather Warning message data from the UK Met Office.
 * This will contain 0 or more WarningItemObjects.
 */

class WarningsObject {
	constructor(warningsResult) {

		this.title = warningsResult.title
		this.items = null
		this.ordering = null

		// build the Warning Item ordering map
		this.buildOrdering()

		// create the list of Warning items
		var itemList = []
		for (var i in warningsResult.items) {
			const item = new WarningItemObject(warningsResult.items[i])
			// only add the item is valid in the future
			if (item.isFuture()) {
			  itemList.push(item)
			}
		}

		// sort the list if it contains objects
		if (itemList.length > 0) {
			this.items = itemList.sort(function(a,b){return a.validFrom.diff(b.validFrom)})
		}
	}

	/*
	 * get colour (severity) of item
	 */
	getColor(idx) {
		return this.items[idx].getColor()
	}

	/*
	 * get type of item
	 */
	getTypeTc(idx) {
		return this.items[idx].getTypeTc()
	}

	/*
	 * get validity of item
	 */
	getValidity(idx) {
		this.items[idx].getValidity()
	}

	/*
	 * get the maximum current warning
	 */
	getMaxCurrentWarn(delta) {
		// get warnings that are now current
		// return level and info of highest level

		let ordArray = this.getMaxPeriodWarn("current", delta)

		// just return level and type (title case)
		let res = {}
		if (ordArray) {
		    res[0] = ordArray.length > 0 ? { level: ordArray[0].getLevelCode(),
			     color: ordArray[0].getColor(),
			     type: ordArray[0].getTypeTc() } : null
		}
		return res
	}

	/*
	 * determine the warnings for the required period
	 * parameter:
	 *  mode: current - active now
	 *        today   - active from now to midnight
	 *        day     - active on day specified by offset
	 *  offset:
	 *    mode = 'current' - offset (in minutes) from now
	 *    mode = 'day' - offset (in days) from today
	 */
	getMaxPeriodWarn(mode, offset) {

	    if (this.items) {

			let newArray = null

			switch (mode) {
			case "current":
				// get warnings that are now current
				// return level and info of highest level
			  newArray = this.items.filter(function (el) {
		  		return el.validFrom.isBefore(moment().add(offset, "minutes")) && el.validTo.isAfter(moment())
				});
				break;
			case "today":
				// get warnings active from now until end of day
				// return highest
				// Vf < Ed & Vt > Nw
				newArray = this.items.filter(function (el) {
				  return el.validFrom.isBefore(moment().endOf("day")) && el.validTo.isAfter(moment())
				});
				break;
			case "day":
				// get warnings active during the day
				// return highest
				// Vf < Ed & Vt > Sd
				newArray = this.items.filter(function (el) {
				  return el.validFrom.isBefore(moment().add(offset, "days").endOf("day")) && el.validTo.isAfter(moment().add(offset, "days").startOf("day"))
				});
				break;
			}
			return this.sortByLevel(newArray)
	    } else {
			return null
	    }
	}

	/*
	 * Get the highest level warning for each day of the period
	 */
	getMaxWarnFcList(listSize) {
		// get warnings from now to end of today
		// & get warnings the following days
		// return highest level for each day
		let fcArray = []
		let tmp = this.getMaxPeriodWarn("today", null)
		fcArray.push(tmp && tmp.length > 0 ? tmp[0] : null)

		for (let offset = 1; offset < listSize; offset++) {
		  let tmp = this.getMaxPeriodWarn("day", offset)
		  fcArray.push(tmp && tmp.length > 0 ? tmp[0] : null)
		}

		let res = {}
		for (let i in fcArray) {
		  res[i] = fcArray[i] != null ? { level: fcArray[i].getLevelCode(),
			     color: fcArray[i].getColor(),
			     type: fcArray[i].getTypeTc() } : null
		}

		return res
	}

	/*
	 * sort the list by level
	 */
	sortByLevel(warnArray) {
		let ord = this.ordering
		var ordArray = warnArray.sort( function(a, b) {
			return (ord[a.level] - ord[b.level]) || a.type.localeCompare(b.type);
		});

		return ordArray
	}

	/*
	 * build the ordering map in the constuctor by calling this
	 * The warning items should be sorted in order of severity
	 */
	buildOrdering(warnArray) {
	  this.ordering = {} // map for efficient lookup of sortIndex
	  let sortOrder = ["RED","AMBER","YELLOW"];
	  for (let i=0; i<sortOrder.length; i++) {
	    this.ordering[sortOrder[i]] = i;
	  }
	}

}
