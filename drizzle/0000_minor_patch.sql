-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "car_state" (
	"id" serial PRIMARY KEY NOT NULL,
	"car_id" integer,
	"time" timestamp,
	"state_of_charge" integer,
	"latitude" double precision,
	"longitude" double precision,
	"gear" integer,
	"speed" double precision
);

*/