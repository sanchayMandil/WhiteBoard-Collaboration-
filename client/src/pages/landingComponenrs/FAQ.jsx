import React, { useState } from 'react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: 'What does our platform offer?',
      answer: 'Our platform provides a wide range of features, including user authentication, data visualization, and real-time collaboration tools to enhance productivity and teamwork.',
    },
    {
      question: 'What is the onboarding process?',
      answer: 'The onboarding process is simple: create an account, verify your email, and set up your profile to start using the platform’s features.',
    },
    {
      question: 'What is real-time collaboration?',
      answer: 'Real-time collaboration enables multiple users to work on the same document or project simultaneously, with changes reflected instantly for all collaborators.',
    },
    {
      question: 'Can users opt out of real-time collaboration?',
      answer: 'Yes, users can choose to work offline or in single-user mode, where changes are saved locally and synced later if needed.',
    },
  ];

  const toggleAnswer = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full">
        <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-10 tracking-tight">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <button
                onClick={() => toggleAnswer(index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left bg-gradient-to-r from-blue-50 to-blue-100 text-lg font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                aria-expanded={activeIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span>{faq.question}</span>
                <svg
                  className={`w-6 h-6 text-blue-600 transition-transform duration-300 ${
                    activeIndex === index ? 'rotate-45' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={activeIndex === index ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'}
                  />
                </svg>
              </button>
              <div
                id={`faq-answer-${index}`}
                className={`px-6 bg-white transition-all duration-300 ease-in-out ${
                  activeIndex === index
                    ? 'py-5 max-h-96 opacity-100'
                    : 'max-h-0 opacity-0 overflow-hidden'
                }`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
              >
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;