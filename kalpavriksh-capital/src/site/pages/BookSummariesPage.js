import React from 'react';
import { contactAction } from '../contactActions';
import { WhatsAppIcon } from '../components/icons';

export default function BookSummariesPage() {
  return (
    <div className="space-y-12 sm:space-y-16 px-3 sm:px-4 py-6 sm:py-8">
      <section className="text-center max-w-4xl mx-auto animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2" style={{ color: '#1E5631' }}>
          📚 Learn With Kalpvriksh Global
        </h1>
        <div className="w-24 sm:w-32 h-1 mx-auto rounded-full mb-4 sm:mb-6 animate-expand-width" style={{ backgroundColor: '#C4A747' }}></div>
        <p className="text-base sm:text-lg md:text-xl text-gray-700 px-2">
          Timeless lessons on wealth building and financial independence
        </p>
      </section>

      {/* Book Summaries */}
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 border-t pt-8" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2" style={{ color: '#1E5631' }}>Book Summaries</h2>
          <div className="w-16 h-1 rounded-full" style={{ backgroundColor: '#C4A747' }}></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
        {/* The Psychology of Money */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-500 transform hover:scale-[1.01] animate-fade-in-up">
          <div className="relative p-6 sm:p-8 text-center overflow-hidden" style={{minHeight: '200px'}}>
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-110"
              style={{
                backgroundImage: 'url(/psychology-of-money-blurred.jpg)',
                opacity: '0.4'
              }}
            ></div>
            <div className="relative z-10">
              <div className="bg-white rounded-xl p-6 mb-4 inline-block shadow-sm transform transition-all duration-500 hover:scale-105 hover:rotate-2">
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-800">The Psychology</h3>
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-800">of Money</h3>
                <p className="text-base sm:text-lg text-gray-600 mt-3">by Morgan Housel</p>
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm sm:text-base text-gray-700 mb-6 leading-relaxed">
              A great book on personal finance which has gained popularity for all the right reasons.
              Profound timeless concepts explained beautifully! This one is going to be around for a while.
            </p>

            <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: '#1E5631' }}>Key Takeaways:</h4>
            <div className="space-y-3 sm:space-y-4">
              {[
                { title: "Savings > Income:", desc: "Higher savings is more important than higher income for wealth generation." },
                { title: "Buy Freedom, Not Things:", desc: "Money can buy possessions or freedom, choose wisely." },
                { title: "Time is Everything:", desc: "The single most powerful thing for wealth is maximizing your time horizon." },
                { title: "Margin of Safety:", desc: "Historical returns are no guarantee, keep a margin of safety when estimating future returns." },
                { title: "Patience Pays:", desc: "Sometimes doing nothing is the hardest but pays the highest dividends." }
              ].map((item, index) => (
                <div
                  key={index}
                  className="border-l-4 pl-4 hover:border-l-8 transition-all duration-300 hover:translate-x-2 animate-slide-in-left"
                  style={{ animationDelay: `${index * 0.1}s`, borderColor: '#1E5631' }}
                >
                  <p className="text-sm sm:text-base text-gray-700"><strong>{item.title}</strong> {item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-xl transform transition-all duration-300 hover:bg-blue-100">
              <p className="text-xs sm:text-sm text-gray-700 italic">
                "Health and money impact everyone and there is no excuse to not learn how to manage these.
                Ignorance is not bliss in money matters."
              </p>
            </div>
          </div>
        </div>

        {/* The Richest Man in Babylon */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-500 transform hover:scale-[1.01] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative p-6 sm:p-8 text-center overflow-hidden" style={{minHeight: '200px'}}>
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-110"
              style={{
                backgroundImage: 'url(/richest-man-babylon-blurred.jpg)',
                opacity: '0.4'
              }}
            ></div>
            <div className="relative z-10">
              <div className="bg-white rounded-xl p-6 mb-4 inline-block shadow-sm transform transition-all duration-500 hover:scale-105 hover:-rotate-2">
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-800">The Richest Man</h3>
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-800">in Babylon</h3>
                <p className="text-base sm:text-lg text-gray-600 mt-3">by George S. Clason</p>
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm sm:text-base text-gray-700 mb-6 leading-relaxed">
              A timeless gem that imparts essential financial wisdom through captivating stories set in ancient Babylon.
              The rules of wealth generation are simple and timeless, relevant from 4000 years ago to today.
            </p>

            <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: '#1E5631' }}>The Seven Laws of Wealth:</h4>
            <div className="space-y-3">
              {[
                { num: "1.", title: "Start thy purse to fattening:", desc: "Save at least 10% of income consistently." },
                { num: "2.", title: "Control thy expenditures:", desc: "Create a budget, prioritize needs over wants." },
                { num: "3.", title: "Make thy gold multiply:", desc: "Invest wisely and diversify your investments." },
                { num: "4.", title: "Guard thy treasures from loss:", desc: "Research thoroughly before investing." },
                { num: "5.", title: "Own thy own home:", desc: "Homeownership can be a valuable asset." },
                { num: "6.", title: "Insure a future income:", desc: "Plan for retirement with regular contributions." },
                { num: "7.", title: "Increase thy ability to earn:", desc: "Continuously improve your skills." }
              ].map((law, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 hover:translate-x-2 transition-transform duration-300 animate-slide-in-right"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="text-lg sm:text-xl mt-1 font-bold" style={{ color: '#1E5631' }}>{law.num}</span>
                  <p className="text-sm sm:text-base text-gray-700"><strong>{law.title}</strong> {law.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-amber-50 p-4 rounded-xl transform transition-all duration-300 hover:bg-amber-100">
              <p className="text-xs sm:text-sm text-gray-700 italic">
                "Over time, delaying gratification of daily desires will lead to long-term joy of building assets and wealth."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Join Our Journey Section */}
      <section className="max-w-4xl mx-auto animate-fade-in-up">
        <div className="rounded-2xl p-8 sm:p-12 shadow-lg text-center" style={{ background: 'linear-gradient(to bottom right, #1E5631, #163822)' }}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Join Our Journey
          </h2>
          <p className="text-lg mb-8" style={{ color: '#F0EBE5' }}>
            Get exclusive updates on events, webinars, articles, and curated insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => contactAction('youtube')}
              className="px-5 py-2.5 rounded-md text-sm font-semibold
                       transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2"
              style={{ backgroundColor: '#FF0000', color: 'white' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#CC0000'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF0000'}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Learn & Grow with Us
            </button>
            <button
              onClick={() => contactAction('whatsapp')}
              className="px-5 py-2.5 rounded-md text-sm font-semibold
                       transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2"
              style={{ backgroundColor: '#25D366', color: 'white' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1DA851'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#25D366'}
            >
              <WhatsAppIcon className="w-4 h-4" />
              Join Our Community
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
