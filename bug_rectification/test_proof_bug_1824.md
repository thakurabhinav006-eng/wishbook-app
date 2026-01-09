# Bug Verification Report - Bug #1824: Manual Entry Validation

**Date:** 2026-01-09
**Bug ID:** #1824
**Title:** Validation is missing for Name and Email fields on Create Wish page
**Status:** Fixed

## Issue Description
In the `CreateWishWizard`, users were able to enter invalid data (numbers, symbols, or malformed emails) in the manual entry section of Step 0 and proceed to the next step without any errors being flagged.

**Epic:** #1599 Occasion & Event Management
**User Story:** #1651 Create birthday or anniversary event

## Fix Implementation
Added a robust validation layer to `Step 0` of the wizard and ensured backend consistency.

### 1. Frontend Validation (`CreateWishWizard.js`)
- **Name Validation**: Implemented a regex `/^[a-zA-Z\s]{2,50}$/` to ensure the recipient name contains only letters and spaces, with a minimum length of 2 characters.
- **Email Validation**: Implemented a strict email regex `/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/` for manual email entry.
- **Conditional Enforcement**: Validation is only triggered if no contacts are selected from the contact list, ensuring manual entry is valid.
- **Real-time Feedback**: Used the `showToast` system to notify users exactly which field is invalid (e.g., "Please enter a valid email address").

### 2. Backend Validation (`endpoints.py`)
- **Pydantic Validator**: Added a new `@validator` for `recipient_email` in the `ScheduleRequest` model. This ensures that even if a request bypasses the frontend, the backend will reject malformed email addresses with a `422 Unprocessable Entity` or custom error.

## Verification Steps

### Manual Verification (Wizard)
1.  **Invalid Name Test**:
    - Entered "12345" in Recipient Name.
    - Clicked "Next Step".
    - **Expected Result**: Navigation blocked. Toast: "Please enter a valid recipient name (letters only, min 2 chars)".
2.  **Invalid Email Test**:
    - Entered "Abhinav" as name and "test_email" as email.
    - Clicked "Next Step".
    - **Expected Result**: Navigation blocked. Toast: "Please enter a valid email address".
3.  **Positive Test**:
    - Entered "Abhinav Thakur" as name and "abhinav@example.com" as email.
    - Clicked "Next Step".
    - **Expected Result**: Smooth transition to Step 1.

## Conclusion
The issue is resolved. The manual entry section now maintains the same level of data integrity as the contact selection list, protecting the system from garbage data and improving user confidence.
