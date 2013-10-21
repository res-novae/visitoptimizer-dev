'use strict';

app.controller = (function() {

    var controller = {};
    
    //var app = null;
    var trad;
    var TID;
    var loginLoadingPopup;
    var errorLoadingPopup;
    var settings;
    var last_sync;
    var messages;
    var pos;
    var daily_roadmap;
    
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
        app.log("## app.controller : init", 'wip');

        $.support.cors = true; // crossdomain
        $.mobile.allowCrossDomainPages = true; // crossdomain
        
        $.mobile.pushStateEnabled = false; // modification du comportement de navigation
        $.mobile.page.prototype.options.domCache = true; //  mise en cache des pages (vs page dynamiques) 
       
        //$.mobile.ignoreContentEnabled = true;
        //$.mobile.touchOverflowEnabled = true;

        
        
        //preload 
        if($.mobile.activePage.attr('id') == 'vrn-index-loading'){
            app.log('preload en cours...');

            $.mobile.loadPage("vrn-login-page.html",true);
            $.mobile.loadPage("vrn-sync-page.html",true);
            $.mobile.loadPage("vrn-home-page.html",true);
            $.mobile.loadPage("vrn-inform-page.html",true);
           // $.mobile.loadPage("vrn-inform-detail-pop.html",true);
            
            
            
  //          $.mobile.loadPage("vrn-roadmap-page.html",true);
            
  //          $.mobile.loadPage("vrn-roadmap-item-page.html",true);
  //          $.mobile.loadPage("vrn-roadmap-item-pos-edit-page.html",true);
            //$.mobile.loadPage("vrn-current-roadmap-item-list-page.html",true);
            
            $.mobile.loadPage("vrn-roadmap-visit-page.html",true);
            $.mobile.loadPage("vrn-roadmap-visit-questionnaire-page.html",true);
/*            
            $.mobile.loadPage("vrn-pos-page.html",true);
            $.mobile.loadPage("vrn-stats-page.html",true);
            $.mobile.loadPage("vrn-params-page.html",true);
*/   
            
            // test si la db existe
            app.log("::Init:: Step 1 : DB test");
            var r1 = app.repository.checkStartDatabaseExist();
            r1.done(function() {});
            $.when(r1).done(function(dbExist) {
                //alert(dbExist);
                if(dbExist == 'yes') {
                    app.log("app.repository: DB : " + app.repository.databaseName + " exist");
                    
                    // recup le setting (remerber me) si exist
                    var r2 = app.repository.loadSettingsB();
                    r2.done(function() {});
                    $.when(r2).done(function(settings) {
                    
                        app.log("::Init:: Step 2 : Load user setting...");
                        if(settings.userId == 0) {
                            app.log("::Init:: Step 3 : No setting exist");
                            app.authenticatedInThisSession = false;

                            
                            var r3 = app.repository.getTranslation([256,323,324,257,451,771,1155]);
                            r3.done(function(data) {
                                trad = data;
                            });
                            $.when(r3).done(function(data) {
                                trad = data;
                                //alert('trad:'+trad[256]);
                                $.mobile.changePage('#vrn-login-page', {transition:"pop",changeHash:true,reverse:true});
                            });
                            
                            /*
                            // show login panel
                            $.mobile.changePage("#vrn-login-page", {
                               transition:"pop",
                               changeHash:true,
                               reverse:true
                            });
*/
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
                                            $.mobile.changePage("#vrn-home-page", {
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
                                                
                                                $.mobile.changePage("#vrn-home-page", {
                                                   transition:"slide",
                                                   changeHash:false,
                                                   reverse:true
                                                });
                                                //controller.showVrnHomePage(); 
                                            }); 
                                             
                                        });
                                   }
                               );

                            });
                        }
                        
                        
                    });

                }else {
                    app.log("app.repository: DB : " + app.repository.databaseName + " does not exist");
                    
                    var r2 = app.repository.firstInitDbApp();
                    r2.done(function(data) {});
                    $.when(r2).done(function(data) {
                        
                        app.log("::Init:: Step 2 : Init light DB (with login translation only)");
                        app.authenticatedInThisSession = false;

                        var r3 = app.repository.getTranslation([256,323,324,257,451,771,1155]);
                        r3.done(function(data) {
                            trad = data;
                        });
                        $.when(r3).done(function(data) {
                            trad = data;
                            //alert('trad:'+trad[256]);
                            $.mobile.changePage('#vrn-login-page', {transition:"pop",changeHash:true,reverse:true});
                        });

                        return;
                    });
                }
                app.log('preload fini.');
            });
 
            
        }   

        
    };
    
    // Before Show
    $( document ).unbind( "pagebeforeshow");
    $(document).bind("pagebeforeshow", function(e, data) {
        app.log(':: event : B : pagebeforeshow : '+$.mobile.activePage.attr('id'), 'wip');
        
        var r1 = app.repository.checkDatabaseExist();
        r1.done(function() {});
        $.when(r1).done(function(dbExist) {
            //alert($.mobile.activePage.attr('id'));
            
            //alert(dbExist);
            if(dbExist == 'yes' || $.mobile.activePage.attr('id') == 'vrn-login-page') {
                // Login Panel //
                if($.mobile.activePage.attr('id') == 'vrn-login-page'){
                   controller.showVrnLoginPage();
                }
                // Sync Splash //
                if($.mobile.activePage.attr('id') == 'vrn-sync-page'){
                    $('#vrn-login').hide();
                    $("#vrn-login-page").hide();
                    controller.showVrnSyncPage();
                }
                // Home / Taskboard //
                if($.mobile.activePage.attr('id') == 'vrn-home-page'){
                    $('#vrn-login').hide();
                    controller.showVrnHomePage(e,data);
                }
                // Infos / Watchwords //
                if($.mobile.activePage.attr('id') == 'vrn-inform-page'){
                    controller.showVrnInformPage(e,data);
                }
                // Road map //
                if($.mobile.activePage.attr('id') == 'vrn-roadmap-page'){
                    controller.showVrnRoadmapPage();
                }
                if($.mobile.activePage.attr('id') == 'vrn-ronav-glyphish-exampleadmap-item-page'){
                    controller.showVrnRoadmapItemPage(current_params_url['roadmap_id'],'create');
                }
                // roadmap form list ... semble ne pas etre utilisé
                if($.mobile.activePage.attr('id') == 'vrn-form-list-page'){
                    alert('la y a un truc pas clair...');
                    controller.showRoadmapItem(current_params_url['roadmap_id'],'create');
                }
                // roadmap / questionnaire list
                if($.mobile.activePage.attr('id') == 'vrn-roadmap-visit-page'){
                    controller.showVrnRoadmapVisitPage(current_params_url['sp_visit_id']);
                }
                // roadmap / questionnaire item
                if($.mobile.activePage.attr('id') == 'vrn-roadmap-visit-questionnaire-page'){
                    controller.showVrnRoadmapVisitQuestionnairePage(current_params_url['sp_visit_id'], current_params_url['questionnaire_id']);
                    return;
                }
                
                 
        
                // POS //
                if($.mobile.activePage.attr('id') == 'vrn-pos-page'){
                    controller.showVrnPosPage(e,data);
                }
                
                // check this func..... semble ne pas etre utilisé
                if($.mobile.activePage.attr('id') == 'vrn-pos-identity-page'){
                    controller.showVrnPosIdentityPage( current_params_url['sales_point_id']);
                }
                
                if($.mobile.activePage.attr('id') == 'vrn-pos-edit-page'){
                    if(typeof current_params_url['sales_point_id'] != 'undefined') controller.showVrnPosEditPage( current_params_url['sales_point_id']);
                    else controller.showVrnPosEditPage(0);
                }
                // Stats //
                if($.mobile.activePage.attr('id') == 'vrn-stats-page'){
                    controller.showVrnStatsPage();
                }
                // Params //
                if($.mobile.activePage.attr('id') == 'vrn-params-page'){
                    controller.showVrnParamsPage();
                }
                if($.mobile.activePage.attr('id') == 'vrn-params-edit-page'){
                    controller.showVrnParamsEditPage();
                }
            }else if($.mobile.activePage.attr('id') != 'vrn-index-loading'){
                // retour à init si pas de db
              //  $.mobile.changePage('#vrn-index-loading', {transition:"pop",changeHash:false,reverse:false});
            }
        });
    });

    $( document ).unbind( "popupbeforeposition");
    $( document ).bind( "popupbeforeposition", function( e, data ){
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
        if(current_params_url['id_parent_pop'] == 'vrn-pos-identity-pop'){
            controller.showPosPop(current_params_url['id']);
        }
        
        // POS : item map pop //
        if(current_params_url['id_parent_pop'] == 'vrn-pos-identity-map-pop'){
            controller.showPosMapPop(current_params_url['id'],current_params_url['gps_latitude'],current_params_url['gps_longitude']);
        }

    });  
    
    // parse URL to generate params values
    controller.getParamUrl = function(event){
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
            event.preventDefault();
            //                    transition:"slide",
            //                    changeHash:true,
            //                      reverse:false
            if(current_params_url['op'] == "openPage"){
             //   $.mobile.changePage("#"+current_params_url['pageId'], {
             //       transition: "none"

             //   });
                event.preventDefault();
            }else if(current_params_url['op'] == "openPop"){
                $("#"+current_params_url['popId']).popup('open');
            }
            
            
        }
        // alert(current_params_url['id_parent_pop']);
    }
    
    // ==> Login Panel //
    controller.showVrnLoginPage = function() {
        app.log("controller.showVrnLoginPage", 'wip');
        
        // init les popups infos
        controller.loginLoadingPopup = $("#vrn-login-popup");
        controller.loginLoadingPopup.popup();
        controller.errorLoadingPopup = $("#vrn-login-error-popup");
        controller.errorLoadingPopup.popup();

       // alert('hop:'+ trad["256"]);

    
        // show header
        controller.showVrnHeader();
        
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
        doc.on("tap", "[id=vrn-login]", controller.authenticate);
        doc.on("tap", "[id=vrn-login-popup-cancel]", function() {
            
            if (controller.ajaxAsyncTask.active) {
                app.log("app.controller.index: cancel current async task", 'pause');
                controller.ajaxAsyncTask.cancel();
            }
            $("#vrn-login-popup").popup('close', {
                dataRel : "back"
            });
        });
        $(".vrn-page").trigger('updatelayout');
            


    };
    
    
    // message de sync WAIT !
    controller.showVrnSyncPage = function() {
        app.log("controller.showVrnSyncPage", 'wip');
        // header
        $("#vrn-sync-header").html(controller.getHeader()).trigger('refresh');
        $("#vrn-sync-page").trigger('change');  
        
    };
    
    // ==> HOMEPAGE / TaskBoard //
    controller.showVrnHomePage = function(e,data) {
        app.log("controller.showVrnHomePage", 'wip');
        
        // preload pages
        //$.mobile.loadPage("inform.html",true);
       // $.mobile.loadPage("roadmap.html",false);
        ///location.hash="aaaaaaaaaa";
        //$.mobile.loadPage("pos.html",true);
        // override navigation url

        // header and footer
        $.mobile.navigate( "#vrn-home-page" );
        controller.showVrnHeader();
        controller.showVrnFooter('vrn-home-page');
        
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

        
        // test si tournee du jour (fake pour le dev : si une tournee existe)
        var r3 = app.repository.getDailyRoadmapItem();
        r3.done(function(roadmap) {
            daily_roadmap = roadmap;
        });
        
        
        // final execute
        $.when(r1, r2, r3).done(function(messages) {
            //controller.loginLoadingPopup.popup("close");
            
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
            
        
            // road map panel
            if(daily_roadmap.id_roadmap != 0) {
                $("#roadmap_daily").show();
                $("#roadmap_create").hide();
                var nb_total_visit = daily_roadmap.pos_list.length;
                var nb_total_visited = 0;
                var curent_vist_id = 0;
                var next_vist_id = 0
                for (var i=0;i<daily_roadmap.pos_list.length;i++){ 
                    if(daily_roadmap.pos_list[i].sp_visit__status_visit_id != 1 && daily_roadmap.pos_list[i].sp_visit__status_visit_id != 2 && daily_roadmap.pos_list[i].sp_visit__status_visit_id != 3) 
                        nb_total_visited++;
                    
                    if(daily_roadmap.pos_list[i].sp_visit__status_visit_id == 2 || daily_roadmap.pos_list[i].sp_visit__status_visit_id == 3)
                        curent_vist_id = daily_roadmap.pos_list[i].sp_visit__status_visit_id
                }
                $('#vrn-home-page-visit-counter').html( nb_total_visited + " / " +nb_total_visit );
                
                $('#vrn-home-page-visit-title').html(daily_roadmap.pos_list[0].sp_visit__status_visit_name);
                $('#vrn-home-page-visit-pos-name').html(daily_roadmap.pos_list[0].name +" - "+ daily_roadmap.pos_list[0].type_name);
                $('#vrn-home-page-visit-pos-contact-name').html(daily_roadmap.pos_list[0].contact_name);
                $('#vrn-home-page-visit-pos-adress').html(daily_roadmap.pos_list[0].street +", "+ daily_roadmap.pos_list[0].postal_code + " " +daily_roadmap.pos_list[0].city);
                $('#vrn-home-page-visit-pos-tel').html(daily_roadmap.pos_list[0].phone_number);
                $('#vrn-home-page-visit-pos-description').html(daily_roadmap.pos_list[0].description);
               
                $('#vrn-lancer').attr("data-url", "?op=openPage&pageId=vrn-roadmap-visit-page&transition=slide&sp_visit_id="+daily_roadmap.pos_list[0].sp_visit__id_visit+"&roadmap_id="+daily_roadmap.pos_list[0].roadmap_id+"&sales_point_id="+daily_roadmap.pos_list[0].id_sales_point);
                $('#vrn-lancer').unbind('tap');
                $('#vrn-lancer').bind('tap', controller.getParamUrl);
                
            }else{
                $("#roadmap_create").show();
                $("#roadmap_daily").hide();
            }
            
        });
        
    };
    
    // ==> Watchwords / Infos / Consignes //
    controller.showVrnInformPage = function(e,data) {
        app.log("controller.showVrnInformPage", 'wip');
        
        // header et footer
        $.mobile.navigate( "#vrn-inform-page" );
        controller.showVrnHeader();
        controller.showVrnFooter('vrn-inform-page');
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
                     var ico_priority = '<img class="ui-li-icon" alt="" src="./css/images/vrn/star.png">';
                } else var ico_priority = '';
                
                if(messages[i].read == '1' && messages[i].attachment == ''){
                    var ico_check = 3;                    
                }else if(messages[i].read == '0' && messages[i].attachment == ''){
                    var ico_check = 2;
                    valid_all_infos = 0;
                }else if(messages[i].read == '1' && messages[i].attachment != ''){
                    var ico_check = 1;
                }else if(messages[i].read == '0' && messages[i].attachment != ''){
                    var ico_check = 4;
                    valid_all_infos = 0;
                } else 
                var ico_check = '';
                
                
                 code += '<li data-icon="check'+ico_check+'" id="vrn-inform-message-li-'+messages[i].id_message+'">'+
                 '  <a href="#vrn-inform-detail-pop" data-url="?id_parent_pop=vrn-inform-detail-pop&id='+messages[i].id_message+'" id="vrn-inform-message-'+messages[i].id_message+'" class="inform-detail-lnk" data-ajax="true" data-transition="pop" data-inline="true" data-rel="popup">'+
                           ico_priority+
                     '      <span class="min_color">'+messages[i].send_date+'</span>'+
                     '      <span class="Information">'+title+'</span> '+
                     '      <span class="text">De </span><span class="text_bold"> '+messages[i].lastname+'</span> '+
                     '      <p class="myParagraph">'+messages[i].content+'</p> '+
                     '  </a>'+
                     '</li>';
            }
            code += '</ul>';
            $("#vrn-inform-div").html(code).trigger('create');
            
            if(valid_all_infos == 0){
                $("[data-role=footer]").height(161);
                $(".vrn-inform-valider").height(81);
                var code = '<div class="ui-grid-a" id="custom-grid-a">'+
                    '       <div class="ui-block-a vrn-inform-valider-text">Vous n’avez pas consulté toutes les consignes !</div>'+
                    '       <div class="ui-block-b vrn-valider-button">'+
                    '           <a href="#vrn-home-page" data-url="vrn-home-page" id="vrn-valider" data-role="button" data-transition="slidedown" data-icon="triangle_right_black_image_2" data-iconpos="right" data-inline="true">Valider</a>'+     
                    '       </div>'+
                    '   </div>';
                $(".vrn-inform-valider").html(code).trigger('create').show();
                
                //alert('hopshow infos');
            }else{
                $(".vrn-inform-valider").hide();
                $("[data-role=footer]").height(80);
            }
            
            $('.inform-detail-lnk').unbind('tap');
            $('.inform-detail-lnk').bind('tap', controller.getParamUrl);
            
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
                    controller.messages[i].read = '1';
                    $('#vrn-inform-message-li-'+id_message+' .ui-icon.ui-icon-check2.ui-icon-shadow').css({"background-image" : "url(css/images/vrn/check3.png)"}).animate({opacity: 1});
                }else if(controller.messages[i].read == '1' && controller.messages[i].attachment != ''){
                    // link file
                }else if(controller.messages[i].read == '0' && controller.messages[i].attachment != ''){
                    // check and relaod item + link file
                    controller.checkMessageStatus(controller.messages[i].id_message);
                    controller.messages[i].read = '1';
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
            if(controller.messages[i].read == '1'){
                // nothing
            }else if(controller.messages[i].read == '0' ){
                valid_all_infos = 0;
            }
        }
       // alert('val:'+valid_all_infos);
        if(valid_all_infos == 1){
            $(".vrn-inform-valider").hide();
            $("[data-role=footer]").height(80);
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
    

    
    
      ////////////////////
     // ==> Roadmap == //
    ////////////////////
    
    // Roadmap : roadmap panel : liste des tournees
    controller.showVrnRoadmapPage = function() {
       app.log("controller.showVrnRoadmapPage", 'wip');
        
       // header et footer
       $.mobile.navigate( "#vrn-roadmap-page" );
       controller.showVrnHeader();
       controller.showVrnFooter('vrn-roadmap-page');
       $("#vrn-roadmap-page").trigger('refresh');
        
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
                //var visit = "09/10";
                code += '<li data-icon="arrow-r2">'
                +'    <a href="#vrn-roadmap-item-page" data-url="?roadmap_id='+roadmap[i].id_roadmap+'" class="vrn-roadmap-list-item-lnk">'
                +'      <div class="vrn-roadmap-item-left">'
                +'         <span class="vrn-roadmap-date">'+roadmap[i].scheduled_date+'</span> '
                +'         <span class="vrn-roadmap-area">'+roadmap[i].area_name+'</span> '
                +'         <span class="vrn-roadmap-profil">'+roadmap[i].initiating_user_categories__name+'</span> '
                +'      </div>'
                +'      <div class="vrn-roadmap-item-middle">'
                +'        <span class="vrn-roadmap-visit_title">Visites '
                +'          <span class="vrn-roadmap-visit">'+roadmap[i].nb_visited+'/'+roadmap[i].nb_visit+'</span> '
                +'        </span> '
                +'        <span class="vrn-roadmap-visit-status">'+roadmap[i].roadmap_status_visit__name+'</span> '
                +'      </div>'
                +'      <div class="vrn-roadmap-item-right"></div>'
                +'    </a>'
                +'</li>';   
            }
            $("#vrn-roadmap-list").html(code).trigger('create');
            
            $('.vrn-roadmap-list-item-lnk').unbind('tap');
            $('.vrn-roadmap-list-item-lnk').bind('tap', controller.getParamUrl);
        });

    };
    
    // Roadmap : show roadmap item (liste de pos)
    controller.showVrnRoadmapItemPage = function(roadmap_id,action) {
        app.log("controller.showVrnRoadmapItemPage", 'wip');
        
        if(action == 'create'){
            // header et footer
            $.mobile.navigate( "#vrn-roadmap-item-page" );
            controller.showVrnHeader();
            controller.showVrnFooter('vrn-roadmap-page');
            $("#vrn-roadmap-item-page").trigger('refresh');
        }
        
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
                
                if(pos[i].sp_visit__status_visit_id == "1") var ico_staus_visit = "<a href=\"#vrn-roadmap-item-pos-delete-pop\" data-url=\"?mode_edit=add&id_parent_pop=vrn-roadmap-item-pos-delete-pop&roadmap_id="+pos[i].roadmap_id+"&sales_point_id="+pos[i].id_sales_point+"\" data-transition=\"pop\" data-rel=\"popup\" class=\"vrn-roadmap-list-item-pos-delete-lnk\"><img src=\"./css/images/vrn/x-ul-ala.png\"></a>";
                else var ico_staus_visit = "<img class=\"ui-li-icon ui-li-thumb\" alt=\"\" src=\"./css/images/vrn/bifa.png\">";
                
                code += '<li data-icon="circle-with-i" id="vrn-roadmap-edit-item-'+pos[i].id_sales_point+'" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="div" data-iconpos="right" data-theme="c" class="ui-btn ui-btn-icon-right ui-li-has-arrow ui-li ui-li-has-icon ui-btn-up-c">'
                +'<span class="float-right-icon">'+ico_staus_visit+'</span>'
                +'<span class="float-right-icon"><a href="#vrn-roadmap-item-pos-detail-pop" data-url="?mode_edit=add&id_parent_pop=vrn-roadmap-item-pos-detail-pop&roadmap_id='+pos[i].roadmap_id+'&sales_point_id='+pos[i].id_sales_point+'" data-transition=\"pop\" data-rel=\"popup\" class="vrn-roadmap-list-item-pos-detail-lnkb"><img src="./css/images/vrn/i-ul-ala.png"></a></span>'
                +'<div class="ui-btn-inner ui-li">'
                +'<div class="ui-btn-text">'
                +'<img class="ui-li-icon ui-li-thumb" alt="" src="./css/images/vrn/circle-with-arrows.png">'
                +'<a href="#vrn-roadmap-item-pos-detail-pop" data-url="?mode_edit=add&id_parent_pop=vrn-roadmap-item-pos-detail-pop&roadmap_id='+pos[i].roadmap_id+'&sales_point_id='+pos[i].id_sales_point+'" data-transition=\"pop\" data-rel=\"popup\" class="vrn-roadmap-list-item-pos-detail-lnk">'
               // +'<span class="date">Dernière <span class="bold">'+last_visit_id+'</span></span>'
                +'<span class="vrn-name-road-creation-page">'+pos[i].name+'</span> '
                +'<span class="type">- '+pos[i].type_name+'</span> '
                +'</a>'
                +'</div>'
                +'</div>'
                +'</li>';
            } 
                
            if(action == 'create') $("#vrn-roadmap-item-list").html(code).trigger('create');
            else $("#vrn-roadmap-item-list").html(code).trigger('refresh');
            
            $("#vrn-roadmap-item-no-pdv").val(pos.length);
            
            $('#vrn-roadmap-item-pos-add-button').attr("data-url", "?id_parent_pop=vrn-roadmap-item-pos-add-pop&roadmap_id="+roadmap_id);
            $('#vrn-roadmap-item-pos-add-button').unbind('tap');
            $('#vrn-roadmap-item-pos-add-button').bind('tap', controller.getParamUrl);
            
            $('.vrn-roadmap-list-item-pos-detail-lnk').unbind('tap');
            $('.vrn-roadmap-list-item-pos-detail-lnk').bind('tap', controller.getParamUrl);
            $('.vrn-roadmap-list-item-pos-detail-lnkb').unbind('tap');
            $('.vrn-roadmap-list-item-pos-detail-lnkb').bind('tap', controller.getParamUrl);
        
            $('.vrn-roadmap-list-item-pos-delete-lnk').unbind('tap');
            $('.vrn-roadmap-list-item-pos-delete-lnk').bind('tap', controller.getParamUrl);
            
            if(action == 'refresh') window.setTimeout( "$('#vrn-roadmap-item-page').trigger('refresh')" ,1000); 
            //                        window.setTimeout(controller.showVrnRoadmapItemPage(roadmap_id,'refresh'),1000);
            
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
           $('#vrn-identity-top-left').html(pos.name);
           // derniere visit ? last_visit_id
           if(pos.last_visit_id == "0") $('#vrn-roadmap-item-pos-top-right').hide();
           else $('#vrn-roadmap-item-pos-top-right').show();
           $('#vrn-roadmap-item-pos-title').html(pos.name);
           $('#vrn-roadmap-item-pos-address').html(pos.street + ", " +pos.postal_code+ " " +pos.city);
           $('#vrn-roadmap-item-pos-seller-name').html(pos.contact_name);
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
           $('#vrn-roadmap-item-pos-button').attr("data-url", "?id_parent=vrn-pos-edit-page&roadmap_id="+roadmap_id+"&sales_point_id="+sales_point_id+"");

          
       });
       
       // final execute
       $.when(r1).done(function(roadmap_retour, sp_list) {
           

       });
       
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
       $('#vrn-roadmap-item-pos-map-lnk').bind('tap', controller.getParamUrl);
       
       $('#vrn-roadmap-item-pos-button').unbind('tap');
       $('#vrn-roadmap-item-pos-button').bind('tap', controller.getParamUrl);

    };

    controller.showRoadmapItemPosMapPop = function(roadmap_id, sales_point_id, gps_latitude, gps_longitude) {
        app.log("controller.showRoadmapItemPosMapPop", 'wip');
            
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
        var $content = $("#vrn-roadmap-item-pos-map-pop div:jqmData(role=content)");
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
    
    // delete pos item to list
    controller.showRoadmapItemPosDeletePop = function(roadmap_id,sales_point_id) {
        app.log("controller.showRoadmapItemPosDeletePop", 'wip');
        $('#vrn-roadmap-item-pos-delete-btn').unbind('tap');
        $('#vrn-roadmap-item-pos-delete-btn').bind('tap',function (event){
            // delete in DB
            app.repository.deleteRoadMapItemPos(roadmap_id,sales_point_id);
            // delete item to list
            $('#vrn-roadmap-edit-item-'+sales_point_id).remove();
            // close pop
            $('#vrn-roadmap-item-pos-delete-pop').popup('close');
            // refresh list count
            $('#vrn-roadmap-item-no-pdv').val($('#vrn-roadmap-item-list').size());
        });
    };
    
    
    var pos_seleted;
    controller.addRoadmapItemPosPop = function(roadmap_id) {
        app.log("controller.addRoadmapItemPosPop", 'wip');
            
        
        pos_seleted = Array();
        
        // all pos list
        var r1 = app.repository.getAllRoadmapItemPosList();
        r1.done(function(pos_listA) {
            var allpos = pos_listA;
        });
        
        // roadmap pos list
        var r2 = app.repository.getRoadmapItemPosList(roadmap_id);
        r2.done(function(pos_listB) {
            var pos = pos_listB;
        });

        // final execute
        $.when(r1, r2).done(function(pos_listA,pos_listB) {
            var allpos = pos_listA;
            var pos = pos_listB;
            var code = '';
            for (var i=0;i<allpos.length;i++){ 
                
                pos_seleted[i]= Array();
                
                pos_seleted[i]['id'] = allpos[i].id_sales_point;
                
                var pos_present = 'no';
                for (var j=0;j<pos.length;j++){ 
                    if(allpos[i].id_sales_point == pos[j].id_sales_point) pos_present = 'yes';
                }
                
                if (pos_present == 'yes') {
                    pos_seleted[i]['value'] = 1;
                    var ico_add = '<a href="#" data-url="?roadmap_id='+roadmap_id+'&sales_point_id='+allpos[i].id_sales_point+'" class="vrn-name-road-add-pos-btn"><img alt="" src="css/images/vrn/forma4_1.png" id="vrn-name-road-add-pos-radio-'+allpos[i].id_sales_point+'"></a>';
                }else{ 
                    pos_seleted[i]['value'] = 0;
                    var ico_add = '<a href="#" data-url="?roadmap_id='+roadmap_id+'&sales_point_id='+allpos[i].id_sales_point+'" class="vrn-name-road-add-pos-btn"><img alt="" src="css/images/vrn/forma3_1.png" id="vrn-name-road-add-pos-radio-'+allpos[i].id_sales_point+'"></a>';
                }
                
                code += '<li data-icon="false">' +
                        '   <div data-role="collapsible" data-collapsed="true" id="vrn-name-road-add-pos-li-title-'+allpos[i].id_sales_point+'">' +
                        '       <h3>' +
                        '           <a href="identity.html">' +
                        '               <span class="vrn-name-road-add-pos-page">'+allpos[i].name+'</span>' +
                       // '             <span class="vrn-date">J -15</span>' +
                        '           </a>' +
                        '               <div class="float-right-icon">' +
                        '               ' + ico_add +
                        '               </div>' +
                        '               <div class="float-right-icon">' +
                        '                   <a href="#" data="$(\'#vrn-name-road-add-pos-li-detail-'+allpos[i].id_sales_point+'\').toggle();"><img alt="" src="css/images/vrn/forma1_4.png"></a>' +
                        '               </div>' +
                        '               <div class="five_stars"></div>' +
                        '       </h3>' +
                        '   </div>' +
                        '   <br/>' +
                        '   <div id="vrn-name-road-add-pos-li-detail-'+allpos[i].id_sales_point+'" style="display:none;">' +
                        '           ' + allpos[i].street + ", " +allpos[i].postal_code+ " " +allpos[i].city
                        '   </div>' +
                        '</li>';
            } 
                
            $("#vrn-roadmap-item-pos-add-list").html(code).trigger('refresh');  
            
            $('.vrn-name-road-add-pos-btn').unbind('tap');
            $('.vrn-name-road-add-pos-btn').bind('tap', function(event){
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
                controller.addRoadmapItemPosPopChangeSetectRadio(current_params_url['roadmap_id'],current_params_url['sales_point_id'])
            });
            
        });
        
        
        $('#vrn-roadmap-item-pos-add-save-btn').bind('tap', function(event){
            
            for (var i=0;i<pos_seleted.length;i++){ 
                app.log(i + ': '+pos_seleted[i]['id'] + ' : '+pos_seleted[i]['value']);
                if(pos_seleted[i]['value'] == 1) {
                    // test si le pos existe deja en db
                    
                    var r1 = app.repository.testRoadMapItemPos(roadmap_id,pos_seleted[i]['id']);
                    r1.done(function(sales_point_id, retour) {
                        if(retour == "no"){
                            // id_visit, sales_point_id, roadmap_id, status_visit_id, scheduled_date, performed_date, rank, comment, local_id
                            var data = [ new Date().getTime() + i , sales_point_id, roadmap_id, 1, app.utils.convertTimestampToDateIso(new Date().getTime(),'-'), '', 0 , '' ,0 ];
                            app.repository.addRoadMapItemPos(data);
                        }
                    });

                }else{
                    app.repository.deleteRoadMapItemPos(roadmap_id,pos_seleted[i]['id']);
                }
             }
            
            //$('#vrn-roadmap-item-pos-add-pop').popup('close');
            window.setTimeout(controller.showVrnRoadmapItemPage(roadmap_id,'refresh'),1000); 
            
            //showRoadmapItem
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
        $.mobile.navigate( "#vvrn-current-roadmap-item-list-page" );
        controller.showVrnHeader();
        controller.showVrnFooter('vrn-roadmap-page');
        $("#vrn-current-roadmap-item-list-page").trigger('refresh');
        
    };
    
    
    
    
    var current_sp_visit_id;
    controller.showVrnRoadmapVisitPage = function(sp_visit_id) {
        app.log("controller.showVrnRoadmapVisitPage", 'wip');

        // header et footer
        $.mobile.navigate( "#vrn-roadmap-visit-page" );
        controller.showVrnHeader();
        controller.showVrnFooter('vrn-roadmap-page');
        $("#vrn-form-list-page").trigger('refresh');
        
        

        // test si tournee du jour (fake pour le dev : si une tournee existe)
        var r1 = app.repository.getDailyRoadmapItem();
        r1.done(function(roadmap) {
            daily_roadmap = roadmap;
        });
        
        $.when(r1).done(function(roadmap) {
            daily_roadmap = roadmap;
            
            current_sp_visit_id = daily_roadmap.pos_list[0].sp_visit__id_visit;
            
            // test si tournee du jour (fake pour le dev : si une tournee existe)
            var r2 = app.repository.getPosVisit(daily_roadmap.pos_list[0].sp_visit__id_visit);
            r2.done(function(data_r2) {
                var pos = data_r2;
            });
    
            var r3 = app.repository.getQuestionnaires(daily_roadmap.pos_list[0].sp_visit__id_visit);
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
                            +'        <a href="#vrn-roadmap-visit-questionnaire-page" data-url="?op=openPage&pageId=vrn-roadmap-visit-questionnaire-page&transition=slide&sp_visit_id='+daily_roadmap.pos_list[0].sp_visit__id_visit+'&questionnaire_id='+questionnaires[i].id_questionnaire+'" id="questionnaire_btn_'+questionnaires[i].id_questionnaire+'" class="vrn-form-list-page-lnk" data-ajax="true">'
                            +'        '+img
                            +'        <span class="vrn-qest">Questions validées <span class="bold">'+questionnaires[i].nb_answer+'/'+questionnaires[i].nb_question+'</span></span>'
                            +'        <span class="vrn-form-name">'+questionnaires[i].name+'</span>'
                            +'      </a>'
                            +'</li>';
                    }else{
                        codeB += '<li class="ui-corner-all" data-icon="arrow-r-white">'
                            +'        <a href="#vrn-roadmap-visit-questionnaire-page" data-url="?op=openPage&pageId=vrn-roadmap-visit-questionnaire-page&transition=slide&sp_visit_id='+daily_roadmap.pos_list[0].sp_visit__id_visit+'&questionnaire_id='+questionnaires[i].id_questionnaire+'" id="questionnaire_btn_'+questionnaires[i].id_questionnaire+'" class="vrn-form-list-page-lnk" data-ajax="true">'
                            +'        '+img
                            +'        <span class="vrn-qest">Questions validées <span class="bold">'+questionnaires[i].nb_answer+'/'+questionnaires[i].nb_question+'</span></span>'
                            +'        <span class="vrn-form-name">'+questionnaires[i].name+'</span>'
                            +'      </a>'
                            +'</li>';
                    }
                    
                }
                $("#vrn-form-list").html(code).listview('refresh');
                $("#vrn-form-optional-list").html(codeB).listview('refresh');
                
                for (var i=0;i<status_visit.length;i++){
                    if(nb_questionnaires_obligat == nb_questionnaires_obligat_valid && status_visit[i].id_status_visit == 6) var selected = " selected";
                    else var selected = "";
                    $('#vrn-comment-cloturee-type').append('<option value="'+status_visit[i].id_status_visit+'"'+selected+'>'+status_visit[i].name+'</option>');
                } 
                
                // btn listeners
                for (var i=0;i<questionnaires.length;i++){ 
                    $('#questionnaire_btn_'+questionnaires[i].id_questionnaire).unbind('tap');
                    $('#questionnaire_btn_'+questionnaires[i].id_questionnaire).bind('tap', controller.getParamUrl);
                }
                
                $('#vrn-btn-close-visit').unbind('tap');
                $('#vrn-btn-close-visit').bind('tap', function(){ 
                    
                    if(nb_questionnaires_obligat == nb_questionnaires_obligat_valid) {
                        $('#vrn-comment-cloturee-alert').show();
                    }else{
                        $('#vrn-comment-cloturee-alert').hide();
                    }
                    
                    $('#vrn-comment-cloturee-form').toggle("slide"); 
                    
               /*     setTimeout(function () {
                        $.mobile.silentScroll( $('#vrn-comment-cloturee-form-bottom').offset().top );
                    }, 700);
                */ 
                    /*
                    $( "#vrn-comment-cloturee-form" ).slideDown( "slow", function() {
                        //$.mobile.silentScroll( $('#vrn-comment-cloturee-form-bottom').offset().top );
                    });
                    */
                });
                $('#vrn-comment-cloturee-form-cancel-button').bind('tap', function(){ 
                    $('#vrn-comment-cloturee-form').toggle("slide");
                });

                $('#vrn-comment-cloturee-form-valider-button').unbind('tap');
                $('#vrn-comment-cloturee-form-valider-button').bind('tap',  controller.closeRoadmapVisit());
            });
        
        });

    };
    
    controller.closeRoadmapVisit = function() {
        app.log("controller.closeRoadmapVisit", 'wip');
        
        var data = [ $('#vrn-comment-cloturee-type').val(), app.utils.convertTimestampToDateIso(new Date().getTime(),'-'), $('#textarea-comment-cloture').val(), current_sp_visit_id ];
        
        var r1 = app.repository.closeRoadmapVisit(data);
        
        r1.done(function(pos) {
            $.mobile.changePage("#vrn-home-page", {
                transition:"slide",
                changeHash:true,
                reverse:true
             });
        })
        
        
    };
    
    
    var questionnaire;
    var questions;
    var questions_answer;
    var sp_answers;

    controller.showVrnRoadmapVisitQuestionnairePage = function(sp_visit_id, questionnaire_id) {
        app.log("controller.showVrnRoadmapVisitQuestionnairePage", 'wip');
 
        // header et footer
        $.mobile.navigate( "#vrn-roadmap-visit-questionnaire-page" );
        controller.showVrnHeader();
        controller.showVrnFooter('vrn-roadmap-page');
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
                        +'  <div class="ui-grid-solo">'
                  
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
                +'    <a href="#u" id="vrn-question-valider-button" data-role="button" data-icon="triangle_right_black_image" data-iconpos="right" data-inline="true">valider</a>'
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

        return;
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
                    var data = [ sp_visit.id_sales_point , current_sp_visit_id, questionnaire.id_questionnaire, questions[i].id_question, $("#select-choice-"+questions[i].id_question).val(), text_answer, app.utils.convertTimestampToDateIso(new Date(),'/') ]
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
                    var data = [ sp_visit.id_sales_point , current_sp_visit_id, questionnaire.id_questionnaire, questions[i].id_question, $("[name='radio-choice-"+questions[i].id_question+"']:checked").val(), text_answer, app.utils.convertTimestampToDateIso(new Date(),'/') ]
                    var rsql = app.repository.addQuestionnaireSpAnswer(data);
                    rsql.done(function() {});
                 
                    
                }else if(questions[i].question_type == "text"){
                    // si obligatoire
                    //message += "Le champs \""+questions[i].label+"\" ne peut être vide.<br>";
                    //form_statut = "non ok";
                    
                    //alert('quest:'+questions[i].id_question+' - rep:'+$("#text-"+questions[i].id_question).val());
                    var data = [ sp_visit.id_sales_point , current_sp_visit_id, questionnaire.id_questionnaire, questions[i].id_question, 0, $("#text-"+questions[i].id_question).val(), app.utils.convertTimestampToDateIso(new Date(),'/') ]
                    var rsql = app.repository.addQuestionnaireSpAnswer(data);
                    rsql.done(function() {});
                }else if(questions[i].question_type == "satisfaction"){
                    // si obligatoire
                    //message += "Le champs \""+questions[i].label+"\" ne peut être vide.<br>";
                    //form_statut = "non ok";
                    
                   // alert('quest:'+questions[i].id_question+' - rep:'+$("#slider-"+questions[i].id_question).val());
                    var data = [ sp_visit.id_sales_point , current_sp_visit_id, questionnaire.id_questionnaire, questions[i].id_question, 0, $("#slider-"+questions[i].id_question).val(), app.utils.convertTimestampToDateIso(new Date(),'/') ]
                    var rsql = app.repository.addQuestionnaireSpAnswer(data);
                    rsql.done(function() {});
                }
                
                // todo text and slider + Save to sqlite :)
                
            }

            
            if(form_statut == "ok"){
                /*
                
                var data = [ $('#vrn-params-edit-identif').val(), $('#vrn-params-edit-lastname').val(), $('#vrn-params-edit-firstname').val(), $('#vrn-params-edit-email').val(), $('#vrn-params-edit-phone').val(), $('#vrn-params-edit-profil-language').val(), $('#vrn-params-edit-profil-zone').val(), localStorage.getItem( "current_user_id") ];
                
                var r1 = app.repository.editParamsSave(data);
                
                r1.done(function(pos) {
                    $.mobile.changePage("params.html", {
                        transition:"slide",
                        changeHash:true,
                        reverse:true
                     });
                });
                
                */
            }else{
                // return error pop
                $('#vrn-form-item-error-popup').popup();
                //$('#vrn-form-item-error-popup').height (screen.height - 50);
                //$('#vrn-form-item-error-popup').width (screen.width - 50);
                $("#vrn-form-item-error-popup-content").children("[class='ui-title']").html(message).trigger('create');
                $('#vrn-form-item-error-popup').popup('open');
            }
            
            $('#vrn-question-valider-button').click();
            $.mobile.changePage("#vrn-roadmap-visit-page", {
                transition:"slide",
                changeHash:true,
                reverse:true
             });
        });
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
        controller.showVrnFooter('vrn-pos-page');
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

            $('.pos-detail-lnk').unbind('tap');
            $('.pos-detail-lnk').bind('tap', controller.getParamUrl);
            
            
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
            $('#vrn-pos-appeler-button').unbind('tap');
            $('#vrn-pos-appeler-button').bind('tap',function (event){
                controller.callPhone($('#vrn-pos-identity-tel').find(":selected").val());
            });
            
            $('#vrn-pos-send-button').unbind('tap');
            $('#vrn-pos-send-button').bind('tap',function (event){
                controller.sendAMail($('#vrn-pos-identity-email').find(":selected").val());
            });
            
            $('.pos-identity-map-lnk').unbind('tap');
            $('.pos-identity-map-lnk').bind('tap', controller.getParamUrl);
            
            $('#vrn-modify-button').unbind('tap');
            $('#vrn-modify-button').bind('tap', controller.getParamUrl);
            
            
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
    controller.showVrnPosEditPage = function(id_sales_point) {  
        app.log("controller.showVrnPosEditPage : " , 'wip');
        controller.showVrnHeader();
        
        var pos_id = id_sales_point;
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
                var r4 = app.repository.getPosItem(id_sales_point);
                r4.done(function(pos) {
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
            controller.PosSave(event,id_sales_point);
        });
    };
    
    // pos : edit pos save
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
                var data = [ $('#vrn-pos-id').val(), $('#vrn-pos-name').val(), $('#vrn-pos-street').val(), $('#vrn-pos-cp').val(), $('#vrn-pos-city').val(), $('#vrn-pos-contact-name').val(), $('#vrn-pos-telephone').val(), $('#vrn-pos-email').val(), 1 , localStorage.getItem( "current_user_id"), $('#vrn-pos-description').val(), $('#vrn-pos-gps_latitude').val(), $('#vrn-pos-gps_longitude').val(), $('#vrn-pos-microzone').val(), $('#vrn-pos-frequency').val(), $('#vrn-pos-id').val() ];
                var r1 = app.repository.editPosSave(data);
            }
            
            
            
            r1.done(function(pos) {
                $.mobile.changePage("#vrn-pos-page", {
                    transition:"slide",
                    changeHash:true,
                    reverse:true
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
    
    // ==> Stats //
    controller.showVrnStatsPage = function() {
       app.log("controller.showVrnStatsPage", 'wip');
        // header et footer
        $.mobile.navigate( "#vrn-stats-page" );
        controller.showVrnHeader();
        controller.showVrnFooter('vrn-stats-page');
        $("#vrn-stats-page").trigger('refresh');
        
    };
    
    // ==> Params / settings //
    controller.showVrnParamsPage = function() {
       app.log("controller.showVrnParamsPage", 'wip');
       
        // header et footer
        $.mobile.navigate( "#vrn-params-page" );
        controller.showVrnHeader();
        controller.showVrnFooter('vrn-params-page');
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
        controller.showVrnFooter('vrn-params-page');
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
            $('#vrn-params-edit-identif').val(user.username);
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
        if($('#vrn-params-edit-identif').val() == ""){
            message += "Le champs \"identifiant\" ne peut être vide.<br>";
            form_statut = "non ok";
        } 
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
            
            var data = [ $('#vrn-params-edit-identif').val(), $('#vrn-params-edit-lastname').val(), $('#vrn-params-edit-firstname').val(), $('#vrn-params-edit-email').val(), $('#vrn-params-edit-phone').val(), $('#vrn-params-edit-profil-language').val(), $('#vrn-params-edit-profil-zone').val(), localStorage.getItem( "current_user_id") ];
            
            var r1 = app.repository.editParamsSave(data);
            
            r1.done(function(pos) {
                $.mobile.changePage("#vrn-params-page", {
                    transition:"slide",
                    changeHash:true,
                    reverse:true
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
        if(app.authenticatedInThisSession == true) var settings = "<a href=\"#vrn-params-page\"><img src=\"css/images/vrn/icon_settings_pressed.png\"/></a>";
        else var settings = "";
        var header = "  <div id=\"vrn-help\">"+help+"</div>"
        + " <div id=\"vrn-settings\">"+settings+"</div>"
        + " <div id=\"vrn-network\">"+network+"</div>"
        + " <div id=\"vrn-company\">Orange</div>"
        + "<span class=\"ui-title\">Visit Optimizer</span>"
        return header;
    };
    
    controller.showVrnHeader = function() {
        $("[data-role=header]").html(controller.getHeader()).trigger('create');
    };
    
    controller.getFooter = function(pageId) {
        app.log("# app.controller : getFooter");
    
        var footer = '<div class="vrn-inform-valider" style="display:none;"></div>';
        footer += '<div id="vrn-footer-navbar">';
        footer += '<ul>';
        // homepage.html : vrn-home-page
        if (pageId == "vrn-home-page") {
            footer += '  <li class="vrn-footer-navbar-liselected"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-taskselected">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Taskboard</span></span></li>' 
        } else {
            footer += '  <li class="vrn-footer-navbar-li"><a href="#vrn-home-page" id="vrn-taskboard" class="btn ui-state-persist" data-ajax="true" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-task">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Taskboard</span></span></a></li>' 
        }
        // inform.html : vrn-inform-page
        if (pageId == "vrn-inform-page") {
            footer += '  <li class="vrn-footer-navbar-liselected"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-informselected">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Info</span></span></li>' 
        } else {
            footer += '  <li class="vrn-footer-navbar-li"><a href="#vrn-inform-page" id="vrn-watchword" class="btn ui-state-persist" data-ajax="true" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-inform">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Info</span></span></a></li>' 
        }
        // roadmap.html : vrn-roadmap-page
        if (pageId == "vrn-roadmap-page") {
            footer += '  <li class="vrn-footer-navbar-liselected"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-roadselected">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Roadmap</span></span></li>' 
        } else {
            footer += '  <li class="vrn-footer-navbar-li"><a href="#vrn-roadmap-page" id="vrn-roadmap" class="btn ui-state-persist" data-ajax="true" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-road">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Roadmap</span></span></a></li>' 
        }
        // pos.html : vrn-pos-page
        if (pageId == "vrn-pos-page") {
            footer += '  <li class="vrn-footer-navbar-liselected"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-posselected">&nbsp;</div><span class="vrn-footer-navbar-btn-text">POS</span></span></li>' 
        } else {
            footer += '  <li class="vrn-footer-navbar-li"><a href="#vrn-pos-page" id="vrn-pos" class="btn ui-state-persist" data-ajax="true" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-pos">&nbsp;</div><span class="vrn-footer-navbar-btn-text">POS</span></span></a></li>' 
        }
        // stats.html : vrn-stats-page
        if (pageId == "vrn-stats-page") {
            footer += '  <li class="vrn-footer-navbar-liselected"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-statsselected">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Stats</span></span></li>' 
        } else {
            footer += '  <li class="vrn-footer-navbar-li"><a href="#vrn-stats-page" id="vrn-stats" class="btn ui-state-persist" data-ajax="true" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-stats">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Stats</span></span></a></li>' 
        }
        // params.html : vrn-params-page
        if (pageId == "vrn-params-page") {
            footer += '  <li class="vrn-footer-navbar-liselected"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-paramsselected">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Param</span></span></li>' 
        } else {
            footer += '  <li class="vrn-footer-navbar-li"><a href="#vrn-params-page" id="vrn-params" class="btn ui-state-persist" data-ajax="true" data-transition="slide"><span class="vrn-footer-navbar-btn-inner"><div class="footer-icon-params">&nbsp;</div><span class="vrn-footer-navbar-btn-text">Param</span></span></a></li>' 
        }
        footer += '</ul>'; 
        footer += '</div>';

        
        /*
        var footer = '<div data-role="navbar" class="nav-vrn-test" data-grid="d">'+
        '<ul>'+
        '    <li><a href="#vrn-home-page" id="nav-vrn-btn-chat" data-icon="custom">Chat</a></li>'+
        '    <li><a href="#vrn-inform-page" id="nav-vrn-btn-email" data-icon="custom">Email</a></li>'+
        '    <li><a href="#" id="nav-vrn-btn-skull" data-icon="custom">Danger</a></li>'+
        '    <li><a href="#" id="nav-vrn-btn-beer" data-icon="custom">Bière</a></li>'+
        '    <li><a href="#" id="nav-vrn-btn-coffee" data-icon="custom">Café</a></li>'+
        '</ul>'+
        '</div>';
        */
        
        return footer;
    };
    
    controller.showVrnFooter = function(active_sector) {
        $("[data-role=footer]").html(controller.getFooter(active_sector)).trigger('create');
        $("[data-role=footer]").height(80);
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
                                //alert('check user');
                                app.repository.updateSettings(user.id);
                            } else {
                                app.repository.updateSettings(0);
                            }
                            
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
                $.mobile.changePage("#vrn-home-page", {
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