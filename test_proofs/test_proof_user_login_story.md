# Test Proof: User Login Story

**Date**: 2025-12-30
**Execution Environment**: Local Development (Mac OS)
**Test File**: `backend/tests/test_user_login_story.py`

## User Story Details
**Description**: User login with email & password.
**Acceptance Criteria Verified**:
1.  Valid credentials grant access token.
2.  Invalid password returns error.
3.  Unregistered email returns error.
4.  Mandatory fields check (username/password).

## Execution Log
```
platform darwin -- Python 3.9.20, pytest-8.4.2, pluggy-1.5.0
rootdir: /Users/trickshot/Desktop/AI_based_tools/Wishing_tool/backend
plugins: anyio-4.9.0, typeguard-2.13.3, langsmith-0.3.42
collected 5 items                                       

tests/test_user_login_story.py .....              [100%]

=================== 5 passed, 8 warnings in 1.64s ===================
```

## Test Cases Covered
1.  **`test_login_success`**: Authenticates valid user (HTTP 200 + Token).
2.  **`test_login_unregistered_email`**: Fails for non-existent user (HTTP 401).
3.  **`test_login_invalid_password`**: Fails for wrong password (HTTP 401).
4.  **`test_login_missing_username`**: Fails validation (HTTP 422).
5.  **`test_login_missing_password`**: Fails validation (HTTP 422).
