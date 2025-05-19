import { useState, useEffect } from 'react';
import { useNavigate, Link} from "react-router-dom";
import { jwtDecode } from 'jwt-decode'; // Import the jwtDecode function

function Navi() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
    const navigate = useNavigate();

  useEffect(() => {
    // Check for a JWT token in local storage or cookies
    const token = localStorage.getItem('token') || document.cookie.replace(/(?:(?:^|.*;\s*)jwtToken\s*=\s*([^;]*).*$)|^.*$/, "$1");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setIsLoggedIn(true);
        setUserName(decodedToken.name || decodedToken.username || 'User'); // Adjust based on your payload
      } catch (error) {
        console.error('Error decoding JWT:', error);
        setIsLoggedIn(false); // Invalidate token if decoding fails
        localStorage.removeItem('token');
        navigate('/');
      }
    } else {
      setIsLoggedIn(false);
    }
  },[]);

  const handleLogout = () => {
    // Clear the JWT token from local storage and/or cookies
    localStorage.removeItem('jwtToken');
    document.cookie = "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsLoggedIn(false);
    setUserName('');
    // Optionally redirect the user to the login page
    // window.location.href = '/login';
  };

  return (
    <>
      <nav className='text-white bg-gray-600/25 border-cyan-50 border-b-1
      items-center z-10 fixed top-0 w-full justify-between flex'>
        <Link to="/"
          className="text-[35px] pl-8 pt-2 m-[5px]  text-white cursive2 ">
          WhiteBoard
        </Link>
        <div className='arvo-bold text-[12px] m-[5px] '>
          {isLoggedIn ? (
            <>
              <Link to='/dashboard'className='pr-2 mr-5'> {userName}</Link>
              <button onClick={handleLogout} className='p-[10px] mr-5 border-[1px] rounded-2xl'>Logout</button>
            </>
          ) : (
            <Link to="/login" className='p-[10px] border-[1px] rounded-2xl mr-5'>Sign in / up</Link>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navi;