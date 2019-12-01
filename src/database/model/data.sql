/* 1. sprints */
insert into sprint (id, name, displayindex, startdate, finishdate) values ('0a6208192fc64a46a592e82099be473a', 'Sprint 192', 0, '2019-05-30', '2019-06-12');
insert into sprint (id, name, displayindex, startdate, finishdate) values ('6beed46d30b343d0a7ae13b2fb4df5c8', 'Sprint 193', 1, '2019-06-13', '2019-06-26');

/* 2. backlog items */

insert into backlogitem (id, "externalId", "rolePhrase", "storyPhrase", "reasonPhrase", estimate, "type", "displayIndex", "createdAt", "updatedAt", "version")
	values ('30397fe2bd6747b8a0c3a56105b68843', '531', 'as a developer', 'use the v3 api to get/update current user data', null, 3, 'story', 0, now(), now(), 1);
insert into backlogitem (id, "externalId", "rolePhrase", "storyPhrase", "reasonPhrase", estimate, "type", "displayIndex", "createdAt", "updatedAt", "version")
	values ('6d2f1bf323f74c0193e84f6a2168e417', '530', 'as a developer', 'use the v3 api to get/update filter criteria', null, 5, 'story', 1, now(), now(), 1);
insert into backlogitem (id, "externalId", "rolePhrase", "storyPhrase", "reasonPhrase", estimate, "type", "displayIndex", "createdAt", "updatedAt", "version")
	values ('81208c00e34d45209bbf27d6ac63b37a', '529', 'as a developer', 'use the v3 api to update filters', null, 5, 'story', 2, now(), now(), 1);
insert into backlogitem (id, "externalId", "rolePhrase", "storyPhrase", "reasonPhrase", estimate, "type", "displayIndex", "createdAt", "updatedAt", "version")
	values ('7a7b9fe004034a4a9532464a10e5a0ad', '528', 'as a developer', 'use the v3 api to retrieve & add custom tags', null, 5, 'story', 3, now(), now(), 1);
insert into backlogitem (id, "externalId", "rolePhrase", "storyPhrase", "reasonPhrase", estimate, "type", "displayIndex", "createdAt", "updatedAt", "version")
	values ('d434aab2e71e4c8bbd24dae22941d06f', '527', 'as a developer', 'use the v3 api to sign up a user', null, 5, 'story', 4, now(), now(), 1);
