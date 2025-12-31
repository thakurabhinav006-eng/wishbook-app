# Test Proof: Dashboard Usage Summary (#1657)

**Date**: 2025-12-30
**Execution Environment**: Local Development (Mac OS)
**Test File**: `backend/tests/test_usage_summary_story.py`

## User Story Details
**Description**: Display usage summary (Stats).
**Acceptance Criteria Verified**:
1.  Shows: Total Contacts.
2.  Shows: Upcoming Events (Pending Wishes).
3.  Shows: Messages Scheduled.
4.  Shows: Messages Sent.

## Execution Log
```
platform darwin -- Python 3.9.20, pytest-8.4.2, pluggy-1.5.0
rootdir: /Users/trickshot/Desktop/AI_based_tools/Wishing_tool/backend
plugins: anyio-4.9.0, typeguard-2.13.3, langsmith-0.3.42
collected 5 items                                       

tests/test_usage_summary_story.py .....           [100%]

=================== 5 passed, 8 warnings in 3.49s ===================
```

## Test Cases Covered
1.  **`test_stats_initial_zero`**: Verified new user has 0 stats across all metrics.
2.  **`test_stats_with_data`**: Verified accurate counts after adding contacts and scheduled wishes.
3.  **`test_stats_status_change`**: Verified counts shift correctly when status moves from 'pending' to 'sent' (Scheduled -> Sent).
4.  **`test_stats_isolation`**: Verified users only see their own data.
5.  **`test_stats_increments`**: Verified numbers increment in real-time as data is added.
