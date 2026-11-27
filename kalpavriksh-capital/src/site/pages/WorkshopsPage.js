import React from 'react';
import { contactAction } from '../contactActions';

export default function WorkshopsPage() {
  return (
    <div className="space-y-12 px-4 py-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1E5631' }}>
          Beyond Returns – The Art of Building Wealth with Intention
        </h1>
        <div className="w-24 h-1 mx-auto rounded-full mb-6 animate-expand-width" style={{ backgroundColor: '#C4A747' }}></div>
        <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-8">
          A signature workshop that helps families and professionals move beyond chasing returns to building wealth with clarity, discipline, and purpose.
        </p>
      </section>

      {/* Workshop Overview */}
      <section className="bg-white rounded-xl p-6 sm:p-8 shadow-sm animate-fade-in-up">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-center" style={{ color: '#1E5631' }}>Workshop Overview</h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-700 text-center max-w-3xl mx-auto leading-relaxed">
          This interactive session reframes wealth as purchasing power and freedom of choice. Using real-life scenarios, asset allocation frameworks, and the power of compounding, Rakhi Jain guides you to design a financial journey that reflects your goals and values.
        </p>
      </section>

      {/* Key Outcomes */}
      <section>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-8 text-center animate-fade-in-up" style={{ color: '#1E5631' }}>Key Outcomes</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: "🎯",
              title: "Redefine Wealth with Intention",
              desc: "Understand wealth as purchasing power and freedom of choice, beyond chasing returns—so every financial decision aligns with your life goals and values."
            },
            {
              icon: "📊",
              title: "Master Asset Allocation & Compounding",
              desc: "Learn how to balance equities, debt, gold, and real estate to beat inflation, diversify risk, and harness the power of compounding for long-term growth."
            },
            {
              icon: "🛡️",
              title: "Secure Your Family's Future",
              desc: "Gain practical tools for estate planning, risk management, and disciplined investing—ensuring clarity, confidence, and peace of mind across generations."
            }
          ].map((outcome, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-500 transform hover:scale-105 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl sm:text-5xl mb-4 text-center">{outcome.icon}</div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-center" style={{ color: '#1E5631' }}>{outcome.title}</h3>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed text-center">{outcome.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workshop Flow */}
      <section className="animate-fade-in-up">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-8 sm:mb-12 text-center" style={{ color: '#1E5631' }}>Workshop Flow</h2>
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 hidden sm:block" style={{ backgroundColor: '#C4A747', opacity: 0.3 }}></div>

          <div className="space-y-6 sm:space-y-8">
            {[
              { title: "What is Wealth?", desc: "Purchasing power & inflation awareness" },
              { title: "Levers of Wealth Creation", desc: "Income, savings, compounding" },
              { title: "Asset Classes & Allocation", desc: "Equity, debt, gold, real estate" },
              { title: "Behavioural Pitfalls", desc: "What not to invest in" },
              { title: "Estate Planning", desc: "Protecting family legacy" },
              { title: "Action Step", desc: "Define one key move towards your wealth journey" }
            ].map((step, index) => (
              <div
                key={index}
                className="relative flex items-start gap-4 sm:gap-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Number Badge */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                       style={{ backgroundColor: '#1E5631' }}>
                    {index + 1}
                  </div>
                  {/* Pulse ring */}
                  <div className="absolute inset-0 rounded-full animate-pulse"
                       style={{ backgroundColor: '#C4A747', opacity: 0.2 }}></div>
                </div>

                {/* Content Card */}
                <div className="flex-1 bg-white p-4 sm:p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2"
                     style={{ borderColor: '#E5E7EB' }}>
                  <h4 className="font-bold mb-2 text-base sm:text-lg md:text-xl" style={{ color: '#1E5631' }}>
                    {step.title}
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Buttons */}
      <section className="max-w-5xl mx-auto animate-fade-in-up">
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-start">
          <div className="flex-1 text-center">
            <button
              onClick={() => contactAction('whatsapp')}
              className="text-white px-8 py-4 rounded-full text-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl w-full sm:w-auto"
              style={{ backgroundColor: '#25D366' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1EBE57'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#25D366'}
            >
              Join Our WhatsApp Community
            </button>
            <p className="text-sm text-gray-600 mt-3 px-4">
              Get financial insights, workshop updates, and connect with like-minded families on their wealth-building journey
            </p>
          </div>
          <div className="flex-1 text-center">
            <button
              onClick={() => contactAction('calendar')}
              className="px-8 py-4 rounded-full text-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border-2 w-full sm:w-auto"
              style={{ backgroundColor: 'white', color: '#1E5631', borderColor: '#1E5631' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E5631'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#1E5631'; }}
            >
              Schedule a 30-Minute Discovery Call
            </button>
            <p className="text-sm text-gray-600 mt-3 px-4">
              Interested in a custom workshop for your organization or team? Let's discuss how we can tailor it to your needs
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
