import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import ReactMarkdown from 'react-markdown'; // Import thư viện Markdown
import './styles/VocabularyList.css';
import { FaCheck } from 'react-icons/fa'; 


const VocabularyList = ({ active }) => {
const [words, setWords] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [success, setSuccess] = useState(null); // Thêm thông báo xoá thành công
const [selectedWord, setSelectedWord] = useState(null); // Thêm state cho từ được chọn để mở popup
// Fetch danh sách từ vựng
const fetchWords = async () => {
    setLoading(true);
    setError(null);
    try {
        const res = await axios.get(`${API_URL}/list`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log(axios.get(`${API_URL}/list`));
        console.log("API Response:", res.data);
        // APIレスポンスからlist_wordを取得
        setWords(res.data.list_word || res.data.words || []);
    } catch (err) {
        console.error('Error fetching words:', err);
        setError('Failed to fetch words. Please try again.');
    }
    setLoading(false);
};

// Xoá từ vựng
const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this word?')) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/delete/${id}`, {
        headers: 
            {'Content-Type': 'application/json'}
        });
    console.log(`Word with ID ${id} deleted successfully.`);
    // Cập nhật danh sách từ vựng sau khi xoá
    setWords(words.filter((word) => word.id !== id));
    setSuccess('Word successfully deleted!');
    } catch (err) {
    console.error('Error deleting word:', err);
    setError('Failed to delete the word. Please try again.');
    } finally {
    setLoading(false);
    }
};

useEffect(() => {
  fetchWords();
  // eslint-disable-next-line
}, []);

return (
    <div className="vocabulary-list-container">
    <h2>Vocabulary List</h2>
    {loading && <p>Loading...</p>}
    {error && <p className="error">{error}</p>}
    {success && <p className="success">{success}</p>}

    <ul>
        {Array.isArray(words) && words.map((word) => (
        <li
            key={word.id}
            className="vocabulary-item"
            onClick={() => setSelectedWord(word)} // Hiển thị popup khi click vào từ
        >
            <div className="word-content">
            <strong className="word-title">{word.word}</strong>
            <ReactMarkdown>{word.meaning}</ReactMarkdown>
            </div>
            <button
            onClick={(e) => {
                e.stopPropagation(); // Ngăn chặn event mở popup khi click xoá
                handleDelete(word.id);
            }}
            className="mark-complete-button"
            title="Mark as Learned"            
            >
            <FaCheck className="check-icon" />
            </button>
        </li>
        ))}
    </ul>
    {!loading && words.length === 0 && <p>No words found.</p>}

    {/* Popup hiển thị chi tiết từ */}
    {selectedWord && (
<div className="popup-overlay" onClick={() => setSelectedWord(null)}>
    <div className="popup-container" onClick={(e) => e.stopPropagation()}>
    {/* Header */}
    <div className="popup-header">
        {selectedWord.word || 'Chi tiết từ vựng'}
    </div>

    {/* Nội dung popup */}
    <div className="popup-content">
        {/* Meaning */}
        {selectedWord.meaning && (
        <>
            <h3>Meaning</h3>
            <ReactMarkdown>{String(selectedWord.meaning)}</ReactMarkdown>
        </>
        )}

        {/* Examples */}
        {selectedWord.examples && (
        <>
            <h3>Examples</h3>
            <ReactMarkdown>{String(selectedWord.examples)}</ReactMarkdown>
        </>
        )}

        {/* Usage */}
        {selectedWord.usage && (
        <>
            <h3>Usage</h3>
            <ReactMarkdown>{String(selectedWord.usage)}</ReactMarkdown>
        </>
        )}

        {/* Tips */}
        {selectedWord.tips && (
        <>
            <h3>Tips</h3>
            <ReactMarkdown>{String(selectedWord.tips)}</ReactMarkdown>
        </>
        )}
    </div>

    {/* Footer với nút Close */}
    <div className="popup-footer">
        <button
        className="popup-close-btn"
        onClick={() => setSelectedWord(null)}
        >
        Close
        </button>
    </div>
    </div>
</div>
)}
    </div>
);
};

export default VocabularyList;