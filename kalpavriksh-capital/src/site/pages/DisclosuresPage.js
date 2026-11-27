import React from 'react';

export default function DisclosuresPage() {
  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 md:p-12 shadow-sm">
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b-2" style={{ borderColor: '#C4A747' }}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1E5631' }}>
            Disclosures & Regulatory Information
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Clarity and transparency guide every interaction at Kalpvriksh Global.
          </p>
        </div>

        {/* Continuous document content */}
        <div className="space-y-8 text-sm sm:text-base text-gray-700 leading-relaxed">
          {/* 1. AMFI Registration */}
          <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: '#1E5631' }}>
            1. AMFI Registration (India)
          </h2>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#C4A747' }}>
            Mutual Fund Distribution Under Indian Regulations
          </h3>
          <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
            <p>
              Kalpvriksh Global / Rakhi Jain is an <strong>AMFI-Registered Mutual Fund Distributor (ARN-313560)</strong>.
            </p>
            <div>
              <p className="font-semibold mb-2">We distribute:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>India-domiciled mutual funds</li>
                <li>GIFT City mutual funds</li>
              </ul>
              <p className="mt-2">These services are offered exclusively under Indian regulatory frameworks.</p>
            </div>
            <div>
              <p className="font-semibold">Compensation:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>We receive commissions from Asset Management Companies (AMCs).</li>
                <li>No advisory fee is charged for mutual fund execution.</li>
              </ul>
            </div>
            <div className="bg-yellow-50 border-l-4 p-4 rounded" style={{ borderColor: '#C4A747' }}>
              <p className="font-semibold">Risk Disclosure:</p>
              <p className="mt-2">Mutual fund investments are subject to market risks. Past performance is not indicative of future results. Please read all scheme-related documents carefully before investing.</p>
            </div>
          </div>
        </div>

        {/* 2. Services for UAE Residents */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: '#1E5631' }}>
            2. Services for UAE Residents & Global Clients
          </h2>
          <h3 className="text-base font-semibold mb-2" style={{ color: '#C4A747' }}>
            Education-led, conflict-free guidance
          </h3>
          <div className="space-y-3">
            <p>
              <strong>Kalpvriksh Global does not hold a UAE regulatory license.</strong>
            </p>
            <div>
              <p className="font-semibold mb-2">For clients based in the UAE and globally, we offer:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Financial education</li>
                <li>Planning frameworks</li>
                <li>Goal-setting support</li>
                <li>Asset allocation principles</li>
                <li>Workshops & learning programs</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">We do not:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Provide regulated investment advisory</li>
                <li>Offer portfolio management</li>
                <li>Distribute UAE-regulated financial products</li>
                <li>Execute investments on behalf of clients</li>
              </ul>
            </div>
            <p className="italic">
              UAE residents may invest in India-regulated mutual funds at their own discretion.
            </p>
          </div>
        </div>

        {/* 3. Nature of Information */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: '#1E5631' }}>
            3. Nature of Information Provided
          </h2>
          <h3 className="text-base font-semibold mb-2" style={{ color: '#C4A747' }}>
            Educational. Informational. Not advisory.
          </h3>
          <div className="space-y-3">
            <div>
              <p className="mb-2">All content shared through:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>This website</li>
                <li>Workshops</li>
                <li>Consultations</li>
                <li>Learning materials</li>
              </ul>
              <p className="mt-2">...is intended solely for <strong>educational and informational purposes</strong>.</p>
            </div>
            <div>
              <p className="font-semibold mb-2">It should not be interpreted as:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Personalized investment advice</li>
                <li>A recommendation to buy or sell any financial product</li>
                <li>Legal, tax, or accounting advice</li>
              </ul>
            </div>
            <p className="font-semibold">
              Clients should consult licensed professionals before making investment decisions.
            </p>
          </div>
        </div>

        {/* 4. Conflict of Interest */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: '#1E5631' }}>
            4. Conflict-of-Interest Transparency
          </h2>
          <h3 className="text-base font-semibold mb-2" style={{ color: '#C4A747' }}>
            Integrity is our foundation.
          </h3>
          <div className="space-y-3">
            <p className="text-lg font-medium" style={{ color: '#1E5631' }}>
              Our philosophy is simple: <em>If we wouldn't invest in it ourselves, we won't recommend it to you.</em>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>All recommendations are research-driven</li>
              <li>Every suggestion aligns with your goals</li>
              <li>Any commissions earned (India only) are disclosed transparently</li>
            </ul>
            <p className="italic">
              This is the heart of our boutique, founder-led approach.
            </p>
          </div>
        </div>

        {/* 5. Cross-Border Services */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: '#1E5631' }}>
            5. Cross-Border Services
          </h2>
          <h3 className="text-base font-semibold mb-2" style={{ color: '#C4A747' }}>
            Aligned with local regulations
          </h3>
          <div className="space-y-3">
            <p className="font-semibold">Our services differ by jurisdiction:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>India:</strong> Mutual fund distribution + financial education</li>
              <li><strong>UAE & Global:</strong> Financial education, planning frameworks, workshops only</li>
            </ul>
            <p>
              We comply fully with the regulations of each region we operate in.
            </p>
          </div>
        </div>

        {/* 6. Data & Privacy */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: '#1E5631' }}>
            6. Data & Privacy
          </h2>
          <h3 className="text-base font-semibold mb-2" style={{ color: '#C4A747' }}>
            Your information stays confidential.
          </h3>
          <p>
            We maintain strict confidentiality of all client information.
          </p>
        </div>

        {/* 7. Website Use Disclaimer */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: '#1E5631' }}>
            7. Website Use Disclaimer
          </h2>
          <h3 className="text-base font-semibold mb-2" style={{ color: '#C4A747' }}>
            Use of information
          </h3>
          <div className="space-y-3">
            <p>
              All content on this website is provided "as is" without warranties of any kind.
            </p>
            <p>
              Kalpvriksh Global is not responsible for decisions made based on this information.
            </p>
          </div>
        </div>

          {/* 8. Contact */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: '#1E5631' }}>
              8. Contact
            </h2>
            <h3 className="text-base font-semibold mb-2" style={{ color: '#C4A747' }}>
              We're here to help.
            </h3>
            <p>
              For questions regarding these disclosures, please write to:
            </p>
            <p className="font-semibold mt-2" style={{ color: '#1E5631' }}>
              📧 info@kalpvrikshglobal.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
