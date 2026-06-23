'use client';
import { useState, useEffect, useRef } from 'react';


const FAQ_DATA = [
  // 🔐 Authentication
  {
    question: 'How to register?',
    keywords: ['register', 'signup', 'create account'],
    answer: 'Click Register → fill details → submit.'
  },
  {
    question: 'login?',
    keywords: ['login', 'signin', 'account'],
    answer: 'Click Login → enter email & password.'
  },
  {
    question: 'Forgot password?',
    keywords: ['forgot', 'password', 'reset'],
    answer: 'Click "Forgot Password" → reset via email.'
  },

  // 👤 ProfileHow to
  {
    question: 'Update profile?',
    keywords: ['profile', 'edit', 'update'],
    answer: 'Go to Profile → Edit → Save changes.'
  },
  {
    question: 'Search alumni?',
    keywords: ['search', 'alumni', 'find'],
    answer: 'Go to Alumni → use search filters.'
  },
  {
    question: 'Connect with alumni?',
    keywords: ['connect', 'contact', 'alumni'],
    answer: 'Open profile → use available contact info.'
  },

  // 💼 Jobs
  {
    question: 'Apply for job?',
    keywords: ['job', 'apply', 'career'],
    answer: 'Go to Jobs → select → Apply Now.'
  },
  {
    question: 'Post a job?',
    keywords: ['post job', 'add job'],
    answer: 'Alumni/Admin can post jobs.'
  },
  {
    question: 'Upload resume?',
    keywords: ['resume', 'cv', 'upload'],
    answer: 'Go to Resume → fill details → upload.'
  },

  // 📅 Events
  {
    question: 'Register event?',
    keywords: ['event', 'register'],
    answer: 'Go to Events → click Register.'
  },
  {
    question: 'Create event?',
    keywords: ['create event'],
    answer: 'Admin/Faculty can create events.'
  },

  // 📝 Notes
  {
    question: 'View notes?',
    keywords: ['notes', 'study', 'materials'],
    answer: 'Go to Notes section.'
  },
  {
    question: 'Upload notes?',
    keywords: ['upload notes'],
    answer: 'Students/Faculty can upload notes.'
  },

  // 🛡️ Roles
  {
    question: 'Admin access?',
    keywords: ['admin', 'access'],
    answer: 'Contact existing admin.'
  },
  {
    question: 'Faculty role?',
    keywords: ['faculty'],
    answer: 'Manage notes & events.'
  },

  // ⚙️ Support
  {
    question: 'Login issue?',
    keywords: ['login problem', 'cannot login'],
    answer: 'Check credentials or reset password.'
  },
  {
    question: 'Contact support?',
    keywords: ['help', 'support'],
    answer: 'Email: alumni.support@university.edu'
  },
  {
    question: 'Data secure?',
    keywords: ['secure', 'data'],
    answer: 'Yes, data is encrypted & सुरक्षित.'
  }
];

// 🧠 Smart Matching Function
function findBestMatch(input) {
  const text = input.toLowerCase();
  let bestMatch = null;
  let maxScore = 0;

  FAQ_DATA.forEach(faq => {
    let score = 0;

    faq.keywords.forEach(keyword => {
      if (text.includes(keyword)) score += 3;
    });

    faq.question.split(' ').forEach(word => {
      if (text.includes(word.toLowerCase())) score += 1;
    });

    if (score > maxScore) {
      maxScore = score;
      bestMatch = faq;
    }
  });

  return bestMatch;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: '👋 Hi! I\'m the AlumniConnect assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  // 🔽 Auto scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input;
    const lower = userText.toLowerCase();

    setMessages(prev => [...prev, { type: 'user', text: userText }]);
    setInput('');

    // 🤖 Typing effect
    setMessages(prev => [...prev, { type: 'bot', text: 'Typing...' }]);

    setTimeout(() => {
      let reply = '';

      // ✅ Smart greetings
      if (lower.includes('hi') || lower.includes('hello')) {
        reply = '👋 Hello! How can I help you today?';
      }
      else if (lower.includes('thank')) {
        reply = '😊 You’re welcome!';
      }
      else if (lower.includes('bye')) {
        reply = '👋 Goodbye!';
      }
      else {
        const match = findBestMatch(userText);

        if (match) {
          reply = match.answer;
        } else {
          reply = '🤔 Try asking about jobs, events, profile, or resume.';
        }
      }

      // replace typing
      setMessages(prev => {
        const updated = [...prev];
        updated.pop();
        return [...updated, { type: 'bot', text: reply }];
      });

    }, 700);
  };

  const handleQuickQuestion = (faq) => {
    setMessages(prev => [
      ...prev,
      { type: 'user', text: faq.question },
      { type: 'bot', text: faq.answer }
    ]);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-bg text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center hover:scale-110 transition-transform"
      >
        {isOpen ? '✖' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ height: '520px' }}>

          {/* Header */}
          <div className="gradient-bg px-5 py-4 flex items-center gap-3">
            <span className="text-xl">🤖</span>
            <div>
              <h3 className="text-white font-semibold">Alumni Bot</h3>
              <p className="text-xs text-indigo-200">Always here</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-2 rounded-2xl ${
                  msg.type === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Quick Questions */}
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
            {FAQ_DATA.slice(0, 3).map((faq, i) => (
              <button
                key={i}
                onClick={() => handleQuickQuestion(faq)}
                className="text-xs px-3 py-1 bg-indigo-100 rounded"
              >
                {faq.question}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type..."
              className="flex-1 border px-2 py-1 rounded"
            />
            <button onClick={handleSend} className="bg-indigo-500 text-white px-3 rounded">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
