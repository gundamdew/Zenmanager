You are improving an existing React + TypeScript mobile app called ZenSync — 
a time-management tool for working students. The codebase uses inline styles, 
a shared design token object `T`, DM Sans font, react-router v7, and Recharts. 
All screens are wrapped in <PhoneFrame>. Do not change the visual identity or 
color tokens.

Apply ALL of the following fixes in one pass:

────────────────────────────────────────
 1. GLOBAL STATE — create a shared preferences store
────────────────────────────────────────
Create a new file `src/app/store/prefsStore.ts` using React Context + useReducer 
(no external libraries). Export:
  - PrefsContext
  - PrefsProvider  (wrap it in App.tsx around <RouterProvider>)
  - usePrefs()  hook

The state shape is the existing `Preferences` interface from OnboardingScreen.tsx. 
Remove all local useState for preferences from both OnboardingScreen.tsx and 
ProfileScreen.tsx. Both screens must read from and write to PrefsContext. 
This ensures changes in Profile are immediately reflected in the planning algorithm.

────────────────────────────────────────
 2. ONBOARDING — fix localStorage crash + make StepDots navigable
────────────────────────────────────────
In OnboardingScreen.tsx:

a) Wrap localStorage.setItem in try/catch with a silent fallback:
   try {
     localStorage.setItem('zensync_prefs', JSON.stringify(prefs));
   } catch (_) {}

b) Make <StepDots> clickable. Add an `onClick?: (index: number) => void` prop. 
   In the main OnboardingScreen component pass onClick={(i) => setStep(i)} 
   but only allow navigating to already-visited steps (i <= step). 
   Add cursor: 'pointer' and aria-label={`Go to step ${i+1}`} to each dot.

c) On the RhythmStep screen, move the slider card into its own collapsed section 
   that expands when the user taps "Set max focus block". This avoids scroll on 
   small screens. Use a simple useState(false) for expanded state.

────────────────────────────────────────
 3. BOTTOM NAV — reduce to 4 items
────────────────────────────────────────
In AppBottomNav.tsx, merge the Schedule and Stats tabs into a single "Overview" 
tab (icon: LayoutDashboard from lucide-react, label: 'Overview', path: '/overview').

Create a new file `src/app/components/OverviewScreen.tsx`. This screen renders 
a sticky tab bar at the top with two pills: "Schedule" and "Stats". 
Tapping each pill renders the existing <ScheduleScreen> or <StatsScreen> content 
(without their own PhoneFrame wrappers — extract just the inner content into 
separate components <ScheduleContent> and <StatsContent>).

Update routes.tsx to add { path: '/overview', Component: OverviewScreen }.
Remove the separate /schedule and /stats routes.

The bottom nav now has 4 items: Home · Overview · [FAB] · Profile.
Remove the empty slot for a 5th item.

────────────────────────────────────────
 4. DASHBOARD — fix competing FABs + add empty state
────────────────────────────────────────
In DashboardScreen.tsx:

a) The RegenFAB uses position:'absolute' which breaks layout inside the 
   PhoneFrame flex column. Change it to position:'fixed' BUT since PhoneFrame 
   clips overflow, instead: remove the standalone <RegenFAB> component and 
   integrate a compact "Re-optimize" text button (not FAB) inside the 
   SyncScoreCard, next to the "Plan AI-Optimized" chip. Style it as a small 
   ghost button: border, transparent bg, T.text color, 11px font.

b) Add an empty state: when tasks.length === 0, render a centered illustration 
   placeholder (use the existing ZenSyncLogo SVG at size 48) with the text 
   "No tasks yet — tap + to add your first one" in T.textMuted at 14px.

────────────────────────────────────────
 5. BURNOUT SCORE — personalized baseline
────────────────────────────────────────
In StatsScreen.tsx, replace the hardcoded constant 50 with a dynamic 
`weeklyCapacity` value. 

Add a numeric input in the ProfileScreen under "Algorithm Preferences" 
labeled "Weekly capacity (hours)" with min=20, max=80, step=5, defaultValue=45. 
Store it in PrefsContext as `weeklyCapacityHours: number` (default 45).

