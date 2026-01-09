# Bug Fix Verification: Incorrect Event Time in Wish Gallery (Bug #1827)

**Bug ID:** #1827  
**Description:** Scheduled time shown in My Wish Gallery does not match the time selected during event creation.  
**Status:** Resolved  
**Date:** 2026-01-08

## 1. Issue Analysis
The discrepancy was caused by inconsistent timezone handling between the creation wizard and the gallery display.
- **Wizard:** Was attempting to manipulate the time offset manually.
- **Backend:** Stores naive datetime (stripped of 'Z').
- **Gallery:** Was parsing the naive datetime as **Local Time** instead of **UTC**, causing a shift equivalent to the user's timezone offset (e.g., +5.5 hours for IST).

## 2. Fix Implementation

### A. Frontend: CreateWishWizard.js
Simplified the date handling to use standard `toISOString()`. This ensures the time is accurately converted to UTC relative to the user's selection.

```javascript
// frontend/src/components/dashboard/CreateWishWizard.js
onChange={(date) => {
    // Standardize to UTC for storage
    handleChange('scheduled_time', date.toISOString());
}}
```

### B. Frontend: WishGallery.js
Updated the display logic to treat the stored naive string as UTC by appending 'Z' before parsing. This forces the browser to convert the UTC time back to the user's Local Time for display.

```javascript
// frontend/src/components/dashboard/WishGallery.js
new Date(wish.scheduled_time.endsWith('Z') ? wish.scheduled_time : wish.scheduled_time + 'Z').toLocaleString()
```

## 3. Verification Scenario (Example: IST, UTC+5:30)
1.  **User Selects:** Jan 8, 2026 - **02:22 PM** (14:22 IST).
2.  **Wizard Converts:** 14:22 IST -> **08:52 UTC** (`toISOString`).
3.  **Dashboard Sends:** `2026-01-08T08:52:00` (Strip 'Z').
4.  **Backend Stores:** `2026-01-08T08:52:00`.
5.  **Gallery Receives:** `2026-01-08T08:52:00`.
6.  **Gallery Processing:** Appends 'Z' -> `2026-01-08T08:52:00Z`.
7.  **Gallery Displays:** `toLocaleString()` converts 08:52 UTC -> **02:22 PM** IST.

**Result:** The displayed time now exactly matches the user's selected time.
