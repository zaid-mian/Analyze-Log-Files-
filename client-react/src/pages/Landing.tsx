import { useState } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What log formats are supported?',
      answer: 'We support Apache and Nginx combined log formats out of the box. More formats coming soon!',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes! All processing is done locally on your server, and we never store your log data permanently.',
    },
    {
      question: 'How does MapReduce work here?',
      answer: 'Our MapReduce engine splits your log file into chunks, processes them in parallel across multiple workers, and aggregates the results for fast analysis.',
    },
    {
      question: 'Can I export reports?',
      answer: 'Absolutely! You can export your analysis results to both CSV and PDF with a single click.',
    },
    {
      question: 'Do I need to know how to code?',
      answer: 'Nope! Just upload your log file and our AI-powered engine will handle the rest.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header/Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
            LA
          </div>
          <div className="font-bold text-lg tracking-tight">LogAnalyzer</div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
            How It Works
          </a>
          <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
            FAQ
          </a>
        </div>
        <Link
          to="/login"
          className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-md shadow-blue-500/20"
        >
          Login
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                Analyze Log Files with
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {' '}
                  AI-Powered MapReduce
                </span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Upload, process, and get intelligent insights from your Apache/Nginx logs
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-xl shadow-blue-500/30 active:scale-[0.98]"
              >
                Get Started →
              </Link>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-8">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      LA
                    </div>
                    <div>
                      <div className="font-semibold">sample.log</div>
                      <div className="text-sm text-slate-500">12,450 lines processed</div>
                    </div>
                  </div>
                  <div className="text-green-600 font-semibold">✓</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-blue-600">12k</div>
                    <div className="text-sm text-slate-600">Lines</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-green-600">0.4s</div>
                    <div className="text-sm text-slate-600">Time</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-amber-600">24</div>
                    <div className="text-sm text-slate-600">Charts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How It Works</h2>
            <p className="text-lg text-slate-600">
              Get from raw log to actionable insights in 4 simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                num: '01',
                title: 'Upload Log File',
                desc: 'Drag and drop your Apache or Nginx log file',
                icon: '📁',
              },
              {
                num: '02',
                title: 'MapReduce Processing',
                desc: 'Split → Map → Shuffle → Reduce',
                icon: '⚡',
              },
              {
                num: '03',
                title: 'AI Analysis & Insights',
                desc: 'Claude-powered security and performance analysis',
                icon: '🤖',
              },
              {
                num: '04',
                title: 'View Dashboard & Export',
                desc: 'Explore charts and download reports',
                icon: '📊',
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:shadow-xl hover:border-slate-300 transition">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <div className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">{step.num}</div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-slate-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Dashboard Preview</h2>
            <p className="text-lg text-slate-600">
              Beautiful, intuitive interface for all your log analysis needs
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 text-slate-800">Traffic Overview</h3>
                <div className="h-64 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400">
                  Chart Placeholder
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                  <h4 className="font-bold text-lg mb-2 text-slate-800">Success Rate</h4>
                  <div className="text-4xl font-extrabold text-green-600">98.5%</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
                  <h4 className="font-bold text-lg mb-2 text-slate-800">Errors</h4>
                  <div className="text-4xl font-extrabold text-amber-600">124</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6">
                  <h4 className="font-bold text-lg mb-2 text-slate-800">Unique IPs</h4>
                  <div className="text-4xl font-extrabold text-purple-600">1,234</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Powerful Features</h2>
            <p className="text-lg text-slate-600">
              Everything you need for professional log analysis
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Real-time processing',
                desc: 'Process thousands of lines per second with MapReduce',
                icon: '⚡',
                color: 'from-blue-500 to-indigo-500',
              },
              {
                title: 'AI-powered security insights',
                desc: 'Claude identifies security issues and anomalies',
                icon: '🔒',
                color: 'from-purple-500 to-violet-500',
              },
              {
                title: 'HTTP error tracking',
                desc: 'Monitor 404s, 500s, and all other status codes',
                icon: '⚠️',
                color: 'from-amber-500 to-orange-500',
              },
              {
                title: 'Performance benchmarking',
                desc: 'Measure throughput, latency, and parallel performance',
                icon: '📈',
                color: 'from-green-500 to-emerald-500',
              },
              {
                title: 'Export CSV/PDF',
                desc: 'Download your reports with a single click',
                icon: '📄',
                color: 'from-pink-500 to-rose-500',
              },
              {
                title: 'Historical data',
                desc: 'Track all your past analyses and compare results',
                icon: '📅',
                color: 'from-cyan-500 to-sky-500',
              },
            ].map((feature, i) => (
              <div key={i} className="p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-xl hover:border-slate-300 transition">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white text-2xl mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Your Data is Secure</h2>
            <p className="text-lg text-slate-300">
              We prioritize security and privacy in everything we build
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Local Processing',
                desc: 'All log processing happens on your server. Your data never leaves your infrastructure.',
                icon: '🔐',
              },
              {
                title: 'No Permanent Storage',
                desc: 'Log files are processed and then automatically deleted. No logs are stored permanently.',
                icon: '🗑️',
              },
              {
                title: 'Enterprise Security',
                desc: 'Built with security best practices and follows industry standards for data protection.',
                icon: '🛡️',
              },
            ].map((item, i) => (
              <div key={i} className="p-8 bg-slate-800 rounded-2xl border border-slate-700">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-slate-600">
              Have questions? We've got answers!
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition"
                >
                  <span className="text-lg font-semibold text-slate-800">{faq.question}</span>
                  <span className="text-2xl text-slate-400">
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 py-5 text-slate-600 border-t border-slate-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Try LogAnalyzer
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            A portfolio project showcasing modern web development, MapReduce algorithms, and AI-powered insights.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-10 py-5 text-xl font-semibold text-blue-600 bg-white rounded-xl hover:bg-slate-100 transition shadow-xl shadow-blue-500/30 active:scale-[0.98]"
          >
            Explore the Demo →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                  LA
                </div>
                <div className="font-bold text-lg tracking-tight">LogAnalyzer</div>
              </div>
              <p className="text-slate-400 leading-relaxed">
                A portfolio project demonstrating log analysis with MapReduce, AI insights, and modern web technologies.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-slate-400 hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-slate-400 hover:text-white transition">
                    How It Works
                  </a>
                </li>
                <li>
                  <Link to="/login" className="text-slate-400 hover:text-white transition">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
            © 2026 LogAnalyzer. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
