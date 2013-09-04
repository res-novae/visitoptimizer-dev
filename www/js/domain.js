'use strict';

app.domain = (function() {
	var domain = {};

	domain.TRANSLATION_ID = {
		COMPANY : 1,
		USERNAME : 2,
		PASSWORD : 3,
		RECOVER_PASSWORD : 4,
		REMEMBER_ME : 5,
		TASKBOARD : 6,
		WATCHWORD : 7,
		ROADMAP : 8,
		POS : 9,
		STATS : 10,
		SETTINGS : 11,
		LOGIN : 12,
		UNKNOWN_ERROR : 13
	};
	    
    domain.Translation = function(id, value, languageId) {
        this.id = id;
        this.value = value;
        this.languageId = languageId;
    };

    domain.language = function(id, name, shortName) {
        this.id = id;
        this.name = name;
        this.shortName = shortName;
    };

	domain.User = function(id, parent_id, user_category_id, username, password, lastname, firstname, email, phone, preferred_language_id, target_val) {
        this.id = id; 
        this.parent_id = parent_id;
        this.user_category_id = user_category_id; 
        this.username = username; 
        this.password = password; 
        this.lastname = lastname; 
        this.firstname = firstname; 
        this.email = email; 
        this.phone = phone; 
        this.preferred_language_id = preferred_language_id; 
        this.target_val = target_val; 
    };
    
    domain.Settings = function(id, defaultLanguageId, userId) {
        this.id = id; // int
        this.defaultLanguageId = defaultLanguageId; // int
        this.userId = userId; // int
    };

    domain.area_list = function(id_list, parent_id, name, status) {
        this.id_list = id_list;
        this.parent_id = parent_id;
        this.name = name;
        this.status = status;
    };
    
    domain.area_item = function(id_item, list_id, parent_id, name) {
        this.id_item = id_item;
        this.list_id = list_id;
        this.parent_id = parent_id;
        this.name = name;
    };

    domain.area_item_field_values = function(id_item, language_id, value) {
        this.id_item = id_item;
        this.language_id = language_id;
        this.value = value;
    };

    domain.sys_language = function(id_language, name, short_name, default_language) {
        this.id_language = id_language;
        this.name = name;
        this.short_name = short_name;
        this.default_language = default_language;
    };
    
    domain.sys_language_translation = function(language_id, translation_id, value) {
        this.language_id = language_id;
        this.translation_id = translation_id;
        this.value = value;
    };
    
    domain.usr_categories = function(id_user_category, translation_id, name) {
        this.id_user_category = id_user_category;
        this.translation_id = translation_id;
        this.name = name;
    };

    domain.sys_users = function(id_user, parent_id, user_category_id, username, password, lastname, firstname, email, phone, preferred_language_id, target_val) {
        this.id_user = id_user; 
        this.parent_id = parent_id; 
        this.user_category_id = user_category_id; 
        this.username = username; 
        this.password = password; 
        this.lastname = lastname; 
        this.firstname = firstname; 
        this.email = email; 
        this.phone = phone; 
        this.preferred_language_id = preferred_language_id; 
        this.target_val = target_val; 
    };

    domain.sync_infos = function(id, sync_id, userId, date) {
        this.id = id; // int
        this.sync_id = sync_id; // int
        this.userId = userId; // int
        this.date = date;
    };
    
    domain.usr_area = function(user_id, area_id) {
        this.user_id = user_id;
        this.area_id = area_id;
    };

    domain.frequency = function(id_frequency, label, translation_id, frequency, frq_code) {
        this.id_frequency = id_frequency;
        this.label = label;
        this.translation_id = translation_id;
        this.frequency = frequency;
        this.frq_code = frq_code;
    };

    domain.message = function(id_message, message_type, send_date, start_date, end_date, content, priority, attachment, id_usr_message, lastname, read) {
        this.id_message = id_message; // int
        this.message_type = message_type; 
        this.send_date = send_date;
        this.start_date = start_date;
        this.end_date = end_date;
        this.content = content;
        this.priority = priority;
        this.attachment = attachment;
        this.id_usr_message = id_usr_message; // int
        this.lastname = lastname;
        this.read = read;
    };

    domain.question = function(id_question, translation_id, question_type, label, rank, status) {
        this.id_question = id_question;
        this.translation_id = translation_id;
        this.label = label;
        this.question_type = question_type;
        this.rank = rank;
        this.status = status;
    };
    
    domain.questionnaire = function(id_questionnaire, name, translation_id, frequency_id, rank, status) {
        this.id_questionnaire = id_questionnaire;
        this.name = name;
        this.translation_id = translation_id;
        this.frequency_id = frequency_id;
        this.rank = rank;
        this.status = status;
    };
    
    domain.questionnaire_question = function(questionnaire_id , question_id) {
        this.questionnaire_id = questionnaire_id;
        this.question_id = question_id;
    };
    
    domain.questions_answer = function(id_answer, translation_id, question_id, label, rank, status) {
        this.id_answer = id_answer;
        this.translation_id = translation_id;
        this.question_id = question_id;
        this.label = label;
        this.rank = rank;
        this.status = status;
    };
    
    domain.roadmap = function(id_roadmap, initiating_user_id, operating_user_id, mobile_status_id, web_status_id, creation_date, name, scheduled_date, km, comment, close_date, area_id, local_id) {
        this.id_roadmap = id_roadmap;
        this.initiating_user_id = initiating_user_id;
        this.operating_user_id = operating_user_id;
        this.mobile_status_id = mobile_status_id;
        this.web_status_id = web_status_id;
        this.creation_date = creation_date;
        this.name = name;
        this.scheduled_date = scheduled_date;
        this.km = km;
        this.comment = comment;
        this.close_date = close_date;
        this.area_id = area_id;
        this.local_id = local_id;
    };

    domain.sales_point = function(id_sales_point, name, email, description, contact_name, phone_number, street, city, postal_code, gps_latitude, gps_longitude, type_id, user_id, microzone_id, last_visit_id, frequency_id, local_id) {
        this.id_sales_point = id_sales_point;
        this.name = name;
        this.email = email;
        this.description = description;
        this.contact_name = contact_name;
        this.phone_number = phone_number;
        this.street = street;
        this.city = city;
        this.postal_code = postal_code;
        this.gps_latitude = gps_latitude;
        this.gps_longitude = gps_longitude;
        this.type_id = type_id;
        this.user_id = user_id;
        this.microzone_id = microzone_id;
        this.last_visit_id = last_visit_id;
        this.frequency_id = frequency_id;
        this.local_id = local_id;
    };
    
    domain.sp_type = function(id_type, name, translation_id) {
        this.id_type = id_type;
        this.name = name;
        this.translation_id = translation_id;
    };

    domain.sp_visit = function(id_visit, sales_point_id, roadmap_id, status_visit_id, scheduled_date, performed_date, rank, comment, local_id) {
        this.id_visit = id_visit;
        this.sales_point_id = sales_point_id;
        this.roadmap_id = roadmap_id;
        this.status_visit_id = status_visit_id;
        this.scheduled_date = scheduled_date;
        this.performed_date = performed_date;
        this.rank = rank;
        this.comment = comment;
        this.local_id = local_id;
    };
    
    domain.status_mobile = function(id_status_mobile, name, translation_id) {
        this.id_status_mobile = id_status_mobile;
        this.name = name;
        this.translation_id = translation_id;
    };
    
    domain.status_visit = function(id_status_visit, name, translation_id) {
        this.id_status_visit = id_status_visit;
        this.name = name;
        this.translation_id = translation_id;
    };
    
    domain.help = function(id_help, zip_name) {
        this.id_help = id_help;
        this.zip_name = zip_name;
    };
    
// deprecated : Fen

	domain.RoadmapSummary = function(id, scheduledDate, location, manager, performedVisits, scheduledVisits, status) {
		this.id = id; // int
		this.scheduledDate = scheduledDate;
		this.location = location;
		this.manager = manager;
		this.performedVisits = performedVisits;
		this.scheduledVisits = scheduledVisits;
		this.status = status;
	};

	domain.AreaSummary = function(id, name) {
		this.id = id; // int
		this.name = name;
	};

	domain.PosSummary = function(id, name, type, lastVisitInDays) {
		this.id = id; // int
		this.name = name;
		this.type = type;
		this.lastVisitInDays = lastVisitInDays;
	};

	return domain;
}());
