import React, { useState, useEffect } from 'react';

const KalpavrikshCapital = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const isTransitioning = React.useRef(false);

  // Page order for infinite scrolling
  const pageOrder = ['home', 'services', 'workshops', 'testimonials', 'blogs', 'contact', 'disclosures'];

  // Reset transition flag when page changes
  useEffect(() => {
    isTransitioning.current = false;
  }, [currentPage]);

  // Handle scroll effect for navbar and infinite scroll
  useEffect(() => {
    let scrollTimeout;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Calculate scroll progress
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);

      // Clear previous timeout to debounce
      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        if (isTransitioning.current) return;

        const scrollPosition = window.innerHeight + window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;

        // Scroll down to next page (within 5px threshold from bottom - very bottom)
        if (scrollPosition >= documentHeight - 5) {
          const currentIndex = pageOrder.indexOf(currentPage);
          if (currentIndex < pageOrder.length - 1) {
            isTransitioning.current = true;
            const nextPage = pageOrder[currentIndex + 1];
            setCurrentPage(nextPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }, 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentPage, pageOrder]);

  // Auto-play testimonials carousel on home page
  useEffect(() => {
    if (currentPage === 'home' && !isAutoScrollPaused) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [currentPage, currentTestimonial, isAutoScrollPaused]);

  // Auto-restart after pause (5 seconds after user interaction)
  useEffect(() => {
    if (isAutoScrollPaused) {
      const timer = setTimeout(() => {
        setIsAutoScrollPaused(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isAutoScrollPaused]);

  // Handle browser back button - go to home instead of closing
  useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault();
      setCurrentPage('home');
      window.scrollTo(0, 0);
    };

    // Push initial state
    window.history.pushState({ page: currentPage }, '', '');

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Scroll to top when changing pages
  const changePage = (page) => {
    setCurrentPage(page);
    setNavOpen(false);
    window.scrollTo(0, 0);
    // Push state for browser navigation
    window.history.pushState({ page: page }, '', '');
  };

  // Handle testimonial navigation with pause/restart
  const handleTestimonialNav = (direction) => {
    setIsAutoScrollPaused(true);
    if (direction === 'prev') {
      setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    } else if (direction === 'next') {
      setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    } else {
      setCurrentTestimonial(direction); // Direct index
    }
  };

  // Handle contact actions
  const handleContactAction = (action) => {
    switch(action) {
      case 'email':
        window.location.href = 'mailto:rakhijain@kalpavrikshglobal.com?subject=Financial Consultation Inquiry&body=Hi Rakhi,%0A%0AI would like to discuss my financial planning needs.%0A%0ABest regards,';
        break;
      case 'linkedin':
        window.open('https://www.linkedin.com/in/rakhi-jain-7658328/', '_blank');
        break;
      case 'calendar':
        window.open('https://calendly.com/rakhi-jain-fermatprime/30min', '_blank');
        break;
      case 'youtube':
        window.open('http://www.youtube.com/@RakhiJain-i59', '_blank');
        break;
      case 'whatsapp':
        window.open('https://wa.me/917899841847', '_blank');
        break;
      default:
        break;
    }
  };

  const testimonials = [
    {
      name: "Amarja K Puranam,",
      role: "Founder & Chief Storyteller - Coconut Thinking",
      rating: 5,
      image: "/testimonials/amarja.jpg",
      content: [
        "I've known Rakhi since our 10+2 days, and one thing that has always stood out is how grounded, pragmatic, and practical she is. These same qualities now shine through in her work as a financial advisor.",
        "Reconnecting with her for financial advice has been a real blessing. She has a clear understanding of different life stages and the kind of financial support needed both for the present and the future, in alignment with family goals.",
        "What I value most is her transparent approach and her ability to balance portfolios with both caution and opportunity. With Rakhi, you know your financial planning is in steady, trustworthy hands."
      ]
    },
    {
      name: "Hynde El Kaysi",
      role: "Strategic HR Leader | Ex Unilever",
      rating: 5,
      image: "/testimonials/hynde.jpg",
      content: [
        "Working with Rakhi has been a truly rewarding experience. Her mission to help families take charge of their financial future shines through in everything she does. She guided me with patience and clarity on how and where to invest my savings, always taking time to explain my options and ensure I felt confident about my decisions.",
        "Rakhi's service is warm and highly personalized. She listens carefully, tailors her advice to individual goals, and stays close to her clients with regular check-ins. Her kindness and professionalism create a sense of trust that makes financial planning feel approachable and empowering.",
        "I wholeheartedly recommend Rakhi to anyone looking for a financial advisor who combines expertise, integrity, and genuine care for her clients' success."
      ]
    },
    {
      name: "Sushma Manjunath",
      role: "Supply Chain Finance Director, Unilever",
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
      description: "Understanding your unique financial goals, current situation, and future aspirations to build a strong foundation"
    },
    {
      number: 2,
      title: "Strategy Development",
      description: "Crafting a personalized financial roadmap that aligns with your objectives, risk tolerance, and long-term vision"
    },
    {
      number: 3,
      title: "Implementation",
      description: "Executing the strategic plan with careful monitoring and selection of appropriate investment vehicles and solutions"
    },
    {
      number: 4,
      title: "Ongoing Support",
      description: "Providing regular reviews, necessary adjustments, and proactive advice to keep you on track towards your goals"
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
    <div className="min-h-[100svh] overflow-x-hidden" style={{ backgroundColor: '#FAF7F2' }}>
      {/* Navigation - DARK GREEN BACKGROUND */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-lg' : 'shadow-md'
      } backdrop-blur-lg`}  style={{ paddingTop: 'env(safe-area-inset-top)', backgroundColor: '#1E5631'}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="/logo.png"
                alt="Kalpvriksh Global Logo"
                className="h-12 sm:h-14 md:h-16 lg:h-20 w-12 sm:w-14 md:w-16 lg:w-20 transition-transform duration-300 hover:scale-110 rounded-full"
                style={{ objectFit: 'cover', objectPosition: '85% center', transform: 'scale(0.8)' }}
                loading="lazy"
                decoding="async"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <span className="text-xs sm:text-sm md:text-lg lg:text-xl font-bold whitespace-nowrap" style={{ color: '#F5EDE4' }}>Kalpvriksh Global</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex gap-6">
              {['home', 'services', 'workshops', 'testimonials', 'blogs', 'contact'].map((page) => (
                <button
                  key={page}
                  onClick={() => changePage(page)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 transform border-2 ${
                    currentPage === page
                      ? 'bg-white shadow-lg scale-105 border-[#C4A747]'
                      : 'hover:bg-white/20 hover:scale-105 border-[#C4A747] hover:border-[#C4A747]'
                  }`}
                  style={currentPage === page ? { color: '#1E5631' } : { color: '#F5EDE4' }}
                >
                  {page.charAt(0).toUpperCase() + page.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setNavOpen(!navOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition-all duration-300 transform active:scale-95"
              style={{ color: '#F5EDE4' }}
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
                      ? 'bg-white shadow-md'
                      : 'hover:bg-white/20'
                  }`}
                  style={currentPage === page ? {
                    color: '#1E5631',
                    animationDelay: `${index * 50}ms`,
                    animation: navOpen ? 'slideInLeft 0.3s ease-out forwards' : 'none'
                  } : {
                    color: '#F5EDE4',
                    animationDelay: `${index * 50}ms`,
                    animation: navOpen ? 'slideInLeft 0.3s ease-out forwards' : 'none'
                  }}
                >
                  {page.charAt(0).toUpperCase() + page.slice(1)}
                </button>
              ))}

              {/* Disclosures at bottom of mobile menu */}
              <div className="border-t pt-2 mt-2" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <button
                  onClick={() => changePage('disclosures')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:translate-x-2 ${
                    currentPage === 'disclosures'
                      ? 'bg-white shadow-md'
                      : 'hover:bg-white/20'
                  }`}
                  style={currentPage === 'disclosures' ? {
                    color: '#1E5631',
                    animationDelay: '300ms',
                    animation: navOpen ? 'slideInLeft 0.3s ease-out forwards' : 'none'
                  } : {
                    color: '#F5EDE4',
                    animationDelay: '300ms',
                    animation: navOpen ? 'slideInLeft 0.3s ease-out forwards' : 'none',
                    fontSize: '0.9rem',
                    opacity: '0.8'
                  }}
                >
                  Disclosures
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-50" style={{ backgroundColor: 'rgba(196, 167, 71, 0.2)' }}>
        <div
          className="h-full transition-all duration-150 ease-out"
          style={{
            width: `${scrollProgress}%`,
            backgroundColor: '#C4A747',
            boxShadow: '0 0 10px rgba(196, 167, 71, 0.5)'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="pt-20">
        {/* Home Page */}
        {currentPage === 'home' && (
          <div className="space-y-16">
            {/* Welcome Section - Premium Redesign */}
            <section className="py-6 sm:py-8 px-4 sm:px-6 mx-auto mt-2 sm:mt-4 max-w-6xl">
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-white shadow-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
                {/* Subtle dot pattern background */}
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                     style={{
                       backgroundImage: `radial-gradient(circle at 1px 1px, #1E5631 1px, transparent 1px)`,
                       backgroundSize: '40px 40px'
                     }}></div>

                {/* Decorative corner accents */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 opacity-20" style={{borderColor: '#C4A747'}}></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 opacity-20" style={{borderColor: '#C4A747'}}></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 opacity-20" style={{borderColor: '#C4A747'}}></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 opacity-20" style={{borderColor: '#C4A747'}}></div>

                <div className="text-center relative z-10">
                  {/* Split heading with refined typography */}
                  <div className="mb-4 animate-fade-in-up">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-1 tracking-tight" style={{color: '#1E5631', fontWeight: 300, letterSpacing: '-0.02em'}}>
                      Welcome To
                    </h1>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3" style={{color: '#1E5631', fontWeight: 600, letterSpacing: '-0.01em'}}>
                      Kalpvriksh Global
                    </h1>
                    {/* Gradient divider */}
                    <div className="w-24 h-0.5 mx-auto mb-4" style={{background: 'linear-gradient(to right, transparent, #C4A747, transparent)'}}></div>
                  </div>

                  {/* Pull quote with decorative elements */}
                  <div className="max-w-4xl mx-auto mb-4 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                    <div className="relative mb-4 p-4 sm:p-5 border-l-2" style={{borderColor: '#C4A747'}}>
                      <span className="absolute -left-3 top-0 text-4xl opacity-20" style={{color: '#C4A747'}}>"</span>
                      <p className="text-lg sm:text-xl md:text-2xl font-light italic leading-relaxed" style={{color: '#1E5631'}}>
                        Your wealth is more than numbers, it's the security of your family, the education of your children, and the freedom to live with purpose.
                      </p>
                      <span className="absolute -left-3 bottom-0 text-4xl opacity-20" style={{color: '#C4A747'}}>"</span>
                    </div>

                    {/* Refined body text with emphasis */}
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3" style={{lineHeight: '1.7'}}>
                      We believe in <span className="font-semibold" style={{color: '#1E5631'}}>patient, research-driven strategies</span> grounded in <span className="font-semibold" style={{color: '#1E5631'}}>integrity and discipline</span>.
                    </p>

                    <p className="text-xs sm:text-sm text-gray-600 italic leading-relaxed">
                      Every recommendation we make follows the same standards we apply to our own portfolios because your trust deserves nothing less.
                    </p>
                  </div>
                </div>
              </div>

              {/* Elegant bottom divider */}
              <div className="w-full h-px mt-6 mx-auto max-w-3xl" style={{ background: 'linear-gradient(to right, transparent, #C4A747, transparent)' }}></div>
            </section>

            {/* Our Services Summary */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1E5631' }}>
                  Our Services
                </h2>
                <div className="w-20 h-1 mx-auto rounded-full mb-4" style={{ backgroundColor: '#C4A747' }}></div>
                <p className="text-sm sm:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  Comprehensive wealth solutions designed for long-term financial security
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {services.slice(0, 6).map((service, index) => (
                  <div
                    key={index}
                    onClick={() => changePage('services')}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer text-center"
                  >
                    <div className="text-5xl mb-4">{service.icon}</div>
                    <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#1E5631' }}>
                      {service.title}
                    </h3>
                  </div>
                ))}
              </div>
              {/* Gold Divider */}
              <div className="w-full h-px mb-8" style={{ backgroundColor: '#C4A747' }}></div>

              <div className="text-center">
                <button
                  onClick={() => changePage('services')}
                  className="px-6 py-3 rounded-lg text-base font-semibold transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg border-2"
                  style={{ backgroundColor: 'white', color: '#1E5631', borderColor: '#1E5631' }}
                >
                  View All Services
                </button>
              </div>
            </section>

            {/* Our Process */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-10 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1E5631' }}>
                  Our Process
                </h2>
                <div className="w-20 h-1 mx-auto rounded-full mb-6" style={{ backgroundColor: '#C4A747' }}></div>
                <p className="text-sm sm:text-base text-gray-700 max-w-4xl mx-auto leading-relaxed italic mb-8" style={{ color: '#4E3629' }}>
                  "Integrity and ethics guide every step of our process. Each recommendation is grounded in research, discipline, and the same standards we apply to our own portfolios."
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                {processSteps.map((step, index) => {
                  const treeImages = [
                    '/process/seed.png',
                    '/process/young_sapling.png',
                    '/process/sapling.png',
                    '/process/tree.png'
                  ];

                  return (
                    <div
                      key={index}
                      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 relative text-center border-2"
                      style={{ borderColor: '#C4A747' }}
                    >
                      <div className="mb-4">
                        <div className="w-24 h-24 mx-auto flex items-center justify-center">
                          <img
                            src={treeImages[index]}
                            alt={`${step.title} - Growth Stage ${index + 1}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-16 h-16 rounded-full hidden items-center justify-center text-white font-bold text-xl shadow-md" style={{ backgroundColor: '#1E5631' }}>
                            {step.number}
                          </div>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: '#1E5631' }}>
                        {step.title}
                      </h3>
                    </div>
                  );
                })}
              </div>
              {/* Gold Divider */}
              <div className="w-full h-px mt-12" style={{ backgroundColor: '#C4A747' }}></div>
            </section>

            {/* Meet Rakhi Jain */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-10 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1E5631' }}>
                  Meet Rakhi Jain
                </h2>
                <div className="w-20 h-1 mx-auto rounded-full mb-4" style={{ backgroundColor: '#C4A747' }}></div>
                <p className="text-sm sm:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  Your long-term partner in building financial confidence and clarity
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <img
                    src="/profile-rakhi.png"
                    alt="Rakhi Jain"
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 flex-shrink-0"
                    style={{ borderColor: '#1E5631' }}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="flex-grow text-center md:text-left">
                    <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: '#1E5631' }}>
                      Founder & CEO
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6">
                      Gold Medalist Chartered Accountant and Chartered Wealth Manager (CWM®)
                    </p>
                    <div className="space-y-4">
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        • Trusted advisor offering personalised, goal‑based financial planning grounded in clarity, discipline, and long‑term outcomes aligned with life aspirations.
                      </p>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        • Proven expertise in identifying high‑performing asset managers and investment opportunities. Passionate about investor education and on a mission to empower 100+ families on their path to financial freedom.
                      </p>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        • Former Finance Director, Unilever Middle East, with 23+ years of leadership in Strategy, Corporate Finance, and Business Performance across India & the Middle East.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Testimonials Section */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-10 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1E5631' }}>
                  Client Stories
                </h2>
                <div className="w-20 h-1 mx-auto rounded-full mb-4" style={{ backgroundColor: '#C4A747' }}></div>
                <p className="text-sm sm:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  Trust built through transparency, patience, and results
                </p>
              </div>

              <div className="relative mb-8">
                {/* Carousel Container */}
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
                  >
                    {testimonials.map((testimonial, index) => (
                      <div
                        key={index}
                        className="min-w-full px-4 sm:px-6"
                      >
                        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm max-w-3xl mx-auto">
                          <div className="flex items-start gap-4 mb-4">
                            <img
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-16 h-16 rounded-full object-cover border-2"
                              style={{ borderColor: '#1E5631' }}
                              onError={(e) => {
                                e.currentTarget.src = FALLBACK_AVATAR;
                              }}
                            />
                            <div className="flex-grow">
                              <h4 className="text-lg font-bold" style={{ color: '#1E5631' }}>{testimonial.name}</h4>
                              <p className="text-sm text-gray-600">{testimonial.role}</p>
                              <div className="flex gap-1 mt-1">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                  <span key={i} className="text-lg" style={{ color: '#C4A747' }}>⭐</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            {testimonial.content.slice(0, 2).map((paragraph, idx) => (
                              <p key={idx} className="text-sm text-gray-700 italic leading-relaxed">
                                "{paragraph}"
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <button
                  onClick={() => handleTestimonialNav('prev')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hidden xs:block"
                  style={{ color: '#1E5631' }}
                  aria-label="Previous testimonial"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => handleTestimonialNav('next')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hidden xs:block"
                  style={{ color: '#1E5631' }}
                  aria-label="Next testimonial"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Dots Navigation */}
                <div className="flex justify-center gap-2 mt-6">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleTestimonialNav(index)}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                        currentTestimonial === index ? 'w-6 sm:w-8' : ''
                      }`}
                      style={{
                        backgroundColor: currentTestimonial === index ? '#C4A747' : '#D1D5DB'
                      }}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => changePage('testimonials')}
                  className="px-6 py-3 rounded-lg text-base font-semibold transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg border-2"
                  style={{ backgroundColor: 'white', color: '#1E5631', borderColor: '#1E5631' }}
                >
                  Read More Stories
                </button>
              </div>
            </section>

            {/* Workshops Preview */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-10 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1E5631' }}>
                  Workshops
                </h2>
                <div className="w-20 h-1 mx-auto rounded-full mb-4" style={{ backgroundColor: '#C4A747' }}></div>
                <p className="text-sm sm:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  Building financial literacy through thoughtful education
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 sm:p-8 mb-8 shadow-sm">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-center" style={{ color: '#1E5631' }}>
                  Beyond Returns – The Art of Building Wealth with Intention
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed text-center max-w-3xl mx-auto mb-6">
                  A signature workshop that helps families and professionals move beyond chasing returns to building wealth with clarity, discipline, and purpose.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#F8F5F0' }}>
                    <div className="text-3xl mb-2">🎯</div>
                    <h4 className="text-sm font-bold mb-1" style={{ color: '#1E5631' }}>Redefine Wealth</h4>
                    <p className="text-xs text-gray-600">Understand wealth as freedom and purchasing power</p>
                  </div>
                  <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#F8F5F0' }}>
                    <div className="text-3xl mb-2">📊</div>
                    <h4 className="text-sm font-bold mb-1" style={{ color: '#1E5631' }}>Master Allocation</h4>
                    <p className="text-xs text-gray-600">Learn asset allocation and compounding</p>
                  </div>
                  <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#F8F5F0' }}>
                    <div className="text-3xl mb-2">🛡️</div>
                    <h4 className="text-sm font-bold mb-1" style={{ color: '#1E5631' }}>Secure Your Future</h4>
                    <p className="text-xs text-gray-600">Estate planning and risk management tools</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => changePage('workshops')}
                  className="px-6 py-3 rounded-lg text-base font-semibold transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg border-2"
                  style={{ backgroundColor: 'white', color: '#1E5631', borderColor: '#1E5631' }}
                >
                  View Workshop Details
                </button>
              </div>
            </section>

            {/* Blog Preview */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-10 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1E5631' }}>
                  Insights & Learning
                </h2>
                <div className="w-20 h-1 mx-auto rounded-full mb-4" style={{ backgroundColor: '#C4A747' }}></div>
                <p className="text-sm sm:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  Timeless lessons on wealth building and financial independence
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="text-lg font-bold mb-3" style={{ color: '#1E5631' }}>The Psychology of Money</h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    Profound timeless concepts on personal finance higher savings, buying freedom, and the power of patience in wealth generation.
                  </p>
                  <p className="text-xs text-gray-500 italic">by Morgan Housel</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="text-lg font-bold mb-3" style={{ color: '#1E5631' }}>The Richest Man in Babylon</h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    Timeless financial wisdom through ancient stories the seven laws of wealth that remain relevant across millennia.
                  </p>
                  <p className="text-xs text-gray-500 italic">by George S. Clason</p>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => changePage('blogs')}
                  className="px-6 py-3 rounded-lg text-base font-semibold transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg border-2"
                  style={{ backgroundColor: 'white', color: '#1E5631', borderColor: '#1E5631' }}
                >
                  Explore Learning Resources
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Services Page */}
        {currentPage === 'services' && (
          <div className="space-y-12 sm:space-y-16 px-3 sm:px-4 py-6 sm:py-8">
            <section className="text-center max-w-4xl mx-auto animate-fade-in-up">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2" style={{ color: '#1E5631' }}>
                <span className="animate-bounce-slow text-3xl sm:text-4xl">💼</span> <span>Our Services</span>
              </h1>
              <div className="w-24 sm:w-32 h-1 mx-auto rounded-full mb-4 sm:mb-6 animate-expand-width" style={{ backgroundColor: '#C4A747' }}></div>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 px-2">
                Comprehensive wealth management solutions tailored for your success
              </p>
            </section>

            <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 animate-fade-in-up cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 transform transition-transform duration-300 hover:scale-125 hover:rotate-12">{service.icon}</div>
                    <h3 className="text-xl sm:text-2xl font-bold px-2" style={{ color: '#1E5631' }}>{service.title}</h3>
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed text-center px-2">{service.description}</p>
                  <ul className="space-y-2 sm:space-y-3">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 sm:gap-3 hover:translate-x-2 transition-transform duration-300">
                        <span className="text-base sm:text-lg flex-shrink-0 mt-0.5" style={{ color: '#1E5631' }}>✓</span>
                        <span className="text-sm sm:text-base text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <section className="max-w-6xl mx-auto text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 animate-fade-in-up px-2" style={{ color: '#1E5631' }}>Our Process</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                {processSteps.map((step, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-500 transform hover:scale-105 animate-fade-in-up cursor-pointer border-2 relative"
                    style={{ animationDelay: `${index * 0.1}s`, borderColor: '#C4A747' }}
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white rounded-full flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold mx-auto mb-3 sm:mb-4 transform transition-all duration-300 hover:rotate-360"
                         style={{ backgroundColor: '#163822' }}
                         onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#163822'}
                         onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#163822'}>
                      {step.number}
                    </div>
                    <h4 className="text-base sm:text-lg font-semibold mb-2 px-1" style={{ color: '#1E5631' }}>{step.title}</h4>
                    <p className="text-sm sm:text-base text-gray-600 px-1">{step.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
        {/* Workshops Page */}
        {currentPage === 'workshops' && (
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
                    onClick={() => window.open('https://forms.gle/YOUR_GOOGLE_FORM_ID', '_blank')}
                    className="text-white px-8 py-4 rounded-full text-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl w-full sm:w-auto"
                    style={{ backgroundColor: '#1E5631' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#163822'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E5631'}
                  >
                    📅 Book Your Spot
                  </button>
                  <p className="text-sm text-gray-600 mt-3 px-4">
                    Join one of our upcoming webinar sessions and learn with other families on their wealth-building journey
                  </p>
                </div>
                <div className="flex-1 text-center">
                  <button
                    onClick={() => handleContactAction('calendar')}
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
        )}
        {/* Testimonials Page */}
        {currentPage === 'testimonials' && (
          <div className="space-y-12 sm:space-y-16 px-3 sm:px-4 py-6 sm:py-8">
            <section className="text-center max-w-4xl mx-auto animate-fade-in-up">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2" style={{ color: '#1E5631' }}>
                Real Stories. Real Impact.
              </h1>
              <div className="w-24 sm:w-32 h-1 mx-auto rounded-full mb-4 sm:mb-6 animate-expand-width" style={{ backgroundColor: '#C4A747' }}></div>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed px-2">
                Our clients come from diverse backgrounds but they share one thing in common: a desire for clarity, confidence, and control over their financial future. Here's what they say about working with Rakhi.
              </p>
            </section>

            <div className="max-w-6xl mx-auto relative">
              {/* Carousel Container */}
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
                >
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className="min-w-full px-2 sm:px-4"
                    >
                      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <div className="flex-shrink-0 mx-auto sm:mx-0">
                            <img
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover border-2 transform transition-transform duration-300 hover:scale-110"
                              style={{ borderColor: '#1E5631' }}
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                e.currentTarget.src = FALLBACK_AVATAR;
                              }}
                            />
                          </div>
                          <div className="flex-grow text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-2">
                              <div>
                                <h4 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#1E5631' }}>{testimonial.name}</h4>
                                <p className="text-gray-600 text-xs sm:text-sm md:text-base">{testimonial.role}</p>
                              </div>
                              <div className="flex gap-0.5 sm:gap-1">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                  <span
                                    key={i}
                                    className="text-lg sm:text-xl md:text-2xl"
                                    style={{ color: '#C4A747' }}
                                  >⭐</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                          {testimonial.content.map((paragraph, idx) => (
                            <p
                              key={idx}
                              className="text-gray-700 italic leading-relaxed text-xs sm:text-sm md:text-base lg:text-lg"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={() => handleTestimonialNav('prev')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hidden xs:block"
                style={{ color: '#1E5631' }}
                aria-label="Previous testimonial"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => handleTestimonialNav('next')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hidden xs:block"
                style={{ color: '#1E5631' }}
                aria-label="Next testimonial"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Dots Navigation */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleTestimonialNav(index)}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                      currentTestimonial === index ? 'w-6 sm:w-8' : ''
                    }`}
                    style={{
                      backgroundColor: currentTestimonial === index ? '#C4A747' : '#D1D5DB'
                    }}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Blogs Page */}
        {currentPage === 'blogs' && (
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

            {/* Watch & Learn Section */}
            <section className="max-w-3xl mx-auto animate-fade-in-up">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: '#1E5631' }}>
                  🎥 Watch & Learn
                </h2>
                <div className="w-20 h-1 mx-auto rounded-full mb-4 animate-expand-width" style={{ backgroundColor: '#C4A747' }}></div>
                <p className="text-base sm:text-lg text-gray-700">
                  Video insights on financial planning
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #F0EBE5, #E8DED0)' }}>
                      <svg className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: '#1E5631' }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-base font-semibold mb-2" style={{ color: '#1E5631' }}>YouTube Channel</p>
                    <p className="text-sm text-gray-600 mb-3">Watch insights on wealth building</p>
                    <button
                      onClick={() => window.open('http://www.youtube.com/@RakhiJain-i59', '_blank')}
                      className="text-white px-6 py-2.5 rounded-full text-sm font-semibold
                               transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg
                               inline-flex items-center gap-2"
                      style={{ backgroundColor: '#FF0000' }}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      Visit Channel
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Newsletter Subscription Section */}
            <section className="max-w-4xl mx-auto animate-fade-in-up">
              <div className="rounded-2xl p-8 sm:p-12 shadow-lg text-center" style={{ background: 'linear-gradient(to bottom right, #1E5631, #163822)' }}>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                  Subscribe for Latest Insights
                </h2>
                <p className="text-lg mb-8" style={{ color: '#F0EBE5' }}>
                  Get exclusive financial wisdom, tips, and updates delivered to your inbox
                </p>

                <button
                  onClick={() => {
                    // This will be linked to Google Sheet later
                    alert('Subscription feature coming soon! We will notify you when it\'s ready.');
                  }}
                  className="px-8 py-4 rounded-full text-lg font-semibold
                           transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border-2"
                  style={{ backgroundColor: '#C4A747', color: '#1E5631', borderColor: '#E5E7EB' }}
                >
                  Subscribe for Latest Insights
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Contact Page */}
        {currentPage === 'contact' && (
          <div className="space-y-12 sm:space-y-16 px-3 sm:px-4 py-6 sm:py-8">
            <section className="text-center max-w-4xl mx-auto animate-fade-in-up">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 px-2 leading-tight" style={{ color: '#1E5631' }}>
                Let's Start a Conversation
              </h1>
              <div className="w-20 h-1 mx-auto rounded-full mb-6 animate-expand-width" style={{ backgroundColor: '#C4A747' }}></div>

              <div className="mt-6 sm:mt-8 p-6 sm:p-8 rounded-xl bg-white shadow-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <p className="text-base sm:text-lg md:text-xl font-serif italic mb-2 px-2" style={{ color: '#1E5631' }}>
                  "Clarity is the most underrated form of financial confidence."
                </p>
                <p className="text-sm sm:text-base text-gray-600">— Rakhi Jain</p>
              </div>

              <p className="text-sm sm:text-base md:text-lg text-gray-700 mt-6 sm:mt-8 leading-relaxed px-2">
                Whether you're beginning your wealth journey or seeking to refine your current strategy, we're here to listen. Every financial plan begins with us understanding your goals, your values, and your vision for the future.
              </p>
            </section>
            
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm hover:shadow-md transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 px-2 leading-relaxed" style={{ color: '#1E5631' }}>
                    Schedule a complimentary consultation to explore your financial goals
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-6 px-2 leading-relaxed">
                    No pressure, no obligation, just a thoughtful conversation about your future
                  </p>
                </div>

                {/* Primary CTA */}
                <div className="text-center mb-8">
                  <button
                    onClick={() => handleContactAction('calendar')}
                    className="text-white px-8 py-4 rounded-lg text-base sm:text-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg w-full sm:w-auto"
                    style={{ backgroundColor: '#1E5631' }}
                  >
                    Schedule a 30-Minute Call
                  </button>
                </div>

                {/* Secondary CTAs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
                  {[
                    { action: 'email', icon: '📧', text: 'Send Email' },
                    { action: 'linkedin', icon: 'linkedin', text: 'LinkedIn' },
                    { action: 'whatsapp', icon: 'whatsapp', text: 'WhatsApp' }
                  ].map((btn, index) => (
                    <button
                      key={index}
                      onClick={() => handleContactAction(btn.action)}
                      className="px-3 sm:px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-semibold transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg flex flex-col items-center justify-center gap-1 sm:gap-2 animate-fade-in-up border-2"
                      style={{
                        animationDelay: `${0.7 + index * 0.1}s`,
                        backgroundColor: 'white',
                        color: '#1E5631',
                        borderColor: '#1E5631'
                      }}
                    >
                      {btn.icon === 'linkedin' ? (
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" style={{ color: '#0077B5' }} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      ) : btn.icon === 'whatsapp' ? (
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" style={{ color: '#25D366' }} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      ) : (
                        <span className="text-2xl sm:text-3xl">{btn.icon}</span>
                      )}
                      <span className="text-xs sm:text-sm">{btn.text}</span>
                    </button>
                  ))}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Disclosures Page */}
        {currentPage === 'disclosures' && (
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
        )}
      </div>

      {/* Footer */}
      <footer className="text-white py-8 sm:py-10 md:py-12 mt-12 sm:mt-16 pb-24 sm:pb-8" style={{ paddingBottom: 'max(6rem, env(safe-area-inset-bottom))', backgroundColor: '#1E5631'}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="animate-fade-in-up text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4 justify-center sm:justify-start">
                <img
                  src="/logo.png"
                  alt="Kalpvriksh Global Logo"
                  className="h-14 sm:h-16 md:h-20 lg:h-24 w-14 sm:w-16 md:w-20 lg:w-24 transition-transform duration-300 hover:scale-110 rounded-full"
                  style={{ objectFit: 'cover', objectPosition: '85% center', transform: 'scale(0.8)' }}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#F5EDE4' }}>Kalpvriksh Global</span>
              </div>
              <p className="text-sm sm:text-base mb-3 sm:mb-4" style={{ color: '#F5EDE4' }}>Building financial confidence through discipline and clarity</p>
              <div className="text-xs sm:text-sm" style={{ color: '#F5EDE4' }}>
                <p>📧 rakhijain@kalpavrikshglobal.com</p>
              </div>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center sm:text-left" style={{ color: '#C4A747' }}>Quick Links</h4>
              <div className="space-y-2 text-center sm:text-left">
                {['Home', 'Services', 'Workshops', 'Testimonials', 'Blogs', 'Contact'].map((link) => (
                  <button
                    key={link}
                    onClick={() => changePage(link.toLowerCase())}
                    className="block text-sm sm:text-base transition-all duration-200 hover:translate-x-2 mx-auto sm:mx-0"
                    style={{ cursor: 'pointer', color: '#F5EDE4' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#C4A747'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#F5EDE4'}
                  >
                    {link}
                  </button>
                ))}
                <button
                  onClick={() => changePage('disclosures')}
                  className="block text-sm sm:text-base transition-all duration-200 hover:translate-x-2 mx-auto sm:mx-0"
                  style={{ cursor: 'pointer', color: '#F5EDE4' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#C4A747'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#F5EDE4'}
                >
                  Disclosures
                </button>
              </div>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center sm:text-left" style={{ color: '#C4A747' }}>Services</h4>
              <div className="space-y-2 text-xs sm:text-sm text-center sm:text-left" style={{ color: '#F5EDE4' }}>
                <p className="hover:translate-x-2 transition-transform duration-200">• Investments & Mutual Funds</p>
                <p className="hover:translate-x-2 transition-transform duration-200">• Goal Based Solutions</p>
                <p className="hover:translate-x-2 transition-transform duration-200">• Insurance Planning</p>
                <p className="hover:translate-x-2 transition-transform duration-200">• Tax & Estate Planning</p>
                <p className="hover:translate-x-2 transition-transform duration-200">• Learning Academy</p>
              </div>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center sm:text-left" style={{ color: '#C4A747' }}>Professional Info</h4>
              <div className="space-y-2 text-xs sm:text-sm text-center sm:text-left" style={{ color: '#F5EDE4' }}>
                <p className="hover:translate-x-2 transition-transform duration-200">• Gold Medalist Chartered Accountant</p>
                <p className="hover:translate-x-2 transition-transform duration-200">• Chartered Wealth Manager</p>
                <p className="hover:translate-x-2 transition-transform duration-200">• 20+ Years Experience</p>
                <p className="hover:translate-x-2 transition-transform duration-200">• Unilever Background</p>
              </div>
            </div>
          </div>
          <div className="border-t pt-4 text-center" style={{ borderColor: '#163822' }}>
            <p className="text-xs" style={{ color: '#F5EDE4', opacity: '0.8' }}>
              Designed by Gaurav Jain
            </p>
          </div>
        </div>
      </footer>

      {/* Bottom Action Tabs */}
      <div className="fixed bottom-0 right-0 z-40 flex flex-col gap-0" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {/* WhatsApp Tab */}
        <button
          onClick={() => handleContactAction('whatsapp')}
          className="group flex items-center gap-2 px-3 sm:px-4 py-3 text-white font-semibold text-sm transition-all duration-300 sm:hover:px-6 shadow-lg active:px-6"
          style={{
            backgroundColor: '#25D366',
            clipPath: 'polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 30%)'
          }}
          aria-label="Contact via WhatsApp"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span className="hidden group-active:inline sm:inline whitespace-nowrap">WhatsApp</span>
        </button>

        {/* Schedule Meeting Tab */}
        <button
          onClick={() => handleContactAction('calendar')}
          className="group flex items-center gap-2 px-3 sm:px-4 py-3 text-white font-semibold text-sm transition-all duration-300 sm:hover:px-6 shadow-lg active:px-6"
          style={{
            backgroundColor: '#1E5631',
            clipPath: 'polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 30%)'
          }}
          aria-label="Schedule a meeting"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="hidden group-active:inline sm:inline whitespace-nowrap">Schedule</span>
        </button>
      </div>

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

        @keyframes starPop {
          0% {
            opacity: 0;
            transform: scale(0) rotate(-180deg);
          }
          50% {
            transform: scale(1.2) rotate(0deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes fallLeaf {
          0% {
            transform: translateY(-10vh) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          25% {
            transform: translateY(25vh) translateX(20px) rotate(90deg);
          }
          50% {
            transform: translateY(50vh) translateX(-10px) rotate(180deg);
          }
          75% {
            transform: translateY(75vh) translateX(30px) rotate(270deg);
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) translateX(0px) rotate(360deg);
            opacity: 0;
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

        .animate-star-pop {
          animation: starPop 0.5s ease-out forwards;
          opacity: 0;
          display: inline-block;
        }

        .animate-fall-leaf {
          animation: fallLeaf linear infinite;
          will-change: transform, opacity;
        }

        .animate-float-leaf {
          animation: floatLeaf linear infinite;
          will-change: transform;
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
        
        /* eslint-disable-next-line */
        .hover\\:rotate-360:hover {
          animation: rotate360 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default KalpavrikshCapital;