import { ORIGIN } from '$env/static/private';

export const confirmEmailTemplate = (url: string, name: string) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirm your email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #18181b; background-color: #ffffff; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="margin-bottom: 24px; display: flex; align-items: center;">
      <img src="${ORIGIN}/favicon.ico" alt="TransitOps Logo" style="width: 32px; height: 32px; vertical-align: middle; border-radius: 6px;">
      <span style="font-weight: 700; font-size: 20px; vertical-align: middle; margin-left: 10px; color: #18181b;">TransitOps</span>
    </div>

    <!-- Card -->
    <div style="border: 1px solid #e4e4e7; border-radius: 10px; padding: 40px; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);">
      <h1 style="font-size: 24px; font-weight: 600; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.025em; color: #18181b;">Confirm your email address</h1>
      
      <p style="margin-bottom: 24px; color: #18181b; font-size: 16px;">
        Hello, ${name}
        <br><br>
        Thanks for signing up for TransitOps. Please confirm your email address by clicking the button below to get started.
      </p>

      <div style="margin-bottom: 32px;">
        <a href="${url}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 15px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">
          Confirm Email Address
        </a>
      </div> 
      <p style="margin: 0; font-size: 14px; color: #71717a;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    <!-- Footer -->
    <div style="margin-top: 32px; text-align: center; font-size: 13px; color: #71717a;">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} TransitOps. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const passwordResetTemplate = (url: string, name: string) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reset your password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #18181b; background-color: #ffffff; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="margin-bottom: 24px; display: flex; align-items: center;">
      <img src="${ORIGIN}/favicon.ico" alt="TransitOps Logo" style="width: 32px; height: 32px; vertical-align: middle; border-radius: 6px;">
      <span style="font-weight: 700; font-size: 20px; vertical-align: middle; margin-left: 10px; color: #18181b;">TransitOps</span>
    </div>

    <!-- Card -->
    <div style="border: 1px solid #e4e4e7; border-radius: 10px; padding: 40px; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);">
      <h1 style="font-size: 24px; font-weight: 600; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.025em; color: #18181b;">Reset your password</h1>
      
      <p style="margin-bottom: 24px; color: #18181b; font-size: 16px;">
        Hello, ${name}
        <br><br>
        You recently requested to reset your password for your TransitOps account. Click the button below to proceed.
      </p>

      <div style="margin-bottom: 32px;">
        <a href="${url}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 15px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">
          Reset Password
        </a>
      </div> 
      <p style="margin: 0; font-size: 14px; color: #71717a;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    <!-- Footer -->
    <div style="margin-top: 32px; text-align: center; font-size: 13px; color: #71717a;">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} TransitOps. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
