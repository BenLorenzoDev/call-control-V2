import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CallForm from '../components/CallForm';
import CallControls from '../components/CallControls';
import LiveListening from '../components/LiveListening';

function MainPage() {
  const navigate = useNavigate();
  const [callData, setCallData] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const pollingIntervalRef = useRef(null);
  const isEndingRef = useRef(false);

  const handleCallInitiated = (data) => {
    setCallData(data);
    setIsCallActive(true);
    isEndingRef.current = false;
  };

  const handleCallEnded = useCallback((finalCallData = {}) => {
    // Prevent multiple triggers
    if (isEndingRef.current && !finalCallData.endedBy) {
      return;
    }
    isEndingRef.current = true;

    // Clear polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // When call ends, navigate to disposition page
    const dispositionData = {
      ...callData,
      ...finalCallData,
      callEndTime: new Date().toISOString(),
    };

    // Store disposition data in sessionStorage for the disposition page
    sessionStorage.setItem('dispositionData', JSON.stringify(dispositionData));

    // Reset call state
    setIsCallActive(false);
    setCallData(null);

    // Navigate to disposition page
    navigate('/disposition');
  }, [callData, navigate]);

  // Poll call status to detect when customer ends the call
  useEffect(() => {
    if (isCallActive && callData?.callId) {
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const response = await fetch(`/call-status/${callData.callId}`);
          const data = await response.json();

          if (data.success && data.status === 'ended' && !isEndingRef.current) {
            console.log('Call ended detected via polling:', data);
            isEndingRef.current = true;
            clearInterval(pollingIntervalRef.current);
            handleCallEnded({
              endedBy: data.endedReason || 'customer',
              duration: data.duration
            });
          }
        } catch (error) {
          console.error('Error polling call status:', error);
        }
      }, 3000); // Poll every 3 seconds

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [isCallActive, callData?.callId, handleCallEnded]);

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
              onCallEnded={handleCallEnded}
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
