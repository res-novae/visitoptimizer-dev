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
    
    var current_url;
    var current_hash_url;
    var current_params_url;
    
	controller.ajaxAsyncTask = new app.utils.AjaxAsyncTask(false);
	//controller.webservice = new app.webservice.init();
 
    
    controller.init = function() {
		app.log("# app.controller : init", 'wip');
		
		$.support.cors 
		$.mobile.allowCrossDomainPages = true;
		$.mobile.pushStateEnabled = false;
		
		// init les popups infos
        controller.loginLoadingPopup = $("#vrn-login-popup");
        controller.loginLoadingPopup.popup();
        controller.errorLoadingPopup = $("#vrn-login-error-popup");
        controller.errorLoadingPopup.popup();
        
        $.mobile.loadPage("homepage.html",true);
        $.mobile.loadPage("add_pos.html",true);
        $.mobile.loadPage("identity.html",true);
        $.mobile.loadPage("roadmap_add.html",true);
        $.mobile.loadPage("roadmap_edit.html",true);
        $.mobile.loadPage("inform.html",true);
        $.mobile.loadPage("roadmap_add.html",true);
        $.mobile.loadPage("roadmap_edit.html",true);
        
		// Charge des data de translation
		TID = app.domain.TRANSLATION_ID;
		app.loadTranslations([ TID.COMPANY, TID.RECOVER_PASSWORD, TID.REMEMBER_ME, TID.TASKBOARD, TID.WATCHWORD, TID.ROADMAP, TID.POS, TID.STATS, TID.SETTINGS, TID.LOGIN, TID.USERNAME, TID.PASSWORD ], 
		function() { 
			// recup le setting (remerber me) si existe
			settings = app.repository.loadSettings(function(settings) {
				if(settings.userId == 0) {
					app.authenticatedInThisSession = false;
					controller.showLoginPanel();
				}
				else {
					// recup les infos user
					app.authenticatedInThisSession = true;
					app.repository.loadUser(settings.userId, function(user) {
					    app.loggedUser = user;
						app.log("app.repository.loadUser", 'success');
					
					   // TODO : une fonction de check "last update version" serait pas mal
					   // mais faut voir coté serveur
					
					   app.repository.checkUserData(user.id, 
					       function() {
                                app.repository.getLastSyncInfos(app.loggedUser.id, function(id, sync_id, userId, date) {
                                    app.log("getLastSyncInfos is ok : "+ date, 'success');
                                    controller.last_sync = new app.domain.sync_infos(id,sync_id,userId, date);
                                    
                                    // show TASKBOARD
                                    $.mobile.changePage($('#vrn-home-page'), {
                                       transition:"slide",
                                       changeHash:true,
                                       reverse:true
                                    });
                                });
					       },
					       function() {
                                // Sync Update Data
                                controller.syncUpdateData(function() {
                                    // recup last sync data
                                    app.repository.getLastSyncInfos(app.loggedUser.id, function(id, sync_id, userId, date) {
                                        app.log("getLastSyncInfos is ok : "+ date, 'success');
                                        controller.last_sync = new app.domain.sync_infos(id,sync_id,userId, date);
                                        // show TASKBOARD
                                        
                                        $.mobile.changePage($('#vrn-home-page'), {
                                           transition:"slide",
                                           changeHash:true,
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
		});
		    
            
        function getParameterByName(name) {
            var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
            return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
        }
        
        // listeners pages
        
        // Before Show
        $( document ).unbind( "pagebeforeshow");
        $(document).bind("pagebeforeshow", function(e, data) {
            app.log(':: event : A : pagebeforeshow : '+$.mobile.activePage.attr('id'), 'wip');
            
            if($.mobile.activePage.attr('id') == 'vrn-index-loading'){
                //controller.showTaskBoardPanel();
            }
            if($.mobile.activePage.attr('id') == 'vrn-home-page'){
                app.log("clliiiiiickkkkkkkk");
                controller.showTaskBoardPanel();
            }
            if($.mobile.activePage.attr('id') == 'vrn-inform-page'){
                controller.showMessagesPanel();
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
            
        });
        
		$( document ).unbind( "pagechange");
		$( document ).bind( "pagechange", function( event, data ){
            app.log(':: event: B : pagechange : '+$.mobile.activePage.attr('id'), 'wip');
            

            

                        
            if($.mobile.activePage.attr('id') == 'vrn-pos-page'){
                controller.showPosPanel();
            }
            if($.mobile.activePage.attr('id') == 'vrn-stats-page'){
                controller.showStatsPanel();
            }
            if($.mobile.activePage.attr('id') == 'vrn-params-page'){
                controller.showParamsPanel();
            }
            if($.mobile.activePage.attr('id') == 'vrn-profil-edit-page'){
                controller.showParamsForm();
            }

            
		});
		
		
		// pagebeforechange listeners
        $(document).unbind("pagebeforechange");
        $(document).bind("pagebeforechange", function(e, data) {
            app.log(':: event: C : pagebeforechange : '+$.mobile.activePage.attr('id'), 'wip');
            
            if (typeof data.toPage === "string") {
                // jQUERY param URL fake :)
                current_url = "";
                current_hash_url = "";
                current_params_url = Array();
                var u = $.mobile.path.parseUrl(data.toPage);
                //var current_url = data.options.dataUrl;
                var current_url = data.toPage;
                app.log("url : "+current_url);
                var current_hash_url = current_url.substring(current_url.indexOf('#'));
                app.log("hash : "+current_hash_url);
                if(current_hash_url.indexOf('?') != -1){
                    var param_url = current_hash_url.substring(current_hash_url.indexOf('?')+1);
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
                    //e.preventDefault();
                    //return false;
                }
            }

        });
		
    };

	// ==> Login Panel //
    controller.showLoginPanel = function() {
        app.log("controller.showLoginPanel", 'wip');
        controller.loginLoadingPopup.popup("close");
        $("#vrn-index-page").fadeIn('slow');
        $(".vrn-login-button").trigger('create'); // fake style bouton
        // show header
        controller.showHeader();
		
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
		$(".vrn-page").trigger('refresh');
	};
	
	// ==> TaskBoard //
    controller.showTaskBoardPanel = function() {
		app.log("controller.showTaskBoardPanel", 'wip');

		// header
		$("#vrn-home-header").html(controller.getHeader()).trigger('refresh');
        $("#vrn-home-page").trigger('refresh');  
        
		
		
		
       // $.mobile.loadPage("inform.html",true);
        //$.mobile.loadPage("roadmap.html",true);
        
        var count_infos = 0;
        var count_actions = 0;
        var count_bubble_infos = 0;
        var count_bubble_actions = 0;
        var bubble_infos = '';
        var bubble_actions = '';
        // consignes (message) : infos et action 
        var r1 = app.repository.getMessages(app.loggedUser.id);
        r1.done(function(messages) {
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
        $.when(r1).done(function(messages) {
            //controller.loginLoadingPopup.popup("close");
            
            // infos user
            if(controller.last_sync.date != null) var date = controller.last_sync.date;
            else var date = "";
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
            + '    <a href="#vrn-inform-page"><div class="vrn-consulter-circle"><p>CONSULTER</p></div></a>'
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
            $("#vrn-home-message-data").html(code).trigger('create');
            $("#vrn-home-page").trigger('refresh'); 


            // pour le pb des element en absolute qui reste affiché
            //$("#vrn-index-page").hide();
        });
        
	    

        
	};

    // ==> Watchwords //
    controller.showMessagesPanel = function() {
        app.log("controller.showMessagesPanel", 'wip');
        
        // header
        $("#vrn-inform-header").html(controller.getHeader()).trigger('refresh');
        $("#vrn-inform-page").trigger('refresh');
        
        
        // consignes (message) : infos et action 
        var r1 = app.repository.getMessages(app.loggedUser.id);
        r1.done(function(messages) {
            controller.messages = messages;
        });

        // final execute
        $.when(r1).done(function(messages) {
            
            var code = '<ul data-role="listview" data-inset="true" data-theme="c" data-dividertheme="a" id="listview">';
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
                 code += '<li data-icon="check'+ico_check+'" id="vrn-inform-message-li-'+messages[i].id_message+'"><a href="#" id="vrn-inform-message-'+messages[i].id_message+'">'+ico_priority+'<span class="min_color">'+messages[i].send_date+'</span><span class="Information">'+title+'</span> <span class="text">De </span><span class="text_bold"> '+messages[i].lastname+'</span> <p class="myParagraph">'+messages[i].content+'</p> </a></li>';
            }
            code += '</ul>';
            $("#vrn-inform-div").html(code).trigger('refresh');
            
            var doc = $(document);
            for (var i=0;i<messages.length;i++){ 
               // doc.on("vclick", "[id=vrn-inform-message-"+messages[i].id_message+"]", controller.clickMessage());
               
                $( document ).unbind('#vrn-inform-message-'+messages[i].id_message);
                $('#vrn-inform-message-'+messages[i].id_message).bind('vclick',function (event){
                    controller.clickMessage(this.id.replace("vrn-inform-message-",""));
               });
            }
            
            $("#vrn-inform-page").trigger('refresh'); 
        });

    };
    
    controller.clickMessage = function(id_message) {
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
        var r1 = app.repository.getRoadmapList(app.loggedUser.id);
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
               $('#vrn-roadmap-item-'+roadmap[i].id_roadmap).bind('vclick',function (event){
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
        //$.mobile.loadPage("gmaps.html",true);

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
            $content.height ($("#vrn-map").height - 30);
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
    controller.showPosPanel = function() {
       app.log("controller.showPosPanel", 'wip');
       //$.mobile.loadPage("pos_details.html",true);

       
        var show_status = "off";
        var pos_filter_list;
        var pos;
        
        // header
        $("#vrn-pos-header").html(controller.getHeader()).trigger('refresh');
        $("#vrn-pos-page").trigger('refresh');
        
        
        // get POS filter list
        var r1 = app.repository.getPosFilterList(app.loggedUser.id);
        r1.done(function(filter_list) {
            pos_filter_list = filter_list;
            // Todo : mettre dans l'ordre :)
            
        });
        
        // get Message list
        var r2 = app.repository.getPosList(app.loggedUser.id);
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
                +'    <a href="#" id="vrn-pos-item-'+pos[i].id_sales_point+'">'
                +'        <img class="ui-li-icon" alt="" src="css/images/vrn/forma1.png">'
                +'        <span id="vrn-pos-date-'+pos[i].id_sales_point+'" class="date">'+last_visit_id+'</span>'
                +'        <span class="vrn-name">'+pos[i].name+'</span> '
                +'        <span id="vrn-pos-type-'+pos[i].id_sales_point+'" class="type">- '+pos[i].type_name+'</span> '
                +'    </a>'
                +'</li>';   
            }
            $("#vrn-pos-list").html(code).trigger('create');
            $("#vrn-pos-page").trigger('refresh');
            
            // items listener
            var doc = $(document);
            for (var i=0;i<pos.length;i++){ 
               $('#vrn-pos-item-'+pos[i].id_sales_point).bind('vclick',function (event){
                    controller.showPosItem(this.id.replace("vrn-pos-item-",""));
               });
            }
        });

        $("#vrn-pos-page").trigger('create');
        $("#vrn-pos-page").fadeIn('slow');
    };
    
    controller.showPosItem = function(id_sales_point) {
        app.log("controller.showPosPanel", 'wip');
        
        //$.mobile.loadPage("gmaps.html",true);

        // header
        $("#vrn-pos-details-header").html(controller.getHeader()).trigger('create');
        
        // get POS item
        var r1 = app.repository.getPosItem(id_sales_point);
        r1.done(function(pos) {
            $('#vrn-name-pdv').val(pos.name);
            $('#vrn-street').val(pos.street);
            $('#vrn-code-postal').val(pos.postal_code);
            $('#vrn-city').val(pos.city);
            $('#vrn-contact-name').val(pos.contact_name);
            $('#vrn-telephone').val(pos.phone_number);
            $('#vrn-email').val(pos.email);
            $('#textarea-description').val(pos.description);
        });
        
        $("#vrn-pos-details-page").trigger('create');
        $("#vrn-pos-details-page").fadeIn('slow');

        
        
        
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
        var r1 = app.repository.getUserItem(app.loggedUser.id);
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
		var title = "";
        var company = app.translationCache[TID.COMPANY];
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
      	+ "	<div id=\"vrn-company\">"+company+"</div>"
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
			+ '  <li class="vrn-footer-navbar-li'+ addActiveClass("vrn-home-page", pageId) + '"><a href="#vrn-home-page" id="vrn-taskboard" class="btn-'+ addActiveClass("vrn-home-page", pageId) + '" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-task'+ addActiveClass("vrn-home-page", pageId) + '">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Taskboard</span></span></a></li>' 
			+ '  <li class="vrn-footer-navbar-li'+ addActiveClass("vrn-inform-page", pageId) + '"><a href="#vrn-inform-page" id="vrn-watchword" class="btn-'+ addActiveClass("vrn-inform-page", pageId) + '" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-inform'+ addActiveClass("vrn-inform-page", pageId) + '">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Info</span></span></a></li>' 
			+ '  <li class="vrn-footer-navbar-li'+ addActiveClass("vrn-roadmap-page", pageId) + '"><a href="#vrn-roadmap-page" id="vrn-roadmap" class="btn-'+ addActiveClass("vrn-roadmap-page", pageId) + '" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-road'+ addActiveClass("vrn-roadmap-page", pageId) + '">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Roadmap</span></span></a></li>' 
			+ '  <li class="vrn-footer-navbar-li'+ addActiveClass("vrn-pos-page", pageId) + '"><a href="#vrn-pos-page" id="vrn-pos" class="btn-'+ addActiveClass("vrn-pos-page", pageId) + '" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-pos'+ addActiveClass("vrn-pos-page", pageId) + '">&nbsp;</div><span class="vrn-footer-navbar-btn-text">POS</span></span></a></li>' 
			+ '  <li class="vrn-footer-navbar-li'+ addActiveClass("vrn-stats-page", pageId) + '"><a href="#vrn-stats-page" id="vrn-stats" class="btn-'+ addActiveClass("vrn-stats-page", pageId) + '" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-stats'+ addActiveClass("vrn-stats-page", pageId) + '">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Stats</span></span></a></li>' 
			+ '  <li class="vrn-footer-navbar-li'+ addActiveClass("vrn-params-page", pageId) + '"><a href="#vrn-params-page" id="vrn-params" class="btn-'+ addActiveClass("vrn-params-page", pageId) + '" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-params'+ addActiveClass("vrn-params-page", pageId) + '">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Param</span></span></a></li>' 
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
	
	controller.authenticate = function() {
		if (app.authenticatedInThisSession) {
			return;
		}
		
		//loginLoadingPopup.popup();
		controller.loginLoadingPopup.popup("open", {
			dataPositionTo : "window",
			dataTransition : "pop"
		}).trigger('create');

		if (controller.ajaxAsyncTask.active) {controller.callPhone
			app.log("app.controller.index: authenticate, canceling current async task", 'pause');
			controller.ajaxAsyncTask.cancel();
		}
		app.log("app.controller.index: authenticating (and creating a new async task) ...", 'wip');
		controller.ajaxAsyncTask = new app.utils.AjaxAsyncTask(true);
		app.webservice.authenticateUser(controller.ajaxAsyncTask, $("#vrn-username").val(), $("#vrn-password").val(), function(user) {
			app.loggedUser = user;
			app.authenticatedInThisSession = true;
			//$("#vrn-index-page").page();
			app.repository.saveOrUpdateUser(user, function(user) {
				// update ui
				app.log("app.controller.index: authenticated successfully", 'success');
				if ($("#vrn-remember-me").is(":checked")) {
					app.repository.updateSettings(user.id);
				} else {
					app.repository.updateSettings(0);
				}
				app.repository.checkUserData(user.id,
				    function() {
                        // if data ok
                        // show TASKBOARD
                        $.mobile.changePage($('#vrn-home-page'), {
                           transition:"slide",
                           changeHash:true,
                           reverse:true
                        });
                    },
                    function() {
                        // if no data
                        // purge db (juste data, no user infos)
                        app.repository.purgeData(function() {
                            // Sync Update Data
                            controller.syncUpdateData(function() {
                                // recup last sync data
                                app.repository.getLastSyncInfos(app.loggedUser.id, function(id, sync_id, userId, date) {
                                    app.log("getLastSyncInfos is ok : "+ date, 'success');
                                    controller.last_sync = new app.domain.sync_infos(id,sync_id,userId, date);
                                    
                                    // show TASKBOARD
                                    $.mobile.changePage($('#vrn-home-page'), {
                                       transition:"slide",
                                       changeHash:true,
                                       reverse:true
                                    });
                                }); 
                                 
                            });   
                        });
                    }
				);
			}, function(error) {
				// show saving error or warning
				app.log("app.controller.index: authenticated, but saving errors", 'err');
				controller.loginLoadingPopup.popup("close");
				controller.errorLoadingPopup.popup("open", {
					dataPositionTo : "window",
					dataTransition : "pop",
					dataTheme : "b"
				}).trigger('create');
			});
		}, function(errorTranslationId) {
			// show network error
			//
			app.log("app.controller.index : authentication failed because of network errors : ", 'err');
			controller.loginLoadingPopup.popup("close");
            controller.errorLoadingPopup.popup("open", {
                dataPositionTo : "window",
                dataTransition : "pop",
                dataTheme : "b"
            }).trigger('create');
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
    
	return controller;
}());