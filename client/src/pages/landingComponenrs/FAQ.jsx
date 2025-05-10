import React, { useState } from 'react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What is React?",
      answer: "React is a JavaScript library for building user interfaces. It allows you to create reusable UI components."
    },
    {
      question: "What is Tailwind CSS?",
      answer: "Tailwind CSS is a utility-first CSS framework that provides low-level utility classes to build custom designs."
    },
    {
      question: "How do I install React?",
      answer: "You can install React by using Create React App or by setting it up manually with Webpack and Babel."
    },
    {
      question: "What is JSX?",
      answer: "JSX is a syntax extension for JavaScript that allows you to write HTML-like code inside JavaScript. It's used in React components."
    }
  ];

  const toggleAnswer = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white shadow-md rounded-lg overflow-hidden">
            <button
              onClick={() => toggleAnswer(index)}
              className="w-full text-left px-6 py-4 bg-gray-100 text-lg font-semibold text-gray-800 focus:outline-none"
            >
              {faq.question}
            </button>
            {activeIndex === index && (
              <div className="px-6 py-4 bg-gray-50 text-gray-700">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
    