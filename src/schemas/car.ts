import { pgTable, serial, integer, timestamp, doublePrecision } from "drizzle-orm/pg-core"



export const carState = pgTable("car_state", {
	id: serial().primaryKey().notNull(),
	carId: integer("car_id"),
	time: timestamp({ mode: 'date' }),
	stateOfCharge: integer("state_of_charge"),
	latitude: doublePrecision(),
	longitude: doublePrecision(),
	gear: integer(),
	speed: doublePrecision(),
});
