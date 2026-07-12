<script lang="ts">
	import TestimonialCard from './testimonial-card.svelte';

	type Testimonial = {
		quote: string;
		name: string;
		role: string;
		company: string;
		image: string;
	};
	let testimonials: Testimonial[] = [
		{
			quote:
				'TransitOps has completely revolutionized our logistics. The seamless dispatching and real-time tracking is unparalleled.',
			image:
				'https://imageio.forbes.com/specials-images/imageserve/6619bd484f5aec5d9536ce3b/0x0.jpg?format=jpg&crop=996,995,x1811,y45,safe&height=416&width=416&fit=bounds',
			name: 'Fabien Pinckaers',
			role: 'CEO',
			company: 'Odoo'
		},
		{
			quote:
				"We're considering running our entire Prime delivery fleet on TransitOps. Flawless logistics at a global scale? Done.",
			image: 'https://unavatar.io/x/JeffBezos',
			name: 'Jeff Bezos',
			role: 'Founder',
			company: 'Amazon'
		},
		{
			quote:
				'The routing efficiency in TransitOps is so advanced, I almost thought it was powered by AGI. A must-have for modern fleets.',
			image: 'https://unavatar.io/x/sama',
			name: 'Sam Altman',
			role: 'CEO',
			company: 'OpenAI'
		}
	];
</script>

<div class="mx-auto -mt-10 grid w-full max-w-5xl gap-8 md:grid-cols-3 md:gap-6">
	{#each testimonials as testimonial, index (index)}
		<TestimonialCard {index} {testimonial} />
	{/each}
</div>
