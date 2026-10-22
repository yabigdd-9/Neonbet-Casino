# Shared interface accessibility review

Reviewed revision: `9984dd1`.

## Changes

- Dialogs trap keyboard focus, restore focus on close, and lock background scrolling.
- Updating a close callback no longer resets focus while typing.
- Nested dialogs only handle Escape in the top dialog and retain the scroll lock until the final dialog closes.
- Dialog headings provide accessible names; dialogs without headings still have a close control.
- Dialog content scrolls inside a viewport-bounded panel with a visible header and footer.
- Input, select, and textarea IDs remain unique when labels or field names repeat.
- All three field types associate visible validation errors with their controls while retaining existing help-text descriptions and control props.
- Notifications have dismiss controls, errors remain until dismissed, and timers are cleared on unmount.
- Notifications avoid the mobile bottom navigation and fit narrow viewports.
- Global keyboard focus indicators, reduced-motion preferences, dark native controls, and mobile field sizing are supported.

## Verification

- Existing baseline: 58 tests passed.
- Final suite: 66 tests passed, including 8 new shared-interface regression tests.
- Production build passed.
- Repository secret scanner passed; this is pattern scanning, not a security audit.
- Git whitespace validation passed.

## Limits

Tests run in jsdom. Real-device layout, mobile virtual keyboards, browser focus behavior, screen-reader announcements, and visual contrast still need manual verification. This review does not establish WCAG conformance, security certification, or production readiness. Gambling logic, payment flows, backend authorization, and promotional content were outside this change.
