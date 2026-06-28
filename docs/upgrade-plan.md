# Upgrade plan after `ver1-foundation`

This document records the safety rules and implementation direction for the major update after `ver1-foundation`.

## Safety principles

- Protect active users' data first.
- Do not delete or rename existing Firestore/localStorage fields without a compatible migration.
- Prefer additive schema changes.
- Keep private salary data separate from public profile/ranking data.
- Run tests, lint, type-check, and build before publishing meaningful changes.
- Use Git commits frequently and tag stable milestones.
- Verify changes locally through `localhost` before relying on production behavior.

## Existing data that must remain readable

- Firestore `users/{uid}.entries`
- Firestore `users/{uid}.config`
- Firestore `rankings/{uid}`
- localStorage `juku_salary_entries`
- localStorage `juku_salary_config`

## Login-required migration policy

The app will move toward requiring login before entering the main app.

To avoid data loss for existing users who used the app without logging in:

1. Detect existing localStorage data after login.
2. If the user's Firestore account does not already have salary data, import localStorage data into Firestore.
3. Do not immediately delete localStorage data after import.
4. Save migration flags such as `localStorageImportedAt`.
5. Show a clear message when local data has been imported or when migration needs attention.

## Public and private data boundary

Private salary data must stay private:

- work entries by date
- salary amounts and detailed breakdowns
- transportation costs
- tax-related values
- user configuration
- email address
- detailed work locations and schedules

Public profile data may include only:

- display name
- icon/avatar
- earned badges
- level
- total handled lesson blocks
- ranking achievements
- affiliation
- following count
- follower count

Recommended Firestore separation:

```txt
users/{uid}
  entries
  config
  private settings
  migration flags

publicProfiles/{uid}
  displayName
  photoURL
  affiliation
  level
  totalKoma
  badges
  rankingStats
  followingCount
  followerCount
```

`users/{uid}` should not be readable by other users. Public profile screens should read from a dedicated public collection.

## Additional planned features

- Terms of service and privacy policy pages.
- First-login agreement tracking:
  - `termsAcceptedAt`
  - `termsVersion`
  - `privacyAcceptedAt`
  - `privacyVersion`
- Review the terms of service and privacy policy whenever features change user data handling, public profile behavior, rankings, follows, admin operations, or external service usage.
- Firestore-backed announcements so news can be added without code changes.
  - Redesign the user experience like an email inbox: show a compact title list first, then open a dedicated detail page when an item is tapped.
- Admin-only announcement and badge management.
- Keep yearly salary settings optional. Years without an override continue to use the default salary settings, and duplicate or unreasonable year entries should be prevented.
- Monthly ranking winner badges.
- Public profile pages from ranking entries.
- Follow/follower features.
- Account deletion and user data deletion flow.
- Public profile visibility controls.

## Suggested implementation order

1. Login-required shell and localStorage-to-Firestore migration.
2. Terms/privacy pages and first-login consent.
3. Route-based page structure.
4. Firestore-backed announcements.
5. Public profiles and ranking profile views.
6. Monthly ranking winner badges.
7. Follow/follower features.
8. Account deletion and privacy controls.

## Versioning milestones

Existing stable points:

- `ver1`: original stable version before foundation cleanup.
- `ver1-foundation`: foundation cleanup version.

Suggested future tags:

- `ver2-auth-required`
- `ver2-terms-privacy`
- `ver2-routing`
- `ver2-announcements`
- `ver2-profile-ranking`