In computeStats(), import usePrefs() and calculate:
  const burnout = Math.min(100, Math.round((totalHeavy / prefs.weeklyCapacityHours) * 100));

Update the insight card copy to mention the user's actual capacity:
  `You've logged ${totalHeavy}h out of your ${prefs.weeklyCapacityHours}h weekly capacity.`

────────────────────────────────────────
 6. TIMELINE — basic collision detection
────────────────────────────────────────
In ScheduleScreen.tsx, before rendering EventBlocks for a given day, detect 
overlapping events using this logic:

function resolveColumns(events: CalEvent[]): Map<string, {col: number, totalCols: number}> {
  // Sort by startTime, then for each event find how many others overlap with it.
  // Assign column index (0-based). Return a map of event.id → {col, totalCols}.
}

In EventBlock, accept `col` and `totalCols` props. Calculate:
  const colWidth = `calc((100% - 4px) / ${totalCols})`;
  const leftOffset = `calc(${col} * (100% - 4px) / ${totalCols} + 2px)`;
Set width and left accordingly. This allows up to 3 parallel events to display 
side by side without overlap.

────────────────────────────────────────
 7. ACCESSIBILITY — minimum required fixes
────────────────────────────────────────
Apply these changes across all component files:

a) Every <Toggle> button: add aria-label={`Toggle ${label}`} where label is 
   passed as a new prop to the Toggle component.

b) In TaskCard, the checkbox button must have aria-label={task.completed ? 
   `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}.

c) In AppBottomNav, each tab button must have aria-label={item.label} and 
   aria-current={isActive ? 'page' : undefined}.

d) Change T.textMuted color from '#94A3B8' to '#717182' everywhere it is 
   used as body text on white backgrounds. This brings contrast to 4.6:1 
   (WCAG AA compliant). Do NOT change it where it is used as decorative 
   placeholder or icon color.

e) Add a visible focus-visible ring to all interactive elements that currently 
   have outline:'none'. Use: 
   onFocus={(e) => e.currentTarget.style.outline = '2px solid #4F63D2'}
   onBlur={(e)  => e.currentTarget.style.outline = 'none'}

────────────────────────────────────────
 8. WEEKLY REVIEW SCREEN
────────────────────────────────────────
Create `src/app/components/WeeklyReviewScreen.tsx`.

This screen appears as a modal overlay (not a new route) triggered automatically 
on Sundays when the user opens the app AND has not seen the review this week. 
Store `lastReviewDate` in PrefsContext (string | null, default null).

The screen renders inside a bottom sheet (same animation pattern as AddTaskModal):
  - Header: "Your week in review 🌿"
  - 3 stat rows pulled from WEEKLY_DATA in StatsScreen: tasks completed, 
    total hours logged, burnout score vs previous week (▲/▼ delta)
  - One AI insight sentence (hardcoded for now, based on burnout level)
  - Two buttons: "Start fresh week →" (closes modal, sets lastReviewDate) 
    and "See full stats" (navigates to /overview with Stats tab active)

Add a "Preview Review" button in ProfileScreen under Account Settings 
(between Sync Frequency and Privacy rows) so the team can demo it any day.

────────────────────────────────────────
 9. AHA MOMENT — USOS import prompt on dashboard
────────────────────────────────────────
In DashboardScreen.tsx, add a one-time banner that appears at the top of the 
scrollable content when tasks are all mock data (detect by checking if any 
task has isAI === false AND location includes 'Hall'  — a proxy for mock data).

The banner style: rounded card, T.primarySoft background, icon <Link size={16}>, 
text "Connect USOS to see your real schedule", and a button "Connect now →" 
that navigates to '/profile' (the integrations section). Add a dismiss (×) 
button that sets a useState(false) to hide it. The banner should not reappear 
after dismissal within the session.

────────────────────────────────────────
CONSTRAINTS
────────────────────────────────────────
- Do not install any new npm packages.
- Do not modify the design tokens in T or the PhoneFrame component.
- Do not change font, color scheme, or border-radius conventions.
- Keep all inline-style patterns consistent with the existing codebase.
- After all changes, ensure the app compiles with no TypeScript errors.
- All new text strings should be in English (the app's current language).