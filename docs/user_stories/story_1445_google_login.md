# User Story #1445: Google Login Registration

**Status:** Completed
**Epic:** #1399 User Registration & Authentication

## Description
As a user, I want to register using Google login so that onboarding is faster.

## Acceptance Criteria
- [x] Google auth works; new user account created automatically.
- [x] Error shown on failure.

## Implementation Details
- **Frontend:** Added `GoogleLogin` button to `/signup` and `/login` pages using `@react-oauth/google`.
- **Backend:** Verified existing `/api/auth/google` endpoint logic.

## Verification
- **Automated Tests:** `backend/tests/test_google_auth.py` verified backend logic with mocks.
- **Manual Verification:** Added UI elements and connected flow.
