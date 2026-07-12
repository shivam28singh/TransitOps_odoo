<script lang="ts">
	import Header from '$lib/components/custom/header/header.svelte';
	const { data } = $props();
</script>

<Header user={data.user} />
