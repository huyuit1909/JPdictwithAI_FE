import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="logo-text">Learning</span>
          <span className="logo-text-highlight">Management</span>
          <span className="logo-text">Board</span>
        </Link>
        <nav className="nav-menu">
          <Link to="/translate" className="nav-item">翻訳</Link>
          <Link to="/vocabulary" className="nav-item">単語帳</Link>
          <Link to="/search" className="nav-item">検索</Link>
          <Link to="/learning" className="nav-item">学習ボード</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 