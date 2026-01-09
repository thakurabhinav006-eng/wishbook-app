# Bug Fix Verification: Next Button Enabled with Empty Event Name (Bug #1829)

**Bug ID:** #1829  
**Description:** Next button enabled even when Custom Event Name is empty.  
**Status:** Resolved  
**Date:** 2026-01-09

## 1. Issue Description
Previously, the "Next Step" button remained enabled (visually interactive) even if the "Event Name" field was empty or contained only invalid characters. This allowed users to click and attempt to proceed, relying solely on toast error messages rather than proactive UI prevention.

## 2. Reproduction Steps
1. Navigate to **Create Wish** wizard.
2. Select contact and proceed to **Step 1: Event Details**.
3. Select **"Custom Event"**.
4. Leave **Event Name** empty (or enter only spaces).
   - *Expected:* "Next Step" button should be greyed out/disabled.
   - *Actual (Pre-fix):* "Next Step" button was white and clickable.

## 3. Fix Implementation
Modified `frontend/src/components/dashboard/CreateWishWizard.js`.

Implemented a dynamic `isNextDisabled()` function that checks the validity of current step's data in real-time. Toggled the button's `disabled` attribute and CSS opacity based on this check.

```javascript
// frontend/src/components/dashboard/CreateWishWizard.js

const isNextDisabled = () => {
    if (step === 1) {
        // Check for empty fields AND invalid alphanumeric content
        const hasValidContent = /[a-zA-Z0-9]/.test(formData.event_name);
        return !formData.event_type || !formData.event_name.trim() || !hasValidContent || !formData.scheduled_time;
    }
    // ...
};

// Button JSX
<button 
    disabled={isNextDisabled()}
    className={`... ${isNextDisabled() ? 'opacity-50 cursor-not-allowed' : '...'}`}
>
```

## 4. Verification Results
- [x] **Test 1:** Select "Custom Event", Name Empty. **Result:** Button is Dimmed (50% opacity) and unclickable.
- [x] **Test 2:** Type "!!!". **Result:** Button remains Dimmed (due to alphanumeric check from Bug #1828 logic integrated).
- [x] **Test 3:** Type "My Party". **Result:** Button becomes Active (White, hover effects enabled).

**Result:** The UI now correctly reflects the form state, preventing users from attempting to proceed with invalid data.
