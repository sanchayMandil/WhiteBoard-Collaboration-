import {Link} from "react-router-dom"
function Hook(){
    return(
        <div className="flex justify-center m-20">
            <div className="flex flex-col items-center">
                <h1 className="text-6xl text-center arvo-bold mb-15" >Let's connect and make something</h1>
            <img  className="w-[800px]"src="https://gineriswealth.com/wp-content/uploads/2018/08/blog_brainstorming_r02_vA-1b.png" alt="" />
            <Link to="/board" className="my-5 bg-blue-700 text-2xl hover:bg-blue-900 text-white p-2 rounded-2xl 
            ">Create</Link>
            </div>
        </div>
    )
}
export default Hook;