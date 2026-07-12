<script lang="ts">
	import { AtSignIcon, ChevronLeftIcon, LockIcon, UserIcon } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { FloatingPaths } from '$lib/components/ui/floating-paths';
	import { InputGroup, InputGroupAddon, InputGroupInput } from '$lib/components/ui/input-group';
	import * as Select from '$lib/components/ui/select';
	import { resolve } from '$app/paths';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';

	let { form } = $props();

	let homeHref = $state('/');
	let name = $state('');
	let email = $state('');
	let password = $state('');
	let role = $state('DISPATCHER');
	let isSubmitting = $state(false);
	let errorMessage = $state('');
	let isSuccess = $state(false);

	$effect(() => {
		if (form?.error) {
			errorMessage = form.error;
		}
		if (form?.success) {
			isSuccess = true;
			toast.success('Sign up successful! Please check your email.');
		}
	});

	const submitHandler = () => {
		isSubmitting = true;
		errorMessage = '';
		return async ({ update, result }) => {
			await update();
			isSubmitting = false;
			if (result.type === 'failure') {
				errorMessage = (result.data as any)?.error || 'Signup failed.';
				toast.error('Signup failed.');
			}
		};
	};
</script>

<main class="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
	<!-- Left Side -->
	<div
		class="relative hidden h-full flex-col border-r bg-secondary p-10 lg:flex dark:bg-secondary/20"
	>
		<div
			class="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background"
		></div>

		<a aria-label="Home" class="relative z-10 mr-auto flex items-center gap-2" href={resolve('/')}>
			<img src="/favicon.svg" alt="Logo" class="size-5" />
			<span>TransitOps</span>
		</a>

		<!-- Integrated Roles with existing blockquote-like layout/style to preserve look -->
		<div class="z-10 mt-auto space-y-6">
			<div class="space-y-1">
				<h1 class="text-3xl font-extrabold tracking-tight">TransitOps</h1>
				<p class="text-sm font-medium text-muted-foreground">Smart Transport Operations Platform</p>
			</div>

			<div class="space-y-2">
				<h2 class="text-lg font-semibold tracking-tight">One login, four roles:</h2>
				<ul class="space-y-1 text-sm text-muted-foreground list-disc pl-4">
					<li class="marker:text-primary">Fleet Manager</li>
					<li class="marker:text-primary">Dispatcher</li>
					<li class="marker:text-primary">Safety Officer</li>
					<li class="marker:text-primary">Financial Analyst</li>
				</ul>
			</div>
		</div>
		<div class="mt-auto pt-4 z-100! text-xs text-muted-foreground">TRANSITOPS © 2026</div>

		<div class="absolute inset-0">
			<FloatingPaths position={1} />
			<FloatingPaths position={-1} />
		</div>
	</div>

	<!-- Right Side -->
	<div class="relative flex min-h-screen flex-col justify-center px-8">
		<div aria-hidden="true" class="absolute inset-0 isolate -z-10 opacity-60 contain-strict">
			<div
				class="absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)]"
			></div>
			<div
				class="absolute top-0 right-0 h-320 w-60 [translate:5%_-50%] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]"
			></div>
			<div
				class="absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]"
			></div>
		</div>

		<Button class="absolute top-7 left-5" href={homeHref} variant="ghost">
			<ChevronLeftIcon data-icon="inline-start" />
			Home
		</Button>

		<div class="mx-auto w-full max-w-sm space-y-6">
			<a aria-label="Home" class="w-fit lg:hidden flex items-center gap-2 mb-4" href={resolve('/')}>
				<img src="favicon.svg" alt="Logo" class="size-5" />
				<span class="font-bold">TransitOps</span>
			</a>

			{#if isSuccess}
				<div class="space-y-4">
					<div class="flex flex-col space-y-1">
						<h1 class="text-2xl font-bold tracking-wide text-primary">Verify your email</h1>
						<p class="text-sm text-muted-foreground">
							We sent a verification email to <span class="font-semibold text-foreground"
								>{email}</span
							>.
						</p>
					</div>
					<div class="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground border border-muted">
						Please click the link inside the verification email to activate your account.
					</div>
					<Button class="w-full" href={resolve('/signin')}>Back to Sign In</Button>
				</div>
			{:else}
				<div class="flex flex-col space-y-1">
					<h1 class="text-2xl font-bold tracking-wide">Create your account</h1>
					<p class="text-sm text-muted-foreground">Enter your details to register.</p>
				</div>

				<form class="space-y-4" method="POST" use:enhance={submitHandler}>
					{#if errorMessage}
						<div
							class="p-3 text-xs text-destructive border border-destructive/20 bg-destructive/10 rounded-md"
						>
							<span class="font-bold">Error state</span><br />
							❌ {errorMessage}
						</div>
					{/if}

					<div class="space-y-3">
						<div class="space-y-1">
							<label
								for="name"
								class="text-[10px] font-bold text-muted-foreground tracking-wider uppercase"
								>Full Name</label
							>
							<InputGroup>
								<InputGroupInput
									id="name"
									name="name"
									bind:value={name}
									placeholder="Raven K"
									type="text"
									required
								/>
								<InputGroupAddon align="inline-start">
									<UserIcon />
								</InputGroupAddon>
							</InputGroup>
						</div>

						<div class="space-y-1">
							<label
								for="email"
								class="text-[10px] font-bold text-muted-foreground tracking-wider uppercase"
								>Email</label
							>
							<InputGroup>
								<InputGroupInput
									id="email"
									name="email"
									bind:value={email}
									placeholder="Raven.k@transitops.in"
									type="email"
									required
								/>
								<InputGroupAddon align="inline-start">
									<AtSignIcon />
								</InputGroupAddon>
							</InputGroup>
						</div>

						<div class="space-y-1">
							<label
								for="password"
								class="text-[10px] font-bold text-muted-foreground tracking-wider uppercase"
								>Password</label
							>
							<InputGroup>
								<InputGroupInput
									id="password"
									name="password"
									bind:value={password}
									placeholder="********"
									type="password"
									required
								/>
								<InputGroupAddon align="inline-start">
									<LockIcon />
								</InputGroupAddon>
							</InputGroup>
						</div>

						<div class="space-y-1">
							<label
								for="role"
								class="text-[10px] font-bold text-muted-foreground tracking-wider uppercase"
								>Role (RBAC)</label
							>
							<Select.Root type="single" bind:value={role} name="role">
								<Select.Trigger
									class="w-full h-10 text-left bg-transparent border-input focus:ring-2 focus:ring-ring focus:ring-offset-2"
								>
									{role ? role.split('_').map(w => w[0] + w.slice(1).toLowerCase()).join(' ') : 'Select a role'}
								</Select.Trigger>
								<Select.Content>
									<Select.Group>
										<Select.GroupHeading>Role</Select.GroupHeading>
										<Select.Item value="FLEET_MANAGER" label="Fleet Manager" />
										<Select.Item value="DISPATCHER" label="Dispatcher" />
										<Select.Item value="SAFETY_OFFICER" label="Safety Officer" />
										<Select.Item value="FINANCIAL_ANALYST" label="Financial Analyst" />
										<!-- <Select.Item value="ADMIN" label="Admin" /> -->
									</Select.Group>
								</Select.Content>
							</Select.Root>
						</div>
					</div>

					<Button class="w-full h-10" type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Registering...' : 'Sign Up'}
					</Button>
				</form>

				<p class="text-xs text-center text-muted-foreground">
					Already have an account?
					<a
						href={resolve('/signin')}
						class="font-semibold text-primary hover:underline underline-offset-4">Sign In</a
					>
				</p>
			{/if}
		</div>
	</div>
</main>
