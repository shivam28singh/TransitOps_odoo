<script lang="ts" module>
	let open = $state(false);
	let onSuccessCallback = $state<((newDriver: any) => void) | null>(null);

	export const openAddDriver = (callback?: (newDriver: any) => void) => {
		open = true;
		if (callback) {
			onSuccessCallback = callback;
		}
	};
</script>

<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import { getLocalTimeZone, type CalendarDate } from '@internationalized/date';
	import { cn } from '$lib/utils';

	let fullName = $state('');
	let email = $state('');
	let phone = $state('');
	let licenseNumber = $state('');
	let licenseCategory = $state('');
	let licenseExpiry = $state<CalendarDate | undefined>();
	let popoverOpen = $state(false);
	let safetyScore = $state<number | null>(100);
	let status = $state<'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'SUSPENDED'>('AVAILABLE');
	let submitting = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;

		if (!licenseExpiry) {
			toast.error('License expiry date is required');
			submitting = false;
			return;
		}

		try {
			const res = await fetch('/api/drivers', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					fullName,
					email,
					phone,
					licenseNumber,
					licenseCategory,
					licenseExpiry: licenseExpiry ? licenseExpiry.toString() : '',
					safetyScore,
					status
				})
			});
			const resData = await res.json();
			if (!res.ok) {
				toast.error(resData.error || 'Failed to add driver');
				return;
			}
			toast.success('Driver added successfully');
			open = false;

			// Reset local bindings
			fullName = '';
			email = '';
			phone = '';
			licenseNumber = '';
			licenseCategory = '';
			licenseExpiry = undefined;
			safetyScore = 100;
			status = 'AVAILABLE';

			if (onSuccessCallback) {
				onSuccessCallback(resData.driver);
			}
			await invalidateAll();
		} catch (error: any) {
			toast.error(error.message || 'An error occurred');
		} finally {
			submitting = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[480px]">
		<Dialog.Header>
			<Dialog.Title>Add New Driver</Dialog.Title>
			<Dialog.Description>
				Enter profile details to create a new driver. An associated system user account will be
				created.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4 py-4">
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-1.5 col-span-2">
					<label for="fullName" class="text-xs font-medium text-muted-foreground"
						>Driver Full Name *</label
					>
					<Input
						id="fullName"
						name="fullName"
						bind:value={fullName}
						placeholder="e.g. Alex Johnson"
						required
					/>
				</div>

				<div class="space-y-1.5 col-span-2">
					<label for="email" class="text-xs font-medium text-muted-foreground"
						>Email Address *</label
					>
					<Input
						id="email"
						name="email"
						type="email"
						bind:value={email}
						placeholder="e.g. alex.j@transitops.com"
						required
					/>
				</div>

				<div class="space-y-1.5 col-span-2">
					<label for="phone" class="text-xs font-medium text-muted-foreground"
						>Contact Number *</label
					>
					<Input
						id="phone"
						name="phone"
						type="tel"
						bind:value={phone}
						placeholder="e.g. 9876543210"
						required
					/>
				</div>

				<div class="space-y-1.5">
					<label for="licenseNumber" class="text-xs font-medium text-muted-foreground"
						>License Number *</label
					>
					<Input
						id="licenseNumber"
						name="licenseNumber"
						bind:value={licenseNumber}
						placeholder="e.g. DL-88213"
						required
					/>
				</div>

				<div class="space-y-1.5">
					<label for="licenseCategory" class="text-xs font-medium text-muted-foreground"
						>License Category *</label
					>
					<Input
						id="licenseCategory"
						name="licenseCategory"
						bind:value={licenseCategory}
						placeholder="e.g. LMV / HMV"
						required
					/>
				</div>

				<div class="space-y-1.5 flex flex-col">
					<label for="licenseExpiry" class="text-xs font-medium text-muted-foreground"
						>License Expiry Date *</label
					>
					<Popover.Root bind:open={popoverOpen}>
						<Popover.Trigger>
							<Button
								{...props}
								variant="outline"
								class={cn(
									'w-full justify-start text-start font-normal',
									!licenseExpiry && 'text-muted-foreground'
								)}
							>
								<CalendarIcon class="mr-2 h-4 w-4" />
								{licenseExpiry
									? licenseExpiry.toDate(getLocalTimeZone()).toLocaleDateString()
									: 'Select date'}
							</Button>
						</Popover.Trigger>
						<Popover.Content class="w-auto p-0">
							<Calendar
								bind:value={licenseExpiry}
								type="single"
								initialFocus
								onValueChange={() => {
									popoverOpen = false;
								}}
							/>
						</Popover.Content>
					</Popover.Root>
				</div>

				<div class="space-y-1.5">
					<label for="safetyScore" class="text-xs font-medium text-muted-foreground"
						>Safety Score (%)</label
					>
					<Input
						id="safetyScore"
						name="safetyScore"
						type="number"
						min="0"
						max="100"
						bind:value={safetyScore}
						placeholder="e.g. 100"
					/>
				</div>

				<div class="space-y-1.5 col-span-2">
					<label for="status" class="text-xs font-medium text-muted-foreground"
						>Driver Status *</label
					>
					<Select.Root type="single" name="status" bind:value={status}>
						<Select.Trigger class="w-full">
							{status === 'AVAILABLE'
								? 'Available'
								: status === 'ON_TRIP'
									? 'On Trip'
									: status === 'OFF_DUTY'
										? 'Off Duty'
										: 'Suspended'}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="AVAILABLE" label="Available">Available</Select.Item>
							<Select.Item value="ON_TRIP" label="On Trip">On Trip</Select.Item>
							<Select.Item value="OFF_DUTY" label="Off Duty">Off Duty</Select.Item>
							<Select.Item value="SUSPENDED" label="Suspended">Suspended</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={submitting}>
					{submitting ? 'Adding...' : 'Add Driver'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
