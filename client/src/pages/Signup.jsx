import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passMatch, setPassMatch] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState('');
    const [vopt, setVotp] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const navigate = useNavigate();

    // Username validation: cannot start with number, only letters and numbers allowed
    const validateUsername = useCallback((value) => {
        if (!value) {
            setUsernameError('Username is required');
            return false;
        }
        if (/^\d/.test(value)) {
            setUsernameError('Username cannot start with a number');
            return false;
        }
        if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(value)) {
            setUsernameError('Username can only contain letters and numbers');
            return false;
        }
        if (value.length < 3) {
            setUsernameError('Username must be at least 3 characters');
            return false;
        }
        setUsernameError('');
        return true;
    }, []);

    const checkCorrect = useCallback((str) => {
        if (password !== str) {
            setPassMatch('*Passwords do not match');
        } else {
            setPassMatch('');
        }
        setConfirmPassword(str);
    }, [password]);

    const handleRegSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (password === confirmPassword && otp === vopt && validateUsername(username)) {
            try {
                const res = await axios.post('http://localhost:5001/register', { username, email, password, otp });
                toast.success('Registered Successfully! ' + username, {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                    onClose: () => navigate('/login'),
                });
            } catch (err) {
                toast.error('ERROR!!', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                });
                if (err.response && err.response.data && err.response.data.message) {
                    setPassMatch(err.response.data.message);
                } else {
                    setPassMatch("Registration failed. Please try again.");
                }
            }
        }
    }, [password, confirmPassword, otp, vopt, navigate, username]);

    useEffect(() => {
        const isUsernameValid = validateUsername(username);
        setIsButtonDisabled(
            !(isUsernameValid && email && password && confirmPassword && 
              password === confirmPassword && (showOtpInput ? otp.length === 6 : true))
        );
    }, [username, email, password, confirmPassword, showOtpInput, otp, validateUsername]);

    const handleVerifyEmail = useCallback(async () => {
        try {
            const res = await axios.post('http://localhost:5001/verify', { email });
            const { allow, opt } = res.data;
            setVotp(opt);
            setShowOtpInput(allow);
        } catch (err) {
            toast.error('Failed to send verification email!!', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }
    }, [email]);

    return (
        <>
            <div className="flex justify-center p-[80px] bg-gray-200 bg-[url(https://media.istockphoto.com/id/1407863570/photo/innovation-through-ideas-and-inspiration-ideas-human-hand-holding-light-bulb-to-illuminate.jpg?s=612x612&w=0&k=20&c=XqD2JdywyodLSm32dkpjIIMeTsrqc8r7yzXWXUA4fks=)] bg-no-repeat bg-cover">
                <div className="border-black mt-10 drop-shadow-2xl bg-white border-2 rounded-[15px] inline-block p-[50px]">
                    <form className="flex-col justify-between" onSubmit={handleRegSubmit}>
                        <label className="text-[50px] font-bold">Register</label>
                        <br />
                        <div>
                            <input
                                className="m-[15px] p-[5px] border-black rounded-[10px] border-[2px] h-[50px] w-[300px]"
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    validateUsername(e.target.value);
                                }}
                                required
                                minLength="3"
                            />
                            {usernameError && (
                                <label className="pl-[15px] text-red-500 block">{usernameError}</label>
                            )}
                        </div>
                        <div className="flex items-center">
                            <input
                                className="m-[15px] p-[5px] border-black rounded-[10px] border-[2px] h-[50px] w-[200px]"
                                type="email"
                                placeholder="Email"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="button" className="m-[15px] p-[5px] bg-blue-500 text-white rounded" onClick={handleVerifyEmail}>Verify</button>
                        </div>
                        {showOtpInput && (
                            <>
                                <input
                                    className="m-[15px] p-[5px] border-black rounded-[10px] border-[2px] h-[50px] w-[300px]"
                                    type="text"
                                    placeholder="OTP (6 digits)"
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength="6"
                                    required
                                />
                                <br />
                            </>
                        )}
                        <input
                            className="m-[15px] p-[5px] border-black rounded-[10px] border-[2px] h-[50px] w-[300px]"
                            type="password"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength="8"
                        />
                        <br />
                        <input
                            className="m-[15px] p-[5px] border-black rounded-[10px] border-[2px] h-[50px] w-[300px]"
                            type="password"
                            placeholder="Confirm Password"
                            onChange={(e) => checkCorrect(e.target.value)}
                            required
                        />
                        <br />
                        <label className="pl-[15px] text-red-500">{passMatch}</label>
                        <br />
                        <button
                            className={`m-[15px] p-[12px] rounded-2xl text-white text-[20px] ${
                                isButtonDisabled
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-900 cursor-pointer"
                            }`}
                            type="submit"
                            disabled={isButtonDisabled}
                        >
                            {isButtonDisabled ? (
                                <>
                                    <i className="fas fa-ban mr-2"></i> Register
                                </>
                            ) : (
                                "Register"
                            )}
                        </button>
                        <br />
                    </form>
                    <div className="flex justify-center mt-[20px]">
                        <label>Already have an account?</label>
                        <Link className="text-[18px] text-gray-600 hover:underline hover:text-blue-800" to="/login">Sign up</Link>
                    </div>
                </div>
                <ToastContainer
                    position="top-center"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick={false}
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                    transition={Bounce}
                />
            </div>
        </>
    );
}

export default Signup;