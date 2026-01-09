# Bug Fix Verification: Event Name Reset on Custom Event (Bug #1826)

**Bug ID:** #1826  
**Description:** Event Name field is not reset when Event Type is changed to Custom Event.  
**Status:** Resolved  
**Date:** 2026-01-08

## 1. Issue Description
When a user selects an event type (e.g., "Birthday"), the "Event Name" field is auto-populated (e.g., to "Birthday"). However, if the user subsequently switched the Event Type to "Custom Event", the previously auto-populated value remained in the "Event Name" field instead of clearing out to allow for manual entry.

## 2. Reproduction Steps
1. Navigate to the **Create Wish** wizard.
2. Proceed to **Step 1: Event Details**.
3. Click on **"Birthday"** (or Anniversary/Festival).
   - *Observation:* Event Name auto-fills with "Birthday".
4. Click on **"Custom Event"**.
   - *Expected:* Event Name should clear or reset to empty.
   - *Actual (Pre-fix):* Event Name remained as "Birthday".

## 3. Fix Implementation
Modified `frontend/src/components/dashboard/CreateWishWizard.js`.

Updated the `onClick` handler for the Event Type buttons to explicitly check if the selected type is `'Custom Event'`.
- If **Custom Event**: Set `event_name` to `''` (empty string).
- If **Other**: Set `event_name` to the selected type (e.g., 'Birthday').

```javascript
// frontend/src/components/dashboard/CreateWishWizard.js

onClick={() => {
    handleChange('event_type', type);
    // Auto-fill name logic
    if (type !== 'Custom Event') {
        handleChange('event_name', type);
    } else {
        handleChange('event_name', ''); // Reset for custom entry
    }
    handleChange('occasion', type); // Sync occasion
}}
```

## 4. Verification Results
- [x] **Step 1:** Selected "Birthday". Verified `event_name` became "Birthday".
- [x] **Step 2:** Switched to "Custom Event". Verified `event_name` cleared to `""`.
- [x] **Step 3:** Switched back to "Festival". Verified `event_name` became "Festival".
- [x] **Step 4:** Manually typed a name in Custom Event. It persisted correctly until type change.

**Result:** The Event Name field now correctly resets when "Custom Event" is selected, improving the user experience and preventing incorrect event labeling.
