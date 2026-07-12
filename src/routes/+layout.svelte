<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import './layout.css';
	import { Toaster } from '$lib/components/ui/sonner';

	let { children } = $props();
</script>

<ModeWatcher />
<Toaster closeButton richColors />

{@render children()}
