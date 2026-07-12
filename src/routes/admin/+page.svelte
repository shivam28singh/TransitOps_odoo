<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { ChevronLeftIcon } from '@lucide/svelte';
	import { resolve } from '$app/paths';

	let { data } = $props();

	let searchQuery = $state('');

	let filteredEmployees = $derived(
		data.employees.filter((emp) => emp.email.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	// Keep track of which employee role is being updated to show a loading state if needed
	let updatingId = $state<number | null>(null);
	let updatingStatusId = $state<number | null>(null);

	const roleUpdateHandler = () => {
		return async ({ update, result, formData }) => {
			const empId = Number(formData.get('employeeId'));
			updatingId = empId;
			await update({ reset: false }); // Don't reset the form to avoid visual jumps
			updatingId = null;

			if (result.type === 'success') {
				toast.success('Role updated successfully');
			} else if (result.type === 'failure') {
				toast.error((result.data as any)?.error || 'Failed to update role');
			}
		};
	};

	const statusUpdateHandler = () => {
		return async ({ update, result, formData }) => {
			const empId = Number(formData.get('employeeId'));
			updatingStatusId = empId;
			await update({ reset: false }); // Don't reset the form to avoid visual jumps
			updatingStatusId = null;

			if (result.type === 'success') {
				toast.success('Status updated successfully');
			} else if (result.type === 'failure') {
				toast.error((result.data as any)?.error || 'Failed to update status');
			}
		};
	};
</script>

<div class="container mx-auto py-10 px-4 md:px-8 space-y-8">
	<div class="flex items-center gap-4">
		<Button href={resolve('/')} variant="ghost" size="icon" class="rounded-full">
			<ChevronLeftIcon />
			<span class="sr-only">Back to home</span>
		</Button>
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
			<p class="text-muted-foreground">
				Manage employees and their access roles across the platform.
			</p>
		</div>
	</div>

	<div class="flex items-center justify-between">
		<input
			type="search"
			placeholder="Search by email..."
			bind:value={searchQuery}
			class="flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
		/>
	</div>

	<div class="rounded-md border bg-card">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Name</Table.Head>
					<Table.Head>Email</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="w-[200px]">Role</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each filteredEmployees as employee (employee.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{employee.fullName}</Table.Cell>
						<Table.Cell>{employee.email}</Table.Cell>
						<Table.Cell>
							<form
								method="POST"
								action="?/updateStatus"
								use:enhance={statusUpdateHandler}
								class="inline-block"
							>
								<input type="hidden" name="employeeId" value={employee.id} />
								<input
									type="hidden"
									name="status"
									value={employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}
								/>
								<button
									type="submit"
									class="hover:opacity-80 transition-opacity"
									disabled={updatingStatusId === employee.id || employee.userId === data.user?.id}
								>
									{#if employee.status === 'ACTIVE'}
										<Badge variant="default" class="cursor-pointer">Active</Badge>
									{:else}
										<Badge variant="secondary" class="cursor-pointer">Inactive</Badge>
									{/if}
								</button>
							</form>
						</Table.Cell>
						<Table.Cell>
							<!-- Form to update the role automatically on change -->
							<form
								method="POST"
								action="?/updateRole"
								use:enhance={roleUpdateHandler}
								class="flex items-center gap-2"
							>
								<input type="hidden" name="employeeId" value={employee.id} />
								<Select.Root
									type="single"
									name="role"
									value={employee.role}
									disabled={employee.userId === data.user?.id}
								>
									<Select.Trigger class="w-[180px] h-8 text-xs">
										{employee.role}
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											<Select.GroupHeading>Role</Select.GroupHeading>
											<Select.Item value="DRIVER" label="Driver" />
											<Select.Item value="FLEET_MANAGER" label="Fleet Manager" />
											<Select.Item value="DISPATCHER" label="Dispatcher" />
											<Select.Item value="SAFETY_OFFICER" label="Safety Officer" />
											<Select.Item value="FINANCIAL_ANALYST" label="Financial Analyst" />
											<!-- <Select.Item value="ADMIN" label="Admin" /> -->
										</Select.Group>
									</Select.Content>
								</Select.Root>

								<Button
									type="submit"
									size="sm"
									variant="outline"
									class="h-8 px-2"
									disabled={updatingId === employee.id || employee.userId === data.user?.id}
								>
									{updatingId === employee.id ? '...' : 'Save'}
								</Button>
							</form>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={4} class="h-24 text-center">No employees found.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
