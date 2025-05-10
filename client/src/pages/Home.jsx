import About from "./landingComponenrs/About";
import Feature from "./landingComponenrs/Feature";
import FAQ from "./landingComponenrs/FAQ";
import Hook from "./landingComponenrs/Hook";
function Home(){
    return (
         <>
   <div className="flex-col justify-items-start p-[80px] drop-shadow-lg
   bg-[url(https://media.istockphoto.com/id/1407863570/photo/innovation-through-ideas-and-inspiration-ideas-human-hand-holding-light-bulb-to-illuminate.jpg?s=612x612&w=0&k=20&c=XqD2JdywyodLSm32dkpjIIMeTsrqc8r7yzXWXUA4fks=)] bg-no-repeat bg-cover">
  <div className="cursive mt-15">
    <span className=" text-[90px] drop-shadow-lg">S</span>
        <spam className="text-[50px] drop-shadow-lg">
            tart Collabrating with your friends
        </spam>
        <br/>
        <span className="text-[40px] drop-shadow-lg"> Shape your idea</span>
        <span className="text-[65px] drop-shadow-lg"> & </span>
        <span className="text-[40px] drop-shadow-lg">Make it greate...</span>
    </div>
  <div className=" mt-35 "> 
      <input className="m-[10px] p-[5px] bg-white border-black rounded-[10px] border-[2px] h-[50px] w-[300px]" type="text" placeholder="Board link URL" /> 
      <button className="ml-[0px] p-[12px] rounded-2xl bg-blue-600 text-white text-[20px] hover:bg-blue-900" type="submit">Join</button> 
      <br />
  </div>
</div>
<About/>
<Feature/>
<Hook/>
<FAQ/>
    </>
    )
}
export default Home;