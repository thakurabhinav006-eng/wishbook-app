# Bug Verification Report - Bug #1817: Mandatory Field Validation in Create Wish Wizard

**Date:** 2026-01-09
**Bug ID:** #1817
**Title:** User can proceed to "Ready to Schedule" without selecting mandatory Wish Details
**Status:** Fixed

## Issue Description
Users were able to navigate through the `CreateWishWizard` and reach the final scheduling step even if mandatory fields like **Event Type**, **Event Name**, and **Event Date** were left empty. This led to incomplete or invalid data being sent to the backend.

**Epic:** #1599 Occasion & Event Management
**User Story:** #1651 Create birthday or anniversary event

## Fix Implementation
A comprehensive client-side validation layer was added to the `CreateWishWizard` component to ensure all required fields are populated before allowing transitions between steps.

### Changes:
- **`validateStep` Function**: Implemented a new validation function that checks specific fields based on the current step:
  - **Step 0 (Who)**: Ensures at least one contact is selected or a manual recipient name is entered.
  - **Step 1 (Event)**: Validates that `event_type`, `event_name`, and `scheduled_time` (date) are provided.
  - **Step 2 (Message)**: Ensures the AI-generated wish exists before proceeding to the final preview.
- **`handleNext` & `handleGeneratePreview` Guards**: Modified navigation handlers to call `validateStep` before progressing. Navigation is blocked if validation fails.
- **Toast Notifications**: Integrated the `Toast` system into the wizard. Users now receive immediate, localized feedback (e.g., "Please select an event date") via a premium toast notification when a mandatory field is missing.
- **Visual Feedback**: Buttons for "Next Step" and "Generate Preview" now intelligently wait for validation, preventing the user from accidentally reaching the final "Confirm Schedule" button with empty data.

## Verification Steps

### Manual Verification
1.  **Step 0 Validation**:
    - Left the contact selection empty and did not enter a name.
    - Clicked "Next Step".
    - **Expected Result**: Navigation blocked. A toast appeared: "Please select a contact or enter a recipient name".
2.  **Step 1 Validation (Mandatory Fields)**:
    - Selected "Custom Event" but left the event name empty.
    - Clicked "Next Step".
    - **Expected Result**: Navigation blocked. Toast: "Please enter an event name".
    - Filled the name but cleared the date.
    - **Expected Result**: Navigation blocked. Toast: "Please select an event date".
3.  **Step 2 Validation**:
    - Reached the "Message" step but did not click "Generate Preview".
    - Tried to bypass the preview.
    - **Expected Result**: The user cannot reach the final "Schedule" step without first generating a valid preview (which populates the `generated_wish` field).
4.  **Flow Verification**:
    - Filled all mandatory fields correctly.
    - **Expected Result**: Smooth navigation to the final "Preview" step with all data intact.

## Conclusion
The issue is resolved. The `CreateWishWizard` now strictly enforces mandatory field selection at every stage, significantly improving data integrity and user experience.
