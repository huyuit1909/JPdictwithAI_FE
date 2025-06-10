import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "./config";
import ReactMarkdown from "react-markdown";
import "./styles/VocabularyList.css";
import { FaCheck, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { CircularProgress, Box } from "@mui/material";

// Add request interceptor for debugging
axios.interceptors.request.use((request) => {
  console.log("Starting Request:", {
    url: request.url,
    params: request.params,
    method: request.method,
  });
  return request;
});

// Add response interceptor for debugging
axios.interceptors.response.use((response) => {
  console.log("Response:", {
    url: response.config.url,
    status: response.status,
    data: response.data,
  });
  return response;
});

const ITEMS_PER_PAGE = 10;

const VocabularyList = ({ active }) => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);

  // Sử dụng snake_case đồng bộ với backend
  const [pagination, setPagination] = useState({
    current_page: 1,
    pages: 1,
    per_page: ITEMS_PER_PAGE,
    total: 0,
    has_next: false,
    has_prev: false,
  });

  // Fetch danh sách từ vựng với pagination
  const fetchWords = async (page = 1, itemsPerPage = ITEMS_PER_PAGE) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: itemsPerPage.toString(),
      });

      const requestUrl = `${API_URL}/list?${queryParams.toString()}`;
      console.log("Making request to:", requestUrl);

      const res = await axios.get(requestUrl, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("API Response:", {
        url: res.config.url,
        params: res.config.params,
        data: res.data,
      });

      if (!res.data || !res.data.list_word) {
        throw new Error("Invalid response format from API");
      }

      // Log để kiểm tra dữ liệu từ API
      console.log("Words from API:", res.data.list_word);

      setWords(res.data.list_word);

      if (res.data.pagination) {
        setPagination({
          current_page: res.data.pagination.current_page,
          pages: res.data.pagination.pages,
          per_page: res.data.pagination.per_page,
          total: res.data.pagination.total,
          has_next: res.data.pagination.has_next,
          has_prev: res.data.pagination.has_prev,
        });
      }
    } catch (err) {
      setError("Failed to fetch words. Please try again.");
    }
    setLoading(false);
  };

  // Xoá từ vựng
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this word?")) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.delete(`${API_URL}/delete/${id}`, {
        headers: { "Content-Type": "application/json" },
      });

      // Nếu trang hiện tại trống sau khi xoá, load trang trước đó
      if (words.length === 1 && pagination.current_page > 1) {
        fetchWords(pagination.current_page - 1, pagination.per_page);
      } else {
        fetchWords(pagination.current_page, pagination.per_page);
      }
      setSuccess("Word successfully deleted!");
    } catch (err) {
      setError("Failed to delete the word. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchWords(newPage, pagination.per_page);
    }
  };

  useEffect(() => {
    fetchWords(1, ITEMS_PER_PAGE);
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="vocabulary-list-container">
        <h2>Vocabulary List</h2>
        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
              width: "100%",
            }}
          >
            <CircularProgress
              sx={{
                color: "#ff4081",
                animation: "fadeIn 0.3s",
                "@keyframes fadeIn": {
                  "0%": {
                    opacity: 0,
                    transform: "scale(0.9)",
                  },
                  "100%": {
                    opacity: 1,
                    transform: "scale(1)",
                  },
                },
              }}
            />
          </Box>
        )}
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        {!loading && (
          <ul>
            {Array.isArray(words) &&
              words.map((word) => (
                <li
                  key={word.id}
                  className="vocabulary-item"
                  onClick={() => setSelectedWord(word)}
                >
                  <div className="word-content">
                    <strong className="word-title">{word.word}</strong>
                    <ReactMarkdown>{word.meaning}</ReactMarkdown>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(word.id);
                    }}
                    className="mark-complete-button"
                    title="Mark as Learned"
                    disabled={loading}
                  >
                    <FaCheck className="check-icon" />
                  </button>
                </li>
              ))}
          </ul>
        )}
        {!loading && words.length === 0 && <p>No words found.</p>}
      </div>

      {/* Tách riêng phần pagination */}
    <div className="pagination-container">
        <button
            className="pagination-button"
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={!pagination.has_prev || loading}
        >
        <FaChevronLeft /> Previous
        </button>
        <span className="pagination-info">
            Page {pagination.current_page} of {pagination.pages}
        </span>
        <button
            className="pagination-button"
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={!pagination.has_next || loading}
        >
            Next <FaChevronRight />
        </button>
    </div>

      {/* Popup hiển thị chi tiết từ */}
    {selectedWord && (
        <div className="popup-overlay" onClick={() => setSelectedWord(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            {/* Log để kiểm tra dữ liệu của từ được chọn */}
            {console.log("Selected word data:", selectedWord)}
            <h3>{selectedWord.word}</h3>
            <div>
              <div className="popup-section-title">意味:</div>
              <ReactMarkdown>{selectedWord.meaning}</ReactMarkdown>
            </div>
            {selectedWord.kanji && (
              <div>
                <div className="popup-section-title">漢字:</div>
                <ReactMarkdown>{selectedWord.kanji}</ReactMarkdown>
              </div>
            )}
            {selectedWord.usage && (
              <div>
                <div className="popup-section-title">使い方:</div>
                <ReactMarkdown>{selectedWord.usage}</ReactMarkdown>
              </div>
            )}
            {selectedWord.examples && (
              <div>
                <div className="popup-section-title">例文:</div>
                {selectedWord.examples.split("\\n").map((example, index) => (
                  example.trim() && (
                    <div key={index} className="example-item">
                      <ReactMarkdown>{example}</ReactMarkdown>
                    </div>
                  )
                ))}
              </div>
            )}
            {!selectedWord.examples && selectedWord.example && (
              <div>
                <div className="popup-section-title">例文:</div>
                {selectedWord.example.split("\\n").map((example, index) => (
                  example.trim() && (
                    <div key={index} className="example-item">
                      <ReactMarkdown>{example}</ReactMarkdown>
                    </div>
                  )
                ))}
              </div>
            )}
            {selectedWord.tips && (
              <div>
                <div className="popup-section-title">学習のコツ:</div>
                <ReactMarkdown>{selectedWord.tips}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VocabularyList;
