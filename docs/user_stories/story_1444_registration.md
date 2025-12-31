# User Story #1444: User Registration

**Status:** Completed
**Epic:** #1399 User Registration & Authentication

## Description
As a user, I want to register using email and password so that I can create an account.

## Acceptance Criteria
- [x] User can register with valid email/password.
- [x] Mandatory fields (email, password) are validated:
    - Email must be valid format.
    - Password must be at least 8 characters.
- [x] Duplicate email addresses are blocked.

## Implementation Details
- **Backend:** `POST /api/register`
    - Added Pydantic validators in `app/api/endpoints.py` for email regex and password length.
    - Returns 400 for duplicate emails.
    - Returns 422 for validation errors.
- **Frontend:** `/signup` page
    - Updated to display detailed API validation errors.

## Verification
- **Automated Tests:** `backend/tests/test_registration_flow.py` covers success, duplicate, and invalid input scenarios.
- **Manual Verification:** Verified locally via browser.
