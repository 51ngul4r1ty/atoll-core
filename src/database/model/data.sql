/* 1. sprints */
insert into sprint
	(id, "projectId", name, displayindex, startdate, finishdate, "createdAt", "updatedAt", version)
values
	('0a6208192fc64a46a592e82099be473a', '8220723fed61402abb8ee5170be741cb', 'Sprint 192', 0, '2019-05-30', '2019-06-12', now(), now(), 1);
insert into sprint
	(id, "projectId", name, displayindex, startdate, finishdate, "createdAt", "updatedAt", version)
values
	('6beed46d30b343d0a7ae13b2fb4df5c8', '8220723fed61402abb8ee5170be741cb', 'Sprint 193', 1, '2019-06-13', '2019-06-26', now(), now(), 1);

insert into sprint
	(id, name, displayindex, startdate, finishdate, "createdAt", "updatedAt", version, "projectId",
	"plannedPoints", "acceptedPoints", "velocityPoints", "usedSplitPoints", "remainingSplitPoints")
values
	('dbc625b000d64975881db9b1d3e7f093', 'Sprint 33', 33, '2020-10-04 00:00:00-04', '2020-10-18 00:00:00-04', '2020-10-11 22:42:16-04', '2020-10-11 22:42:16-04', 0, '69a9288264964568beb5dd243dc29008',
	23, 20, 22, 3, null);
insert into sprint
	(id, name, displayindex, startdate, finishdate, "createdAt", "updatedAt", version, "projectId",
	"plannedPoints", "acceptedPoints", "velocityPoints", "usedSplitPoints", "remainingSplitPoints")
values
	('c5010380d64649acb02dcdf07240f644', 'Sprint 34', 34, '2020-10-18 00:00:00-04', '2020-11-01 00:00:00-04', '2020-10-11 22:42:16-04', '2020-10-11 22:42:16-04', 0, '69a9288264964568beb5dd243dc29008'
	2, null, 22, null, 2);


/* 2. backlog items */
insert into backlogitem
	(id, "projectId", "friendlyId", "externalId", "rolePhrase", "storyPhrase", "reasonPhrase", estimate, "type", "createdAt", "updatedAt", "version")
values
	('30397fe2bd6747b8a0c3a56105b68843', '69a9288264964568beb5dd243dc29008', 's-6', '531', 'as a developer', 'use the v3 api to get/update current user data', null, 3, 'story', now(), now(), 1);
insert into backlogitem
	(id, "projectId", "friendlyId", "externalId", "rolePhrase", "storyPhrase", "reasonPhrase", estimate, "type", "createdAt", "updatedAt", "version")
values
	('6d2f1bf323f74c0193e84f6a2168e417', '69a9288264964568beb5dd243dc29008', 's-5', '530', 'as a developer', 'use the v3 api to get/update filter criteria', null, 5, 'story', now(), now(), 1);
insert into backlogitem
	(id, "projectId", "friendlyId", "externalId", "rolePhrase", "storyPhrase", "reasonPhrase", estimate, "type", "createdAt", "updatedAt", "version")
values
	('81208c00e34d45209bbf27d6ac63b37a', '69a9288264964568beb5dd243dc29008', 's-4', '529', 'as a developer', 'use the v3 api to update filters', null, 5, 'story', now(), now(), 1);
insert into backlogitem
	(id, "projectId", "friendlyId", "externalId", "rolePhrase", "storyPhrase", "reasonPhrase", estimate, "type", "createdAt", "updatedAt", "version")
values
	('7a7b9fe004034a4a9532464a10e5a0ad', '69a9288264964568beb5dd243dc29008', 's-3', '528', 'as a developer', 'use the v3 api to retrieve & add custom tags', null, 5, 'story', now(), now(), 1);
insert into backlogitem
	(id, "projectId", "friendlyId", "externalId", "rolePhrase", "storyPhrase", "reasonPhrase", estimate, "type", "createdAt", "updatedAt", "version")
values
	('d434aab2e71e4c8bbd24dae22941d06f', '69a9288264964568beb5dd243dc29008', 's-2', '527', 'as a developer', 'use the v3 api to sign up a user', null, 5, 'story', now(), now(), 1);
insert into backlogitem
	(id, "projectId", "friendlyId", "externalId", "rolePhrase", "storyPhrase", "reasonPhrase", estimate, "type", "createdAt", "updatedAt", "version")
values
	('920581ae222e4fa2ab24117664cda3fb', '69a9288264964568beb5dd243dc29008', 's-1', 'B1000032', null, 'Filter seems to be taking longer & longer (investigate)', null, null, 'issue', now(), now(), 1);

/* 3. backlog item rank */
insert into backlogitemrank
	(id, "projectId", "backlogitemId", "nextbacklogitemId", "createdAt", "updatedAt")
values
	('9dd4a166ae2849caadc5d84a6d1e8e57', '69a9288264964568beb5dd243dc29008', null, '30397fe2bd6747b8a0c3a56105b68843',
		'2020-03-15 18:17:00-05', '2020-03-15 18:17:00-05');
insert into backlogitemrank
	(id, "projectId", "backlogitemId", "nextbacklogitemId", "createdAt", "updatedAt")
