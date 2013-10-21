'use strict';

app.utils = (function() {
	var utils = {};

	utils.AjaxAsyncTask = function(active) {
		app.log("app.utils.AjaxAsyncTask: new task created");
		this.cancelled = false;
		this.active = active;
		this.jqXHR = null;
	};

	utils.AjaxAsyncTask.prototype.cancel = function() {
		app.log("app.utils.AjaxAsyncTask: cancel request");
		if (this.jqXHR) {
			app.log("app.utils.AjaxAsyncTask: ajax call aborted");
			this.jqXHR.abort();
		}
		this.cancelled = true;
	};

	function padZero(number) {
		if (number < 10) {
			return '0' + number;
		}
		return number.toString();
	};

	utils.formatDate = function(date, separator) {
		return [ padZero(date.getDate()), padZero(date.getMonth() + 1), date.getFullYear() ].join(separator);
	};

	utils.formatIsoDate = function(date, separator) {
		return [ date.getFullYear(), padZero(date.getMonth() + 1), padZero(date.getDate()) ].join(separator);
	};

	utils.formatTimestamp = function(unixTimestamp) {
	    var dt = new Date(unixTimestamp);
	    var hours = dt.getHours() -1;
	    var minutes = dt.getMinutes();
	    var seconds = dt.getSeconds();
	    if (hours < 10)   hours = '0' + hours;
	    if (minutes < 10) minutes = '0' + minutes;
	    if (seconds < 10) seconds = '0' + seconds;
	    return hours + ":" + minutes + ":" + seconds;
	} ;
    
    utils.convertTimestampToDate = function(date,separator) {
        var dt = new Date(date);
        return app.utils.formatDate(dt,separator);
    } ;
    
    utils.convertTimestampToDateIso = function(date,separator) {
        var dt = new Date(date);
        return app.utils.formatIsoDate(dt,separator);
    } ;
	return utils;
}());
