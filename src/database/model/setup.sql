/* General set up */
CREATE EXTENSION "uuid-ossp";

/* 1. sprint */

CREATE TABLE public.sprint
(
    id character(32) NOT NULL,
    name character varying(50),
    displayindex bigint NOT NULL,
    startdate date,
    finishdate date,
    PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
);

ALTER TABLE public.sprint
    OWNER to postgres;

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
    OWNER TO postgres;
