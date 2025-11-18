// Shared types between backend and frontend

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
  interview?: Interview;
}

export interface InterviewMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Interview {
  createdAt: string;
  finishedAt?: string;
  messages: InterviewMessage[];
  promptVersion: string; // SemVer
}

// TODO you will need to support passing back the isCompleted and the estimatedProgress with the new tool-based structured output
