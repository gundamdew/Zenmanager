import { createBrowserRouter } from 'react-router';
import { OnboardingScreen } from './components/OnboardingScreen';
import { DashboardScreen }  from './components/DashboardScreen';
import { ScheduleScreen }   from './components/ScheduleScreen';
import { StatsScreen }      from './components/StatsScreen';
import { ProfileScreen }    from './components/ProfileScreen';
import { SmartScheduleProposer } from './components/SmartScheduleProposer';

export const router = createBrowserRouter([
  { path: '/',          Component: OnboardingScreen },
  { path: '/dashboard', Component: DashboardScreen  },
  { path: '/schedule',  Component: ScheduleScreen   },
  { path: '/smart',     Component: SmartScheduleProposer },
  { path: '/stats',     Component: StatsScreen      },
  { path: '/profile',   Component: ProfileScreen    },
]);
