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
	
    function checkDatabase(doneCallback){
        repository.database = window.openDatabase(repository.databaseName, repository.databaseVersion, repository.databaseDisplayName, repository.databaseSize);
        repository.database.transaction(function(tx) {
            // app.log("app.repository: languageId " + languageId);
            tx.executeSql("SELECT id FROM user ", null, 
                function(tx, results) {
                    if (results.rows.length == 1) {
                        app.log("app.repository: DB : " + repository.databaseName + " yes | Data : yes",'success');
                        doneCallback();
                    } else {
                        app.log("app.repository: DB : " + repository.databaseName + " yes | Data : no",'success');
                        doneCallback();
                    }
                }, function() {
                    app.log("app.repository: DB : " + repository.databaseName + " no | Data : no",'success');
                    app.importFile.init(repository,doneCallback);
                    
                }
            );
        });
    };
    
    repository.init = function(doneCallback) {
        app.log("# app.repository : init", 'wip');
        
        checkDatabase(doneCallback);

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
    
    repository.purgeData = function(doneCallback) {
        app.log("# app.repository : purge data", 'wip');
        
        repository.database = window.openDatabase(repository.databaseName, repository.databaseVersion, repository.databaseDisplayName,
                repository.databaseSize);
        repository.database.transaction(function(tx) {
           //tx.executeSql("DROP TABLE IF EXISTS Translation");
           //tx.executeSql("DROP TABLE IF EXISTS language");
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
           tx.executeSql("DROP TABLE IF EXISTS questionnaire");
           tx.executeSql("DROP TABLE IF EXISTS questionnaire_question");
           tx.executeSql("DROP TABLE IF EXISTS questions_answer");
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
           tx.executeSql("CREATE TABLE IF NOT EXISTS sys_users (id_user INTEGER UNIQUE, parent_id INTEGER, user_category_id INTEGER, username, password, lastname, firstname, email, phone, preferred_language_id INTEGER, target_val)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS usr_area (user_id INTEGER, area_id INTEGER)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS frequency (id_frequency INTEGER UNIQUE, label, translation_id INTEGER, frequency, frq_code)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS message (id_message INTEGER UNIQUE, message_type, send_date, start_date, end_date, content, priority, attachment, id_usr_message INTEGER, lastname, read INTEGER DEFAULT '0')");
           tx.executeSql("CREATE TABLE IF NOT EXISTS question (id_question INTEGER UNIQUE, translation_id INTEGER, question_type, label, rank, status)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS questionnaire (id_questionnaire INTEGER UNIQUE, name, translation_id INTEGER, frequency_id INTEGER, rank, status)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS questionnaire_question (questionnaire_id INTEGER , question_id INTEGER)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS questions_answer (id_answer INTEGER UNIQUE, translation_id INTEGER, question_id INTEGER, label, rank, status)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS roadmap (id_roadmap INTEGER UNIQUE, initiating_user_id INTEGER, operating_user_id INTEGER, mobile_status_id INTEGER, web_status_id INTEGER, creation_date, name, scheduled_date, km, comment, close_date, area_id INTEGER, local_id INTEGER)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS sales_point (id_sales_point INTEGER UNIQUE, name, email, description, contact_name, phone_number, street, city, postal_code, gps_latitude, gps_longitude, type_id INTEGER, user_id INTEGER, microzone_id INTEGER, last_visit_id INTEGER, frequency_id INTEGER, local_id INTEGER)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS status_mobile (id_status_mobile INTEGER UNIQUE, name, translation_id INTEGER)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS status_visit (id_status_visit INTEGER UNIQUE, name, translation_id INTEGER)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS sp_type (id_type INTEGER UNIQUE, name, translation_id INTEGER)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS sp_visit (id_visit INTEGER UNIQUE, sales_point_id INTEGER, roadmap_id INTEGER, status_visit_id INTEGER, scheduled_date, performed_date, rank, comment, local_id INTEGER)");
           tx.executeSql("CREATE TABLE IF NOT EXISTS help (id_help INTEGER UNIQUE, zip_name)");
           doneCallback();
         } );
         
           
    };
	
	repository.saveOrUpdateUser = function(user, successCallback, errorCallback) {
		repository.database = window.openDatabase(repository.databaseName, repository.databaseVersion, repository.databaseDisplayName,
				repository.databaseSize);
		repository.database.transaction(function(tx) {
			app.log(user.username);
			tx.executeSql("UPDATE User SET parent_id = ?, user_category_id = ?, username = ?, password = ?, lastname = ?, firstname = ?, email = ?, phone = ?, preferred_language_id = ?, target_val = ? WHERE id = ?",
					[ user.parent_id, user.user_category_id, user.username, user.password, user.lastname, user.firstname, user.email, user.phone, user.preferred_language_id, user.target_val, user.id ], function(tx,
							results) {
						if (results.rowsAffected == 1) {
							app.log("app.repository: User updated " + JSON.stringify(user),'success');
							successCallback(user);
						} else {
							tx.executeSql("INSERT INTO User (id, parent_id, user_category_id, username, password, lastname, firstname, email, phone, preferred_language_id, target_val) "
									+ "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [ user.id, user.parent_id, user.user_category_id, user.username, user.password, user.lastname, user.firstname, user.email, user.phone, user.preferred_language_id, user.target_val ], 
									function() {
								app.log("app.repository: User inserted " + JSON.stringify(user),'success');
								successCallback(user);
							}, function(tx, error) {
								app.log("app.repository: A Error while saving or updating user " + JSON.stringify(error),'err_sql');
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
	
	repository.loadUser = function(userId, successCallback) {
		repository.database.transaction(function(tx) {
			tx.executeSql("SELECT id, parent_id, user_category_id, username, password, lastname, firstname, email, phone, preferred_language_id, target_val FROM User WHERE (id = ?)", [ userId ],
					function(tx, results) {
						if (results.rows.length == 1) {
							var item = results.rows.item(0);
							var user = new app.domain.User(
							    item.id, 
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
                        results.rows.item(i).content, 
                        results.rows.item(i).priority, 
                        results.rows.item(i).attachment, 
                        results.rows.item(i).id_usr_message, 
                        results.rows.item(i).lastname,
                        results.rows.item(i).read
                    );
                    messages[i] = message;
                }
                op_deferred.resolve(messages);
            }
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    };  
    
    
    
    
    repository.getMessages_old = function(successCallback) {
        app.log('repository.getMessages');
        repository.database.transaction(function(tx) {
            tx.executeSql("SELECT * FROM message", null, function(tx, results) {
                
                var messages = Array();
                if (results.rows.length != 0) {
                    for (var i=0;i<results.rows.length;i++){ 
                        var message = new app.domain.message(
                            results.rows.item(i).id_message,
                            results.rows.item(i).message_type, 
                            results.rows.item(i).send_date, 
                            results.rows.item(i).start_date, 
                            results.rows.item(i).end_date, 
                            results.rows.item(i).content, 
                            results.rows.item(i).priority, 
                            results.rows.item(i).attachment, 
                            results.rows.item(i).id_usr_message, 
                            results.rows.item(i).lastname,
                            results.rows.item(i).read
                        );
                        messages[i] = message;
                    }
                    app.log("successCallback 1");
                    successCallback(messages);
                } else {
                    app.log("successCallback 2");
                    successCallback(Array());
                }
                
            }, function(transaction, error) {
                app.log("Code : "+ error.code + " error : " + error.message ,'err_sql');
              }
            );
        });
    };	
    
    
    
    
    
    
    repository.checkMessageStatus = function(id_message,successCallback) {
        app.log('repository.checkMessageStatus');
        repository.database.transaction(function(tx) {
            app.log("app.repository: updating message status read with id_message " + id_message);
            tx.executeSql("UPDATE message SET read = ? WHERE id_message = ?", [ 1, id_message ], function(tx, results) {
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
                        results.rows.item(i).local_id
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
                    results.rows.item(i).local_id
                );
                op_deferred.resolve(sp);
            }
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    };  
    
    //// ## ROADMAP ## ////
    repository.getRoadmapList = function(user_id) {
        app.log('repository.getRoadmapList : ');
        var op_deferred = $.Deferred();
        var rsql = "SELECT roadmap.*, area_item.name AS area_name, " 
                  +" (SELECT count(*) FROM sp_visit WHERE sp_visit.roadmap_id = roadmap.id_roadmap) AS nb_visit, "
                  +" (SELECT count(*) FROM sp_visit WHERE sp_visit.roadmap_id = roadmap.id_roadmap AND sp_visit.status_visit_id != '1') AS nb_visited "
                  +" FROM roadmap "
                  +" LEFT JOIN area_item " 
                  +" ON roadmap.area_id = area_item.id_item "
                  +" WHERE ( operating_user_id = ?)";
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
                        results.rows.item(i).local_id
                    );
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
                    results.rows.item(i).local_id
                );
                op_deferred.resolve(roadmap);
            }
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    };  

    repository.getRoadmapItemPosList = function(roadmap_id) {
        app.log('repository.getRoadmapItemPosList : ');
        var op_deferred = $.Deferred();
        var rsql = "SELECT sales_point.*, sp_type.name AS type_name, sp_visit.roadmap_id AS roadmap_id " 
                  +" FROM sales_point "
                  +" LEFT JOIN sp_type " 
                  +" ON sales_point.type_id = sp_type.id_type "
                  +" LEFT JOIN sp_visit " 
                  +" ON sales_point.id_sales_point = sp_visit.sales_point_id "
                  +" WHERE ( sp_visit.roadmap_id = ?)";
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
                        results.rows.item(i).local_id
                    );
                    pos.type_name = results.rows.item(i).type_name,
                    pos.roadmap_id = results.rows.item(i).roadmap_id,
                    
                    pos_list[i] = pos;
                    app.log(pos.name);
                }
                op_deferred.resolve(pos_list);
            } else op_deferred.resolve(pos_list);

            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    };  
        
    //// ## PARAMS ## ////
    repository.getUserItem = function(id_user) {
        app.log('repository.getUserItem : '+ id_user);
        var op_deferred = $.Deferred();
        var rsql = "SELECT * FROM User WHERE ( id = ?)";
        var param = [ id_user ];
        $.when(requestToDB(rsql,param)).done(function(results) {
            if (results.rows.length != 0) {
                var i = 0;
                var roadmap = new app.domain.User(
                    results.rows.item(i).id,
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
                op_deferred.resolve(roadmap);
            }
            op_deferred.resolve(null);
        } );
        return op_deferred.promise();
    };  
    
    //// ## Generic request function ## ////
    function requestToDB(rSQL,param) {
        var rsql_deferred = $.Deferred();
        app.repository.database.transaction(function(tx) {
            tx.executeSql(rSQL, param,
                function(tx,result) {
                    rsql_deferred.resolve(result);
                },
                function(tx, error) {
                    app.log("code : "+ error.code+" \nmes : " + error.message + " \n \nrsql : " + rSQL ,'err_sql');
                }
            )
        });
        return rsql_deferred.promise();
    }
    
	return repository;
	
}());