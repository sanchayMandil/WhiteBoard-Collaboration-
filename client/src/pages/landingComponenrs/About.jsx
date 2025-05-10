function About() {
    return (
      <>
        <div className="flex flex-col lg:flex-row p-8 lg:p-[50px]">
          <div className="w-full lg:w-[60%] pr-[20px] pl-[20px]">
            <h1 className="arvo-bold text-4xl lg:text-[80px]">About</h1>
            <div className="text-[16px] lg:text-[20px] mt-4">
              <p>
                WhiteBoard is an innovative collaboration platform designed to help teams brainstorm,
                make decisions, and create together in real time. Whether you’re planning your next big project,
                outlining ideas, or solving complex problems, WhiteBoard gives you and your team the tools you need
                to collaborate seamlessly.
              </p>
              <br />
              <p>
                Invite friends, colleagues, or teammates to join your virtual workspace,
                where you can share ideas, discuss, and make decisions without any barriers.
                With a simple and intuitive interface, you can start brainstorming right away—drawing, typing,
                and sketching your thoughts as they happen.
              </p>
              <br />
              <p>
                From creative teams to business leaders, WhiteBoard provides a dynamic and
                engaging environment to bring ideas to life, streamline decision-making,
                and enhance team collaboration—no matter where you are.
              </p>
            </div>
          </div>
          <div className="mt-6 lg:mt-0 flex justify-center lg:justify-end">
            <img
              className="border-10 transform scale-x-[-1] border-white drop-shadow-lg rounded-[40px] max-w-full h-auto lg:h-[650px] lg:w-[500px]"
              src="https://img.freepik.com/free-photo/medium-shot-man-working-laptop_23-2149894621.jpg"
              alt=""
            />
          </div>
        </div>
      </>
    );
  }
  
  export default About;
  