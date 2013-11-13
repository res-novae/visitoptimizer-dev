var app = (function () {
    'use strict';
    var app = {};

    app.languageId = 1;
    app.loggedUser = null;
    app.settings = null;
    app.session = null;
    app.repository = null;
    app.webservice = null;
    app.networkState = null;
    app.controller = null;
    app.i18n = null;
    app.authenticatedInThisSession = null;
    app.translationCache = {};
    app.loggingEnabled = true;
    app.chromeSingleton = 0;

    app.log = function (message, style_mesage, more_log) {
        if (app.loggingEnabled) {
            if (style_mesage == null) { console.log(message); } 
            else if (style_mesage == 'err') { console.log('%c ::  Error  :: ', "background: #cdcdcd; color: #ff0000",message); } 
            else if (style_mesage === 'err_sql') { console.log('%c :: SQL err :: ', "background: #cdcdcd; color: #ff0000",message); } 
            else if (style_mesage == 'success') { console.log('%c :: Success :: ', "background: #000000; color: #00ff06",message); } 
            else if (style_mesage == 'pause') { console.log('%c ::  Pause  :: ', "background: #000000; color: #ffa800",message); } 
            else if (style_mesage == 'wip') { console.log('%c ::   WIP   :: ', "background: #000000; color: #e4ff00",message); } 
            else { console.log(message,style_mesage,more_log); }
        }
    };

    app.initialize = function () {
       // alert('initialize');
        // fake to local dev
       // if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
            document.addEventListener("deviceready", app.bindEvents, false);
       // } else {
       //     window.addEventListener('load', app.init, false);
       // }
    };
    
    app.bindEvents = function () {
        document.addEventListener('deviceready', app.onDeviceReady, false);
    };
    
    app.onDeviceReady = function () {
        app.receivedEvent('deviceready');
    };
    
    app.receivedEvent = function (id) {
        //alert('id:'+id)
            app.log("# APP is ready =:)");
            app.controller = app.controller.init();
    };

    app.init = function () {
        app.log("# APP Init");
        app.loggedUser = null;
        app.controller.init();
        /*
        // init session
        app.testConnexion(
            function (doneCallback) {
                app.initRepository(
                    function (doneCallback) {
                        app.initWebservice(app.controller.init());
                    }
                );
            }
        );
        */
    };
    
    app.testConnexion = function (doneCallback) {
        var networkState = app.testNetwork();
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

    app.initRepository = function (doneCallback) {
        app.repository.init(
            function () {
                $("#vrn-index-loading-progress-dots").html($("#vrn-index-loading-progress-dots").html() + '<img src="img/dotv.png" class="vrn-index-loading-dot">');
                setTimeout(doneCallback, 500);
            },
            function () {
                $("#vrn-index-loading-progress-dots").html($("#vrn-index-loading-progress-dots").html() + '<img src="img/dotr.png" class="vrn-index-loading-dot">');
                setTimeout(doneCallback, 500);
            }
        );

    };

    app.initWebservice= function (doneCallback) {
        app.webservice.init(
            function () {
                $("#vrn-index-loading-progress-dots").html($("#vrn-index-loading-progress-dots").html() + '<img src="img/dotv.png" class="vrn-index-loading-dot">');
                setTimeout(doneCallback, 500);
            },
            function () {
                $("#vrn-index-loading-progress-dots").html($("#vrn-index-loading-progress-dots").html() + '<img src="img/dotr.png" class="vrn-index-loading-dot">');
                setTimeout(doneCallback, 500);
            }
        );

    };

    app.testNetwork = function () {
        app.log("test connexion");
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

        app.log(':: Test network: ' + states[networkState]);

        return networkState;
    };

    app.loadTranslations = function (translationIds, doneCallback) {
        app.log("app: loading translations " + translationIds);
        app.repository.loadTranslations(app.languageId, translationIds, function (translationValues) {
            var i;
            for (i = 0; i < translationIds.length; i++) {
                app.translationCache[translationIds[i]] = translationValues[i];
            }
            app.log("app: translations added to cache " + translationValues);
            doneCallback();
        });
    };

    app.translateText = function (translationId, jqComponent) {
        //app.log("app: translating text with " + translationId);
        var cachedTranslationValue = app.translationCache[translationId];
        if (cachedTranslationValue) {
            //app.log("app: translation found in cache - " + cachedTranslationValue);
            jqComponent.text(cachedTranslationValue);
        } else {
            app.log(app.repository);
            app.repository.loadTranslation(app.languageId, translationId, function (translationValue) {
                app.translationCache[translationId] = translationValue;
                jqComponent.text(translationValue);
                app.log("app: translation loaded from database - " + translationValue);
            });
        }
    };

    app.getTranslateText = function (translationId) {
        //app.log("app: translating text with " + translationId);
        var cachedTranslationValue = app.translationCache[translationId];
        if (cachedTranslationValue) {
            //app.log("app: translation found in cache - " + cachedTranslationValue);
            return cachedTranslationValue;
        } else {
            app.log(app.repository);
            app.repository.loadTranslation(app.languageId, translationId, function (translationValue) {
                app.translationCache[translationId] = translationValue;
                app.log("app: translation loaded from database - " + translationValue);
                return cachedTranslationValue;
            });
        }
    };

    app.translateAttribute = function (attributeName, translationId, jqComponent) {
        //app.log("app: translating attribute " + attributeName + " with " + translationId);
        var cachedTranslationValue = app.translationCache[translationId];
        if (cachedTranslationValue) {
            //app.log("app: translation found in cache - " + cachedTranslationValue);
            jqComponent.attr(attributeName, cachedTranslationValue);
        } else {
            app.repository.loadTranslation(app.languageId, translationId, function (translationValue) {
                app.translationCache[translationId] = translationValue;
                jqComponent.attr(attributeName, translationValue);
                app.log("app: translation loaded from database - " + translationValue);
            });
        }
    };

    function loadSettings(doneCallback) {
        app.log("app: loading app settings");
                doneCallback();
                return;
        app.repository.loadSettings(function (appSettings) {
            app.settings = appSettings;
            app.log("app: settings " + JSON.stringify(app.settings));
            if (app.settings.userId != 0) {
                loadRememberedUser(app.settings.userId, doneCallback);
            } else {
                doneCallback();
            }
        });
    };

    function loadRememberedUser(userId, doneCallback) {
        app.log("app: loading remembered user");
        app.repository.loadUser(userId, function (user) {
            app.loggedUser = user;
            app.log("app: loaded remembered user " + JSON.stringify(app.loggedUser));
            doneCallback();
        });
    };

    return app;
}());
