'use strict';

app.controller = (function() {

	var controller = {};
	
	//var app = null;
	var TID;
	var loginLoadingPopup;
	var errorLoadingPopup;
	var settings;
    var last_sync;
    var messages;
    var pos;
    
    //var current_params_url;
    var current_params_url = Array();
    
    var preload;
    
	//controller.ajaxAsyncTask = new app.utils.AjaxAsyncTask(false);
	//controller.webservice = new app.webservice.init();
    //$( document ).unbind( "pagechange");

    // memento :
    
    // 1. Utilser bind au lieu de live
    
    // 2. Utilser tab ou lieu de click
    
    // 3. Les transitions jQuery Mobile ne sont pas compatibles avec tous les navigateurs
    
    // 4. ID des éléments du dom doivent être uniques même entre des pages différentes
    
    // 5. Input text de type=”number” ne sont pas compatibles avec tous les navigateurs, à éviter
    
    controller.init = function() {
		app.log("# app.controller : init", 'wip');

		$.support.cors = true; // crossdomain
        $.mobile.allowCrossDomainPages = true; // crossdomain
		$.mobile.pushStateEnabled = false;
		$.mobile.ignoreContentEnabled = true;
		$.mobile.page.prototype.options.domCache = false; // pas de mise en cache des pages (vs page dynamiques
		
		
		//preload 
		if($.mobile.activePage.attr('id') == 'vrn-index-loading'){
		    app.log('preload en cours...');
		    //preload = "ok";
		    //$.mobile.loadPage("homepage.html",true);

		    
		    // test si la db existe
		    app.log("::Init:: Step 1 : DB test");
            
		    app.repository.checkDatabase(
		            // si DB existe
		            function() { 
		                
		                app.log("- DB existe");
		                // recup le setting (remerber me) si exist
		                settings = app.repository.loadSettings(function(settings) {
		                    app.log("::Init:: Step 2 : Load user setting...");
		                    if(settings.userId == 0) {
		                        app.log("::Init:: Step 3 : No setting exist");
                                app.authenticatedInThisSession = false;

                                // show login panel
                                $.mobile.changePage("#vrn-login-page", {
                                   transition:"pop",
                                   changeHash:true,
                                   reverse:true
                                });

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
                                            app.log("::Init:: Step 5a : Init light DB (with login translation)");
                                            
                                            app.repository.getLastSyncInfos(localStorage.getItem( "current_user_id" ), function(id, sync_id, userId, date) {
                                                app.log("getLastSyncInfos is ok : "+ date, 'success');
                                                controller.last_sync = new app.domain.sync_infos(id,sync_id,userId, date);
                                                
                                                // show TASKBOARD
                                                $.mobile.changePage("homepage.html", {
                                                   transition:"slide",
                                                   changeHash:false,
                                                   reverse:true
                                                });
                                                
                                            });
                                       },
                                       function() {
                                           app.log("::Init:: Step 5b : Init light DB (with login translation)");
                                           // Sync Update Data
                                            controller.syncUpdateData(function() {
                                                // recup last sync data
                                                app.repository.getLastSyncInfos(localStorage.getItem( "current_user_id" ), function(id, sync_id, userId, date) {
                                                    app.log("getLastSyncInfos is ok : "+ date, 'success');
                                                    controller.last_sync = new app.domain.sync_infos(id,sync_id,userId, date);
                                                    // show TASKBOARD
                                                    
                                                    $.mobile.changePage("homepage.html", {
                                                       transition:"slide",
                                                       changeHash:false,
                                                       reverse:true
                                                    });
                                                    //controller.showTaskBoardPanel(); 
                                                }); 
                                                 
                                            });
                                       }
                                   );

                                });
                            }
		                    
		                    
		                });
		            },
		            
		            // si pas de DB
		            function() { 
		                
                        app.repository.firstInitDbApp( function() { 
                            app.log("::Init:: Step 1 : Init light DB (with login translation only)");
                            app.authenticatedInThisSession = false;

                            // show login panel
                            $.mobile.changePage("#vrn-login-page", {
                               transition:"pop",
                               changeHash:true,
                               reverse:true
                            });
                            
                            return;
                        });
                        
		            }
		    
		    );

		    app.log('preload fini.');

 
		}

		
    };
    

    
    // Before Show
    $( document ).unbind( "pagebeforeshow");
    $(document).bind("pagebeforeshow", function(e, data) {
        app.log(':: event : B : pagebeforeshow : '+$.mobile.activePage.attr('id'), 'wip');
        
        if($.mobile.activePage.attr('id') == 'vrn-index-loading'){
            
        }
        if($.mobile.activePage.attr('id') == 'vrn-login-page'){
           controller.showLoginPanel();
        }
        if($.mobile.activePage.attr('id') == 'vrn-sync-page'){
            $('#vrn-login').hide();
            $("#vrn-login-page").hide();
            controller.showSyncMessage();
        }
        if($.mobile.activePage.attr('id') == 'vrn-home-page'){
            $('#vrn-login').hide();
            controller.showTaskBoardPanel(e,data);
        }
        
        if($.mobile.activePage.attr('id') == 'vrn-inform-page'){
            controller.showMessagesPanel(e,data);
        }
        

        
        if($.mobile.activePage.attr('id') == 'vrn-roadmap-page'){
            controller.showRoadmapPanel();
        }
        if($.mobile.activePage.attr('id') == 'vrn-roadmap-add-page'){
            controller.showRoadmapFormAdd();
        }
        if($.mobile.activePage.attr('id') == 'vrn-roadmap-edit-page'){
            app.log("id:"+current_params_url['id']);
            controller.showRoadmapFormEdit(current_params_url['roadmap_id']);
        }
        if($.mobile.activePage.attr('id') == 'vrn-identity-page'){
            controller.showRoadmapPosIdentity(current_params_url['mode_edit'], current_params_url['roadmap_id'], current_params_url['sales_point_id']);
        }
        if($.mobile.activePage.attr('id') == 'vrn-map'){
            controller.showRoadmapPosIdentityMap(current_params_url['roadmap_id'], current_params_url['sales_point_id'], current_params_url['gps_latitude'],current_params_url['gps_longitude']);
        }
        
        if($.mobile.activePage.attr('id') == 'vrn-pos-page'){
            controller.showPosPanel(e,data);
        }
        if($.mobile.activePage.attr('id') == 'vrn-pos-edit-page'){
            if(typeof current_params_url['sales_point_id'] != 'undefined') controller.PosForm( current_params_url['sales_point_id']);
            else controller.PosForm(0);
        }
        if($.mobile.activePage.attr('id') == 'vrn-pos-identity-page'){
            controller.showPosIdentity( current_params_url['sales_point_id']);
        }
        
    });


    $( document ).bind( "popupbeforeposition", function( e, data ){
        //alert(current_params_url['id_parent_pop']);
        if(current_params_url['id_parent_pop'] == 'vrn-inform-detail-pop'){
            controller.showMessagePop(current_params_url['id']);
        }
        
        if(current_params_url['id_parent_pop'] == 'vrn-pos-identity-pop'){
            controller.showPosPop(current_params_url['id']);
        }
        
        if(current_params_url['id_parent_pop'] == 'vrn-pos-identity-map-pop'){
           // $( "#vrn-pos-identity-pop" ).popup( "close" )
            controller.showPosMapPop(current_params_url['id'],current_params_url['gps_latitude'],current_params_url['gps_longitude']);
        }

        
    });  
    
