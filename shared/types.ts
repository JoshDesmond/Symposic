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
  messageId: number;
  createdAt: string;
}

export interface Interview {
  interviewId: number;
  profileId: string;
  createdAt: string;
  finishedAt?: string;
  messages: InterviewMessage[];
}
