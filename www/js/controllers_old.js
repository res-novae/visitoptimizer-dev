'use strict';

app.controller = (function() {

	var ctrl = {};

	ctrl.headerHtml = null;
	ctrl.footerHtml = null;

	ctrl.toggleConnectivityStatus = function() {
		var connectivityButton = $("#vrn-connectivity");
		if (hasDeviceNetwork()) {
			app.log("app.controller: network available");
			connectivityButton.buttonMarkup({
				iconpos : "right"
			});
			connectivityButton.text("ON");
		} else {
			app.log("app.controller: no network available");
			connectivityButton.buttonMarkup({
				iconpos : "left"
			});
			connectivityButton.text("OFF");
		}
	};

	function getHeaderHtml() {
		if (ctrl.headerHtml) {
			return ctrl.headerHtml;
		}
		ctrl.headerHtml = ''
				+ '<span class="ui-title"></span>'
				+ '<div class="ui-btn-right vrn-header-controls">'
				+ '  <span id="vrn-company">Company</span>'
				+ '  <a href="#" id="vrn-connectivity" data-role="button" data-inline="true" data-mini="true" data-shadow="false" data-iconshadow="false" data-icon="circle" data-iconpos="left">OFF</a>'
				+ '  <a href="#settings-popup" id="vrn-settings" data-role="button" data-inline="true" data-mini="true" data-shadow="false" data-iconshadow="false" data-icon="gear" data-iconpos="notext">Settings</a>'
				+ '  <a href="#help-popup" id="vrn-help" data-role="button" data-inline="true" data-mini="true" data-shadow="false" data-iconshadow="false" data-icon="help" data-iconpos="notext">Help</a>'
				+ '</div>';
		return ctrl.headerHtml;
	}

	function addActiveClass(knownPageId, activePageId) {
		if (knownPageId == activePageId) {
			return ' class="ui-btn-active ui-state-persist" data-prefetch="true" '; // 
		}
		return ' data-prefetch="true" ';
	}

	function getFooterHtml(pageId) {
		return ctrl.footerHtml = '' + '<div data-role="navbar">' + '<ul>' + '  <li><a href="index.html" data-icon="task" '
				+ addActiveClass("vrn-index-page", pageId) + '>Taskboard</a></li>' + '  <li><a href="inform.html" data-icon="inform" '
				+ addActiveClass("vrn-inform-page", pageId) + '>Info</a></li>' + '  <li><a href="roadmap.html" data-icon="road" '
				+ addActiveClass("vrn-roadmap-page", pageId) + '>Roadmap</a></li>' + '  <li><a href="pos.html" data-icon="pos" '
				+ addActiveClass("vrn-pos-page", pageId) + '>POS</a></li>' + '  <li><a href="stats.html" data-icon="stats" '
				+ addActiveClass("vrn-stats-page", pageId) + '>Stats</a></li>' + '</ul>' + '</div>';
	}

	ctrl.addHeader = function() {
		app.log("app.controller: add header");
		$('[data-role="header"]').html(getHeaderHtml()).trigger('create');
		// $(this).find('[data-role=header]').each(function() {
		// $(this).html(getHeaderHtml());// .trigger('create');
		// });
	};

	ctrl.addFooter = function(pageId) {
		app.log("app.controller: add footer");
		if (/* pageId == "vrn-index-page" */true) {
			// $('[data-role="footer"]').html(getFooterHtml(pageId)).trigger('create');
		}
	};

	ctrl.ajaxAsyncTask = new app.utils.AjaxAsyncTask(false);

	ctrl.init = function() {
		app.log("app.controller: init");
		// page events
		var doc = $(document);
		doc.on("pagebeforecreate", "[data-role=page]", function(event, ui) {
			app.log("app.controller: pagebeforecreate " + JSON.stringify(event.target.id));
			// app.controller.addHeader();
			// app.controller.addFooter(event.target.id);
		});
		doc.on("pagebeforechange", "[data-role=page]", function(event) {
			app.log("app.controller: pagebeforechange " + JSON.stringify(event.target.id));
		});
		doc.on("pageinit", "[data-role=page]", function(event) {
			app.log("app.controller: pageinit " + JSON.stringify(event.target.id));
		});
		doc.on("pagebeforehide", "[data-role=page]", function(event) {
			app.log("app.controller: pagebeforehide " + JSON.stringify(event.target.id));
		});
		doc.on("pagebeforeload", "[data-role=page]", function(event) {
			app.log("app.controller: pagebeforeload " + JSON.stringify(event.target.id));
		});
		doc.on("pagebeforeshow", "[data-role=page]", function(event) {
			app.log("app.controller: pagebeforeshow " + JSON.stringify(event.target.id));
		});
		doc.on("pagechange", "[data-role=page]", function(event) {
			app.log("app.controller: pagechange " + JSON.stringify(event.target.id));
		});
		doc.on("pagechangefailed", "[data-role=page]", function(event) {
			app.log("app.controller: pagechangefailed " + JSON.stringify(event.target.id));
		});
		doc.on("pagecreate", "[data-role=page]", function(event) {
			app.log("app.controller: pagecreate " + JSON.stringify(event.target.id));
		});
		doc.on("pagehide", "[data-role=page]", function(event) {
			// $.mobile.hidePageLoadingMsg();
			app.log("app.controller: pagehide " + JSON.stringify(event.target.id));
		});
		doc.on("pageload", "[data-role=page]", function(event) {
			app.log("app.controller: pageload " + JSON.stringify(event.target.id));
		});
		doc.on("pageloadfailed", "[data-role=page]", function(event) {
			app.log("app.controller: pageloadfailed " + JSON.stringify(event.target.id));
		});
		doc.on("pageremove", "[data-role=page]", function(event) {
			app.log("app.controller: pageremove " + JSON.stringify(event.target.id));
		});
		doc.on("pageshow", "[data-role=page]", function(event) {
			app.log("app.controller: pageshow " + JSON.stringify(event.target.id));
		});

		// window events
		var win = $(window);
		win.on("orientationchange", function(event) {
			app.log("app.controller: orientationchange");
		});
		win.on("navigate", function(event, data) {
			app.log("app.controller: navigate event");
		});

	};

	return ctrl;
}());

