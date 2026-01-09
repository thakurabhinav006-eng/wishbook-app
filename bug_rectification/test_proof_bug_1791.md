# Bug Verification Report
**Date:** 2026-01-09
**Bug ID:** #1791
**Title:** Custom Occasion details are not saved while creating or updating contact
**Status:** Fixed

## Issue Description
When a user created or updated a contact with "Custom Occasion" fields (Name and Date), the changes appeared to be lost. The UI would show the fields as empty after saving.
**Epic:** #1598 Contact Management
**User Story:** #1647 Edit or delete contact

## Fix Implementation
The data was actually being saved to the database correctly, but the API response schema was incomplete, causing the frontend to receive incomplete data.

1.  **Backend Schema Update:**
    *   **File:** `backend/app/api/endpoints.py`
    *   **Class:** `ContactBase`
    *   **Change:** Added missing optional fields `custom_occasion_name`, `custom_occasion_date`, and `gender` to the Pydantic model.
    *   **Impact:** `ContactResponse` (which inherits from `ContactBase`) now includes these fields in the JSON response payload.

2.  **Database:**
    *   Verified that `contacts` table already had the necessary columns. No migration was needed.

## Verification Steps
**Automated Test:**
1.  **Script:** `tests/repro_bug_1791.py`
2.  **Action:**
    *   Authenticates as Admin.
    *   POST /contacts with `custom_occasion_name="Graduation Day"`.
    *   Verifies Create response contains "Graduation Day".
    *   GET /contacts/{id}.
    *   Verifies Fetch response contains "Graduation Day".
3.  **Result:**
    *   [PASS] Details matched in Creation Response.
    *   [PASS] DB Persistence confirmed.

**Manual Verification:**
1.  **UI Check:**
    *   Action: Create a contact "Test Occasion" with "Promotion" on "2026-06-15".
    *   Action: Save.
    *   Action: Open the contact details.
    *   Expected: "Promotion" and "2026-06-15" are visible.
    *   Actual: Fields are populated correctly.

## Conclusion
The issue is resolved by updating the API response schema.
