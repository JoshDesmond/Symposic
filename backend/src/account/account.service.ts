import { randomUUID, UUID} from 'crypto';
import { db } from '../database';

export interface ProfileData {
  firstName: string;
  lastName: string;
  city: string;
  state: string;
}

export interface OnboardingState {
  profileId: string;
  phone: string;
  hasProfileData: boolean;
  hasFinishedInterview: boolean;
  profileData?: ProfileData;
}

export class AccountService {
  async createProfile(phone: string): Promise<UUID> {
    const profileId = randomUUID();
    
    await db.tx(async (t) => {
      await t.none(
        'INSERT INTO profiles (profile_id, phone) VALUES ($1, $2)',
        [profileId, phone]
      );
    });
    
    return profileId;
  }
  
  async updateProfile(phone: string, profileData: ProfileData): Promise<void> {
    const profile = await this.getProfileByPhone(phone);
    if (!profile) {
      throw new Error('Profile not found');
    }

    await db.none(
      `UPDATE profile_data 
       SET first_name = $1, last_name = $2, city = $3, state = $4
       WHERE profile_id = $5`,
      [profileData.firstName, profileData.lastName, profileData.city, profileData.state, profile.profile_id]
    );
  }

  /**
   * Idempotent method to update profile data
   * Creates new data if none exists, updates if it exists
   */
  async updateProfileData(phone: string, profileData: ProfileData): Promise<void> {
    const profile = await this.getProfileByPhone(phone);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Use UPSERT to handle both create and update cases
    await db.none(
      `INSERT INTO profile_data (profile_id, first_name, last_name, city, state) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (profile_id) 
       DO UPDATE SET 
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         city = EXCLUDED.city,
         state = EXCLUDED.state`,
      [profile.profile_id, profileData.firstName, profileData.lastName, profileData.city, profileData.state]
    );
  }

  async getOnboardingState(phone: string): Promise<OnboardingState> {
    const result = await db.oneOrNone(
      `SELECT p.profile_id, p.phone,
              pd.first_name, pd.last_name, pd.city, pd.state,
              CASE WHEN pd.profile_id IS NOT NULL THEN true ELSE false END as has_profile_data,
              CASE WHEN i.finished_at IS NOT NULL THEN true ELSE false END as has_finished_interview
       FROM profiles p
       LEFT JOIN profile_data pd ON p.profile_id = pd.profile_id
       LEFT JOIN interviews i ON p.profile_id = i.profile_id
       WHERE p.phone = $1`,
      [phone]
    );

    if (!result) {
      throw new Error('Profile not found');
    }

    const onboardingState: OnboardingState = {
      profileId: result.profile_id,
      phone: result.phone,
      hasProfileData: result.has_profile_data,
      hasFinishedInterview: result.has_finished_interview
    };

    if (result.has_profile_data) {
      onboardingState.profileData = {
        firstName: result.first_name,
        lastName: result.last_name,
        city: result.city,
        state: result.state
      };
    }

    return onboardingState;
  }

  async getProfileByPhone(phone: string): Promise<any> {
    return db.oneOrNone(
      `SELECT p.profile_id, p.phone, p.created_at, p.updated_at,
              pd.first_name, pd.last_name, pd.city, pd.state
       FROM profiles p
       LEFT JOIN profile_data pd ON p.profile_id = pd.profile_id
       WHERE p.phone = $1`,
      [phone]
    );
  }
}
