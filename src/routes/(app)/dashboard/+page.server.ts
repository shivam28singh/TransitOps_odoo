import { db } from '$lib/server/db';
import { vehicle, driver, employee, trip } from '$lib/server/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	// Auto-seed mock data if database is empty to guarantee a functional first-glance dashboard
	const existingVehicles = await db.select().from(vehicle).limit(1);

	if (existingVehicles.length === 0) {
		try {
			const mockVehicles = [
				{
					regNo: 'VAN-05',
					name: 'Delivery Van 05',
					type: 'VAN',
					capacityKg: '1500.00',
					odometerKm: '45200.00',
					acquisitionCost: '25000.00',
					region: 'North',
					status: 'ON_TRIP'
				},
				{
					regNo: 'TRK-12',
					name: 'Heavy Truck 12',
					type: 'TRUCK',
					capacityKg: '12000.00',
					odometerKm: '128000.00',
					acquisitionCost: '85000.00',
					region: 'South',
					status: 'AVAILABLE'
				},
				{
					regNo: 'MINI-08',
					name: 'Mini Carrier 08',
					type: 'MINI',
					capacityKg: '800.00',
					odometerKm: '15400.00',
					acquisitionCost: '18000.00',
					region: 'East',
					status: 'AVAILABLE'
				},
				{
					regNo: 'VAN-09',
					name: 'Delivery Van 09',
					type: 'VAN',
					capacityKg: '1500.00',
					odometerKm: '32000.00',
					acquisitionCost: '26000.00',
					region: 'North',
					status: 'IN_SHOP'
				},
				{
					regNo: 'TRK-15',
					name: 'Heavy Truck 15',
					type: 'TRUCK',
					capacityKg: '15000.00',
					odometerKm: '210000.00',
					acquisitionCost: '95000.00',
					region: 'West',
					status: 'RETIRED'
				}
			];
			await db.insert(vehicle).values(mockVehicles as any);

			// Insure there is a driver to link the mock trips to
			let targetDriverId: number;
			const existingDrivers = await db.select().from(driver).limit(1);

			if (existingDrivers.length === 0) {
				let empId = locals.employee?.id;
				// If current user is not mapped to an employee (e.g. signup skipped it, which shouldn't happen), create a mock employee
				if (!empId) {
					const [newEmp] = await db
						.insert(employee)
						.values({
							userId: locals.user!.id,
							fullName: locals.user!.name,
							role: 'DRIVER',
							status: 'ACTIVE'
						})
						.returning();
					empId = newEmp.id;
				}

				const [newDriver] = await db
					.insert(driver)
					.values({
						employeeId: empId,
						licenseNumber: 'DL-9923849',
						licenseCategory: 'HEAVY',
						licenseExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
						safetyScore: '95.50',
						status: 'AVAILABLE'
					})
					.returning();
				targetDriverId = newDriver.id;
			} else {
				targetDriverId = existingDrivers[0].id;
			}

			const currentVehicles = await db.select().from(vehicle).limit(3);
			if (currentVehicles.length > 0) {
				const mockTrips = [
					{
						vehicleId: currentVehicles[0].id,
						driverId: targetDriverId,
						startTime: new Date(),
						startLocation: 'Warehouse A',
						endLocation: 'Client Site X',
						distanceKm: '45.20',
						status: 'IN_PROGRESS',
						notes: 'Express delivery'
					},
					{
						vehicleId: currentVehicles[1].id,
						driverId: targetDriverId,
						startTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
						endTime: new Date(),
						startLocation: 'HQ Depot',
						endLocation: 'Distribution Center Y',
						distanceKm: '120.50',
						status: 'COMPLETED',
						notes: 'Bulk transfer completed'
					},
					{
						vehicleId: currentVehicles[2].id,
						driverId: targetDriverId,
						startTime: new Date(Date.now() + 1000 * 60 * 60 * 4),
						startLocation: 'HQ Depot',
						endLocation: 'Client Site Z',
						distanceKm: '15.00',
						status: 'SCHEDULED',
						notes: 'Scheduled for tomorrow'
					}
				];
				await db.insert(trip).values(mockTrips as any);
			}
		} catch (e) {
			console.error('Failed to auto-seed mock data:', e);
		}
	}

	// Filter query parsing
	const vehicleType = url.searchParams.get('vehicleType') || 'All';
	const status = url.searchParams.get('status') || 'All';
	const region = url.searchParams.get('region') || 'All';

	// Build filter queries
	const vehicleWhere = [];
	if (vehicleType !== 'All') {
		vehicleWhere.push(eq(vehicle.type, vehicleType as any));
	}
	if (status !== 'All') {
		vehicleWhere.push(eq(vehicle.status, status as any));
	}
	if (region !== 'All') {
		vehicleWhere.push(eq(vehicle.region, region));
	}

	const vehiclesData = await db
		.select()
		.from(vehicle)
		.where(vehicleWhere.length > 0 ? and(...vehicleWhere) : undefined);

	const driversData = await db.select().from(driver);
	const tripsData = await db.select().from(trip);

	// Perform calculations scoped to filtered vehicles
	const vehicleIds = new Set(vehiclesData.map((v) => v.id));
	const filteredTrips = tripsData.filter((t) => vehicleIds.has(t.vehicleId));

	// KPIs
	const activeVehicles = vehiclesData.filter((v) => v.status === 'ON_TRIP').length;
	const availableVehicles = vehiclesData.filter((v) => v.status === 'AVAILABLE').length;
	const inMaintenanceVehicles = vehiclesData.filter((v) => v.status === 'IN_SHOP').length;
	const activeTrips = filteredTrips.filter((t) => t.status === 'IN_PROGRESS').length;
	const pendingTrips = filteredTrips.filter((t) => t.status === 'SCHEDULED').length;
	const driversOnDuty = driversData.filter(
		(d) => d.status === 'AVAILABLE' || d.status === 'ON_TRIP'
	).length;

	const totalVehicles = vehiclesData.length;
	const fleetUtilization =
		totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

	// Query top 5 recent trips with joins for visualization
	const recentTripsRaw = await db
		.select({
			id: trip.id,
			status: trip.status,
			startTime: trip.startTime,
			startLocation: trip.startLocation,
			endLocation: trip.endLocation,
			vehicleName: vehicle.name,
			driverName: employee.fullName
		})
		.from(trip)
		.innerJoin(vehicle, eq(trip.vehicleId, vehicle.id))
		.innerJoin(driver, eq(trip.driverId, driver.id))
		.innerJoin(employee, eq(driver.employeeId, employee.id))
		.orderBy(sql`${trip.createdAt} DESC`)
		.limit(5);

	// Get all unique regions and types for filters from the unfiltered vehicle list
	const allVehicles = await db.select().from(vehicle);
	const regions = Array.from(new Set(allVehicles.map((v) => v.region).filter(Boolean))) as string[];
	const vehicleTypes = ['VAN', 'TRUCK', 'MINI'];

	// Aggregate values for the "Vehicle Status" progress bars
	const totalAllVehicles = allVehicles.length;
	const statusCounts = {
		available: allVehicles.filter((v) => v.status === 'AVAILABLE').length,
		onTrip: allVehicles.filter((v) => v.status === 'ON_TRIP').length,
		inShop: allVehicles.filter((v) => v.status === 'IN_SHOP').length,
		retired: allVehicles.filter((v) => v.status === 'RETIRED').length,
		total: totalAllVehicles
	};

	return {
		kpis: {
			activeVehicles,
			availableVehicles,
			inMaintenanceVehicles,
			activeTrips,
			pendingTrips,
			driversOnDuty,
			fleetUtilization
		},
		recentTrips: recentTripsRaw,
		filters: {
			regions,
			vehicleTypes,
			selectedType: vehicleType,
			selectedStatus: status,
			selectedRegion: region
		},
		statusCounts
	};
};
