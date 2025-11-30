import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-purple-600 leading-tight">
              We love helping people help other people
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              We believe that therapy is an essential part of becoming the best version of ourselves. 
              Our blockchain-powered platform ensures secure, verifiable healthcare interactions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                Offer your services →
              </Link>
              <Link 
                href="/learn-more" 
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-purple-600 text-purple-600 text-lg font-semibold rounded-lg hover:bg-purple-50 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right side - Image placeholder */}
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-purple-300 rounded-full mx-auto flex items-center justify-center">
                    <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-purple-700">Healthcare Innovation</h3>
                  <p className="text-purple-600">Secure, transparent, and trustworthy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