values
	('7df01b51fdf94b209bbcaacc7d8e24fa', '69a9288264964568beb5dd243dc29008', '30397fe2bd6747b8a0c3a56105b68843', '6d2f1bf323f74c0193e84f6a2168e417',
		'2020-03-15 18:17:00-05', '2020-03-15 18:17:00-05');
insert into backlogitemrank
	(id, "projectId", "backlogitemId", "nextbacklogitemId", "createdAt", "updatedAt")
values
	('1d2b5d9214274250a47a9790b13de17c', '69a9288264964568beb5dd243dc29008', '6d2f1bf323f74c0193e84f6a2168e417', '81208c00e34d45209bbf27d6ac63b37a',
		'2020-03-15 18:17:00-05', '2020-03-15 18:17:00-05');
insert into backlogitemrank
	(id, "projectId", "backlogitemId", "nextbacklogitemId", "createdAt", "updatedAt")
values
	('516641d2c00c44d4b595dd2ea5f727ad', '69a9288264964568beb5dd243dc29008', '81208c00e34d45209bbf27d6ac63b37a', '7a7b9fe004034a4a9532464a10e5a0ad',
		'2020-03-15 18:17:00-05', '2020-03-15 18:17:00-05');
insert into backlogitemrank
	(id, "projectId", "backlogitemId", "nextbacklogitemId", "createdAt", "updatedAt")
values
	('c3865beee7f34513b625d1e27edb9a4b', '69a9288264964568beb5dd243dc29008', '7a7b9fe004034a4a9532464a10e5a0ad', 'd434aab2e71e4c8bbd24dae22941d06f',
		'2020-03-15 18:17:00-05', '2020-03-15 18:17:00-05');
insert into backlogitemrank
	(id, "projectId", "backlogitemId", "nextbacklogitemId", "createdAt", "updatedAt")
values
	('fe364a6ac76b4ba387d5d976c153bb23', '69a9288264964568beb5dd243dc29008', 'd434aab2e71e4c8bbd24dae22941d06f', '920581ae222e4fa2ab24117664cda3fb',
		'2020-03-15 18:17:00-05', '2020-03-15 18:17:00-05');
insert into backlogitemrank
	(id, "projectId", "backlogitemId", "nextbacklogitemId", "createdAt", "updatedAt")
values
	('2d96969bb2754832820bd68a90286c59', '69a9288264964568beb5dd243dc29008', '920581ae222e4fa2ab24117664cda3fb', null,
		'2020-03-15 18:17:00-05', '2020-03-15 18:17:00-05');

/* 4. projects */

insert into project
	(id, name, description, "createdAt", "updatedAt")
values
	('8220723fed61402abb8ee5170be741cb', 'Pixelplace.me', 'Web app for organizing and presenting large collections of photographs', '9/10/2020', '9/10/2020');
insert into project
	(id, name, description, "createdAt", "updatedAt")
values
	('69a9288264964568beb5dd243dc29008', 'Atoll', 'Web app for managing projects using scrum', '9/10/2020', '9/10/2020');

/* 5. users */
insert into appuser
	("id", "name", description, "firstName", "lastName", "passwordHash", "passwordSalt", "emailAddress", status, "lockedAt", "createdAt", "updatedAt", "version")
values
	('217796f6e1ab455a980263171099533f', 'test', 'description', null, null, 'cc1b9980e773604c5d090f29cb927e8e0870eb81d3d883ac1990a3abac2d53ad2edfaa438c9a9577063ab12d102f2c3d66daf2b7c893894a280b3284cdabe3f9', '040c0d737c5f70519d9274e3c5c678d3', null, 'A', null, '2020-09-23 22:15:02.634-04', '2020-09-23 22:15:02.634-04', 0);


/* 6. settings */

-- user settings

insert into usersettings
	(id, "appuserId", settings, "createdAt", "updatedAt", "version")
values
	('95219be810a3463ab7846a258c8ea69f', '217796f6e1ab455a980263171099533f', '{ "selectedProject": "69a9288264964568beb5dd243dc29008", "selectedSprint": "dbc625b000d64975881db9b1d3e7f093" }', '9/15/2020', '9/15/2020', 0);

-- project settings
insert into projectsettings
	(id, "projectId", settings, "createdAt", "updatedAt", "version")
values
	('95219be810a3463ab7846a258c8ea69f', null,
	 '{ "counters": { "story": { "prefix": "s-" }, "issue": { "prefix": "i-" } } }',
	 '9/15/2020', '9/15/2020', 0);


/* 7. counters */

insert into counter (id, entity, "entityId", "entitySubtype", "lastNumber", "lastCounterValue", "createdAt", "updatedAt")
	values ('d498db0f55154d5fa7482b069ab8490c', 'project', '69a9288264964568beb5dd243dc29008', 'story', 2, 's-2', '9/15/2020', '9/15/2020');
insert into counter (id, entity, "entityId", "entitySubtype", "lastNumber", "lastCounterValue", "createdAt", "updatedAt")
	values ('3895a6379d6d4d59b04b5e96c7a8a526', 'project', '69a9288264964568beb5dd243dc29008', 'issue', 2, 'i-2', '9/15/2020', '9/15/2020');
