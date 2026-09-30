/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  avatarId: string;
  name: string;
  birthDate: string; // ISO string YYYY-MM-DD or empty
}

const PROFILE_STORAGE_KEY = 'min_finance_user_profile_v1';
export const USER_PROFILE_EVENT = 'min_finance_user_profile_change';

const DEFAULT_PROFILE: UserProfile = {
  avatarId: '',
  name: '',
  birthDate: '',
};

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          avatarId: typeof parsed.avatarId === 'string' ? parsed.avatarId : DEFAULT_PROFILE.avatarId,
          name: typeof parsed.name === 'string' ? parsed.name : '',
          birthDate: typeof parsed.birthDate === 'string' ? parsed.birthDate : '',
        };
      }
    }
  } catch (e) {
    console.error('Error loading user profile from localStorage', e);
  }
  return { ...DEFAULT_PROFILE };
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving user profile to localStorage', e);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(USER_PROFILE_EVENT, { detail: profile }));
  }
}
