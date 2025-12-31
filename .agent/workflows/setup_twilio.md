---
description: How to set up Twilio for WhatsApp and get API Credentials
---

# Setup Twilio for WhatsApp

1.  **Sign Up**: Go to [Twilio Console](https://console.twilio.com/) and sign up for a free account.
2.  **Get Credentials**:
    *   On the main **Dashboard**, scroll down to "Account Info".
    *   Copy your **Account SID** and **Auth Token**.
3.  **Activate WhatsApp Sandbox** (Required for testing without business approval):
    *   Go to **Messaging** > **Try it out** > **Send a WhatsApp message**.
    *   Follow instructions to join the sandbox (usually sending a code like `join something-something` to a provided number).
    *   **Note**: You can only send messages to numbers that have joined your sandbox.
4.  **Credentials Needed for .env**:
    *   `TWILIO_ACCOUNT_SID`: Your Account SID.
    *   `TWILIO_AUTH_TOKEN`: Your Auth Token.
    *   `TWILIO_FROM_WHATSPP`: The sandbox number (e.g., `whatsapp:+14155238886`).
