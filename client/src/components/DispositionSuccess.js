import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import './DispositionSuccess.css';

const DispositionSuccess = ({ onClose }) => {
  return (
    <motion.div
      className="disposition-success-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="disposition-success-modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, type: 'spring' }}
      >
        <motion.div
          className="success-icon-wrapper"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring', bounce: 0.5 }}
        >
          <CheckCircle size={80} className="success-icon" />
        </motion.div>

        <h2 className="success-title">Disposition Submitted!</h2>
        <p className="success-message">
          Your call disposition and notes have been successfully submitted.
        </p>

        <button
          className="btn btn-primary success-btn"
          onClick={onClose}
        >
          Start New Call
        </button>
      </motion.div>
    </motion.div>
  );
};

export default DispositionSuccess;
