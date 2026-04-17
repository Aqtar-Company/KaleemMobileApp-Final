import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

export const API_BASE_URL =
  (extra.apiBaseUrl as string) || 'https://api.kaleemai.com/api';

export const USE_MOCK: boolean =
  typeof extra.useMock === 'boolean' ? (extra.useMock as boolean) : false;

export const APP_NAME = 'Kaleem';
