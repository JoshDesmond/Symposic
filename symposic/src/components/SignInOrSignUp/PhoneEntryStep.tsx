import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8347'

interface PhoneEntryStepProps {
  onNext: (phoneNumber: string) => void
}

const PhoneEntryStep: React.FC<PhoneEntryStepProps> = ({ onNext }) => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isValidPhone, setIsValidPhone] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digit characters
    const digitsOnly = e.target.value.replace(/\D/g, '')
    
    // Limit to 10 digits maximum
    const limitedDigits = digitsOnly.slice(0, 10)
    
    // Format with dashes: xxx-xxx-xxxx
    let formatted = limitedDigits
    if (limitedDigits.length > 6) {
      formatted = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`
    } else if (limitedDigits.length > 3) {
      formatted = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`
    }
    
    setPhoneNumber(formatted)
    setIsValidPhone(limitedDigits.length === 10)
    setError('') // Clear error when user types
  }

  const handleSubmit = async () => {
    if (!isValidPhone) return
    
    setIsLoading(true)
    setError('')
    
    try {
      // Remove dashes from formatted phone number for API call
      const digitsOnly = phoneNumber.replace(/\D/g, '')
      const fullPhoneNumber = `+1${digitsOnly}`
      
      const response = await fetch(`${API_URL}/api/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: fullPhoneNumber }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send verification code')
      }
      
      // If successful, proceed to next step with formatted phone number
      onNext(fullPhoneNumber)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl p-8">
      <h2 className="text-xl font-medium text-white mb-6 text-center">
        Sign in or sign up
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="text-gray-300 text-sm font-medium mb-2 block">
            Phone Number
          </label>
          <div className="flex gap-2 items-stretch">
            {/* Area Code Dropdown */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors duration-200 min-w-[120px] h-full"
              >
                <span className="text-lg">🇺🇸🇨🇦</span>
                <span className="text-sm">+1</span>
                <svg 
                  className="w-4 h-4 ml-1" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Phone Number Input */}
            <div className="flex-1">
              <Input
                type="tel"
                inputMode="tel"
                pattern="[0-9]*"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="Phone number"
                maxLength={20}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 h-full"
              />
            </div>
          </div>
        </div>

        {isValidPhone && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm text-center">
              We'll send a verification code to this number
            </p>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}
            
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 disabled:transform-none"
            >
              {isLoading ? 'Sending...' : 'Login'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PhoneEntryStep
