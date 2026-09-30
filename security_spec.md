# Security Specification: Budgeting Firestore

## 1. Data Invariants
1. **User Identity Boundary**: Every document under `/users/{userId}` and its subcollections (`/users/{userId}/transactions/*`, `/users/{userId}/savingBoxes/*`) belongs strictly to the user where `request.auth.uid == userId`.
2. **Strict Verification**: All modifications require an authenticated user with verified credentials (`request.auth.uid != null`).
3. **Immutability of Key Fields**:
   - `userId` on the user profile, transactions, and saving boxes cannot be modified or forged.
   - `id` on transactions and saving boxes cannot be modified.
   - `createdAt` is immutable once set.
4. **Relational Isolation**: A user cannot read, query, list, modify or delete transactions or saving boxes belonging to any other user.
5. **No Blind Updates**: Updates must only modify permitted fields and must adhere to length and type limits.

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Unauthenticated Read on User Document**:
   Attempting `get(/users/user_123)` without `request.auth`.
   Expectation: `PERMISSION_DENIED`.

2. **Cross-User Profile Hijack**:
   `request.auth.uid = 'attacker_456'`, attempting `update(/users/victim_123)` setting `{ name: 'Pwned' }`.
   Expectation: `PERMISSION_DENIED`.

3. **User Document Spoofing on Create**:
   `request.auth.uid = 'user_789'`, attempting `create(/users/user_789)` with `{ userId: 'admin_001', email: 'admin@google.com' }`.
   Expectation: `PERMISSION_DENIED` (`incoming().userId != request.auth.uid`).

4. **Cross-User Transaction Infiltration**:
   `request.auth.uid = 'attacker_456'`, attempting `create(/users/victim_123/transactions/tx_1)` with `{ amount: 999999 }`.
   Expectation: `PERMISSION_DENIED`.

5. **Cross-User Transaction Reading / Querying**:
   `request.auth.uid = 'attacker_456'`, attempting `get(/users/victim_123/transactions/tx_1)`.
   Expectation: `PERMISSION_DENIED`.

6. **Transaction ID Path Injection**:
   Document ID containing special characters or oversized strings: `tx_evil/../../../root`.
   Expectation: `PERMISSION_DENIED` (`isValidId(transactionId)` check fails).

7. **Negative or Non-numeric Transaction Amount**:
   Payload: `{ amount: -500, type: 'income', description: 'Fraud' }`.
   Expectation: `PERMISSION_DENIED`.

8. **Shadow Field Injection in Transaction**:
   Payload containing unauthorized administrative keys: `{ id: 'tx_1', userId: 'user_1', isAdmin: true, bypassRules: true }`.
   Expectation: `PERMISSION_DENIED`.

9. **Oversized String / Denial of Wallet Attack**:
   Description field containing 50,000 characters: `{ description: 'A'.repeat(50000) }`.
   Expectation: `PERMISSION_DENIED` (`description.size() <= 150`).

10. **Cross-User Saving Box Modification**:
    `request.auth.uid = 'attacker_456'`, attempting `update(/users/victim_123/savingBoxes/box_1)` with `{ currentAmount: 0 }`.
    Expectation: `PERMISSION_DENIED`.

11. **Altering Immutable Transaction Creation Date**:
    Attempting `update(/users/user_1/transactions/tx_1)` with `{ createdAt: 9999999999999 }`.
    Expectation: `PERMISSION_DENIED`.

12. **Blanket Query Scraping on All Users**:
    Attempting collection group query on `transactions` or listing `/users`.
    Expectation: `PERMISSION_DENIED`.

---

## 3. Test Runner (Conceptual Rules Test Suite)
All tests verify `assertFails` for each Dirty Dozen payload against the Firestore security rules.
