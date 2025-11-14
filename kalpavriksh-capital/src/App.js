import React, { useState, useEffect } from 'react';

const KalpavrikshCapital = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);

  const [companyStats] = useState({
    aum: '50 Crores+',
    clients: '25+', 
    experience: '20+ Years',
    founded: '2024'
  });

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top when changing pages
  const changePage = (page) => {
    setCurrentPage(page);
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle contact actions
  const handleContactAction = (action) => {
    switch(action) {
      case 'email':
        window.location.href = 'mailto:rakhi@kalpavrikshcapital.com?subject=Financial Consultation Inquiry&body=Hi Rakhi,%0A%0AI would like to discuss my financial planning needs.%0A%0ABest regards,';
        break;
      case 'linkedin':
        window.open('https://www.linkedin.com/in/rakhi-jain-7658328/', '_blank');
        break;
      case 'calendar':
        window.open('https://calendly.com/rakhi-jain-fermatprime/30min', '_blank');
        break;
      default:
        break;
    }
  };

  const testimonials = [
    {
      name: "Amarja K Puranand",
      role: "Clean Energy & Marketing Professional",
      rating: 5,
      image: "/testimonials/amarja.jpg",
      content: [
        "I've known Rakhi since our 10+2 days, and one thing that has always stood out is how grounded, pragmatic, and practical she is. These same qualities now shine through in her work as a financial advisor.",
        "Reconnecting with her for financial advice has been a real blessing. She has a clear understanding of different life stages and the kind of financial support needed — both for the present and the future, in alignment with family goals.",
        "What I value most is her transparent approach and her ability to balance portfolios with both caution and opportunity. With Rakhi, you know your financial planning is in steady, trustworthy hands."
      ]
    },
    {
      name: "Hynde El Kaysi",
      role: "Strategic HR Leader | Organizational Transformation Expert",
      rating: 5,
      image: "/testimonials/hynde.jpg",
      content: [
        "Working with Rakhi has been a truly rewarding experience. Her mission to help families take charge of their financial future shines through in everything she does. She guided me with patience and clarity on how and where to invest my savings, always taking time to explain my options and ensure I felt confident about my decisions.",
        "Rakhi's service is warm and highly personalized — she listens carefully, tailors her advice to individual goals, and stays close to her clients with regular check-ins. Her kindness and professionalism create a sense of trust that makes financial planning feel approachable and empowering.",
        "I wholeheartedly recommend Rakhi to anyone looking for a financial advisor who combines expertise, integrity, and genuine care for her clients' success."
      ]
    },
    {
      name: "Sushma Manjunath",
      role: "Director - Supply Chain Finance",
      rating: 5,
      image: "/testimonials/sushma.jpg",
      content: [
        "Working with Rakhi has been truly transformative for me and my family. She helped me unlock my savings potential with clear strategies tailored to my goals, while also bringing full transparency to my net assets.",
        "For the first time, I have complete picture of my financial position, and that clarity has given me the confidence to plan for the future. I value her trust, professionalism, and insight she brings, and I would wholeheartedly recommend Rakhi Jain and her company to anyone looking for a dedicated and transparent wealth advisor."
      ]
    },
    {
      name: "Janani KN",
      role: "Senior Plant Finance Manager - GE Vernova",
      rating: 5,
      image: "/testimonials/janani.jpg",
      content: [
        "I am actually very lucky to have found Rakhi through LinkedIn. I am highly grateful to her for reviewing my family finance portfolio and pointed all the grave mistakes that I was doing without realizing.",
        "This turned out to be a massive game changer for me as I have now started on the path of financial literacy and financial discipline and to do this alongside me. I have a solid partner in Rakhi. She is calm, composed and brings her points assertively in a way which forces you to think but without pressuring you!",
        "Highly recommend her for her financial acumen and for everyone's wealth creation journey!"
      ]
    }
  ];

  const services = [
    {
      icon: "🎯",
      title: "Goal Based Solutions", 
      description: "Structured financial planning for life's important milestones and dreams.",
      features: ["Children's Education", "Dream Home", "Financially Secure Retirement", "Many More Goals"],
      image: "🏠"
    },
    {
      icon: "📈",
      title: "Investments",
      description: "Comprehensive solutions tailored to your investment goals and risk appetite.",
      features: ["India Equity", "International Equity", "Bonds and Debt Funds", "Arbitrage Funds"],
      image: "💰"
    },
    {
      icon: "🛡️",
      title: "Insurance",
      description: "Comprehensive insurance coverage to protect you and your family's financial future.",
      features: ["Term Insurance", "Health Insurance", "Critical Illness Cover", "Disability Cover"],
      image: "🔒"
    },
    {
      icon: "📊",
      title: "Income Tax Planning",
      description: "Strategic tax planning to optimize your savings and maximize returns.",
      features: ["Tax Saving Schemes", "80C Planning", "Tax Optimization"],
      image: "🧮"
    },
    {
      icon: "📋",
      title: "Estate Planning",
      description: "Secure your family's legacy with proper estate and succession planning.",
      features: ["Succession Planning", "Will Drafting", "Estate Management"],
      image: "📄"
    },
    {
      icon: "🎓",
      title: "Learning Academy",
      description: "Educational resources to enhance your financial literacy and investment knowledge.",
      features: ["Blogs/Podcasts", "Annual Events", "Financial Workshops", "Investment Education"],
      image: "📚"
    }
  ];

  const processSteps = [
    {
      number: 1,
      title: "Initial Consultation",
      description: "Understanding your financial goals and current situation"
    },
    {
      number: 2,
      title: "Strategy Development", 
      description: "Creating a personalized financial roadmap"
    },
    {
      number: 3,
      title: "Implementation",
      description: "Executing the plan with careful monitoring"
    },
    {
      number: 4,
      title: "Ongoing Support",
      description: "Regular reviews and adjustments as needed"
    }
  ];

  const workshops = [
    {
      id: 1,
      title: "Financial Literacy Fundamentals",
      duration: "2 Hours",
      level: "Beginner",
      icon: "📚",
      description: "Build a strong foundation in personal finance basics",
      topics: [
        "Understanding income, expenses, and budgeting",
        "The power of compound interest",
        "Building an emergency fund",
        "Introduction to different investment vehicles",
        "Common financial mistakes to avoid"
      ],
      benefits: [
        "Gain confidence in managing your money",
        "Learn to create a realistic budget",
        "Understand the basics of saving and investing"
      ]
    },
    {
      id: 2,
      title: "Smart Investment Strategies",
      duration: "2.5 Hours",
      level: "Intermediate",
      icon: "📈",
      description: "Master the art of building a diversified investment portfolio",
      topics: [
        "Asset allocation and diversification",
        "Mutual funds vs Direct equity",
        "Understanding risk and return",
        "Tax-efficient investing strategies",
        "International investment opportunities"
      ],
      benefits: [
        "Create a balanced investment portfolio",
        "Understand risk management techniques",
        "Learn tax-saving investment strategies"
      ]
    },
    {
      id: 3,
      title: "Retirement Planning Masterclass",
      duration: "2 Hours",
      level: "All Levels",
      icon: "🏖️",
      description: "Design your roadmap to a financially secure retirement",
      topics: [
        "Calculating your retirement corpus",
        "EPF, PPF, NPS - understanding your options",
        "Retirement income strategies",
        "Healthcare planning for retirement",
        "Estate planning basics"
      ],
      benefits: [
        "Know exactly how much you need for retirement",
        "Create a concrete retirement savings plan",
        "Understand post-retirement income sources"
      ]
    },
    {
      id: 4,
      title: "Tax Planning & Optimization",
      duration: "1.5 Hours",
      level: "All Levels",
      icon: "💰",
      description: "Maximize your savings through smart tax planning",
      topics: [
        "Section 80C and beyond - all tax-saving options",
        "Old vs New tax regime comparison",
        "Tax-efficient investment structures",
        "Common tax filing mistakes",
        "Advance tax planning strategies"
      ],
      benefits: [
        "Reduce your tax liability legally",
        "Choose the right tax regime for you",
        "Plan investments for maximum tax benefits"
      ]
    },
    {
      id: 5,
      title: "Insurance & Risk Management",
      duration: "1.5 Hours",
      level: "All Levels",
      icon: "🛡️",
      description: "Protect your family's financial future with proper insurance",
      topics: [
        "Term insurance - how much is enough?",
        "Health insurance planning",
        "Critical illness and disability coverage",
        "Understanding insurance riders",
        "Avoiding common insurance mistakes"
      ],
      benefits: [
        "Ensure adequate family protection",
        "Understand what insurance you really need",
        "Save money by avoiding unnecessary policies"
      ]
    },
    {
      id: 6,
      title: "Women & Money",
      duration: "2 Hours",
      level: "All Levels",
      icon: "👩‍💼",
      description: "Financial empowerment specifically designed for women",
      topics: [
        "Building financial independence",
        "Managing career breaks and finances",
        "Investment planning for women",
        "Estate planning and women's rights",
        "Building confidence in financial decisions"
      ],
      benefits: [
        "Take control of your financial future",
        "Navigate life transitions confidently",
        "Build wealth independently"
      ]
    }
  ];
  
  const FALLBACK_AVATAR =
  'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27%23047857%27%3E%3Ccircle cx=%2712%27 cy=%2712%27 r=%2710%27/%3E%3Cpath d=%27M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2c-3.5 0-6 1.8-6 3v1h12v-1c0-1.2-2.5-3-6-3z%27/%3E%3C/svg%3E';
  
  return (
    <div className="min-h-[100svh] bg-white">
      {/* Navigation - DARK GREEN BACKGROUND */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-lg' : 'shadow-md'
      } backdrop-blur-lg`}  style={{ paddingTop: 'env(safe-area-inset-top)', backgroundColor: '#044226'}}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="/logo-white.png"
                alt="Kalpavriksh Capital Logo"
                className="h-10 sm:h-14 w-auto object-contain transition-transform duration-300 hover:scale-110"
                loading="lazy"
                decoding="async"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <span className="text-sm sm:text-xl font-bold text-white">Kalpavriksh Capital</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex gap-6">
              {['home', 'services', 'workshops', 'testimonials', 'blogs', 'contact'].map((page) => (
                <button
                  key={page}
                  onClick={() => changePage(page)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 transform border-2 ${
                    currentPage === page
                      ? 'bg-white text-green-800 shadow-lg scale-105 border-amber-400'
                      : 'text-white hover:bg-white/20 hover:scale-105 border-amber-400 hover:border-amber-400'
                  }`}
                >
                  {page.charAt(0).toUpperCase() + page.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setNavOpen(!navOpen)}
              className="lg:hidden text-white p-2 rounded-lg hover:bg-white/20 transition-all duration-300 transform active:scale-95"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 transition-transform duration-300" style={{ transform: navOpen ? 'rotate(90deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {navOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Mobile Menu with slide animation */}
          <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            navOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}>
            <div className="pb-4 space-y-2">
              {['home', 'services', 'workshops', 'testimonials', 'blogs', 'contact'].map((page, index) => (
                <button
                  key={page}
                  onClick={() => changePage(page)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:translate-x-2 ${
                    currentPage === page
                      ? 'bg-white text-green-800 shadow-md'
                      : 'text-white hover:bg-white/20'
                  }`}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animation: navOpen ? 'slideInLeft 0.3s ease-out forwards' : 'none'
                  }}
                >
                  {page.charAt(0).toUpperCase() + page.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20">
        {/* Home Page */}
        {currentPage === 'home' && (
          <div className="space-y-16">
            {/* Hero Section with Stats */}
            <section className="bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 py-20 px-4 rounded-3xl mx-4 mt-8 relative overflow-hidden">
              <div className="max-w-4xl mx-auto text-center relative z-10">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-green-800 mb-6 animate-fade-in-up">
                  Welcome to Kalpavriksh Capital
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-green-600 mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  Empowering families to take charge of their financial future
                </p>
                <p className="text-xl text-gray-700 mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  From uncertainty to financial confidence.
                </p>
                
                {/* Company Stats with stagger animation */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  {[
                    { value: companyStats.aum, label: 'AUM' },
                    { value: companyStats.clients, label: 'Total Clients' },
                    { value: companyStats.experience, label: 'Experience' },
                    { value: companyStats.founded, label: 'Founded' }
                  ].map((stat, index) => (
                    <div 
                      key={index}
                      className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300 animate-fade-in-up cursor-pointer"
                      style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                    >
                      <div className="text-3xl font-bold text-green-800 animate-count-up">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => changePage('services')}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full text-lg font-semibold 
                           transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl
                           flex items-center gap-3 mx-auto animate-fade-in-up hover:gap-4"
                  style={{ animationDelay: '1s' }}
                >
                  <span className="text-2xl">📊</span> Explore Our Services
                </button>
              </div>
              
              {/* Animated Floating Elements */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-green-300 rounded-full animate-float opacity-60"></div>
                <div className="absolute top-3/4 right-1/4 w-6 h-6 bg-green-400 rounded-full animate-float-delayed opacity-50"></div>
                <div className="absolute bottom-1/4 left-3/4 w-3 h-3 bg-green-500 rounded-full animate-float-slow opacity-40"></div>
                <div className="absolute top-1/2 left-1/3 w-5 h-5 bg-emerald-300 rounded-full animate-float opacity-30"></div>
              </div>
              
              {/* Gradient overlay animation */}
              <div className="absolute inset-0 bg-gradient-to-tr from-green-200/20 to-transparent animate-pulse-slow pointer-events-none"></div>
            </section>

            {/* About Rakhi Section */}
            <section className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-12 animate-fade-in-up">
                <h2 className="text-4xl font-bold text-green-800 mb-4 flex items-center justify-center gap-3">
                  <img
                    src="/profile-rakhi.png"
                    alt="Rakhi Jain"
                    className="w-16 h-16 rounded-full object-cover border-2 border-green-600 animate-fade-in-scale"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  /> Meet Rakhi Jain
                </h2>
                <div className="w-24 h-1 bg-green-600 mx-auto rounded-full animate-expand-width"></div>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
                <h3 className="text-3xl font-bold text-green-700 text-center mb-4 animate-fade-in-up">
                  Founder & Principal Advisor
                </h3>
                <p className="text-xl text-center text-gray-700 mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  Gold Medalist Chartered Accountant with 18+ years of strategic finance leadership at Unilever, 
                  specializing in business finance, performance management, and transformational programs.
                </p>
                
                {/* My Story Section */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <h4 className="text-2xl font-bold text-green-800 mb-4 text-center">My Story</h4>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      My journey began in 2002 as a Business Leadership Trainee at Hindustan Unilever, where I 
                      progressively grew through diverse roles across business finance, controlling, and strategic 
                      program management. Over 18+ years, I've had the privilege of leading transformational 
                      initiatives—from managing €3.8bn businesses across Middle East and North Africa to directing 
                      the Fuel for Growth program delivering €2bn annual savings globally.
                    </p>
                    <p>
                      Throughout my corporate career, I witnessed a recurring theme: financial complexity often 
                      creates barriers rather than clarity. Whether managing billion-euro budgets or negotiating 
                      strategic supplier deals, I learned that sound financial principles remain the same—it's 
                      about discipline, planning, and making informed decisions. This insight inspired me to 
                      democratize wealth management for families who deserve the same strategic approach.
                    </p>
                    <p>
                      I founded Kalpavriksh Capital to bring corporate finance discipline to personal wealth 
                      management. My mission is simple: empower every family with clarity, confidence, and control 
                      over their financial future. Whether you're planning your child's education, securing 
                      retirement, or simply seeking financial peace of mind, I bring the same rigor and care I 
                      applied to billion-euro programs—now dedicated to your family's success.
                    </p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                  {[
                    { 
                      icon: "🏆", 
                      title: "Award-Winning Excellence", 
                      desc: "Global Olympiad Gold Medal & Finance Hall of Fame Winner" 
                    },
                    { 
                      icon: "💼", 
                      title: "Proven Leadership", 
                      desc: "Led €2bn+ strategic programs and business transformations" 
                    },
                    { 
                      icon: "🎯", 
                      title: "Your Partner", 
                      desc: "Bringing corporate finance rigor to your family's wealth journey" 
                    }
                  ].map((item, index) => (
                    <div 
                      key={index} 
                      className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 shadow-sm hover:shadow-xl animate-fade-in-up cursor-pointer"
                      style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                    >
                      <div className="text-4xl mb-4 transform transition-transform duration-300 hover:scale-125 hover:rotate-12">{item.icon}</div>
                      <h4 className="text-xl font-semibold text-green-800 mb-2">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Services Page */}
        {currentPage === 'services' && (
          <div className="space-y-16 px-4 py-8">
            <section className="text-center max-w-4xl mx-auto animate-fade-in-up">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-800 mb-6 flex items-center justify-center gap-4">
                <span className="animate-bounce-slow">💼</span> Our Services
              </h1>
              <div className="w-32 h-1 bg-green-600 mx-auto rounded-full mb-6 animate-expand-width"></div>
              <p className="text-xl text-gray-700">
                Comprehensive wealth management solutions tailored for your success
              </p>
            </section>
            
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div 
                  key={index} 
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 border-t-4 border-amber-400 animate-fade-in-up cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-center mb-6">
                    <div className="text-4xl sm:text-5xl md:text-6xl mb-4 transform transition-transform duration-300 hover:scale-125 hover:rotate-12">{service.icon}</div>
                    <h3 className="text-2xl font-bold text-green-800">{service.title}</h3>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed text-center">{service.description}</p>
                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 hover:translate-x-2 transition-transform duration-300">
                        <span className="text-green-500 text-lg">✓</span>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <section className="max-w-6xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-green-800 mb-12 animate-fade-in-up">Our Process</h2>
              <div className="grid md:grid-cols-4 gap-8">
                {processSteps.map((step, index) => (
                  <div 
                    key={index} 
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in-up cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 transform transition-all duration-300 hover:rotate-360 hover:bg-green-700">
                      {step.number}
                    </div>
                    <h4 className="text-xl font-semibold text-green-800 mb-2">{step.title}</h4>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
        {/* Workshops Page */}
        {currentPage === 'workshops' && (
          <div className="space-y-12 px-4 py-8 max-w-7xl mx-auto">
            <section className="text-center max-w-3xl mx-auto animate-fade-in-up">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-800 mb-4">
                Financial Literacy Workshops
              </h1>
              <div className="w-24 h-1 bg-green-600 mx-auto rounded-full mb-6 animate-expand-width"></div>
              <p className="text-lg sm:text-xl text-gray-700">
                Empowering you with knowledge to make confident financial decisions
              </p>
            </section>

            {/* Why Attend Section - Simplified */}
            <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 sm:p-8 shadow-sm animate-fade-in-up">
              <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-6 text-center">Why Attend?</h2>
              <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
                {[
                  { title: "Expert Guidance", desc: "20+ years experience" },
                  { title: "Practical Knowledge", desc: "Actionable strategies" },
                  { title: "Interactive Learning", desc: "Q&A and case studies" }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="bg-white p-4 sm:p-6 rounded-2xl text-center transform hover:scale-105 transition-all duration-300 shadow-sm animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <h3 className="text-lg font-bold text-green-800 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Workshop Offerings - Clean Cards */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-6 text-center animate-fade-in-up">Workshop Topics</h2>
              <div className="space-y-6">
                {workshops.map((workshop, index) => (
                  <div 
                    key={workshop.id}
                    className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
                            {workshop.icon}
                          </div>
                          <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-green-800">{workshop.title}</h3>
                            <p className="text-sm text-gray-600">{workshop.duration} • {workshop.level}</p>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-6">{workshop.description}</p>
                      
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-green-800 mb-3">What You'll Learn:</h4>
                          <ul className="space-y-2">
                            {workshop.topics.slice(0, 3).map((topic, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-green-600 mt-0.5">✓</span>
                                <span>{topic}</span>
                              </li>
                            ))}
                            {workshop.topics.length > 3 && (
                              <li className="text-sm text-gray-500 italic">+ {workshop.topics.length - 3} more topics</li>
                            )}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-bold text-green-800 mb-3">Key Benefits:</h4>
                          <ul className="space-y-2">
                            {workshop.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-amber-500 mt-0.5">★</span>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedWorkshop(workshop);
                          handleContactAction('calendar');
                        }}
                        className="mt-6 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-2xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-md"
                      >
                        Register Your Interest
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Workshop Format - Horizontal Flow */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm animate-fade-in-up">
              <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-6 text-center">How It Works</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { step: "1", title: "Register", desc: "Book your spot" },
                  { step: "2", title: "Prepare", desc: "Get materials" },
                  { step: "3", title: "Attend", desc: "Live session" },
                  { step: "4", title: "Follow-up", desc: "Resources & support" }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                      {item.step}
                    </div>
                    <h4 className="font-semibold text-green-800 mb-1 text-sm sm:text-base">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Delivery Options - Compact */}
            <section className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm animate-fade-in-up">
              <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-6 text-center">Flexible Options</h2>
              <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
                {[
                  { title: "Corporate", desc: "Customized for teams" },
                  { title: "Group", desc: "8-12 participants" },
                  { title: "Online", desc: "Attend anywhere" }
                ].map((option, index) => (
                  <div 
                    key={index}
                    className="bg-white p-4 sm:p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <h3 className="text-lg font-bold text-green-800 mb-2">{option.title}</h3>
                    <p className="text-sm text-gray-600">{option.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA - Streamlined */}
            <section className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-3xl p-6 sm:p-10 text-white text-center shadow-lg animate-fade-in-up">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg sm:text-xl mb-6 text-green-100">
                Schedule a consultation or inquire about workshops
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => handleContactAction('calendar')}
                  className="bg-white text-green-600 px-6 py-3 rounded-2xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-md"
                >
                  📅 Schedule a Call
                </button>
                <button
                  onClick={() => handleContactAction('email')}
                  className="bg-amber-400 text-green-800 px-6 py-3 rounded-2xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-md"
                >
                  📧 Get Info
                </button>
              </div>
            </section>
          </div>
        )}
        {/* Testimonials Page */}
        {currentPage === 'testimonials' && (
          <div className="space-y-16 px-4 py-8">
            <section className="text-center max-w-4xl mx-auto animate-fade-in-up">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-800 mb-6 flex items-center justify-center gap-4">
                <span className="animate-bounce-slow">💬</span> Client Testimonials
              </h1>
              <div className="w-32 h-1 bg-green-600 mx-auto rounded-full mb-6 animate-expand-width"></div>
              <p className="text-xl text-gray-700">
                See what our clients say about their journey to financial independence
              </p>
            </section>
            
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border-t-4 border-amber-400 transform hover:scale-[1.02] animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-green-600 transform transition-transform duration-300 hover:scale-110"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_AVATAR;
                        }}
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h4 className="text-xl font-bold text-green-800">{testimonial.name}</h4>
                          <p className="text-gray-600 text-sm">{testimonial.role}</p>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <span 
                              key={i} 
                              className="text-amber-400 text-xl animate-fade-in-scale"
                              style={{ animationDelay: `${i * 0.1}s` }}
                            >⭐</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {testimonial.content.map((paragraph, idx) => (
                      <p 
                        key={idx} 
                        className="text-gray-700 italic leading-relaxed animate-fade-in-up"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blogs Page */}
        {currentPage === 'blogs' && (
          <div className="space-y-16 px-4 py-8">
            <section className="text-center max-w-4xl mx-auto animate-fade-in-up">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-800 mb-6 flex items-center justify-center gap-4">
                <span className="animate-bounce-slow">📚</span> Financial Wisdom
              </h1>
              <div className="w-32 h-1 bg-green-600 mx-auto rounded-full mb-6 animate-expand-width"></div>
              <p className="text-xl text-gray-700">
                Timeless lessons from classic books on wealth building and financial independence
              </p>
            </section>
            
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
              {/* The Psychology of Money */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] animate-fade-in-up">
                <div className="relative p-8 text-center overflow-hidden" style={{minHeight: '300px'}}>
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-110"
                    style={{
                      backgroundImage: 'url(/psychology-of-money-blurred.jpg)',
                      opacity: '0.4'
                    }}
                  ></div>
                  <div className="relative z-10">
                    <div className="bg-white rounded-xl p-6 mb-4 inline-block shadow-lg transform transition-all duration-500 hover:scale-105 hover:rotate-2">
                      <h3 className="text-2xl font-bold text-gray-800">The Psychology</h3>
                      <h3 className="text-2xl font-bold text-gray-800">of Money</h3>
                      <p className="text-sm text-gray-600 mt-2">by Morgan Housel</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    A great book on personal finance which has gained popularity for all the right reasons. 
                    Profound timeless concepts explained beautifully — this one is going to be around for a while.
                  </p>
                  
                  <h4 className="text-xl font-bold text-green-800 mb-4">Key Takeaways:</h4>
                  <div className="space-y-4">
                    {[
                      { title: "Savings > Income:", desc: "Higher savings is more important than higher income for wealth generation." },
                      { title: "Buy Freedom, Not Things:", desc: "Money can buy possessions or freedom — choose wisely." },
                      { title: "Time is Everything:", desc: "The single most powerful thing for wealth is maximizing your time horizon." },
                      { title: "Margin of Safety:", desc: "Historical returns are no guarantee — keep a margin of safety when estimating future returns." },
                      { title: "Patience Pays:", desc: "Sometimes doing nothing is the hardest but pays the highest dividends." }
                    ].map((item, index) => (
                      <div 
                        key={index}
                        className="border-l-4 border-green-500 pl-4 hover:border-l-8 transition-all duration-300 hover:translate-x-2 animate-slide-in-left"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <p className="text-gray-700"><strong>{item.title}</strong> {item.desc}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 bg-blue-50 p-4 rounded-xl transform transition-all duration-300 hover:bg-blue-100">
                    <p className="text-sm text-gray-700 italic">
                      "Health and money impact everyone and there is no excuse to not learn how to manage these. 
                      Ignorance is not bliss in money matters."
                    </p>
                  </div>
                </div>
              </div>

              {/* The Richest Man in Babylon */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="relative p-8 text-center overflow-hidden" style={{minHeight: '300px'}}>
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-110"
                    style={{
                      backgroundImage: 'url(/richest-man-babylon-blurred.jpg)',
                      opacity: '0.4'
                    }}
                  ></div>
                  <div className="relative z-10">
                    <div className="bg-white rounded-xl p-6 mb-4 inline-block shadow-lg transform transition-all duration-500 hover:scale-105 hover:-rotate-2">
                      <h3 className="text-2xl font-bold text-gray-800">The Richest Man</h3>
                      <h3 className="text-2xl font-bold text-gray-800">in Babylon</h3>
                      <p className="text-sm text-gray-600 mt-2">by George S. Clason</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    A timeless gem that imparts essential financial wisdom through captivating stories set in ancient Babylon. 
                    The rules of wealth generation are simple and timeless — relevant from 4000 years ago to today.
                  </p>
                  
                  <h4 className="text-xl font-bold text-green-800 mb-4">The Seven Laws of Wealth:</h4>
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
                        <span className="text-green-600 text-xl mt-1 font-bold">{law.num}</span>
                        <p className="text-gray-700"><strong>{law.title}</strong> {law.desc}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 bg-amber-50 p-4 rounded-xl transform transition-all duration-300 hover:bg-amber-100">
                    <p className="text-sm text-gray-700 italic">
                      "Over time, delaying gratification of daily desires will lead to long-term joy of building assets and wealth."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Page */}
        {currentPage === 'contact' && (
          <div className="space-y-16 px-4 py-8">
            <section className="text-center max-w-4xl mx-auto animate-fade-in-up">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-800 mb-6 flex items-center justify-center gap-4">
                <span className="animate-bounce-slow">📧</span> Get In Touch
              </h1>
              <div className="w-32 h-1 bg-green-600 mx-auto rounded-full mb-6 animate-expand-width"></div>
              <p className="text-xl text-gray-700">
                Ready to start your journey towards financial independence? Let's connect!
              </p>
              
              <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-md transform hover:scale-[1.02] transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <p className="text-lg sm:text-xl md:text-2xl font-serif italic text-green-800 mb-3">
                  "Being rich is having money, being wealthy is having time"
                </p>
                <p className="text-lg text-gray-600">- Unknown</p>
              </div>
            </section>
            
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl p-10 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-bold text-green-800 mb-4 flex items-center justify-center gap-3">
                    <span className="animate-bounce-slow">💬</span> Let's Start Your Financial Journey
                  </h2>
                  <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                    I'm here to help you take control of your financial future. Whether you're just starting 
                    your investment journey or looking to optimize your existing portfolio, let's discuss 
                    how we can work together.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  {[
                    { action: 'calendar', icon: '📅', text: 'Book Free Consultation', color: 'bg-green-600 hover:bg-green-700' },
                    { action: 'email', icon: '📧', text: 'Send Email', color: 'bg-white hover:bg-gray-50 text-green-600 border-2 border-green-600' },
                    { action: 'linkedin', icon: 'linkedin', text: 'Connect on LinkedIn', color: 'bg-blue-600 hover:bg-blue-700' }
                  ].map((btn, index) => (
                    <button
                      key={index}
                      onClick={() => handleContactAction(btn.action)}
                      className={`${btn.color} ${btn.action === 'email' ? '' : 'text-white'} px-6 py-5 rounded-xl text-lg font-semibold 
                               transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl
                               flex flex-col items-center justify-center gap-3 animate-fade-in-up hover:-translate-y-2`}
                      style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                    >
                      {btn.icon === 'linkedin' ? (
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      ) : (
                        <span className="text-4xl">{btn.icon}</span>
                      )}
                      <span>{btn.text}</span>
                    </button>
                  ))}
                </div>

                <div className="text-center mt-8 pt-8 border-t border-gray-200 animate-fade-in-up" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <img
                      src="/logo.png"
                      alt="Kalpavriksh Capital Logo"
                      className="h-20 w-auto object-contain transform transition-transform duration-300 hover:scale-110"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <span className="text-2xl font-bold text-green-700">Kalpavriksh Capital</span>
                  </div>
                  <p className="text-gray-600">Investment Advisory Services</p>
                  <p className="text-sm text-gray-500 mt-2">Founded 2024 by Rakhi Jain • 20+ Years Experience • Chartered Accountant</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-white py-12 mt-16" style={{ paddingBottom: 'env(safe-area-inset-bottom)', backgroundColor: '#044226'}}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/logo-white.png"
                  alt="Kalpavriksh Capital Logo"
                  className="h-16 w-auto object-contain transform transition-transform duration-300 hover:scale-110"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span className="text-2xl font-bold text-white">Kalpavriksh Capital</span>
              </div>
              <p className="text-white mb-4">Empowering families towards financial independence</p>
              <div className="text-sm text-white">
                <p>📧 rakhi@kalpavrikshcapital.com</p>
              </div>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h4 className="text-xl font-semibold mb-4 text-amber-400">Quick Links</h4>
              <div className="space-y-2">
                {['Home', 'Services', 'Workshops', 'Testimonials', 'Blogs', 'Contact'].map((link) => (
                  <button
                    key={link}
                    onClick={() => changePage(link.toLowerCase())}
                    className="block text-white hover:text-amber-400 transition-all duration-200 hover:translate-x-2"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h4 className="text-xl font-semibold mb-4 text-amber-400">Services</h4>
              <div className="space-y-2 text-white text-sm">
                <p className="hover:translate-x-2 transition-transform duration-200">• Investments & Mutual Funds</p>
                <p className="hover:translate-x-2 transition-transform duration-200">• Goal Based Solutions</p>
                <p className="hover:translate-x-2 transition-transform duration-200">• Insurance Planning</p>
                <p className="hover:translate-x-2 transition-transform duration-200">• Tax & Estate Planning</p>
                <p className="hover:translate-x-2 transition-transform duration-200">• Learning Academy</p>
              </div>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h4 className="text-xl font-semibold mb-4 text-amber-400">Professional Info</h4>
              <div className="space-y-2 text-white text-sm">
                <p className="hover:translate-x-2 transition-transform duration-200">• Gold Medalist CA</p>
                <p className="hover:translate-x-2 transition-transform duration-200">• Chartered Wealth Manager</p>
                <p className="hover:translate-x-2 transition-transform duration-200">• 20+ Years Experience</p>
                <p className="hover:translate-x-2 transition-transform duration-200">• Unilever Background</p>
              </div>
            </div>
          </div>
          <div className="border-t border-green-700 pt-8 text-center text-white">
            <p className="mb-2">
              <strong className="text-amber-400">Kalpavriksh Capital</strong> | Founded 2024 by Rakhi Jain
            </p>
            <p className="text-sm text-white">
              Investment Advisory Services | © 2024 Kalpavriksh Capital. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes expandWidth {
          from {
            width: 0;
          }
          to {
            width: 6rem;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        
        @keyframes floatDelayed {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-25px) translateX(-10px);
          }
        }
        
        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-15px) translateX(15px);
          }
        }
        
        @keyframes pulseSlow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes bounceSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes rotate360 {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in-scale {
          animation: fadeInScale 0.6s ease-out forwards;
        }
        
        .animate-fade-in-left {
          animation: fadeInLeft 0.6s ease-out forwards;
        }
        
        .animate-fade-in-right {
          animation: fadeInRight 0.6s ease-out forwards;
        }
        
        .animate-slide-in-left {
          animation: slideInLeft 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-expand-width {
          animation: expandWidth 0.8s ease-out forwards;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: floatDelayed 4s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: floatSlow 5s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulseSlow 3s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounceSlow 2s ease-in-out infinite;
        }
        
        .hover\:rotate-360:hover {
          animation: rotate360 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default KalpavrikshCapital;