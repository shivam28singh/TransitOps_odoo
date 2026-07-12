<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import {
		LayoutDashboard,
		Truck,
		Users,
		Map,
		Wrench,
		Fuel,
		ChartBar,
		Settings,
		ShieldAlert,
		LogOut,
		Menu
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import Themetoggler from '$lib/components/custom/themetoggler.svelte';
	import { goto } from '$app/navigation';

	let { children } = $props();

	// Get layout loaded data
	let user = $derived(page.data.user);
	let employee = $derived(page.data.employee);

	const links = [
		{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
		{ label: 'Fleet', href: '/fleet', icon: Truck },
		{ label: 'Drivers', href: '/drivers', icon: Users },
		{ label: 'Trips', href: '/trips', icon: Map },
		{ label: 'Maintenance', href: '/maintenance', icon: Wrench },
		{ label: 'Fuel & Expenses', href: '/finance', icon: Fuel },
		{ label: 'Analytics', href: '/analytics', icon: ChartBar },
		{ label: 'Settings', href: '/settings', icon: Settings }
	];
</script>

<Sidebar.Provider>
	<Sidebar.Root>
		<Sidebar.Header class="border-sidebar-border p-4 flex flex-row items-center justify-between">
			<a class="flex items-center gap-2 font-semibold text-sidebar-foreground" href={resolve('/')}>
				<img src="/favicon.svg" alt="Logo" class="size-6" />
				<span class="text-lg">TransitOps</span>
			</a>
		</Sidebar.Header>

		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupLabel
					class="px-3 text-xs font-semibold text-sidebar-foreground/50 tracking-wider uppercase"
					>Menu</Sidebar.GroupLabel
				>
				<Sidebar.GroupContent class="mt-2">
					<Sidebar.SidebarMenu class="my-1!">
						{#each links as link, idx (idx)}
							{@const Icon = link.icon}
							<Sidebar.SidebarMenuItem>
								<Sidebar.SidebarMenuButton
									onclick={() => goto(resolve(link.href))}
									isActive={page.url.pathname.startsWith(link.href)}
									class="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/80"
								>
									<Icon class="size-4" />
									<span>{link.label}</span>
								</Sidebar.SidebarMenuButton>
							</Sidebar.SidebarMenuItem>
						{/each}

						{#if employee?.role === 'ADMIN'}
							<Sidebar.SidebarMenuItem>
								<Sidebar.SidebarMenuButton
									onclick={() => goto(resolve('/admin'))}
									isActive={page.url.pathname.startsWith('/admin')}
									class="flex items-center gap-3 px-3 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
								>
									<ShieldAlert class="size-4" />
									<span>Admin Panel</span>
								</Sidebar.SidebarMenuButton>
							</Sidebar.SidebarMenuItem>
						{/if}
					</Sidebar.SidebarMenu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>

		<Sidebar.Footer class="border-sidebar-border">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="w-full flex items-center justify-between p-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors text-left"
				>
					<div class="flex items-center gap-3 overflow-hidden">
						<Avatar.Root class="size-8">
							<Avatar.Fallback class="bg-primary/10 text-primary"
								>{user?.name?.charAt(0).toUpperCase() || 'U'}</Avatar.Fallback
							>
						</Avatar.Root>
						<div class="flex flex-col truncate">
							<span class="text-sm font-medium leading-none">{user?.name || 'User'}</span>
							<span class="text-xs text-sidebar-foreground/50 truncate mt-1"
								>{employee?.role || 'Guest'}</span
							>
						</div>
					</div>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" class="w-[200px]">
					<DropdownMenu.Label class="font-normal">
						<div class="flex flex-col space-y-1">
							<p class="text-sm font-medium leading-none">{user?.name}</p>
							<p class="text-xs leading-none text-muted-foreground">{user?.email}</p>
						</div>
					</DropdownMenu.Label>
					<DropdownMenu.Item onclick={() => goto(resolve('/settings'))}>Settings</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => goto(resolve('/signout'))} class="text-destructive">
						<LogOut class="mr-2 size-4" />
						Sign Out
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</Sidebar.Footer>
	</Sidebar.Root>

	<Sidebar.Inset class="flex flex-col bg-background">
		<header
			class="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6"
		>
			<div class="flex items-center gap-2">
				<Sidebar.Trigger>
					<Button variant="ghost" size="icon">
						<Menu class="size-5" />
					</Button>
				</Sidebar.Trigger>
			</div>
			<div class="flex items-center gap-4">
				<Themetoggler />
			</div>
		</header>

		<main class="flex-1 overflow-y-auto">
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
