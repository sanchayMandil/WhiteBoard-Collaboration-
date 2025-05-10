function Feature() {
    return (
      <>
        <div className="bg-blue-800 p-8">
          <div className="text-white">
            <h1 className="crimson-text-bold text-[50px]">What we offer</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
              <div className="cube border-3 p-5 rounded-2xl">
                <img
                  className="cubImg border-5 border-gray-100"
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb9YP2g0j54V9-2x7DQZrt6SOsiSBR55mfOw&s"
                  alt=""
                />
                <h1 className="pt-3 text-black text-[25px]">Dashboard</h1>
                <p className="cubTxt crimson-text-regular">
                  You can see your all boards which have been created on WhiteBoard. You can even reuse it and invite your friends to do brainstorming.
                </p>
                <button className="cubBut">Read More</button>
              </div>
              <div className="cube border-3 p-5 rounded-2xl">
                <img
                  className="cubImg border-5 border-gray-100"
                  src="https://icon-library.com/images/voice-chat-icon/voice-chat-icon-0.jpg"
                  alt=""
                />
                <h1 className="pt-3 text-black text-[25px]">Voice Channel</h1>
                <p className="cubTxt crimson-text-regular">
                  We offer users a dedicated voice channel where you can communicate on this platform while using Whiteboard. You can also control the voice.
                </p>
                <button className="cubBut">Read More</button>
              </div>
              <div className="cube border-3 p-5 rounded-2xl">
                <img
                  className="cubImg border-5 border-gray-100"
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpMWd8XMu_VJ9izDsCkCtFO_HOs8aTMGuVO0yEAy_kfbJKUNOi60u7Bedbz0WZq_wqH5E&usqp=CAU"
                  alt=""
                />
                <h1 className="pt-3 text-black text-[25px]">Build Community</h1>
                <p className="cubTxt crimson-text-regular">
                  We offer users the ability to build a community, collaborate, and communicate within Whiteboard.
                </p>
                <button className="cubBut">Read More</button>
              </div>
              <div className="cube border-3 p-5 rounded-2xl">
                <img
                  className="cubImg border-5 border-gray-100"
                  src="https://lh7-us.googleusercontent.com/ROjW2uoQcVeRtkXYjuv4NafYMemdrRhmg_pOHwrzWGrLIDiWpSSBLa-tnCBiQRztEnzTyYD26AOlhhy5ZplhqtsnjgzTAZEuTyCHBykKyIa1ZrX1qFmIyn1WFPstLhUbeRDyZD4a0-5MpF44ApxFqco"
                  alt=""
                />
                <h1 className="pt-3 text-black text-[25px]">Real-time Collaboration</h1>
                <p className="cubTxt crimson-text-regular">
                  We offer users real-time collaboration where you can interact and work together using Whiteboard.
                </p>
                <button className="cubBut">Read More</button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  export default Feature;
  