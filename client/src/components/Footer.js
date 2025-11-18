import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <motion.footer 
      className="footer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    >
      <div className="footer-content">
        <p className="footer-text">
          © 2025{' '}
          <a
            href="https://tambayanph.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Tambayan PH
            <ExternalLink size={12} className="external-icon" />
          </a>
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer; 