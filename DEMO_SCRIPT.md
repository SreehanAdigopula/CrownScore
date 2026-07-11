# Internal fixture script

The normal CrownScore product flow should begin with no data. Use this checklist only for internal testing.

1. Open `/dashboard` in a fresh browser profile and confirm the empty baseline state.
2. Run a first check-in and confirm it is saved as today's baseline with score `100`.
3. Open `/history` and confirm there is exactly one record dated today.
4. Open `/progress` and confirm the trend chart waits for a second check-in.
5. Open `/coach` and confirm the summary is based on the saved check-in.
6. Open `/demo` only when testing synthetic fixtures. Fixture selections must not mutate dashboard/history/progress data.
7. Use `/api/demo/seed` only for backend fixture validation.
