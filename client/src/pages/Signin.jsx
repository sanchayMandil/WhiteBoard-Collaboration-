import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 
  
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      const res = await axios.post('http://localhost:5001/login', { email, password });
      console.log("Login successful:", res.data);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error("Login failed:", err.response?.data?.error || err.message);
      toast.error(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <>
      <div className="flex justify-center p-[80px] bg-gray-200 bg-[url(https://media.istockphoto.com/id/1407863570/photo/innovation-through-ideas-and-inspiration-ideas-human-hand-holding-light-bulb-to-illuminate.jpg?s=612x612&w=0&k=20&c=XqD2JdywyodLSm32dkpjIIMeTsrqc8r7yzXWXUA4fks=)] bg-no-repeat bg-cover">
        <div className="border-black mt-10 drop-shadow-2xl bg-white border-2 rounded-[15px] inline-block p-[40px]">
          <form className="flex-col justify-between" onSubmit={handleLogin}>
            <label className="text-[50px] font-bold">Welcome</label>
            <br />
            <input
              className="m-[15px] p-[5px] border-black rounded-[10px] border-[2px] h-[50px] w-[300px]"
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <input
              className="m-[15px] p-[5px] border-black rounded-[10px] border-[2px] h-[50px] w-[300px]"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <button
              className="m-[15px] p-[12px] rounded-2xl bg-blue-600 text-white text-[20px] hover:bg-blue-900"
              type="submit"
            >
              Sign in
            </button>
          </form>
          <div className="flex justify-between mt-[20px]">
            <Link
              className="text-[18px] text-gray-600 hover:underline hover:text-blue-800"
              to="/forgotPass"
            >
              Forgot Password?
            </Link>
            <Link
              className="text-[18px] text-gray-600 hover:underline hover:text-blue-800"
              to="/register"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default Signin;