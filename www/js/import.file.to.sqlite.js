'use strict';

app.importFile = (function() {
	var importFile = {};
	
	importFile.ADRESS = "db/";
	importFile.FILE_NAME = "visitoptimizer_import";
	importFile.rsql = "";
	
	importFile.init = function(repository,doneCallback) {
		app.log("app.importFile: init file : " + importFile.ADRESS + importFile.FILE_NAME);

		importFile.readDump(repository,doneCallback);
	};

	importFile.readDump = function(repository,doneCallback) {
	    
        app.log("==== READ INIT DB DUMP =======");

        repository.database = window.openDatabase(repository.databaseName, repository.databaseVersion, repository.databaseDisplayName, repository.databaseSize);
        
        for (var i = 0; dd.length > i; ++i) {
            var rsql = dd[i];
            $.when(saveToDB(rsql,(i+1))).done(function(theResultSet) {

            } );
        }
        // mise en comment de la methode pour ouvrir directement le fichier DB (marche pas en local direct, il faut http)
		/* var request = new XMLHttpRequest();
        request.open("GET", importFile.ADRESS + importFile.FILE_NAME ,true);
        request.onreadystatechange = function(evtXHR) { //Call a function when the state changes.
            if (request.readyState == 4 && request.readyState == 200) {
                importFile.rsql = request.responseText;
                
            	//app.log(":rsql: " + rsql + " ");
            	repository.database = window.openDatabase(repository.databaseName, repository.databaseVersion, repository.databaseDisplayName, repository.databaseSize);
				
				var a = importFile.rsql.split(/\r\n|\r|\n/);
                for (var i = 0; a.length > i; ++i) {
                    var rsql = a[i];
    				$.when(saveToDB(rsql,(i+1))).done(function(theResultSet) {

                    } );
                }

                
            }
        }
        request.send();
        */
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
    };
    
    var dd = new Array();
    var i = 0;
    dd[i++] = 'CREATE TABLE IF NOT EXISTS Translation (id INTEGER, value, languageId INTEGER)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS language (id INTEGER UNIQUE, name, shortName)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS User (id INTEGER UNIQUE, parent_id INTEGER, user_category_id INTEGER, username, password, lastname, firstname, email, phone, preferred_language_id INTEGER, target_val)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS Settings (id INTEGER UNIQUE, defaultLanguageId INTEGER, userId INTEGER)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS sync_infos (id INTEGER PRIMARY KEY UNIQUE, sync_id INTEGER, userId INTEGER, date)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS area_list (id_list INTEGER UNIQUE, parent_id INTEGER, name, status)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS area_item (id_item INTEGER UNIQUE, list_id INTEGER, parent_id INTEGER, name)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS area_item_field_values (id_item INTEGER, language_id INTEGER, value)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS sys_language (id_language INTEGER UNIQUE, name, short_name, default_language)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS sys_language_translation (language_id INTEGER, translation_id INTEGER, value)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS usr_categories (id_user_category INTEGER UNIQUE, translation_id INTEGER, name)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS sys_users (id_user INTEGER UNIQUE, parent_id INTEGER, user_category_id INTEGER, username, password, lastname, firstname, email, phone, preferred_language_id INTEGER, target_val)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS usr_area (user_id INTEGER, area_id INTEGER)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS frequency (id_frequency INTEGER UNIQUE, label, translation_id INTEGER, frequency, frq_code)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS message (id_message INTEGER UNIQUE, message_type, send_date, start_date, end_date, content, priority, attachment, id_usr_message INTEGER, lastname, read INTEGER DEFAULT \'0\')';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS question (id_question INTEGER UNIQUE, translation_id INTEGER, question_type, label, rank, status)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS questionnaire (id_questionnaire INTEGER UNIQUE, name, translation_id INTEGER, frequency_id INTEGER, rank, status)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS questionnaire_question (questionnaire_id INTEGER , question_id INTEGER)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS questions_answer (id_answer INTEGER UNIQUE, translation_id INTEGER, question_id INTEGER, label, rank, status)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS roadmap (id_roadmap INTEGER UNIQUE, initiating_user_id INTEGER, operating_user_id INTEGER, mobile_status_id INTEGER, web_status_id INTEGER, creation_date, name, scheduled_date, km, comment, close_date, area_id INTEGER, local_id INTEGER)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS sales_point (id_sales_point INTEGER UNIQUE, name, email, description, contact_name, phone_number, street, city, postal_code, gps_latitude, gps_longitude, type_id INTEGER, user_id INTEGER, microzone_id INTEGER, last_visit_id INTEGER, frequency_id INTEGER, local_id INTEGER)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS status_mobile (id_status_mobile INTEGER UNIQUE, name, translation_id INTEGER)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS status_visit (id_status_visit INTEGER UNIQUE, name, translation_id INTEGER)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS sp_type (id_type INTEGER UNIQUE, name, translation_id INTEGER)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS sp_visit (id_visit INTEGER UNIQUE, sales_point_id INTEGER, roadmap_id INTEGER, status_visit_id INTEGER, scheduled_date, performed_date, rank, comment, local_id INTEGER)';
    dd[i++] = 'CREATE TABLE IF NOT EXISTS help (id_help INTEGER UNIQUE, zip_name)';
    dd[i++] = 'INSERT INTO Settings (id, defaultLanguageId, userId) VALUES (1, 1, 0)';
    dd[i++] = 'INSERT OR REPLACE INTO language (id, name, shortName) VALUES (1, "English", "en")';
    dd[i++] = 'INSERT OR REPLACE INTO language (id, name, shortName) VALUES (2, "French", "fr")';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (1, "Orange", 1)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (1, "Orange", 2)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (2, "Username", 1)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (2, "Utilisateur", 2)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (3, "Password", 1)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (3, "Mot de passe", 2)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (4, "Recover password", 1)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (4, "Mot de passe oublié", 2)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (5, "Remember me", 1)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (5, "Souvenir de moi", 2)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (6, "Taskboard", 1)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (6, "Taskboard", 2)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (7, "Watchword", 1)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (7, "Watchword", 2)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (8, "Roadmaps", 1)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (8, "Roadmaps", 2)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (9, "POS", 1)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (9, "POS", 2)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (10, "Stats", 1)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (10, "Stats", 2)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (11, "Settings", 1)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (11, "Settings", 2)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (12, "LOGIN", 1)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (12, "INDENTIFIANT", 2)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (13, "UNKNOWN_ERROR", 1)';
    dd[i++] = 'INSERT OR REPLACE INTO Translation (id, value, languageId) VALUES (13, "ERREUR", 2)';;
    
    
	return importFile;
}());
