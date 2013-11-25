'use strict';

app.repository = (function() {

    var repository = {};
    
    repository.databaseName = "VisitOptimizer";
    repository.databaseVersion = "1.0";
    repository.databaseDisplayName = "Visit Optimizer";
    repository.databaseSize = 10000000;

    repository.database = null;

    function errorHandler(tx, err) {
        app.log("app.repository : " + JSON.stringify(err),'err_sql');
    }

    
    
    function nullHandler() {
        // success
    }

    
    repository.init = function(doneCallback) {
        app.log("# app.repository : init", 'wip');
        
        // change to checkDatabaseExist
        checkDatabase(doneCallback);
        
    };
    
    repository.checkStartDatabaseExist = function() {
        app.log('repository.checkStartDatabaseExist : ');
        var rsql_deferred = $.Deferred();
        repository.database = window.openDatabase(repository.databaseName, repository.databaseVersion, repository.databaseDisplayName, repository.databaseSize);
        repository.database.transaction(function(tx) {
            var rsql = "SELECT language_id FROM sys_language_translation";
            var param = null;
            tx.executeSql(rsql, param,
                function(tx,result) {
                    if (result.rows.length != 0) {
                        rsql_deferred.resolve('yes');
                    } else {
                        rsql_deferred.resolve('no');
                    }
                },
                function(tx, error) {
                    rsql_deferred.resolve('no');
                }
            );
        });
        return rsql_deferred.promise();
    };
    repository.checkDatabaseExist = function() {
        app.log('repository.checkDatabaseExist ');
        var rsql_deferred = $.Deferred();
        repository.database = window.openDatabase(repository.databaseName, repository.databaseVersion, repository.databaseDisplayName, repository.databaseSize);
        repository.database.transaction(function(tx) {
            var rsql = "SELECT id FROM sync_infos";
            var param = null;
            tx.executeSql(rsql, param,
                function(tx,result) {
                    if (result.rows.length != 0) {
                        rsql_deferred.resolve('yes');
                    } else {
                        rsql_deferred.resolve('yes');
                    }
                },
                function(tx, error) {
                    rsql_deferred.resolve('no');
                }
            );
        });
        return rsql_deferred.promise();
    };  
    
    
    repository.checkDatabase = function(existDBCallback, dontExistDBCallback){
        repository.database = window.openDatabase(repository.databaseName, repository.databaseVersion, repository.databaseDisplayName, repository.databaseSize);
        repository.database.transaction(function(tx) {
            // app.log("app.repository: languageId " + languageId);
            tx.executeSql("SELECT id FROM sync_infos ", null, 
                function(tx, results) {
                    if (results.rows.length == 1) {
                        app.log("app.repository: DB : " + repository.databaseName + " yes");
                        existDBCallback();
                    } else {
                        app.log("app.repository: DB : " + repository.databaseName + " yes");
                        existDBCallback();
                    }
                }, function() {
                    app.log("app.repository: DB : " + repository.databaseName + " no");
                    dontExistDBCallback();
                }
            );
        });
    };
    
    repository.checkUserData = function(user_id, doneCallback, nodataCallback){
        repository.database = window.openDatabase(repository.databaseName, repository.databaseVersion, repository.databaseDisplayName, repository.databaseSize);
        repository.database.transaction(function(tx) {
            // app.log("app.repository: languageId " + languageId);
            tx.executeSql("SELECT id_user FROM sys_users WHERE ( id_user = ? ) ", [ user_id ], 
                function(tx, results) {
                    if (results.rows.length == 1) {
                        doneCallback();
                    } else {
                        nodataCallback();
                    }
                }, function() {
                    nodataCallback();
                }
            );
        });
    };
    
    repository.checkUserSyncData = function(user_id, doneCallback, nodataCallback){
        repository.database = window.openDatabase(repository.databaseName, repository.databaseVersion, repository.databaseDisplayName, repository.databaseSize);
        repository.database.transaction(function(tx) {
            // app.log("app.repository: languageId " + languageId);
            tx.executeSql("SELECT sync_id FROM sync_infos WHERE ( userId = ? ) ", [ user_id ], 
                function(tx, results) {
                    if (results.rows.length == 1) {
                        doneCallback();
                    } else {
                        nodataCallback();
                    }
                }, function() {
                    nodataCallback();
                }
            );
        });
    };
    
    repository.purgeData = function(doneCallback) {
        app.log("# app.repository : purge data", 'wip');
        
        repository.database = window.openDatabase(repository.databaseName, repository.databaseVersion, repository.databaseDisplayName, repository.databaseSize);
        repository.database.transaction(function(tx) {
           tx.executeSql("DROP TABLE IF EXISTS area_list");
           tx.executeSql("DROP TABLE IF EXISTS area_item");
           tx.executeSql("DROP TABLE IF EXISTS area_item_field_values");
           tx.executeSql("DROP TABLE IF EXISTS sys_language");
           tx.executeSql("DROP TABLE IF EXISTS sys_language_translation");
           tx.executeSql("DROP TABLE IF EXISTS usr_categories");
           tx.executeSql("DROP TABLE IF EXISTS sys_users");
           tx.executeSql("DROP TABLE IF EXISTS usr_area");
           tx.executeSql("DROP TABLE IF EXISTS frequency");
           tx.executeSql("DROP TABLE IF EXISTS message");
           tx.executeSql("DROP TABLE IF EXISTS question");
           tx.executeSql("DROP TABLE IF EXISTS questions_frequency");
           tx.executeSql("DROP TABLE IF EXISTS questionnaire");
           tx.executeSql("DROP TABLE IF EXISTS questionnaire_question");
           tx.executeSql("DROP TABLE IF EXISTS questions_answer");
           tx.executeSql("DROP TABLE IF EXISTS sp_answer");
           tx.executeSql("DROP TABLE IF EXISTS sales_point");
           tx.executeSql("DROP TABLE IF EXISTS status_mobile");
           tx.executeSql("DROP TABLE IF EXISTS status_visit");
           tx.executeSql("DROP TABLE IF EXISTS sp_type");
           tx.executeSql("DROP TABLE IF EXISTS sp_visit");
           tx.executeSql("DROP TABLE IF EXISTS help");
           tx.executeSql("DROP TABLE IF EXISTS roadmap");
           
           tx.executeSql("CREATE TABLE IF NOT EXISTS sync_infos (id INTEGER PRIMARY KEY UNIQUE, sync_id INTEGER, userId INTEGER, date)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS area_list (id_list INTEGER UNIQUE, parent_id INTEGER, name, status)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS area_item (id_item INTEGER UNIQUE, list_id INTEGER, parent_id INTEGER, name)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS area_item_field_values (id_item INTEGER, language_id INTEGER, value)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS sys_language (id_language INTEGER UNIQUE, name, short_name, default_language)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS sys_language_translation (language_id INTEGER, translation_id INTEGER, value)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS usr_categories (id_user_category INTEGER UNIQUE, translation_id INTEGER, name)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS sys_users (id_user INTEGER UNIQUE, parent_id INTEGER, user_category_id INTEGER, username, password, lastname, firstname, email, phone, preferred_language_id INTEGER, target_val, sync_status)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS usr_area (user_id INTEGER, area_id INTEGER)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS frequency (id_frequency INTEGER UNIQUE, label, translation_id INTEGER, frequency, frq_code)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS message (id_message INTEGER UNIQUE, message_type, send_date, start_date, end_date, subject, content, priority, attachment, id_usr_message INTEGER, lastname, read_date, sync_status)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS question (id_question INTEGER UNIQUE, translation_id INTEGER, question_type, label, rank, status)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS questions_frequency (id_qf INTEGER, question_id INTEGER, frequency_id INTEGER, mandatory, readonly, display, rank)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS questionnaire (id_questionnaire INTEGER UNIQUE, name, translation_id INTEGER, frequency_id INTEGER, rank, status)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS questionnaire_question (questionnaire_id INTEGER , question_id INTEGER)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS questions_answer (id_answer INTEGER UNIQUE, translation_id INTEGER, question_id INTEGER, label, rank, status)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS sp_answer (sales_point_id INTEGER, visit_id INTEGER, questionnaire_id INTEGER, question_id INTEGER, answer_id INTEGER, answer, answer_time, sync_status)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS roadmap (id_roadmap INTEGER UNIQUE, initiating_user_id INTEGER, operating_user_id INTEGER, mobile_status_id INTEGER, web_status_id INTEGER, creation_date, name, scheduled_date, km, comment, close_date, area_id INTEGER, local_id INTEGER, sync_status)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS sales_point (id_sales_point INTEGER UNIQUE, name, email, description, contact_name, phone_number, street, city, postal_code, gps_latitude, gps_longitude, type_id INTEGER, user_id INTEGER, microzone_id INTEGER, last_visit_id INTEGER, frequency_id INTEGER, photo_url, local_id INTEGER, sync_status)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS status_mobile (id_status_mobile INTEGER UNIQUE, name, translation_id INTEGER)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS status_visit (id_status_visit INTEGER UNIQUE, name, translation_id INTEGER)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS sp_type (id_type INTEGER UNIQUE, name, translation_id INTEGER)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS sp_visit (id_visit INTEGER UNIQUE, sales_point_id INTEGER, roadmap_id INTEGER, status_visit_id INTEGER, scheduled_date, performed_date, rank, comment, local_id INTEGER, sync_status)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS help (id_help INTEGER UNIQUE, zip_name)");
           doneCallback();
         } );
    };
    
    // prepare dn to first init 
    var rsql_deferred;
    repository.firstInitDbApp = function(doneCallback) {
        app.log("# app.repository : init Db App", 'wip');
        rsql_deferred = $.Deferred();

        var dd = new Array();
        var i = 0;
        
        dd[i++] = 'CREATE TABLE IF NOT EXISTS sys_language_translation (language_id INTEGER, translation_id INTEGER, value)';
        
        dd[i++] = 'INSERT OR REPLACE INTO sys_language_translation (language_id, translation_id, value) VALUES (1, 1153, "Visit Optimizer1")';
        dd[i++] = 'INSERT OR REPLACE INTO sys_language_translation (language_id, translation_id, value) VALUES (1, 1154, "Orange1")';
        dd[i++] = 'INSERT OR REPLACE INTO sys_language_translation (language_id, translation_id, value) VALUES (1, 256,  "identifiant")';
        dd[i++] = 'INSERT OR REPLACE INTO sys_language_translation (language_id, translation_id, value) VALUES (1, 323,  "mot de passe")';
        dd[i++] = 'INSERT OR REPLACE INTO sys_language_translation (language_id, translation_id, value) VALUES (1, 324,  "Mot de passe oublié")';
        dd[i++] = 'INSERT OR REPLACE INTO sys_language_translation (language_id, translation_id, value) VALUES (1, 451,  "se souvenir de moi")';
        dd[i++] = 'INSERT OR REPLACE INTO sys_language_translation (language_id, translation_id, value) VALUES (1, 771,  "Se connecter")';
        dd[i++] = 'INSERT OR REPLACE INTO sys_language_translation (language_id, translation_id, value) VALUES (1, 1155, "Erreur")';
        dd[i++] = 'INSERT OR REPLACE INTO sys_language_translation (language_id, translation_id, value) VALUES (1, 257,  "identifiant ou mot de passe incorect")';
        
        dd[i++] = 'CREATE TABLE IF NOT EXISTS Settings (id INTEGER UNIQUE, defaultLanguageId INTEGER, userId INTEGER)';
        dd[i++] = 'INSERT OR REPLACE INTO Settings (id, defaultLanguageId, userId) VALUES (1, 1, 0)';
        dd[i++] = 'CREATE TABLE IF NOT EXISTS sys_users (id_user INTEGER UNIQUE, parent_id INTEGER, user_category_id INTEGER, username, password, lastname, firstname, email, phone, preferred_language_id INTEGER, target_val, sync_status)';
        
        repository.database = window.openDatabase(repository.databaseName, repository.databaseVersion, repository.databaseDisplayName, repository.databaseSize);
        var i = 0;
        var j = 0;
        for (var i = 0; dd.length > i; ++i) {
            var rsql = dd[i];
            $.when(saveToDB(rsql,(i+1))).done(function(theResultSet) {
                j++;
                if(i == j) {
                    //alert('j:'+j);
                    rsql_deferred.resolve('insert : end func');
                }
            } );
        }
        
        return rsql_deferred.promise();

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
            );
        });
        return rsql_deferred.promise();
    };
    
    repository.saveOrUpdateUser = function(user, successCallback, errorCallback) {
        repository.database = window.openDatabase(repository.databaseName, repository.databaseVersion, repository.databaseDisplayName,
                repository.databaseSize);
        repository.database.transaction(function(tx) {
            app.log(user.username+"("+user.id+")");
            tx.executeSql("UPDATE sys_users SET parent_id = ?, user_category_id = ?, username = ?, password = ?, lastname = ?, firstname = ?, email = ?, phone = ?, preferred_language_id = ?, target_val = ?, sync_status = ? WHERE id_user = ?",
                    [ user.parent_id, user.user_category_id, user.username, user.password, user.lastname, user.firstname, user.email, user.phone, user.preferred_language_id, user.target_val, 'U', user.id ],
                    function(tx, results) {
                        if (results.rowsAffected == 1) {
                            app.log("app.repository: User updated " + JSON.stringify(user),'success');
                            successCallback(user);
                        } else {
                            tx.executeSql("INSERT INTO sys_users (id_user, parent_id, user_category_id, username, password, lastname, firstname, email, phone, preferred_language_id, target_val, sync_status) "
                                    + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [ user.id, user.parent_id, user.user_category_id, user.username, user.password, user.lastname, user.firstname, user.email, user.phone, user.preferred_language_id, user.target_val, "S" ], 
                                    function() {
                                app.log("app.repository: User inserted " + JSON.stringify(user),'success');
                                successCallback(user);
                            }, function(tx, error) {
                                app.log("app.repository: A1 Error while saving or updating user " + JSON.stringify(error),'err_sql');
                                errorCallback(error);
                            });
                        }
                    }, function(tx, error) {
                        app.log("app.repository: B Error while saving or updating user " + JSON.stringify(error),'err_sql');
                        errorCallback(error);
                    });
        });
    };
    
    repository.updateSettings = function(userId) {
        repository.database.transaction(function(tx) {
            app.log("app.repository: updating settings with userId " + userId);
            tx.executeSql("UPDATE Settings SET userId = ? WHERE id = ?", [ userId, 1 ], function(tx, results) {
                if (results.rowsAffected == 1) {
                    app.log("app.repository: app settings updated",'success');
                } else {
                    app.log("app.repository: app settings update failed",'err_sql');
                }
            }, function(tx, error) {
                app.log("app.repository: Error while updating app settings " + JSON.stringify(error),'err_sql');
            });
        });
    };
    
    // remplace to loadSettingsB
    repository.loadSettings = function(successCallback) {
        repository.database.transaction(function(tx) {
            tx.executeSql("SELECT defaultLanguageId, userId FROM Settings WHERE (id = ?)", [ 1 ], function(tx, results) {
                if (results.rows.length == 1) {
                    var settings = new app.domain.Settings(1, results.rows.item(0).defaultLanguageId, results.rows.item(0).userId);
                    app.log("app.repository: returning app settings",'success');
                    successCallback(settings);
                } else {
                    app.log("app.repository: app settings not found, returning default",'success');
                    successCallback(new app.domain.Settings(1, 1, 0));
                }
            }, function(tx, err) {
                app.log("app.repository: app settings not found, returning default",'success');
                successCallback(new app.domain.Settings(1, 1, 0));
            });
        });
    };
    
    repository.loadSettingsB = function(existDBCallback, dontExistDBCallback){
        app.log('repository.loadSettingsB : ');
        var rsql_deferred = $.Deferred();
        repository.database = window.openDatabase(repository.databaseName, repository.databaseVersion, repository.databaseDisplayName, repository.databaseSize);
        repository.database.transaction(function(tx) {
            var rsql = "SELECT defaultLanguageId, userId FROM Settings WHERE (id = ?)";
            var param = [ 1 ];
            tx.executeSql(rsql, param,
                function(tx,results) {
                    if (results.rows.length != 0) {
                        rsql_deferred.resolve(new app.domain.Settings(1, results.rows.item(0).defaultLanguageId, results.rows.item(0).userId));
                    } else {
                        rsql_deferred.resolve(new app.domain.Settings(1, 1, 0));
                    }
                },
                function(tx, error) {
                    rsql_deferred.resolve(new app.domain.Settings(1, 1, 0));
                }
            );
        });
        return rsql_deferred.promise();
    };    
    
    repository.loadUser = function(userId, successCallback) {
        repository.database.transaction(function(tx) {
            tx.executeSql("SELECT id_user, parent_id, user_category_id, username, password, lastname, firstname, email, phone, preferred_language_id, target_val FROM sys_users WHERE (id_user = ?)", [ userId ],
                    function(tx, results) {
                        if (results.rows.length == 1) {
                            var item = results.rows.item(0);
                            var user = new app.domain.User(
                                item.id_user, 
                                item.parent_id, 
                                item.user_category_id, 
                                item.username, 
                                item.password, 
                                item.lastname, 
                                item.firstname, 
                                item.email, 
                                item.phone, 
                                item.preferred_language_id, 
                                item.target_val
                            );
                            app.log("app.repository: returning user with id " + userId,'success');
                            successCallback(user);
                        } else {
                            app.log("app.repository: user with id " + userId + " not found",'err_sql');
                            successCallback(null);
                        }
                    }, function(tx, err) {
                        app.log("app.repository: error while returning user with id " + userId,'err_sql');
                        successCallback(null);
                    });
        });
    };

    repository.getTranslation = function(translationIds) {
        app.log('repository.getTranslation  ');
        var op_deferred = $.Deferred();
        var complement_rsql = "";
        for (var i = 0; i < translationIds.length; i++) {
            if(i != 0) complement_rsql += " OR";
            complement_rsql += " translation_id = '" +translationIds[i]+"' ";
        }
        var rsql = "SELECT translation_id, value FROM sys_language_translation WHERE (language_id = ?) AND (" + complement_rsql + ")";
        var param = [ app.languageId ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            var trads = Array();
            if (results.rows.length != 0) {
                for (var i=0;i<results.rows.length;i++){ 
                    trads[results.rows.item(i).translation_id] = results.rows.item(i).value;
                }
                //alert('t : yes');
                op_deferred.resolve(trads);
            }else{
                //alert('t: no');
                op_deferred.resolve(trads);
            }
            
        } );
        return op_deferred.promise();
    };  
    
    repository.loadTranslation = function(languageId, translationId, successCallback) {
        repository.database.transaction(function(tx) {
            tx.executeSql("SELECT value FROM Translation WHERE (id = ?) AND (languageId = ?)", [ translationId, languageId ], function(tx,
                    results) {
                if (results.rows.length == 1) {
                    var translationValue = results.rows.item(0).value;
                    // app.log("app.repository: get from db for " +
                    // translationId + " -> " + translationValue);
                    successCallback(translationValue);
                } else {
                    errorHandler(null, new Error("Translation not found: " + translationId));
                }
            }, errorHandler);
        });
    };

    repository.loadTranslations = function(languageId, translationIds, doneCallback) {
        app.log("app.repository: load translations for languageId " + languageId);
        var translationValues = [];
        loadTranslationRec(0, languageId, translationIds, translationValues, function() {
            doneCallback(translationValues);
        });
    };
    
    function loadTranslationRec(nextIndex, languageId, translationIds, translationValues, doneCallback) {
        if (nextIndex >= translationIds.length) {
            doneCallback();
            return;
        }
        repository.database.transaction(function(tx) {
            // app.log("app.repository: languageId " + languageId);
            tx.executeSql("SELECT value FROM Translation WHERE (id = ?) AND (languageId = ?)", [ translationIds[nextIndex], languageId ],
                    function(tx, results) {
                        if (results.rows.length == 1) {
                            var translationValue = results.rows.item(0).value;
                            // app.log("app.repository: load translation for " +
                            // translationIds[nextIndex] + " -> " +
                            // translationValue);
                            translationValues.push(translationValue);
                            loadTranslationRec(nextIndex + 1, languageId, translationIds, translationValues, doneCallback);
                        } else {
                            app.log("app.repository: translation not found for " + translationIds[nextIndex],'err');
                            translationValues.push(null);
                            loadTranslationRec(nextIndex + 1, languageId, translationIds, translationValues, doneCallback);
                        }
                    }, function() {
                        app.log("app.repository: translation not found for " + translationIds[nextIndex],'err');
                        translationValues.push(null);
                        loadTranslationRec(nextIndex + 1, languageId, translationIds, translationValues, doneCallback);
                    });
        });
    }
    
    repository.syncUpdateDataImport = function(rsql) {
       repository.database.transaction(function(tx) {
            tx.executeSql(rsql, null, function(tx) {
                //app.log("::rsql::"+rsql);
            }, function(tx, err) {
                app.log("import SQLite : "+ err.code+" mes : " + err.message + " rsql : " + rsql ,'err_sql');
            });
       });
       
    };  
    
    repository.setSyncInfos = function(sync_id, userId, date, successCallback) {
        repository.database.transaction(function(tx) {
            app.log("app.repository: setSyncInfos");
            tx.executeSql("INSERT INTO sync_infos (sync_id, userId, date) VALUES (?, ?, ?)", [sync_id, userId, date], function(tx) {
                successCallback();
            }, function(tx, err) {
                app.log(err.code+" mes : " + err.message ,'err_sql');
            });
        });
        
    };
    
    
    
    // TASKBOARD : getLastSyncInfos
    repository.getLastSyncInfos = function(userId, successCallback) {
        app.log('repository.getLastSyncInfos userId : '+userId);
        repository.database.transaction(function(tx) {
            tx.executeSql("SELECT sync_id, date FROM sync_infos WHERE (userId = ?)", [ userId ], function(tx, results) {
                if (results.rows.length != 0) {
                    successCallback( results.rows.item(0).id, results.rows.item(0).sync_id, results.rows.item(0).userId, results.rows.item(0).date);
                } else {
                    successCallback('','','','');
                }
              }, function(transaction, error) {
                app.log("Code : "+ error.code + " error : " + error.message ,'err_sql');
              }
            );
        });
    };
        
    //// ## TASKBOARD (and wathword) ## ////
    repository.getMessages = function() {
        app.log('repository.getMessages  ');
        var op_deferred = $.Deferred();
        var rsql = "SELECT * FROM message";
        var param = null;
        $.when(requestToDB(rsql,param)).done(function(results) {
            var messages = Array();
            if (results.rows.length != 0) {
                for (var i=0;i<results.rows.length;i++){ 
                    var message = new app.domain.message(
                        results.rows.item(i).id_message,
                        results.rows.item(i).message_type, 
                        results.rows.item(i).send_date, 
                        results.rows.item(i).start_date, 
                        results.rows.item(i).end_date, 
                        results.rows.item(i).subject, 
                        results.rows.item(i).content, 
                        results.rows.item(i).priority, 
                        results.rows.item(i).attachment, 
                        results.rows.item(i).id_usr_message, 
                        results.rows.item(i).lastname,
                        results.rows.item(i).read_date,
                        results.rows.item(i).sync_status
                    );
                    messages[i] = message;
                }
                op_deferred.resolve(messages);
            }
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    };  
    
    repository.checkMessageStatus = function(id_message, datetimeNow, successCallback) {
        app.log('repository.checkMessageStatus');
        repository.database.transaction(function(tx) {
            app.log("app.repository: updating message status read_date with id_message " + id_message);
            tx.executeSql("UPDATE message SET read_date = ?, sync_status = 'U' WHERE id_message = ?", [ datetimeNow, id_message ], function(tx, results) {
                if (results.rowsAffected == 1) {
                    app.log("app.repository: status message updated",'success');
                    successCallback();
                } else {
                    app.log("app.repository: status message update failed",'err_sql');
                    successCallback();
                }
            }, function(tx, error) {
                app.log("app.repository: Error while updating status message " + JSON.stringify(error),'err_sql');
                successCallback();
            });
        });
    };
    
    //// ## POS ## ////
    repository.getPosFilterList = function(user_id) {
        app.log('repository.getPosFilterList : ');
        var op_deferred = $.Deferred();
        var rsql = "SELECT area_item.* "
                  +" FROM area_item "
                  +" LEFT JOIN usr_area " 
                  +" ON area_item.id_item = usr_area.area_id "
                  +" WHERE ( usr_area.user_id = ?)";
        var param = [ user_id ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            var area_list = Array();
            if (results.rows.length != 0) {
                for (var i=0;i<results.rows.length;i++){ 
                    var area = new app.domain.area_item(
                        results.rows.item(i).id_item,
                        results.rows.item(i).list_id, 
                        results.rows.item(i).parent_id, 
                        results.rows.item(i).name
                    );
                    area_list[i] = area;
                }
                op_deferred.resolve(area_list);
            } else op_deferred.resolve(area_list);
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    }; 
    
    //// ## PoS ## ////
    repository.getPosList = function(user_id) {
        app.log('repository.getPosFilterList : ');
        var op_deferred = $.Deferred();
        var rsql = "SELECT sales_point.*, sp_type.name AS type_name " 
                  +" FROM sales_point "
                  +" LEFT JOIN sp_type " 
                  +" ON sales_point.type_id = sp_type.id_type "
                  +" WHERE ( user_id = ?)";
        var param = [ user_id ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            var pos_list = Array();
            if (results.rows.length != 0) {
                for (var i=0;i<results.rows.length;i++){ 
                    var pos = new app.domain.sales_point(
                        results.rows.item(i).id_sales_point,
                        results.rows.item(i).name, 
                        results.rows.item(i).email, 
                        results.rows.item(i).description, 
                        results.rows.item(i).contact_name, 
                        results.rows.item(i).phone_number, 
                        results.rows.item(i).street, 
                        results.rows.item(i).city, 
                        results.rows.item(i).postal_code, 
                        results.rows.item(i).gps_latitude,
                        results.rows.item(i).gps_longitude,
                        results.rows.item(i).type_id,
                        results.rows.item(i).user_id,
                        results.rows.item(i).microzone_id,
                        results.rows.item(i).last_visit_id,
                        results.rows.item(i).frequency_id,
                        results.rows.item(i).photo_url,
                        results.rows.item(i).local_id,
                        results.rows.item(i).sync_status
                    );
                    pos.type_name = results.rows.item(i).type_name,
                    pos_list[i] = pos;
                    app.log(pos.name);
                }
                op_deferred.resolve(pos_list);
            } else op_deferred.resolve(pos_list);

            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    };    
    
    repository.getPosItem = function(id_sales_point) {
        app.log('repository.getPosItem : '+ id_sales_point);
        var op_deferred = $.Deferred();
        var rsql = "SELECT * FROM sales_point WHERE ( id_sales_point = ?)";
        var param = [ id_sales_point ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            if (results.rows.length != 0) {
                var i = 0;
                var sp = new app.domain.sales_point(
                    results.rows.item(i).id_sales_point,
                    results.rows.item(i).name, 
                    results.rows.item(i).email, 
                    results.rows.item(i).description, 
                    results.rows.item(i).contact_name, 
                    results.rows.item(i).phone_number, 
                    results.rows.item(i).street, 
                    results.rows.item(i).city, 
                    results.rows.item(i).postal_code, 
                    results.rows.item(i).gps_latitude,
                    results.rows.item(i).gps_longitude,
                    results.rows.item(i).type_id,
                    results.rows.item(i).user_id,
                    results.rows.item(i).microzone_id,
                    results.rows.item(i).last_visit_id,
                    results.rows.item(i).frequency_id,
                    results.rows.item(i).photo_url,
                    results.rows.item(i).local_id,
                    results.rows.item(i).sync_status
                );
                op_deferred.resolve(sp);
            }
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    };  
    
    repository.addPosSave = function(param) {
        app.log("repository.addPosSave");
        var op_deferred = $.Deferred();

        var rsql = "INSERT INTO sales_point ( id_sales_point, name, street, postal_code, city, contact_name, email, phone_number, type_id, user_id, description, gps_latitude, gps_longitude, microzone_id, last_visit_id, frequency_id, local_id, sync_status ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $.when(requestToDB(rsql,param)).done(function(results) {
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    }; 
    
    repository.editPosSave = function(param) {
        app.log("repository.editPosSave");
        var op_deferred = $.Deferred();

        var rsql = "UPDATE sales_point SET id_sales_point = ?, name = ?, street = ?, postal_code = ?, city = ?, contact_name = ?, email = ?, phone_number = ?, type_id = ?, user_id = ?, description = ?, gps_latitude = ?, gps_longitude = ?, microzone_id = ?, frequency_id = ?, local_id = ?, sync_status = ? WHERE id_sales_point = ?";
        $.when(requestToDB(rsql,param)).done(function(results) {
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    }; 
    
    repository.getPosTypes = function() {
        app.log('repository.getPosTypes  ');
        var op_deferred = $.Deferred();
        var rsql = "SELECT * FROM sp_type";
        var param = null;
        $.when(requestToDB(rsql,param)).done(function(results) {
            var sp_types = Array();
            if (results.rows.length != 0) {
                for (var i=0;i<results.rows.length;i++){ 
                    var sp_type = new app.domain.sp_type(
                        results.rows.item(i).id_type,
                        results.rows.item(i).name, 
                        results.rows.item(i).transalation_id
                    );
                    sp_types[i] = sp_type;
                }
                op_deferred.resolve(sp_types);
            }
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    }; 
    
    repository.getFrequencies = function() {
        app.log('repository.getFrequencies  ');
        var op_deferred = $.Deferred();
        var rsql = "SELECT * FROM frequency";
        var param = null;
        $.when(requestToDB(rsql,param)).done(function(results) {
            var frequencies = Array();
            if (results.rows.length != 0) {
                for (var i=0;i<results.rows.length;i++){ 
                    var frequency = new app.domain.frequency(
                        results.rows.item(i).id_frequency,
                        results.rows.item(i).label, 
                        results.rows.item(i).transalation_id,
                        results.rows.item(i).frequency, 
                        results.rows.item(i).frq_code
                    );
                    frequencies[i] = frequency;
                }
                op_deferred.resolve(frequencies);
            }
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    }; 
    
    repository.getMicroZones = function() {
        app.log('repository.getMicroZones  ');
        var op_deferred = $.Deferred();
        var rsql = "SELECT * FROM area_item";
        var param = null;
        $.when(requestToDB(rsql,param)).done(function(results) {
            var mzs = Array();
            if (results.rows.length != 0) {
                for (var i=0;i<results.rows.length;i++){ 
                    var mz = new app.domain.area_item(
                        results.rows.item(i).id_item,
                        results.rows.item(i).list_id, 
                        results.rows.item(i).parent_id,
                        results.rows.item(i).name
                    );
                    mzs[i] = mz;
                }
                op_deferred.resolve(mzs);
            }
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    }; 
    
 
    
    //// ## ROADMAP ## ////
    repository.getRoadmapList = function(user_id) {
        app.log('repository.getRoadmapList : ');
        var op_deferred = $.Deferred();
        var rsql = "SELECT roadmap.*,"+
                    " initiating_user.id_user as initiating_user__id_user ," +
                    " initiating_user.user_category_id as initiating_user__user_category_id ," +
                    " initiating_user.id_user as initiating_user__id_user ," +
                    " initiating_user.lastname as initiating_user__lastname ," +
                    " initiating_user.firstname as initiating_user__firstname ," +
                    " initiating_user.email as initiating_user__email ," +
                    " initiating_user.phone as initiating_user__phone ," +
                    " initiating_user_categories.id_user_category as initiating_user_categories__id_user_category ," +
                    " initiating_user_categories.name as initiating_user_categories__name ," +
                    " roadmap_status_mobile.id_status_mobile as roadmap_status_mobile__id_status_mobile ," +
                    " roadmap_status_mobile.name as roadmap_status_mobile__name ," +
                    " area_item.name AS area_name, "+ 
                    " (SELECT count(*) FROM sp_visit WHERE sp_visit.roadmap_id = roadmap.id_roadmap AND sync_status != 'D') AS nb_visit, "+
                    " (SELECT count(*) FROM sp_visit WHERE sp_visit.roadmap_id = roadmap.id_roadmap AND sp_visit.status_visit_id != '1' AND sync_status != 'D') AS nb_visited "+
                    " FROM roadmap "+
                    " LEFT JOIN area_item "+ 
                    " ON roadmap.area_id = area_item.id_item "+
                    " LEFT JOIN sys_users AS initiating_user " +
                    " ON roadmap.initiating_user_id = initiating_user.id_user "+
                    " LEFT JOIN usr_categories AS initiating_user_categories " +
                    " ON initiating_user__user_category_id = initiating_user_categories.id_user_category "+
                    //" LEFT JOIN status_visit AS roadmap_status_visit " +
                    //" ON roadmap.web_status_id = roadmap_status_visit.id_status_visit "+
                    " LEFT JOIN status_mobile AS roadmap_status_mobile " +
                    " ON roadmap.mobile_status_id = roadmap_status_mobile.id_status_mobile "+
                    " WHERE ( operating_user_id = ?)" +
                    " ORDER BY scheduled_date DESC";
        var param = [ user_id ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            var roadmap_list = Array();
            if (results.rows.length != 0) {
                for (var i=0;i<results.rows.length;i++){ 
                    var roadmap = new app.domain.roadmap(
                        results.rows.item(i).id_roadmap,
                        results.rows.item(i).initiating_user_id, 
                        results.rows.item(i).operating_user_id, 
                        results.rows.item(i).mobile_status_id, 
                        results.rows.item(i).web_status_id, 
                        results.rows.item(i).creation_date, 
                        results.rows.item(i).name, 
                        results.rows.item(i).scheduled_date, 
                        results.rows.item(i).km, 
                        results.rows.item(i).comment,
                        results.rows.item(i).close_date,
                        results.rows.item(i).area_id,
                        results.rows.item(i).local_id,
                        results.rows.item(i).sync_status
                    );
                    roadmap.initiating_user__id_user = results.rows.item(i).initiating_user__id_user;
                    roadmap.initiating_user__user_category_id = results.rows.item(i).initiating_user__user_category_id;
                    roadmap.initiating_user__id_user = results.rows.item(i).initiating_user__id_user;
                    roadmap.initiating_user__lastname = results.rows.item(i).initiating_user__lastname;
                    roadmap.initiating_user__firstname = results.rows.item(i).initiating_user__firstname;
                    roadmap.initiating_user__email = results.rows.item(i).initiating_user__email;
                    roadmap.initiating_user__phone = results.rows.item(i).initiating_user__phone;
                    roadmap.initiating_user_categories__id_user_category = results.rows.item(i).initiating_user_categories__id_user_category;
                    roadmap.initiating_user_categories__name = results.rows.item(i).initiating_user_categories__name;
                    roadmap.roadmap_status_mobile__id_status_mobile = results.rows.item(i).roadmap_status_mobile__id_status_mobile;
                    roadmap.roadmap_status_mobile__name = results.rows.item(i).roadmap_status_mobile__name;
                    
                    roadmap.area_name = results.rows.item(i).area_name;
                    roadmap.nb_visit = results.rows.item(i).nb_visit;
                    roadmap.nb_visited = results.rows.item(i).nb_visited;
                    roadmap_list[i] = roadmap;
                }
                op_deferred.resolve(roadmap_list);
            } else op_deferred.resolve(roadmap_list);

            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    };    
    
    repository.getRoadmapItem = function(id_roadmap) {
        app.log('repository.getRoadmapItem : '+ id_roadmap);
        var op_deferred = $.Deferred();
        var rsql = "SELECT * FROM roadmap WHERE ( id_roadmap = ?)";
        var param = [ id_roadmap ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            if (results.rows.length != 0) {
                var i = 0;
                var roadmap = new app.domain.roadmap(
                    results.rows.item(i).id_roadmap,
                    results.rows.item(i).initiating_user_id, 
                    results.rows.item(i).operating_user_id, 
                    results.rows.item(i).mobile_status_id, 
                    results.rows.item(i).web_status_id, 
                    results.rows.item(i).creation_date, 
                    results.rows.item(i).name, 
                    results.rows.item(i).scheduled_date, 
                    results.rows.item(i).km, 
                    results.rows.item(i).comment,
                    results.rows.item(i).close_date,
                    results.rows.item(i).area_id,
                    results.rows.item(i).local_id,
                    results.rows.item(i).sync_status
                );
                op_deferred.resolve(roadmap);
            }
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    }; 
    
    repository.getDailyRoadmapItem = function() {
        app.log('repository.getDailyRoadmapItem');
        //alert('date:'+app.utils.convertTimestampToDateIso(new Date(),'-'));
        var op_deferred = $.Deferred();
        var rsql = "SELECT * FROM roadmap WHERE scheduled_date = ? LIMIT 0, 1";
        var param = [ app.utils.convertTimestampToDateIso(new Date(),'-') ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            if (results.rows.length != 0) {
                var i = 0;
                var roadmap = new app.domain.roadmap(
                    results.rows.item(i).id_roadmap,
                    results.rows.item(i).initiating_user_id, 
                    results.rows.item(i).operating_user_id, 
                    results.rows.item(i).mobile_status_id, 
                    results.rows.item(i).web_status_id, 
                    results.rows.item(i).creation_date, 
                    results.rows.item(i).name, 
                    results.rows.item(i).scheduled_date, 
                    results.rows.item(i).km, 
                    results.rows.item(i).comment,
                    results.rows.item(i).close_date,
                    results.rows.item(i).area_id,
                    results.rows.item(i).local_id,
                    results.rows.item(i).sync_status
                );
                
                // get pos 
                var r2 = app.repository.getRoadmapItemPosListAllData(results.rows.item(i).id_roadmap);
                $.when(r2).done(function(pos_list) {
                    roadmap.pos_list = pos_list;
                    //end return
                    op_deferred.resolve(roadmap);
                } );
                
                
            } else op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    }; 
    
    repository.getActiveRoadmapItem = function() {
        app.log('repository.getActiveRoadmapItem');
        //alert('date:'+app.utils.convertTimestampToDateIso(new Date(),'-'));
        var op_deferred = $.Deferred();
        var rsql = "SELECT * FROM roadmap WHERE scheduled_date = ? AND mobile_status_id = ? LIMIT 0, 1";
        var param = [ app.utils.convertTimestampToDateIso(new Date(),'-'), 1 ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            if (results.rows.length != 0) {
                var i = 0;
                var roadmap = new app.domain.roadmap(
                    results.rows.item(i).id_roadmap,
                    results.rows.item(i).initiating_user_id, 
                    results.rows.item(i).operating_user_id, 
                    results.rows.item(i).mobile_status_id, 
                    results.rows.item(i).web_status_id, 
                    results.rows.item(i).creation_date, 
                    results.rows.item(i).name, 
                    results.rows.item(i).scheduled_date, 
                    results.rows.item(i).km, 
                    results.rows.item(i).comment,
                    results.rows.item(i).close_date,
                    results.rows.item(i).area_id,
                    results.rows.item(i).local_id,
                    results.rows.item(i).sync_status
                );
                
                // get pos 
                var r2 = app.repository.getRoadmapItemPosListAllData(results.rows.item(i).id_roadmap);
                $.when(r2).done(function(pos_list) {
                    roadmap.pos_list = pos_list;
                    //end return
                    op_deferred.resolve(roadmap);
                } );
                
                
            } else op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    }; 

    repository.getRoadmapItemPosListAllData = function(roadmap_id) {
        app.log('repository.getRoadmapItemPosListAllData : ');
        var op_deferred = $.Deferred();
        var rsql = "SELECT sales_point.*, " +
                      "sp_type.name AS type_name," +
                      "sp_visit.roadmap_id AS roadmap_id, " +
                      "sp_visit.id_visit AS sp_visit__id_visit, " +
                      "sp_visit.status_visit_id AS sp_visit__status_visit_id, " +
                      "sp_visit.sales_point_id AS sp_visit__sales_point_id, " +
                      "sp_visit.scheduled_date AS sp_visit__scheduled_date, " +
                      "sp_visit.performed_date AS sp_visit__performed_date, " +
                      "sp_visit.rank AS sp_visit__rank, " +
                      "sp_visit.comment AS sp_visit__comment, " +
                      "sp_visit.local_id AS sp_visit__local_id, " +
                      "status_visit.name AS sp_visit__status_visit_name " +
                      " FROM sales_point " +
                      " LEFT JOIN sp_type " +
                      " ON sales_point.type_id = sp_type.id_type " +
                      " LEFT JOIN sp_visit " +
                      " ON sales_point.id_sales_point = sp_visit.sales_point_id " +
                      " LEFT JOIN status_visit " +
                      " ON status_visit.id_status_visit = sp_visit.status_visit_id " +
                      " WHERE ( sp_visit.roadmap_id = ?)";
        var param = [ roadmap_id ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            var pos_list = Array();
            if (results.rows.length != 0) {
                for (var i=0;i<results.rows.length;i++){ 
                    var pos = new app.domain.sales_point(
                        results.rows.item(i).id_sales_point,
                        results.rows.item(i).name, 
                        results.rows.item(i).email, 
                        results.rows.item(i).description, 
                        results.rows.item(i).contact_name, 
                        results.rows.item(i).phone_number, 
                        results.rows.item(i).street, 
                        results.rows.item(i).city, 
                        results.rows.item(i).postal_code, 
                        results.rows.item(i).gps_latitude,
                        results.rows.item(i).gps_longitude,
                        results.rows.item(i).type_id,
                        results.rows.item(i).user_id,
                        results.rows.item(i).microzone_id,
                        results.rows.item(i).last_visit_id,
                        results.rows.item(i).frequency_id,
                        results.rows.item(i).photo_url,
                        results.rows.item(i).local_id,
                        results.rows.item(i).sync_status
                    );
                    pos.type_name = results.rows.item(i).type_name;
                    pos.roadmap_id = results.rows.item(i).roadmap_id;
                    pos.sp_visit__id_visit = results.rows.item(i).sp_visit__id_visit;
                    pos.sp_visit__sales_point_id = results.rows.item(i).sp_visit__sales_point_id;
                    pos.sp_visit__status_visit_id = results.rows.item(i).sp_visit__status_visit_id;
                    pos.sp_visit__status_visit_name = results.rows.item(i).sp_visit__status_visit_name;
                    pos.sp_visit__scheduled_date = results.rows.item(i).sp_visit__scheduled_date;
                    pos.sp_visit__performed_date = results.rows.item(i).sp_visit__performed_date;
                    pos.sp_visit__rank = results.rows.item(i).sp_visit__rank;
                    pos.sp_visit__comment = results.rows.item(i).sp_visit__comment;
                    pos.sp_visit__local_id = results.rows.item(i).sp_visit__local_id;
                    
                    pos_list[i] = pos;
                }
                op_deferred.resolve(pos_list);
            } else op_deferred.resolve(pos_list);

            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    }; 
    
    repository.getRoadmapItemPosList = function(roadmap_id) {
        app.log('repository.getRoadmapItemPosList : ');
        var op_deferred = $.Deferred();
        var rsql = "SELECT sales_point.*, " +
            		  "sp_type.name AS type_name," +
            		  "sp_visit.roadmap_id AS roadmap_id, " +
            		  "sp_visit.status_visit_id AS sp_visit__status_visit_id " +
                      " FROM sales_point " +
                      " LEFT JOIN sp_type " +
                      " ON sales_point.type_id = sp_type.id_type " +
                      " LEFT JOIN sp_visit " +
                      " ON sales_point.id_sales_point = sp_visit.sales_point_id " +
                      " WHERE ( sp_visit.roadmap_id = ? AND sp_visit.sync_status != ? AND sales_point.sync_status != ?)";
        var param = [ roadmap_id, 'D', 'D' ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            var pos_list = Array();
            if (results.rows.length != 0) {
                for (var i=0;i<results.rows.length;i++){ 
                    var pos = new app.domain.sales_point(
                        results.rows.item(i).id_sales_point,
                        results.rows.item(i).name, 
                        results.rows.item(i).email, 
                        results.rows.item(i).description, 
                        results.rows.item(i).contact_name, 
                        results.rows.item(i).phone_number, 
                        results.rows.item(i).street, 
                        results.rows.item(i).city, 
                        results.rows.item(i).postal_code, 
                        results.rows.item(i).gps_latitude,
                        results.rows.item(i).gps_longitude,
                        results.rows.item(i).type_id,
                        results.rows.item(i).user_id,
                        results.rows.item(i).microzone_id,
                        results.rows.item(i).last_visit_id,
                        results.rows.item(i).frequency_id,
                        results.rows.item(i).photo_url,
                        results.rows.item(i).local_id,
                        results.rows.item(i).sync_status
                    );
                    pos.type_name = results.rows.item(i).type_name,
                    pos.roadmap_id = results.rows.item(i).roadmap_id,
                    pos.sp_visit__status_visit_id = results.rows.item(i).sp_visit__status_visit_id,
                    
                    pos_list[i] = pos;
                    app.log(pos.name);
                }
                op_deferred.resolve(pos_list);
            } else op_deferred.resolve(pos_list);

            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    };  

    
    repository.getAllRoadmapItemPosList = function(roadmap_id) {
        app.log('repository.getAllRoadmapItemPosList : ');
        var op_deferred = $.Deferred();
        var rsql = "SELECT DISTINCT sales_point.*, " +
                      "sp_type.name AS type_name" +
                     // "sp_visit.roadmap_id AS roadmap_id, " +
                     // "sp_visit.status_visit_id AS sp_visit__status_visit_id " +
                      " FROM sales_point " +
                      " LEFT JOIN sp_type " +
                      " ON sales_point.type_id = sp_type.id_type " +
                     //" LEFT JOIN sp_visit " +
                     // " ON sales_point.id_sales_point = sp_visit.sales_point_id " +
                      " order by min(sales_point.id_sales_point);";
        var param =  null ;
        $.when(requestToDB(rsql,param)).done(function(results) {
            var pos_list = Array();
            if (results.rows.length != 0) {
                for (var i=0;i<results.rows.length;i++){ 
                    var pos = new app.domain.sales_point(
                        results.rows.item(i).id_sales_point,
                        results.rows.item(i).name, 
                        results.rows.item(i).email, 
                        results.rows.item(i).description, 
                        results.rows.item(i).contact_name, 
                        results.rows.item(i).phone_number, 
                        results.rows.item(i).street, 
                        results.rows.item(i).city, 
                        results.rows.item(i).postal_code, 
                        results.rows.item(i).gps_latitude,
                        results.rows.item(i).gps_longitude,
                        results.rows.item(i).type_id,
                        results.rows.item(i).user_id,
                        results.rows.item(i).microzone_id,
                        results.rows.item(i).last_visit_id,
                        results.rows.item(i).frequency_id,
                        results.rows.item(i).local_id
                    );
                    pos.type_name = results.rows.item(i).type_name,
                    pos.roadmap_id = results.rows.item(i).roadmap_id,
                   // pos.sp_visit__status_visit_id = results.rows.item(i).sp_visit__status_visit_id,
                    
                    pos_list[i] = pos;
                }
                op_deferred.resolve(pos_list);
            } else op_deferred.resolve(pos_list);

            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    };  
    
    repository.addRoadmap = function(param) {
        app.log("repository.addRoadmap");
        var op_deferred = $.Deferred();
        
        var rsql = "INSERT INTO roadmap ( id_roadmap, initiating_user_id, operating_user_id, mobile_status_id, web_status_id, creation_date, name, scheduled_date, km, area_id, local_id, sync_status ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $.when(requestToDB(rsql,param)).done(function(results) {
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    }; 
    
    repository.activeRoadmap = function(param) {
        app.log("repository.activeRoadmap");
        var op_deferred = $.Deferred();

        var rsql = "UPDATE roadmap SET mobile_status_id = ?, sync_status = ? WHERE id_roadmap = ?";
        $.when(requestToDB(rsql,param)).done(function(results) {
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    }; 
    
    repository.deleteRoadMapItemPos = function(roadmap_id,sales_point_id) {
        app.log('repository.deleteRoadMapItemPos ');
        var op_deferred = $.Deferred();
        //var rsql = "DELETE FROM sp_visit WHERE ( roadmap_id = ? AND sales_point_id = ? )";
        var rsql = "UPDATE sp_visit SET performed_date = date('now','start of month','+1 month','-1 day', 'localtime'), sync_status = ? WHERE ( roadmap_id = ? AND sales_point_id = ? )";
        var param = [ 'D', roadmap_id, sales_point_id ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            op_deferred.resolve(sales_point_id);
        } );
        return op_deferred.promise();
    }; 

    repository.testRoadMapItemPos = function(roadmap_id,sales_point_id,item_index) {
        app.log('repository.testRoadMapItemPos ');
        var op_deferred = $.Deferred();
        var rsql = "SELECT * FROM sp_visit WHERE ( roadmap_id = ? AND sales_point_id = ? AND sync_status != ? )";
        var param = [ roadmap_id, sales_point_id, 'D' ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            if (results.rows.length != 0) op_deferred.resolve(roadmap_id,sales_point_id, item_index, "yes");
            else op_deferred.resolve(roadmap_id,sales_point_id, item_index, "no");
        } );
        return op_deferred.promise();
    };
    
    repository.addRoadMapItemPos = function(param) {
        app.log('repository.addRoadMapItemPos ');
        var op_deferred = $.Deferred();
        var rsql = "INSERT INTO sp_visit (id_visit, sales_point_id, roadmap_id, status_visit_id, scheduled_date, performed_date, rank, comment, local_id, sync_status) VALUES (?,?,?,?,?,?,?,?,?,?)";
        $.when(requestToDB(rsql,param)).done(function(results) {
           
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    }; 
    
    
    repository.getPosVisit = function(sp_visit_id) {
        app.log('repository.getPosVisit : ');
        var op_deferred = $.Deferred();
        var rsql = "SELECT sales_point.*, " +
            "sp_type.name AS type_name," +
            "sp_visit.roadmap_id AS roadmap_id, " +
            "sp_visit.id_visit AS sp_visit__id_visit, " +
            "sp_visit.status_visit_id AS sp_visit__status_visit_id, " +
            "sp_visit.sales_point_id AS sp_visit__sales_point_id, " +
            "sp_visit.scheduled_date AS sp_visit__scheduled_date, " +
            "sp_visit.performed_date AS sp_visit__performed_date, " +
            "sp_visit.rank AS sp_visit__rank, " +
            "sp_visit.comment AS sp_visit__comment, " +
            "sp_visit.local_id AS sp_visit__local_id, " +
            "status_visit.name AS sp_visit__status_visit_name " +
            " FROM sales_point " +
            " LEFT JOIN sp_type " +
            " ON sales_point.type_id = sp_type.id_type " +
            " LEFT JOIN sp_visit " +
            " ON sales_point.id_sales_point = sp_visit.sales_point_id " +
            " LEFT JOIN status_visit " +
            " ON status_visit.id_status_visit = sp_visit.status_visit_id " +
            " WHERE ( sp_visit__id_visit = ?)";
        var param = [ sp_visit_id ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            if (results.rows.length != 0) {
                var i=0; 
                var pos = new app.domain.sales_point(
                    results.rows.item(i).id_sales_point,
                    results.rows.item(i).name, 
                    results.rows.item(i).email, 
                    results.rows.item(i).description, 
                    results.rows.item(i).contact_name, 
                    results.rows.item(i).phone_number, 
                    results.rows.item(i).street, 
                    results.rows.item(i).city, 
                    results.rows.item(i).postal_code, 
                    results.rows.item(i).gps_latitude,
                    results.rows.item(i).gps_longitude,
                    results.rows.item(i).type_id,
                    results.rows.item(i).user_id,
                    results.rows.item(i).microzone_id,
                    results.rows.item(i).last_visit_id,
                    results.rows.item(i).frequency_id,
                    results.rows.item(i).local_id
                );
                pos.type_name = results.rows.item(i).type_name,
                pos.roadmap_id = results.rows.item(i).roadmap_id,
                pos.sp_visit__id_visit = results.rows.item(i).sp_visit__id_visit;
                pos.sp_visit__sales_point_id = results.rows.item(i).sp_visit__sales_point_id;
                pos.sp_visit__status_visit_id = results.rows.item(i).sp_visit__status_visit_id;
                pos.sp_visit__status_visit_name = results.rows.item(i).sp_visit__status_visit_name;
                pos.sp_visit__scheduled_date = results.rows.item(i).sp_visit__scheduled_date;
                pos.sp_visit__performed_date = results.rows.item(i).sp_visit__performed_date;
                pos.sp_visit__rank = results.rows.item(i).sp_visit__rank;
                pos.sp_visit__comment = results.rows.item(i).sp_visit__comment;
                pos.sp_visit__local_id = results.rows.item(i).sp_visit__local_id;
                op_deferred.resolve(pos);
            } else op_deferred.resolve(null);

            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    };  
    
    repository.getQuestionnaires = function(sp_visit_id) {
        app.log('repository.getQuestionnaires : ');
        var op_deferred = $.Deferred();
        var rsql = "SELECT questionnaire.*," +
            "frequency.id_frequency AS frequency__frequency_id," +
            "frequency.label AS frequency__label," +
            "frequency.frequency AS frequency__frequency," +
            "frequency.frq_code AS frequency__frq_code," +
            "(SELECT count(*) " +
            "   FROM questionnaire_question " +
            "   WHERE questionnaire_question.questionnaire_id = questionnaire.id_questionnaire" +
            ") AS nb_question, " +
            
            "(SELECT count(*) " +
            "   FROM questionnaire_question " +
            "   LEFT JOIN questions_frequency ON questionnaire_question.question_id = questions_frequency.question_id AND questions_frequency.frequency_id = questionnaire.frequency_id" +
            "   WHERE questionnaire_question.questionnaire_id = questionnaire.id_questionnaire" +
            //"   AND questions_frequency.frequency_id = questionnaire.frequency_id " +
            "   AND questions_frequency.mandatory = '1'" +
            ") AS nb_question_mandatory, " +

            "(SELECT count(*) FROM sp_answer " +
            "   LEFT JOIN questions_answer ON sp_answer.answer_id = questions_answer.id_answer" +
            "   WHERE sp_answer.questionnaire_id = questionnaire.id_questionnaire" +
            "   AND sp_answer.visit_id = ?" +
            "   AND sp_answer.sync_status != 'D'" +
            ") AS nb_answer " +
            
            " FROM questionnaire " +
            " LEFT JOIN frequency ON questionnaire.frequency_id = frequency.id_frequency " +
            " LEFT JOIN sales_point ON sales_point.frequency_id = frequency.id_frequency " +
            " LEFT JOIN sp_visit ON sales_point.id_sales_point = sp_visit.sales_point_id " +
            " WHERE ( sp_visit.id_visit = ?)" +
            " ORDER BY questionnaire.rank ASC";
        var param = [ sp_visit_id, sp_visit_id ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            var questionnaires = Array();
            if (results.rows.length != 0) {
                for (var i=0;i<results.rows.length;i++){ 
                    var questionnaire = new app.domain.questionnaire(
                        results.rows.item(i).id_questionnaire,
                        results.rows.item(i).name, 
                        results.rows.item(i).translation_id, 
                        results.rows.item(i).frequency_id, 
                        results.rows.item(i).rank, 
                        results.rows.item(i).status
                    );
                    questionnaire.frequency__frequency_id = results.rows.item(i).frequency__frequency_id,
                    questionnaire.frequency__label = results.rows.item(i).frequency__label,
                    questionnaire.frequency__frequency = results.rows.item(i).frequency__frequency;
                    questionnaire.frequency__frq_code = results.rows.item(i).frequency__frq_code;
                    questionnaire.nb_question = results.rows.item(i).nb_question;
                    questionnaire.nb_question_mandatory = results.rows.item(i).nb_question_mandatory;
                    questionnaire.nb_answer = results.rows.item(i).nb_answer;
                    questionnaires[i] = questionnaire;
                }
                op_deferred.resolve(questionnaires);
            } else op_deferred.resolve(null);

            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    };  
    
    repository.getQuestionnaire = function(questionnaire_id) {
        app.log('repository.getQuestionnaire : '+ questionnaire_id);
        var op_deferred = $.Deferred();
        var rsql = "SELECT * FROM questionnaire WHERE ( id_questionnaire = ? )";
        var param = [ questionnaire_id ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            if (results.rows.length != 0) {
                var i=0;
                var questionnaire = new app.domain.questionnaire(
                    results.rows.item(i).id_questionnaire,
                    results.rows.item(i).name, 
                    results.rows.item(i).translation_id, 
                    results.rows.item(i).frequency_id, 
                    results.rows.item(i).rank, 
                    results.rows.item(i).status
                );
                
                op_deferred.resolve(questionnaire);
            }
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    };   

    repository.getQuestionnaireQuestions = function(questionnaire_id) {
        app.log('repository.getQuestionnaireQuestions : '+ questionnaire_id);
        var op_deferred = $.Deferred();
        var rsql = "SELECT * FROM question " +
            " LEFT JOIN questionnaire_question " +
            " ON questionnaire_question.question_id = question.id_question " +
            " WHERE ( questionnaire_question.questionnaire_id = ?)";
        var param = [ questionnaire_id ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            var questions = Array();
            if (results.rows.length != 0) {
                for (var i=0;i<results.rows.length;i++){ 
                    var question = new app.domain.question(
                        results.rows.item(i).id_question,
                        results.rows.item(i).translation_id, 
                        results.rows.item(i).question_type, 
                        results.rows.item(i).label, 
                        results.rows.item(i).rank, 
                        results.rows.item(i).status
                    );
                    questions[i] = question;
                }
                op_deferred.resolve(questions);
            }
            op_deferred.resolve(questions);
        } );
        return op_deferred.promise();
    }; 

    repository.getQuestionnaireQuestionsAnswer = function(questionnaire_id) {
        app.log('repository.getQuestionnaireQuestions : '+ questionnaire_id);
        var op_deferred = $.Deferred();
        var rsql = "SELECT * FROM questions_answer " +
            " LEFT JOIN question ON question.id_question = questions_answer.question_id " +
            " LEFT JOIN questionnaire_question ON questionnaire_question.question_id = question.id_question " +
            " WHERE ( questionnaire_question.questionnaire_id = ?)";
        var param = [ questionnaire_id ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            var questions_answer_list = Array();
            if (results.rows.length != 0) {
                for (var i=0;i<results.rows.length;i++){ 
                    var questions_answer = new app.domain.questions_answer(
                        results.rows.item(i).id_answer,
                        results.rows.item(i).translation_id, 
                        results.rows.item(i).question_id, 
                        results.rows.item(i).label, 
                        results.rows.item(i).rank, 
                        results.rows.item(i).status
                    );
                    questions_answer_list[i] = questions_answer;
                }
                op_deferred.resolve(questions_answer_list);
            }
            op_deferred.resolve(questions_answer_list);
        } );
        return op_deferred.promise();
    };  
    
    repository.resetQuestionnaireSpAnswer = function(sp_visit_id,questionnaire_id) {
        app.log('repository.resetQuestionnaireSpAnswer ');
        var op_deferred = $.Deferred();
        //var rsql = "DELETE FROM sp_answer WHERE ( visit_id = ? AND questionnaire_id = ? )";
        var rsql = "UPDATE sp_answer SET answer_time = ?,  sync_status = ? WHERE ( visit_id = ? AND questionnaire_id = ? )";
        var param = [ app.utils.convertTimestampToDateIso(new Date(),'/'), 'D', sp_visit_id, questionnaire_id ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    }; 
    
    repository.addQuestionnaireSpAnswer = function(data) {
        app.log("repository.addQuestionnaireSpAnswer");
        var op_deferred = $.Deferred();

        var rsql = "INSERT INTO sp_answer ( sales_point_id, visit_id, questionnaire_id, question_id, answer_id, answer, answer_time, sync_status ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ? )";
        $.when(requestToDB(rsql,data)).done(function(results) {
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    }; 

    repository.getQuestionnaireSpAnswer = function(visit_id, questionnaire_id) {
        app.log('repository.getQuestionnaireAnswer');
        var op_deferred = $.Deferred();
        var rsql = "SELECT * FROM sp_answer WHERE ( visit_id = ? AND questionnaire_id = ? AND sync_status != ?)";
        var param = [ visit_id, questionnaire_id, 'D' ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            var answers = Array();
            if (results.rows.length != 0) {
                for (var i=0;i<results.rows.length;i++){ 
                    var answer = new app.domain.sp_answer(
                        results.rows.item(i).sales_point_id,
                        results.rows.item(i).visit_id, 
                        results.rows.item(i).questionnaire_id, 
                        results.rows.item(i).question_id, 
                        results.rows.item(i).answer_id, 
                        results.rows.item(i).answer, 
                        results.rows.item(i).answer_time,
                        results.rows.item(i).sync_status
                        );
                    answers[i] = answer;
                }
                op_deferred.resolve(answers);
            }
            op_deferred.resolve(answers);
        } );
        return op_deferred.promise();
    }; 
    
    repository.getStatusVisit = function() {
        app.log('repository.getStatusVisit  ');
        var op_deferred = $.Deferred();
        var rsql = "SELECT * FROM status_visit";
        var param = null;
        $.when(requestToDB(rsql,param)).done(function(results) {
            var status_visit = Array();
            if (results.rows.length != 0) {
                for (var i=0;i<results.rows.length;i++){ 
                    var stv = new app.domain.status_visit(
                        results.rows.item(i).id_status_visit,
                        results.rows.item(i).name, 
                        results.rows.item(i).translation_id
                    );
                    status_visit[i] = stv;
                }
                op_deferred.resolve(status_visit);
            }
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    };
    
    repository.getStatusMobile = function() {
        app.log('repository.getStatusRoadmap  ');
        var op_deferred = $.Deferred();
        var rsql = "SELECT * FROM status_mobile";
        var param = null;
        $.when(requestToDB(rsql,param)).done(function(results) {
            var status_mobile = Array();
            if (results.rows.length != 0) {
                for (var i=0;i<results.rows.length;i++){ 
                    var stm = new app.domain.status_mobile(
                        results.rows.item(i).id_status_mobile,
                        results.rows.item(i).name, 
                        results.rows.item(i).translation_id
                    );
                    status_mobile[i] = stm;
                }
                op_deferred.resolve(status_mobile);
            }
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    };
    
    repository.closeRoadmapVisit = function(param) {
        app.log("repository.closeRoadmapVisit");
        var op_deferred = $.Deferred();

        var rsql = "UPDATE sp_visit SET status_visit_id = ?, performed_date = ?, comment = ?, sync_status = ? WHERE id_visit = ?";
        $.when(requestToDB(rsql,param)).done(function(results) {
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    }; 
    
    repository.closeRoadmap = function(param) {
        app.log("repository.closeRoadmap");
        var op_deferred = $.Deferred();

        var rsql = "UPDATE roadmap SET mobile_status_id = ?, close_date = ?, comment = ?, sync_status = ? WHERE id_roadmap = ?";
        $.when(requestToDB(rsql,param)).done(function(results) {
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    }; 
    
    //// ## PARAMS ## ////
    repository.getUserItem = function(id_user) {
        app.log('repository.getUserItem : '+ id_user);
        var op_deferred = $.Deferred();
        var rsql = "SELECT * FROM sys_users WHERE ( id_user = ?)";
        var param = [ id_user ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            if (results.rows.length != 0) {
                var i = 0;
                var user = new app.domain.User(
                    results.rows.item(i).id_user,
                    results.rows.item(i).parent_id, 
                    results.rows.item(i).user_category_id, 
                    results.rows.item(i).username, 
                    results.rows.item(i).password, 
                    results.rows.item(i).lastname, 
                    results.rows.item(i).firstname, 
                    results.rows.item(i).email, 
                    results.rows.item(i).phone, 
                    results.rows.item(i).preferred_language_id,
                    results.rows.item(i).target_val
                );
                op_deferred.resolve(user);
            }
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    };  
    
    repository.getLanguages = function() {
        app.log('repository.getLanguages  ');
        var op_deferred = $.Deferred();
        var rsql = "SELECT * FROM sys_language";
        var param = null;
        $.when(requestToDB(rsql,param)).done(function(results) {
            var languages = Array();
            if (results.rows.length != 0) {
                for (var i=0;i<results.rows.length;i++){ 
                    var language = new app.domain.sys_language(
                        results.rows.item(i).id_language,
                        results.rows.item(i).name, 
                        results.rows.item(i).short_name,
                        results.rows.item(i).default_language
                    );
                    languages[i] = language;
                }
                op_deferred.resolve(languages);
            }
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    }; 
    
    repository.getLanguage = function(id_language) {
        app.log('repository.getLanguage ');
        var op_deferred = $.Deferred();
        var rsql = "SELECT * FROM sys_language WHERE ( id_language = ?)";
        var param = [ id_language ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            if (results.rows.length != 0) {
                var i = 0;
                var language = new app.domain.sys_language(
                    results.rows.item(i).id_language,
                    results.rows.item(i).name, 
                    results.rows.item(i).short_name,
                    results.rows.item(i).default_language
                );
                op_deferred.resolve(language);
            }
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    }; 
    
    repository.editParamsSave = function(param) {
        app.log("repository.editPosSave");
        var op_deferred = $.Deferred();
        
        var rsql = "UPDATE sys_users SET lastname = ?, firstname = ?, email = ?, phone = ?, preferred_language_id = ?, target_val = ?, sync_status = 'U' WHERE id_user = ?";
        $.when(requestToDB(rsql,param)).done(function(results) {
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    }; 
    
    ////## Local Authentication ## ////
    repository.localAuthentication = function(username,password) {
        app.log('repository.localAuthentication : '+ username);
        var op_deferred = $.Deferred();
        var rsql = "SELECT * FROM sys_users WHERE ( username = ? AND password = ?)";
        var param = [ username, password ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            if (results.rows.length != 0) {
                var i = 0;
                var user = new app.domain.User(
                    results.rows.item(i).id_user,
                    results.rows.item(i).parent_id, 
                    results.rows.item(i).user_category_id, 
                    results.rows.item(i).username, 
                    results.rows.item(i).password, 
                    results.rows.item(i).lastname, 
                    results.rows.item(i).firstname, 
                    results.rows.item(i).email, 
                    results.rows.item(i).phone, 
                    results.rows.item(i).preferred_language_id,
                    results.rows.item(i).target_val
                );
                op_deferred.resolve(user);
            }
            op_deferred.resolve( new app.domain.User( 0 ) );
        } );
        return op_deferred.promise();
    }; 
    
    // get last ID
    repository.last_insert_rowid = function() {
        app.log('repository.localAuthentication : '+ username);
        var op_deferred = $.Deferred();
        var rsql = "SELECT last_insert_rowid()";
        var param = null;
        $.when(requestToDB(rsql,param)).done(function(result) {
            op_deferred.resolve(result);
        } );
        return op_deferred.promise();
    }; 
    
    repository.requestSQL = function(rSQL,param) {
        //alert(rSQL);
        var rsql_deferred = $.Deferred();
        app.repository.database = window.openDatabase(app.repository.databaseName, app.repository.databaseVersion, app.repository.databaseDisplayName, app.repository.databaseSize);
        app.repository.database.transaction(function(tx) {
            tx.executeSql(rSQL, param,
                function(tx,result) {
                    rsql_deferred.resolve(result);
                },
                function (tx, error) {
                    app.log("code : "+ error.code+" \nmes : " + error.message + " \n \nrsql : " + rSQL ,'err_sql');
                }
            );
        });
        return rsql_deferred.promise();
    }; 
    
    //// ## Generic request function ## ////
    function requestToDB(rSQL,param) {
        var rsql_deferred = $.Deferred();
        app.repository.database = window.openDatabase(app.repository.databaseName, app.repository.databaseVersion, app.repository.databaseDisplayName, app.repository.databaseSize);
        app.repository.database.transaction(function(tx) {
            tx.executeSql(rSQL, param,
                function(tx,result) {
                    rsql_deferred.resolve(result);
                },
                function (tx, error) {
                    app.log("code : "+ error.code+" \nmes : " + error.message + " \n \nrsql : " + rSQL ,'err_sql');
                }
            );
        });
        return rsql_deferred.promise();
    };
    
    var json_data;
    repository.sqlite2json = function(tb_name,fields_to_export,sync_status){
		var jsondata_deferred = $.Deferred();

		app.repository.database = window.openDatabase(app.repository.databaseName, app.repository.databaseVersion, app.repository.databaseDisplayName, app.repository.databaseSize);
        app.repository.database.transaction(function(tx) {
        	var select_var = "";
        	for (var i = 0; i < fields_to_export.length; i++) {
        		if(select_var != '') select_var += ", ";
        		select_var += fields_to_export[i];
        	}
        	if(select_var == '') select_var = "* ";
        	if(sync_status == 'all') sync_status = ' WHERE ( sync_status="U" OR sync_status="I" OR sync_status="D" )';
        	else sync_status ='';
        	var rsql = 'SELECT '+select_var+' FROM '+tb_name+''+sync_status+';';
        	//alert(rsql);
	        tx.executeSql(rsql, [],
                function(tx,result) {
					json_data = '{"entity_type":"'+tb_name+'","content":[';
		            if (result != null && result.rows != null) {
		                for (var k = 0; k < result.rows.length; k++) {
			            	if(k == 0) var row_val = "{";
			            	else var row_val = ", {";
				        	for (var i = 0; i < fields_to_export.length; i++) {
				        		if(i != 0) row_val += ", ";
				        		var val = eval('result.rows.item(k).'+fields_to_export[i]);
				        		row_val += '"'+fields_to_export[i]+'":"'+val+'"';
				        	}
			            	row_val += "}";
			            	json_data += row_val;
			            }
			        }
		            json_data += ']}';
					jsondata_deferred.resolve(json_data);
                },
                function (tx, error) {
					json_data = '{"entity_type":"'+tb_name+'","content": [] }';
					jsondata_deferred.resolve(json_data);
                }
	        );
	    });   

		return jsondata_deferred.promise();
	};
    
    
    return repository;
    
}());