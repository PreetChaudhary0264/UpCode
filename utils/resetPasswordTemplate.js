// utils/resetPasswordTemplate.js
const resetPasswordTemplate = (name, resetLink) => `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
  <div style="max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 8px;">
    <h2 style="color: #facc15; text-align: center;">UpCode Password Reset</h2>
    <p>Hi ${name || 'User'},</p>
    <p>You requested a password reset. Click the button below to set a new password. This link is valid for 5 minutes.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" 
         style="background-color: #facc15; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
         Reset Password
      </a>
    </div>
    <p>If you didn't request this, please ignore this email.</p>
    <p>Thanks,<br/>The UpCode Team</p>
  </div>
</div>
`;

module.exports = resetPasswordTemplate;

