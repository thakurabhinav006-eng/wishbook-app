# Test Proof: Bug #1781 Fix

**Date:** 2026-01-06
**Pass/Fail:** PASS
**Bug ID:** #1781
**Epic:** User Registration & Authentication
**Description:** T&C validation missing and link broken.

## Test Environment
- **Frontend:** Next.js (Port 3000)

## Test Case 1: T&C Validation

### Description
Verify that the form cannot be submitted if the "Terms & Conditions" checkbox is unchecked.

### Steps
1. The user navigated to `/signup`.
2. Fill all fields (Name, Email, Passwords).
3. **Do NOT check** "Terms & Conditions".
4. Click "Get Started".

### Expected Result
Error message "You must accept the Terms & Conditions" should appear. Form should not submit.

### Actual Result
Error message appeared as expected.

### Evidence
![Validation Error](file:///Users/trickshot/.gemini/antigravity/brain/958079a2-9ace-402d-bba1-b63cb7fb0172/1_tnc_validation_error_1767697082413.png)

---

## Test Case 2: T&C Link Navigation

### Description
Verify that the "Terms & Conditions" link is clickable and navigates to the correct URL.

### Steps
1. The user navigated to `/signup`.
2. Click the "Terms & Conditions" link.

### Expected Result
Browser should navigate to `/terms`. (Note: page may be 404, but URL must be correct).

### Actual Result
The user navigated to `http://localhost:3000/terms`. (Returned 404 as page is not yet implemented, but link behavior is fixed).

### Evidence
![Link Navigation](file:///Users/trickshot/.gemini/antigravity/brain/958079a2-9ace-402d-bba1-b63cb7fb0172/2_tnc_link_clicked_1767696784188.png)
