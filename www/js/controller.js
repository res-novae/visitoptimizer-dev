//var app = {};
app.controller = (function () {
    'use strict';
    var controller = {},
        trad,
        TID,
        loginLoadingPopup,
        errorLoadingPopup,
        settings,
        last_sync,
        messages,
        pos,
        daily_roadmap,
        current_params_url = [],
        preload,
        network_state,
        sync_mode,
        sync_state;
    //controller.ajaxAsyncTask = new app.utils.AjaxAsyncTask(false);
    //controller.webservice = new app.webservice.init();
    //$( document ).unbind( "pagechange");

    // memento :
    // 1. Utilser bind au lieu de live
    // 2. Utilser tab ou lieu de click
    // 3. Les transitions jQuery Mobile ne sont pas compatibles avec tous les navigateurs
    // 4. ID des éléments du dom doivent être uniques même entre des pages différentes
    // 5. Input text de type=”number” ne sont pas compatibles avec tous les navigateurs, à éviter

    controller.init = function () {
        app.log("## app.controller : init", 'wip');

        // no rotation
        window.addEventListener('orientationchange', function(e){
            var isUpright = (window.orientation == 'portrait');
        });
        
        //location.reload(false);

        $.support.cors = true; // crossdomain
        $.mobile.allowCrossDomainPages = true; // crossdomain

        $.mobile.pushStateEnabled = false; // modification du comportement de navigation
        $.mobile.page.prototype.options.domCache = true; //  mise en cache des pages (vs page dynamiques) 

        $.mobile.ignoreContentEnabled = true;
        $.mobile.touchOverflowEnabled = true;

        //preload 
        if($.mobile.activePage.attr('id') == 'vrn-index-loading'){
            app.log('preload en cours...');

		// show header
        controller.showVrnHeader();

        $.mobile.loadPage("vrn-login-page.html",true);
        //$.mobile.loadPage("vrn-sync-page.html",true);
        $.mobile.loadPage("vrn-home-page.html",true);

            // test si la db existe
            app.log("::Init:: : DB test");
            var r1 = app.repository.checkIfDatabaseExist();
            
            r1.done(function() {});
            $.when(r1).done(function(dbExist) {
            	if(dbExist == 'yes') {
            		app.log("::Init:: : Step 1 : DB test");
            		app.log("- DB : " + app.repository.databaseName + " exist");
            
            		// recup le setting (remerber me) si exist
                    var r2 = app.repository.getSettings();
                    r2.done(function() {});
                    $.when(r2).done(function(set) {
                    	settings = set;
                        app.log("::Init:: Step 2 : Load user setting...");
                        if(settings.userId == 0) {
                            app.log("::Init:: Step 3 : No setting exist");
                            app.authenticatedInThisSession = false;
                            $.mobile.changePage('#vrn-login-page', {transition:"slidedown",changeHash:false,reverse:false,reload:true});
                            return;
                        }
                        else {
                            app.log("::Init:: Step 3 : Setting exist (remember me)");
                            // recup les infos user
                            app.authenticatedInThisSession = true;
                            app.repository.loadUser(settings.userId, function(user) {
                                app.loggedUser = user;

                                app.log("::Init:: Step 4 : Setting exist : loading success (id:"+localStorage.getItem( "current_user_id" )+")");
								app.repository.checkUserSyncData(user.id, 
                                   function() {
                                        app.log("::Init:: Step 5a : go to #vrn-home-page");

                                        app.repository.getLastSyncInfos(localStorage.getItem( "current_user_id" ), function(id, sync_id, userId, date) {
                                            app.log("getLastSyncInfos is ok : "+ date, 'success');
                                            controller.last_sync = new app.domain.sync_infos(id,sync_id,userId, date);

                                            // show TASKBOARD
                                            $.mobile.changePage("#vrn-home-page", {
                                               transition:"slide",
                                               changeHash:false,
                                               reverse:false,
                                               reload:true
                                            });

                                        });
                                   },
                                   function() {
                                       app.log("::Init:: Step 5b : sync Update Data");
                                       // Sync Update Data
                                        controller.syncUpdateData(function() {
                                        	
                                        	app.log("::Init:: Step 5b2 : go to #vrn-home-page");
                                            // recup last sync data
                                            app.repository.getLastSyncInfos(localStorage.getItem( "current_user_id" ), function(id, sync_id, userId, date) {
                                                app.log("getLastSyncInfos is ok : "+ date, 'success');
                                                controller.last_sync = new app.domain.sync_infos(id,sync_id,userId, date);
                                                // show TASKBOARD

                                                $.mobile.changePage("#vrn-home-page", {
                                                   transition:"slide",
                                                   changeHash:false,
                                                   reverse:false,
                                                   reload:true
                                                });
                                                //controller.showVrnHomePage(); 
                                            }); 

                                        });
                                   }
                               );

                            });
                        }

                    });

            		
            	}else{
            		// No db, create DB + insert first data to init app
                    app.log("app.repository: DB : " + app.repository.databaseName + " does not exist");

                    var r2 = app.repository.createDbApp();
                    r2.done(function(data) {});
                    $.when(r2).done(function(data) {

                        app.log("::Init:: Step 2 : Init light DB (with login translation only)");
                        app.authenticatedInThisSession = false;

                        $.mobile.changePage('#vrn-login-page', {transition:"pop",changeHash:false,reverse:false,reload:true});
                        
                        return;
                    });
            	}	
            });	
            	

        }   

    };

    //pagebeforechange 
    
    // Before Show
    $( document ).unbind( "pagebeforeshow");
    $(document).bind("pagebeforeshow", function(e, data) {
        app.log(':: event : B : pagebeforeshow : '+$.mobile.activePage.attr('id'), 'wip');
        e.preventDefault();
        var r1 = app.repository.checkDatabaseExist();
        r1.done(function() {});
        $.when(r1).done(function(dbExist) {
            //Preload page
            
            if ($("#vrn-login-page").length) {} else $.mobile.loadPage("vrn-login-page.html",true);
            if ($("#vrn-home-page").length) {} else $.mobile.loadPage("vrn-home-page.html",true);
            if ($("#vrn-inform-page").length) {} else $.mobile.loadPage("vrn-inform-page.html",true);
            if ($("#vrn-roadmap-page").length) {} else $.mobile.loadPage("vrn-roadmap-page.html",true);
            if ($("#vrn-pos-page").length) {} else $.mobile.loadPage("vrn-pos-page.html",true);
            if ($("#vrn-stats-semaine-page").length) {} else $.mobile.loadPage("vrn-stats-semaine-page.html",true);
            if ($("#vrn-params-page").length) {} else $.mobile.loadPage("vrn-params-page.html",true);
              
            // taille de la vue
            $(".vrn-view").css( "height" , (parseInt($(window).height(),10) - 36 - 68 ) + 'px' );
            $(".vrn-view").css( "width", $(window).width() + 'px' );
            $(window).resize(function() {
                $(".vrn-view").css( "height" , (parseInt($(window).height(),10) - 36 - 68 ) + 'px' );
                $(".vrn-view").css( "width", $(window).width() + 'px' );
            });
            
            if(dbExist == 'yes' || $.mobile.activePage.attr('id') == 'vrn-login-page') {
                // Login Panel //
                if($.mobile.activePage.attr('id') == 'vrn-login-page'){
                    //$('#vrn-login').show();
                    controller.showVrnLoginPage();
                    if ($("#vrn-home-page").length) {} else $.mobile.loadPage("vrn-home-page.html",true);
                }
                // Home / Taskboard //
                if($.mobile.activePage.attr('id') == 'vrn-home-page'){
                    //$('#vrn-login').hide();
                    controller.showVrnHomePage(e,data);
                    // preload next pages
                    
                    if ($("#vrn-roadmap-add-page").length) {} else $.mobile.loadPage("vrn-roadmap-add-page.html",true);
                    if ($("#vrn-roadmap-item-page").length) {} else $.mobile.loadPage("vrn-roadmap-item-page.html",true);
                    if ($("#vrn-roadmap-visit-page").length) {} else $.mobile.loadPage("vrn-roadmap-visit-page.html",true);
                    //$.mobile.loadPage("vrn-sync-ar-page.html",true);
                }
                // Infos / Watchwords //
                if($.mobile.activePage.attr('id') == 'vrn-inform-page'){
                    controller.showVrnInformPage(e,data);
                }
                
                // Road map //
                if($.mobile.activePage.attr('id') == 'vrn-roadmap-page'){
                    controller.showVrnRoadmapPage();
                    if ($("#vrn-roadmap-item-page").length) {} else $.mobile.loadPage("vrn-roadmap-item-page.html",true);
                }
                if($.mobile.activePage.attr('id') == 'vrn-roadmap-add-page'){
                    controller.showVrnRoadmapAddPage();
                    if ($("#vrn-roadmap-item-page").length) {} else $.mobile.loadPage("vrn-roadmap-item-page.html",true);
                }
                if($.mobile.activePage.attr('id') == 'vrn-roadmap-item-page'){
                    controller.showVrnRoadmapItemPage(current_params_url['roadmap_id']);
                    if ($("#vrn-roadmap-item-pos-edit-page").length) {} else $.mobile.loadPage("vrn-roadmap-item-pos-edit-page.html",true);
                    if ($("#vrn-roadmap-add-page").length) {} else $.mobile.loadPage("vrn-roadmap-add-page.html",true);
                }
                if($.mobile.activePage.attr('id') == 'vrn-roadmap-item-pos-edit-page'){
                    controller.showRoadmapItemPosEditPage( current_params_url['roadmap_id'], current_params_url['sales_point_id']);
                    if ($("#vrn-roadmap-page").length) {} else $.mobile.loadPage("vrn-roadmap-page.html",true);
                }
                // roadmap / questionnaire list
                if($.mobile.activePage.attr('id') == 'vrn-roadmap-visit-page'){
                    controller.showVrnRoadmapVisitPage(current_params_url['sp_visit_id'],current_params_url['current_item']);
                    if ($("#vrn-roadmap-visit-questionnaire-page").length) {} else $.mobile.loadPage("vrn-roadmap-visit-questionnaire-page.html",true);
                }
                // roadmap / questionnaire item form
                if($.mobile.activePage.attr('id') == 'vrn-roadmap-visit-questionnaire-page'){
                    controller.showVrnRoadmapVisitQuestionnairePage(current_params_url['sp_visit_id'], current_params_url['questionnaire_id']);
                    if ($("#vrn-roadmap-visit-page").length) {} else $.mobile.loadPage("vrn-roadmap-visit-page.html",true);
                }

                // POS //
                if($.mobile.activePage.attr('id') == 'vrn-pos-page'){
                    controller.showVrnPosPage(e,data);
                    if ($("#vrn-pos-edit-page").length) {} else $.mobile.loadPage("vrn-pos-edit-page.html",true);
                }
                if($.mobile.activePage.attr('id') == 'vrn-pos-edit-page'){
                    //vrn-pos-edit-page&sales_point_id
                    //alert('-id:'+current_params_url['sales_point_id']);
                    if(typeof current_params_url['sales_point_id'] != 'undefined') controller.showVrnPosEditPage( current_params_url['sales_point_id']);
                    else controller.showVrnPosEditPage(0);
                    if ($("#vrn-pos-page").length) {} else $.mobile.loadPage("vrn-pos-page.html",true);
                }
                // Stats //
                if($.mobile.activePage.attr('id') == 'vrn-stats-semaine-page'){
                    controller.showVrnStatsSemainePage();
                    if ($("#vrn-stats-mois-page").length) {} else $.mobile.loadPage("vrn-stats-mois-page.html",true);
                    if ($("#vrn-stats-annee-page").length) {} else $.mobile.loadPage("vrn-stats-annee-page.html",true);
                    
                }
                if($.mobile.activePage.attr('id') == 'vrn-stats-mois-page'){
                    controller.showVrnStatsMoisPage();
                }
                if($.mobile.activePage.attr('id') == 'vrn-stats-annee-page'){
                    controller.showVrnStatsAnneePage();
                }
                // Params //
                if($.mobile.activePage.attr('id') == 'vrn-params-page'){
                    controller.showVrnParamsPage();
                    if ($("#vrn-params-edit-page").length) {} else $.mobile.loadPage("vrn-params-edit-page.html",true);
                }
                if($.mobile.activePage.attr('id') == 'vrn-params-edit-page'){
                    //alert('guop');
                    controller.showVrnParamsEditPage();
                    if ($("#vrn-params-page").length) {} else $.mobile.loadPage("vrn-params-page.html",true);
                    if ($("#vrn-login-page").length) {} else $.mobile.loadPage("vrn-login-page.html",true);
                }

            }else if($.mobile.activePage.attr('id') != 'vrn-index-loading'){
                // retour à init si pas de db
                $.mobile.changePage('#vrn-index-loading', {transition:"pop",changeHash:false,reverse:false,reload:true});
            }
            
        });
        
    });

    $( document ).unbind( "popupbeforeposition");
    $( document ).bind( "popupbeforeposition", function( e, data ){
       // alert(current_params_url['id_parent_pop']);
        // Road map : item detail pop  //
        if(current_params_url['id_parent_pop'] == 'vrn-roadmap-item-pos-detail-pop'){
            controller.showRoadmapItemPosDetailPop(current_params_url['roadmap_id'],current_params_url['sales_point_id']);
        }

        // Road map : item map pop  //
        if(current_params_url['id_parent_pop'] == 'vrn-roadmap-item-pos-map-pop'){
             controller.showRoadmapItemPosMapPop(current_params_url['roadmap_id'],current_params_url['sales_point_id'],current_params_url['gps_latitude'],current_params_url['gps_longitude']);
        }

        // Road map : delete item pop  //
        if(current_params_url['id_parent_pop'] == 'vrn-roadmap-item-pos-delete-pop'){
             controller.showRoadmapItemPosDeletePop(current_params_url['roadmap_id'],current_params_url['sales_point_id']);
        }

        // Road map : add pos item to roadmap pop  //
        if(current_params_url['id_parent_pop'] == 'vrn-roadmap-item-pos-add-pop'){
            controller.addRoadmapItemPosPop(current_params_url['roadmap_id']);
        }

        // Infos / Watchwords : item detail pop //
        if(current_params_url['id_parent_pop'] == 'vrn-inform-detail-pop'){
            controller.showMessagePop(current_params_url['id']);
        }

        // POS : item detail pop //
        if(current_params_url['id_parent_pop'] == 'vrn-pos-detail-pop'){
            controller.showVrnPosDetailPop(current_params_url['id']);
        }

        // POS : item map pop //
        if(current_params_url['id_parent_pop'] == 'vrn-pos-map-pop'){
            //alert('sales_point_id:'+current_params_url['sales_point_id'])
            controller.showVrnPosMapPop(current_params_url['sales_point_id'],current_params_url['gps_latitude'],current_params_url['gps_longitude']);
        }

    });  

    // parse URL to generate params values
    controller.getParamUrl = function(event){
       //alert('okzzz');
        current_params_url = [];
        var querystring = $(this).jqmData('url');
        if(querystring.indexOf('?') != -1){
            var param_url = querystring.substring(querystring.indexOf('?')+1);
            //alert('param_url:'+param_url);
            app.log("params : "+param_url);
            if(param_url.indexOf('&') != -1){
                var pus = param_url.split('&');
                for (var i=0;i<pus.length;i++){ 
                    var pu = pus[i].split('=');
                    current_params_url[pu[0]] = pu[1];
                    localStorage.setItem( pu[0], pu[1] );
                }
                app.log(current_params_url['id']);
            }else{
                var pu = param_url.split('=');
                current_params_url[pu[0]] = pu[1];
                //app.log(current_params_url['id']);
            }
        }
    };

    // ==> Login Panel //
    controller.showVrnLoginPage = function() {
        app.log("controller.showVrnLoginPage", 'wip');

        // init les popups infos
        controller.loginLoadingPopup = $("#vrn-login-popup");
        controller.loginLoadingPopup.popup();
        controller.errorLoadingPopup = $("#vrn-login-error-popup");
        controller.errorLoadingPopup.popup();

        $.mobile.navigate( "vrn-login-page" );
        // taille de la vue
        $(".vrn-view").css( "height" , (parseInt($(window).height(),10) - 36 ) + 'px' );
        $(".vrn-view").css( "width", $(window).width() + 'px' );
        $(window).resize(function() {
                $(".vrn-view").css( "height" , (parseInt($(window).height(),10) - 36) + 'px' );
                $(".vrn-view").css( "width", $(window).width() + 'px' );
        });
        // show header
        controller.showVrnHeader();

		//alert("ok");

		var r1 = app.repository.getTranslation([256,323,324,257,451,771,1155]);
	    r1.done(function(data) {
	        trad = data;
	    });
	    $.when(r1).done(function(data) {
		    // def i18n text value$("#vrn-login-page").fadeIn('slow');
	        $("#vrn-username").attr("placeholder", trad["256"]);
	        $("#vrn-password").attr("placeholder", trad["323"]);
	        $("#vrn-forgot-password").html(trad["324"]+ " >>");
	
	        $("label[for='vrn-remember-me']").text(trad["451"]).trigger("refresh");
	
	        $("#vrn-login .ui-btn-text").text(trad["771"]);
	        $("#vrn-login-error-popup").children("[data-role=header]").html("<h1>"+trad["1155"]+"</h1>");
	        $("#vrn-login-error-popup-content").children(".ui-title").html(trad["257"]);
	        $('#vrn-login').show();
	
	        $('#vrn-login').unbind('tap');
	        $('#vrn-login').bind('tap', controller.authenticate );
	
	        $('#vrn-popup-cancel').unbind('tap');
	        $('#vrn-popup-cancel').bind('tap', function() {
	            /*
	            if (controller.ajaxAsyncTask.active) {
	                app.log("app.controller.index: cancel current async task", 'pause');
	                controller.ajaxAsyncTask.cancel();
	            }*/
	            $("#vrn-login-popup").popup('close', {
	                dataRel : "back"
	            });
	        });
	        $(".vrn-page").trigger('updatelayout');

	    
	    });
    };

/*
    // message de sync WAIT !
    controller.showVrnSyncPage = function() {
        app.log("controller.showVrnSyncPage", 'wip');
        // header
        $("#vrn-sync-header").html(controller.getHeader()).trigger('refresh');
        $("#vrn-sync-page").trigger('change');  
    };

    controller.showVrnSyncArPage = function() {
        app.log("controller.showVrnSyncArPage", 'wip');
        // header
		$.mobile.navigate( "vrn-sync-ar-page" );
        controller.showVrnHeader();
        
        $("#vrn-sync-ar-etat").html("Synchro montante (mobile-server)<br>Prepa des datas<br>");
        var r1 = controller.prepaDataPack();
        r1.done(function(zip_name, zip_content) {
        });
        $.when(r1).done(function(zip_name, zip_content) {
        	//alert(zip_name);
            //alert("size:"+zip_content.byteLength);
            //.byteLength
            $("#vrn-sync-ar-etat").html($("#vrn-sync-ar-etat").html()+"Upload datas<br>");
            
			controller.ajaxAsyncTask = "";
			
    		//ajaxAsyncTask, userId, bytes, md5_hash, size, zip_name, successCallback, errorCallback
    		app.webservice.syncUploadData(
                controller.ajaxAsyncTask, 
                app.loggedUser.id,
                zip_content,
                'uu',
                '12',
                zip_name,
                function(sync_data) { 
                    
                    $("#vrn-sync-ar-etat").html($("#vrn-sync-ar-etat").html()+"AR traitement<br>");
                    app.log('AR traitement');
                	// AR traitement
                	app.log(sync_data);
                	var uar = controller.uploadAR(sync_data);
                	uar.done(function(sync_id, sync_date) { });
                	$.when(uar).done(function(sync_id, sync_date) {
                	    $("#vrn-sync-ar-etat").html($("#vrn-sync-ar-etat").html()+"Scynchro montante terminée<br>");
                	    app.log('Scynchro montante terminée');
                	    // change le statut de la sync pour la passer en "in progress" le temps de la manip
                        app.webservice.syncUpdateStatus(
                            controller.ajaxAsyncTask, 
                            app.loggedUser.id,
                            sync_id, 
                            'ended', 
                            function(data) {
                                app.log("app.webservice.syncUploadData : Sync Server statut changed : ended");

                            }
                        );
                        //alert('data:'+sync_id);
                        // save des infos de cette syncro et doneCallback
                        //var last_sync = new app.domain.sync_infos(sync_data.response_list.sync_data, app.loggedUser.id, sync_data.response_list.date);
                        app.repository.setSyncInfos(sync_id, app.loggedUser.id, sync_date,function(data) {
                            app.log("app.webservice.syncUploadData : Sync Local statut changed : ended");

                        });
                    
                	    
                	});
                }, 
                function(sync_data) {
                    $("#vrn-sync-ar-etat").html($("#vrn-sync-ar-etat").html()+"PB sync<br>");
                	alert('pb sync');
                     app.log("app.webservice.syncGetLastUpdateUrl : Sync statut changed : ended");
                }
            );
               
        });
    };
*/
	function getUTF8Length(string) {
    var utf8length = 0;
    for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);
        if (c < 128) {
            utf8length++;
        }
        else if((c > 127) && (c < 2048)) {
            utf8length = utf8length+2;
        }
        else {
            utf8length = utf8length+3;
        }
    }
    return utf8length;
 };
 
    // ==> HOMEPAGE / TaskBoard //
    controller.showVrnHomePage = function(e,data) {
        app.log("controller.showVrnHomePage", 'wip');

        // header and footer
        //$.mobile.navigate( "#vrn-home-page" );
        $.mobile.navigate( "vrn-home-page" );
        controller.showVrnHeader();
        controller.generateVrnFooter('vrn-home-page');
        
        var count_infos = 0;
        var count_actions = 0;
        var count_bubble_infos = 0;
        var count_bubble_actions = 0;
        var bubble_infos = '';
        var bubble_actions = '';

        // userInfos : infos 
        var r1 = app.repository.getUserItem(localStorage.getItem( "current_user_id" ));
        r1.done(function(user) {
            app.loggedUser = user;
        });

        // consignes (message) : infos et action
        var r2 = app.repository.getMessages(localStorage.getItem( "current_user_id" ));
        r2.done(function(messages) {
            controller.messages = messages;

            for (var i=0;i<messages.length;i++){
                 if(messages[i].read_date == null) messages[i].read_date='';
                 if(messages[i].message_type == 'information'){
                     if(messages[i].read_date == '') count_bubble_infos++;
                     count_infos++;
                 }
                 if(messages[i].message_type == 'action'){
                     if(messages[i].read_date == '') count_bubble_actions++;
                     count_actions++;
                 }
            }
            if(count_bubble_infos != 0 ) {
                bubble_infos = '             <div id="talkbubble">'
                + '                 <span id="mon_lues_text"> <span id="non_lues">non lues:</span> <span id="non_lues_value">'+count_bubble_infos+'</span> </span>'
                + '             </div>';
            } else bubble_infos = '';

            if(count_bubble_actions != 0 ) {
                bubble_actions = '             <div id="talkbubble">'
                + '                 <span id="mon_lues_text"> <span id="non_lues">non lues:</span> <span id="non_lues_value">'+count_bubble_actions+'</span> </span>'
                + '             </div>';
            } else bubble_actions = '';
        });

        // test si tournee du jour 
        var r3 = app.repository.getDailyRoadmapItem();
        r3.done(function(roadmap) {
            daily_roadmap = roadmap;
        });

        // final execute
        $.when(r1, r2, r3).done(function(user,messages,roadmap) {
            //controller.loginLoadingPopup.popup("close");
            daily_roadmap = roadmap;
//alert(daily_roadmap.id_roadmap);
            // infos user
            if (typeof controller.last_sync != "undefined"){
                if (typeof controller.last_sync.date != "undefined") var date = controller.last_sync.date;
                else var date = "";
            } else var date = "";
            //alert(app.loggedUser.firstname+' '+app.loggedUser.lastname.toUpperCase());
            $("#vrn-home-page-user").text(app.loggedUser.firstname+' '+app.loggedUser.lastname.toUpperCase()).trigger('refresh');
            if(date != ''){
                var dateT = date.split(' ');
                $("#vrn-home-page-date").text(dateT[0]).trigger('create');
                $("#vrn-home-page-hour").text(dateT[1]).trigger('create');
            }
            var code = '<div id="vrn-home-message-data-title">Consignes du jour</div>'
            + ' <div class="vrn-consignes">'
            + '    <a href="#vrn-inform-page"><div class="vrn-consulter-circle"><p id="vrn-consulter-circle">CONSULTER</p></div></a>'
            + '     <div id="vrn-consignes">'
            + '         <div id="vrn-consignes_top">'
            + '             <span id="vrn-inform">Informations:</span>'
            + '             <span id="vrn_value">'+count_infos+'</span>'
            + bubble_infos
            + '         </div>'
            + '         <div id="vrn-consignes_bottom">'
            + '             <span id="vrn-actions">Actions:</span>'
            + '             <span id="vrn_value2">'+count_actions+'</span>'
            + bubble_actions
            + '          </div>'
            + '     </div>'
            + '    <div class="vrn-consignes-line1"></div>'
            + '    <div class="vrn-consignes-line2"></div>'
            + '    <div class="vrn-consignes-line3"></div>'
            + ' </div>';
            $("#vrn-home-message-data").html(code).trigger('change');

            // roadmap create panel
            if(daily_roadmap == null) {
                $("#roadmap_create").show();
                $("#roadmap_start").hide();
                $("#roadmap_start_empty").hide();
                $("#roadmap_daily").hide();
            }
            // roadmap current active roadmap panel but empty
            else if(daily_roadmap.id_roadmap != 0 && daily_roadmap.mobile_status_id == 1 && daily_roadmap.pos_list.length == 0) {
                $("#roadmap_start_empty").show();
                $("#roadmap_create").hide();
                $("#roadmap_start").hide();
                $("#roadmap_daily").hide();
                $('#vrn-roadmap-start-empty-btn').unbind('tap');
                $('#vrn-roadmap-start-empty-btn').attr("data-url", "?id_parent=vrn-roadmap-item-page&roadmap_id="+daily_roadmap.id_roadmap);

                $('#vrn-roadmap-start-empty-btn').unbind('tap');
                $('#vrn-roadmap-start-empty-btn').bind('tap', function (event){
                    current_params_url = [];
                    current_params_url['id_parent'] = "vrn-roadmap-item-page";
                    current_params_url['roadmap_id'] = daily_roadmap.id_roadmap;
                    current_params_url['current_item'] = current_item;
                });
            }    
            // roadmap current active roadmap panel
            else if(daily_roadmap.id_roadmap != 0 && daily_roadmap.mobile_status_id == 1) {
                
                // localstorage current data
                localStorage.setItem( "current_roadmap_id", daily_roadmap.id_roadmap );
                if(daily_roadmap.pos_list.length != 0) localStorage.setItem( "current_visit_id", daily_roadmap.pos_list[0].sp_visit__id_visit );
                else localStorage.setItem( "current_visit_id", 0 );
            
                $("#roadmap_daily").show();
                $("#roadmap_start").hide();
                $("#roadmap_start_empty").hide();
                $("#roadmap_create").hide();
                var nb_total_visit = daily_roadmap.pos_list.length;
                var nb_total_visited = 0;
                var curent_vist_id = 0;
                var next_vist_id = 0;
                var current_item = 999;
                for (var i=0;i<daily_roadmap.pos_list.length;i++){ 
                    if(daily_roadmap.pos_list[i].sp_visit__status_visit_id != 1 && daily_roadmap.pos_list[i].sp_visit__status_visit_id != 2 && daily_roadmap.pos_list[i].sp_visit__status_visit_id != 3) 
                        nb_total_visited++;
                    if(daily_roadmap.pos_list[i].sp_visit__status_visit_id == 1){
                        if(current_item == 999) {
                            current_item = i;
                        }
                    }
                }
                if(current_item == 999) current_item = 0;
                $('#vrn-home-page-visit-counter').html( "Visite " + nb_total_visited + " / " +nb_total_visit );
                
                //pourcent calcul
                if(nb_total_visited != 0){
                    var p = (100 / nb_total_visit);
                    var pve = (p * nb_total_visited);
                    $('#vrn-progresbar-c-a').width(pve+'%');
                    $('#vrn-progresbar-c-b').width((100 - pve)+'%');
                    $('#vrn-progresbar-l-a').attr("src", "css/images/vrn/vrn-progresbar-l-on.png");
                    if(pve == 100 ) $('#vrn-progresbar-r-a').attr("src", "css/images/vrn/vrn-progresbar-r-on.png");
                    else $('#vrn-progresbar-r-a').attr("src", "css/images/vrn/vrn-progresbar-r-off.png");
                    $('#vrn-progresbar-c-a').show();
                    $('#vrn-progresbar-c-b').show();
                }else{
                    $('#vrn-progresbar-l-a').attr("src", "css/images/vrn/vrn-progresbar-l-off.png");
                    $('#vrn-progresbar-r-a').attr("src", "css/images/vrn/vrn-progresbar-r-off.png");
                    $('#vrn-progresbar-c-a').hide();
                    $('#vrn-progresbar-c-a').width('0%');
                    $('#vrn-progresbar-c-b').show();
                    $('#vrn-progresbar-c-b').width('100%');
                    $('#vrn-progresbar-c-a').show();
                }
                 
                
                $('#vrn-visites').attr("data-url", "?id_parent=vrn-roadmap-item-page&roadmap_id="+daily_roadmap.pos_list[0].roadmap_id);

                $('#vrn-visites').unbind('tap');
                $('#vrn-visites').bind('tap', function (event){
                    current_params_url = [];
                    current_params_url['id_parent'] = "vrn-roadmap-item-page";
                    current_params_url['roadmap_id'] = daily_roadmap.id_roadmap;
                    current_params_url['current_item'] = current_item;
                });
                
                var code = '<ul id="vrn-details-pos-slider" class="bxslider">\n';
                for (var i=0;i<daily_roadmap.pos_list.length;i++){
                    var visit_title = daily_roadmap.pos_list[i].sp_visit__status_visit_name;
                    //if(i == current_item) var visit_title = "Visite en cours";
                    code += '<li>'+
                    '    <div class="vrn-details-left">'+
                    '        <p><span class="vrn-detail-title">'+visit_title+'</span></p>'+
                    '        <p><div class="vrn-detail-agence-name">'+daily_roadmap.pos_list[i].name +' - '+ daily_roadmap.pos_list[i].type_name+'</div></p>'+
                    '        <div class="vrn-detail-agence-lnk">'+
                    '           <a href="#" class="vrn-men" data-role="button" data-inline="true" data-mini="true" data-shadow="false" data-iconshadow="false" data-icon="men" data-iconpos="left" data-theme="without_border" class="app-theme-none">'+
                    '           '+daily_roadmap.pos_list[i].contact_name +
                    '           </a>'+
                    '           <a href="#" class="vrn-pdv" data-role="button" data-inline="true" data-mini="true" data-shadow="false" data-iconshadow="false" data-icon="pdv" data-iconpos="left" data-theme="without_border" class="app-theme-none">'+
                    '           '+daily_roadmap.pos_list[i].street +",<br>"+ daily_roadmap.pos_list[i].postal_code + " " +daily_roadmap.pos_list[i].city+
                    '           </a>'+
                    '           <a href="#" class="vrn-home-page-visit-pos-contact-telephone-lnk" data-role="button" data-inline="true" data-mini="true" data-shadow="false" data-iconshadow="false" data-icon="telephone" data-iconpos="left"  data-theme="without_border" class="app-theme-none">'+
                    '           '+daily_roadmap.pos_list[i].phone_number+
                    '           </a>'+
                    '       </div>'+
                    '    </div>'+
                    '    <div class="vrn-details-right">'+
                    '        <div class="vrn-retenir">A retenir :</div><br/>'+
                    '        <span>'+daily_roadmap.pos_list[i].description+'</span>'+
                   // '        <div class="ui-grid-solo">'+
                    '            <div class="vrn-lancer-visit-button">'+
                    '                <a href="#vrn-roadmap-visit-page" id="vrn-lancer-'+i+'" data-url="?id_parent=vrn-roadmap-visit-page&sp_visit_id='+daily_roadmap.pos_list[i].sp_visit__id_visit+'&current_item='+i+'" data-role="button" data-icon="triangle_right_black" data-iconpos="right" data-inline="true">LANCER LE QUESTIONNAIRE</a>'+
                    //'            </div>'+
                    '        </div>'+  
                    '    </div>'+
                    '</li>';
                }
                code += '</ul>\n';
                // data-transition="slide" class="ui-state-persist"
                $("#vrn-details").html(code).trigger('create');
                //alert('current_item:'+current_item);
                
                $('#vrn-details-pos-slider').bxSlider({startSlide: current_item});
                
                for (var j=0;j<daily_roadmap.pos_list.length;j++){
                    //alert('init');
                    $('#vrn-lancer-'+j).unbind('tap');
                    $('#vrn-lancer-'+j).bind('tap', function (event){
                        

                        current_params_url = [];
                        var querystring = $(this).jqmData('url');
                        if(querystring.indexOf('?') != -1){
                            var param_url = querystring.substring(querystring.indexOf('?')+1);
                            //alert('param_url:'+param_url);
                            app.log("params : "+param_url);
                            if(param_url.indexOf('&') != -1){
                                var pus = param_url.split('&');
                                for (var i=0;i<pus.length;i++){ 
                                    var pu = pus[i].split('=');
                                    current_params_url[pu[0]] = pu[1];
                                    localStorage.setItem( pu[0], pu[1] );
                                }
                            }
                        }
                       // alert('click : '+current_params_url['sp_visit_id']);
                    }); 
                    
                    
                }
            }
            // roadmap active roadmap panel
            else if(daily_roadmap.id_roadmap != 0 && daily_roadmap.mobile_status_id == 5) {
                $("#roadmap_start").show();
                $("#roadmap_start_empty").hide();
                $("#roadmap_create").hide();
                $("#roadmap_daily").hide();
                
                $('#vrn-roadmap-start-btn').unbind('tap');
                $('#vrn-roadmap-start-btn').bind('tap', function (event){
                    
                    // suspendent all active roadmap
            
                    var param = [ app.utils.convertTimestampToDateIso(new Date().getTime(),'-') ];
                    var r100 = app.repository.closeAllActivesRoadmapI(param);
                    var r101 = app.repository.closeAllActivesRoadmapU(param);
                    
                    $.when(r100, r101).done(function() {

                        // active
                        if(daily_roadmap.sync_status == 'I') var sync_status = 'I';
                        else var sync_status = 'U';
                        var param = [ 1, sync_status, daily_roadmap.id_roadmap ];
                        var r1b = app.repository.activeRoadmap(param);
                        r1b.done(function() { });
                        $.when(r1b).done(function() {
                        	
                        	
                            current_roadmap_id = daily_roadmap.id_roadmap;
                            
                            controller.showVrnHomePage(e,data);
                            
                            controller.syncUpDownData(function (){
			                    app.log('end sync');
			                
			                    current_params_url = [];
	                            current_params_url['id_parent'] = "vrn-home-page";
	                            current_params_url['roadmap_id'] = daily_roadmap.id_roadmap;
	                            
	                            controller.showVrnHomePage(e,data);
			                 });
                            
                            
                        });
                    });

                });
            }

        });

    };

    // ==> Watchwords / Infos / Consignes //
    controller.showVrnInformPage = function(e,data) {
        app.log("controller.showVrnInformPage", 'wip');

        // header et footer
        $.mobile.navigate( "#vrn-inform-page" );
        controller.showVrnHeader();
        controller.generateVrnFooter('vrn-inform-page');
        $("#vrn-inform-page").trigger('refresh');

        // consignes (message) : infos et action 
        var r1 = app.repository.getMessages(localStorage.getItem( "current_user_id" ));
        r1.done(function(messages) {
            controller.messages = messages;
        });

        // final execute
        $.when(r1).done(function(messages) {
            var valid_all_infos = 1;
            var code = '<ul data-role="listview" data-inset="true" data-theme="c" data-dividertheme="a" id="inform-listview">';
            for (var i=0;i<messages.length;i++){ 
                var title = "";
                if(messages[i].message_type == 'information'){
                     title = "INFORMATION";
                }
                if(messages[i].message_type == 'action'){
                     title = "ACTION";
                }
                if(messages[i].priority == '1'){
                     var ico_priority = '<img class="ui-li-iconB" alt="" src="./css/images/vrn/star.png">';
                } else var ico_priority = '';
                if(messages[i].read_date == null) messages[i].read_date='';
                if(messages[i].read_date != '' && messages[i].attachment == ''){
                    var ico_check = 3;                    
                }else if(messages[i].read_date == '' && messages[i].attachment == ''){
                    var ico_check = 2;
                    valid_all_infos = 0;
                }else if(messages[i].read_date != '' && messages[i].attachment != ''){
                    var ico_check = 1;
                }else if(messages[i].read_date == '' && messages[i].attachment != ''){
                    var ico_check = 4;
                    valid_all_infos = 0;
                } else 
                var ico_check = '';

                 code += '<li data-icon="check'+ico_check+'" id="vrn-inform-message-li-'+messages[i].id_message+'">'+
                 '  <a href="#vrn-inform-detail-pop" data-url="?id_parent_pop=vrn-inform-detail-pop&id='+messages[i].id_message+'" id="vrn-inform-message-'+messages[i].id_message+'" class="inform-detail-link" data-transition="pop" data-inline="true" data-rel="popup">'+
                           ico_priority+
                     '      <span class="min_color">'+messages[i].send_date+'</span>'+
                     '      <div class="Information">'+title+'</div> '+
                     '      <span class="text">De </span><span class="text_bold"> '+messages[i].lastname+'</span> '+
                     '      <p class="myParagraph ui-li-desc">'+messages[i].content+'</p> '+
                     '  </a>'+
                     '</li>';
            }
            code += '</ul>';
            $("#vrn-inform-div").html(code).trigger('create');
//alert('valid:'+valid_all_infos);
            if(valid_all_infos == 0){
                $("#vrn-footer-nav-inform").height(144);
                $("#vrn-inform-valider").height(63);
                var code = '<div class="ui-grid-a" id="custom-grid-a">'+
                    '       <div class="ui-block-a vrn-inform-valider-text">Vous n’avez pas consulté toutes les consignes !</div>'+
                    '       <div class="ui-block-b vrn-valider-button">'+
                    '           <a href="#vrn-home-page" data-url="vrn-home-page" id="vrn-valider" data-role="button" data-transition="slidedown" data-icon="triangle_right_black_image_2" data-iconpos="right" data-inline="true">Valider</a>'+     
                    '       </div>'+
                    '   </div>';
                $("#vrn-inform-valider").html(code).trigger('create');
                $("#vrn-inform-valider").show().trigger('refresh');

            //    alert('hopshow infos');
            }else{
                $("#vrn-inform-valider").hide();
                $("#vrn-footer-nav-inform").height(80);
            }

            for (var i=0;i<messages.length;i++){ 
                $('#vrn-inform-message-'+messages[i].id_message).unbind('tap');
                $('#vrn-inform-message-'+messages[i].id_message).bind('tap', controller.getParamUrl );
            }

            $("#vrn-inform-page").trigger('refresh'); 
        });

    };

    controller.showMessagePop = function(id_message) {
        app.log("controller.clickMessage: "+ id_message, 'wip');

        for (var i=0;i<controller.messages.length;i++){ 
            if(controller.messages[i].id_message == id_message){
                var datetimeNow = app.utils.getNowDatetime();
                if(controller.messages[i].read_date == null) messages[i].read_date='';
                if(controller.messages[i].read_date != '' && controller.messages[i].attachment == ''){
                    // nothing
                }else if(controller.messages[i].read_date == '' && controller.messages[i].attachment == ''){
                    // check and relaod item
                    controller.checkMessageStatus(controller.messages[i].id_message,datetimeNow);
                    controller.messages[i].read_date = datetimeNow;
                    $('#vrn-inform-message-li-'+id_message+' .ui-icon.ui-icon-check2.ui-icon-shadow').css({"background-image" : "url(css/images/vrn/check3.png)"}).animate({opacity: 1});
                }else if(controller.messages[i].read_date != '' && controller.messages[i].attachment != ''){
                    // link file
                }else if(controller.messages[i].read_date == '' && controller.messages[i].attachment != ''){
                    // check and relaod item + link file
                    controller.checkMessageStatus(controller.messages[i].id_message,datetimeNow);
                    controller.messages[i].read_date = datetimeNow;
                    $('#vrn-inform-message-li-'+id_message+' .ui-icon.ui-icon-check2.ui-icon-shadow').css({"background-image" : "url(css/images/vrn/check1.png)"}).animate({opacity: 1});
                } 

                $("#vrn-inform-detail-type").html(controller.messages[i].message_type);
                $("#vrn-inform-detail-date").html(controller.messages[i].send_date);
                $("#vrn-inform-detail-de").html(controller.messages[i].lastname);
                $("#vrn-inform-detail-subject").html(controller.messages[i].subject);
                $("#vrn-inform-detail-text").html(controller.messages[i].content);
                if(controller.messages[i].attachment != ""){
                    var a = controller.messages[i].attachment.split('/');
                    var file_name = a[(a.length - 1)];
                    $("#vrn-inform-detail-text-attachment").html("<a href=\""+controller.messages[i].attachment+"\">"+file_name+"</a>");
                    $("#vrn-inform-detail-attachment-title").show();
                } else $("#vrn-inform-detail-text-attachment-title").hide();
            }
        }

        var valid_all_infos = 1;
        // test if all message was checked
        for (var i=0;i<controller.messages.length;i++){
            if(controller.messages[i].read_date != ''){
                // nothing
            }else if(controller.messages[i].read_date == '' ){
                valid_all_infos = 0;
            }
        }
       // alert('val:'+valid_all_infos);
        if(valid_all_infos == 1){
            $("#vrn-inform-valider").hide();
            $("#vrn-footer-nav-inform").height(79);
        }
    };

    controller.checkMessageStatus = function(id_message,datetimeNow) {
        // change le statut de la sync pour la passer en "in progress" le temps de la manip
        app.repository.checkMessageStatus(id_message,datetimeNow,
            function() {
                app.log("checkMessageStatus changed : "+id_message);
                
                controller.syncUpDownData(app.log('end sync'));
            }
        );
    };

      ////////////////////
     // ==> Roadmap == //
    ////////////////////
    
    // Roadmap : roadmap panel : liste des tournees
    controller.showVrnRoadmapPage = function() {
       app.log("controller.showVrnRoadmapPage", 'wip');
        
       // header et footer
       $.mobile.navigate( "#vrn-roadmap-page" );
       controller.showVrnHeader();
       controller.generateVrnFooter('vrn-roadmap-page');
       $("#vrn-roadmap-page").trigger('refresh');
        
        var roadmap;
        
        // get roadmap list
        var r1 = app.repository.getRoadmapList(localStorage.getItem( "current_user_id" ));
        r1.done(function(roadmap_list) {
            roadmap = roadmap_list;
         
        });

        // test si tournee du jour 
        var r2 = app.repository.getDailyRoadmapItem();
        r2.done(function(d_roadmap) {
            daily_roadmap = d_roadmap;
        });
        
        // final execute
        $.when(r1,r2).done(function(roadmap_list,d_roadmap) {
            roadmap = roadmap_list;
            daily_roadmap = d_roadmap;
            var code = '';
            for (var i=0;i<roadmap.length;i++){
                //var visit = "09/10";
                if(daily_roadmap != null && roadmap[i].id_roadmap == daily_roadmap.id_roadmap) var select = " class=\"li_select\"";
                else var select = "";
                //if(roadmap[i].id_roadmap == daily_roadmap.id_roadmap) select = "";
                //else select = "";
                code += '<li'+select+'>'
                    +'    <a href="#vrn-roadmap-item-page" data-url="?roadmap_id='+roadmap[i].id_roadmap+'" id="roadmap_btn_id_'+roadmap[i].id_roadmap+'" data-transition="slide">' 
                    +'        <span class="vrn-item-title">'+roadmap[i].scheduled_date+' </span>'
                    +'        <div>' 
                    +'            <img alt="" src="css/images/vrn/icon_address.png" class="vrn-icon-address"> <span class="vrn-text-centered">'+roadmap[i].area_name+'</span>' 
                    +'        </div>' 
                    +'        <div>'
                    +'            <img alt="" src="css/images/vrn/icon_pencil.png" class="vrn-icon-edit">' 
                    +'            <span class="vrn-text-centered"> '+roadmap[i].initiating_user_categories__name+'</span>' 
                    +'        </div>'
                    +'        <div class="ui-li-aside">'
                    +'            <div class="vrn-roadmap-disclosure">'
                    +'                <div class="vrn-roadmap-left-div">'
                    +'                    <span class="vrn-item-text" id="vrn-item-text">VISITES</span>'
                    +'                    <span class="vrn-rm-sched-visits" id="vrn-rm-sched-visits">'+roadmap[i].nb_visited+'</span>'
                    +'                    <span id="vrn-slash">/</span>'
                    +'                    <span class="vrn-rm-sched-visits-part2" id="vrn-rm-sched-visits-part2">'+roadmap[i].nb_visit+'</span>'
                    +'                </div>'
                    +'                <div class="vrn-roadmap-right-div">'
                    +'                    <span class="vrn-item-text" id="vrn-item-status">'+roadmap[i].roadmap_status_mobile__name+'</span>'
                    +'                </div>' 
                    +'            </div>' 
                    +'         </div>' 
                    +'     </a>' 
                    +'</li>';

            }
            $("#vrn-roadmap-list").html(code).listview('refresh');
            
            
            // btn listeners
            for (var i=0;i<roadmap.length;i++){ 
                $('#roadmap_btn_id_'+roadmap[i].id_roadmap).unbind('tap');
                $('#roadmap_btn_id_'+roadmap[i].id_roadmap).bind('tap', controller.getParamUrl );
            }

            $('#try').unbind('click');
            $('#try').bind('tap', function(){
                $("#collapsable-header").toggle();
            });
            
        });

    };
    
    // Roadmap : add roadmap
    controller.showVrnRoadmapAddPage = function() {
        app.log("controller.showVrnRoadmapAddPage", 'wip');
        // header et footer
        $.mobile.navigate( "#vrn-roadmap-add-page" );
        controller.showVrnHeader();
        controller.generateVrnFooter('vrn-roadmap-page');
        
        // init datepicker
        //$( "#vrn-roadmap-date" ).datepicker();
        $( "#vrn-roadmap-date" ).datepicker( $.datepicker.regional[ "fr" ] );
        // get microzone
        var r1 = app.repository.getMicroZones();
        r1.done(function(mzs) {
            var microzones = mzs;
        });
        // final execute
        $.when(r1).done(function(mzs) {
            var microzones = mzs;
            var select = $('#vrn-roadmap-zone');
            if(select.prop) {
              var options = select.prop('options');
            }else {
              var options = select.attr('options');
            }
            $('option', select).remove();
            options[options.length] = new Option("zone géographique",'');
            for (var i=0;i<microzones.length;i++){ 
                options[options.length] = new Option(microzones[i].name,microzones[i].id_item);
            }
            //select.val(pos.microzone_id); 
        });
        
        // bouton pour save roadmap vers vrnRoadmapAddSave
        $('#vrn-enregistrer-button-roadmap-creation').unbind('tap');
        $('#vrn-enregistrer-button-roadmap-creation').bind('tap', function (event){
            controller.vrnRoadmapAddSave(event);
        });
    };
    
    // roadmap : add roadmap save
    controller.vrnRoadmapAddSave = function(event) {
        app.log("controller.vrnRoadmapAddSave : " , 'wip');
        var eve = new Date().getTime()+"";
        eve = eve.substr(4);
        var form_statut = "ok";
        var message = "";
        if($('#vrn-roadmap-date').val() == ""){
            message += "Le champs \"date\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        if($('#vrn-roadmap-zone').val() == ""){
            message += "Le champs \"Zone géographique\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        app.log(message , 'wip');
        
        
        if(form_statut == "ok"){
            // prepa roadmap_scheduled_date et roadmap_name
            var tt = $('#vrn-roadmap-date').val().split('/');
            var today = new Date(tt[2]+'-'+tt[1]+'-'+tt[0]);
            var dd = today.getDate();
            var month=new Array();
            month[0]="Jan";
            month[1]="Feb";
            month[2]="Mar";
            month[3]="Apr";
            month[4]="May";
            month[5]="Jun";
            month[6]="Jul";
            month[7]="Aug";
            month[8]="Sep";
            month[9]="Oct";
            month[10]="Nov";
            month[11]="Dec";
            var m = month[today.getMonth()];
            var mm = today.getMonth()+1; //January is 0!
            var yyyy = today.getFullYear();
            if(dd<10) { dd='0'+dd; } 
            if(mm<10) { mm='0'+mm; }
            var roadmap_name = dd+' '+m+' '+yyyy;
            var roadmap_scheduled_date = yyyy+'-'+mm+'-'+dd;
            var data = [ eve, localStorage.getItem( "current_user_id"), localStorage.getItem( "current_user_id"), 5, 3, app.utils.getNowDatetime(), roadmap_name, roadmap_scheduled_date, 0, $('#vrn-roadmap-zone').val(), 0, 'I' ];
            var r1 = app.repository.addRoadmap(data);
            r1.done(function(data) { });
            $.when(r1).done(function(data) {
                
                current_roadmap_id = eve;
                
                controller.syncUpDownData(function (){
                        
                    app.log('end sync');
                
                    // goto road map item
                    current_params_url = [];
                    current_params_url['id_parent'] = "vrn-roadmap-item-page";
                    current_params_url['roadmap_id'] = current_roadmap_id;
                    //alert("eve:"+eve);
                    $.mobile.changePage("#vrn-roadmap-item-page", {
                        transition:"slide",
                        changeHash:false,
                        reverse:true,
                        reload:true
                     });
                });    
            });
        }else{
            // return error pop
            $('#vrn-roadmap-add-error-popup').popup();
            $("#vrn-roadmap-add-error-popup-content").children("[class='ui-title']").html(message).trigger('create');
            $('#vrn-roadmap-add-error-popup').popup('open');
        }
        
    };

    
    var current_roadmap_id;
    
    // Roadmap : show roadmap item (liste de pos)
    controller.showVrnRoadmapItemPage = function(roadmap_id) {
        app.log("controller.showVrnRoadmapItemPage", 'wip');
        
        // header et footer
        $.mobile.navigate( "#vrn-roadmap-item-page" );
        controller.showVrnHeader();
        controller.generateVrnFooter('vrn-roadmap-item-page');

        var roadmap;
        var pos;
        
        current_roadmap_id = roadmap_id;
       // alert('current_roadmap_id:'+current_roadmap_id);
        var r1 = app.repository.getRoadmapItem(roadmap_id);
        r1.done(function(roadmap_retour) {
            roadmap = roadmap_retour;
        });
        var r2 = app.repository.getRoadmapItemPosList(roadmap_id);
        r2.done(function(sp_list) {
            pos = sp_list;
        });
        
        var r3 = app.repository.getStatusMobile();
        r3.done(function(data_r3) {
            var status_roadmap = data_r3;
        });
         
        // final execute
        $.when(r1, r2, r3).done(function(data_r1, data_r2, data_r3) {
            
            roadmap = data_r1;
            pos = data_r2;
            var status_roadmap = data_r3;
            
            var codea = '';
            var codeb = '';
            var nb_visits = pos.length;
            var nb_visits_finish = 0;
            for (var i=0;i<pos.length;i++){ 
                if(pos[i].last_visit_id != null && pos[i].last_visit_id != 0) var last_visit = '<span class="oi-derniere-text">Dernière visite</span><span class="bold align-jour">'+pos[i].last_visit_id+'</span>';
                else var last_visit = '';
                
                if(pos[i].sp_visit__status_visit_id != 1) nb_visits_finish++;
                
               // if(pos[i].sp_visit__status_visit_id == "1") var ico_status_visit = "<a href=\"#vrn-roadmap-item-pos-delete-pop\" data-url=\"?mode_edit=add&id_parent_pop=vrn-roadmap-item-pos-delete-pop&roadmap_id="+pos[i].roadmap_id+"&sales_point_id="+pos[i].id_sales_point+"\" data-transition=\"pop\" data-rel=\"popup\" class=\"vrn-roadmap-list-item-pos-delete-lnk\"><img src=\"./css/images/vrn/x-ul-ala.png\"></a>";
               // else var ico_status_visit = "<img class=\"ui-li-icon ui-li-thumb\" alt=\"\" src=\"./css/images/vrn/bifa.png\">";
                
                //sp_visit__status_visit_id
                
                 var code = '<li id="vrn-roadmap-edit-item-'+pos[i].id_sales_point+'">'
                    +'  <span>'
                    +'    <img class="ui-li-iconB" alt="" src="./css/images/vrn/circle-with-arrows.png">'
                    +'    <span class="oi-li-heading">'+pos[i].name+'</span>'
                    +'    <span class="oi-li-desc">- '+pos[i].type_name+'</span>'
                    +'    <span class="oi-li-derniere ui-li-count-right">'+last_visit+'</span>'
                    +'    <a href="#vrn-roadmap-item-pos-detail-pop" data-url="?mode_edit=add&id_parent_pop=vrn-roadmap-item-pos-detail-pop&roadmap_id='+pos[i].roadmap_id+'&sales_point_id='+pos[i].id_sales_point+'" id="vrn-roadmap-item-pos-detail-btn-'+pos[i].id_sales_point+'" data-transition=\"pop\" data-rel=\"popup\" data-position-to="window" data-theme=""><img  class="oi-li-inform ui-li-count-right" alt="" src="./css/images/vrn/inform.png" width="35" height="36"></a>'
                    +'    <a href="#vrn-roadmap-item-pos-delete-pop" data-url="?mode_edit=add&id_parent_pop=vrn-roadmap-item-pos-delete-pop&roadmap_id='+pos[i].roadmap_id+'&sales_point_id='+pos[i].id_sales_point+'" id="vrn-roadmap-item-pos-detail-btn-del-'+pos[i].id_sales_point+'" data-transition=\"pop\" data-rel=\"popup\" data-position-to="window" data-theme=""><img  class="oi-li-delete-style ui-li-count-right"  data-role="button" alt="" src="./css/images/vrn/delete-icon.png" width="35" height="36"></a>'      
                    +'  </span>'
                    +'</li>';
                if(pos[i].sp_visit__status_visit_id == 1) codeb += code;
                else  codea += code;
            } 
            //alert(pos.length);
            /*
            if(action == 'create') $("#vrn-roadmap-item-list").html(code).trigger('create');
            else 
                */
            $("#vrn-roadmap-item-pos-lists-a").html(codea).listview('refresh');
            $("#vrn-roadmap-item-pos-lists-b").html(codeb).listview('refresh');
            $("#vrn-roadmap-item-pos-lists-b").sortable({
                    'containment': 'parent',
                    'opacity': 0.6,
                    update: function(event, ui) {
                        alert("dropped");
                    }
            });
            
            $("#vrn-roadmap-item-date").html(roadmap.scheduled_date);
            $("#vrn-roadmap-item-no-pdv").val(pos.length);
            
            $('#vrn-roadmap-item-pos-add-button').attr("data-url", "?id_parent_pop=vrn-roadmap-item-pos-add-pop&roadmap_id="+current_roadmap_id);
            $('#vrn-roadmap-item-pos-add-button').unbind('tap');
            $('#vrn-roadmap-item-pos-add-button').bind('tap', function(){
                current_params_url = [];
                current_params_url['id_parent_pop'] = "vrn-roadmap-item-pos-add-pop";
                current_params_url['roadmap_id'] = current_roadmap_id;
            }
            );

            for (var i=0;i<pos.length;i++){
                if(pos[i].sync_status != "D"){
                    $("#vrn-roadmap-item-pos-detail-btn-"+pos[i].id_sales_point).unbind('tap');
                    $("#vrn-roadmap-item-pos-detail-btn-"+pos[i].id_sales_point).bind('tap', controller.getParamUrl );
                    $("#vrn-roadmap-item-pos-detail-btn-del-"+pos[i].id_sales_point).unbind('tap');
                    $("#vrn-roadmap-item-pos-detail-btn-del-"+pos[i].id_sales_point).bind('tap', controller.getParamUrl );
                }
            }
            
            if(roadmap.mobile_status_id == 1){
                var code = '<div id="vrn-circle-roadmap">' +
                '    <a href="#" id="vrn-btn-close-roadmap">' +
                '        <div class="vrn-cloturer-roadmap-circle">' +
                '            <p>' +
                '                <span class="bold">clôturer<br/>la tournée</span>' +
                '            </p>' +
                '        </div>' +
                '    </a>' +
                '    <div id="vrn-comment-cloture-roadmap-form">' +
                '        <div id="vrn-comment-cloture-roadmap">' +
                '            <div id="vrn-comment-cloture-roadmap-alert">' +
                '            Vous n\'avez pas complété toutes les visites !' +
                '            </div>' +
                '            <select id="vrn-comment-cloture-roadmap-type" name="vrn-comment-cloture-roadmap-type" data-icon="arrow_down" data-theme="f">' +
                '                <option value=""> Type de cloture </option>' +
                '            </select>' +
                '            <div id="vrn-comment-cloture-roadmap-title_comm">' +
                '                Commentaire de clôture' +
                '            </div>' +
                '            <textarea name="comment-cloture-roadmap" id="textarea-comment-cloture-roadmap"> Tapez votre commentaire...</textarea>' +
                '        </div>' +
                '        <div class="ui-grid-solo" id="ui-form-list-buttons-roadmap">' +
                '            <div class="ui-block-a">' +
                '                <a href="#" id="vrn-comment-cloture-roadmap-form-cancel-button" data-role="button" data-icon="false" data-inline="true" data-theme="f">Annuler</a>' +
                '                <a href="#" id="vrn-comment-cloture-roadmap-form-valider-button" data-role="button" data-icon="arrow_right_white" data-iconpos="right" data-inline="true" data-theme="a">Valider</a>' +
                '            </div>' +
                '            <br/><br/><br/><br/><br/><br/><br/><br/>' +
                '            <div id="vrn-comment-cloture-roadmap-form-bottom"></div>' +
                '        </div>' +
                '    </div>' +
                '</div>';
                
                
                //vrn-footer-nav-roadmap-item
                $('#vrn-roadmap-valider').html(code).trigger("create");
                $('#vrn-roadmap-valider').show();
              
                //alert(roadmap.mobile_status_id);
                for (var i=0;i<status_roadmap.length;i++){
                    
                    if(roadmap.mobile_status_id == status_roadmap[i].id_status_roadmap) var selected = " selected";
                    else if(status_roadmap[i].id_status_mobile == 6) var selected = " selected";
                    else var selected = "";
                    
                    $('#vrn-comment-cloture-roadmap-type').append('<option value="'+status_roadmap[i].id_status_mobile+'"'+selected+'>'+status_roadmap[i].name+'</option>');
                } 
                
                if(pos.sp_visit__comment != "") $('#textarea-comment-cloture-roadmap').val(roadmap.comment);
                else $('#textarea-comment-cloture-roadmap').val(" Tapez votre commentaire...");
                
                $('#vrn-btn-close-roadmap').unbind('tap');
                $('#vrn-btn-close-roadmap').bind('tap', function(){ 
                    if(nb_visits == nb_visits_finish) {
                       $('#vrn-comment-cloture-roadmap-alert').show();
                       $('#textarea-comment-cloture-roadmap').css('height', '107px');
                    }else{
                       $('#vrn-comment-cloture-roadmap-alert').hide();
                       $('#textarea-comment-cloture-roadmap').css('height', '142px');
                    }
                    $("#vrn-roadmap-valider").animate({ 
                        height: "480px"
                    },
                    1000
                    );

                });
                $('#vrn-comment-cloture-roadmap-form-cancel-button').bind('tap', function(){ 
                    $("#vrn-roadmap-valider").animate({ 
                        height: "128px"
                    },
                    1000
                    );
              });

                $('#vrn-comment-cloture-roadmap-form-valider-button').unbind('tap');
                $('#vrn-comment-cloture-roadmap-form-valider-button').bind('tap', function(){controller.closeRoadmap();});

           } else { 
           		$('#vrn-roadmap-valider').hide();
           }
            
        });
    };
    
    controller.closeRoadmap = function() {
        app.log("controller.closeRoadmap", 'wip');
        var data = [ $('#vrn-comment-cloture-roadmap-type').val(), app.utils.convertTimestampToDateIso(new Date().getTime(),'-'), $('#textarea-comment-cloture-roadmap').val(), 'U', current_roadmap_id ];
        
        var r100 = app.repository.closeRoadmap(data);
        r100.done(function(pos) {
	        controller.syncUpDownData(function (){
		        app.log('end sync');
		    
	            $.mobile.changePage("#vrn-home-page", {
	                transition:"slide",
	                changeHash:false,
	                reverse:true,
	                reload:true
	             });
			});
        });
    };
    
    controller.showRoadmapItemPosDetailPop = function(roadmap_id, sales_point_id) {
       app.log("controller.showRoadmapItemPosDetailPop", 'wip');
       var roadmap;
       var pos;
       //if(mode_edit == 'add') var url_retour = "#vrn-roadmap-add-page?roadmap_id="+roadmap_id;
       //if(mode_edit == 'edit') var url_retour = "#vrn-roadmap-edit-page?roadmap_id="+roadmap_id;
       //else var url_retour = '#';
       
       //$('#vrn-identity-top-right a').attr('href', url_retour);
       
       // get POS item
       var r1 = app.repository.getPosItem(sales_point_id);
       r1.done(function(pos) {
       });
       
       // final execute
       $.when(r1).done(function(pos) {
           $('#vrn-identity-top-left').html(pos.name);
           // derniere visit ? last_visit_id
           if(pos.last_visit_id == "0") $('#vrn-roadmap-item-pos-top-right').hide();
           else $('#vrn-roadmap-item-pos-top-right').show();
           $('#vrn-roadmap-item-pos-top-left').html(pos.name);
           $('#vrn-roadmap-item-pos-address').html('<img alt="" src="./css/images/vrn/forma2_3.png">'+pos.street + ", " +pos.postal_code+ " " +pos.city);
           $('#vrn-roadmap-item-pos-seller-name').html('<img alt="" src="./css/images/vrn/forma2_3.png">'+pos.contact_name);
           $('#vrn-roadmap-item-pos-tel').html("<option value=\""+pos.phone_number+"\" selected> "+pos.phone_number+" </option>");
           $('#vrn-roadmap-item-pos-tel')[0].selectedIndex = 0;
           $('#vrn-roadmap-item-pos-tel').selectmenu("refresh");
           $('#vrn-roadmap-item-pos-email').html("<option value=\""+pos.email+"\" selected> "+pos.email+" </option>");
           $('#vrn-roadmap-item-pos-email')[0].selectedIndex = 0;
           $('#vrn-roadmap-item-pos-email').selectmenu("refresh");
           $('#vrn-roadmap-item-pos-description').html(pos.description);
           $('#vrn-roadmap-item-pos-descriptionb').html('');
           $('#vrn-roadmap-item-pos-detail-pop').trigger('refresh');
           
           $('#vrn-roadmap-item-pos-map-lnk').attr("data-url", "?id_parent_pop=vrn-roadmap-item-pos-map-pop&roadmap_id="+roadmap_id+"&sales_point_id="+sales_point_id+"&gps_latitude="+pos.gps_latitude+"&gps_longitude="+pos.gps_longitude+"");
           $('#vrn-roadmap-item-pos-button').attr("data-url", "?id_parent=vrn-roadmap-item-pos-edit-page&roadmap_id="+roadmap_id+"&sales_point_id="+sales_point_id+"");
       });
       
       //$( '#vrn-roadmap-item-pos-detail-pop' ).popup( 'reposition', 'positionTo: window' ).trigger('refresh');
       //$( '#vrn-roadmap-item-pos-detail-pop' ).trigger('refresh');
       
       // btn listeners
       $('#vrn-roadmap-item-pos-appeler-button').unbind('tap');
       $('#vrn-roadmap-item-pos-appeler-button').bind('tap',function (event){
           controller.callPhone($('#vrn-roadmap-item-pos-tel').find(":selected").val());
       });
       
       $('#vrn-roadmap-item-pos-send-button').unbind('tap');
       $('#vrn-roadmap-item-pos-send-button').bind('tap',function (event){
           controller.sendAMail($('#vrn-roadmap-item-pos-email').find(":selected").val());
       });
       
       $('#vrn-roadmap-item-pos-map-lnk').unbind('tap');
       $('#vrn-roadmap-item-pos-map-lnk').bind('tap', function (event){
           current_params_url = [];
           current_params_url['id_parent_pop'] = "vrn-roadmap-item-pos-map-pop";
           current_params_url['roadmap_id'] = roadmap_id;
           current_params_url['sales_point_id'] = sales_point_id;
           current_params_url['gps_latitude'] = pos.gps_latitude;
           current_params_url['gps_longitude'] = pos.gps_longitude;
       });
       
       $('#vrn-roadmap-item-pos-button').unbind('tap');
       $('#vrn-roadmap-item-pos-button').bind('tap', function (event){
           current_params_url = [];
           current_params_url['id_parent'] = "vrn-roadmap-item-pos-edit-page";
           current_params_url['roadmap_id'] = roadmap_id;
           current_params_url['sales_point_id'] = sales_point_id;
       });
       
    };

    controller.showRoadmapItemPosMapPop = function(roadmap_id, sales_point_id, gps_latitude, gps_longitude) {
        app.log("controller.showRoadmapItemPosMapPop", 'wip');
        var w = (screen.width - 200);
        var h = (screen.height - 200);
        $('#vrn-roadmap-item-pos-map-pop').css("width", w+"px");
        $('#vrn-roadmap-item-pos-map-pop').css("height", h+"px");
        $('#vrn-roadmap-item-pos-map-pop').trigger("refresh");
        $('#vrn-roadmap-item-pos-map-content').css("width", (w-30)+"px");
        $('#vrn-roadmap-item-pos-map-content').css("height", (h-99)+"px");
        $('#vrn-roadmap-item-pos-map-content').trigger("refresh");

        if(gps_latitude != '') var lat = gps_latitude;
        else var lat = 48.826464;
        if(gps_longitude != '') var lng = gps_longitude;
        else var lng = 2.3204027;
        var latlng = new google.maps.LatLng (lat, lng);
        var options = { 
            zoom : 15, 
            center : latlng, 
            mapTypeId : google.maps.MapTypeId.ROADMAP 
        };
        var $content = $("#vrn-roadmap-item-pos-map-content");
        var map = new google.maps.Map ($content[0], options);
        new google.maps.Marker ( 
        { 
            map : map, 
            animation : google.maps.Animation.DROP,
            position : latlng  
        }); 
        $("#vrn-roadmap-item-pos-map-content").trigger("refresh");
    };
    
    // delete pos item to list
    controller.showRoadmapItemPosDeletePop = function(roadmap_id,sales_point_id) {
        app.log("controller.showRoadmapItemPosDeletePop", 'wip');
        $('#vrn-roadmap-item-pos-delete-btn').unbind('tap');
        $('#vrn-roadmap-item-pos-delete-btn').bind('tap',function (event){
            // delete in DB
            var r1 = app.repository.deleteRoadMapItemPos(roadmap_id,sales_point_id);
            r1.done(function() {} );
            $.when(r1).done(function() {
                // delete item to list
                $('#vrn-roadmap-edit-item-'+sales_point_id).remove();
                // refresh list
                $("#vrn-road_closing-list").listview('refresh');
                // close pop
                //$('#vrn-roadmap-item-pos-delete-pop').popup('close');
                // refresh list count
                $('#vrn-roadmap-item-no-pdv').val($('#vrn-road_closing-list').size());
            });

        });
    };
    
    
    var pos_seleted;
    controller.addRoadmapItemPosPop = function(roadmap_id) {
        app.log("controller.addRoadmapItemPosPop:"+roadmap_id, 'wip');
        //alert('add pos:'+roadmap_id);
        pos_seleted = [];
        // all pos list
        var r1 = app.repository.getAllRoadmapItemPosList();
        r1.done(function(pos_listA) {
            var allpos = pos_listA;
           // alert('list A');
        });
        
        // roadmap pos list
        var r2 = app.repository.getRoadmapItemPosList(roadmap_id);
        r2.done(function(pos_listB) {
            var pos = pos_listB;
           // alert('list B');
        });

        // final execute
        $.when(r1, r2).done(function(pos_listA,pos_listB) {
            var allpos = pos_listA;
            var pos = pos_listB;
            var code = '';
           // alert('pos nb:'+allpos.length);
            for (var i=0;i<allpos.length;i++){ 
                //alert('hop');
                pos_seleted[i]= [];
                
                pos_seleted[i]['id'] = allpos[i].id_sales_point;
                
                var pos_present = 'no';
                for (var j=0;j<pos.length;j++){ 
                    if(allpos[i].id_sales_point == pos[j].id_sales_point) pos_present = 'yes';
                }
                
                if (pos_present == 'yes') {
                    pos_seleted[i]['value'] = 1;
                    var ico_add = '<a href="#" data-url="?roadmap_id='+roadmap_id+'&sales_point_id='+allpos[i].id_sales_point+'" class="vrn-name-road-add-pos-btn" id="vrn-name-road-add-pos-radio-lnk-'+allpos[i].id_sales_point+'"><img alt="" src="css/images/vrn/forma4_1.png" id="vrn-name-road-add-pos-radio-'+allpos[i].id_sales_point+'"></a>';
                }else{ 
                    pos_seleted[i]['value'] = 0;
                    var ico_add = '<a href="#" data-url="?roadmap_id='+roadmap_id+'&sales_point_id='+allpos[i].id_sales_point+'" class="vrn-name-road-add-pos-btn" id="vrn-name-road-add-pos-radio-lnk-'+allpos[i].id_sales_point+'"><img alt="" src="css/images/vrn/forma3_1.png" id="vrn-name-road-add-pos-radio-'+allpos[i].id_sales_point+'"></a>';
                }

                code += '<li data-icon="false" id="vrn-name-road-add-pos-li-'+allpos[i].id_sales_point+'">' +
                        '   <div data-role="collapsible" data-collapsed="true" id="vrn-name-road-add-pos-li-title-'+allpos[i].id_sales_point+'">' +
                        '       <h3>' +
                        '           <a href="#">' +
                        '               <span class="vrn-name-road-add-pos-page">'+allpos[i].name+'</span>' +
                       // '             <span class="vrn-date">J -15</span>' +
                        '           </a>' +
                        '               <div class="float-right-icon">' +
                        '               ' + ico_add +
                        '               </div>' +
                        '               <div class="float-right-icon">' +
                        '                   <a href="#" data-url="?roadmap_id='+roadmap_id+'&sales_point_id='+allpos[i].id_sales_point+'" id="vrn-name-road-add-pos-detail-lnk-'+allpos[i].id_sales_point+'"><img alt="" src="css/images/vrn/forma1_4.png"></a>' +
                        '               </div>' +
                       // '               <div class="five_stars"></div>' +
                        '       </h3>' +
                        '   </div>' +
                        '   <br/>' +
                        '   <div id="vrn-name-road-add-pos-li-detail-'+allpos[i].id_sales_point+'" style="display:none;">' +
                        '           <img alt="" src="css/images/vrn/pos_icon.png">'+      
                        '           ' + allpos[i].street + ", " +allpos[i].postal_code+ " " +allpos[i].city +
                        '   </div>' +
                        '</li>';
            } 
                
            $("#vrn-roadmap-item-pos-add-list").html(code).listview('refresh');  
         
            for (var i=0;i<allpos.length;i++){ 
                
                $('#vrn-name-road-add-pos-detail-lnk-'+allpos[i].id_sales_point).unbind('tap');
                $('#vrn-name-road-add-pos-detail-lnk-'+allpos[i].id_sales_point).bind('tap', function(event){
                    var querystring = $(this).jqmData('url');
                    event.preventDefault();
                    if(querystring.indexOf('?') != -1){
                        var param_url = querystring.substring(querystring.indexOf('?')+1);
                        app.log("params : "+param_url);
                        if(param_url.indexOf('&') != -1){
                            var pus = param_url.split('&');
                            for (var i=0;i<pus.length;i++){ 
                                var pu = pus[i].split('=');
                                current_params_url[pu[0]] = pu[1];
                            }
                            app.log(current_params_url['id']);
                        }else{
                            var pu = param_url.split('=');
                            current_params_url[pu[0]] = pu[1];
                            app.log(current_params_url['id']);
                        }
                    }
                    $("#vrn-name-road-add-pos-li-detail-"+current_params_url['sales_point_id']).toggle(
/*                            function(){
                                $("#vrn-name-road-add-pos-li-"+current_params_url['sales_point_id']).css("height", "56px").trigger("refresh");
                                $("#vrn-roadmap-item-pos-add-list").listview('refresh'); 
                            },
                            function(){
                                $("#vrn-name-road-add-pos-li-"+current_params_url['sales_point_id']).css("height", "112px").trigger("refresh");
                                $("#vrn-roadmap-item-pos-add-list").listview('refresh'); 
                            }*/
                    );
                   
                });
                
                $('#vrn-name-road-add-pos-radio-lnk-'+allpos[i].id_sales_point).unbind('tap');
                $('#vrn-name-road-add-pos-radio-lnk-'+allpos[i].id_sales_point).bind('tap', function(event){
                    var querystring = $(this).jqmData('url');
                    event.preventDefault();
                    if(querystring.indexOf('?') != -1){
                        var param_url = querystring.substring(querystring.indexOf('?')+1);
                        app.log("params : "+param_url);
                        if(param_url.indexOf('&') != -1){
                            var pus = param_url.split('&');
                            for (var i=0;i<pus.length;i++){ 
                                var pu = pus[i].split('=');
                                current_params_url[pu[0]] = pu[1];
                            }
                            app.log(current_params_url['id']);
                        }else{
                            var pu = param_url.split('=');
                            current_params_url[pu[0]] = pu[1];
                            app.log(current_params_url['id']);
                        }
                    }
                    
                    controller.addRoadmapItemPosPopChangeSetectRadio(current_params_url['roadmap_id'],current_params_url['sales_point_id']);
                });
            }

        });
        
        $('#vrn-roadmap-item-pos-add-save-btn').unbind('tap');
        $('#vrn-roadmap-item-pos-add-save-btn').bind('tap', function(event){
            //alert('op: vrn-roadmap-item-pos-add-save-btn');
            for (var i=0;i<pos_seleted.length;i++){ 
                app.log('i:'+ i + ' id: '+pos_seleted[i]['id'] + ' val: '+pos_seleted[i]['value']);
                //alert(' val: '+pos_seleted[i]['value']);
                // test if item existe
                var r1 = app.repository.testRoadMapItemPos(roadmap_id,pos_seleted[i]['id'],i);
                r1.done(function(roadmap_id,sales_point_id, item_index, item_exist) {} );
                $.when(r1).done(function(roadmap_id,sales_point_id, item_index, item_exist) {
                    //alert(roadmap_id +" "+ sales_point_id+' '+item_index+ ' '+item_exist);
                    if(pos_seleted[item_index]['value'] == 1 && item_exist == 'no') {
    
                           // if(retour == "no"){
                                // id_visit, sales_point_id, roadmap_id, status_visit_id, scheduled_date, performed_date, rank, comment, local_id
                                var data = [ new Date().getTime() + i , sales_point_id, roadmap_id, 1, app.utils.convertTimestampToDateIso(new Date().getTime(),'-'), '', '0' , '' , 0, 'I' ];
                                // add in DB
                                var r3 = app.repository.addRoadMapItemPos(data);
                                r3.done(function() {} );
                                $.when(r3).done(function() {
                                    controller.showVrnRoadmapItemPage(roadmap_id);
                                    //alert('ok show...');
                                    
                                    
                                    
                                    
                                });
                           // }
   
                    }else if (pos_seleted[item_index]['value'] == 0 && item_exist == 'yes') {
                       // alert('delete:'+ roadmap_id +','+ pos_seleted[i]['id']);
                        // delete in DB
                        var r4 = app.repository.deleteRoadMapItemPos(roadmap_id,pos_seleted[item_index]['id']);
                        
                        // delete item to list
                        $('#vrn-roadmap-edit-item-'+pos_seleted[item_index]['id']).remove();
                        // refresh list
                        $("#vrn-road_closing-list").listview('refresh');
                        // close pop
                        //$('#vrn-roadmap-item-pos-delete-pop').popup('close');
                        // refresh list count
                        $('#vrn-roadmap-item-no-pdv').val( $('#vrn-road_closing-list').size() );
                        
                    }
                    
                    controller.syncUpDownData(app.log('end sync'));
                    
                });
                
			}
            $('#vrn-roadmap-item-pos-add-save-btn').unbind('tap');
        });
        
    };
    
    
    controller.addRoadmapItemPosPopChangeSetectRadio = function(roadmap_id,sales_point_id) {
        app.log(sales_point_id);
        for (var i=0;i<pos_seleted.length;i++){ 
            app.log(i + ': '+pos_seleted[i]['id'] + ' : '+pos_seleted[i]['value']);
            if(pos_seleted[i]['id'] == sales_point_id) {
                if(pos_seleted[i]['value'] == 1) {
                    pos_seleted[i]['value'] = 0;
                    $('#vrn-name-road-add-pos-radio-'+sales_point_id).attr("src", "css/images/vrn/forma3_1.png");
                    app.log(pos_seleted[i]['value']);
                }else{
                    pos_seleted[i]['value'] = 1;
                    $('#vrn-name-road-add-pos-radio-'+sales_point_id).attr("src", "css/images/vrn/forma4_1.png");
                    app.log(pos_seleted[i]['value']);
                }
            }
        }

    };
    
    
    controller.showCurrentRoadmapItemListPage = function() {
        // header et footer
        $.mobile.navigate( "#vrn-current-roadmap-item-list-page" );
        controller.showVrnHeader();
        controller.generateVrnFooter('vrn-roadmap-page');
        $("#vrn-current-roadmap-item-list-page").trigger('refresh');
        
    };
    
    var current_sp_visit_id;
    var current_current_item;
    controller.showVrnRoadmapVisitPage = function(sp_visit_id,current_item) {
        //alert("hop:"+current_params_url['current_item']);
       // alert("visit_idA:"+sp_visit_id+" - current_item:"+current_item);
        app.log("controller.showVrnRoadmapVisitPage", 'wip');

        // header et footer
        $.mobile.navigate( "#vrn-roadmap-visit-page" );
        controller.showVrnHeader();
        controller.generateVrnFooter('vrn-roadmap-visit-page');
        //$("vrn-roadmap-visit-page").trigger('refresh');
        
        current_sp_visit_id = sp_visit_id;
        current_current_item = current_item;
        
        // get active tournee data
        var r1 = app.repository.getActiveRoadmapItem();
        r1.done(function(roadmap) {
            daily_roadmap = roadmap;
        });
        
        $.when(r1).done(function(roadmap) {
            daily_roadmap = roadmap;
            //alert("current_item:"+current_item);
           // alert("visit_idC:"+current_sp_visit_id);
            // test si tournee du jour (fake pour le dev : si une tournee existe)
            var r2 = app.repository.getPosVisit(sp_visit_id);
            r2.done(function(data_r2) {
                var pos = data_r2;
            });
    
            var r3 = app.repository.getQuestionnaires(sp_visit_id);
            r3.done(function(data_r3) {
                var questionnaires = data_r3;
            });
             
            var r4 = app.repository.getStatusVisit();
            r4.done(function(data_r4) {
                var status_visit = data_r4;
            });

            $.when(r2,r3,r4).done(function(data_r2,data_r3,data_r4) {
                
                var pos = data_r2;
                var questionnaires = data_r3;
                var status_visit = data_r4;
                
                current_sp_visit_id = pos.sp_visit__id_visit;
                
                $('#vrn-form-pos-name').html(pos.name);
                            
                var code = '';
                var codeB = '';
                var nb_questionnaires_obligat = 0;
                var nb_questionnaires_obligat_valid = 0;
                for (var i=0;i<questionnaires.length;i++){ 
                    if(questionnaires[i].nb_answer == questionnaires[i].nb_question) {
                        var img = '<img class="ui-li-icon" alt="" src="css/images/vrn/forma2_4.png" style="height:69px; top:8px;">';
                        nb_questionnaires_obligat_valid++;
                    }else var img = '<img class="ui-li-icon" alt="" src="css/images/vrn/forma1_6.png" style="height:69px; top:8px;">';
                    if(questionnaires[i].nb_question_mandatory){
                        nb_questionnaires_obligat++;
                        code += '<li class="ui-corner-all" data-icon="arrow-r-white">'
                            +'        <a href="#vrn-roadmap-visit-questionnaire-page" data-url="?sp_visit_id='+sp_visit_id+'&questionnaire_id='+questionnaires[i].id_questionnaire+'" id="questionnaire_btn_'+questionnaires[i].id_questionnaire+'" id="questionnaire_btn_'+questionnaires[i].id_questionnaire+'" class="vrn-form-list-page-lnk">'
                            
                            // +'        <a href="#" data-url="?op=openPage&pageId=vrn-roadmap-visit-questionnaire-page&transition=slide&sp_visit_id='+daily_roadmap.pos_list[0].sp_visit__id_visit+'&questionnaire_id='+questionnaires[i].id_questionnaire+'" id="questionnaire_btn_'+questionnaires[i].id_questionnaire+'" class="vrn-form-list-page-lnk" data-ajax="true">'
                            +'        '+img
                            +'        <span class="vrn-qest">Questions validées <span class="bold">'+questionnaires[i].nb_answer+'/'+questionnaires[i].nb_question+'</span></span>'
                            +'        <span class="vrn-form-name">'+questionnaires[i].name+'</span>'
                            +'      </a>'
                            +'</li>';
                    }else{
                        codeB += '<li class="ui-corner-all" data-icon="arrow-r-white">'
                            +'        <a href="#vrn-roadmap-visit-questionnaire-page" data-url="?sp_visit_id='+sp_visit_id+'&questionnaire_id='+questionnaires[i].id_questionnaire+'" id="questionnaire_btn_'+questionnaires[i].id_questionnaire+'" id="questionnaire_btn_'+questionnaires[i].id_questionnaire+'" class="vrn-form-list-page-lnk">'
                            
                            //+'        <a href="#" data-url="?op=openPage&pageId=vrn-roadmap-visit-questionnaire-page&transition=slide&sp_visit_id='+daily_roadmap.pos_list[0].sp_visit__id_visit+'&questionnaire_id='+questionnaires[i].id_questionnaire+'" id="questionnaire_btn_'+questionnaires[i].id_questionnaire+'" class="vrn-form-list-page-lnk" data-ajax="true">'
                            +'        '+img
                            +'        <span class="vrn-qest">Questions validées <span class="bold">'+questionnaires[i].nb_answer+'/'+questionnaires[i].nb_question+'</span></span>'
                            +'        <span class="vrn-form-name">'+questionnaires[i].name+'</span>'
                            +'      </a>'
                            +'</li>';
                    }
                    
                }
                $("#vrn-form-list").html(code).listview('refresh');
                $("#vrn-form-optional-list").html(codeB).listview('refresh');
                
                // btn listeners
                for (var i=0;i<questionnaires.length;i++){ 
                    $('#questionnaire_btn_'+questionnaires[i].id_questionnaire).unbind('tap');
                    $('#questionnaire_btn_'+questionnaires[i].id_questionnaire).bind('tap', controller.getParamUrl );
                }
                
                var code = '<div id="vrn-circle">' +
                '    <a href="#" id="vrn-btn-close-visit">' +
                '        <div class="vrn-cloturer-circle">' +
                '            <p>' +
                '                <span class="bold">clôturer<br/>la Visite</span>' +
                '            </p>' +
                '        </div>' +
                '    </a>' +
                '    <div id="vrn-comment-cloturee-form">' +
                '        <div id="vrn-comment-cloturee">' +
                '            <div id="vrn-comment-cloturee-alert">' +
                '            Vous n\'avez pas complété toutes les rubriques !' +
                '            </div>' +
                '            <select id="vrn-comment-cloturee-type" name="vrn-comment-cloturee-type" data-icon="arrow_down" data-theme="f">' +
                '                <option value=""> Type de cloture </option>' +
                '            </select>' +
                '            <div id="vrn-comment-cloturee-title_comm">' +
                '                Commentaire de clôture' +
                '            </div>' +
                '            <textarea name="comment-cloture" id="textarea-comment-cloture"> Tapez votre commentaire...</textarea>' +
                '        </div>' +
                '        <div class="ui-grid-solo" id="ui-form-list-buttons">' +
                '            <div class="ui-block-a">' +
                '                <a href="#" id="vrn-comment-cloturee-form-cancel-button" data-role="button" data-icon="false" data-inline="true" data-theme="f">Annuler</a>' +
                '                <a href="#" id="vrn-comment-cloturee-form-valider-button" data-role="button" data-icon="arrow_right_white" data-iconpos="right" data-inline="true" data-theme="a">Valider</a>' +
                '            </div>' +
                '            <br/><br/><br/><br/><br/><br/><br/><br/>' +
                '            <div id="vrn-comment-cloturee-form-bottom"></div>' +
                '        </div>' +
                '    </div>' +
                '</div>';
                
                $('#vrn-visit-valider').html(code).trigger("create");
                $('#vrn-visit-valider').show();

                
                for (var i=0;i<status_visit.length;i++){
                    
                    if(pos.sp_visit__status_visit_id == status_visit[i].id_status_visit) var selected = " selected";
                    else if(status_visit[i].id_status_visit == 6) var selected = " selected";
                    else var selected = "";
                    
                    $('#vrn-comment-cloturee-type').append('<option value="'+status_visit[i].id_status_visit+'"'+selected+'>'+status_visit[i].name+'</option>');
                } 
                
                if(pos.sp_visit__comment != "") $('#textarea-comment-cloture').val(pos.sp_visit__comment);
                else $('#textarea-comment-cloture').val(" Tapez votre commentaire...");
                
                $('#vrn-btn-close-visit').unbind('tap');
                $('#vrn-btn-close-visit').bind('tap', function(){ 
                    
                    if(nb_questionnaires_obligat == nb_questionnaires_obligat_valid) {
                       $('#vrn-comment-cloturee-alert').show();
                       $('#textarea-comment-cloture').css('height', '107px');
                    }else{
                       $('#vrn-comment-cloturee-alert').hide();
                       $('#textarea-comment-cloture').css('height', '142px');
                    }
                    $("#vrn-visit-valider").animate({ 
                        height: "480px"
                    },
                    1000
                    );
                });
                $('#vrn-comment-cloturee-form-cancel-button').bind('tap', function(){ 
                    $("#vrn-visit-valider").animate({ 
                        height: "128px"
                    },
                    1000
                    );
                });

                $('#vrn-comment-cloturee-form-valider-button').unbind('tap');
                $('#vrn-comment-cloturee-form-valider-button').bind('tap', function(){controller.closeRoadmapVisit();});
                
            });
        
        });

    };
    
    controller.closeRoadmapVisit = function() {
        app.log("controller.closeRoadmapVisit", 'wip');
        var data = [ $('#vrn-comment-cloturee-type').val(), app.utils.convertTimestampToDateIso(new Date().getTime(),'-'), $('#textarea-comment-cloture').val(), 'U', current_sp_visit_id ];
        
        var r100 = app.repository.closeRoadmapVisit(data);
        r100.done(function(pos) {
	        controller.syncUpDownData(function (){
		        app.log('end sync');
		    
	            $.mobile.changePage("#vrn-home-page", {
	                transition:"slide",
	                changeHash:false,
	                reverse:true,
	                reload:true
	             });
			});
        });
    };
    
    
    var questionnaire;
    var questions;
    var questions_answer;
    var sp_answers;

    controller.showVrnRoadmapVisitQuestionnairePage = function(sp_visit_id, questionnaire_id) {
        app.log("controller.showVrnRoadmapVisitQuestionnairePage", 'wip');
        //alert(sp_visit_id+' : '+questionnaire_id);
        // header et footer
        $.mobile.navigate( "#vrn-roadmap-visit-questionnaire-page" );
        controller.showVrnHeader();
        controller.generateVrnFooter('vrn-roadmap-page');
        $("#vrn-roadmap-visit-questionnaire-page").trigger('refresh');
    
        current_sp_visit_id = sp_visit_id;

        var r1 = app.repository.getQuestionnaire(questionnaire_id);
        r1.done(function(data_r1) {
            questionnaire = data_r1;
        });
        
        var r2 = app.repository.getQuestionnaireQuestions(questionnaire_id);
        r2.done(function(data_r2) {
            questions = data_r2;
        });

        // question_answer...
        var r3 = app.repository.getQuestionnaireQuestionsAnswer(questionnaire_id);
        r3.done(function(data_r3) {
            questions_answer = data_r3;
        });
        
        // sp_answer...
        var r4 = app.repository.getQuestionnaireSpAnswer(sp_visit_id,questionnaire_id);
        r4.done(function(data_r4) {
            sp_answers = data_r4;
        });
        
        $.when(r1, r2, r3, r4).done(function(data_r1, data_r2, data_r3, data_r4) {
            
            questionnaire = data_r1;
            questions = data_r2;
            questions_answer = data_r3;
            sp_answers = data_r4;
    
            $('#vrn-questionn-text').html("<p>QUESTIONNAIRE<br/>"+questionnaire.name+"</p>");
            
            var num_question = 0;
            
            var code = '';
            for (var i=0;i<questions.length;i++){ 
                num_question++;
                code += '<div class="quest-fieldset">'
                     +'  <div class="ui-grid-solo">';
                  
                if(questions[i].question_type == "list"){
                    code += '<div class="ui-grid-solo">'
                        +'      <div class="ui-block-a">'
                        +'          <span class="bold_black_color">'+num_question+'.</span><span class="vrn-question-text"><span class="bold">'+questions[i].label+'</span>'
                        +'          <select id="select-choice-'+questions[i].id_question+'" name="select-choice-'+questions[i].id_question+'" data-icon="arrow_down">'
                        +'              <option value="">Sélectionner une réponse';
                        for (var j=0;j<questions_answer.length;j++){
                            if(questions_answer[j].question_id==questions[i].id_question){
                                var val_select = "";
                                for (var k=0;k<sp_answers.length;k++){
                                    if(sp_answers[k].question_id == questions[i].id_question && sp_answers[k].answer_id == questions_answer[j].id_answer) val_select = " selected";
                                }
                                code += '          <option value="'+questions_answer[j].id_answer+'" '+val_select+'> '+questions_answer[j].label+' </option>';
                            }
                        }
                        code += '          </select>'
                        +'      </div>'
                        +'</div>'; 
                }else if(questions[i].question_type == "check"){
                    code += '   <div class="ui-block-a">'
                        +'      <span class="bold_black_color">'+num_question+'.</span><span class="vrn-question-text"><span class="bold">'+questions[i].label+'</span>'
                        +'   </div>'
                        +'   <div class="ui-grid-a">'
                        +'      <fieldset data-role="controlgroup" class="quest-fieldset-rad">';
                        for (var j=0;j<questions_answer.length;j++){
                            if(questions_answer[j].question_id==questions[i].id_question){
                                var val_select = "";
                                for (var k=0;k<sp_answers.length;k++){
                                    if(sp_answers[k].question_id == questions[i].id_question && sp_answers[k].answer_id == questions_answer[j].id_answer) val_select = " checked";
                                }
                                code += '          <input type="radio" name="radio-choice-'+questions[i].id_question+'" id="radio-choice-'+questions[i].id_question+'-'+questions_answer[j].id_answer+'" value="'+questions_answer[j].id_answer+'" '+val_select+' />'
                                +'          <label for="radio-choice-'+questions[i].id_question+'-'+questions_answer[j].id_answer+'">'+questions_answer[j].label+'</label>';
                            }
                        }
                        +'      </fieldset>'
                        +'  </div>';                    
                }else if(questions[i].question_type == "text"){
                    var val_text = "Tapez votre commentaire... ";
                    for (var k=0;k<sp_answers.length;k++){
                        if(sp_answers[k].question_id == questions[i].id_question) val_text = sp_answers[k].answer;
                    }
                    code += '   <div class="ui-grid-solo">'
                        +'      <span class="bold_black_color">'+num_question+'.</span><span class="vrn-question-text"><span class="bold">'+questions[i].label+'</span>'
                        +'  </div>'
                        +'  <textarea name="text-'+questions[i].id_question+'" id="text-'+questions[i].id_question+'" data-theme="customize_textarea" rows="1"> '+val_text+'   </textarea>';
                }else if(questions[i].question_type == "satisfaction"){
                    var slider_value = "O";
                    for (var k=0;k<sp_answers.length;k++){
                        if(sp_answers[k].question_id == questions[i].id_question) slider_value = sp_answers[k].answer;
                    }
                    code += '   <div class="ui-grid-solo">'
                        +'      <div class="ui-block-a">'
                        +'          <span class="bold_black_color">'+num_question+'.</span><span class="vrn-question-text"><span class="bold">'+questions[i].label+'</span>'
                        +'      </div>'
                        +'  </div>'

                        +'  <div data-role="rangeslider">'
                        +'    <div data-role="fieldcontain">'
                        +'    <label for="slider-3">Input slider:</label>'
                        +'    <input type="range" name="slider-'+questions[i].id_question+'" id="slider-'+questions[i].id_question+'" value="'+slider_value+'" min="0" max="100" data-theme="a" data-track-theme="b" />'
                        +'    </div>'
                        +'  </div>';
                }
 
                code += '  </div>';
                code += '</div>';   
            }
 
            
            code += '<div class="ui-grid-solo" id="vrn-question-grid">'
                +'  <div class="ui-block-a">'
                +'    <a href="#" id="vrn-question-valider-button" data-role="button" data-icon="triangle_right_black_image" data-iconpos="right" data-inline="true">valider</a>'
                +'  </div>'
                +'</div>'
                +'<br/><br/><br/><br/><br/><br/><br/>';
            
            
            $("#vrn-questionnaire").html(code).trigger('create');
            $(".ui-block-a").trigger('create');
            $(".ui-grid-a").trigger('create');
            $(".quest-fieldset-rad").trigger('create');

            $('#vrn-question-valider-button').unbind('tap');
            $('#vrn-question-valider-button').bind('tap',function (event){
                controller.showRoadmapItemPosFormItemSave(event);
            });

        });

    };

    
    
    // Questions answers :save
    controller.showRoadmapItemPosFormItemSave = function(event) {
        app.log("controller.showRoadmapItemPosFormItemSave : " , 'wip');
        
        var form_statut = "ok";
        var message = "";
        var sp_visit;
        
        
        // get sp_visit infos
        var r1 = app.repository.getPosVisit(current_sp_visit_id);
        r1.done(function(data_r1) {
            sp_visit = data_r1;
        });
        
        //reset questionnaire answers
        var r2 = app.repository.resetQuestionnaireSpAnswer(current_sp_visit_id,questionnaire.id_questionnaire);
        r2.done(function() {});
        $.when(r1, r2).done(function(data_r1) {
            sp_visit = data_r1;
            
            // prepa de la save dynamique
            for (var i=0;i<questions.length;i++){ 
                if(questions[i].question_type == "list"){
    
                    // si obligatoire
                    //message += "Le champs \""+questions[i].label+"\" ne peut être vide.<br>";
                    //form_statut = "non ok";
                    
                    // get label anwser
                    var text_answer = "";
                    for (var j=0;j<questions_answer.length;j++){
                        if(questions_answer[j].id_answer == $("#select-choice-"+questions[i].id_question).val()){
                            text_answer = questions_answer[j].label;
                        }
                    }
                   // alert('quest:'+questions[i].id_question+' - rep:'+$("#select-choice-"+questions[i].id_question).val());
                    var data = [ sp_visit.id_sales_point , current_sp_visit_id, questionnaire.id_questionnaire, questions[i].id_question, $("#select-choice-"+questions[i].id_question).val(), text_answer, app.utils.convertTimestampToDateIso(new Date(),'/'), 'I' ];
                    var rsql = app.repository.addQuestionnaireSpAnswer(data);
                    rsql.done(function() {});
                    
    
                }else if(questions[i].question_type == "check"){
                    // si obligatoire
                    //message += "Le champs \""+questions[i].label+"\" ne peut être vide.<br>";
                    //form_statut = "non ok";
                    
                    
                    // get label anwser
                    var text_answer = "";
                    for (var j=0;j<questions_answer.length;j++){
                        if(questions_answer[j].id_answer == $("[name='radio-choice-"+questions[i].id_question+"']:checked").val()){
                            text_answer = questions_answer[j].label;
                        }
                    }
                    //alert('quest:'+questions[i].id_question+' - rep:'+$("[name='radio-choice-"+questions[i].id_question+"']:checked").val());
                    var data = [ sp_visit.id_sales_point , current_sp_visit_id, questionnaire.id_questionnaire, questions[i].id_question, $("[name='radio-choice-"+questions[i].id_question+"']:checked").val(), text_answer, app.utils.convertTimestampToDateIso(new Date(),'/'), 'I' ];
                    var rsql = app.repository.addQuestionnaireSpAnswer(data);
                    rsql.done(function() {});
                 
                    
                }else if(questions[i].question_type == "text"){
                    // si obligatoire
                    //message += "Le champs \""+questions[i].label+"\" ne peut être vide.<br>";
                    //form_statut = "non ok";
                    
                    //alert('quest:'+questions[i].id_question+' - rep:'+$("#text-"+questions[i].id_question).val());
                    var data = [ sp_visit.id_sales_point , current_sp_visit_id, questionnaire.id_questionnaire, questions[i].id_question, 0, $("#text-"+questions[i].id_question).val(), app.utils.convertTimestampToDateIso(new Date(),'/'), 'I' ];
                    var rsql = app.repository.addQuestionnaireSpAnswer(data);
                    rsql.done(function() {});
                }else if(questions[i].question_type == "satisfaction"){
                    // si obligatoire
                    //message += "Le champs \""+questions[i].label+"\" ne peut être vide.<br>";
                    //form_statut = "non ok";
                    
                   // alert('quest:'+questions[i].id_question+' - rep:'+$("#slider-"+questions[i].id_question).val());
                    var data = [ sp_visit.id_sales_point , current_sp_visit_id, questionnaire.id_questionnaire, questions[i].id_question, 0, $("#slider-"+questions[i].id_question).val(), app.utils.convertTimestampToDateIso(new Date(),'/'), 'I' ];
                    var rsql = app.repository.addQuestionnaireSpAnswer(data);
                    rsql.done(function() {});
                }
                
                // todo text and slider + Save to sqlite :)
                
            }

            
            
            current_params_url = [];
            current_params_url['id_parent'] = "vrn-roadmap-visit-page";
            current_params_url['sp_visit_id'] = current_sp_visit_id;
            current_params_url['current_item'] = current_current_item;
           // alert('changepage');
            $.mobile.changePage("#vrn-roadmap-visit-page", {
                transition:"slide",
                changeHash:false,
                reverse:true
             });
           // alert('changepage');
            
            if(form_statut == "ok"){
                
                
            }else{
                // return error pop
                $('#vrn-form-item-error-popup').popup();
                //$('#vrn-form-item-error-popup').height (screen.height - 50);
                //$('#vrn-form-item-error-popup').width (screen.width - 50);
                $("#vrn-form-item-error-popup-content").children("[class='ui-title']").html(message).trigger('create');
                $('#vrn-form-item-error-popup').popup('open');
            }
            
           // $('#vrn-question-valider-button').click();
            /*
            $('#vrn-lancer').bind('tap', function (event){
                current_params_url = [];
                current_params_url['id_parent'] = "vrn-roadmap-visit-page";
                current_params_url['sp_visit_id'] = daily_roadmap.pos_list[current_item].sp_visit__status_visit_id;
                current_params_url['current_item'] = current_item;
                current_params_url['roadmap_id'] = daily_roadmap.pos_list[current_item].roadmap_id;
                current_params_url['sales_point_id'] = daily_roadmap.pos_list[current_item].id_sales_point;
            });
            */
            
        });
    };

    // roadmap detail : pos : pos form
    controller.showRoadmapItemPosEditPage = function(id_roadmap, id_sales_point) {  
        app.log("controller.showRoadmapItemPosEditPage : "+id_roadmap+" : "+id_sales_point , 'wip');
        
        $.mobile.navigate( "#vrn-roadmap-item-pos-edit-page" );
        controller.showVrnHeader();
        controller.generateVrnFooter('vrn-roadmap-page');
        
        var sp_types;
        var frequencies;
        var microzones;
        var pos;
        
        
        //alert(id_sales_point);
        var pos_id = id_sales_point;
        var r1 = app.repository.getPosTypes();
        r1.done(function(spt) {
            sp_types = spt;
            //alert("sp_types:"+sp_types.length);
        });    
        var r2 = app.repository.getFrequencies();
        r2.done(function(f) {
            frequencies = f;
        });
        var r3 = app.repository.getMicroZones();
        r3.done(function(mzs) {
            microzones = mzs;
        });
        var r4 = app.repository.getPosItem(id_sales_point);
        r4.done(function(p) {
            pos = p;
        });
        $.when(r1, r2, r3, r4).done(function() { 
          /*  sp_types = spt;
            frequencies = f;
            microzones = mzs;
            pos = p;*/
            //alert("uu:"+pos.id_sales_point);
        
            $("#vrn-roadmap-item-pos-edit-title").html("MODIFIER UN POINT DE VENTE");
            $("#vrn-roadmap-item-pos-id").val(pos.id_sales_point);
            if(pos.sync_status == "I") $("#vrn-roadmap-item-pos-sync-status").val('I');
            else $("#vrn-roadmap-item-pos-sync-status").val('U');
            $("#vrn-roadmap-item-pos-name").val(pos.name); 
            var select = $('#vrn-roadmap-item-pos-type');
            if(select.prop) {
              var options = select.prop('options');
            }else {
              var options = select.attr('options');
            }
            $('option', select).remove();
            for (var i=0;i<sp_types.length;i++){ 
                options[options.length] = new Option(sp_types[i].name,sp_types[i].id_type);
            }
            select.val(pos.type_id);           
            $("#vrn-roadmap-item-pos-street").val(pos.street); 
            $("#vrn-roadmap-item-pos-cp").val(pos.postal_code); 
            $("#vrn-roadmap-item-pos-city").val(pos.city); 
            $("#vrn-roadmap-item-pos-contact-name").val(pos.contact_name); 
            $("#vrn-roadmap-item-pos-telephone").val(pos.phone_number); 
            $("#vrn-roadmap-item-pos-mail").val(pos.email); 
            $("#vrn-roadmap-item-pos-descriptif").val(pos.description); 
            $("#vrn-roadmap-item-pos-gps_latitude").val(pos.gps_latitude); 
            $("#vrn-roadmap-item-pos-gps_longitude").val(pos.gps_longitude); 
            var selectb = $('#vrn-roadmap-item-pos-frequency');
            if(selectb.prop) {
              var options = selectb.prop('options');
            }else {
              var options = selectb.attr('options');
            }
            $('option', selectb).remove();
            for (var i=0;i<frequencies.length;i++){ 
                options[options.length] = new Option(frequencies[i].label,frequencies[i].id_frequency);
            }
            selectb.val(pos.frequency_id);           
            var selectc = $('#vrn-roadmap-item-pos-microzone');
            if(selectc.prop) {
              var options = selectc.prop('options');
            }else {
              var options = selectc.attr('options');
            }
            $('option', selectc).remove();
            for (var i=0;i<microzones.length;i++){ 
                options[options.length] = new Option(microzones[i].name,microzones[i].id_item);
            }
            selectb.val(pos.microzone_id);           
            
        //    Manque les champs suivant :
        //    results.rows.item(i).last_visit_id,
        //    results.rows.item(i).local_id
         

        });
        
        $('#vrn-roadmap-item-pos-edit-enregistrer-button').unbind('tap');
        $('#vrn-roadmap-item-pos-edit-enregistrer-button').bind('tap',function (event){
            controller.RoadmapItemPosSave(event,id_roadmap,id_sales_point);
        });
        
    };
    
    // roadmap detail : pos : edit pos save
    controller.RoadmapItemPosSave = function(event,id_roadmap,id_sales_point) {
        app.log("controller.editPosSave : " , 'wip');
        
        var form_statut = "ok";
        var message = "";
        if($('#vrn-roadmap-item-pos-name').val() == ""){
            message += "Le champs \"nom\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        if($('#vrn-roadmap-item-pos-street').val() == ""){
            message += "Le champs \"adresse\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        if($('#vrn-roadmap-item-pos-cp').val() == ""){
            message += "Le champs \"code postal\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        if($('#vrn-roadmap-item-pos-city').val() == ""){
            message += "Le champs \"ville\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        if($('#vrn-pos-contact-name').val() == ""){
            message += "Le champs \"nom du contact\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        if($('#vrn-roadmap-item-pos-telephone').val() == ""){
            message += "Le champs \"téléphone\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        if($('#vrn-roadmap-item-pos-email').val() == ""){
            message += "Le champs \"email\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        app.log(message , 'wip');
        
        if(form_statut == "ok"){
            var data = [ $('#vrn-roadmap-item-pos-id').val(), $('#vrn-roadmap-item-pos-name').val(), $('#vrn-roadmap-item-pos-street').val(), $('#vrn-roadmap-item-pos-cp').val(), $('#vrn-roadmap-item-pos-city').val(), $('#vrn-roadmap-item-pos-contact-name').val(), $('#vrn-roadmap-item-pos-email').val(), $('#vrn-roadmap-item-pos-telephone').val(), $('#vrn-roadmap-item-pos-type').val() , localStorage.getItem( "current_user_id"), $('#vrn-roadmap-item-pos-description').val(), $('#vrn-roadmap-item-pos-gps_latitude').val(), $('#vrn-roadmap-item-pos-gps_longitude').val(), $('#vrn-roadmap-item-pos-microzone').val(), $('#vrn-roadmap-item-pos-frequency').val() , 0, $('#vrn-roadmap-item-pos-sync-status').val(), $('#vrn-roadmap-item-pos-id').val() ];
            var r1 = app.repository.editPosSave(data);
            r1.done(function(pos) {
            
                controller.syncUpDownData(function (){
                    app.log('end sync');
                
                    $.mobile.changePage("#vrn-roadmap-item-page", {
	                    transition:"slide",
	                    changeHash:false,
	                    reverse:false,
	                    reload:true
                 	});
                });
            
            
               
            });
            
            
            
        }else{
            // return error pop
            $('#vrn-roadmap-item-pos-edit-error-popup').popup();
            $("#vrn-roadmap-item-pos-edit-error-popup-content").children("[class='ui-title']").html(message).trigger('create');
            $('#vrn-roadmap-item-pos-edit-error-popup').popup('open');
        }
    };
    
      ////////////////////
     // ==>   POS   == //
    ////////////////////
    controller.showVrnPosPage = function(e,data) {
        app.log("controller.showVrnPosPage", 'wip');

        var show_status = "off";
        var pos_filter_list;
        var pos;
        
        // header et footer
        $.mobile.navigate( "#vrn-pos-page" );
        controller.showVrnHeader();
        controller.generateVrnFooter('vrn-pos-page');
        $("#vrn-pos-page").trigger('refresh');
        
        
        
        // get POS filter list
        
        
        
        var r1 = app.repository.getPosFilterList(localStorage.getItem( "current_user_id" ));//app.loggedUser.id
        r1.done(function(filter_list) {
            pos_filter_list = filter_list;
            // Todo : mettre dans l'ordre :)
            
        });
        
        // get POS list
        var r2 = app.repository.getPosList(localStorage.getItem( "current_user_id" ));//app.loggedUser.id
        r2.done(function(pos_list) {
            pos = pos_list;
        });

        // final execute
        $.when(r1, r2).done(function(filter_list, pos_list) {
            pos_filter_list = filter_list;
            pos = pos_list;
            var code = '';
            for (var i=0;i<pos.length;i++){ 
                if(pos[i].last_visit_id != 0) var last_visit_id = 'Dernière visite <span class="bold">'+pos[i].last_visit_id+'</span>';
                else var last_visit_id = '';
                code += '<li data-icon="arrow-r2">'
                +'    <a href="#vrn-pos-detail-pop" data-url="?id_parent_pop=vrn-pos-detail-pop&id='+pos[i].id_sales_point+'" id="pos_btn_'+pos[i].id_sales_point+'" data-transition="pop" data-rel="popup">'
                +'        <img class="ui-li-icon" alt="" src="css/images/vrn/forma1.png" style="top:8px;">'
                +'        <span  class="date">'+last_visit_id+'</span>'
                +'        <span class="vrn-name">'+pos[i].name+'</span> '
                +'        <span class="type">- '+pos[i].type_name+'</span> '
                +'    </a>'
                +'</li>';   
            }
            $("#vrn-pos-list").html(code).listview('refresh');
            
            // btn listeners
            for (var i=0;i<pos.length;i++){ 
                $('#pos_btn_'+pos[i].id_sales_point).unbind('tap');
                $('#pos_btn_'+pos[i].id_sales_point).bind('tap', controller.getParamUrl );
            }
            
            $("#vrn-create-pos-button").unbind('tap');
            $("#vrn-create-pos-button").bind('tap', controller.getParamUrl );
           
        });


    };
    
    controller.showVrnPosDetailPop = function(sales_point_id) {
        app.log("controller.showVrnPosDetailPop : "+sales_point_id , 'wip');

        // get POS item
        var r1 = app.repository.getPosItem(sales_point_id);
        r1.done(function(pos) {
            //alert('retour data : '+ pos.description);
            if(pos.last_visit_id == 0){
                $("#vrn-pos-detail-visite").html('');
                $("#vrn-pos-detail-text").html('');
            }else{
                $("#vrn-pos-detail-visite").html('Dernière visite');
                $("#vrn-pos-detail-text").html(pos.last_visit_id);
            }
            $("#vrn-pos-detail-top-left").html(pos.name);
            $('#vrn-pos-detail-address').html("<img src=\"./css/images/vrn/forma2_3.png\">"+ pos.street +", "+ pos.postal_code + " " + pos.city);
            $('#vrn-pos-detail-seller-name').html("<img src=\"./css/images/vrn/forma2_3.png\">"+pos.contact_name);
            $('#vrn-pos-detail-tel').html("<option value=\""+pos.phone_number+"\" selected> "+pos.phone_number+" </option>");
            $('#vrn-pos-detail-tel')[0].selectedIndex = 0;
            $('#vrn-pos-detail-tel').selectmenu("refresh");
            $('#vrn-pos-detail-email').html("<option value=\""+pos.email+"\" selected> "+pos.email+" </option>");
            $('#vrn-pos-detail-email')[0].selectedIndex = 0;
            $('#vrn-pos-detail-email').selectmenu("refresh");
            $('#vrn-pos-detail-description').html(pos.description);
            $('#vrn-pos-detail-map-btn').attr("data-url", "?id_parent_pop=vrn-pos-map-pop&sales_point_id="+sales_point_id+"&gps_latitude="+pos.gps_latitude+"&gps_longitude="+pos.gps_longitude+"");
            $('#vrn-pos-detail-button').attr("data-url", "?id_parent=vrn-pos-edit-page&sales_point_id="+sales_point_id+"");

            // btn listeners
            $('#vrn-pos-detail-appeler-button').unbind('tap');
            $('#vrn-pos-detail-appeler-button').bind('tap',function (event){
                controller.callPhone($('#vrn-pos-identity-tel').find(":selected").val());
            });
            
            $('#vrn-pos-detail-send-button').unbind('tap');
            $('#vrn-pos-detail-send-button').bind('tap',function (event){
                controller.sendAMail($('#vrn-pos-identity-email').find(":selected").val());
            });
            
            $('#vrn-pos-detail-map-btn').unbind('tap');
            $('#vrn-pos-detail-map-btn').bind('tap', function (event){
                current_params_url = [];
                current_params_url['id_parent_pop'] = "vrn-pos-map-pop";
                current_params_url['sales_point_id'] = sales_point_id;
                current_params_url['gps_latitude'] = pos.gps_latitude;
                current_params_url['gps_longitude'] = pos.gps_longitude;
            });
            
            $('#vrn-pos-detail-button').unbind('tap');
            $('#vrn-pos-detail-button').bind('tap', function (event){
                current_params_url = [];
                current_params_url['id_parent'] = "vrn-pos-edit-page";
                current_params_url['sales_point_id'] = sales_point_id;
            });
            
        });

    };

    
    controller.showVrnPosMapPop = function(sales_point_id, gps_latitude, gps_longitude) {
        app.log("controller.showVrnPosMapPop : "+sales_point_id , 'wip');
        var w = (screen.width - 200);
        var h = (screen.height - 200);
        $('#vrn-pos-map-pop').css("width", w+"px");
        $('#vrn-pos-map-pop').css("height", h+"px");
        $('#vrn-pos-map-pop').trigger("refresh");
        $('#vrn-pos-map-content').css("width", (w-30)+"px");
        $('#vrn-pos-map-content').css("height", (h-99)+"px");
        $('#vrn-pos-map-content').trigger("refresh");
        if(gps_latitude != '') var lat = gps_latitude;
        else var lat = 48.826464;
        if(gps_longitude != '') var lng = gps_longitude;
        else var lng = 2.3204027;
        var latlng = new google.maps.LatLng (lat, lng);
        var options = { 
            zoom : 15, 
            center : latlng, 
            mapTypeId : google.maps.MapTypeId.ROADMAP 
        };
        var $content = $("#vrn-pos-map-content");
        var map = new google.maps.Map ($content[0], options);
        new google.maps.Marker ({ 
            map : map, 
            animation : google.maps.Animation.DROP,
            position : latlng  
        }); 
    };
    
    // pos : pos form
    controller.showVrnPosEditPage = function(sales_point_id) {  
        app.log("controller.showVrnPosEditPage : "+sales_point_id , 'wip');

        controller.showVrnHeader();
        controller.generateVrnFooter('vrn-pos-page');
        
        //alert(sales_point_id);
        var pos_id = sales_point_id;
        var r1 = app.repository.getPosTypes();
        r1.done(function(spt) {
            var sp_types = spt;
        });    
        var r2 = app.repository.getFrequencies();
        r2.done(function(f) {
            var frequencies = f;
        });
        var r3 = app.repository.getMicroZones();
        r3.done(function(mzs) {
            var microzones = mzs;
        });
        
        $.when(r1, r2, r3).done(function(sp_types, frequencies, microzones) {    
            if(pos_id == 0) {
                $("#vrn-pos-edit-title").html("CRÉER UN POINT DE VENTE");
                $("#vrn-pos-id").val("0");
                $("#vrn-pos-sync-status").val('I');
                $("#vrn-pos-name").val("");
                var select = $('#vrn-pos-type');
                if(select.prop) {
                  var options = select.prop('options');
                }else {
                  var options = select.attr('options');
                }
                $('option', select).remove();
                options[0] = new Option("Type de point de vente","");
                for (var i=0;i<sp_types.length;i++){ 
                    options[options.length] = new Option(sp_types[i].name,sp_types[i].id_type);
                }
                $("#vrn-pos-street").val(""); 
                $("#vrn-pos-cp").val(""); 
                $("#vrn-pos-city").val(""); 
                $("#vrn-pos-contact-name").val(""); 
                $("#vrn-pos-telephone").val(""); 
                $("#vrn-pos-email").val(""); 
                $("#vrn-pos-description").val("Description");
                $("#vrn-pos-gps_latitude").val(); 
                $("#vrn-pos-gps_longitude").val(); 
                var selectb = $('#vrn-pos-frequency');
                if(selectb.prop) {
                  var options = selectb.prop('options');
                }else {
                  var options = selectb.attr('options');
                }
                $('option', selectb).remove();
                options[0] = new Option("Fréquence","");
                for (var i=0;i<frequencies.length;i++){ 
                    options[options.length] = new Option(frequencies[i].label,frequencies[i].id_frequency);
                }
                var selectc = $('#vrn-pos-microzone');
                if(selectc.prop) {
                  var options = selectc.prop('options');
                }else {
                  var options = selectc.attr('options');
                }
                $('option', selectc).remove();
                options[0] = new Option("Microzone du point de vente","");
                for (var i=0;i<microzones.length;i++){ 
                    options[options.length] = new Option(microzones[i].name,microzones[i].id_item);
                }
            }else{
                var r4 = app.repository.getPosItem(sales_point_id);
                r4.done(function(pos) {
                    $("#vrn-pos-edit-title").html("MODIFIER UN POINT DE VENTE");
                    $("#vrn-pos-id").val(pos.id_sales_point);
                    if(pos.sync_status == "I") $("#vrn-pos-sync-status").val('I');
                    else $("#vrn-pos-sync-status").val('U');
                    $("#vrn-pos-name").val(pos.name); 
                    var select = $('#vrn-pos-type');
                    if(select.prop) {
                      var options = select.prop('options');
                    }else {
                      var options = select.attr('options');
                    }
                    $('option', select).remove();
                    for (var i=0;i<sp_types.length;i++){ 
                        options[options.length] = new Option(sp_types[i].name,sp_types[i].id_type);
                    }
                    select.val(pos.type_id);           
                    $("#vrn-pos-street").val(pos.street); 
                    $("#vrn-pos-cp").val(pos.postal_code); 
                    $("#vrn-pos-city").val(pos.city); 
                    $("#vrn-pos-contact-name").val(pos.contact_name); 
                    $("#vrn-pos-telephone").val(pos.phone_number); 
                    $("#vrn-pos-email").val(pos.email); 
                    $("#vrn-pos-description").val(pos.description); 
                    $("#vrn-pos-gps_latitude").val(pos.gps_latitude); 
                    $("#vrn-pos-gps_longitude").val(pos.gps_longitude); 
                    var selectb = $('#vrn-pos-frequency');
                    if(selectb.prop) {
                      var options = selectb.prop('options');
                    }else {
                      var options = selectb.attr('options');
                    }
                    $('option', selectb).remove();
                    for (var i=0;i<frequencies.length;i++){ 
                        options[options.length] = new Option(frequencies[i].label,frequencies[i].id_frequency);
                    }
                    selectb.val(pos.frequency_id);           
                    var selectc = $('#vrn-pos-microzone');
                    if(selectc.prop) {
                      var options = selectc.prop('options');
                    }else {
                      var options = selectc.attr('options');
                    }
                    $('option', selectc).remove();
                    for (var i=0;i<microzones.length;i++){ 
                        options[options.length] = new Option(microzones[i].name,microzones[i].id_item);
                    }
                    selectb.val(pos.microzone_id);           
                    
                    /*
                    Manque les champs suivant :
                    results.rows.item(i).last_visit_id,
                    results.rows.item(i).local_id
                    */
    
                });
            }
        });
        
        $('#vrn-pos-edit-enregistrer-button').unbind('tap');
        $('#vrn-pos-edit-enregistrer-button').bind('tap',function (event){
            controller.PosSave(event,sales_point_id);
        });
    };
    
    // pos : edit pos save
    controller.PosSave = function(event,sales_point_id) {
        if(sales_point_id == 0) app.log("controller.addPosSave : " , 'wip');
        else app.log("controller.editPosSave : " , 'wip');
        var eve = new Date().getTime()+"";
        eve = eve.substr(4);
        var form_statut = "ok";
        var message = "";
        if($('#vrn-pos-name').val() == ""){
            message += "Le champs \"nom\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        if($('#vrn-pos-street').val() == ""){
            message += "Le champs \"adresse\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        if($('#vrn-pos-cp').val() == ""){
            message += "Le champs \"code postal\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        if($('#vrn-pos-city').val() == ""){
            message += "Le champs \"ville\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        if($('#vrn-pos-contact-name').val() == ""){
            message += "Le champs \"nom du contact\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        if($('#vrn-pos-telephone').val() == ""){
            message += "Le champs \"téléphone\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        if($('#vrn-pos-email').val() == ""){
            message += "Le champs \"email\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        app.log(message , 'wip');
        
        if(form_statut == "ok"){
            if(sales_point_id == 0) {
                var data = [ eve, $('#vrn-pos-name').val(), $('#vrn-pos-street').val(), $('#vrn-pos-cp').val(), $('#vrn-pos-city').val(), $('#vrn-pos-contact-name').val(), $('#vrn-pos-email').val(), $('#vrn-pos-telephone').val(), $('#vrn-pos-type').val() , localStorage.getItem( "current_user_id"), $('#vrn-pos-description').val(), $('#vrn-pos-gps_latitude').val(), $('#vrn-pos-gps_longitude').val(), $('#vrn-pos-microzone').val(), 0,  $('#vrn-pos-frequency').val() , 0, $('#vrn-pos-sync-status').val() ];
                var r1 = app.repository.addPosSave(data);
            }else {
                var data = [ $('#vrn-pos-id').val(), $('#vrn-pos-name').val(), $('#vrn-pos-street').val(), $('#vrn-pos-cp').val(), $('#vrn-pos-city').val(), $('#vrn-pos-contact-name').val(), $('#vrn-pos-email').val(), $('#vrn-pos-telephone').val(), $('#vrn-pos-type').val() , localStorage.getItem( "current_user_id"), $('#vrn-pos-description').val(), $('#vrn-pos-gps_latitude').val(), $('#vrn-pos-gps_longitude').val(), $('#vrn-pos-microzone').val(), $('#vrn-pos-frequency').val() , 0, $('#vrn-pos-sync-status').val(), $('#vrn-pos-id').val() ];
                var r1 = app.repository.editPosSave(data);
            }
            
            r1.done(function(pos) {
                controller.syncUpDownData(function (){
                    app.log('end sync');
                
                    $.mobile.changePage("#vrn-pos-page", {
                         transition:"slide",
                         changeHash:false,
                         reverse:false,
                         reload:true
                      });
                 });
            });
            

        }else{
            // return error pop
            $('#vrn-pos-edit-error-popup').popup();
            //$('#vrn-pos-edit-error-popup').height (screen.height - 50);
            //$('#vrn-pos-edit-error-popup').width (screen.width - 50);
            $("#vrn-pos-edit-error-popup-content").children("[class='ui-title']").html(message).trigger('create');
            $('#vrn-pos-edit-error-popup').popup('open');
        }
        
    };
    
    ///////////////////////
    // ==>   STATS   == //
   //////////////////////
    
    controller.showVrnStatsSemainePage = function() {
       app.log("controller.showVrnStatsSemainePage", 'wip');
        // header et footer
        $.mobile.navigate( "#vrn-stats-semaine-page" );
        controller.showVrnHeader();
        controller.generateVrnFooter('vrn-stats-page');
        $("#vrn-stats-semaine-page").trigger('refresh');

        timerSeconds = /*$('input[type=text]#watch').val();*/ 10;
        timerCurrent = 0;
        timerFinish = new Date().getTime()+(timerSeconds*1000);
        timer = setInterval('stopWatch()',50);
        // }else{
        //$('input[type=button]#watch').val('Start');
        // clearInterval(timer);
        // }
        // });
        $('input[type=button]#watch').click();

        // create the new object, add options, and start the animation with desired percentage
        var canvas = document.getElementById("myCanvas_semaine");
        new AnimationRectangle({
            'canvas': canvas,
            'width': canvas.width,
            'height': canvas.height,
            'radius': 100,
            'linewidth': 10,        
            'interval': 20,
            'step': 1,
            'backcolor': '#666',
            'fillcolor': '#6d6f71'
        }).start(100);
        
    
        // create the new object, add options, and start the animation with desired percentage
        var canvas = document.getElementById("circle_semaine");
        new AnimationCircle({
            'canvas': canvas,
            'width': canvas.width-115,
            'height': canvas.height-115,
            'radius': 90,
            'linewidth': 5,        
            'interval': 20,
            'step': 1,
            'circlecolor': 'transparent',
            'fillcolor': '#696a6c'
        }).start( 70 );
        

        
    };


    controller.showVrnStatsMoisPage = function() {
       app.log("controller.showVrnStatsMoisPage", 'wip');
        // header et footer
        $.mobile.navigate( "#vrn-stats-mois-page" );
        controller.showVrnHeader();
        controller.generateVrnFooter('vrn-stats-page');
        $("#vrn-stats-mois-page").trigger('refresh');
        
        // create the new object, add options, and start the animation with desired percentage
        var canvas = document.getElementById("myCanvas_mois");
        new AnimationRectangle({
            'canvas': canvas,
            'width': canvas.width,
            'height': canvas.height,
            'radius': 100,
            'linewidth': 10,        
            'interval': 20,
            'step': 1,
            'backcolor': '#666',
            'fillcolor': '#6d6f71'
        }).start(100);   
        
        // create the new object, add options, and start the animation with desired percentage
        var canvas = document.getElementById("circle_mois");
        new AnimationCircle({
            'canvas': canvas,
            'width': canvas.width-115,
            'height': canvas.height-115,
            'radius': 90,
            'linewidth': 5,        
            'interval': 20,
            'step': 1,
            'circlecolor': 'transparent',
            'fillcolor': '#696a6c'
        }).start( 70 );
        
    };
    

    controller.showVrnStatsAnneePage = function() {
       app.log("controller.showVrnStatsAnneePage", 'wip');
        // header et footer
        $.mobile.navigate( "#vrn-stats-annee-page" );
        controller.showVrnHeader();
        controller.generateVrnFooter('vrn-stats-page');
        $("#vrn-stats-annee-page").trigger('refresh');
        
        // create the new object, add options, and start the animation with desired percentage
        var canvas = document.getElementById("myCanvas_annee");
        new AnimationRectangle({
            'canvas': canvas,
            'width': canvas.width,
            'height': canvas.height,
            'radius': 100,
            'linewidth': 10,        
            'interval': 20,
            'step': 1,
            'backcolor': '#666',
            'fillcolor': '#6d6f71'
        }).start(100);
        
        // create the new object, add options, and start the animation with desired percentage
        var canvas = document.getElementById("circle_annee");
        new AnimationCircle({
            'canvas': canvas,
            'width': canvas.width-115,
            'height': canvas.height-115,
            'radius': 90,
            'linewidth': 5,        
            'interval': 20,
            'step': 1,
            'circlecolor': 'transparent',
            'fillcolor': '#696a6c'
        }).start(70);
        
    };



    // ==> Params / settings //
    controller.showVrnParamsPage = function() {
       app.log("controller.showVrnParamsPage", 'wip');
       
        // header et footer
        $.mobile.navigate( "#vrn-params-page" );
        controller.showVrnHeader();
        controller.generateVrnFooter('vrn-params-page');
        $("#vrn-params-page").trigger('refresh');
        
        //var r2;
        var language;
        // userInfos : infos 
        var r1 = app.repository.getUserItem(localStorage.getItem( "current_user_id" ));
        r1.done(function(user) {
            app.loggedUser = user;

            // getLanguage : infos 
            var r2 = app.repository.getLanguage(user.preferred_language_id);
            r2.done(function(la) {
                var language = la;
            });
            // final execute
            $.when(r2).done(function(language) {
                $("#vrn-params-name").html(app.loggedUser.firstname + ' ' + app.loggedUser.lastname);
                $("#vrn-params-email").html(app.loggedUser.email);
                $("#vrn-params-ident").html(app.loggedUser.username);
                $("#vrn-params-tel").html(app.loggedUser.phone);
                $("#vrn-params-zone").html(app.loggedUser.target_val);
                $("#vrn-params-language").html(language.name);
                
                //alert(new Date().getTime()+" : "+localStorage.getItem( "connexion_timestamp" ));
                $("#vrn-params-connex-cont").html(app.utils.formatTimestamp(new Date().getTime() - localStorage.getItem( "connexion_timestamp" )));
                
                $("#vrn-params-connex-date").html(app.utils.convertTimestampToDate(localStorage.getItem( "connexion_date" ),'/'));
                 
            });
        });
        

    };
    
    controller.showVrnParamsEditPage = function() {
        app.log("controller.showVrnParamsEditPage", 'wip');
        // header et footer
        $.mobile.navigate( "#vrn-params-edit-page" );
        controller.showVrnHeader();
        controller.generateVrnFooter('vrn-params-page');
        $("#vrn-params-edit-page").trigger('refresh');
        
        // get user infos
        var r1 = app.repository.getUserItem(localStorage.getItem( "current_user_id" ));
        r1.done(function(usr) {
            var user = usr;
        });
        
        var r2 = app.repository.getMicroZones();
        r2.done(function(mzs) {
            var microzones = mzs;
        });
        
        var r3 = app.repository.getLanguages();
        r3.done(function(la) {
            var languages = la;
        });
        
        $.when(r1, r2, r3).done(function(user, microzones, languages) {  
            $('#vrn-params-edit-lastname').val(user.lastname);
            $('#vrn-params-edit-firstname').val(user.firstname);
            $('#vrn-params-edit-email').val(user.email);
            //$('#vrn-params-edit-identif').val(user.username);
            $('#vrn-params-edit-phone').val(user.phone);
            var select = $('#vrn-params-edit-profil-zone');
            if(select.prop) {
              var options = select.prop('options');
            }else {
              var options = select.attr('options');
            }
            $('option', select).remove();
            for (var i=0;i<microzones.length;i++){ 
                options[options.length] = new Option(microzones[i].name,microzones[i].id_item);
            }
            select.val(user.target_val);           
            var selectb = $('#vrn-params-edit-profil-language');
            if(selectb.prop) {
              var options = selectb.prop('options');
            }else {
              var options = selectb.attr('options');
            }
            $('option', selectb).remove();
            for (var i=0;i<languages.length;i++){ 
                options[options.length] = new Option(languages[i].name,languages[i].id_language);
            }
            selectb.val(user.preferred_language_id);           

        });
        
        // changement de l'id du btn...
        $('#vrn-params-edit-enregistrer').unbind('tap');
        $('#vrn-params-edit-enregistrer').bind('tap',function (event){
            controller.paramsSave(event);
        });
    };
    // Params :save
    controller.paramsSave = function(event) {
        app.log("controller.paramsSave : " , 'wip');
        
        var form_statut = "ok";
        var message = "";
        if($('#vrn-params-edit-lastname').val() == ""){
            message += "Le champs \"nom\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        if($('#vrn-params-edit-firstname').val() == ""){
            message += "Le champs \"prénom\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        if($('#vrn-params-edit-email').val() == ""){
            message += "Le champs \"email\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
      /*  if($('#vrn-params-edit-identif').val() == ""){
            message += "Le champs \"identifiant\" ne peut être vide.<br>";
            form_statut = "non ok";
        }*/ 
        if($('#vrn-params-edit-phone').val() == ""){
            message += "Le champs \"nom du contact\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        if($('#vrn-params-edit-profil-zone').val() == ""){
            message += "Le champs \"zone\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        if($('#vrn-params-edit-profil-language').val() == ""){
            message += "Le champs \"langue\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
        app.log(message , 'wip');
        
        
        if(form_statut == "ok"){
            // todo : :)
            
            var data = [ $('#vrn-params-edit-lastname').val(), $('#vrn-params-edit-firstname').val(), $('#vrn-params-edit-email').val(), $('#vrn-params-edit-phone').val(), $('#vrn-params-edit-profil-language').val(), $('#vrn-params-edit-profil-zone').val(), localStorage.getItem( "current_user_id") ];
            
            var r1 = app.repository.editParamsSave(data);
            
            controller.syncUpDownData(app.log('end sync'));
            
            
            r1.done(function(pos) {
                $.mobile.changePage("#vrn-params-page", {
                    transition:"slide",
                    changeHash:false,
                    reverse:false,
                    reload:true
                 });
            });
        }else{
            // return error pop
            $('#vrn-params-edit-error-popup').popup();
            //$('#vrn-params-edit-error-popup').height (screen.height - 50);
            //$('#vrn-params-edit-error-popup').width (screen.width - 50);
            $("#vrn-params-edit-error-popup-content").children("[class='ui-title']").html(message).trigger('create');
            $('#vrn-params-edit-error-popup').popup('open');
        }
        
    };
    
    controller.getHeader = function() {
        app.log("# app.controller : getHeader");
         // recup l'ancien setting du user (si exist)

			if(sync_state == 1){
	            var network = "<img src=\"css/images/vrn/sync.gif\"/ class=\"sync_ico\">";
	        }else if(sync_mode == 1){
	            sync_mode = 1;
	            if (navigator.onLine) {
	                network_state = 1;
	                var network = "<a href=\"#\" onclick=\"app.controller.changeSyncMode()\"><img src=\"css/images/vrn/on_button.png\"/></a>";
	            }else{
	                network_state = 0;
	                var network = "<a href=\"#\" onclick=\"app.controller.changeSyncMode()\"><img src=\"css/images/vrn/on_button_grey.png\"/></a>";
	            }
	        }else{
	            app.log("# app.controller : changeSyncMode : on");
	            sync_mode = 0;
	            if (navigator.onLine) {
	                network_state = 1;
	                var network = "<a href=\"#\" onclick=\"app.controller.changeSyncMode()\"><img src=\"css/images/vrn/off_button.png\"/></a>";
	            }else{
	                network_state = 0;
	                var network = "<a href=\"#\" onclick=\"app.controller.changeSyncMode()\"><img src=\"css/images/vrn/off_button_grey.png\"/></a>";
	            }
	        }
	        //$(".vrn-network").html(network);
	        
	        //alert(app.authenticatedInThisSession);
	        if(app.authenticatedInThisSession == true) var title = "<span class=\"ui-title\"><a href=\"#vrn-home-page\">Visit Optimizer</a></span>";
	        else var title = "<span class=\"ui-title\">Visit Optimizer</span>";
	        if(app.authenticatedInThisSession == true) var help = "<a href=\"#help-popup\"><img src=\"css/images/vrn/help.png\"/></a>";
	        else var help = "";
	        if(app.authenticatedInThisSession == true) var set = "<a href=\"#vrn-params-page\"><img src=\"css/images/vrn/icon_settings_pressed.png\"/></a>";
	        else var set = "";
	        var header = "  <div id=\"vrn-help\">"+help+"</div>"
	        + " <div id=\"vrn-settings\">"+set+"</div>"
	        + " <div class=\"vrn-network\">"+network+"</div>"
	        + " <div id=\"vrn-company\">Orange</div>"
	        + ""+title+"";
	        
	        return header;

        
    };
    
    controller.showVrnHeader = function() {
    	var r1 = app.repository.getSettings();
        r1.done(function() {});
        $.when(r1).done(function(settings) {	
 
			sync_mode = settings.syncMode;
			
			$("[data-id=vrn-header-nav]").html(controller.getHeader()).trigger('create');	
        });
        
    };
    
    controller.getFooter = function(pageId) {
        app.log("# app.controller : getFooter");
    //alert(pageId);

        var footer = '<div id="vrn-footer-navbar">';
        footer += '<ul>';
        // homepage.html : vrn-home-page
        if (pageId == "vrn-home-page") {
            footer += '  <li><div class="vrn-footer-navbar-liselected"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-taskselected">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Taskboard</span></span></div></li>';
        } else {
            footer += '  <li class="vrn-footer-navbar-li"><div><a href="#vrn-home-page" id="vrn-taskboard" class="btn ui-state-persist" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-task">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Taskboard</span></span></a></div></li>';
        }
        // inform.html : vrn-inform-page
        if (pageId == "vrn-inform-page") {
            footer += '  <li><div class="vrn-footer-navbar-liselected"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-informselected">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Info</span></span></div></li>';
        } else {
            footer += '  <li class="vrn-footer-navbar-li"><div><a href="#vrn-inform-page" id="vrn-watchword" class="btn ui-state-persist" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-inform">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Info</span></span></a></div></li>';
        }
        // roadmap.html : vrn-roadmap-page
        if (pageId == "vrn-roadmap-page" || pageId == "vrn-roadmap-item-page" || pageId == "vrn-roadmap-visit-page") {
            footer += '  <li><div class="vrn-footer-navbar-liselected"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-roadselected">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Roadmap</span></span></div></li>';
        } else {
            footer += '  <li class="vrn-footer-navbar-li"><div><a href="#vrn-roadmap-page" id="vrn-roadmap" class="btn ui-state-persist" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-road">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Roadmap</span></span></a></div></li>';
        }
        // pos.html : vrn-pos-page
        if (pageId == "vrn-pos-page") {
            footer += '  <li><div class="vrn-footer-navbar-liselected"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-posselected">&nbsp;</div><span class="vrn-footer-navbar-btn-text">POS</span></span></div></li>';
        } else {
            footer += '  <li class="vrn-footer-navbar-li"><div><a href="#vrn-pos-page" id="vrn-pos" class="btn ui-state-persist" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-pos">&nbsp;</div><span class="vrn-footer-navbar-btn-text">POS</span></span></a></div></li>';
        }
        // stats.html : vrn-stats-page
        if (pageId == "vrn-stats-page") {
            footer += '  <li><div class="vrn-footer-navbar-liselected"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-statsselected">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Stats</span></span></div></li>';
        } else {
            footer += '  <li class="vrn-footer-navbar-li"><div><a href="#vrn-stats-semaine-page" id="vrn-stats" class="btn ui-state-persist" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-stats">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Stats</span></span></a></div></li>';
        }
        // params.html : vrn-params-page
        if (pageId == "vrn-params-page") {
            footer += '  <li><div class="vrn-footer-navbar-liselected"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-paramsselected">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Param</span></span></div></li>';
        } else {
            footer += '  <li class="vrn-footer-navbar-li"><div><a href="#vrn-params-page" id="vrn-params" class="btn ui-state-persist" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-params">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Param</span></span></a></div></li>';
        }
        footer += '</ul>'; 
        footer += '</div>';

        return footer;
    };
    
    var vrnHomePageFooter = "";
    var vrnInformPageFooter = "";
    var vrnRroadmapPageFooter = "";
    var vrnRoadmapItemPageFooter = "";
    var vrnRoadmapVisitFooter = "";
    var vrnPosPageFooter = "";
    var vrnStatsPageFooter = "";
    var vrnParamsPageFooter = "";
    
    controller.generateVrnFooter = function(active_sector) {
        if (active_sector == "vrn-home-page" && vrnHomePageFooter == '') { 
        	vrnHomePageFooter = controller.getFooter(active_sector);
        	$(".vrn-home-page-foot").html(vrnHomePageFooter).trigger('create');
        	$(".vrn-home-page-foot").height(79);
        }
        if (active_sector == "vrn-inform-page" && vrnInformPageFooter == '') { 
        	vrnInformPageFooter = controller.getFooter(active_sector);
        	$("#vrn-footer-nav-inform").html('<div id="vrn-inform-valider"></div>' +vrnInformPageFooter).trigger('create');
        	//$("#vrn-footer-nav-inform").height(79);
        }
        if (active_sector == "vrn-roadmap-page" && vrnRroadmapPageFooter == '') { 
        	vrnRroadmapPageFooter = controller.getFooter(active_sector);
        	$(".vrn-roadmap-page-foot").html(vrnRroadmapPageFooter).trigger('create');
        	$(".vrn-roadmap-page-foot").height(79);
        }
        if (active_sector == "vrn-roadmap-item-page" && vrnRoadmapItemPageFooter == '') { 
        	vrnRoadmapItemPageFooter = controller.getFooter(active_sector);
        	$("#vrn-footer-nav-roadmap-item").html('<div id="vrn-roadmap-valider"></div>'+vrnRoadmapItemPageFooter).trigger('create');
        	//$("#vrn-footer-nav-roadmap-item").height(79);
        }
        if (active_sector == "vrn-roadmap-visit-page" && vrnRoadmapVisitFooter == '') { 
        	vrnRoadmapVisitFooter = controller.getFooter(active_sector);
        	$("#vrn-footer-nav-roadmap-visit").html('<div id="vrn-visit-valider"></div>'+vrnRoadmapVisitFooter).trigger('create');
        	//$("#vrn-footer-nav-roadmap-visit").height(79);
        }
        if (active_sector == "vrn-pos-page" && vrnPosPageFooter == '') { 
        	vrnPosPageFooter = controller.getFooter(active_sector);
        	$(".vrn-pos-page-foot").html(vrnPosPageFooter).trigger('create');
        	$(".vrn-pos-page-foot").height(79);
        }
        if (active_sector == "vrn-stats-page" && vrnStatsPageFooter == '') {
        	 vrnStatsPageFooter = controller.getFooter(active_sector);
        	$(".vrn-stats-page-foot").html(vrnStatsPageFooter).trigger('create');
        	$(".vrn-stats-page-foot").height(79);
        }
        if (active_sector == "vrn-params-page" && vrnParamsPageFooter == '') {
        	 vrnParamsPageFooter = controller.getFooter(active_sector);
        	$(".vrn-params-page-foot").html(vrnParamsPageFooter).trigger('create');
        	$(".vrn-params-page-foot").height(79);
        }
    };
    
    
    controller.prepaPopupConnection = function() {
        $("#vrn-login-popup").children("[data-role=header]").attr("data-theme", "a").trigger('create');
        $("#vrn-login-popup").children("[data-role=header]").attr("class", "ui-corner-top ui-header ui-bar-a").trigger('create');
        $("#vrn-login-popup").children("[data-role=header]").html("<h1>"+trad["1155"]+"</h1>").trigger('create');
    };
    
    controller.prepaPopupError = function() {
        $("#vrn-login-popup").children("[data-role=header]").attr("data-theme", "e").trigger('create');
        $("#vrn-login-popup").children("[data-role=header]").attr("class", "ui-corner-top ui-header ui-bar-e").trigger('create');
        $("#vrn-login-popup").children("[data-role=header]").html("<h1>"+trad["1155"]+"</h1>").trigger('create');
    };
    
    
    
    controller.authenticate = function() {
        //$.mobile.loadPage("homepage.html",false);
        
        if($("#vrn-username").val() == "" || $("#vrn-password").val() == ""){
            app.authenticatedInThisSession = false;
            controller.errorLoadingPopup.popup("open", {
                dataPositionTo : "window",
                dataTransition : "pop"
            }).trigger('create');
            return;
        }

        if (app.authenticatedInThisSession) {
            //alert('authenticatedInThisSession');
            return;
        }
                
        controller.loginLoadingPopup.popup("open", {
            dataPositionTo : "window",
            dataTransition : "pop"
        }).trigger('create');

        app.log("::Init:: Step 2a : Authentification (manual)");
        
        var r1 = app.repository.localAuthentication($("#vrn-username").val(), $("#vrn-password").val());
        r1.done(function(user) {
            
            if(user.id == 0){
                app.log("::Init:: Step 2a.2 : No local data for this user");
                
                
                controller.ajaxAsyncTask = '';
                app.webservice.authenticateUser(controller.ajaxAsyncTask, $("#vrn-username").val(), $("#vrn-password").val(), 
                    function(user) {
                        app.log("::Init:: Step 3a : authentification in progress");
                        app.loggedUser = user;
                        app.authenticatedInThisSession = true;
                        app.repository.saveOrUpdateUser(user, function(user) {
                            // update ui
                            app.log("::Init:: Step 4a :  authenticated successfully");
                            
                            // recup l'ancien setting du user (si exist)
                            var r2 = app.repository.getSettings();
		                    r2.done(function() {});
		                    $.when(r2).done(function(settings) {
                                if ($("#vrn-remember-me").is(":checked")) {
	                                app.repository.updateSettings(app.loggedUser.preferred_language_id, app.loggedUser.id, settings.syncMode);
	                            } else {
	                                app.repository.updateSettings(app.loggedUser.preferred_language_id, 0, settings.syncMode);
	                            }
                            });
                            //alert(connexionTimestamp);
                            
                            // persistant curent user id
                            localStorage.clear();
                            localStorage.setItem( "current_user_id", user.id );
                            localStorage.setItem( "connexion_date", new Date() );
                            localStorage.setItem( "connexion_timestamp", new Date().getTime() );
                            
                            app.repository.checkUserSyncData(user.id,
                                function() {
                                app.log("::Init:: Step 5a : Sync not necessary yet");
                                    // if data ok
                                    // show TASKBOARD
                                    $.mobile.changePage("#vrn-home-page", {
                                       transition:"slide",
                                       changeHash:false,
                                       reverse:false,
                                       reload:true
                                    });
                                },
                                function() {
                                    app.log("::Init:: Step 5b : Obligatory sync");
                                    // if no data
                                    // purge db (juste data, no user infos)
                                   // app.repository.purgeData(function() {
                                        app.log("::Init:: Step 6 : Clean DB");
                                        // Sync Update Data
                                        controller.syncUpdateData(function() {
                                            app.log("::Init:: Step 7 : Starconnexion_timestampt sync");
                                            
                                            
                                            // recup last sync data
                                            app.repository.getLastSyncInfos(app.loggedUser.id, function(id, sync_id, userId, date) {
                                                app.log("::Init:: Step 8 : Get sync zip file");
                                                app.log("getLastSyncInfos is ok : "+ date, 'success');
                                                controller.last_sync = new app.domain.sync_infos(id,sync_id,userId, date);
                                                app.log("::Init:: Step 9 : Sync : " + date, 'success');
                                                
                                                // show TASKBOARD
                                                $.mobile.changePage("#vrn-home-page", {
                                                   transition:"slide",
                                                   changeHash:false,
                                                   reverse:false,
                                                   reload:true
                                                });
                                            }); 
                                             
                                        });   
                                    //});
                                }
                            );
                        }, function(error) {
                            // show saving error or warning
                            app.log("::Init:: Step 4ba :  authenticated, but saving errors", 'err');
                            $("#vrn-login-error-popup-content").children(".ui-title").html("authenticated, but saving errors");
                            controller.errorLoadingPopup.popup("open", {
                                dataPositionTo : "window",
                                dataTransition : "pop"
                            }).trigger('create');
                        });
                                                   
                    }, 
                    function(errorTranslationId) {
                        // show network error
                        app.log("::Init:: Step 3b :  authentication failed because of network errors : ", 'err');
                        controller.loginLoadingPopup.popup("close");
                        $("#vrn-login-error-popup-content").children(".ui-title").html("network errors");
                        setTimeout(function() {
                            controller.errorLoadingPopup.popup("open", {
                                dataPositionTo : "window",
                                dataTransition : "pop"
                            });
                        }, 100);
    
                    }
                );
                
            }else{
                app.log("::Init:: Step 2a.1 : Local data exist for this user");
                
                var r2 = app.repository.getSettings();
                r2.done(function() {});
                $.when(r2).done(function(settings) {
                    if ($("#vrn-remember-me").is(":checked")) {
                        app.repository.updateSettings(user.preferred_language_id, user.id, settings.syncMode);
                    } else {
                        app.repository.updateSettings(user.preferred_language_id, 0, settings.syncMode);
                    }
                });
                
                
                // show TASKBOARD
                $.mobile.changePage("#vrn-home-page", {
                   transition:"slide",
                   changeHash:false,
                   reverse:false,
                   reload:true
                });
                
            }
            
        });
        
        
    };
     
    /*
    // change le statut d'une Sync
    controller.syncUpdateStatus = function(doneCallback) {
        app.webservice.syncGetLastUpdateUrl(controller.ajaxAsyncTask, app.loggedUser.id, function(sync_data) {
            app.log('sync_data file : ' + sync_data.response_list.url, 'success');/*
            doneCallback();
        });       
    };
    */
    controller.changeSyncMode = function() { 
        if(sync_state == 1){
            var network = "<img src=\"css/images/vrn/sync.gif\"/ class=\"sync_ico\">";
        }else if(sync_mode == 1){
            app.log("# app.controller : changeSyncMode : off");
            sync_mode = 0;
            if (navigator.onLine) {
                network_state = 1;
                var network = "<a href=\"#\" onclick=\"app.controller.changeSyncMode()\"><img src=\"css/images/vrn/off_button.png\"/></a>";
            }else{
                network_state = 0;
                var network = "<a href=\"#\" onclick=\"app.controller.changeSyncMode()\"><img src=\"css/images/vrn/off_button_grey.png\"/></a>";
            }
        }else{
            app.log("# app.controller : changeSyncMode : on");
            sync_mode = 1;
            if (navigator.onLine) {
                network_state = 1;
                var network = "<a href=\"#\" onclick=\"app.controller.changeSyncMode()\"><img src=\"css/images/vrn/on_button.png\"/></a>";
            }else{
                network_state = 0;
                var network = "<a href=\"#\" onclick=\"app.controller.changeSyncMode()\"><img src=\"css/images/vrn/on_button_grey.png\"/></a>";
            }
        }
        $(".vrn-network").html(network);
    };
    
    controller.changeSyncState = function(state) {
        sync_state = state;
        if(sync_state == 1){
            var network = "<img src=\"css/images/vrn/sync.gif\"/ class=\"sync_ico\">";
        }else if(sync_mode == 1){
            sync_mode = 1;
            if (navigator.onLine) {
                network_state = 1;
                var network = "<a href=\"#\" onclick=\"app.controller.changeSyncMode()\"><img src=\"css/images/vrn/on_button.png\"/></a>";
            }else{
                network_state = 0;
                var network = "<a href=\"#\" onclick=\"app.controller.changeSyncMode()\"><img src=\"css/images/vrn/on_button_grey.png\"/></a>";
            }
        }else{
            app.log("# app.controller : changeSyncMode : on");
            sync_mode = 0;
            if (navigator.onLine) {
                network_state = 1;
                var network = "<a href=\"#\" onclick=\"app.controller.changeSyncMode()\"><img src=\"css/images/vrn/off_button.png\"/></a>";
            }else{
                network_state = 0;
                var network = "<a href=\"#\" onclick=\"app.controller.changeSyncMode()\"><img src=\"css/images/vrn/off_button_grey.png\"/></a>";
            }
        }
        $(".vrn-network").html(network);
    };
    
    controller.syncUpDownData = function(doneCallback) {
        app.log("controller.syncUpDownData", 'wip');
        
        controller.changeSyncState(1);
        
        if(sync_mode == 1 && navigator.onLine){
            app.log("Synchro montante (mobile-server)<br>Prepa des datas<br>");
            var r1 = controller.prepaDataPack();
            r1.done(function(zip_name, zip_content) {
            });
            $.when(r1).done(function(zip_name, zip_content) {
                //alert(zip_name);
                //alert("size:"+zip_content.byteLength);
                //.byteLength
                app.log($("#vrn-sync-ar-etat").html()+"Upload datas<br>");
                
                controller.ajaxAsyncTask = "";
                
                //ajaxAsyncTask, userId, bytes, md5_hash, size, zip_name, successCallback, errorCallback
                app.webservice.syncUploadData(
                    controller.ajaxAsyncTask, 
                    app.loggedUser.id,
                    zip_content,
                    'uu',
                    '12',
                    zip_name,
                    function(sync_data) { 
                        
                        app.log('AR traitement');
                        // AR traitement
                        app.log(sync_data);
                        var uar = controller.uploadAR(sync_data);
                        uar.done(function(sync_id, sync_date) { });
                        $.when(uar).done(function(sync_id, sync_date) {
                            app.log('Scynchro montante terminée');
                            // change le statut de la sync pour la passer en "in progress" le temps de la manip
                            app.webservice.syncUpdateStatus(
                                controller.ajaxAsyncTask, 
                                app.loggedUser.id,
                                sync_id, 
                                'ended', 
                                function(data) {
                                    app.log("app.webservice.syncUploadData : Sync Server statut changed : ended");
        
                                }
                            );
                            //alert('data:'+sync_id);
                            // save des infos de cette syncro et doneCallback
                            //var last_sync = new app.domain.sync_infos(sync_data.response_list.sync_data, app.loggedUser.id, sync_data.response_list.date);
                            app.repository.setSyncInfos(sync_id, app.loggedUser.id, sync_date,function(data) {
                                app.log("app.webservice.syncUploadData : Sync Local statut changed : ended");
        
                            });
                            
                            controller.changeSyncState(0);
                            doneCallback();
                        });
                    }, 
                    function(sync_data) {
                        alert('PB sync');
                         app.log("app.webservice.syncGetLastUpdateUrl : Sync statut changed : ended");
                         controller.changeSyncState(0);
                         doneCallback();
                    }
                );
            });
        }else{
            controller.changeSyncState(0);
            doneCallback();
        }
    };
    
    controller.syncUpdateData = function(doneCallback) {
        /*
        // show syncPanel
        $.mobile.changePage("#vrn-sync-page", {
           transition:"slide",
           changeHash:false,
           reverse:false,
           reload:true
        });
        */
        
        // change ico status
        controller.changeSyncState(1);
        
        controller.ajaxAsyncTask = "";
        
        // sync Get Last Update Url
        app.webservice.syncGetLastUpdateUrl(controller.ajaxAsyncTask, app.loggedUser.id, function(sync_data) {
            app.log('Sync Get Last Update Url : ' + sync_data.response_list.url, 'wip');
            
            // change le statut de la sync pour la passer en "in progress" le temps de la manip
            app.webservice.syncUpdateStatus(
                controller.ajaxAsyncTask, 
                app.loggedUser.id,
                sync_data.response_list.sync_id, 
                'in progress', 
                function(sync_data) {
                    app.log("app.webservice.syncGetLastUpdateUrl : Sync statut changed : in progress");
                }
            );
            
            // init le zip
            app.log("app.webservice.syncGetLastUpdateUrl : Load zip file");
            //alert('ziploader');
            var loader = new ZipLoader(sync_data.response_list.url);
            // le nom du fichier txt est le meme que celui du zip
            var filename = sync_data.response_list.url.replace(app.webservice.RETAIL_SERVICE_URL+"zip_files/server_mobile/","");
            var filename = filename.replace(".zip",".txt");
            app.log(filename);
            // recup les datas du fichier txt du zip
            app.log("app.webservice.syncGetLastUpdateUrl : Open txt data file");
            var data = $.parseJSON(loader.load(sync_data.response_list.url+"://"+filename));
            for (var i=0;i<data.length;i++){ 
                app.log("===== > i: "+i +" | v: "+ data[i]["entity_type"]);
                var value = value;
                // pour la table help c'est un tableau simple
                if(data[i]["entity_type"] == "help"){
                    var rsql = "INSERT INTO " + data[i]["entity_type"] + " (";//
                    var field = "";
                    var val = "";
                    $.each(data[i]["content"], function (indexC, valueC) {
                        if(field != '') field += ", ";
                        field += indexC;
                        if(val != '') val += ", ";
                        if(valueC != null) valueC = valueC.replace('"','&acute;&acute;');
                        else valueC = '';
                        val += '"'+valueC+'"';
                    });
                    rsql += field + ") VALUES (" + val + ")";
                    //app.log(rsql);
                    // insert la requette
                    app.repository.syncUpdateDataImport(rsql);
                }
                // pour les autres c'est des tableaux imbriqués
                else{
                    for (var j=0;j<data[i]["content"].length;j++){ 
                        var rsql = "INSERT INTO " + data[i]["entity_type"] + " (";//
                        var field = "";
                        var val = "";
                        $.each(data[i]["content"][j], function (indexC, valueC) {
                            if(field != '') field += ", ";
                            field += indexC;
                            if(val != '') val += ", ";
                            if(valueC != null) valueC = valueC.replace('"','&acute;&acute;');
                            else valueC = '';
                            val += '"'+valueC+'"';
                        });
                        if(data[i]["entity_type"] == "sys_users" || 
                           data[i]["entity_type"] == "message" || 
                           data[i]["entity_type"] == "sales_point" || 
                           data[i]["entity_type"] == "roadmap" || 
                           data[i]["entity_type"] == "sp_answer" || 
                           data[i]["entity_type"] == "sp_visit" 
                           ){
                            field += ", sync_status";
                            val += ',"S"';
                        }
                        rsql += field + ") VALUES (" + val + ")";
                        //app.log(rsql);
                        // insert la requette
                        app.repository.syncUpdateDataImport(rsql);
                    }
                }
            }
            // change le statut de la sync pour la passer en "in progress" le temps de la manip
            app.webservice.syncUpdateStatus(
                controller.ajaxAsyncTask, 
                app.loggedUser.id,
                sync_data.response_list.sync_id, 
                'ended', 
                function(sync_data) {
                     app.log("app.webservice.syncGetLastUpdateUrl : Sync statut changed : ended");
                }
            );
            // save des infos de cette syncro et doneCallback
            last_sync = new app.domain.sync_infos(sync_data.response_list.sync_id, app.loggedUser.id, sync_data.response_list.date);
            app.repository.setSyncInfos(sync_data.response_list.sync_id, app.loggedUser.id, sync_data.response_list.date,doneCallback);
            
            controller.changeSyncState(0);
            
        });
    };

    controller.callPhone = function(number) {
        if (number != ''){
            console.log("calling number : " + number);                
            window.location ='tel:'+number;
        }
    };
    controller.sendAMail = function(mail) {
        if (mail != ''){
            console.log("sending mail : " + mail);                
            window.location ='mailto:'+mail;
        }
    };
    
    var upload_deferred;
    
    controller.prepaDataPack = function() {
        app.log("webservice.prepaDataPack",'wip');
        
        upload_deferred = $.Deferred();
        
        var tb_name = 'sys_users';
        var fields_to_export = ['id_user', 'lastname', 'firstname', 'email', 'phone', 'preferred_language_id', 'target_val', 'sync_status'];
        var sync_status = "all";
        var r1 = app.repository.sqlite2json(tb_name,fields_to_export,sync_status);
        r1.done(function(json_data) {} );
        
        var tb_name = 'message';
        var fields_to_export = ['id_message', 'read_date', 'sync_status'];
        var sync_status = "all";
        var r2 = app.repository.sqlite2json(tb_name,fields_to_export,sync_status);
        r2.done(function(json_data) {} );
        
        var tb_name = 'sales_point';
        var fields_to_export = ['id_sales_point', 'name', 'contact_name', 'phone_number', 'street', 'city', 'postal_code', 'email', 'description', 'gps_latitude', 'gps_longitude', 'type_id', 'user_id', 'microzone_id', 'last_visit_id', 'frequency_id', 'photo_url', 'local_id', 'sync_status'];
        var sync_status = "all";
        var r3 = app.repository.sqlite2json(tb_name,fields_to_export,sync_status);
        r3.done(function(json_data) {} );
        
        var tb_name = 'sp_visit';
        var fields_to_export = ['id_visit', 'sales_point_id', 'roadmap_id', 'status_visit_id', 'scheduled_date', 'performed_date', 'rank', 'comment', 'local_id', 'sync_status'];
        var sync_status = "all";
        var r4 = app.repository.sqlite2json(tb_name,fields_to_export,sync_status);
        r4.done(function(json_data) {} );
        
        var tb_name = 'sp_answer';
        var fields_to_export = ['sales_point_id', 'visit_id', 'questionnaire_id', 'question_id', 'answer_id', 'answer', 'answer_time', 'sync_status'];
        var sync_status = "all";
        var r5 = app.repository.sqlite2json(tb_name,fields_to_export,sync_status);
        r5.done(function(json_data) {} );
        
        var tb_name = 'roadmap';
        var fields_to_export = ['id_roadmap', 'initiating_user_id', 'operating_user_id', 'mobile_status_id', 'web_status_id', 'creation_date', 'name', 'scheduled_date', 'km', 'comment', 'close_date', 'area_id', 'local_id', 'sync_status'];
        var sync_status = "all";
        var r6 = app.repository.sqlite2json(tb_name,fields_to_export,sync_status);
        r6.done(function(json_data) {} );
        
        $.when(r1,r2,r3,r4,r5,r6).done(function(r1v,r2v,r3v,r4v,r5v,r6v) {
            var json_data = "["
                + r1v +","
                + r2v +","
                + r3v +","
                + r4v +","
                + r5v +","
                + r6v
                +"]";
            app.log(json_data);
            var file_name = new Date().getTime() +'-'+ app.loggedUser.id;
            var zip = new JSZip();
            zip.file(file_name+".txt", json_data);
            var zip_content = zip.generate();
            //location.href="data:application/zip;base64,"+content;
            upload_deferred.resolve(file_name+'.zip', zip_content);
        } );
        
        return upload_deferred.promise();        
    };
    
    var uploadAR_deferred;
    
    controller.uploadAR = function(sync_data) {
        app.log("webservice.uploadAR",'wip');
        uploadAR_deferred = $.Deferred();
        sync_data = $.parseJSON(sync_data);
        
        for (var i=0;i<sync_data.length;i++){
            
            var tb_name = sync_data[i].entity_type;
            
            // sys_users
            if(sync_data[i].entity_type == 'sys_users'){
                for (var j=0;j<sync_data[i].content.length;j++){
                    if(sync_data[i].content[j].sync_status == "I"){
                    }else if(sync_data[i].content[j].sync_status == "U"){
                        var rsql = "UPDATE "+tb_name+" SET sync_status = ? WHERE id_user = ?";
                        var params = [ "S", sync_data[i].content[j].id_user ];
                        //alert('param'+sync_data[i].content[j].id_user);
                        var r = app.repository.requestSQL(rsql,params);
                    }else if(sync_data[i].content[j].sync_status == "D"){
                    }
                }
            }
         // message
            if(sync_data[i].entity_type == 'message'){
                for (var j=0;j<sync_data[i].content.length;j++){
                    if(sync_data[i].content[j].sync_status == "I"){
                    }else if(sync_data[i].content[j].sync_status == "U"){
                        var rsql = "UPDATE "+tb_name+" SET sync_status = ? WHERE id_message = ?";
                        var params = [ "S", sync_data[i].content[j].id_message ];
                        //alert('param'+sync_data[i].content[j].id_message);
                        var r = app.repository.requestSQL(rsql,params);
                    }else if(sync_data[i].content[j].sync_status == "D"){
                    }
                }
            }
         // sales_point
            if(sync_data[i].entity_type == 'sales_point'){
                for (var j=0;j<sync_data[i].content.length;j++){
                    if(sync_data[i].content[j].sync_status == "I"){
                        var rsql = "UPDATE "+tb_name+" SET id_sales_point = ?, sync_status = ? WHERE id_sales_point = ?";
                        var params = [ sync_data[i].content[j].new_id, "S", sync_data[i].content[j].id_sales_point ];
                        var r = app.repository.requestSQL(rsql,params);
                        // maj id to other table
                        var rsql = "UPDATE sp_visit SET sales_point_id = ? WHERE sales_point_id = ?";
                        var params = [ sync_data[i].content[j].new_id, sync_data[i].content[j].id_sales_point ];
                        var r = app.repository.requestSQL(rsql,params);
                        var rsql = "UPDATE sp_answer SET sales_point_id = ? WHERE sales_point_id = ?";
                        var params = [ sync_data[i].content[j].new_id, sync_data[i].content[j].id_sales_point ];
                        var r = app.repository.requestSQL(rsql,params);
                    }else if(sync_data[i].content[j].sync_status == "U"){
                        var rsql = "UPDATE "+tb_name+" SET sync_status = ? WHERE id_sales_point = ?";
                        var params = [ "S", sync_data[i].content[j].id_sales_point ];
                        //alert('param'+sync_data[i].content[j].id_sales_point);
                        var r = app.repository.requestSQL(rsql,params);
                    }else if(sync_data[i].content[j].sync_status == "D"){
                        /*var rsql = "DELETE FROM "+tb_name+" WHERE ( id_sales_point = ? )";
                        var params = [ sync_data[i].content[j].id_sales_point ];
                        var r = app.repository.requestSQL(rsql,params);*/
                    }
                }
            }
            // sp_visit
            if(sync_data[i].entity_type == 'sp_visit'){
                for (var j=0;j<sync_data[i].content.length;j++){
                    if(sync_data[i].content[j].sync_status == "I"){
                        var rsql = "UPDATE "+tb_name+" SET id_visit = ?, sync_status = ? WHERE id_visit = ?";
                        var params = [ sync_data[i].content[j].new_id, "S", sync_data[i].content[j].id_visit ];
                        var r = app.repository.requestSQL(rsql,params);
                    }else if(sync_data[i].content[j].sync_status == "U"){
                        var rsql = "UPDATE "+tb_name+" SET sync_status = ? WHERE id_visit = ?";
                        var params = [ "S", sync_data[i].content[j].id_visit ];
                        //alert('param'+sync_data[i].content[j].id_visit);
                        var r = app.repository.requestSQL(rsql,params);
                    }else if(sync_data[i].content[j].sync_status == "D"){
                        var rsql = "DELETE FROM "+tb_name+" WHERE ( id_visit = ? )";
                        var params = [ sync_data[i].content[j].id_visit ];
                        var r = app.repository.requestSQL(rsql,params);
                    }
                }
            }
            // sp_answer
            if(sync_data[i].entity_type == 'sp_answer'){
                for (var j=0;j<sync_data[i].content.length;j++){
                    if(sync_data[i].content[j].sync_status == "I"){
                        var rsql = "UPDATE "+tb_name+" SET sales_point_id = ?, visit_id = ?, questionnaire_id = ?, question_id = ?, answer_id = ?, sync_status = ? WHERE sales_point_id = ? AND visit_id = ? AND questionnaire_id = ? AND question_id = ? AND answer_id = ?";
                        var params = [ sync_data[i].content[j].sales_point_id, sync_data[i].content[j].visit_id, sync_data[i].content[j].questionnaire_id, sync_data[i].content[j].question_id, sync_data[i].content[j].answer_id , "S", sync_data[i].content[j].sales_point_id, sync_data[i].content[j].visit_id, sync_data[i].content[j].questionnaire_id, sync_data[i].content[j].question_id, sync_data[i].content[j].answer_id ];
                        var r = app.repository.requestSQL(rsql,params);
                    }else if(sync_data[i].content[j].sync_status == "U"){
                        var rsql = "UPDATE "+tb_name+" SET sync_status = ? WHERE sales_point_id = ? AND visit_id = ? AND questionnaire_id = ? AND question_id = ? AND answer_id = ?";
                        var params = [ "S", sync_data[i].content[j].sales_point_id, sync_data[i].content[j].visit_id, sync_data[i].content[j].questionnaire_id, sync_data[i].content[j].question_id, sync_data[i].content[j].answer_id ];
                        //alert('param'+sync_data[i].content[j].id_visit);
                        var r = app.repository.requestSQL(rsql,params);
                    }else if(sync_data[i].content[j].sync_status == "D"){
                        var rsql = "DELETE FROM "+tb_name+" WHERE ( sales_point_id = ? AND visit_id = ? AND questionnaire_id = ? AND question_id = ? AND answer_id = ? )";
                        var params = [ sync_data[i].content[j].sales_point_id, sync_data[i].content[j].visit_id, sync_data[i].content[j].questionnaire_id, sync_data[i].content[j].question_id, sync_data[i].content[j].answer_id ];
                        var r = app.repository.requestSQL(rsql,params);
                    }
                }
            }
            // roadmap
            if(sync_data[i].entity_type == 'roadmap'){
                for (var j=0;j<sync_data[i].content.length;j++){
                    if(sync_data[i].content[j].sync_status == "I"){
                        var rsql = "UPDATE "+tb_name+" SET id_roadmap = ?, sync_status = ? WHERE id_roadmap = ?";
                        var params = [ sync_data[i].content[j].new_id, "S", sync_data[i].content[j].id_roadmap ];
                        var r = app.repository.requestSQL(rsql,params);
                        // maj id to other table
                        var rsql = "UPDATE sp_visit SET roadmap_id = ? WHERE roadmap_id = ?";
                        var params = [ sync_data[i].content[j].new_id, sync_data[i].content[j].id_roadmap ];
                        var r = app.repository.requestSQL(rsql,params);
                        if(current_roadmap_id == sync_data[i].content[j].id_roadmap) current_roadmap_id = sync_data[i].content[j].new_id;
                    }else if(sync_data[i].content[j].sync_status == "U"){
                        var rsql = "UPDATE "+tb_name+" SET sync_status = ? WHERE id_roadmap = ?";
                        var params = [ "S", sync_data[i].content[j].id_roadmap ];
                        //alert('param'+sync_data[i].content[j].id_visit);
                        var r = app.repository.requestSQL(rsql,params);
                    }else if(sync_data[i].content[j].sync_status == "D"){
                        var rsql = "DELETE FROM "+tb_name+" WHERE ( id_roadmap = ? )";
                        var params = [ sync_data[i].content[j].id_roadmap ];
                        var r = app.repository.requestSQL(rsql,params);
                    }
                }
            }
            // end
            if(sync_data.length-1 == i) uploadAR_deferred.resolve(sync_data[0].sync_id,sync_data[0].sync_date);
            //alert('OK');
        }      
        return uploadAR_deferred.promise();        
    };
    
   function uploadWin(r) {
        console.log("Code = " + r.responseCode);
        console.log("Response = " + r.response);
        console.log("Sent = " + r.bytesSent);
    }

    function uploadFail(error) {
        alert("An error has occurred: Code = " + error.code);
        console.log("upload error source " + error.source);
        console.log("upload error target " + error.target);
    }
    
	function checksumGen(str) {
        var crc = 0; 
        var n = 0; //a number between 0 and 255 
        var x = 0; //an hex number 
    	var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D"; 
        crc = crc ^ (-1); 
        for( var i = 0, iTop = str.length; i < iTop; i++ ) { 
            n = ( crc ^ str.charCodeAt( i ) ) & 0xFF; 
            x = "0x" + table.substr( n * 9, 8 ); 
            crc = ( crc >>> 8 ) ^ x; 
        } 
        return crc ^ (-1);
	}
    
     function checkLength(str) {
		  i;
		  chk = "";
		
		  for (i = 0; str[i] != '\0'; i++) {
		    chk += ((int)(str[i]) * (i + 1));
		  }
		
		  return chk;
     };
	
    function fail(error) {
        console.log(error.code);
    }
    
    
    
    controller.nullfunc = function() {};
    
    return controller;
}());