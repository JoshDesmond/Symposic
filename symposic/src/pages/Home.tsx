import React from 'react'

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="space-y-8">
          {/* Success Message */}
          <div className="transition-all duration-1000 opacity-100 translate-y-0">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-3xl mb-8 shadow-2xl">
              ✓
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Thanks for registering!
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              We will actively be searching to match you with nearby professionals who share your interests and goals.
            </p>
          </div>

          {/* What's Next Section */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-6">
              What happens next?
            </h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-4">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-sm shrink-0 mt-1">
                  1
                </div>
                <p className="text-gray-300">
                  Our AI will analyze your profile to find compatible networking opportunities near you
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-sm shrink-0 mt-1">
                  2
                </div>
                <p className="text-gray-300">
                  You'll receive personalized invitations to networking events with like-minded professionals
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-gray-400 text-sm">
            <p>
              Questions? Reach out to us at{' '}
              <a href="mailto:support@symposic.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                support@symposic.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
