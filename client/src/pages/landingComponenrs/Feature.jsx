import React from 'react';

function Feature() {
  const features = [
    {
      title: 'Dashboard',
      description: 'View and manage all your boards created on WhiteBoard. Reuse them or invite friends to collaborate and brainstorm together.',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb9YP2g0j54V9-2x7DQZrt6SOsiSBR55mfOw&s',
      alt: 'Dashboard interface showing multiple collaborative boards',
    },
    {
      title: 'Voice Channel',
      description: 'Communicate seamlessly with a dedicated voice channel while using WhiteBoard. Control audio settings for a tailored experience.',
      image: 'https://icon-library.com/images/voice-chat-icon/voice-chat-icon-0.jpg',
      alt: 'Voice channel icon representing real-time communication',
    },
    {
      title: 'Build Community',
      description: 'Create and grow communities within WhiteBoard, fostering collaboration and communication among users.',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpMWd8XMu_VJ9izDsCkCtFO_HOs8aTMGuVO0yEAy_kfbJKUNOi60u7Bedbz0WZq_wqH5E&usqp=CAU',
      alt: 'Group of people collaborating in a community setting',
    },
    {
      title: 'Real-time Collaboration',
      description: 'Work together in real time, interacting and creating on WhiteBoard with seamless collaboration tools.',
      image: 'https://lh7-us.googleusercontent.com/ROjW2uoQcVeRtkXYjuv4NafYMemdrRhmg_pOHwrzWGrLIDiWpSSBLa-tnCBiQRztEnzTyYD26AOlhhy5ZplhqtsnjgzTAZEuTyCHBykKyIa1ZrX1qFmIyn1WFPstLhUbeRDyZD4a0-5MpF44ApxFqco',
      alt: 'Team collaborating on a digital whiteboard in real time',
    },
  ];

  return (
    <div className="bg-gradient-to-b from-blue-900 to-blue-700 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl lg:text-6xl font-extrabold text-white mb-12 tracking-tight animate-fade-in">
          What We Offer
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center transform hover:scale-105 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img
                className="w-full h-40 object-contain rounded-xl mb-4 border-2 border-gray-200"
                src={feature.image}
                alt={feature.alt}
              />
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">{feature.title}</h2>
              <p className="text-gray-600 text-base leading-relaxed flex-grow">{feature.description}</p>
              <button
                className="mt-4 bg-blue-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                aria-label={`Read more about ${feature.title}`}
              >
                Read More
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Feature;