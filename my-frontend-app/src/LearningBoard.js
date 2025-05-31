import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ReactMarkdown from 'react-markdown';
import './styles/LearningBoard.css';

const LearningBoard = () => {
  const [data, setData] = useState({
    newWord: [],
    learning: [],
    hardWord: [],
    remembered: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);

  const fetchWords = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_URL}/list`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Lấy đúng mảng từ API
      const wordArray =
        Array.isArray(res.data)
          ? res.data
          : (res.data.words || res.data.list_word || []);

      const wordsWithStatus = wordArray.map((word) => ({
        ...word,
        status: word.status || 'NewWord',
      }));

      setData({
        newWord: wordsWithStatus.filter((word) => word.status === 'NewWord'),
        learning: wordsWithStatus.filter((word) => word.status === 'Learning'),
        hardWord: wordsWithStatus.filter((word) => word.status === 'HardWord'),
        remembered: wordsWithStatus.filter((word) => word.status === 'Remembered'),
      });
    } catch (err) {
      console.error('Error fetching words:', err);
      setError('Failed to load vocabulary data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const statusMap = {
    newWord: "NewWord",
    learning: "Learning",
    hardWord: "HardWord",
    remembered: "Remembered",
  };

  const handleDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) {
      console.warn('No destination found. Drag cancelled.');
      return;
    }

    const sourceList = Array.from(data[source.droppableId]);
    const destList = Array.from(data[destination.droppableId]);
    const [movedItem] = sourceList.splice(source.index, 1);
    const wordId = movedItem._id || movedItem.id;
    if (!wordId) {
      setError('Word ID is missing, cannot update status.');
      return;
    }

    // Lấy status đúng từ key cột
    const newStatus = statusMap[destination.droppableId];

    console.log('Update word', wordId, 'to status:', newStatus);

    try {
      await axios.put(
        `${API_URL}/update/${wordId}`,
        { status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      destList.splice(destination.index, 0, {
        ...movedItem,
        status: newStatus,
      });

      setData((prevState) => ({
        ...prevState,
        [source.droppableId]: sourceList,
        [destination.droppableId]: destList,
      }));
    } catch (error) {
      console.error('Error updating word status:', error);
      setError('Failed to update word status.');

      setData((prevState) => ({
        ...prevState,
        [source.droppableId]: [...sourceList, movedItem],
        [destination.droppableId]: destList.filter((item) => (item._id || item.id) !== wordId),
      }));
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="learning-board-container">
      <h2>Learning Management Board</h2>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="board-columns">
          {Object.keys(data).map((key) => (
            <Droppable droppableId={key} key={key}>
              {(provided) => (
                <div
                  className="column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <div className="column-header">
                    <h3>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</h3>
                  </div>
                  <div className="column-content">
                    {data[key]?.length > 0 ? (
                      data[key]
                        .filter(word => word._id || word.id) // chỉ render nếu có id
                        .map((word, index) => {
                          const wordId = word._id || word.id;
                          if (!wordId) return null; // Bỏ qua nếu không có id
                          return (
                            <Draggable
                              key={wordId}
                              draggableId={wordId.toString()}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  className="word-item"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setSelectedWord(word)}
                                >
                                  <span className="word-text">{word.word}</span>
                                </div>
                              )}
                            </Draggable>
                          );
                        })
                    ) : (
                      <p className="empty-column">No words available</p>
                    )}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      {selectedWord && (
        <div className="popup-overlay" onClick={() => setSelectedWord(null)}>
          <div className="popup-container" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>{selectedWord.word || 'Chi tiết từ vựng'}</h3>
            </div>
            <div className="popup-content">
              {selectedWord.meaning && (
                <>
                  <h4>Meaning</h4>
                  <ReactMarkdown>{String(selectedWord.meaning)}</ReactMarkdown>
                </>
              )}
              {selectedWord.examples && (
                <>
                  <h4>Examples</h4>
                  <ReactMarkdown>{String(selectedWord.examples)}</ReactMarkdown>
                </>
              )}
              {selectedWord.usage && (
                <>
                  <h4>Usage</h4>
                  <ReactMarkdown>{String(selectedWord.usage)}</ReactMarkdown>
                </>
              )}
              {selectedWord.tips && (
                <>
                  <h4>Tips</h4>
                  <ReactMarkdown>{String(selectedWord.tips)}</ReactMarkdown>
                </>
              )}
            </div>
            <div className="popup-footer">
              <button className="close-btn" onClick={() => setSelectedWord(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningBoard;