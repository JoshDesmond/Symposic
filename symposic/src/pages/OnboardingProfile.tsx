import React, { useState } from 'react'
import OnboardingHeader from '../components/layout/OnboardingHeader'
import OnboardingForm from '../components/onboarding/OnboardingForm'
import InterviewStep from '../components/onboarding/InterviewStep'
import OTPValidationStep from '@/components/onboarding/OTPValidationStep'
import SignInOrSignUp from '@/components/onboarding/SignInOrSignUp'

const OnboardingProfile: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState('')
  
  const handlePhoneSubmit = (phoneNumber: string) => {
    setCurrentStep(2)
    setPhoneNumber(phoneNumber)
  }

  const handleNext = () => {
    setCurrentStep(currentStep => currentStep + 1)
  }
  
  const handleBack = () => {
    setCurrentStep(currentStep => currentStep - 1)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <SignInOrSignUp onNext={handlePhoneSubmit} />
      case 2:
        return <OTPValidationStep onNext={handleNext} phoneNumber={phoneNumber} onBack={handleBack} />
      case 3:
        return <OnboardingForm onNext={handleNext} />
      case 4:
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