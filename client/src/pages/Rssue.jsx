import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ENDPOINT = 'http://localhost:5001';

const Rssue = () => {
  const navigate = useNavigate();
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to access the whiteboard');
      toast.error('Please log in to access the whiteboard');
      navigate('/');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const email = decoded.email || 'Unknown Email';
      const response = await axios.post(`${ENDPOINT}/issue`, { title: issueTitle, description: issueDescription, email });
      toast.success('Issue Submitted Successfully!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true, // Allow closing on click
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
        onClose: () => navigate('/dashboard'), // Redirect on toast close
      });
      // No need for navigate('/dashboard') here as it's in onClose
    } catch (err) {
      setError('Invalid session. Please log in again.');
      toast.error('Invalid session. Please log in again.', { // Use the generic error message
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true, // Allow closing on click
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-md my-25 p-6 w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Report an Issue</h2>
      <div className="mb-4">
        <label htmlFor="issueTitle" className="block text-gray-700 text-sm font-bold mb-2">
          Issue Title:
        </label>
        <input
          type="text"
          id="issueTitle"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={issueTitle}
          onChange={(e) => setIssueTitle(e.target.value)}
        />
      </div>
      <div className="mb-6">
        <label htmlFor="issueDescription" className="block text-gray-700 text-sm font-bold mb-2">
          Issue Description:
        </label>
        <textarea
          id="issueDescription"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={issueDescription}
          onChange={(e) => setIssueDescription(e.target.value)}
          rows="4"
        />
      </div>
      <button
        onClick={handleSubmit}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Submit Issue
      </button>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </div>
  );
};

export default Rssue;