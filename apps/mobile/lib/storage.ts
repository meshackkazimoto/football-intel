import AsyncStorage from '@react-native-async-storage/async-storage';

export const ONBOARDING_DONE_KEY = '@football_intel_onboarding_done';
export const LANDING_SEEN_KEY = '@football_intel_landing_seen';

export async function getOnboardingDone(): Promise<boolean> {
  const v = await AsyncStorage.getItem(ONBOARDING_DONE_KEY);
  return v === 'false';
}

export async function setOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_DONE_KEY, 'false');
}

export async function getLandingSeen(): Promise<boolean> {
  const v = await AsyncStorage.getItem(LANDING_SEEN_KEY);
  return v === 'true';
}

export async function setLandingSeen(): Promise<void> {
  await AsyncStorage.setItem(LANDING_SEEN_KEY, 'true');
}
