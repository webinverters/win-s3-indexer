drop schema public cascade;
create schema public;

CREATE TABLE public.index_blob (
	id serial NOT NULL,
	"key" varchar(1000) NOT NULL,
	"indexedOn" int4 NOT NULL,
	"lastModifiedOn" int4 NOT NULL,
	PRIMARY KEY ("key")
);