// src/components/Sidebar.js
import React, { useEffect, useState } from 'react';
import './styles/Sidebar.css';
import { API_URL } from './config';
import { BiAnalyse } from 'react-icons/bi';
import { FaChevronDown, FaChevronRight, FaAtlas, FaFileAlt, FaSearch, FaBook, FaChalkboardTeacher } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [items, setItems] = useState([]);
  const [expandCorrectText, setExpandCorrectText] = useState(false);
  const [expandTranslateText, setExpandTranslateText] = useState(false);
  const [expandVocabulary, setExpandVocabulary] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();


  return (
    <aside className="sidebar">
      <ul>
        {/* Vocabulary Section */}
        <li onClick={() => setExpandVocabulary(!expandVocabulary)} className="section-title">
          Old to New Words
          {expandVocabulary ? <FaChevronDown className="arrow-icon" /> : <FaChevronRight className="arrow-icon" />}
        </li>
        {expandVocabulary && (
          <ul className="sub-menu">
            {/* Search Word */}
            <li
              onClick={() => navigate('/search-word')}
              className="sub-menu-item"
            >
              <FaSearch className="icon" />
              Search Word
            </li>
            {/* Vocabulary List */}
            <li
              onClick={() => navigate('/vocabulary-list')}
              className="sub-menu-item"
            >
              <FaBook className="icon" />
              Vocabulary List
            </li>
            {/* Learning Board */}
            <li
              onClick={() => navigate('/learning-board')}
              className="sub-menu-item"
            >
              <FaChalkboardTeacher className="icon" />
              Learning Board
            </li>
          </ul>
        )}

        {/* Translate Section */}
        <li onClick={() => setExpandTranslateText(!expandTranslateText)} className="section-title">
          Translate
          {expandTranslateText ? <FaChevronDown className="arrow-icon" /> : <FaChevronRight className="arrow-icon" />}
        </li>
        {expandTranslateText && (
          <ul className="sub-menu">
            <li
              onClick={() => navigate('/translate-text')}
              className="sub-menu-item"
            >
              <FaAtlas className="icon" />
              Translate Text
            </li>
            <li
              onClick={() => navigate('/translate-file')}
              className="sub-menu-item"
            >
              <FaFileAlt className="icon" />
              Translate File
            </li>
          </ul>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;