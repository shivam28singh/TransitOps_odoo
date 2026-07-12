<script lang="ts">
	import { ChevronLeft } from '@lucide/svelte';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Terms of Service | TransitOps</title>
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
					Terms of Service
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
					<h2 class="text-2xl font-semibold text-foreground tracking-tight">
						1. Acceptance of Terms
					</h2>
					<p>
						By accessing and using TransitOps, you accept and agree to be bound by the terms and
						provision of this agreement. In addition, when using these particular services, you
						shall be subject to any posted guidelines or rules applicable to such services.
					</p>
				</div>

				<div class="space-y-3">
					<h2 class="text-2xl font-semibold text-foreground tracking-tight">
						2. Description of Service
					</h2>
					<p>
						TransitOps provides a comprehensive transit operations management platform. We reserve
						the right to modify, suspend, or discontinue the Service at any time without notice, at
						our sole discretion. We will not be liable if, for any reason, all or any part of the
						Service is unavailable at any time or for any period.
					</p>
				</div>

				<div class="space-y-3">
					<h2 class="text-2xl font-semibold text-foreground tracking-tight">
						3. User Account and Security
					</h2>
					<p>
						If you create an account on our Service, you are responsible for maintaining the
						security of your account and its credentials, and you are fully responsible for all
						activities that occur under the account. You must immediately notify us of any
						unauthorized uses of your account or any other breaches of security. We will not be
						liable for any acts or omissions by you, including any damages of any kind incurred as a
						result of such acts or omissions.
					</p>
				</div>

				<div class="space-y-3">
					<h2 class="text-2xl font-semibold text-foreground tracking-tight">
						4. Intellectual Property
					</h2>
					<p>
						The Service and its original content, features, and functionality are and will remain
						the exclusive property of TransitOps and its licensors. The Service is protected by
						copyright, trademark, and other laws. Our trademarks and trade dress may not be used in
						connection with any product or service without the prior written consent of TransitOps.
					</p>
				</div>

				<div class="space-y-3">
					<h2 class="text-2xl font-semibold text-foreground tracking-tight">5. Termination</h2>
					<p>
						We may terminate or suspend your account immediately, without prior notice or liability,
						for any reason whatsoever, including without limitation if you breach the Terms. Upon
						termination, your right to use the Service will immediately cease.
					</p>
				</div>

				<div class="space-y-3">
					<h2 class="text-2xl font-semibold text-foreground tracking-tight">
						6. Limitation of Liability
					</h2>
					<p>
						In no event shall TransitOps, nor its directors, employees, partners, agents, suppliers,
						or affiliates, be liable for any indirect, incidental, special, consequential or
						punitive damages, including without limitation, loss of profits, data, use, goodwill, or
						other intangible losses, resulting from your access to or use of or inability to access
						or use the Service.
					</p>
				</div>

				<div class="space-y-3">
					<h2 class="text-2xl font-semibold text-foreground tracking-tight">7. Changes to Terms</h2>
					<p>
						We reserve the right, at our sole discretion, to modify or replace these Terms at any
						time. What constitutes a material change will be determined at our sole discretion. By
						continuing to access or use our Service after those revisions become effective, you
						agree to be bound by the revised terms.
					</p>
				</div>

				<div class="space-y-3">
					<h2 class="text-2xl font-semibold text-foreground tracking-tight">8. Contact Us</h2>
					<p>
						If you have any questions about these Terms, please contact us at <a
							href="mailto:support@transitops.com"
							class="text-primary hover:underline underline-offset-4">support@transitops.com</a
						>.
					</p>
				</div>
			</section>
		</div>
	</div>
</div>
