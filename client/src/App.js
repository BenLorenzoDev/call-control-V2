import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import CallForm from './components/CallForm';
import CallControls from './components/CallControls';
import LiveListening from './components/LiveListening';
import CallDisposition from './components/CallDisposition';
import DispositionSuccess from './components/DispositionSuccess';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [callData, setCallData] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [showDisposition, setShowDisposition] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dispositionCallData, setDispositionCallData] = useState(null);

  const handleCallInitiated = (data) => {
    setCallData(data);
    setIsCallActive(true);
  };

  const handleCallEnded = (finalCallData = {}) => {
    // When call ends, show disposition screen instead of clearing
    setIsCallActive(false);
    setDispositionCallData({
      ...callData,
      ...finalCallData,
      callEndTime: new Date().toISOString(),
    });
    setShowDisposition(true);
  };

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

      // Show success screen
      setShowDisposition(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting disposition:', error);
      alert('Failed to submit disposition. Please try again.');
    }
  };

  const handleDispositionCancel = () => {
    // User cancelled disposition, reset everything
    setShowDisposition(false);
    setCallData(null);
    setDispositionCallData(null);
  };

  const handleSuccessClose = () => {
    // Close success screen and reset to initial state
    setShowSuccess(false);
    setCallData(null);
    setDispositionCallData(null);
  };

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        <div className="cards-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CallForm 
              onCallInitiated={handleCallInitiated}
              isCallActive={isCallActive}
            />
          </motion.div>

          <AnimatePresence>
            {isCallActive && callData && (
              <>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <CallControls 
                    callData={callData}
                    onCallEnded={handleCallEnded}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <LiveListening 
                    callData={callData}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />

      {/* Call Disposition Modal */}
      <AnimatePresence>
        {showDisposition && dispositionCallData && (
          <CallDisposition
            callData={dispositionCallData}
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
    </div>
  );
}

export default App;
