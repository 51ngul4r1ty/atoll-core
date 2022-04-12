/* 1. projects */

insert into project
	(id, name, description, "createdAt", "updatedAt")
values
	('8220723fed61402abb8ee5170be741cb', 'Pixelplace.me', 'Web app for organizing and presenting large collections of photographs', '9/10/2020', '9/10/2020');
insert into project
	(id, name, description, "createdAt", "updatedAt")
values
	('69a9288264964568beb5dd243dc29008', 'Atoll', 'Web app for managing projects using scrum', '9/10/2020', '9/10/2020');

/* 2. sprints */
insert into sprint
	(id, "projectId", name, startdate, finishdate, archived, "createdAt", "updatedAt", version,
	 "plannedPoints", "acceptedPoints", "velocityPoints", "usedSplitPoints", "remainingSplitPoints", "totalPoints")
values
	('0a6208192fc64a46a592e82099be473a', '8220723fed61402abb8ee5170be741cb', 'Sprint 192', '2019-05-30', '2019-06-12', 'N', now(), now(), 1,
	 null, null, null, null, null, null);
insert into sprint
	(id, "projectId", name, startdate, finishdate, archived, "createdAt", "updatedAt", version,
	 "plannedPoints", "acceptedPoints", "velocityPoints", "usedSplitPoints", "remainingSplitPoints", "totalPoints")
values
	('6beed46d30b343d0a7ae13b2fb4df5c8', '8220723fed61402abb8ee5170be741cb', 'Sprint 193', '2019-06-13', '2019-06-26', 'N', now(), now(), 1,
	 null, null, null, null, null, null);

insert into sprint
	(id, name, startdate, finishdate, archived, "createdAt", "updatedAt", version, "projectId",
	"plannedPoints", "acceptedPoints", "velocityPoints", "usedSplitPoints", "remainingSplitPoints")
values
	('dbc625b000d64975881db9b1d3e7f093', 'Sprint 33', '2020-10-04 00:00:00-04', '2020-10-18 00:00:00-04', 'N', '2020-10-11 22:42:16-04', '2020-10-11 22:42:16-04', 0, '69a9288264964568beb5dd243dc29008',
	23, 20, 22, 3, null);
insert into sprint
	(id, name, startdate, finishdate, archived, "createdAt", "updatedAt", version, "projectId",
	"plannedPoints", "acceptedPoints", "velocityPoints", "usedSplitPoints", "remainingSplitPoints")
values
	('c5010380d64649acb02dcdf07240f644', 'Sprint 34', '2020-10-18 00:00:00-04', '2020-11-01 00:00:00-04', 'N', '2020-10-11 22:42:16-04', '2020-10-11 22:42:16-04', 0, '69a9288264964568beb5dd243dc29008',
	2, null, 22, null, 2);


/* 3. backlog items */
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

/* 4. backlog item parts */
insert into backlogitempart
	(id, "backlogitemId", "externalId", points, "createdAt", "updatedAt", "version", "partIndex", percentage, "startedAt", "finishedAt", status)
values
	('ec83ea8a3e4a4d958dccd4a4d7b53341', '30397fe2bd6747b8a0c3a56105b68843', '531', 3, now(), now(), 1, 1, 100.0, null, null, null);
insert into backlogitempart
	(id, "backlogitemId", "externalId", points, "createdAt", "updatedAt", "version", "partIndex", percentage, "startedAt", "finishedAt", status)
values
	('aaf42325e5254313aba871d6850c172e', '6d2f1bf323f74c0193e84f6a2168e417', '530', 5, now(), now(), 1, 1, 100.0, null, null, null);
insert into backlogitempart
	(id, "backlogitemId", "externalId", points, "createdAt", "updatedAt", "version", "partIndex", percentage, "startedAt", "finishedAt", status)
values
	('8634dbdfc5b44c32bc2786a3ace8f5a2', '81208c00e34d45209bbf27d6ac63b37a', '529', 5, now(), now(), 1, 1, 100.0, null, null, null);
insert into backlogitempart
	(id, "backlogitemId", "externalId", points, "createdAt", "updatedAt", "version", "partIndex", percentage, "startedAt", "finishedAt", status)
values
	('c2600f75c716467aba9f74f77ed881ce', '7a7b9fe004034a4a9532464a10e5a0ad', '528', 5, now(), now(), 1, 1, 100.0, null, null, null);
