import * as microsoftTeams from '@microsoft/teams-js';

export interface TeamsContext {
  channelId: string;
  teamId: string;
  userId: string;
  userPrincipalName: string;
  theme: string;
}

let isInitialized = false;
let cachedContext: TeamsContext | null = null;

/**
 * Initialize Microsoft Teams SDK
 * Must be called before any other Teams operations
 */
export async function initializeTeams(): Promise<void> {
  if (isInitialized) return;
  
  try {
    await microsoftTeams.app.initialize();
    isInitialized = true;
    console.log('✓ Teams SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Teams SDK:', error);
    throw error;
  }
}

/**
 * Get Teams context (channel ID, team ID, user info)
 * Caches result for performance
 */
export async function getTeamsContext(): Promise<TeamsContext> {
  if (!isInitialized) {
    await initializeTeams();
  }

  if (cachedContext) {
    return cachedContext;
  }

  try {
    const context = await microsoftTeams.app.getContext();
    
    cachedContext = {
      channelId: context.channel?.id || '',
      teamId: context.team?.groupId || '',
      userId: context.user?.id || '',
      userPrincipalName: context.user?.userPrincipalName || '',
      theme: context.app.theme || 'default',
    };

    console.log('✓ Teams context retrieved:', {
      channelId: cachedContext.channelId,
      teamId: cachedContext.teamId,
    });

    return cachedContext;
  } catch (error) {
    console.error('Failed to get Teams context:', error);
    throw error;
  }
}

/**
 * Check if app is running inside Microsoft Teams
 */
export function isInTeams(): boolean {
  return typeof window !== 'undefined' && 
         (window.parent !== window || window.name === 'embedded-page-container');
}

/**
 * Notify Teams that content is loaded
 */
export function notifySuccess(): void {
  if (isInitialized) {
    microsoftTeams.app.notifySuccess();
  }
}

/**
 * Notify Teams of failure
 */
export function notifyFailure(reason: string): void {
  if (isInitialized) {
    microsoftTeams.app.notifyFailure({
      reason: microsoftTeams.app.FailedReason.Other,
      message: reason,
    });
  }
}
