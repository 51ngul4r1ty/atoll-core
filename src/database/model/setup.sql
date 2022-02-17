/* STEP 1:

1. Set up the "atoll" role
  (first time use only- if you are setting up another database on the same server instance you can skip this)

CREATE ROLE atoll WITH
	LOGIN
	SUPERUSER
	CREATEDB
	CREATEROLE
	INHERIT
	NOREPLICATION
	CONNECTION LIMIT -1;

ALTER ROLE atoll
	PASSWORD 'l1m3atoll';

2. Set up the "atoll" database

CREATE DATABASE atoll
    WITH
    OWNER = atoll
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;

/* STEP 2:

In the "atoll" database perform the following */

/* General set up */

CREATE EXTENSION "uuid-ossp";

/* Functions */

CREATE OR REPLACE FUNCTION public.newuuid(
	)
    RETURNS character(32)
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE
AS $BODY$
DECLARE
    newid uuid = uuid_generate_v4();
BEGIN
	RETURN substring(cast(newid as char(36)), 1, 8)
		|| substring(cast(newid as char(36)), 10, 4)
		|| substring(cast(newid as char(36)), 15, 4)
		|| substring(cast(newid as char(36)), 20, 4)
		|| substring(cast(newid as char(36)), 25, 12);
END;
$BODY$;

ALTER FUNCTION public.newuuid()
    OWNER TO atoll;

/* STEP 3:

**************************************************
**************************************************
RUN THE APP SO THAT IT CREATES THE DATABASE TABLES
(ATOLL_DATABASE_URL  will need to be set for this)
**************************************************
**************************************************

NOTE: If you see "Database & tables created!" output in the console window then
  you've successfully completed this step.

*/

/* STEP 4:

In the "atoll" database modify the created tables with these SQL commands

*/

/* Nothing here yet, but in future there may be SQL statements needed */
