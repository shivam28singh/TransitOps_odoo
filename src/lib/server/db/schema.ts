import { pgTable, serial, integer, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth.schema';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const employeeRoleEnum = pgEnum('employee_role', [
	'ADMIN',
	'FLEET_MANAGER',
	'DISPATCHER',
	'SAFETY_OFFICER',
	'FINANCIAL_ANALYST',
	'DRIVER'
]);

export const employeeStatusEnum = pgEnum('employee_status', ['ACTIVE', 'INACTIVE']);

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
	safetyScore: integer('safety_score').default(100),
	status: text('status').default('ACTIVE')
});

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

export const driverRelations = relations(driver, ({ one }) => ({
	employee: one(employee, {
		fields: [driver.employeeId],
		references: [employee.id]
	})
}));

export * from './auth.schema';
