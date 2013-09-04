'use strict';

app.webservice = (function() {

	var webservice = {};
	webservice.RETAIL_SERVICE_URL = "http://dev.res-novae.fr/vrn_retail_webservice/"; 
	//webservice.RETAIL_SERVICE_URL = "http://10.0.100.116/rn/rn__vrn_retail_webservice/";
	// Protocol
	webservice.CONTENT_TYPE_JSON = "application/json; charset=utf-8";
	webservice.METHOD_POST = "POST";
	webservice.DATA_TYPE_JSON = "json";
	// Service names
	webservice.AUTH_SERVICE_NAME = "authLoginUser.ws";
    webservice.AUTH_PASSWORD_SERVICE_NAME = "authPasswordRecovery.ws";
    webservice.SYNC_LAST_UPDATE_SERVICE_NAME = "SyncGetLastUpdateUrl.ws";
    webservice.SYNC_UPDATE_STATUS_SERVICE_NAME = "SyncUpdateStatus.ws";
    webservice.SYNC_UPLOAD_DATA_SERVICE_NAME = "SyncUploadData.ws";
    	
	webservice.init = function(doneCallback) {
		app.log("# app.webservice : init");

		doneCallback();
	};
	
		// general method, handling envelope/wire-payload
	function executePost(webservice_type, ajaxAsyncTask, requestObject, successCallback, errorCallback) {
		if (ajaxAsyncTask.cancelled) {
			ajaxAsyncTask.active = false;
			app.log("app.service: post task cancelled before executing",'pause');
			return;
		}
		var serviceUrl = webservice.RETAIL_SERVICE_URL + webservice_type;
		app.log("app.webservice: executing post " + serviceUrl);
		// console.log("app.service: " + JSON.stringify(requestObject));
		ajaxAsyncTask.jqXHR = $.ajax({
			url : serviceUrl,
			type : webservice.METHOD_POST,
			contentType : webservice.CONTENT_TYPE_JSON,
			dataType : webservice.DATA_TYPE_JSON,
			data : JSON.stringify(requestObject),
			success : function(response) {
				if (ajaxAsyncTask.cancelled) {
					app.log("app.webservice: post task sucessful, but cancelled " + serviceUrl,'pause');
				} else {
					if (response.response_status.status == 0) {
						app.log("app.webservice: successful post " + serviceUrl,'success');
						successCallback(response.response_object);
					} else {
						app.log("app.webservice: successful post, but with logical errors " + JSON.stringify(response));
						errorCallback(app.domain.TRANSLATION_ID.UNKNOWN_ERROR);
					}
				}
				ajaxAsyncTask.active = false;
			},
			error : function() {
				if (ajaxAsyncTask.cancelled) {
					app.log("app.webservice: post task with errors but cancelled " + serviceUrl,'pause');
				} else {
					app.log("app.webservice: failed to post " + serviceUrl,'err');
					errorCallback(app.domain.TRANSLATION_ID.UNKNOWN_ERROR);
				}
				ajaxAsyncTask.active = false;
			}
		});
	};
	
    webservice.authenticateUser = function(ajaxAsyncTask, username, password, successCallback, errorCallback) {
        executePost(webservice.AUTH_SERVICE_NAME,ajaxAsyncTask, {
            username : username,
            password : $.MD5(password), // "098f6bcd4621d373cade4e832627b4f6"
            debug : true
        }, function(item) {
            successCallback(new app.domain.User(
                item.id_user, 
                item.parent_id, 
                item.user_category_id, 
                username, 
                password, 
                item.firstname,
                item.lastname, 
                item.email, 
                item.phone, 
                item.preferred_language_id,
                item.target_val
            ));
        }, function(err) {
            errorCallback(err);
        });
    };
    
    webservice.syncGetLastUpdateUrl = function(ajaxAsyncTask, userId, successCallback, errorCallback) {
        app.log("webservice.syncGetLastUpdateUrl",'wip')
        app.log("= = = = SYNC LAST UPDATE = = = = > > >")
        executePost(webservice.SYNC_LAST_UPDATE_SERVICE_NAME,ajaxAsyncTask, {
            last_download_date : '',
            user_id : userId, 
            debug : true
        }, function(sync_data) {
            successCallback(sync_data);
        }, function(err) {
            app.log(err,'err');
        });
    };

    webservice.syncUpdateStatus = function(ajaxAsyncTask, userId, sync_id, status_code, successCallback, errorCallback) {
        app.log("webservice.syncUpdateStatus : " + status_code)
        executePost(webservice.SYNC_UPDATE_STATUS_SERVICE_NAME,ajaxAsyncTask, {
            sync_id : sync_id,
            user_id : userId, 
            status_code : status_code, 
            debug : true
        }, function(sync_data) {
            successCallback(sync_data);
        }, function(err) {
            app.log(err,'err');
        });
    };
    
	return webservice;
}());