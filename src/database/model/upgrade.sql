alter table backlogitem add column "friendlyId" varchar(30);

alter table backlogitem add column "projectId" varchar(32);
update backlogitem set "projectId" = '69a9288264964568beb5dd243dc29008';

alter table backlogitemrank add column "projectId" varchar(32);
update backlogitemrank set "projectId" = '69a9288264964568beb5dd243dc29008';

alter table sprint add column "projectId" varchar(32);
update sprint set "projectId" = '69a9288264964568beb5dd243dc29008';

alter table sprint add column "plannedPoints" integer;
alter table sprint add column "acceptedPoints" integer;
alter table sprint add column "velocityPoints" integer;
alter table sprint add column "usedSplitPoints" integer;
alter table sprint add column "remainingSplitPoints" integer;

alter table sprint drop column displayindex;

alter table sprintbacklogitem add column "status" char(1);
update sprintbacklogitem set "status" = 'D';

alter table backlogitem alter column estimate type decimal(10, 2);

alter table sprint alter column "plannedPoints" type decimal(10, 2);
alter table sprint alter column "acceptedPoints" type decimal(10, 2);
alter table sprint alter column "velocityPoints" type decimal(10, 2);
alter table sprint alter column "usedSplitPoints" type decimal(10, 2);
alter table sprint alter column "remainingSplitPoints" type decimal(10, 2);

alter table backlogitem add column status char(1);

alter table sprint add column "archived" char(1);
update sprint set archived = 'N' where archived is null;
alter table sprint
    alter column archived type char(1),
    alter column archived set not null;

alter table backlogitem add column "acceptanceCriteria" text;

alter table backlogitem add column "startedAt" timestamp with time zone;
alter table backlogitem add column "finishedAt" timestamp with time zone;
alter table backlogitem add column "acceptedAt" timestamp with time zone;
alter table backlogitem add column "releasedAt" timestamp with time zone;

alter table sprint add column "totalPoints" decimal(10, 2);

alter table sprint alter column startdate type date;
alter table sprint alter column finishdate type date;
