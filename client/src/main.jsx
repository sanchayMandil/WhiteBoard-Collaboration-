import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar'; // Import the loading bar component

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppWithLoadingBar />
    </BrowserRouter>
  </StrictMode>
);

function AppWithLoadingBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress for demonstration purposes
    let interval;
    const startLoading = () => {
      setProgress(10);
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress < 100) {
            return prevProgress + 10;
          } else {
            clearInterval(interval);
            return 0; // Reset progress
          }
        });
      }, 300);
    };

    const stopLoading = () => {
      setProgress(100);
      clearInterval(interval);
      setTimeout(() => {
        setProgress(0);
      }, 500); // Small delay to show completion
    };

    // In a real application, you would trigger startLoading and stopLoading
    // based on your application's loading states (e.g., API calls).
    // For this example, we'll just simulate it on mount and unmount.
    startLoading();

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <>
      <LoadingBar
        color='#f11946'
        progress={progress}
        height={3}
        shadow={true}
      />
      <App />
    </>
  );
}