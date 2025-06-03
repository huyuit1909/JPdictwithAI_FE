import React, { useState } from 'react';
import './styles/Header.css';
import AssistantModal from './AssistantModal';

const Header = ({ onCheckClick }) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const handleAssistantClick = () => {
    setIsAssistantOpen(true);
  };

  return (
    <>
      <header className="header">
        <div className="logo" onClick={() => window.location.reload()} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">
            <img src={`./main_icon.png`} alt="JapNative Icon" className="logo-image" />
          </div>
        </div>
        <div className="header-buttons">
          <button className="assistant-button" onClick={handleAssistantClick}>Assistant</button>
        </div>
      </header>

      <AssistantModal 
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </>
  );
};

export default Header;