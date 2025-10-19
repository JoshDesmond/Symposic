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
}
