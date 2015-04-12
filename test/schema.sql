drop schema public cascade;
create schema public;

CREATE TABLE public.index_blob (
	id serial NOT NULL,
	"key" varchar(1000) NOT NULL,
	"indexedOn" timestamp default current_timestamp,
	"arrivedOn" int4 NOT NULL,
	PRIMARY KEY ("key")
);