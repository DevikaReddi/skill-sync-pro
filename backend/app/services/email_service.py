"""Email notification service."""
from typing import List, Optional, Dict, Any
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr, BaseModel
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "skillsyncpro@example.com"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", ""),
    MAIL_FROM=os.getenv("MAIL_FROM", "SkillSync Pro <noreply@skillsyncpro.com>"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME", "SkillSync Pro"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

class EmailService:
    """Service for sending email notifications."""
    
    def __init__(self):
        self.fm = FastMail(conf) if conf.MAIL_PASSWORD else None
    
    async def send_email(
        self,
        email: str,
        subject: str,
        body: str,
        template_name: Optional[str] = None
    ) -> bool:
        """Send an email."""
        if not self.fm:
            logger.warning("Email service not configured")
            return False
        
        try:
            message = MessageSchema(
                subject=subject,
                recipients=[email],
                body=body,
                subtype=MessageType.html
            )
            
            await self.fm.send_message(message)
            logger.info(f"Email sent to {email}: {subject}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False
    
    async def send_welcome_email(self, email: str, username: str) -> bool:
        """Send welcome email to new user."""
        subject = "Welcome to SkillSync Pro!"
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #4F46E5;">Welcome to SkillSync Pro, {username}!</h2>
                    
                    <p>Thank you for joining SkillSync Pro. We're excited to help you optimize your resume and land your dream job!</p>
                    
                    <h3>Here's what you can do:</h3>
                    <ul>
                        <li>📄 Analyze your resume against job descriptions</li>
                        <li>📊 Get AI-powered insights and recommendations</li>
                        <li>📈 Track your progress over time</li>
                        <li>🎯 Optimize your resume for ATS systems</li>
                    </ul>
                    
                    <p style="margin-top: 30px;">
                        <a href="https://skillsyncpro.com/dashboard" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                            Get Started
                        </a>
                    </p>
                    
                    <p style="margin-top: 30px; font-size: 12px; color: #666;">
                        If you have any questions, feel free to reach out to our support team.
                    </p>
                </div>
            </body>
        </html>
        """
        
        return await self.send_email(email, subject, body)
    
    async def send_analysis_complete_email(
        self,
        email: str,
        username: str,
        match_percentage: float,
        top_skills: List[str]
    ) -> bool:
        """Send email when analysis is complete."""
        subject = f"Your Resume Analysis is Ready - {match_percentage:.1f}% Match"
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #4F46E5;">Analysis Complete!</h2>
                    
                    <p>Hi {username},</p>
                    
                    <p>Your resume analysis is complete. Here's a quick summary:</p>
                    
                    <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Match Score: {match_percentage:.1f}%</h3>
                        
                        <h4>Top Matching Skills:</h4>
                        <ul>
                            {''.join(f'<li>{skill}</li>' for skill in top_skills[:5])}
                        </ul>
                    </div>
                    
                    <p>
                        <a href="https://skillsyncpro.com/analysis" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                            View Full Analysis
                        </a>
                    </p>
                    
                    <p style="margin-top: 30px; font-size: 12px; color: #666;">
                        This is an automated notification. Please do not reply to this email.
                    </p>
                </div>
            </body>
        </html>
        """
        
        return await self.send_email(email, subject, body)
    
    async def send_weekly_summary(
        self,
        email: str,
        username: str,
        stats: Dict[str, Any]
    ) -> bool:
        """Send weekly summary email."""
        subject = "Your Weekly SkillSync Pro Summary"
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #4F46E5;">Weekly Summary</h2>
                    
                    <p>Hi {username},</p>
                    
                    <p>Here's your activity summary for the past week:</p>
                    
                    <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h4>📊 This Week's Stats:</h4>
                        <ul>
                            <li>Analyses performed: {stats.get('analyses_count', 0)}</li>
                            <li>Average match score: {stats.get('avg_match', 0):.1f}%</li>
                            <li>Best match: {stats.get('best_match', 0):.1f}%</li>
                            <li>Skills improved: {stats.get('skills_improved', 0)}</li>
                        </ul>
                    </div>
                    
                    <p>Keep up the great work!</p>
                    
                    <p style="margin-top: 30px; font-size: 12px; color: #666;">
                        You can manage your email preferences in your account settings.
                    </p>
                </div>
            </body>
        </html>
        """
        
        return await self.send_email(email, subject, body)

# Global email service instance
email_service = EmailService()
