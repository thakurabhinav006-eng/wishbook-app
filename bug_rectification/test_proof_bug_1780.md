# Bug Verification Report
**Date:** 2026-01-09
**Bug ID:** #1780
**Title:** Mobile Number Validation Missing
**Status:** Fixed

## Issue Description
Users were able to blindly enter any character into the "Mobile Number" field during sign-up, including alphabets and special characters. There was no length validation.
**Epic:** #1597 User Registration & Authentication
**User Story:** #1641 User signup with email & password

## Fix Implementation
1.  **Restricted Input (onChange):**
    *   Modified `app/signup/page.js` to strictly allow only digits (0-9) and the plus (+) symbol. Any other character keystroke is ignored.
    *   Applied the same logic to `components/dashboard/ProfilePage.js` for consistency.

2.  **Length Validation (onSubmit):**
    *   Modified `app/signup/page.js` to check if the mobile number (if provided) is between 10 and 15 digits. If not, an error: "Mobile number must be between 10 and 15 digits" is displayed, and form submission is blocked.
    *   Applied the same validation logic to `components/dashboard/ProfilePage.js`.

## Verification Steps
**Manual Verification:**
1.  **Scenario 1: Typing Alphabets**
    *   Action: Go to Sign Up page. Focus on "Mobile Number". Type "abc".
    *   Expected: Input remains empty.
    *   Actual: Input ignores "abc".
    
2.  **Scenario 2: Typing Special Characters**
    *   Action: Type "@#$".
    *   Expected: Input remains empty.
    *   Actual: Input ignores "@#$". (Type "+" works).

3.  **Scenario 3: Short Number Submission**
    *   Action: Type "12345" and submit.
    *   Expected: Error banner "Mobile number must be between 10 and 15 digits".
    *   Actual: Validated correctly.

## Conclusion
The mobile field now strictly enforces numeric input and validates length, resolving the reported issue.
