# Test Proof: Forgot Password Story (#1645)

**Date**: 2025-12-30
**Execution Environment**: Local Development (Mac OS)
**Test File**: `backend/tests/test_forgot_password_story.py`

## User Story Details
**Description**: Reset password via email link.
**Acceptance Criteria Verified**:
1.  Forgot password link works (API request).
2.  Reset email sent (mocked).
3.  Link expiration (token validation).
4.  Successful password reset and subsequent login.

## Execution Log
```
platform darwin -- Python 3.9.20, pytest-8.4.2, pluggy-1.5.0
rootdir: /Users/trickshot/Desktop/AI_based_tools/Wishing_tool/backend
plugins: anyio-4.9.0, typeguard-2.13.3, langsmith-0.3.42
collected 5 items                                       

tests/test_forgot_password_story.py .....        [100%]

=================== 5 passed, 8 warnings in 12.29s ==================
```


## UI Verification
![Forgot Password Link](/Users/trickshot/.gemini/antigravity/brain/5f1a8b9c-b937-411c-9b57-97c0623be1fd/forgot_password_link_1767551872400.png)

## Test Cases Covered

1.  **`test_request_reset_success`**: Generates token & sends email (HTTP 200).
2.  **`test_request_reset_unregistered`**: returns success security message (HTTP 200).
3.  **`test_reset_password_success`**: Validates token & updates password (HTTP 200).
4.  **`test_reset_password_invalid_token`**: Rejects bad token (HTTP 400).
5.  **`test_login_old_password_fail`**: Ensures old password revoked after reset.
