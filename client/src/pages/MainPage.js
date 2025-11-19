import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CallForm from '../components/CallForm';
import CallControls from '../components/CallControls';
import LiveListening from '../components/LiveListening';

function MainPage() {
  const navigate = useNavigate();
  const [callData, setCallData] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);

  const handleCallInitiated = (data) => {
    setCallData(data);
    setIsCallActive(true);
  };

  const handleCallEnded = (finalCallData = {}) => {
    // When call ends, navigate to disposition page
    const dispositionData = {
      ...callData,
      ...finalCallData,
      callEndTime: new Date().toISOString(),
    };

    // Store disposition data in sessionStorage for the disposition page
    sessionStorage.setItem('dispositionData', JSON.stringify(dispositionData));

    // Navigate to disposition page
    navigate('/disposition');
  };

  return (
    <main className="main-content">
      <div className="cards-container">
        {/* Dialer - Always visible */}
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

        {/* Controls - Always visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <CallControls
            callData={callData}
            onCallEnded={handleCallEnded}
          />
        </motion.div>

        {/* Live Listening - Always visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <LiveListening
            callData={callData}
          />
        </motion.div>
      </div>
    </main>
  );
}

export default MainPage;
