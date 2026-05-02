# Security Specification for Student Result Management

## Data Invariants
1. A `StudentResult` must have a valid non-empty `id`, `studentName`, `studentClass`, and `rollNo`.
2. `updatedAt` must be a valid server timestamp or string representation of a valid date.
3. Access is restricted to authenticated users.

## The Dirty Dozen Payloads
1. **Identity Spoofing**: Attempt to create a result with an ID that matches an existing record but under a different user's name.
2. **State Shortcutting**: Attempt to skip mandatory fields during creation.
3. **Resource Poisoning**: Inject 1MB of junk text into the `studentName` field.
4. **Invalid Type**: Send a boolean instead of a string for `rollNo`.
5. **Unauthorized Delete**: Anonymous user attempting to delete a record.
6. **Bypassing Validation**: Sending a result with no `selectedSubjects` but with `subjectMarks`.
7. **Orphaned Writes**: Writing to a subcollection (if any) without the parent.
8. **Malicious ID**: Using a path traversal string as a document ID.
9. **Email Spoofing**: Attempting to act as an admin using a spoofed email (if email auth was used).
10. **Timestamp Tampering**: Sending a future date for `updatedAt`.
11. **Shadow Update**: Adding a field `isVerified: true` that doesn't exist in the schema.
12. **Blanket Read**: Querying for all records without being signed in.

## Test Runner
The following tests verify these constraints in `firestore.rules.test.ts`.
