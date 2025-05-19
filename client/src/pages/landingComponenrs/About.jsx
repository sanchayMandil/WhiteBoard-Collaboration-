import React from 'react';

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="w-full lg:w-3/5">
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight animate-fade-in">
              About WhiteBoard
            </h1>
            <div className="text-lg lg:text-xl text-gray-600 leading-relaxed space-y-6">
              <p className="animate-slide-up">
                WhiteBoard is an innovative collaboration platform designed to empower teams to brainstorm, make decisions, and create together in real time. Whether you’re planning a major project, outlining ideas, or tackling complex challenges, WhiteBoard provides the tools you need for seamless collaboration.
              </p>
              <p className="animate-slide-up delay-100">
                Invite friends, colleagues, or teammates to your virtual workspace, where you can share ideas, discuss, and make decisions without barriers. With its intuitive interface, you can start brainstorming instantly—drawing, typing, and sketching your thoughts as they come to life.
              </p>
              <p className="animate-slide-up delay-200">
                From creative teams to business leaders, WhiteBoard offers a dynamic and engaging environment to bring ideas to life, streamline decision-making, and enhance team collaboration, no matter where you are in the world.
              </p>
            </div>
          </div>
          <div className="w-full lg:w-2/5 flex justify-center lg:justify-end mt-8 lg:mt-0">
            <div className="relative">
              <img
                className="rounded-3xl shadow-2xl max-w-full h-auto lg:h-[600px] lg:w-[450px] object-cover transform hover:scale-105 transition-transform duration-300"
                src="https://img.freepik.com/free-photo/medium-shot-man-working-laptop_23-2149894621.jpg"
                alt="Team collaborating on a digital whiteboard with laptops and creative tools"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;