# Bug Verification Report
**Date:** 2026-01-09
**Bug ID:** #1786
**Title:** Relationship dropdown UI visibility issue
**Status:** Fixed

## Issue Description
Dropdown options in the "Add New Contact" modal and "Profile Settings" were appearing with white text on a white (or default) background, making them unreadable in the dark-themed application.
**Epic:** #1598 Contact Management
**User Story:** #1646 Add new contact

## Fix Implementation
Aligned the UI of `<select>` options with the application's dark mode theme.
1.  **Code Changes:**
    *   **File:** `frontend/src/components/ContactFormModal.jsx`
    *   **File:** `frontend/src/components/dashboard/ProfilePage.js`
    *   **Change:** Added `className="bg-[#181820] text-white"` to appropriate `<option>` elements within the dropdowns.
    *   **Affected Dropdowns:** "Relationship", "Gender" (Contacts), "Timezone", "Upgrade Plan", "Payment Method" (Profile).

2.  **Logic:**
    *   By explicitly setting the background color of the `<option>` elements, we override the browser's default behavior (which often renders white backgrounds), ensuring the white text is readable against a dark background.

## Verification Steps
**Manual Verification:**
1.  **Add Contact Modal:**
    *   Action: Open "Add Contact" modal. Click "Relationship" dropdown.
    *   Expected: Options (Friend, Family, etc.) are visible with white text on dark background.
    *   Actual: Options are clearly visible.

2.  **Profile Page:**
    *   Action: Go to Profile. Select "Personal Info" tab. Click "Timezone" dropdown.
    *   Action: Select "Subscription" tab. Click "Upgrade To Plan" dropdown.
    *   Expected: Options are readable (White on Dark).
    *   Actual: Options are readable.

## Conclusion
The visibility issue is resolved by enforcing dark background styling on dropdown options.
