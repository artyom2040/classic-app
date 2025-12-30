/**
 * Navigation Service
 *
 * Centralized navigation without prop drilling.
 * Provides type-safe navigation helpers that can be used anywhere in the app.
 *
 * Setup (in App.tsx):
 * ```typescript
 * import { navigationRef } from './src/services/navigationService';
 *
 * <NavigationContainer ref={navigationRef}>
 * ```
 *
 * Usage:
 * ```typescript
 * import { navigationService } from '../services/navigationService';
 *
 * navigationService.navigateToComposer('bach');
 * navigationService.goBack();
 * ```
 */

import { createNavigationContainerRef, StackActions } from '@react-navigation/native';
import { RootStackParamList } from '../types';

/**
 * Navigation container ref - must be passed to NavigationContainer in App.tsx
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Check if navigation is ready
 */
function isReady(): boolean {
  return navigationRef.isReady();
}

/**
 * Navigation service with type-safe methods
 */
export const navigationService = {
  /**
   * Check if navigation is ready
   */
  isReady,

  /**
   * Navigate to a screen
   */
  navigate<T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T]
  ): void {
    if (isReady()) {
      // @ts-expect-error - React Navigation types are complex with conditional params
      navigationRef.navigate(screen, params);
    }
  },

  /**
   * Go back to previous screen
   */
  goBack(): void {
    if (isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  },

  /**
   * Check if can go back
   */
  canGoBack(): boolean {
    return isReady() && navigationRef.canGoBack();
  },

  /**
   * Reset navigation state to a single screen
   */
  reset(routeName: keyof RootStackParamList): void {
    if (isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: routeName }],
      });
    }
  },

  /**
   * Replace current screen
   */
  replace<T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T]
  ): void {
    if (isReady()) {
      navigationRef.dispatch(StackActions.replace(screen as string, params));
    }
  },

  /**
   * Push a new screen onto the stack
   */
  push<T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T]
  ): void {
    if (isReady()) {
      navigationRef.dispatch(StackActions.push(screen as string, params));
    }
  },

  /**
   * Pop screens from the stack
   */
  pop(count: number = 1): void {
    if (isReady()) {
      navigationRef.dispatch(StackActions.pop(count));
    }
  },

  /**
   * Pop to the top of the stack
   */
  popToTop(): void {
    if (isReady()) {
      navigationRef.dispatch(StackActions.popToTop());
    }
  },

  // =========================================================================
  // Convenience Methods
  // =========================================================================

  /**
   * Navigate to composer detail screen
   */
  navigateToComposer(composerId: string): void {
    this.navigate('ComposerDetail', { composerId });
  },

  /**
   * Navigate to conductor detail screen
   */
  navigateToConductor(conductorId: string): void {
    this.navigate('ConductorDetail', { conductorId });
  },

  /**
   * Navigate to period detail screen
   */
  navigateToPeriod(periodId: string): void {
    this.navigate('PeriodDetail', { periodId });
  },

  /**
   * Navigate to form detail screen
   */
  navigateToForm(formId: string): void {
    this.navigate('FormDetail', { formId });
  },

  /**
   * Navigate to term detail screen
   */
  navigateToTerm(termId: string): void {
    this.navigate('TermDetail', { termId });
  },

  /**
   * Navigate to release detail screen
   */
  navigateToRelease(releaseId: string): void {
    this.navigate('ReleaseDetail', { releaseId });
  },

  /**
   * Navigate to concert hall detail screen
   */
  navigateToConcertHall(hallId: string): void {
    this.navigate('ConcertHallDetail', { hallId });
  },

  /**
   * Navigate to article screen
   */
  navigateToArticle(articleId: string): void {
    this.navigate('Article', { articleId });
  },

  /**
   * Navigate to listening guide player
   */
  navigateToListeningGuide(guideId: string): void {
    this.navigate('ListeningGuidePlayer', { guideId });
  },

  /**
   * Navigate to kickstart day
   */
  navigateToKickstartDay(day: number): void {
    this.navigate('KickstartDay', { day });
  },

  /**
   * Navigate to search screen
   */
  navigateToSearch(): void {
    this.navigate('Search');
  },

  /**
   * Navigate to settings screen
   */
  navigateToSettings(): void {
    this.navigate('Settings');
  },

  /**
   * Navigate to main tabs
   */
  navigateToHome(): void {
    this.navigate('MainTabs');
  },

  /**
   * Navigate to login screen
   */
  navigateToLogin(): void {
    this.navigate('Login');
  },

  /**
   * Navigate to user dashboard
   */
  navigateToUserDashboard(): void {
    this.navigate('UserDashboard');
  },

  /**
   * Navigate to admin dashboard
   */
  navigateToAdminDashboard(): void {
    this.navigate('AdminDashboard');
  },
};

export default navigationService;
