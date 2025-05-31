import React, { useState } from "react";
  import axios from "axios";
  import ReactMarkdown from "react-markdown";
  import { API_URL } from "./config";
  import "./styles/SearchWord.css";

  const SearchWord = () => {
    const [word, setWord] = useState("");
    const [result, setResult] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [addSuccess, setAddSuccess] = useState(false);
    const [selectedModel, setSelectedModel] = useState("google");

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!word) return;

      setLoading(true);
      setError("");
      setResult({});
      setAddSuccess(false);
      try {
        const res = await axios.post(
          `${API_URL}/search`,
          { word },
          {
            headers: {
              "Content-Type": "application/json",
              "x-model": selectedModel,
            },
          }
        );
        setResult({ ...res.data.result, word });
        console.log("API Response:", res.data);
      } catch (err) {
        console.error("Full error response:", err.response);
        if (err.response && err.response.status === 400) {
          setError("Bad Request: Please check the word you entered.");
        } else {
          setError("An error occurred while searching.");
        }
      } finally {
        setLoading(false);
      }
    };

    const handleAddToVocabulary = async () => {
      if (!result || Object.keys(result).length === 0) return;

      setAddSuccess(false);
      setError("");
      try {
        const response = await axios.post(
          `${API_URL}/add`,
          {
            word: result.word,
            meaning: result.meaning,
            usage: result.usage,
            examples: result.examples,
            tips: result.tips,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setAddSuccess(true);
        console.log("Add to vocabulary success:", response.data);
      } catch (err) {
        console.error("Add to vocabulary error:", err.response);
        setError("Failed to add the word to your vocabulary list.");
      }
    };

    // Hàm chuẩn hóa markdown: loại bỏ khoảng trắng đầu dòng, chuẩn hóa dấu *
    function normalizeMarkdown(text) {
      if (!text) return "";
      return text
        .split("\n")
        .map((line) =>
          // Chuẩn hóa đầu dòng cho *, -, số thứ tự, loại bỏ khoảng trắng thừa
          line
            .replace(/^\s*[\*\-]\s*/, "* ")
            .replace(/^\s*\d+\.\s*/, (match) => match.trim() + " ")
            .trim()
        )
        .join("\n")
        .replace(/\n{3,}/g, "\n\n"); // Không để quá nhiều dòng trống
    }

    return (
      <div className="search-word-container">
        <h2>Search Word</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Word</label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Enter a word..."
              required
            />
          </div>
          <div className="form-row">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="model-select"
            >
              <option value="google">Google</option>
              <option value="openai">OpenAI</option>
            </select>
            <button className="button-search" type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {error && <p className="error-message">{error}</p>}

        {result && !error && Object.keys(result).length > 0 && (
          <div className="result">
            <h3>Kết quả tìm kiếm</h3>
            <div className="result-item">
              <strong>Từ:</strong> {result.word}
            </div>
            <div className="result-item">
              <strong>Nghĩa là:</strong>
              <ReactMarkdown>{normalizeMarkdown(result.meaning)}</ReactMarkdown>
            </div>
            <div className="result-item">
              <strong>Ví dụ:</strong>
              <ReactMarkdown>{normalizeMarkdown(result.examples)}</ReactMarkdown>
            </div>
            <div className="result-item">
              <strong>Mẹo học:</strong>
              <ReactMarkdown>{normalizeMarkdown(result.tips)}</ReactMarkdown>
            </div>
            <div className="result-item">
              <strong>Cách sử dụng:</strong>
              <ReactMarkdown>{normalizeMarkdown(result.usage)}</ReactMarkdown>
            </div>
            <button
              className="add-to-vocabulary"
              onClick={handleAddToVocabulary}
              title="Add to vocabulary list"
            >
              ＋
            </button>
            {addSuccess && (
              <p className="success-message">
                Word added to your vocabulary list!
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  export default SearchWord;
