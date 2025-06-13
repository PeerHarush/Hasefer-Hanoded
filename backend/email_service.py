import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To
import logging

class EmailService:
    def __init__(self):
        self.sg = SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))
        self.from_email = os.environ.get('FROM_EMAIL')
        self.site_url = os.environ.get('SITE_URL')

    def send_email(self, to_email, subject, content_html, content_text=None):
        """
        שולח מייל באמצעות SendGrid
        """
        try:
            from_email = Email(self.from_email)
            to_email = To(to_email)
            
            # אם לא נתן טקסט רגיל, נמיר את ה-HTML
            if not content_text:
                import re
                content_text = re.sub('<[^<]+?>', '', content_html)
            
            mail = Mail(
                from_email=from_email,
                to_emails=to_email,
                subject=subject,
                html_content=content_html,
                plain_text_content=content_text
            )

            response = self.sg.send(mail)
            logging.info(f"Email sent successfully to {to_email}. Status: {response.status_code}")
            return True

        except Exception as e:
            logging.error(f"Error sending email to {to_email}: {str(e)}")
            return False

    def send_welcome_notification(self, user_email, full_name):
        """
        התראה על הרשמה למערכת
        """
        subject = "🌟 ברוכים הבאים לקהילת הספרים שלנו!"
        
        content_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">🌟 ברוכים הבאים! 🌟</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-top: 0;">שלום {full_name}!</h2>
                
                <p style="font-size: 16px; line-height: 1.6; color: #555;">
                    ההרשמה שלך הושלמה בהצלחה! 🎉<br>
                    אתה חלק מקהילה מדהימה של אוהבי ספרים שמחלקים, מחליפים ומגלים ספרים חדשים יחד.
                </p>
                
                <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #667eea; margin-top: 0;">כדי להתחיל:</h3>
                    <ul style="color: #555; line-height: 1.8;">
                        <li>📚 הוסף ספרים למכירה או החלפה</li>
                        <li>🔍 חפש ספרים שמעניינים אותך</li>
                        <li>💬 התחבר עם משתמשים אחרים</li>
                        <li>⭐ כתב ביקורות וקבל נקודות</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{self.site_url}" 
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                              color: white; 
                              padding: 15px 30px; 
                              text-decoration: none; 
                              border-radius: 25px; 
                              font-size: 16px; 
                              font-weight: bold;
                              display: inline-block;
                              box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                        🚀 כנס לאתר עכשיו
                    </a>
                </div>
                
                <p style="color: #777; font-size: 14px; margin-bottom: 0;">
                    בואו נעשה יחד עולם יותר ירוק ומלא ידע! 📚💚
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    בברכה,<br>
                    צוות קהילת הספרים
                </p>
            </div>
        </div>
        """
        
        return self.send_email(user_email, subject, content_html)

    def send_message_notification(self, user_email, sender_name, book_title, chat_id):
        """
        התראה על הודעה חדשה
        """
        subject = f"💬 הודעה חדשה מ-{sender_name}"
        
        content_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <div style="background: #4CAF50; padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
                <h2 style="margin: 0;">💬 הודעה חדשה!</h2>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <p style="font-size: 16px; color: #333;">
                    <strong>{sender_name}</strong> שלח/ה לך הודעה על הספר:<br>
                    <strong style="color: #4CAF50;">"{book_title}"</strong>
                </p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <a href="{self.site_url}/chat/{chat_id}" 
                       style="background: #4CAF50; 
                              color: white; 
                              padding: 12px 25px; 
                              text-decoration: none; 
                              border-radius: 5px; 
                              display: inline-block;">
                        📖 צפה בהודעה
                    </a>
                </div>
            </div>
        </div>
        """
        
        return self.send_email(user_email, subject, content_html)

    def send_transaction_notification(self, user_email, book_title, seller_name, transaction_id, is_completed=True):
        """
        התראה על עסקה (הושלמה או ממתינה)
        """
        if is_completed:
            subject = f"✅ העסקה אושרה - {book_title}"
            status_text = "אושרה"
            color = "#4CAF50"
            icon = "✅"
            action_text = "צפה בפרטי העסקה"
        else:
            subject = f"⏳ עסקה חדשה ממתינה - {book_title}"
            status_text = "ממתינה לאישור"
            color = "#FF9800"
            icon = "⏳"
            action_text = "אשר את העסקה"
            
        content_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <div style="background: {color}; padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
                <h2 style="margin: 0;">{icon} עדכון עסקה</h2>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <p style="font-size: 16px; color: #333;">
                    העסקה עבור הספר <strong style="color: {color};">"{book_title}"</strong><br>
                    עם {seller_name} <strong>{status_text}</strong>
                </p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <a href="{self.site_url}/transaction" 
                       style="background: {color}; 
                              color: white; 
                              padding: 12px 25px; 
                              text-decoration: none; 
                              border-radius: 5px; 
                              display: inline-block;">
                        📋 {action_text}
                    </a>
                </div>
            </div>
        </div>
        """
        
        return self.send_email(user_email, subject, content_html)




