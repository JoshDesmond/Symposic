import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingHeader from '../components/layout/OnboardingHeader'
import OnboardingForm from '../components/onboarding/OnboardingForm'
import InterviewStep from '../components/onboarding/InterviewStep'
import { useOnboarding } from '../contexts/OnboardingContext'

const OnboardingProfile: React.FC = () => {
  const navigate = useNavigate()
  const { onboardingState } = useOnboarding()
  const [currentStep, setCurrentStep] = useState(1)
  
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
        return <OnboardingForm onNext={handleNext} onBack={handleBack} />
      case 2:
        return <InterviewStep profileName={onboardingState?.profileData?.firstName || ''} onBack={handleBack} onComplete={handleFinishedOnboarding} />
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