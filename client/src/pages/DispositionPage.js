import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import CallDisposition from '../components/CallDisposition';
import DispositionSuccess from '../components/DispositionSuccess';

function DispositionPage() {
  const navigate = useNavigate();
  const [callData, setCallData] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Retrieve call data from sessionStorage
    const storedData = sessionStorage.getItem('dispositionData');

    if (storedData) {
      setCallData(JSON.parse(storedData));
    } else {
      // If no call data, redirect back to main page
      navigate('/');
    }
  }, [navigate]);

  const handleDispositionSubmit = async (dispositionData) => {
    try {
      console.log('Submitting disposition data:', dispositionData);

      // Send disposition data to backend webhook endpoint
      const response = await fetch('/submit-disposition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dispositionData),
      });

      const result = await response.json();
      console.log('Disposition submission result:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit disposition');
      }

      // Clear stored data
      sessionStorage.removeItem('dispositionData');

      // Show success screen
      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting disposition:', error);
      alert('Failed to submit disposition. Please try again.');
    }
  };

  const handleDispositionCancel = () => {
    // Clear stored data and navigate back to main page
    sessionStorage.removeItem('dispositionData');
    navigate('/');
  };

  const handleSuccessClose = () => {
    // Navigate back to main page
    navigate('/');
  };

  if (!callData) {
    return null; // Or a loading spinner
  }

  return (
    <>
      {/* Call Disposition Form */}
      <AnimatePresence>
        {!showSuccess && (
          <CallDisposition
            callData={callData}
            onSubmit={handleDispositionSubmit}
            onCancel={handleDispositionCancel}
          />
        )}
      </AnimatePresence>

      {/* Success Screen */}
      <AnimatePresence>
        {showSuccess && (
          <DispositionSuccess
            onClose={handleSuccessClose}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default DispositionPage;