/*
    $( document ).bind( "pagechange", function( e, data ){
        app.log(':: event: C : pagechange : '+$.mobile.activePage.attr('id'), 'wip');
        //$.mobile.navigate( "#baz" ); 
        app.log(data.options.dataUrl);
        //location.hash = "#vrn-home-pageuuuu";
        
         if($.mobile.activePage.attr('id') == 'vrn-login-page'){
             event.preventDefault();
             location.hash = "foo";
         }
         if($.mobile.activePage.attr('id') == 'vrn-home-page'){
            // event.preventDefault();
             location.hash = "#vrn-home-pageuuuu";
             
         }
         if($.mobile.activePage.attr('id') == 'vrn-inform-page'){
             event.preventDefault();
             location.hash = "vrn-inform-page";
             
         }
        
    });    
  */
    

    
	// ==> Login Panel //
    controller.showLoginPanel = function() {
        app.log("controller.showLoginPanel", 'wip');
        
        // init les popups infos
        controller.loginLoadingPopup = $("#vrn-login-popup");
        controller.loginLoadingPopup.popup();
        controller.errorLoadingPopup = $("#vrn-login-error-popup");
        controller.errorLoadingPopup.popup();
        
        var r1 = app.repository.getTranslation([256,323,324,257,451,771,1155]);
        r1.done(function(trad) {
            // show header
            //controller.showHeader();
            
            $(".vrn-header").html(controller.getHeader()).trigger('refresh');
            
            // def i18n text value$("#vrn-login-page").fadeIn('slow');
            $("#vrn-username").attr("placeholder", trad["256"]);
            $("#vrn-password").attr("placeholder", trad["323"]);
            $("#vrn-forgot-password").html(trad["324"]+ " >>");
           // $("[data-role=controlgroup]").children("#vrn-remember-me-label").html(trad["451"]);
            
            $("label[for='vrn-remember-me']").text(trad["451"]).trigger("refresh");
            
            $("#vrn-login .ui-btn-text").text(trad["771"]);
            $("#vrn-login-error-popup").children("[data-role=header]").html("<h1>"+trad["1155"]+"</h1>");
            $("#vrn-login-error-popup-content").children(".ui-title").html(trad["257"]);
            $('#vrn-login').show();
            
           // $("#vrn-login-page").fadeIn('slow');
            
            var doc = $(document);
            doc.on("vclick", "[id=vrn-login]", controller.authenticate);
            doc.on("vclick", "[id=vrn-login-popup-cancel]", function() {
                
                if (controller.ajaxAsyncTask.active) {
                    app.log("app.controller.index: cancel current async task", 'pause');
                    controller.ajaxAsyncTask.cancel();
                }
                $("#vrn-login-popup").popup('close', {
                    dataRel : "back"
                });
            });
            $(".vrn-page").trigger('updatelayout');
            
        });

    };
	
    
    // message de sync WAIT !
    controller.showSyncMessage = function() {
        // header
        $("#vrn-sync-header").html(controller.getHeader()).trigger('refresh');
        $("#vrn-sync-page").trigger('change');  
        
    };
    
	// ==> TaskBoard //
    controller.showTaskBoardPanel = function(e,data) {
		app.log("controller.showTaskBoardPanel", 'wip');
        
		// preload pages
		//$.mobile.loadPage("inform.html",true);
        //$.mobile.loadPage("roadmap.html",true);
        //$.mobile.loadPage("pos.html",true);
		// override navigation url

        // header and footer
		$("#vrn-home-header").html(controller.getHeader()).trigger('refresh');
		$("[data-role=footer]").html(controller.getFooter('vrn-home-page')).trigger('refresh');
        //$("#vrn-home-page").trigger('change');  
        
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
            app.log('app.repository.getMessages -> retour');

            for (var i=0;i<messages.length;i++){ 
                 if(messages[i].message_type == 'information'){
                     if(messages[i].read == '0') count_bubble_infos++;
                     count_infos++;
                 }
                 if(messages[i].message_type == 'action'){
                     if(messages[i].read == '0') count_bubble_actions++;
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

        // final execute
        $.when(r1, r2).done(function(messages) {
            //controller.loginLoadingPopup.popup("close");
            
            // infos user
            if (typeof controller.last_sync != "undefined"){
                if (typeof controller.last_sync.date != "undefined") var date = controller.last_sync.date;
                else var date = "";
            } else var date = "";
            var code = '<p class="black">'
            + ' <span>Bienvenue </span>'
            + ' <span class="bold">'+app.loggedUser.firstname+' '+app.loggedUser.lastname.toUpperCase()+'</span>'
            + '</p>'
            + '<p class="brown">'
            + ' <span>Dernière mise à jour: '+date+'</span>'
            //+ '    <span class="bold">15/07/2014</span> à <span class="bold">09h</span>'
           // + '   <span class="bold">'+last_sync.date+'</span>'
            + '</p>';
            $("#vrn-home-user-data").html(code).trigger('create');
            
            var code = '<div class="vrn-home-message-data-title">Consignes du jour</div>'
            + ' <div class="vrn-consignes">'
            + '    <a href="inform.html"><div class="vrn-consulter-circle"><p>CONSULTER</p></div></a>'
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
            
            //$("#vrn-home-page").trigger('refresh'); 


            // pour le pb des element en absolute qui reste affiché
            //$("#vrn-login-page").hide();
        });
        
	    

        
	};
	
    // ==> Watchwords / Infos / Consignes //
    controller.showMessagesPanel = function(e,data) {
        app.log("controller.showMessagesPanel", 'wip');
        
        // header et footer
        $.mobile.navigate( "#vrn-inform-page" );
        $("#vrn-inform-header").html(controller.getHeader()).trigger('refresh');
        $("[data-role=footer]").html(controller.getFooter('vrn-inform-page')).trigger('refresh');
        $("#vrn-inform-page").trigger('refresh');
                
        // consignes (message) : infos et action 
        var r1 = app.repository.getMessages(localStorage.getItem( "current_user_id" ));
        r1.done(function(messages) {
            controller.messages = messages;
        });

        // final execute
        $.when(r1).done(function(messages) {
            
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
                     var ico_priority = '<img class="ui-li-icon" alt="" src="./css/images/vrn/star_with_background.png" style="height:17px;">';
                } else var ico_priority = '';
                
                if(messages[i].read == '1' && messages[i].attachment == ''){
                    var ico_check = 3;
                }else if(messages[i].read == '0' && messages[i].attachment == ''){
                    var ico_check = 2;
                }else if(messages[i].read == '1' && messages[i].attachment != ''){
                    var ico_check = 1;
                }else if(messages[i].read == '0' && messages[i].attachment != ''){
                    var ico_check = 4;
                } else 
                var ico_check = '';
                
                
                 code += '<li data-icon="check'+ico_check+'" id="vrn-inform-message-li-'+messages[i].id_message+'"><a href="#vrn-inform-detail-pop" data-url="?id_parent_pop=vrn-inform-detail-pop&id='+messages[i].id_message+'" id="vrn-inform-message-'+messages[i].id_message+'" class="inform-detail-lnk" data-transition="pop"  data-inline="true" data-rel="popup">'+ico_priority+'<span class="min_color">'+messages[i].send_date+'</span><span class="Information">'+title+'</span> <span class="text">De </span><span class="text_bold"> '+messages[i].lastname+'</span> <p class="myParagraph">'+messages[i].content+'</p> </a></li>';
            }
            code += '</ul>';
            $("#vrn-inform-div").html(code).trigger('create');
            
            $('.inform-detail-lnk').bind('vclick',function (event){
                // controller.clickMessage(this.id.replace("vrn-inform-message-",""));
                var querystring = $(this).jqmData('url');
                //alert('url:'+querystring);
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
            });
            
            $("#vrn-inform-page").trigger('refresh'); 
        });

        
    };
    
    controller.showMessagePop = function(id_message) {
        app.log("controller.clickMessage: "+ id_message, 'wip');
        for (var i=0;i<controller.messages.length;i++){ 
            if(controller.messages[i].id_message == id_message){
                if(controller.messages[i].read == '1' && controller.messages[i].attachment == ''){
                    // nothing
                }else if(controller.messages[i].read == '0' && controller.messages[i].attachment == ''){
                    // check and relaod item
                    controller.checkMessageStatus(controller.messages[i].id_message);
                    $('#vrn-inform-message-li-'+id_message+' .ui-icon.ui-icon-check2.ui-icon-shadow').css({"background-image" : "url(css/images/vrn/check3.png)"}).animate({opacity: 1});
                }else if(controller.messages[i].read == '1' && controller.messages[i].attachment != ''){
                    // link file
                }else if(controller.messages[i].read == '0' && controller.messages[i].attachment != ''){
                    // check and relaod item + link file
                    controller.checkMessageStatus(controller.messages[i].id_message);
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
    };
    
    controller.checkMessageStatus = function(id_message) {
        // change le statut de la sync pour la passer en "in progress" le temps de la manip
        app.repository.checkMessageStatus(id_message,
            function() {
                app.log("checkMessageStatus changed : "+id_message);
                
     
                
            }
        );
    };
    

    
    
    
    // ==> Roadmap //
    controller.showRoadmapPanel = function() {
       app.log("controller.showRoadmapPanel", 'wip');
        
        // header
        $("#vrn-roadmap-header").html(controller.getHeader()).trigger('create');
        
        var roadmap;
        
        // get roadmap list
        var r1 = app.repository.getRoadmapList(localStorage.getItem( "current_user_id" ));
        r1.done(function(roadmap_list) {
            roadmap = roadmap_list;
        });

        // final execute
        $.when(r1).done(function(roadmap_list) {
            roadmap = roadmap_list;
            var code = '';
            for (var i=0;i<roadmap.length;i++){
                var visit = "09/10";
                var visit_status = "Cloturée?";
                code += '<li data-icon="arrow-r2">'
                +'    <a href="#vrn-roadmap-edit-page?roadmap_id='+roadmap[i].id_roadmap+'" id="vrn-roadmap-item-'+roadmap[i].id_roadmap+'">'
                +'      <div class="vrn-roadmap-item-left">'
                +'         <span class="vrn-roadmap-date">'+roadmap[i].scheduled_date+'</span> '
                +'         <span class="vrn-roadmap-area">'+roadmap[i].area_name+'</span> '
                +'         <span class="vrn-roadmap-profil">'+roadmap[i].initiating_user_id+'</span> '
                +'      </div>'
                +'      <div class="vrn-roadmap-item-middle">'
                +'        <span class="vrn-roadmap-visit_title">Visites '
                +'          <span class="vrn-roadmap-visit">'+roadmap[i].nb_visited+'/'+roadmap[i].nb_visit+'</span> '
                +'        </span> '
                +'        <span class="vrn-roadmap-visit-status">'+visit_status+'</span> '
                +'      </div>'
                +'      <div class="vrn-roadmap-item-right"></div>'
                +'    </a>'
                +'</li>';   
            }
            $("#vrn-roadmap-list").html(code).trigger('create');
            $("#vrn-roadmap-page").trigger('create');
      /*      
            // items listener
            var doc = $(document);
            for (var i=0;i<roadmap.length;i++){ 
               $('#vrn-roadmap-item-16 rue des plantes, 75014 Paris
DetFen1'+roadmap[i].id_roadmap).bind('vclick',function (event){
                    controller.showRoadmapFormEdit(this.id.replace("vrn-roadmap-item-",""));
               });
            }
        */
        });
        
        $("#vrn-roadmap-page").trigger('create');
        $("#vrn-roadmap-page").fadeIn('slow');
    };
    
    controller.showRoadmapFormAdd = function(roadmap_id) {
       app.log("controller.showRoadmapFormAdd", 'wip');
       
        
        var roadmap;
        var pos;
        
        var r1 = app.repository.getRoadmapItem(roadmap_id);
        r1.done(function(roadmap_retour) {
            roadmap = roadmap_retour;
        });
        
        var r2 = app.repository.getRoadmapItemPosList(roadmap_id);
        r2.done(function(sp_list) {
            pos = sp_list;
        });
        
        // final execute
        $.when(r1, r2).done(function(roadmap_retour, sp_list) {
            
            // header
            $("#vrn-roadmap-add-header").html(controller.getHeader()).trigger('create');

            roadmap = roadmap_retour;
            pos = sp_list;
            var code = '';
            for (var i=0;i<pos.length;i++){ 
                if(pos[i].last_visit_id != null) var last_visit_id = 'Dernière visite <span class="bold">'+pos[i].last_visit_id+'</span>';
                else var last_visit_id = '';

                code += '<li data-icon="circle-with-i" id="vrn-roadmap-edit-item-'+pos[i].id_sales_point+'" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="div" data-iconpos="right" data-theme="c" class="ui-btn ui-btn-icon-right ui-li-has-arrow ui-li ui-li-has-icon ui-btn-up-c">'
                +'<div class="ui-btn-inner ui-li">'
                +'<div class="ui-btn-text">'
                +'<a href="#vrn-identity-page?mode_edit=add&roadmap_id='+pos[i].roadmap_id+'&sales_point_id='+pos[i].id_sales_point+'" class="ui-link-inherit">'
                +'<img class="ui-li-icon ui-li-thumb" alt="" src="./css/images/vrn/circle-with-arrows.png">'
                +'<span class="date">Dernière <span class="bold">'+last_visit_id+'</span></span>'
                +'<span class="vrn-name-road-creation-page">'+pos[i].name+'</span> '
                +'<span class="type">- '+pos[i].type_name+'</span> '
                +'</a>'
                +'</div>'
                +'<span class="ui-icon ui-icon-circle-with-i ui-icon-shadow">&nbsp;</span>'
                +'</div>'
                +'</li>';
            } 
                
            $("#vrn-roadmap-add-list").html(code).trigger('create');
            
            // items listener
            var doc = $(document);
            for (var i=0;i<pos.length;i++){ 
               $('#vrn-roadmap-edit-item-'+pos[i].id_sales_point).bind('vclick',function (event){
                    controller.showPosItem(this.id.replace("vrn-roadmap-edit-item-",""));
               });
            }
            
             $("#vrn-roadmap-add-page").trigger('create');
            //$("#vrn-roadmap-edit-page").fadeIn('slow'); 
        
        });
        

    };
    
    controller.showRoadmapFormEdit = function(roadmap_id) {
       app.log("controller.showRoadmapFormEdit", 'wip');

       //$.mobile.loadPage("identity.html",true);

        
        // header
        $("#vrn-roadmap-edit-header").html(controller.getHeader()).trigger('create');
        $("#vrn-roadmap-edit-page").trigger('refresh');
        //$("#vrn-roadmap-edit-page").fadeIn('slow');
        
        var roadmap;
        var pos;
        
        var r1 = app.repository.getRoadmapItem(roadmap_id);
        r1.done(function(roadmap_retour) {
            roadmap = roadmap_retour;
        });
        
        var r2 = app.repository.getRoadmapItemPosList(roadmap_id);
        r2.done(function(sp_list) {
            pos = sp_list;
        });
        
        // final execute
        $.when(r1, r2).done(function(roadmap_retour, sp_list) {
            
            roadmap = roadmap_retour;
            pos = sp_list;
            var code = '';
            for (var i=0;i<pos.length;i++){ 
                if(pos[i].last_visit_id != null) var last_visit_id = 'Dernière visite <span class="bold">'+pos[i].last_visit_id+'</span>';
                else var last_visit_id = '';
        
                code += '<li data-icon="circle-with-i" id="vrn-roadmap-edit-item-'+pos[i].id_sales_point+'" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="div" data-iconpos="right" data-theme="c" class="ui-btn ui-btn-icon-right ui-li-has-arrow ui-li ui-li-has-icon ui-btn-up-c">'
                +'<div class="ui-btn-inner ui-li">'
                +'<div class="ui-btn-text">'
                +'<a href="#vrn-identity-page?mode_edit=edit&roadmap_id='+pos[i].roadmap_id+'&sales_point_id='+pos[i].id_sales_point+'" data-rel="dialog" data-transition="pop" class="ui-link-inherit">'
                +'<img class="ui-li-icon ui-li-thumb" alt="" src="./css/images/vrn/circle-with-arrows.png">'
                +'<span class="date">Dernière <span class="bold">'+last_visit_id+'</span></span>'
                +'<span class="vrn-name-road-creation-page">'+pos[i].name+'</span> '
                +'<span class="type">- '+pos[i].type_name+'</span> '
                +'</a>'
                +'</div>'
                +'<span class="ui-icon ui-icon-circle-with-i ui-icon-shadow">&nbsp;</span>'
                +'</div>'
                +'</li>';
            } 
               
            $('#vrn-roadmap-edit-no-pdv').val(pos.length);
            $("#vrn-roadmap-edit-list").html(code).trigger('refresh');
            /*$("#vrn-roadmap-date").datepicker({
              showOn: "button",
              buttonImage: "css/images/vrn/icon_calendar.png",
              buttonImageOnly: true
            });*/

        });
    };
    
    controller.showRoadmapPosIdentity = function(mode_edit, roadmap_id, sales_point_id) {
       app.log("controller.showRoadmapPosIdentity : "+ sales_point_id, 'wip');
        //$.mo
       //controller.prepaPopupConnection();bile.loadPage("gmaps.html",true);

        var roadmap;
        var pos;
        if(mode_edit == 'add') var url_retour = "#vrn-roadmap-add-page?roadmap_id="+roadmap_id;
        if(mode_edit == 'edit') var url_retour = "#vrn-roadmap-edit-page?roadmap_id="+roadmap_id;
        else var url_retour = '#';
        $('#vrn-identity-top-right a').attr('href', url_retour);
        
        // get POS item
        var r1 = app.repository.getPosItem(sales_point_id);
        r1.done(function(pos) {
            $('#vrn-identity-top-left').html(pos.name);
            // derniere visit ? last_visit_id
            if(pos.last_visit_id == "0") $('#vrn-identity-top-right').hide();
            else $('#vrn-identity-top-right').show();
            $('#vrn-identity-address').html(pos.street + ", " +pos.postal_code+ " " +pos.city);
            $('#vrn-identity-seller-name').html(pos.contact_name);
            $('#vrn-identity-tel').html("<option value=\""+pos.phone_number+"\" selected> "+pos.phone_number+" </option>");
            $('#vrn-identity-tel')[0].selectedIndex = 0;
            $('#vrn-identity-tel').selectmenu("refresh");
            $('#vrn-identity-email').html("<option value=\""+pos.email+"\" selected> "+pos.email+" </option>");
            $('#vrn-identity-email')[0].selectedIndex = 0;
            $('#vrn-identity-email').selectmenu("refresh");
            $('#vrn-identity-description').html(pos.description);
            $('#vrn-identity-descriptionb').html('');
            $('#vrn-pos-details-page').trigger('refresh');
            $('#vrn-identity-map-btn').attr("href", "#vrn-map?roadmap_id="+roadmap_id+"&sales_point_id="+sales_point_id+"&gps_latitude="+pos.gps_latitude+"&gps_longitude="+pos.gps_longitude+"");
            
           
        });
        
        // final execute
        $.when(r1).done(function(roadmap_retour, sp_list) {
            

        });
        
        // btn listeners
        $('#vrn-appeler-button').bind('vclick',function (event){
            controller.callPhone($('#vrn-identity-tel').find(":selected").val());
        });
        
        $('#vrn-send-button').bind('vclick',function (event){
            controller.sendAMail($('#vrn-identity-email').find(":selected").val());
        });
      /*  
        $('#vrn-identity-map-btn').bind('vclick',function (event){
            controller.showRoadmapPosIdentityMap(pos.gps_latitude, pos.gps_longitude);
        });
        */
        
        
    };
    
    controller.showRoadmapPosIdentityMap = function(lat,lng) {
       app.log("controller.showRoadmapPosIdentityMap : "+ lat +' : '+ lng, 'wip');
        if(lat != '' && lng != ''){
            var lat = 48;
            var lng = 2.37;
            var latlng = new google.maps.LatLng (lat, lng);
            var options = { 
                zoom : 15, 
                center : latlng, 
                mapTypeId : google.maps.MapTypeId.ROADMAP 
            };
            
            var $content = $("#vrn-map div:jqmData(role=content)");
            $content.
            
            
            
            height ($("#vrn-map").height - 30);
            var map = new google.maps.Map ($content[0], options);
            new google.maps.Marker ( 
            { 
                map : map, 
                animation : google.maps.Animation.DROP,
                position : latlng  
            });  
        }
        
        // header
        $("#vrn-map-header").html(controller.getHeader()).trigger('create');
        $("#vrn-map").trigger('refresh');
        
        
    };
        

    
    // ==> PoS //
    controller.showPosPanel = function(e,data) {
        app.log("controller.showPosPanel", 'wip');

        var show_status = "off";
        var pos_filter_list;
        var pos;
        

        // header et footer
        $.mobile.navigate( "#vrn-pos-page" );
        $("#vrn-pos-header").html(controller.getHeader()).trigger('refresh');
        $("[data-role=footer]").html(controller.getFooter('vrn-pos-page')).trigger('refresh');
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
                if(pos[i].last_visit_id != null) var last_visit_id = 'Dernière visite <span class="bold">'+pos[i].last_visit_id+'</span>';
                else var last_visit_id = '';
                code += '<li data-icon="arrow-r2">'
                +'    <a href="#vrn-pos-identity-pop" data-url="?id_parent_pop=vrn-pos-identity-pop&id='+pos[i].id_sales_point+'" class="pos-detail-lnk" data-transition="pop" data-rel="popup" data-inline="true">'
                +'        <img class="ui-li-icon" alt="" src="css/images/vrn/forma1.png">'
                +'        <span id="vrn-pos-date-'+pos[i].id_sales_point+'" class="date">'+last_visit_id+'</span>'
                +'        <span class="vrn-name">'+pos[i].name+'</span> '
                +'        <span id="vrn-pos-type-'+pos[i].id_sales_point+'" class="type">- '+pos[i].type_name+'</span> '
                +'    </a>'
                +'</li>';   
            }
            $("#vrn-pos-list").html(code).trigger('create');
            
            $("#vrn-pos-page").trigger('refresh');

            $('.pos-detail-lnk').bind('vclick',function (event){
                var querystring = $(this).jqmData('url');
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
            });
            
            
        });


    };
    
    controller.showPosPop = function(id_sales_point) {
    
        app.log("controller.showPosPop : "+id_sales_point , 'wip');
        
        //$.mobile.loadPage("gmaps.html",true);
        
        // get POS item
        var r1 = app.repository.getPosItem(id_sales_point);
        r1.done(function(pos) {
            //alert('retour data : '+ pos.description);
            if(pos.last_visit_id == 0){
                $("#vrn-iden-visite").html('');
                $("#vrn-ident-text").html('');
            }else{
                $("#vrn-iden-visite").html('Dernière visite');
                $("#vrn-ident-text").html(pos.last_visit_id);
            }
            $("#vrn-pos-identity-title").html(pos.name);
            $('#vrn-pos-identity-address').html("<img src=\"./css/images/vrn/forma2_3.png\">"+ pos.street +", "+ pos.postal_code + " " + pos.city);
            $('#vrn-pos-identity-seller-name').html("<img src=\"./css/images/vrn/forma2_3.png\">"+pos.contact_name);
            $('#vrn-pos-identity-tel').html("<option value=\""+pos.phone_number+"\" selected> "+pos.phone_number+" </option>");
            $('#vrn-pos-identity-tel')[0].selectedIndex = 0;
            $('#vrn-pos-identity-tel').selectmenu("refresh");
            $('#vrn-pos-identity-email').html("<option value=\""+pos.email+"\" selected> "+pos.email+" </option>");
            $('#vrn-pos-identity-email')[0].selectedIndex = 0;
            $('#vrn-pos-identity-email').selectmenu("refresh");
            $('#vrn-pos-identity-description').html(pos.description);
            $('#vrn-pos-identity-map-btn').attr("data-url", "?id_parent_pop=vrn-pos-identity-map-pop&sales_point_id="+id_sales_point+"&gps_latitude="+pos.gps_latitude+"&gps_longitude="+pos.gps_longitude+"");
            $('#vrn-modify-button').attr("data-url", "?id_parent=vrn-pos-edit-page&sales_point_id="+id_sales_point+"");

            // btn listeners
            $('#vrn-pos-appeler-button').bind('vclick',function (event){
                controller.callPhone($('#vrn-pos-identity-tel').find(":selected").val());
            });
            
            $('#vrn-pos-send-button').bind('vclick',function (event){
                controller.sendAMail($('#vrn-pos-identity-email').find(":selected").val());
            });
            
            $('.pos-identity-map-lnk').bind('vclick',function (event){
                // controller.clickMessage(this.id.replace("vrn-inform-message-",""));
                var querystring = $(this).jqmData('url');
                //alert('url:'+querystring);
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
            });
            
        });

    };

    
    controller.showPosMapPop = function(id_sales_point, gps_latitude, gps_longitude) {
        
        app.log("controller.showPosMapPop : "+id_sales_point , 'wip');
    
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
        var $content = $("#vrn-pos-map div:jqmData(role=content)");
        $content.height (screen.height - 50);
        $content.width (screen.width - 50);
        var map = new google.maps.Map ($content[0], options);

        new google.maps.Marker ( 
        { 
            map : map, 
            animation : google.maps.Animation.DROP,
            position : latlng  

        }); 
        
        
    };
    
    // pos : pos form
    controller.PosForm = function(id_sales_point) {  
        app.log("controller.PosForm : " , 'wip');
        $("#vrn-pos-edit-header").html(controller.getHeader()).trigger('create');
        
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
            
        
            if(id_sales_point == 0) {
                $("#vrn-pos-edit-title").html("CRÉER UN POINT DE VENTE");
                $("#vrn-pos-id").val("0");
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
                $("#vrn-pos-description").val("");
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
                var r3 = app.repository.getPosItem(id_sales_point);
                r3.done(function(pos) {
                    $("#vrn-pos-edit-title").html("MODIFIER UN POINT DE VENTE");
                    $("#vrn-pos-id").val(pos.id_sales_point); 
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
        
        
        
        $('#vrn-pos-edit-enregistrer-button').bind('vclick',function (event){
            controller.PosSave(event,id_sales_point);
        });
    };
    
    // pos : add pos save
    controller.PosSave = function(event,id_sales_point) {
        if(id_sales_point == 0) app.log("controller.addPosSave : " , 'wip');
        else app.log("controller.editPosSave : " , 'wip');
        
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
            
            if(id_sales_point == 0) {
                var data = [ event.timeStamp, $('#vrn-pos-name').val(), $('#vrn-pos-street').val(), $('#vrn-pos-cp').val(), $('#vrn-pos-city').val(), $('#vrn-pos-contact-name').val(), $('#vrn-pos-telephone').val(), $('#vrn-pos-email').val(), 1 , localStorage.getItem( "current_user_id"), $('#vrn-pos-description').val(), $('#vrn-pos-gps_latitude').val(), $('#vrn-pos-gps_longitude').val(), $('#vrn-pos-microzone').val(), $('#vrn-pos-frequency').val() ];
                var r1 = app.repository.addPosSave(data);
            }else {
                var data = [ event.timeStamp,  $('#vrn-pos-name').val(), $('#vrn-pos-street').val(), $('#vrn-pos-cp').val(), $('#vrn-pos-city').val(), $('#vrn-pos-contact-name').val(), $('#vrn-pos-telephone').val(), $('#vrn-pos-email').val(), 1 , localStorage.getItem( "current_user_id"), $('#vrn-pos-description').val(), $('#vrn-pos-gps_latitude').val(), $('#vrn-pos-gps_longitude').val(), $('#vrn-pos-microzone').val(), $('#vrn-pos-frequency').val(), $('#vrn-pos-id').val() ];
                var r1 = app.repository.editPosSave(data);
            }
            
            
            
            r1.done(function(pos) {
                $.mobile.changePage("pos.html", {
                    transition:"slide",
                    changeHash:true,
                    reverse:true
                 });
            });
        }else{
            // return error pop
            $('#vrn-pos-add-error-popup').popup();
            //$('#vrn-pos-add-error-popup').height (screen.height - 50);
            //$('#vrn-pos-add-error-popup').width (screen.width - 50);
            $("#vrn-pos-add-error-popup-content").children("[class='ui-title']").html(message).trigger('create');
            $('#vrn-pos-add-error-popup').popup('open');
        }
        
    };
    
    // ==> Stats //
    controller.showStatsPanel = function() {
       app.log("controller.showStatsPanel", 'wip');
        // header
        $("#vrn-stats-header").html(controller.getHeader()).trigger('create');
        
        $("#vrn-stats-page").trigger('create');
        $("#vrn-stats-page").fadeIn('slow');
    };
    
    // ==> Params / settings //
    controller.showParamsPanel = function() {
       app.log("controller.showParamsPanel", 'wip');
       
       // revoir le changement des infos user .... via la persistnce
        // header
        $("#vrn-params-header").html(controller.getHeader()).trigger('create');
        
        $("#vrn-params-name").html(app.loggedUser.firstname + ' ' + app.loggedUser.lastname);
        $("#vrn-params-email").html(app.loggedUser.email);
        $("#vrn-params-ident").html(app.loggedUser.username);
        $("#vrn-params-tel").html(app.loggedUser.phone);
        $("#vrn-params-zone").html(app.loggedUser.target_val);
        
        // footer
        $("#vrn-params-footer").html(controller.getFooter('vrn-params-page')).trigger('create');
        $("#vrn-params-page").trigger('refresh');
        $("#vrn-params-page").fadeIn('slow');
    };
    
    controller.showParamsForm = function() {
       app.log("controller.showParamsPanel", 'wip');
        // header
        $("#vrn-profil-edit-header").html(controller.getHeader()).trigger('create');
        
        // get POS item
        var r1 = app.repository.getUserItem(localStorage.getItem( "current_user_id" ));
        r1.done(function(user) {
            $('#vrn-lastname').val(user.lastname);
            $('#vrn-firstname').val(user.firstname);
            $('#vrn-email').val(user.email);
            $('#vrn-identif').val(user.username);
            $('#vrn-phone').val(user.phone);
            //$('#vrn-profil-zone').val(pos.email);
            //$('#vrn-profil-language').val(pos.description);
            
        });
        
        $("#vrn-profil-edit-page").trigger('refresh');
        $("#vrn-profil-edit-page").fadeIn('slow');
    };

    
    controller.showHeader = function() {
        $('[data-role=header][class=vrn-header]').html(controller.getHeader()).trigger('create');
        $('[data-role=header][class=vrn-header]').show('slow');
       // $('[data-role=page][class=vrn-page]').trigger('create');
    };
    controller.showHeaderAndFooter = function(current) {
        $('[data-role=header][class=vrn-header]').html(controller.getHeader()).trigger('create');
        $('[data-role=header][class=vrn-header]').show('slow');
        $('[data-role=footer][class=vrn-header]').html(controller.getFooter(current)).trigger('create');
        $('[data-role=page][class='+current+']').trigger('create');
    };
    
	controller.getHeader = function() {
		app.log("# app.controller : getHeader");
        var nav = navigator.userAgent; 
        var ischrome = nav.indexOf("Chrome") ? true : false;
        if (ischrome) var network = "<img src=\"css/images/vrn/on_button.png\"/>";
        else{
            if(app.testNetwork() != Connection.NONE) var network = "<img src=\"css/images/vrn/on_button.png\"/>";
            else var network = "<img src=\"css/images/vrn/off_button.png\"/>";
        }
        
        
        //alert(app.authenticatedInThisSession);
        if(app.authenticatedInThisSession == true) var help = "<a href=\"#help-popup\"><img src=\"css/images/vrn/help.png\"/></a>";
        else var help = "";
        if(app.authenticatedInThisSession == true) var settings = "<a href=\"params.html\"><img src=\"css/images/vrn/icon_settings_pressed.png\"/></a>";
        else var settings = "";
        var header = "	<div id=\"vrn-help\">"+help+"</div>"
      	+ "	<div id=\"vrn-settings\">"+settings+"</div>"
      	+ "	<div id=\"vrn-network\">"+network+"</div>"
      	+ "	<div id=\"vrn-company\">Orange</div>"
      	+ "<span class=\"ui-title\">Visit Optimizer</span>"
		return header;
	};
	
	controller.getFooter = function(pageId) {
		app.log("# app.controller : getFooter");
		//$.mobile.loadPage("homepage.html",true);
       // $.mobile.loadPage("inform.html",true);
       // $.mobile.loadPage("roadmap.html",true);
       // $.mobile.loadPage("pos.html",true);
       // $.mobile.loadPage("stats.html",true);
       // $.mobile.loadPage("params.html",true);
    
        var footer = '<div id="vrn-footer-navbar">' 
			+ '<ul>' 
			+ '  <li class="vrn-footer-navbar-li'+ addActiveClass("vrn-home-page", pageId) + '"><a href="homepage.html" id="vrn-taskboard" class="btn-'+ addActiveClass("vrn-home-page", pageId) + ' ui-state-persist" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-task'+ addActiveClass("vrn-home-page", pageId) + '">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Taskboard</span></span></a></li>' 
			+ '  <li class="vrn-footer-navbar-li'+ addActiveClass("vrn-inform-page", pageId) + '"><a href="inform.html" id="vrn-watchword" class="btn-'+ addActiveClass("vrn-inform-page", pageId) + ' ui-state-persist" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-inform'+ addActiveClass("vrn-inform-page", pageId) + '">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Info</span></span></a></li>' 
			+ '  <li class="vrn-footer-navbar-li'+ addActiveClass("vrn-roadmap-page", pageId) + '"><a href="roadmap.html" id="vrn-roadmap" class="btn-'+ addActiveClass("vrn-roadmap-page", pageId) + ' ui-state-persist" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-road'+ addActiveClass("vrn-roadmap-page", pageId) + '">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Roadmap</span></span></a></li>' 
			+ '  <li class="vrn-footer-navbar-li'+ addActiveClass("vrn-pos-page", pageId) + '"><a href="pos.html" id="vrn-pos" class="btn-'+ addActiveClass("vrn-pos-page", pageId) + ' ui-state-persist" rel="external" data-ajax="false" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-pos'+ addActiveClass("vrn-pos-page", pageId) + '">&nbsp;</div><span class="vrn-footer-navbar-btn-text">POS</span></span></a></li>' 
			+ '  <li class="vrn-footer-navbar-li'+ addActiveClass("vrn-stats-page", pageId) + '"><a href="stats.html" id="vrn-stats" class="btn-'+ addActiveClass("vrn-stats-page", pageId) + ' ui-state-persist" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-stats'+ addActiveClass("vrn-stats-page", pageId) + '">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Stats</span></span></a></li>' 
			+ '  <li class="vrn-footer-navbar-li'+ addActiveClass("vrn-params-page", pageId) + '"><a href="params.html" id="vrn-params" class="btn-'+ addActiveClass("vrn-params-page", pageId) + ' ui-state-persist" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-params'+ addActiveClass("vrn-params-page", pageId) + '">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Param</span></span></a></li>' 
			+ '</ul>' 
			+ '</div>';

		return footer;
	};
	
	function addActiveClass(knownPageId, activePageId) {
		if (knownPageId == activePageId) {
			return 'selected'; // 
		}
		return ' ';
	};
	
	
    controller.prepaPopupConnection = function() {
        $("#vrn-login-popup").children("[data-role=header]").attr("data-theme", "a").trigger('create');
        $("#vrn-login-popup").children("[data-role=header]").attr("class", "ui-corner-top ui-header ui-bar-a").trigger('create');
        $("#vrn-login-popup").children("[data-role=header]").html("<h1>"+trad["1155"]+"</h1>").trigger('create');
    }
    controller.prepaPopupError = function() {
        $("#vrn-login-popup").children("[data-role=header]").attr("data-theme", "e").trigger('create');
        $("#vrn-login-popup").children("[data-role=header]").attr("class", "ui-corner-top ui-header ui-bar-e").trigger('create');
        $("#vrn-login-popup").children("[data-role=header]").html("<h1>"+trad["1155"]+"</h1>").trigger('create');
    }
	
	
	
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
                            if ($("#vrn-remember-me").is(":checked")) {
                                app.repository.updateSettings(user.id);
                            } else {
                                app.repository.updateSettings(0);
                            }
                            
                            // persistant curent user id
                            localStorage.clear();
                            localStorage.setItem( "current_user_id", user.id );
                            
                            app.repository.checkUserSyncData(user.id,
                                function() {
                                app.log("::Init:: Step 5a : Sync not necessary yet");
                                    // if data ok
                                    // show TASKBOARD
                                    $.mobile.changePage("homepage.html", {
                                       transition:"slide",
                                       changeHash:false,
                                       reverse:true
                                    });
                                },
                                function() {
                                    app.log("::Init:: Step 5b : Obligatory sync");
                                    // if no data
                                    // purge db (juste data, no user infos)
                                    app.repository.purgeData(function() {
                                        app.log("::Init:: Step 6 : Clean DB");
                                        // Sync Update Data
                                        controller.syncUpdateData(function() {
                                            app.log("::Init:: Step 7 : Start sync");
                                            
                                            
                                            // recup last sync data
                                            app.repository.getLastSyncInfos(app.loggedUser.id, function(id, sync_id, userId, date) {
                                                app.log("::Init:: Step 8 : Get sync zip file");
                                                app.log("getLastSyncInfos is ok : "+ date, 'success');
                                                controller.last_sync = new app.domain.sync_infos(id,sync_id,userId, date);
                                                app.log("::Init:: Step 9 : Sync : " + date, 'success');
                                                
                                                // show TASKBOARD
                                                $.mobile.changePage("homepage.html", {
                                                   transition:"slide",
                                                   changeHash:false,
                                                   reverse:true
                                                });
                                            }); 
                                             
                                        });   
                                    });
                                }
                            );
                        }, function(error) {
                            // show saving error or warning
                            app.log("::Init:: Step 4ba :  authenticated, but saving errors", 'err');
                            //controller.loginLoadingPopup.popup("close");
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
                        //controller.errorLoadingPopup = $("#vrn-login-error-popup");
                        setTimeout(function() {
                            controller.errorLoadingPopup.popup("open", {
                                dataPositionTo : "window",
                                dataTransition : "pop"
                            })
                        }, 100);
    
                    }
                );
                
            }else{
                app.log("::Init:: Step 2a.1 : Local data exist for this user");
                
                // show TASKBOARD
                $.mobile.changePage("homepage.html", {
                   transition:"slide",
                   changeHash:false,
                   reverse:true
                });
                
            }
            
        });
		
		
    };
     
    /*
    // change le statut d'une Sync
    controller.syncUpdateStatus = function(doneCallback) {
        app.webservice.syncGetLastUpdateUrl(controller.ajaxAsyncTask, app.loggedUser.id, function(sync_data) {
            app.log('sync_data file : ' + sync_data.response_list.url, 'success');
            doneCallback();
        });       
    };
    */
   
    controller.syncUpdateData = function(doneCallback) {
        
        // show syncPanel
        $.mobile.changePage("#vrn-sync-page", {
           transition:"slide",
           changeHash:true,
           reverse:true
        });
        
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
                            if(valueC != null) valueC = valueC.replace('"','&acute;&acute;')
                            else valueC = '';
                            val += '"'+valueC+'"';
                        });
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
    
    
    controller.nullfunc = function() {};
    
	return controller;
}());