
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneEntryStep from '../components/SignInOrSignUp/PhoneEntryStep'
import OTPValidationStep from '../components/SignInOrSignUp/OTPValidationStep'
import { useOnboarding } from '../contexts/OnboardingContext'

const SignInOrSignUp: React.FC = () => {
  const navigate = useNavigate()
  const { setOnboardingState } = useOnboarding()
  const [currentStep, setCurrentStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState('')

  /** This is a custom onNext() for the PhoneEntryStep component */
  const handlePhoneSubmit = (phone: string) => {
    setPhoneNumber(phone)
    setCurrentStep(2)
  }

  /** This is a custom onNext() for the OTPValidationStep component */
  const handleOTPVerification = (onboardingState?: any) => {
    if (onboardingState) {
      setOnboardingState(onboardingState)
      
      // Redirect based on onboarding state
      if (onboardingState.hasProfileData && onboardingState.hasFinishedInterview) {
        // User is fully onboarded, go to home
        navigate('/home')
      } else {
        // User needs to complete onboarding
        navigate('/onboarding')
      }
    } else {
      // Fallback to onboarding if no state provided
      console.error('No onboarding state provided in handleOTPVerification()')
      navigate('/onboarding')
    }
  }

  const handleBack = () => {
    setCurrentStep(1)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PhoneEntryStep onNext={handlePhoneSubmit} />
      case 2:
        return <OTPValidationStep onNext={handleOTPVerification} phoneNumber={phoneNumber} onBack={handleBack} />
      default:
        return <PhoneEntryStep onNext={handlePhoneSubmit} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="flex-1 py-8 px-6">
        {renderStep()}
      </div>
    </div>
  )
}

export default SignInOrSignUp
