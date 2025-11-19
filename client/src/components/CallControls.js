import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Plus, 
  Mic, 
  MicOff, 
  Play, 
  PhoneOff, 
  Send,
  Settings,
  AlertCircle,
  PhoneForwarded
} from 'lucide-react';

const CallControls = ({ callData, onCallEnded }) => {
  const [sayMessage, setSayMessage] = useState('');
  const [addMessageContent, setAddMessageContent] = useState('');
  const [addMessageRole, setAddMessageRole] = useState('system');
  const [transferNumber, setTransferNumber] = useState('');
  const [transferMessage, setTransferMessage] = useState('Transferring your call now');
  const [isLoading, setIsLoading] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isCallActive = !!callData;

  const getControlUrl = (listenUrl) => {
    return listenUrl.replace("/listen", "/control").replace("wss://", "https://");
  };

  const sendControlRequest = async (payload, actionType) => {
    if (!isCallActive) return;

    setIsLoading(prev => ({ ...prev, [actionType]: true }));
    setError('');
    setSuccess('');

    try {
      const controlUrl = getControlUrl(callData.listenUrl);
      const response = await fetch('/control-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ controlUrl, ...payload }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`${actionType} successful!`);
        setTimeout(() => setSuccess(''), 3000);

        // Clear input fields after successful actions
        if (actionType === 'say') setSayMessage('');
        if (actionType === 'add-message') setAddMessageContent('');
        if (actionType === 'transfer') {
          setTransferNumber('');
          setTransferMessage('Transferring your call now');
          // End the call UI after successful transfer
          setTimeout(() => onCallEnded(), 2000);
        }
        if (actionType === 'end-call') {
          // Ensure UI updates after successful end call
          setTimeout(() => onCallEnded(), 1000);
        }
      } else {
        setError(data.error || `Failed to ${actionType}`);
      }
    } catch (err) {
      console.error(`Error with ${actionType}:`, err);
      setError(`Network error during ${actionType}`);
    } finally {
      setIsLoading(prev => ({ ...prev, [actionType]: false }));
    }
  };

  const handleSay = () => {
    if (!sayMessage.trim()) return;
    sendControlRequest({ type: "say", content: sayMessage }, 'say');
  };

  const handleAddMessage = () => {
    if (!addMessageContent.trim()) return;
    sendControlRequest({
      type: "add-message",
      message: { role: addMessageRole, content: addMessageContent },
      triggerResponseEnabled: true
    }, 'add-message');
  };

  const handleTransfer = () => {
    if (!transferNumber.trim()) return;
    sendControlRequest({
      type: "transfer",
      destination: {
        type: "number",
        number: transferNumber
      },
      content: transferMessage
    }, 'transfer');
  };

  const handleAssistantControl = (controlType) => {
    sendControlRequest({ type: "control", control: controlType }, controlType);
  };

  const handleEndCall = () => {
    sendControlRequest({ type: "end-call" }, 'end-call');
  };

  return (
    <div className="glass-card call-controls-card">
      <div className="call-controls-header">
        <div className="call-controls-title-section">
          <h2 className="card-title call-controls-title">
            <Settings className="inline-icon" />
            Call Controls
          </h2>
          <p className="card-subtitle call-controls-subtitle">Advanced call management</p>
        </div>

        <div className="call-controls-status-section">
          <div className={`status-indicator compact ${isCallActive ? 'status-active' : 'status-inactive'}`}>
            {isCallActive && <div className="pulse-dot"></div>}
            {isCallActive ? 'Call Active' : 'No Active Call'}
          </div>
          {isCallActive && callData.listenUrl && (
            <div className="listen-url-compact">
              {callData.listenUrl}
            </div>
          )}
        </div>
      </div>

      <div className="call-controls-content">
        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="success-message"
          >
            {success}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="error-message"
          >
            <AlertCircle size={16} className="inline-icon" />
            {error}
          </motion.div>
        )}

        {/* Say Message Section */}
        <div className="control-section">
          <h3 className="section-title">
            <MessageSquare size={18} className="inline-icon" />
            Say Message
          </h3>
          <div className="form-group">
            <input
              type="text"
              value={sayMessage}
              onChange={(e) => setSayMessage(e.target.value)}
              placeholder="Enter message for assistant to say"
              className="form-input"
              disabled={!isCallActive || isLoading.say}
            />
            <motion.button
              onClick={handleSay}
              className="btn btn-primary"
              disabled={!isCallActive || !sayMessage.trim() || isLoading.say}
              whileHover={{ scale: (!isCallActive || !sayMessage.trim() || isLoading.say) ? 1 : 1.02 }}
              whileTap={{ scale: (!isCallActive || !sayMessage.trim() || isLoading.say) ? 1 : 0.98 }}
            >
              {isLoading.say ? (
                <>Loading...</>
              ) : (
                <>
                  <Send size={16} className="inline-icon" />
                  Say
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Add Message Section */}
        <div className="control-section">
          <h3 className="section-title">
            <Plus size={18} className="inline-icon" />
            Add to Conversation
          </h3>
          <div className="form-group">
            <input
              type="text"
              value={addMessageContent}
              onChange={(e) => setAddMessageContent(e.target.value)}
              placeholder="Message content"
              className="form-input"
              disabled={!isCallActive || isLoading['add-message']}
            />
            <select
              value={addMessageRole}
              onChange={(e) => setAddMessageRole(e.target.value)}
              className="form-select"
              disabled={!isCallActive || isLoading['add-message']}
            >
              <option value="system">System</option>
              <option value="user">User</option>
              <option value="assistant">Assistant</option>
            </select>
            <motion.button
              onClick={handleAddMessage}
              className="btn btn-secondary"
              disabled={!isCallActive || !addMessageContent.trim() || isLoading['add-message']}
              whileHover={{ scale: (!isCallActive || !addMessageContent.trim() || isLoading['add-message']) ? 1 : 1.02 }}
              whileTap={{ scale: (!isCallActive || !addMessageContent.trim() || isLoading['add-message']) ? 1 : 0.98 }}
            >
              {isLoading['add-message'] ? (
                <>Loading...</>
              ) : (
                <>
                  <Plus size={16} className="inline-icon" />
                  Add Message
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Transfer Call Section */}
        <div className="control-section">
          <h3 className="section-title">
            <PhoneForwarded size={18} className="inline-icon" />
            Transfer Call
          </h3>
          <div className="form-group">
            <input
              type="tel"
              value={transferNumber}
              onChange={(e) => setTransferNumber(e.target.value)}
              placeholder="Destination number (e.g., +1234567890)"
              className="form-input"
              disabled={!isCallActive || isLoading.transfer}
            />
            <input
              type="text"
              value={transferMessage}
              onChange={(e) => setTransferMessage(e.target.value)}
              placeholder="Transfer message"
              className="form-input"
              disabled={!isCallActive || isLoading.transfer}
            />
            <motion.button
              onClick={handleTransfer}
              className="btn btn-secondary"
              disabled={!isCallActive || !transferNumber.trim() || isLoading.transfer}
              whileHover={{ scale: (!isCallActive || !transferNumber.trim() || isLoading.transfer) ? 1 : 1.02 }}
              whileTap={{ scale: (!isCallActive || !transferNumber.trim() || isLoading.transfer) ? 1 : 0.98 }}
            >
              {isLoading.transfer ? (
                <>Transferring...</>
              ) : (
                <>
                  <PhoneForwarded size={16} className="inline-icon" />
                  Transfer Call
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Assistant Controls */}
        <div className="control-section">
          <h3 className="section-title">Assistant Controls</h3>
          <div className="btn-group">
            <motion.button
              onClick={() => handleAssistantControl('mute-assistant')}
              className="btn btn-secondary"
              disabled={!isCallActive || isLoading['mute-assistant']}
              whileHover={{ scale: (!isCallActive || isLoading['mute-assistant']) ? 1 : 1.02 }}
              whileTap={{ scale: (!isCallActive || isLoading['mute-assistant']) ? 1 : 0.98 }}
            >
              <MicOff size={16} className="inline-icon" />
              Mute
            </motion.button>
            <motion.button
              onClick={() => handleAssistantControl('unmute-assistant')}
              className="btn btn-secondary"
              disabled={!isCallActive || isLoading['unmute-assistant']}
              whileHover={{ scale: (!isCallActive || isLoading['unmute-assistant']) ? 1 : 1.02 }}
              whileTap={{ scale: (!isCallActive || isLoading['unmute-assistant']) ? 1 : 0.98 }}
            >
              <Mic size={16} className="inline-icon" />
              Unmute
            </motion.button>
          </div>
          <motion.button
            onClick={() => handleAssistantControl('say-first-message')}
            className="btn btn-secondary"
            disabled={!isCallActive || isLoading['say-first-message']}
            whileHover={{ scale: (!isCallActive || isLoading['say-first-message']) ? 1 : 1.02 }}
            whileTap={{ scale: (!isCallActive || isLoading['say-first-message']) ? 1 : 0.98 }}
          >
            <Play size={16} className="inline-icon" />
            Say First Message
          </motion.button>
        </div>

        {/* End Call */}
        <div className="control-section">
          <motion.button
            onClick={handleEndCall}
            className="btn btn-danger"
            disabled={!isCallActive || isLoading['end-call']}
            whileHover={{ scale: (!isCallActive || isLoading['end-call']) ? 1 : 1.02 }}
            whileTap={{ scale: (!isCallActive || isLoading['end-call']) ? 1 : 0.98 }}
          >
            <PhoneOff size={16} className="inline-icon" />
            {isLoading['end-call'] ? 'Ending Call...' : 'End Call'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CallControls; 