app.controller.index = (function() {
	var ctrl = {};

	ctrl.init = function() {
		app.log("app.controller.index: init");
		// page events
		var doc = $(document);
		doc.on("pageinit", "[id=vrn-index-page]", app.controller.index.pageInit);
	}

	ctrl.pageInit = function() {
		// try {
		app.log("app.controller.index: pageinit");
		// Component listeners
		var doc = $(document);
		doc.on("vclick", "[id=vrn-login]", app.controller.index.authenticateB);
		doc.on("vclick", "[id=vrn-login-popup-cancel]", function() {
			if (app.controller.ajaxAsyncTask.active) {
				app.log("app.controller.index: cancel current async task");
				app.controller.ajaxAsyncTask.cancel();
			}
			$("#vrn-login-popup").popup('close', {
				dataRel : "back"
			});
		});
		app.init(function() {
		  return;
			if (app.authenticatedInThisSession) {
				return;
			}
            $.mobile.hidePageLoadingMsg();
            
            
          //  return;
			
			
				
			// app.controller.toggleConnectivityStatus();
			if (app.settings != null) {
				app.languageId = app.settings.defaultLanguageId;
			}else app.languageId = 2; 
			
			if (app.loggedUser != null) {
				app.languageId = app.loggedUser.preferredLanguageId;
			}
			$.mobile.showPageLoadingMsg();
                     
			var TID = app.domain.TRANSLATION_ID;
			app.loadTranslations([ TID.COMPANY, TID.RECOVER_PASSWORD, TID.REMEMBER_ME, TID.TASKBOARD, TID.WATCHWORD, TID.ROADMAP, TID.POS,
					TID.STATS, TID.SETTINGS, TID.LOGIN, TID.USERNAME, TID.PASSWORD ], function() {                                
				app.log("app.controller.index: pageinit - update components");
				/*app.translateText(TID.COMPANY, $("#vrn-company"));
				//app.translateText(TID.RECOVER_PASSWORD, $("#vrn-forgot-password .ui-btn-text"));
				app.translateText(TID.REMEMBER_ME, $("#vrn-remember-me-label .ui-btn-text"));
				app.translateText(TID.TASKBOARD, $("#vrn-taskboard .ui-btn-text"));
				app.translateText(TID.WATCHWORD, $("#vrn-watchword .ui-btn-text"));
				app.translateText(TID.ROADMAP, $("#vrn-roadmap .ui-btn-text"));
				app.translateText(TID.POS, $("#vrn-pos .ui-btn-text"));
				app.translateText(TID.STATS, $("#vrn-stats .ui-btn-text"));
				app.translateAttribute("title", TID.SETTINGS, $("#vrn-settings"));
				app.translateText(TID.LOGIN, $("#vrn-login .ui-btn-text"));
				app.translateAttribute("placeholder", TID.USERNAME, $("#vrn-username"));
				app.translateAttribute("placeholder", TID.PASSWORD, $("#vrn-password"));*/
				if (app.loggedUser != null) {
					app.log("app.controller.index: pageinit - updating remembered user");
					$("#vrn-remember-me").attr("checked", true).checkboxradio("refresh");
					$("#vrn-username").val(app.loggedUser.username);
					$("#vrn-password").val(app.loggedUser.password);
				}
				$.mobile.hidePageLoadingMsg();
			});
			
			
		});

		// } catch (err) {
		// $.mobile.hidePageLoadingMsg();
		// app.log(JSON.stringify(err));
		// }
	}

	ctrl.authenticateB = function() {
		
			// test si connection si connexion existe verif login.pass sur le server
			
			//	// si login ok, recup data user (json)
			//	// si non, retour au form login
			
			//	// test si DB existe en local
			//	//	// si non, la créer
			
			//	// verif si la dernier sync est plus récente que la maj server
			//	//	// si non, faire la maj
			
			// Si pas de connexion apres le post de login
			//	// test si DB existe en local
			//	//	// sinon alert : permiere connexion nécesite connexion internet
			
			//  // test si user est dans la db locale
			//  // // sinon retour login
			
		
		if (app.authenticatedInThisSession) {
			return;
		}
		
		if($("#vrn-username").val() != '' && $("#vrn-username").val() != 'LOGIN' && $("#vrn-password").val() != '' && $("#vrn-password").val() != 'MOT DE PASSE'){
		
			var loginLoadingPopup = $("#vrn-login-popup");
			loginLoadingPopup.popup("open", {
				dataPositionTo : "window",
				dataTransition : "pop",
				dataTheme : "b"
			});
			if (app.controller.ajaxAsyncTask.active) {
				app.log("app.controller.index: authenticate, canceling current async task");
				app.controller.ajaxAsyncTask.cancel();
			}
			
			// test si connection si connexion existe verif login.pass sur le server
			var networkState = navigator.network.connection.type;
		
			var states = {};
			states[Connection.UNKNOWN]  = 'Unknown connection';	
			states[Connection.ETHERNET] = 'Ethernet connection';
			states[Connection.WIFI]     = 'WiFi connection';
		 	states[Connection.CELL_2G]  = 'Cell 2G connection';
 			states[Connection.CELL_3G]  = 'Cell 3G connection';
			states[Connection.CELL_4G]  = 'Cell 4G connection';
			states[Connection.NONE]     = 'No network connection';
				
			app.log('Connection type: ' + states[networkState]);
			
			// si connexion internet
			if (networkState != Connection.NONE) {
				app.log("app.controller.authenticateB : network available");
				alert("app.controller.authenticateB : network available");
			
				//ctrl.toggleConnectivityStatus
				
				// connexion au serveur pour authentification
				app.log("app.controller.index: authenticating (and creating a new async task) ...");
				app.controller.ajaxAsyncTask = new app.utils.AjaxAsyncTask(true);
				app.service.authenticateUser(app.controller.ajaxAsyncTask, $("#vrn-username").val(), $("#vrn-password").val(), function(user) {
					app.loggedUser = user;
					app.authenticatedInThisSession = true;
					//$("#vrn-index-page").page();
					
					
					//	// si login ok, recup data user (json)
					
			//	// test si DB existe en local
			//	//	// si non, la créer
					
					
	
					app.repository.saveOrUpdateUser(user, function(user) {
						// update ui
						loginLoadingPopup.popup("close");
						app.log("app.controller.index: authenticated successfully");
				/*		if ($("#vrn-remember-me").is(":checked")) {
							app.repository.updateSettings(user.id);
						} else {
							app.repository.updateSettings(0);
						}
						$("#vrn-login-div").hide();
						$("#vrn-taskboard-div").show();
				*/	}, function(error) {
						// show saving error or warning
						app.log("app.controller.index: authenticated, but saving errors");
						loginLoadingPopup.popup("close");
						$("#vrn-login-error-popup").popup("open", {
							dataPositionTo : "window",
							dataTransition : "pop",
							dataTheme : "b"
						});
					});
					
				}, function(errorTranslationId) {
					// show network error
					app.log("app.controller.index: authentication failed because of network errors");
					loginLoadingPopup.popup("close");
					$("#vrn-login-error-popup").popup("open");
				});	
			
			} 
			// si pas de connexion internet
			else {
				app.log("app.controller.authenticateB : no network available");
				alert("app.controller.authenticateB : no network available");
			
			}
			
			
			
			
			//	// si non, retour au form login
			
			
			//	// verif si la dernier sync est plus récente que la maj server
			//	//	// si non, faire la maj
			
			// Si pas de connexion apres le post de login
			//	// test si DB existe en local
			//	//	// sinon alert : permiere connexion nécesite connexion internet
			
			//  // test si user est dans la db locale
			//  // // sinon retour login
			
			
		
		}
	}

	ctrl.authenticate = function() {
		if (app.authenticatedInThisSession) {
			return;
		}
		var loginLoadingPopup = $("#vrn-login-popup");
		loginLoadingPopup.popup("open", {
			dataPositionTo : "window",
			dataTransition : "pop",
			dataTheme : "b"
		});
		if (app.controller.ajaxAsyncTask.active) {
			app.log("app.controller.index: authenticate, canceling current async task");
			app.controller.ajaxAsyncTask.cancel();
		}
		app.log("app.controller.index: authenticating (and creating a new async task) ...");
		app.controller.ajaxAsyncTask = new app.utils.AjaxAsyncTask(true);
		app.service.authenticateUser(app.controller.ajaxAsyncTask, $("#vrn-username").val(), $("#vrn-password").val(), function(user) {
			app.loggedUser = user;
			app.authenticatedInThisSession = true;
			$("#vrn-index-page").page();
			app.repository.saveOrUpdateUser(user, function(user) {
				// update ui
				loginLoadingPopup.popup("close");
				app.log("app.controller.index: authenticated successfully");
				if ($("#vrn-remember-me").is(":checked")) {
					app.repository.updateSettings(user.id);
				} else {
					app.repository.updateSettings(0);
				}
				$("#vrn-login-div").hide();
				$("#vrn-taskboard-div").show();
			}, function(error) {
				// show saving error or warning
				app.log("app.controller.index: authenticated, but saving errors");
				loginLoadingPopup.popup("close");
				$("#vrn-login-error-popup").popup("open", {
					dataPositionTo : "window",
					dataTransition : "pop",
					dataTheme : "b"
				});
			});
		}, function(errorTranslationId) {
			// show network error
			app.log("app.controller.index: authentication failed because of network errors");
			loginLoadingPopup.popup("close");
			$("#vrn-login-error-popup").popup("open");
		});
	}

	return ctrl;
}());

