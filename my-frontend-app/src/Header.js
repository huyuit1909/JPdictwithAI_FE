import React from 'react';
import './styles/Header.css';

const Header = ({ onCheckClick, onAssistantClick }) => {
  return (
    <header className="header">
      <div className="logo" onClick={() => window.location.reload()} style={{ cursor: 'pointer' }}>
        <div className="logo-icon">
          <img src={`./main_icon.png`} alt="JapNative Icon" className="logo-image" />
        </div>
      </div>
      <div className="header-buttons">
        <button className="assistant-button" onClick={onAssistantClick}>Assistant</button>
      </div>
    </header>
  );
};

export default Header;