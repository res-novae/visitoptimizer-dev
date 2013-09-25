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
	}

	function padZero(number) {
		if (number < 10) {
			return '0' + number;
		}
		return number.toString();
	}

	utils.formatDate = function(date, separator) {
		return [ padZero(date.getDate()), padZero(date.getMonth() + 1), date.getFullYear() ].join(separator);
	}

	utils.formatIsoDate = function(date, separator) {
		return [ date.getFullYear(), padZero(date.getMonth() + 1), padZero(date.getDate()) ].join(separator);
	}

	return utils;
}());
