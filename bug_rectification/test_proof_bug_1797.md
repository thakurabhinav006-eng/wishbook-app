# Bug Verification Report - Bug #1797: Duplicate contact details can be updated

**Date:** 2026-01-09
**Bug ID:** #1797
**Title:** Duplicate contact details can be updated
**Status:** Fixed

## Issue Description
Users reported that they could update a contact's details (Name + Phone or Name + Email) to match another existing contact for the same user. This lead to data inconsistency and duplicates in the system that bypassed initial creation checks.

**Epic:** #1598 Contact Management
**User Story:** #1647 Edit or delete contact

## Fix Implementation
The `update_contact` endpoint in `endpoints.py` was updated to include duplicate collision checks before committing changes.

### Changes:
- **`endpoints.py` (Backend)**:
    - Added logic to query the database for existing contacts with the same Name + Phone or Name + Email.
    - Ensured the check **excludes** the contact currently being updated (using `models.Contact.id != contact_id`) to allow self-updates (e.g., changing relationship or notes without changing name/phone).
    - If a collision is detected with a *different* contact, an `HTTPException(status_code=400, ...)` is raised.

## Verification Steps

### Automated Test:
- **Script**: `tests/repro_bug_1797.py`
- **Results**:
    - [PASS] Rejected update of 'Contact Two' to match 'Contact One''s Name + Phone (400 Bad Request).
    - [PASS] Rejected update of 'Contact Two' to match 'Contact One''s Name + Email (400 Bad Request).
    - [PASS] Allowed update of 'Contact Two''s own Relationship field (200 OK).

### Manual Verification:
1.  Identified two contacts: "John Doe" (+123) and "Jane Smith" (+456).
2.  Edited "Jane Smith".
3.  Changed Name to "John Doe" and Phone to "+123".
4.  Clicked "Save Contact".
5.  **Result**: Save blocked. Error message displayed: *"Another contact with name 'John Doe' and phone '+123' already exists."*

## Conclusion
The issue is resolved. Duplicate prevention is now consistently enforced during both creation and updates.
