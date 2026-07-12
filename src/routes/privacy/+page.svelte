<script lang="ts">
	import { ChevronLeft } from '@lucide/svelte';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Privacy Policy | TransitOps</title>
</svelte:head>

<div class="min-h-screen bg-background pb-20 pt-10">
	<div class="container max-w-3xl px-6 mx-auto md:px-8">
		<a
			href={resolve('/')}
			class="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-10 transition-colors"
		>
			<ChevronLeft class="w-4 h-4 mr-1" />
			Back to Home
		</a>

		<div class="space-y-10">
			<header class="space-y-4 border-b pb-8">
				<h1 class="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground">
					Privacy Policy
				</h1>
				<p class="text-muted-foreground text-lg">
					Last updated: {new Date().toLocaleDateString('en-US', {
						month: 'long',
						day: 'numeric',
						year: 'numeric'
					})}
				</p>
			</header>

			<section class="space-y-8 text-foreground/80 leading-relaxed">
				<div class="space-y-3">
					<h2 class="text-2xl font-semibold text-foreground tracking-tight">1. Introduction</h2>
					<p>
						Welcome to TransitOps. We respect your privacy and are committed to protecting your
						personal data. This privacy policy will inform you as to how we look after your personal
						data when you visit our website and tell you about your privacy rights and how the law
						protects you.
					</p>
				</div>

				<div class="space-y-3">
					<h2 class="text-2xl font-semibold text-foreground tracking-tight">
						2. The Data We Collect About You
					</h2>
					<p>
						Personal data, or personal information, means any information about an individual from
						which that person can be identified. We may collect, use, store and transfer different
						kinds of personal data about you which we have grouped together follows:
					</p>
					<ul class="list-disc pl-6 space-y-1">
						<li>
							<strong>Identity Data:</strong> includes first name, last name, username or similar identifier.
						</li>
						<li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
						<li>
							<strong>Technical Data:</strong> includes internet protocol (IP) address, your login data,
							browser type and version, time zone setting and location, browser plug-in types and versions,
							operating system and platform.
						</li>
						<li>
							<strong>Usage Data:</strong> includes information about how you use our website, products
							and services.
						</li>
					</ul>
				</div>

				<div class="space-y-3">
					<h2 class="text-2xl font-semibold text-foreground tracking-tight">
						3. How We Use Your Personal Data
					</h2>
					<p>
						We will only use your personal data when the law allows us to. Most commonly, we will
						use your personal data in the following circumstances:
					</p>
					<ul class="list-disc pl-6 space-y-1">
						<li>
							Where we need to perform the contract we are about to enter into or have entered into
							with you.
						</li>
						<li>
							Where it is necessary for our legitimate interests (or those of a third party) and
							your interests and fundamental rights do not override those interests.
						</li>
						<li>Where we need to comply with a legal or regulatory obligation.</li>
					</ul>
				</div>

				<div class="space-y-3">
					<h2 class="text-2xl font-semibold text-foreground tracking-tight">4. Data Security</h2>
					<p>
						We have put in place appropriate security measures to prevent your personal data from
						being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.
						In addition, we limit access to your personal data to those employees, agents,
						contractors and other third parties who have a business need to know.
					</p>
				</div>

				<div class="space-y-3">
					<h2 class="text-2xl font-semibold text-foreground tracking-tight">5. Data Retention</h2>
					<p>
						We will only retain your personal data for as long as necessary to fulfil the purposes
						we collected it for, including for the purposes of satisfying any legal, accounting, or
						reporting requirements. To determine the appropriate retention period for personal data,
						we consider the amount, nature, and sensitivity of the personal data, the potential risk
						of harm from unauthorised use or disclosure, and whether we can achieve our purposes
						through other means.
					</p>
				</div>

				<div class="space-y-3">
					<h2 class="text-2xl font-semibold text-foreground tracking-tight">
						6. Your Legal Rights
					</h2>
					<p>
						Under certain circumstances, you have rights under data protection laws in relation to
						your personal data, including the right to request access, correction, erasure,
						restriction, transfer, to object to processing, to portability of data and (where the
						lawful ground of processing is consent) to withdraw consent.
					</p>
				</div>

				<div class="space-y-3">
					<h2 class="text-2xl font-semibold text-foreground tracking-tight">7. Contact Details</h2>
					<p>
						If you have any questions about this privacy policy or our privacy practices, please
						contact us at <a
							href="mailto:privacy@transitops.com"
							class="text-primary hover:underline underline-offset-4">privacy@transitops.com</a
						>.
					</p>
				</div>
			</section>
		</div>
	</div>
</div>
