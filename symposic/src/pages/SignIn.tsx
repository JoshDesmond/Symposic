
import React from 'react'
import PhoneEntryStep from '../components/SignInOrSignUp/PhoneEntryStep'
import OTPValidationStep from '../components/SignInOrSignUp/OTPValidationStep'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8347'

const SignInOrSignUp: React.FC = () => {
  // TODO Should show
  // 1.) PhoneEntryStep.tsx
  // 2.) OTPValidationStep.tsx
  // Redirect to /either /onboarding or /home based on the onboarding state

  /** This is a custom onNext() for the PhoneEntryStep component */
  const handlePhoneSubmit = (phone: string) => {
    // setPhoneNumber(phone)
    // TODO Go to OTPValidationStep.tsx with phone number in context/props
  }

  return (
    <div>
      <PhoneEntryStep onNext={handlePhoneSubmit}/>
    </div>
  )
}

export default SignInOrSignUp
