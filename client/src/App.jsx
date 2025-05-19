import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navi from './components/header/Navi';
import Footer from './components/footer/Footer';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Join from './pages/Join';
import Home from './pages/Home';
import Rssue from './pages/Rssue';
import Board from './components/Board/Board';

function App() {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const location = useLocation();
    const navigate = useNavigate(); // Use useNavigate for redirection

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress < 100) {
                    return prevProgress + 10;
                } else {
                    clearInterval(interval);
                    setTimeout(() => {
                        setLoading(false);
                    }, 500);
                    return 100;
                }
            });
        }, 200);

        // Check for expired token
        const token = localStorage.getItem('token');
        const expiry = localStorage.getItem('tokenExpiry');

        if (token && expiry) {
            const now = new Date().getTime();
            const tokenExpiry = parseInt(expiry, 10);

            if (now > tokenExpiry) {
                localStorage.removeItem('token');
                localStorage.removeItem('tokenExpiry');
                console.warn('Token expired and removed from localStorage');
                toast.error('Your session has expired. Please log in again.', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                // Redirect to login using navigate
                navigate('/login');
            }
        }

        return () => clearInterval(interval);
    }, [navigate]); // Add navigate to the dependency array

    const isNavFooterHidden =
        location.pathname === '/dashboard' || location.pathname.startsWith('/board');

    if (loading) {
        return (
            <div className="fixed top-0 left-0 h-screen w-screen flex flex-col justify-center items-center bg-white">
                <h1 className="text-4xl font-bold text-blue-300 tracking-wider mb-8">
                    WhiteBoard
                </h1>
                <div className="relative w-64 bg-gray-100 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                        className="bg-blue-300 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="mt-4 text-gray-400 text-sm">Loading...</p>
            </div>
        );
    }

    return (
        <>
            <ToastContainer />
            {!isNavFooterHidden && <Navi />}
            <Routes>
                <Route path="" element={<Home />} />
                <Route path="login" element={<Signin />} />
                <Route path="register" element={<Signup />} />
                <Route path="join" element={<Join />} />
                <Route path="issue" element={<Rssue />} />
                <Route path="board" element={<Board />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="/board/:whiteboardId" element={<Board />} />
            </Routes>
            {!isNavFooterHidden && <Footer />}
        </>
    );
}

export default App;
