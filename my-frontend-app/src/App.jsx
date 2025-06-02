import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./Sidebar";
import SearchWord from "./SearchWord";
import VocabularyList from "./VocabularyList";
import LearningBoard from "./LearningBoard";
import TranslateText from "./TranslateText";
import Header from "./Header";
import "./styles/tailwind.css";

function App() {
  return (
    <Router>
      <div style={{ display: "flex" }}>
        <Header />
        <Sidebar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/search-word" />} />
            <Route path="/search-word" element={<SearchWord />} />
            <Route path="/vocabulary-list" element={<VocabularyList />} />
            <Route path="/learning-board" element={<LearningBoard />} />
            <Route path="/translate-text" element={<TranslateText />} />
            {/* Thêm các route khác nếu cần */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
