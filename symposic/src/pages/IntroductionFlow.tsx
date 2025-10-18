import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const IntroductionFlow: React.FC = () => {
  const navigate = useNavigate()
  const [showWelcome, setShowWelcome] = useState(false)
  const [hideWelcome, setHideWelcome] = useState(false)
  const [removeWelcome, setRemoveWelcome] = useState(false)
  const [showHeader, setShowHeader] = useState(false)
  const [showCards, setShowCards] = useState(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    // Start the animation sequence
    const timer1 = setTimeout(() => {
      setShowWelcome(true)
    }, 500)

    const timer2 = setTimeout(() => {
      setHideWelcome(true)
    }, 2500)

    // Remove welcome text completely after fade animation
    const timer2a = setTimeout(() => {
      setRemoveWelcome(true)
    }, 3500) // 1000ms after hideWelcome starts (duration of fade)

    const timer3 = setTimeout(() => {
      setShowHeader(true)
    }, 4000)

    const timer4 = setTimeout(() => {
      setShowCards(true)
    }, 5000)

    const timer5 = setTimeout(() => {
      setShowButton(true)
    }, 6000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer2a)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Welcome Animation - Render until completely removed */}
        {showWelcome && !removeWelcome && (
          <div className={`transition-all duration-1000 transform ${
            showWelcome && !hideWelcome ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          } ${hideWelcome ? 'scale-95' : 'scale-100'}`}>
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 tracking-tight">
              Hi! Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Symposic
              </span>
            </h1>
          </div>
        )}

        {/* Instructions Content - Show only when welcome is completely removed */}
        {removeWelcome && (
          <div className={`transition-all duration-1000 ${
            showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-8">
              Here's how this works:
            </h2>

            {/* Step Cards */}
            <div className={`transition-all duration-1000 delay-500 ${
              showCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Step 1 */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
                <div className="flex md:block items-center gap-4 mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl shrink-0 md:mb-6">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-white md:mb-4">
                    Tell us about yourself
                  </h3>
                </div>
                <ul className="text-gray-300 space-y-2 text-left">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    What are your professional goals?
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    What makes you unique?
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Who would you like to meet & network with?
                  </li>
                </ul>
              </div>

              {/* Step 2 */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
                <div className="flex md:block items-center gap-4 mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-xl shrink-0 md:mb-6">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-white md:mb-4">
                    Get Invited
                  </h3>
                </div>
                <p className="text-gray-300 text-left">
                  Our AI match maker will identify highly compatible groups and invite you to personalized networking events with suitable peers.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 shadow-2xl hover:shadow-green-500/20 transition-all duration-300">
                <div className="flex md:block items-center gap-4 mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xl shrink-0 md:mb-6">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-white md:mb-4">
                    That's all!
                  </h3>
                </div>
                <p className="text-gray-300 text-left">
                  Simple as that. Start building meaningful professional connections today.
                </p>
              </div>
            </div>
            </div>

            {/* CTA Button */}
            <div className={`transition-all duration-1000 delay-1000 ${
              showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <Button 
                size="lg" 
                onClick={() => navigate('/sign-in')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-12 py-6 text-lg rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                style={{ animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
              >
                Get Started
              </Button>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default IntroductionFlow
