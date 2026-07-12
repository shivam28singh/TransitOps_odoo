import { pgTable, serial, integer, text, timestamp, pgEnum, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth.schema';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

// ============================================================
// ENUMS
// ============================================================

export const employeeRoleEnum = pgEnum('employee_role', [
	'ADMIN',
	'FLEET_MANAGER',
	'DISPATCHER',
	'SAFETY_OFFICER',
	'FINANCIAL_ANALYST',
	'DRIVER'
]);

export const employeeStatusEnum = pgEnum('employee_status', ['ACTIVE', 'INACTIVE']);
export const driverStatusEnum = pgEnum('driver_status', [
	'AVAILABLE',
	'ON_TRIP',
	'OFF_DUTY',
	'SUSPENDED'
]);
export const vehicleStatusEnum = pgEnum('vehicle_status', [
	'AVAILABLE',
	'ON_TRIP',
	'IN_SHOP',
	'RETIRED'
]);
export const vehicleTypeEnum = pgEnum('vehicle_type', ['VAN', 'TRUCK', 'MINI']);
export const tripStatusEnum = pgEnum('trip_status', [
	'DRAFT',
	'DISPATCHED',
	'COMPLETED',
	'CANCELLED'
]);
export const maintenanceStatusEnum = pgEnum('maintenance_status', ['ACTIVE', 'COMPLETED']);

// ============================================================
// TABLES
// ============================================================

export const employee = pgTable('employee', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: 'cascade' }),
	employeeCode: text('employee_code').unique(),
	fullName: text('full_name').notNull(),
	phone: text('phone'),
	role: employeeRoleEnum('role').default('DRIVER').notNull(),
	status: employeeStatusEnum('status').default('ACTIVE').notNull(),
	avatar: text('avatar'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export const driver = pgTable('driver', {
	id: serial('id').primaryKey(),
	employeeId: integer('employee_id')
		.notNull()
		.unique()
		.references(() => employee.id, { onDelete: 'cascade' }),
	licenseNumber: text('license_number'),
	licenseCategory: text('license_category'),
	licenseExpiry: timestamp('license_expiry'),
	safetyScore: numeric('safety_score', { precision: 5, scale: 2 }).default('100'),
	status: driverStatusEnum('status').default('AVAILABLE').notNull()
});

export const vehicle = pgTable('vehicle', {
	id: serial('id').primaryKey(),
	regNo: text('reg_no').notNull().unique(),
	name: text('name').notNull(),
	type: vehicleTypeEnum('type').notNull(),
	capacityKg: numeric('capacity_kg', { precision: 10, scale: 2 }).notNull(),
	odometerKm: numeric('odometer_km', { precision: 12, scale: 2 }).default('0').notNull(),
	acquisitionCost: numeric('acquisition_cost', { precision: 14, scale: 2 }).notNull(),
	region: text('region'),
	status: vehicleStatusEnum('status').default('AVAILABLE').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export const trip = pgTable('trip', {
	id: serial('id').primaryKey(),
	vehicleId: integer('vehicle_id')
		.notNull()
		.references(() => vehicle.id),
	driverId: integer('driver_id')
		.notNull()
		.references(() => driver.id),
	startTime: timestamp('start_time'),
	endTime: timestamp('end_time'),
	startLocation: text('start_location').notNull(),
	endLocation: text('end_location').notNull(),
	distanceKm: numeric('distance_km', { precision: 10, scale: 2 }),
	cargoWeightKg: numeric('cargo_weight_kg', { precision: 10, scale: 2 }),
	status: tripStatusEnum('status').default('DRAFT').notNull(),
	revenue: numeric('revenue', { precision: 12, scale: 2 }).default('0'),
	tollCost: numeric('toll_cost', { precision: 10, scale: 2 }).default('0'),
	otherCost: numeric('other_cost', { precision: 10, scale: 2 }).default('0'),
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export const maintenance = pgTable('maintenance', {
	id: serial('id').primaryKey(),
	vehicleId: integer('vehicle_id')
		.notNull()
		.references(() => vehicle.id),
	serviceType: text('service_type').notNull(),
	cost: numeric('cost', { precision: 10, scale: 2 }).notNull(),
	date: timestamp('date').notNull(),
	status: maintenanceStatusEnum('status').default('ACTIVE').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export const fuelLog = pgTable('fuel_log', {
	id: serial('id').primaryKey(),
	vehicleId: integer('vehicle_id')
		.notNull()
		.references(() => vehicle.id),
	liters: numeric('liters', { precision: 10, scale: 2 }).notNull(),
	cost: numeric('cost', { precision: 10, scale: 2 }).notNull(),
	date: timestamp('date').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export const systemSettings = pgTable('system_settings', {
	id: serial('id').primaryKey(),
	depotName: text('depot_name').default('TransitOps Main Depot').notNull(),
	currency: text('currency').default('INR').notNull(),
	distanceUnit: text('distance_unit').default('Kilometers').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

// ============================================================
// RELATIONS
// ============================================================

export const employeeRelations = relations(employee, ({ one }) => ({
	user: one(user, {
		fields: [employee.userId],
		references: [user.id]
	}),
	driver: one(driver, {
		fields: [employee.id],
		references: [driver.employeeId]
	})
}));

export const driverRelations = relations(driver, ({ one, many }) => ({
	employee: one(employee, {
		fields: [driver.employeeId],
		references: [employee.id]
	}),
	trips: many(trip)
}));

export const vehicleRelations = relations(vehicle, ({ many }) => ({
	trips: many(trip),
	maintenanceLogs: many(maintenance),
	fuelLogs: many(fuelLog)
}));

export const maintenanceRelations = relations(maintenance, ({ one }) => ({
	vehicle: one(vehicle, {
		fields: [maintenance.vehicleId],
		references: [vehicle.id]
	})
}));

export const fuelLogRelations = relations(fuelLog, ({ one }) => ({
	vehicle: one(vehicle, {
		fields: [fuelLog.vehicleId],
		references: [vehicle.id]
	})
}));

export const tripRelations = relations(trip, ({ one }) => ({
	driver: one(driver, {
		fields: [trip.driverId],
		references: [driver.id]
	}),
	vehicle: one(vehicle, {
		fields: [trip.vehicleId],
		references: [vehicle.id]
	})
}));

export type Task = typeof task.$inferSelect;
export type NewTask = typeof task.$inferInsert;

export type Employee = typeof employee.$inferSelect;
export type NewEmployee = typeof employee.$inferInsert;

export type Driver = typeof driver.$inferSelect;
export type NewDriver = typeof driver.$inferInsert;

export type Vehicle = typeof vehicle.$inferSelect;
export type NewVehicle = typeof vehicle.$inferInsert;

export type Trip = typeof trip.$inferSelect;
export type NewTrip = typeof trip.$inferInsert;

export type Maintenance = typeof maintenance.$inferSelect;
export type NewMaintenance = typeof maintenance.$inferInsert;

export type FuelLog = typeof fuelLog.$inferSelect;
export type NewFuelLog = typeof fuelLog.$inferInsert;

export type SystemSettings = typeof systemSettings.$inferSelect;
export type NewSystemSettings = typeof systemSettings.$inferInsert;

export * from './auth.schema';
