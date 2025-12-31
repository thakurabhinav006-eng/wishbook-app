from app.core.config import settings
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(to_email: str, subject: str, body_text: str, body_html: str = None):
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"Skipping email to {to_email} (SMTP credentials missing)")
        return False

    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = settings.SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject

        # Attach text body
        msg.attach(MIMEText(body_text, 'plain'))
        
        # Attach HTML body if provided
        if body_html:
            msg.attach(MIMEText(body_html, 'html'))

        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def send_password_reset_email(to_email: str, token: str):
    reset_link = f"http://localhost:3000/reset-password?token={token}" # TODO: Get base URL from config
    
    # DEV: Print link to console for debugging
    print(f"\n{'='*50}\nPASSWORD RESET LINK:\n{reset_link}\n{'='*50}\n")
    
    subject = "Password Reset Request"
    
    body_text = f"""
    You requested a password reset.
    
    Please click the link below to reset your password:
    {reset_link}
    
    If you did not request this, please ignore this email.
    
    This link will expire in 1 hour.
    """
    
    body_html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #666;">Password Reset Request</h2>
                <p>You requested a password reset.</p>
                <p>Please click the button below to reset your password:</p>
                <a href="{reset_link}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
                <p style="font-size: 12px; color: #999;">If you did not request this, please ignore this email.</p>
                <p style="font-size: 12px; color: #999;">This link will expire in 1 hour.</p>
            </div>
        </body>
    </html>
    """
    
    return send_email(to_email, subject, body_text, body_html)
