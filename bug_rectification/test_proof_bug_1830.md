# Bug Fix Verification: Empty Custom Event Submission (Bug #1830)

**Bug ID:** #1830  
**Description:** System creates event with empty Custom Event data.  
**Status:** Resolved  
**Date:** 2026-01-09

## 1. Issue Description
Users were able to bypass validation and create events with empty `Event Name` data, possibly through the "Schedule Now" shortcut or bypassing UI controls. This resulted in invalid records in the backend.

## 2. Reproduction Steps (Original Issue)
1. Navigate to **Create Wish**.
2. Select Contact.
3. Select **"Custom Event"** but leave **Event Name** blank.
4. (If Next button is forced or simplified path used) Click **Schedule Now** or **Submit**.
   - *Expected:* System should block the action with an error toast.
   - *Actual (Pre-fix):* System created a wish with empty event name.

## 3. Fix Implementation
Modified `frontend/src/components/dashboard/CreateWishWizard.js`.

1.  **Enforced Validation in `handleScheduleNow`**: Added explicit calls to `validateStep(0)` and `validateStep(1)` before processing the instant schedule request. This ensures that even if the UI button is enabled (e.g., due to state lag), the function logic performs a hard stop if data is invalid.
2.  **Validation in logic**: `validateStep(1)` includes the regex check for alphanumeric content (Bug #1828) and empty checks.

```javascript
// frontend/src/components/dashboard/CreateWishWizard.js
const handleScheduleNow = () => {
    // Enforce validation before instant scheduling
    if (!validateStep(0) || !validateStep(1)) {
        return;
    }
    // ...
```

## 4. Verification Results
- [x] **Test 1:** Custom Event selected, Name empty. Clicked "Schedule Now". **Result:** Red Toast Error "Please enter an event name". No API call made.
- [x] **Test 2:** Custom Event selected, Name "!!!". Clicked "Schedule Now". **Result:** Red Toast Error "Event name must contain at least one letter...".
- [x] **Test 3:** Complete Data. Clicked "Schedule Now". **Result:** Success.

**Result:** The system effectively prevents the creation of invalid/empty custom events at the logic level.
