import React, { useState } from 'react';
import './styles/Header.css';
import AssistantModal from './AssistantModal';
import GrammarChecker from './GrammarChecker';

const Header = ({ onCheckClick }) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isGrammarCheckerOpen, setIsGrammarCheckerOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleAssistantClick = () => {
    setShowMenu(false);
    setIsAssistantOpen(true);
  };

  const handleGrammarCheckerClick = () => {
    setShowMenu(false);
    setIsGrammarCheckerOpen(true);
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
          <div className="relative assistant-container"
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
          >
            <button className="assistant-button">
              Assistant
            </button>
            <div className={`circular-menu ${showMenu ? 'active' : ''}`}>
              <button
                className="circular-button grammar-check"
                onClick={handleGrammarCheckerClick}
                style={{ '--delay': '0.1s' }}
              >
                文法チェック
              </button>
              <button
                className="circular-button text-assist"
                onClick={handleAssistantClick}
                style={{ '--delay': '0.2s' }}
              >
                文章アシスタント
              </button>
            </div>
          </div>
        </div>
      </header>

      <AssistantModal 
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />

      {isGrammarCheckerOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={() => setIsGrammarCheckerOpen(false)}>
              ×
            </button>
            <GrammarChecker />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;