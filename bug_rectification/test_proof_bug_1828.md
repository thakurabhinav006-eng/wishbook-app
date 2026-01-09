# Bug Fix Verification: Invalid Custom Event Name (Bug #1828)

**Bug ID:** #1828  
**Description:** System allows special characters-only value in Custom Event Name.  
**Status:** Resolved  
**Date:** 2026-01-09

## 1. Issue Description
Users were able to proceed to the next step of the wizard even if the "Event Name" field contained only special characters (e.g., "@#$%^"), which resulted in invalid or meaningless event identifiers.

## 2. Reproduction Steps
1. Navigate to **Create Wish** wizard.
2. Select a contact and proceed to **Step 1: Event Details**.
3. Select **"Custom Event"**.
4. In the **Event Name** field, enter only special characters (e.g., `!!!`, `@@@`, `#$#`).
5. Select a valid date.
6. Click **Next Step**.
   - *Expected:* System should block progress and show an error.
   - *Actual (Pre-fix):* System allowed progress to Step 2.

## 3. Fix Implementation
Modified `frontend/src/components/dashboard/CreateWishWizard.js` to include a validation check.

Added a regex test `/[a-zA-Z0-9]/` to ensure the event name contains at least one alphanumeric character.

```javascript
// frontend/src/components/dashboard/CreateWishWizard.js

// Validation: Must contain at least one alphanumeric char
if (!/[a-zA-Z0-9]/.test(currentFormData.event_name)) {
    showToast("Event name must contain at least one letter or number", "error");
    return;
}
```

## 4. Verification Results
- [x] **Test 1:** Entered `!@#$%`. Clicked Next. **Result:** Error displayed "Event name must contain at least one letter or number". Progress blocked.
- [x] **Test 2:** Entered `Birthday #1`. Clicked Next. **Result:** Success (contains letters/numbers).
- [x] **Test 3:** Entered `Event 2026`. Clicked Next. **Result:** Success.

**Result:** The system now strictly enforces meaningful event names, preventing "special characters only" inputs.
