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

-- Atoll v0.40.0
alter table sprint alter column startdate type date;
alter table sprint alter column finishdate type date;

update sprint set finishdate = finishdate - interval '1' day where startdate + interval '14' day = finishdate;

-- Atoll v0.41.0
create table backlogitempart
(
    id character varying(32) not null,
    "externalId" character varying(30),
    "backlogitemId" character varying(32) not null,
    "partIndex" integer,
    percentage numeric(10,2),
    points numeric(10,2),
    "startedAt" timestamp with time zone,
    "finishedAt" timestamp with time zone,
    status character(1),
    "createdAt" timestamp with time zone not null,
    "updatedAt" timestamp with time zone not null,
    version integer not null,
    constraint backlogitempart_pkey primary key (id),
    constraint "backlogitempart_backlogitemId_fkey" foreign key ("backlogitemId")
        references backlogitem (id) match simple
	    on update cascade
	    on delete no action
	    deferrable initially deferred
)
tablespace pg_default;

alter table backlogitempart
    owner to atoll; -- change atoll to the heroku postgresql user account

insert into backlogitempart
select newuuid() as "id", substring("externalId" || '-1', 1, 30) as "externalId", id as "backlogitemId", 1 as "partIndex",
	100.00 as "percentage", estimate as "points", "startedAt", "finishedAt", status, "createdAt", "updatedAt", "version"
from backlogitem;

alter table sprintbacklogitem add column "backlogitempartId" varchar(32);

update sprintbacklogitem set "backlogitempartId" = bip.id
	from backlogitempart bip join sprintbacklogitem sbi on bip."backlogitemId" = sbi."backlogitemId"
	where sprintbacklogitem."backlogitemId" = bip."backlogitemId";

alter table sprintbacklogitem
    add constraint "sprintbacklogitem_backlogitempartId_fkey" foreign key ("backlogitempartId")
    references backlogitempart (id) match simple
    on update cascade
	on delete cascade
	deferrable initially deferred;

alter table sprintbacklogitem alter column "backlogitempartId" set not null;

alter table sprintbacklogitem drop constraint "sprintbacklogitem_backlogitemId_fkey";

alter table sprintbacklogitem drop column "backlogitemId";

alter table backlogitem add column "totalParts" integer;

update backlogitem set "totalParts" = 1;

-- v0.47.0
alter table if exists backlogitemrank
rename to productbacklogitem;

alter table productbacklogitem
rename constraint "backlogitemrank_backlogitemId_fkey" TO "productbacklogitem_backlogitemId_fkey";

alter table productbacklogitem
rename constraint "backlogitemrank_nextbacklogitemId_fkey" TO "productbacklogitem_nextbacklogitemId_fkey";

alter table productbacklogitem
rename constraint "backlogitemrank_pkey" TO "productbacklogitem_pkey";
