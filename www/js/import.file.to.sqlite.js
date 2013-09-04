'use strict';

app.importFile = (function() {
	var importFile = {};

	importFile.FILE_NAME = "visitoptimizer_import";
	importFile.rsql = "";
	
	importFile.init = function(repository,doneCallback) {
		app.log("app.importFile: init file : db/"+ importFile.FILE_NAME);

		importFile.openFile(repository,doneCallback);
	};

	importFile.openFile = function(repository,doneCallback) {
        importFile.rsql = "";
        app.log("==== READ A FILE =======");
		var request = new XMLHttpRequest();
        request.open("GET", "db/"+ importFile.FILE_NAME);
        request.onreadystatechange = function() { //Call a function when the state changes.
            if (request.readyState == 4) {
                importFile.rsql = request.responseText;
                
            	//app.log(":rsql: " + rsql + " ");
            	repository.database = window.openDatabase(repository.databaseName, repository.databaseVersion, repository.databaseDisplayName, repository.databaseSize);
				
				var a = importFile.rsql.split(/\r\n|\r|\n/);
                for (var i = 0; a.length > i; ++i) {
                    var rsql = a[i];
    				$.when(saveToDB(rsql,(i+1))).done(function(theResultSet) {
                        /*
                        theSummaryData = theResultSet.rows.item(0);
                        $.each(theSummaryData, function(theKey, theValue) {
                            $("#summary_"+theKey).text(theValue);
                        });
                        */
                    } );
                }

                
            }
        }
        request.send();
    	doneCallback();
   };
    
	importFile.getRSQL = function() {
		return importFile.rsql;
   };
    
    function saveToDB(rSQL, ligne_number) {
        var rsql_deferred = $.Deferred();
        app.repository.database.transaction(function(tx) {
            tx.executeSql(rSQL, [],
                function(tx,result) {
                    rsql_deferred.resolve(result);
                },
                function(tx, error) {
                    app.log("code : "+ error.code+" \nmes : " + error.message + " \nligne : " + ligne_number + " \nrsql : " + rSQL ,'err_sql');
                }
            )
        });
        return rsql_deferred.promise();
    }
    
	return importFile;
}());
