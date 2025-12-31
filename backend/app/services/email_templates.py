
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
import os

# Base directory for assets (assuming running from backend root)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")

def get_email_template(recipient_name: str, wish_text: str, occasion: str = "general"):
    # Map occasions to local asset filenames
    templates = {
        "birthday": {
            "image_file": "birthday_card_header.png",
            "color": "#7c3aed",
            "bg_color": "#f3e8ff",
            "title": "Happy Birthday!"
        },
        "anniversary": {
            "image_file": "anniversary_card_header.png",
            "color": "#db2777",
            "bg_color": "#fce7f3",
            "title": "Happy Anniversary!"
        },
        "job": {
            "image_file": "job_card_header.png",
            "color": "#2563eb",
            "bg_color": "#dbeafe",
            "title": "Congratulations on the New Job!"
        },
        "promotion": {
            "image_file": "job_card_header.png", # Reusing job card
            "color": "#059669",
            "bg_color": "#d1fae5",
            "title": "Well Done on the Promotion!"
        },
        "graduation": {
            "image_file": "graduation_card_header.png",
            "color": "#d97706",
            "bg_color": "#fef3c7",
            "title": "Happy Graduation!"
        },
        "thankyou": {
            "image_file": "thank_you_card_header.png",
            "color": "#0d9488",
            "bg_color": "#ccfbf1",
            "title": "Thank You!"
        },
        "wedding": {
             "image_file": "wedding_card_header.png",
             "color": "#ec4899",
             "bg_color": "#fbcfe8",
             "title": "Wedding Wishes"
        },
        "farewell": {
            "image_file": "farewell_card_header.png",
            "color": "#4b5563",
            "bg_color": "#f3f4f6",
            "title": "Best of Luck!"
        },
        "newbaby": {
            "image_file": "new_baby_card_header.png", 
            "color": "#8b5cf6",
            "bg_color": "#ede9fe",
            "title": "Welcome Little One!"
        },
        "getwell": {
            "image_file": "get_well_card_header.png", 
            "color": "#16a34a",
            "bg_color": "#dcfce7",
            "title": "Get Well Soon"
        },
        "christmas": {
            "image_file": "christmas_card_header.png",
            "color": "#b91c1c", # Deep Red
            "bg_color": "#fef2f2",
            "title": "Merry Christmas!"
        },
        "newyear": {
            "image_file": "new_year_card_header.png",
            "color": "#1e293b", # Dark Blue/Black
            "bg_color": "#f8fafc",
            "title": "Happy New Year!"
        },
        "default": {
            "image_file": "achievement_card_header.png", # Generic success/celebration
            "color": "#6d28d9",
            "bg_color": "#f3f4f6",
            "title": "Warm Wishes"
        }
    }
    
    # Normalize occasion key
    key = occasion.lower()
    if "birth" in key: key = "birthday"
    elif "anniv" in key: key = "anniversary"
    elif "job" in key or "work" in key: key = "job"
    elif "promot" in key: key = "promotion"
    elif "gradu" in key: key = "graduation"
    elif "thank" in key: key = "thankyou"
    elif "wedd" in key or "marr" in key: key = "wedding"
    elif "bye" in key or "farewell" in key or "leav" in key: key = "farewell"
    elif "baby" in key: key = "newbaby"
    elif "well" in key: key = "getwell"
    elif "chris" in key or "xmas" in key: key = "christmas"
    elif "year" in key: key = "newyear"
    else: key = "default"

    template = templates.get(key, templates["default"])
    
    # Verify file exists
    image_path = os.path.join(ASSETS_DIR, template['image_file'])
    if not os.path.exists(image_path):
        # Double check basic fallbacks
        image_path = os.path.join(ASSETS_DIR, "birthday_card_header.png")

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{template['title']}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Lato:wght@300;400;700&display=swap');
            
            body {{
                font-family: 'Lato', Helvetica, Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: {template['bg_color']};
                color: #1f2937;
            }}
            .card-container {{
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                border: 1px solid rgba(0,0,0,0.05);
            }}
            .header-img-container {{
                width: 100%;
                overflow: hidden;
            }}
            .header-img {{
                width: 100%;
                height: auto;
                display: block;
                object-fit: cover;
            }}
            .content {{
                padding: 48px 40px;
                text-align: center;
                background: linear-gradient(to bottom, #ffffff 0%, {template['bg_color']}50 100%);
            }}
            .title {{
                font-family: 'Playfair Display', serif;
                color: {template['color']};
                font-size: 36px;
                font-weight: 700;
                margin-bottom: 24px;
                letter-spacing: -0.025em;
                line-height: 1.1;
            }}
            .recipient {{
                font-size: 18px;
                color: #4b5563;
                margin-bottom: 24px;
                font-weight: 300;
            }}
            .wish-body {{
                font-family: 'Playfair Display', serif;
                font-size: 22px;
                color: #1f2937;
                font-style: italic;
                line-height: 1.6;
                margin-bottom: 32px;
                padding: 0 20px;
            }}
            .divider {{
                width: 60px;
                height: 4px;
                background-color: {template['color']};
                margin: 0 auto 32px auto;
                border-radius: 2px;
                opacity: 0.3;
            }}
            .footer {{
                margin-top: 40px;
                font-size: 11px;
                color: #9ca3af;
                text-transform: uppercase;
                letter-spacing: 0.1em;
            }}
        </style>
    </head>
    <body>
        <div class="card-container">
            <!-- CID (Content-ID) referencing the attached image -->
            <div class="header-img-container">
                <img src="cid:header_image" alt="Header" class="header-img"/>
            </div>
            <div class="content">
                <div class="title">{template['title']}</div>
                <div class="divider"></div>
                <div class="recipient">Dearest {recipient_name},</div>
                <div class="wish-body">"{wish_text}"</div>
                <div class="footer">
                    Sent with love via Wishes AI
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    return html_content, template['title'], image_path


def create_email_message(to_email: str, occasion: str, recipient_name: str, wish_text: str, sender_email: str):
    html_content, subject, image_path = get_email_template(recipient_name, wish_text, occasion)
    
    msg = MIMEMultipart('related') 
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = to_email
    
    msg_alternative = MIMEMultipart('alternative')
    msg.attach(msg_alternative)
    
    msg_alternative.attach(MIMEText(wish_text, 'plain'))
    msg_alternative.attach(MIMEText(html_content, 'html'))
    
    try:
        with open(image_path, 'rb') as f:
            img_data = f.read()
            img = MIMEImage(img_data)
            img.add_header('Content-ID', '<header_image>') 
            msg.attach(img)
    except Exception as e:
        print(f"Failed to attach image from {image_path}: {e}")
        
    return msg
