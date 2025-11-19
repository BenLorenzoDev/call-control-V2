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
      <div className="main-layout">
        {/* Top Row: Dialer + Live Listening */}
        <div className="top-row">
          <motion.div
            className="top-row-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CallForm
              onCallInitiated={handleCallInitiated}
              isCallActive={isCallActive}
            />
          </motion.div>

          <motion.div
            className="top-row-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <LiveListening
              callData={callData}
            />
          </motion.div>
        </div>

        {/* Bottom Row: Call Controls (Full Width) */}
        <motion.div
          className="bottom-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <CallControls
            callData={callData}
            onCallEnded={handleCallEnded}
          />
        </motion.div>
      </div>
    </main>
  );
}

export default MainPage;
