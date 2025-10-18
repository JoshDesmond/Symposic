import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8347'

interface OnboardingState {
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

interface OTPValidationStepProps {
  onNext: (onboardingState?: OnboardingState) => void
  onBack?: () => void
  phoneNumber: string
}

const OTPValidationStep: React.FC<OTPValidationStepProps> = ({ onNext, onBack, phoneNumber }) => {
  const [otp, setOtp] = useState<string[]>(new Array(7).fill(''))
  const [isVerifying, setIsVerifying] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const isOtpComplete = otp.every(digit => digit !== '')

  const handleInputChange = (index: number, value: string) => {
    // Only allow single digits
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setHasError(false)
    setErrorMessage('')

    // Auto-focus next input
    if (value && index < 6) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 7)
        if (digits.length === 7) {
          setOtp(digits.split(''))
          setHasError(false)
          setErrorMessage('')
        }
      }).catch(() => {
        // Fallback for older browsers or if clipboard API fails
      })
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const digits = pastedText.replace(/\D/g, '').slice(0, 7)
    
    if (digits.length === 7) {
      setOtp(digits.split(''))
      setHasError(false)
      setErrorMessage('')
      // Focus the last input after paste
      setTimeout(() => {
        inputRefs.current[6]?.focus()
      }, 0)
    }
  }

  const handleSubmit = async () => {
    if (!isOtpComplete) return

    setIsVerifying(true)
    setHasError(false)
    setErrorMessage('')

    try {
      const otpString = otp.join('')
      
      const response = await fetch(`${API_URL}/api/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          phone: phoneNumber,
          code: Number(otpString)
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Verification successful, cookie set automatically')
        onNext(data.onboardingState) // Pass the onboarding state to determine next step
      } else {
        setHasError(true)
        setErrorMessage('Invalid verification code. Please try again.')
      }
      
    } catch (error) {
      setHasError(true)
      setErrorMessage('Something went wrong. Please try again.')
      console.log(`Error verifying OTP: ${error}`)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl p-8">
      <h2 className="text-xl font-medium text-white mb-4 text-center">
        Enter your verification code
      </h2>
      
      <p className="text-gray-400 text-sm text-center mb-8">
        We've sent a 7-digit verification code to your phone. Please enter it below.
      </p>

      <div className="mb-8">
        <div className="flex justify-center gap-2 mb-4">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`
                w-10 h-12 text-center text-lg font-semibold
                bg-gray-700 border-gray-600 text-white
                focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                transition-all duration-200
                ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                ${digit ? 'border-blue-400' : ''}
              `}
              placeholder=""
            />
          ))}
        </div>

        {hasError && (
          <p className="text-red-400 text-sm text-center">
            {errorMessage}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <Button
          onClick={handleSubmit}
          disabled={!isOtpComplete || isVerifying}
          className={`
            w-full font-semibold py-3 px-4 rounded-lg shadow-lg transition-all duration-300 transform
            ${isOtpComplete && !isVerifying
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:shadow-blue-500/25 hover:scale-105'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isVerifying ? 'Verifying...' : 'Verify Code'}
        </Button>

        {onBack && (
          <Button
            onClick={onBack}
            variant="ghost"
            className="w-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors duration-200"
          >
            Back
          </Button>
        )}
      </div>
    </div>
  )
}

export default OTPValidationStep
