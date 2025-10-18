import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingHeader from '../components/layout/OnboardingHeader'
import OnboardingForm from '../components/onboarding/OnboardingForm'
import InterviewStep from '../components/onboarding/InterviewStep'
import OTPValidationStep from '@/components/SignInOrSignUp/OTPValidationStep'
import PhoneEntryStep from '@/components/SignInOrSignUp/PhoneEntryStep'

interface OnboardingState { // TODO there should be shared types between the backend and front-end
  profileId: string;
  phone: string;
  hasProfileData: boolean;
  hasFinishedInterview: boolean;
  profileData?: {
    firstName: string;
    lastName: string;
    city: string;
    state: string;
  };
}

const OnboardingProfile: React.FC = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null)
  
  
  /** This is a custom onNext() for the OTPValidationStep component */
  const handleOTPVerification = (state?: OnboardingState) => {
    if (state) {
      setOnboardingState(state)
      
      // Determine next step based on onboarding state
      if (state.hasProfileData && state.hasFinishedInterview) {
        // User is fully onboarded, go to home
        navigate('/home') // TODO include state indicating returning user
      } else if (!state.hasProfileData) {
        // User has no profile data, go to profile form
        setCurrentStep(3)
      }
      else if (state.hasProfileData && !state.hasFinishedInterview) {
        // User has profile data but no finished interview, go to next profile step, (existing profile data will be filled in)
        setCurrentStep(3)
      }
    } else {
      // Fallback to next step if no state provided
      console.error('No onboarding state provided in handleOTPVerification()')
      setCurrentStep(3)
    }
  }

  const handleNext = () => {
    setCurrentStep(currentStep => currentStep + 1)
  }
  
  const handleBack = () => {
    setCurrentStep(currentStep => currentStep - 1)
  }

  const handleFinishedOnboarding = () => {
    navigate('/home')
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PhoneEntryStep onNext={handlePhoneSubmit} />
      case 2:
        return <OTPValidationStep onNext={handleOTPVerification} phoneNumber={phoneNumber} onBack={handleBack} />
      case 3:
        return <OnboardingForm onNext={handleNext} onBack={handleBack} phoneNumber={phoneNumber} existingProfileData={onboardingState?.profileData} />
      case 4:
        return <InterviewStep onBack={handleBack} onComplete={handleFinishedOnboarding} /> // TODO: Add profile name
      default:
        return <></> // TODO, Error route?
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <OnboardingHeader />
      <div className="flex-1 py-8 px-6">
        {renderStep()}
      </div>
    </div>
  )
}

export default OnboardingProfile