app.controller.roadmap = (function() {
    var ctrl = {};

    function buildRoadmapItemHtml(roadmapSummary) {
        var itemHtml = '' + '<li>' + ' <a href="#">' + '  <span class="vrn-item-title">'
        + app.utils.formatDate(roadmapSummary.scheduledDate, "/") + '</span>' + '  <div> '
        + ' <img alt="" src="css/images/vrn/icon_address.png" class="vrn-icon-address"> <span class="vrn-text-centered">'
        + roadmapSummary.location + '</span>' + '  </div>' + '  <div>'
        + '   <img alt="" src="css/images/vrn/icon_pencil.png" class="vrn-icon-edit"> <span class="vrn-text-centered">'
        + roadmapSummary.manager + '</span>' + '  </div>' + '  <div class="ui-li-aside">'
        + '   <div class="vrn-roadmap-disclosure">' + '    <div class="vrn-roadmap-left-div">'
        + '     <span class="vrn-item-text" id="vrn-item-text">VISITES</span>'  
        + '     <span class="vrn-rm-sched-visits" id="vrn-rm-sched-visits">'
        + (roadmapSummary.scheduledVisits - roadmapSummary.performedVisits)+ '</span>' +  '<span id="vrn-slash">'+'/'+ '</span>' 
        + '<span class="vrn-rm-sched-visits-part2" id="vrn-rm-sched-visits-part2">'+ roadmapSummary.scheduledVisits+ '</span>'
        + '    </div>' + '    <div class="vrn-roadmap-right-div">' + '     <span class="vrn-item-text" id="vrn-item-status">' + roadmapSummary.status
        + '</span>' + '    </div>' + '   </div>' + '  </div>' + ' </a>' + '</li>';
        // app.log("***: " + itemHtml);
        return itemHtml;
    }

	function buildAreaItemHtml(areaSummary) {
		return '<option value="' + areaSummary.name + '">' + areaSummary.name + '</option>';
	}

	ctrl.init = function() {
		app.log("app.controller.roadmap: init");
		// page events
		var doc = $(document);
		doc.on("pageinit", "[id=vrn-roadmap-page]", ctrl.pageInit);
		doc.on("pageshow", "[id=vrn-roadmap-page]", ctrl.pageShow);
	}

	ctrl.pageInit = function() {
		app.log("app.controller.roadmap: pageinit");
		var doc = $(document);
		doc.on("vclick", "[id=vrn-filter-roadmap-button]", ctrl.filterRoadmaps);
		doc.on("vclick", "[id=vrn-filter-roadmap-clear-button]", ctrl.clearFilter);
		doc.on("vclick", "[id=vrn-filter-roadmap-cancel-button]", ctrl.cancelFilter);
		doc.on("vclick", "[id=vrn-filter-roadmap-apply-button]", ctrl.applyFilter);

	}

	ctrl.pageShow = function() {
		app.log("app.controller.roadmap: pageshow");
		$.mobile.showPageLoadingMsg();
		var jqmPage = $(this);
		var jqmRoadmapList = jqmPage.find("[id=vrn-roadmap-list]");
		app.repository.loadRoadmapByUserId(/* app.loggedUser.id */5, function(roadmapList) {
			ctrl.roadmapList = roadmapList;
			var i;
			for (i = 0; i < roadmapList.length; i++) {
				jqmRoadmapList.append(buildRoadmapItemHtml(roadmapList[i]));
			}
			jqmRoadmapList.trigger("create");
		});
		jqmRoadmapList.listview("refresh");

		var jqmFilterStartDate = jqmPage.find("[id=vrn-filter-roadmap-start-date]");
		jqmFilterStartDate.val(app.utils.formatIsoDate(new Date()), "-");
		var jqmFilterEndDate = jqmPage.find("[id=vrn-filter-roadmap-end-date]");
		jqmFilterEndDate.val(app.utils.formatIsoDate(new Date()), "-");

		var jqmAreaSelect = jqmPage.find("[id=vrn-filter-roadmap-area]");

		app.repository.loadAreaByUserId(/* app.loggedUser.id */5, function(areaSummaryList) {
			ctrl.areaSummaryList = areaSummaryList;
			var i;
			for (i = 0; i < areaSummaryList.length; i++) {
				jqmAreaSelect.append(buildAreaItemHtml(areaSummaryList[i]));
			}
			$.mobile.hidePageLoadingMsg();
		});

	}

	ctrl.filterRoadmaps = function() {
		app.log("app.controller.roadmap: filterRoadmaps");
		$("#vrn-roadmap-filter-collapsible").trigger('collapse');
	}

	ctrl.clearFilter = function() {
		app.log("app.controller.roadmap: clearFilter");
		$("#roadmap-help-popup").popup("open", {
			dataPositionTo : "window",
			dataTransition : "pop",
			dataTheme : "b"
		});
	}

	ctrl.cancelFilter = function() {
		app.log("app.controller.roadmap: cancelFilter");
		$("#vrn-roadmap-filter-collapsible").trigger('collapse');
	}

	ctrl.applyFilter = function() {
		app.log("app.controller.roadmap: applyFilter");
		$("#vrn-roadmap-filter-collapsible").trigger('collapse');
		$("#roadmap-help-popup").popup("open", {
			dataPositionTo : "window",
			dataTransition : "pop",
			dataTheme : "b"
		});
	}

	return ctrl;
}());
