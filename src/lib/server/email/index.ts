import { Resend } from 'resend';
import { confirmEmailTemplate, passwordResetTemplate } from './templates';
import { RESEND_API_KEY } from '$env/static/private';

const resend = new Resend(RESEND_API_KEY);

export const sendEmailVerificationEmail = async (email: string, name: string, url: string) => {
	console.log('Sending email verification email to', email);
	await resend.emails.send({
		from: 'TransitOps <tansitops@nota.ink>',
		to: [email],
		subject: 'Verify your email',
		html: confirmEmailTemplate(url, name)
	});
};

export const sendPasswordResetEmail = async (email: string, name: string, url: string) => {
	console.log('Sending password reset email to', email);
	await resend.emails.send({
		from: 'TransitOps <tansitops@nota.ink>',
		to: [email],
		subject: 'Reset your password',
		html: passwordResetTemplate(url, name)
	});
};
