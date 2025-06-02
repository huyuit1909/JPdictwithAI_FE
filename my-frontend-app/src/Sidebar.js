// src/components/Sidebar.js
import React, { useState } from 'react';
import './styles/Sidebar.css';
import { BiAnalyse } from 'react-icons/bi';
import { FaChevronDown, FaChevronRight, FaAtlas, FaFileAlt, FaSearch, FaBook, FaChalkboardTeacher, FaChevronLeft, FaChevronCircleLeft } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandVocabulary, setExpandVocabulary] = useState(false);
  const [expandTranslateText, setExpandTranslateText] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setExpandVocabulary(false);
      setExpandTranslateText(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        {isCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
      </div>
      
      <ul>
        {/* Vocabulary Section */}
        <li 
          onClick={() => !isCollapsed && setExpandVocabulary(!expandVocabulary)} 
          className={`section-title ${expandVocabulary ? 'active' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaBook className="icon" style={{ marginRight: '10px' }} />
            {!isCollapsed && <span>Old to New Words</span>}
          </div>
          {!isCollapsed && (
            expandVocabulary ? <FaChevronDown className="arrow-icon" /> : <FaChevronRight className="arrow-icon" />
          )}
        </li>
        <div className={`sub-menu ${expandVocabulary ? 'expanded' : ''}`}>
          <li
            onClick={() => navigate('/search-word')}
            className={`sub-menu-item ${isActive('/search-word') ? 'active' : ''}`}
          >
            <FaSearch className="icon" />
            {!isCollapsed && <span>Search Word</span>}
          </li>
          <li
            onClick={() => navigate('/vocabulary-list')}
            className={`sub-menu-item ${isActive('/vocabulary-list') ? 'active' : ''}`}
          >
            <FaBook className="icon" />
            {!isCollapsed && <span>Vocabulary List</span>}
          </li>
          <li
            onClick={() => navigate('/learning-board')}
            className={`sub-menu-item ${isActive('/learning-board') ? 'active' : ''}`}
          >
            <FaChalkboardTeacher className="icon" />
            {!isCollapsed && <span>Learning Board</span>}
          </li>
        </div>

        {/* Translate Section */}
        <li 
          onClick={() => !isCollapsed && setExpandTranslateText(!expandTranslateText)}
          className={`section-title ${expandTranslateText ? 'active' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaAtlas className="icon" style={{ marginRight: '10px' }} />
            {!isCollapsed && <span>Translate</span>}
          </div>
          {!isCollapsed && (
            expandTranslateText ? <FaChevronDown className="arrow-icon" /> : <FaChevronRight className="arrow-icon" />
          )}
        </li>
        <div className={`sub-menu ${expandTranslateText ? 'expanded' : ''}`}>
          <li
            onClick={() => navigate('/translate-text')}
            className={`sub-menu-item ${isActive('/translate-text') ? 'active' : ''}`}
          >
            <FaAtlas className="icon" />
            {!isCollapsed && <span>Translate Text</span>}
          </li>
          <li
            onClick={() => navigate('/translate-file')}
            className={`sub-menu-item ${isActive('/translate-file') ? 'active' : ''}`}
          >
            <FaFileAlt className="icon" />
            {!isCollapsed && <span>Translate File</span>}
          </li>
        </div>
      </ul>
    </aside>
  );
};

export default Sidebar;