insert into backlogitempart
	(id, "backlogitemId", "externalId", points, "createdAt", "updatedAt", "version", "partIndex", percentage, "startedAt", "finishedAt", status)
values
	('dca40fa9e8cb494988209c45c84ad038', 'd434aab2e71e4c8bbd24dae22941d06f', '527', 5, now(), now(), 1, 1, 100.0, null, null, null);
-- NOTE: This is the only backlog item part allocated to a sprint, so it has other fields set (started, finished, status) that the previous items do not
insert into backlogitempart
	(id, "backlogitemId", "externalId", points, "createdAt", "updatedAt", "version", "partIndex", percentage, "startedAt", "finishedAt", status)
values
	('7028cdd7c389489fa2d7dfa7e75c66cb', '920581ae222e4fa2ab24117664cda3fb', 'B1000032', null, now(), now(), 1, 1, 100.0, '2020-10-25 12:05:00-04', '2020-10-28 16:31:00-04', 'R');

/* 5. product backlog item */
insert into productbacklogitem
	(id, "projectId", "backlogitemId", "nextbacklogitemId", "createdAt", "updatedAt")
values
	('9dd4a166ae2849caadc5d84a6d1e8e57', '69a9288264964568beb5dd243dc29008', null, '30397fe2bd6747b8a0c3a56105b68843',
		'2020-03-15 18:17:00-05', '2020-03-15 18:17:00-05');
insert into productbacklogitem
	(id, "projectId", "backlogitemId", "nextbacklogitemId", "createdAt", "updatedAt")
values
	('7df01b51fdf94b209bbcaacc7d8e24fa', '69a9288264964568beb5dd243dc29008', '30397fe2bd6747b8a0c3a56105b68843', '6d2f1bf323f74c0193e84f6a2168e417',
		'2020-03-15 18:17:00-05', '2020-03-15 18:17:00-05');
insert into productbacklogitem
	(id, "projectId", "backlogitemId", "nextbacklogitemId", "createdAt", "updatedAt")
values
	('1d2b5d9214274250a47a9790b13de17c', '69a9288264964568beb5dd243dc29008', '6d2f1bf323f74c0193e84f6a2168e417', '81208c00e34d45209bbf27d6ac63b37a',
		'2020-03-15 18:17:00-05', '2020-03-15 18:17:00-05');
insert into productbacklogitem
	(id, "projectId", "backlogitemId", "nextbacklogitemId", "createdAt", "updatedAt")
values
	('516641d2c00c44d4b595dd2ea5f727ad', '69a9288264964568beb5dd243dc29008', '81208c00e34d45209bbf27d6ac63b37a', '7a7b9fe004034a4a9532464a10e5a0ad',
		'2020-03-15 18:17:00-05', '2020-03-15 18:17:00-05');
insert into productbacklogitem
	(id, "projectId", "backlogitemId", "nextbacklogitemId", "createdAt", "updatedAt")
values
	('c3865beee7f34513b625d1e27edb9a4b', '69a9288264964568beb5dd243dc29008', '7a7b9fe004034a4a9532464a10e5a0ad', 'd434aab2e71e4c8bbd24dae22941d06f',
		'2020-03-15 18:17:00-05', '2020-03-15 18:17:00-05');
insert into productbacklogitem
	(id, "projectId", "backlogitemId", "nextbacklogitemId", "createdAt", "updatedAt")
values
	('fe364a6ac76b4ba387d5d976c153bb23', '69a9288264964568beb5dd243dc29008', 'd434aab2e71e4c8bbd24dae22941d06f', '920581ae222e4fa2ab24117664cda3fb',
		'2020-03-15 18:17:00-05', '2020-03-15 18:17:00-05');
insert into productbacklogitem
	(id, "projectId", "backlogitemId", "nextbacklogitemId", "createdAt", "updatedAt")
values
	('2d96969bb2754832820bd68a90286c59', '69a9288264964568beb5dd243dc29008', '920581ae222e4fa2ab24117664cda3fb', null,
		'2020-03-15 18:17:00-05', '2020-03-15 18:17:00-05');


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

/* 8. sprint backlog items */

insert into sprintbacklogitem (id, "sprintId", "backlogitempartId", displayindex, "createdAt", "updatedAt", version)
	values ('b6bc48899ae141ba8a7e4b7ffd090dec', 'c5010380d64649acb02dcdf07240f644', '7028cdd7c389489fa2d7dfa7e75c66cb',
		0, '2020-10-21 00:00:00-04', '2020-10-21 00:00:00-04', 0);
