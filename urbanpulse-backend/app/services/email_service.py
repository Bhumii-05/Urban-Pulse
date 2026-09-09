import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import settings


def send_email(
    to_email: str,
    subject: str,
    html_content: str,
) -> None:
    message = MIMEMultipart("alternative")
    message["From"] = settings.MAIL_FROM
    message["To"] = to_email
    message["Subject"] = subject

    message.attach(MIMEText(html_content, "html"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(
            settings.MAIL_FROM,
            to_email,
            message.as_string(),
        )


async def send_password_reset_email(
    to_email: str,
    user_name: str,
    raw_token: str,
) -> None:

    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="
        margin:0;
        padding:40px 20px;
        background-color:#f4f7f6;
        font-family:Arial,sans-serif;
    ">
        <div style="
            max-width:600px;
            margin:auto;
            background:white;
            padding:40px;
            border-radius:12px;
        ">
            <h2 style="color:#176b5d;">
                UrbanPulse - Password Reset
            </h2>

            <p>Hello <strong>{user_name}</strong>,</p>

            <p>
                We received a request to reset your UrbanPulse password.
            </p>

            <p>
                Click the button below to reset your password.
                This link will expire in <strong>15 minutes</strong>.
            </p>

            <div style="margin:30px 0;">
                <a href="{reset_url}"
                   style="
                       display:inline-block;
                       padding:12px 24px;
                       background-color:#176b5d;
                       color:white;
                       text-decoration:none;
                       border-radius:6px;
                   ">
                    Reset Password
                </a>
            </div>

            <p style="color:#666;font-size:14px;">
                If you did not request a password reset,
                you can safely ignore this email.
            </p>

            <p style="color:#999;font-size:12px;">
                UrbanPulse
            </p>
        </div>
    </body>
    </html>
    """

    send_email(
        to_email,
        "UrbanPulse - Password Reset Request",
        html_content,
    )


async def send_password_reset_success_email(
    to_email: str,
    user_name: str,
) -> None:

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="
        margin:0;
        padding:40px 20px;
        background-color:#f4f7f6;
        font-family:Arial,sans-serif;
    ">
        <div style="
            max-width:600px;
            margin:auto;
            background:white;
            padding:40px;
            border-radius:12px;
        ">
            <h2 style="color:#176b5d;">
                UrbanPulse - Password Reset Successful
            </h2>

            <p>Hello <strong>{user_name}</strong>,</p>

            <p>
                Your UrbanPulse password has been successfully reset.
            </p>

            <p>
                You can now log in using your new password.
            </p>

            <p style="color:#666;font-size:14px;">
                If you did not make this change, please contact
                UrbanPulse support immediately.
            </p>

            <p style="color:#999;font-size:12px;">
                UrbanPulse
            </p>
        </div>
    </body>
    </html>
    """

    send_email(
        to_email,
        "UrbanPulse - Password Reset Successful",
        html_content,
    )