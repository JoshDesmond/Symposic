import React, { useState } from 'react'
import OnboardingHeader from '../components/layout/OnboardingHeader'
import OnboardingForm from '../components/onboarding/OnboardingForm'
import InterviewStep from '../components/onboarding/InterviewStep'
import OTPValidationStep from '@/components/onboarding/OTPValidationStep'

const OnboardingProfile: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)

  const handleNext = () => {
    setCurrentStep(currentStep + 1)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <OnboardingForm onNext={handleNext} />
      case 2:
        return <OTPValidationStep onNext={handleNext} />
      case 3:
        return <InterviewStep />
      default:
        return <OnboardingForm onNext={handleNext} />
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