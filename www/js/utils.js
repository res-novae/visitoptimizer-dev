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
	};
    
    utils.convertTimestampToDate = function(date,separator) {
        var dt = new Date(date);
        return app.utils.formatDate(dt,separator);
    };
    
    utils.convertTimestampToDateIso = function(date,separator) {
        var dt = new Date(date);
        return app.utils.formatIsoDate(dt,separator);
    };
    
    utils.getNowDate = function() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10) { dd='0'+dd; } 
        if(mm<10) { mm='0'+mm; }
        return yyyy+'-'+mm+'-'+dd;
    };
    
    utils.getNowDatetime = function() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var hh = today.getHours();
        var mi = today.getMinutes();
        var se = today.getSeconds();
        var yyyy = today.getFullYear();
        if(dd<10) { dd='0'+dd; } 
        if(mm<10) { mm='0'+mm; }
        if(hh<10) { hh='0'+hh; } 
        if(mi<10) { mi='0'+mi; }
        if(se<10) { se='0'+se; }
        return yyyy+'-'+mm+'-'+dd+' '+hh+':'+mi+':'+se;
    };

    
	return utils;
}());
