'use strict';

var app = (function() {
	var app_ = {};

	app_.languageId = 1;
	app_.loggedUser = null;
	app_.settings = null;
	app_.session = null;
	app_.repository = null;
	app_.webservice = null;
	app_.networkState = null;
	app_.controler = null;
	app_.authenticatedInThisSession = null;
	
	app_.translationCache = {};

	app_.loggingEnabled = true;
	app_.log = function(message,style_mesage,more_log) {
		if (app_.loggingEnabled) {
		    if(style_mesage == null) console.log(message);
            else if(style_mesage == 'err') console.log('%c ::  Error  :: ', "background: #cdcdcd; color: #ff0000",message);
            else if(style_mesage == 'err_sql') console.log('%c :: SQL err :: ', "background: #cdcdcd; color: #ff0000",message);
            else if(style_mesage == 'success') console.log('%c :: Success :: ', "background: #000000; color: #00ff06",message);
            else if(style_mesage == 'pause') console.log('%c ::  Pause  :: ', "background: #000000; color: #ffa800",message);
            else if(style_mesage == 'wip') console.log('%c ::   WIP   :: ', "background: #000000; color: #e4ff00",message);
            else console.log(message,style_mesage,more_log);
		}
	};

	app_.init = function() {
		app_.log("# APP Init");
		app_.loggedUser = null;

		// init session
		app_.testConnexion(
			function(doneCallback) {
				app_.initRepository(
					function(doneCallback) {
						app_.initWebservice(app_.isReady);
					}
				);
			}
		);
		
	};
	
	app_.isReady = function() {
		app_.log("# APP is ready :)");
		app_.controller = app_.controller.init();
		//$("#vrn-index-page-loading").hide();
	};

	app_.testConnexion = function(doneCallback) {
		var networkState = app_.testNetwork();
		// si connexion internet
		var nav = navigator.userAgent; 
        var ischrome = nav.indexOf("Chrome") ? true : false;
        if (ischrome) setTimeout(doneCallback, 500);
        else{
    		if (networkState != Connection.NONE) {
    			$("#vrn-index-loading-progress-dots").html($("#vrn-index-loading-progress-dots").html() + '<img src="img/dotv.png" class="vrn-index-loading-dot">');
    			setTimeout(doneCallback, 500);
    		}else{
    			$("#vrn-index-loading-progress-dots").html($("#vrn-index-loading-progress-dots").html() + '<img src="img/dotr.png" class="vrn-index-loading-dot">');
    			setTimeout(doneCallback, 500);
    		}
        }
	};

	app_.initRepository = function(doneCallback) {
		app_.repository.init(
			function() {
				$("#vrn-index-loading-progress-dots").html($("#vrn-index-loading-progress-dots").html() + '<img src="img/dotv.png" class="vrn-index-loading-dot">');
				setTimeout(doneCallback, 500);
			},
			function() {
				$("#vrn-index-loading-progress-dots").html($("#vrn-index-loading-progress-dots").html() + '<img src="img/dotr.png" class="vrn-index-loading-dot">');
				setTimeout(doneCallback, 500);
			}
		);

	};

	app_.initWebservice= function(doneCallback) {
		app_.webservice.init(
			function() {
				$("#vrn-index-loading-progress-dots").html($("#vrn-index-loading-progress-dots").html() + '<img src="img/dotv.png" class="vrn-index-loading-dot">');
				setTimeout(doneCallback, 500);
			},
			function() {
				$("#vrn-index-loading-progress-dots").html($("#vrn-index-loading-progress-dots").html() + '<img src="img/dotr.png" class="vrn-index-loading-dot">');
				setTimeout(doneCallback, 500);
			}
		);

	};
	
	app_.testNetwork = function() {
	    app_.log("test connexion");
	    var nav = navigator.userAgent; 
	    var ischrome = nav.indexOf("Chrome") ? true : false;
	    if (ischrome)  return;
		var networkState = navigator.network.connection.type;
			
		var states = {};
		states[Connection.UNKNOWN]  = 'Unknown connection';	
		states[Connection.ETHERNET] = 'Ethernet connection';
		states[Connection.WIFI]     = 'WiFi connection';
	 	states[Connection.CELL_2G]  = 'Cell 2G connection';
		states[Connection.CELL_3G]  = 'Cell 3G connection';
		states[Connection.CELL_4G]  = 'Cell 4G connection';
		states[Connection.NONE]     = 'No network connection';
					
		app_.log(':: Test network: ' + states[networkState]);
		
		return networkState;
	};

	app_.loadTranslations = function(translationIds, doneCallback) {
		app_.log("app: loading translations " + translationIds);
		app_.repository.loadTranslations(app_.languageId, translationIds, function(translationValues) {
			var i;
			for (i = 0; i < translationIds.length; i++) {
				app_.translationCache[translationIds[i]] = translationValues[i];
			}
			app_.log("app: translations added to cache " + translationValues);
			doneCallback();
		});
	};

	app_.translateText = function(translationId, jqComponent) {
		//app_.log("app: translating text with " + translationId);
		var cachedTranslationValue = app_.translationCache[translationId];
		if (cachedTranslationValue) {
			//app_.log("app: translation found in cache - " + cachedTranslationValue);
			jqComponent.text(cachedTranslationValue);
		} else {
			app_.log(app_.repository);
			app_.repository.loadTranslation(app_.languageId, translationId, function(translationValue) {
				app_.translationCache[translationId] = translationValue;
				jqComponent.text(translationValue);
				app_.log("app: translation loaded from database - " + translationValue);
			});
		}
	};
	app_.getTranslateText = function(translationId) {
		//app_.log("app: translating text with " + translationId);
		var cachedTranslationValue = app_.translationCache[translationId];
		if (cachedTranslationValue) {
			//app_.log("app: translation found in cache - " + cachedTranslationValue);
			return cachedTranslationValue;
		} else {
			app_.log(app_.repository);
			app_.repository.loadTranslation(app_.languageId, translationId, function(translationValue) {
				app_.translationCache[translationId] = translationValue;
				app_.log("app: translation loaded from database - " + translationValue);
				return cachedTranslationValue;
			});
		}
	};
	app_.translateAttribute = function(attributeName, translationId, jqComponent) {
		//app_.log("app: translating attribute " + attributeName + " with " + translationId);
		var cachedTranslationValue = app_.translationCache[translationId];
		if (cachedTranslationValue) {
			//app_.log("app: translation found in cache - " + cachedTranslationValue);
			jqComponent.attr(attributeName, cachedTranslationValue);
		} else {
			app_.repository.loadTranslation(app_.languageId, translationId, function(translationValue) {
				app_.translationCache[translationId] = translationValue;
				jqComponent.attr(attributeName, translationValue);
				app_.log("app: translation loaded from database - " + translationValue);
			});
		}
	};

	function loadSettings(doneCallback) {
		app_.log("app: loading app settings");
                doneCallback();
                return;
		app_.repository.loadSettings(function(appSettings) {
			app_.settings = appSettings;
			app_.log("app: settings " + JSON.stringify(app_.settings));
			if (app_.settings.userId != 0) {
				loadRememberedUser(app_.settings.userId, doneCallback);
			} else {
				doneCallback();
			}
		});
	}

	function loadRememberedUser(userId, doneCallback) {
		app_.log("app: loading remembered user");
		app_.repository.loadUser(userId, function(user) {
			app_.loggedUser = user;
			app_.log("app: loaded remembered user " + JSON.stringify(app_.loggedUser));
			doneCallback();
		});
	}


	return app_;
}());