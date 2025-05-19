import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';

const ENDPOINT = 'http://localhost:5001';

const Rssue = () => {
  const navigate = useNavigate();
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  // Validation regex: starts with letter, allows letters, numbers, spaces, and underscores only
  const titleRegex = /^[a-zA-Z][a-zA-Z0-9_ ]*$/;

  const validateTitle = (title) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return 'Issue title is required';
    }
    if (!titleRegex.test(trimmedTitle)) {
      return 'Title must start with a letter and contain only letters, numbers, spaces, or underscores';
    }
    return '';
  };

  const validateDescription = (description) => {
    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      return 'Issue description is required';
    }
    return '';
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setIssueTitle(newTitle);
    setTitleError(validateTitle(newTitle));
  };

  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value;
    setIssueDescription(newDescription);
    setDescriptionError(validateDescription(newDescription));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!issueTitle || !issueDescription) {
      toast.error('Please fill in all fields', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
        transition: Bounce,
      });
      return;
    }
    const trimmedTitle = issueTitle.trim();
    const trimmedDescription = issueDescription.trim();

    const titleValidationError = validateTitle(trimmedTitle);
    const descriptionValidationError = validateDescription(trimmedDescription);

    if (titleValidationError || descriptionValidationError) {
      setTitleError(titleValidationError);
      setDescriptionError(descriptionValidationError);
      if (titleValidationError) {
        toast.error(titleValidationError, {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
          transition: Bounce,
        });
      }
      if (descriptionValidationError) {
        toast.error(descriptionValidationError, {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
          transition: Bounce,
        });
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to submit an issue', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
        transition: Bounce,
      });
      navigate('/');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const email = decoded.email || 'Unknown Email';
      await axios.post(`${ENDPOINT}/issue`, {
        title: trimmedTitle,
        description: trimmedDescription,
        email,
      });
      toast.success('Issue Submitted Successfully!', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
        transition: Bounce,
        onClose: () => navigate('/dashboard'),
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid session. Please log in again.';
      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
        transition: Bounce,
      });
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg transform transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Report an Issue</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-5">
            <label
              htmlFor="issueTitle"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Issue Title
            </label>
            <input
              type="text"
              id="issueTitle"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-200 ${
                titleError ? 'border-red-500' : 'border-gray-300'
              }`}
              value={issueTitle}
              onChange={handleTitleChange}
              aria-invalid={!!titleError}
              aria-describedby={titleError ? 'titleError' : undefined}
              placeholder="Enter issue title"
            />
            {titleError && (
              <p id="titleError" className="mt-1 text-sm text-red-600" role="alert">
                {titleError}
              </p>
            )}
          </div>
          <div className="mb-6">
            <label
              htmlFor="issueDescription"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Issue Description
            </label>
            <textarea
              id="issueDescription"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-200 resize-y ${
                descriptionError ? 'border-red-500' : 'border-gray-300'
              }`}
              value={issueDescription}
              onChange={handleDescriptionChange}
              rows="5"
              aria-invalid={!!descriptionError}
              aria-describedby={descriptionError ? 'descriptionError' : undefined}
              placeholder="Describe the issue in detail"
            />
            {descriptionError && (
              <p id="descriptionError" className="mt-1 text-sm text-red-600" role="alert">
                {descriptionError}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!!titleError || !!descriptionError}
          >
            Submit Issue
          </button>
        </form>
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
    </div>
  );
};

export default Rssue;