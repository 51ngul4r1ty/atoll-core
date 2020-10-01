alter table backlogitem add column "friendlyId" varchar(30);

alter table backlogitem add column "projectId" varchar(32);
update backlogitem set "projectId" = '69a9288264964568beb5dd243dc29008';

alter table backlogitemrank add column "projectId" varchar(32);
update backlogitemrank set "projectId" = '69a9288264964568beb5dd243dc29008';
