import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ReactMarkdown from 'react-markdown';
import './styles/LearningBoard.css';
import { FaStar, FaLightbulb, FaFire, FaCheckCircle } from 'react-icons/fa';

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
      // URLSearchParamsを使用してクエリパラメータを構築
      const queryParams = new URLSearchParams({
        page: '1',
        per_page: '999'  // Lấy số lượng lớn để đảm bảo lấy được tất cả các từ
      });

      const requestUrl = `${API_URL}/list?${queryParams.toString()}`;
      console.log('Making request to:', requestUrl);

      const res = await axios.get(requestUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response:', {
        url: res.config.url,
        data: res.data
      });

      // Lấy đúng mảng từ API
      const wordArray = res.data.list_word || res.data.words || [];

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
    console.log('=== ドラッグ開始 ===');
    console.log('result:', result);
    
    const { source, destination } = result;

    if (!destination) {
      console.warn('No destination found. Drag cancelled.');
      return;
    }

    console.log('source:', source);
    console.log('destination:', destination);
    console.log('current data keys:', Object.keys(data));

    // データの存在チェック
    if (!data[source.droppableId] || !data[destination.droppableId]) {
      console.error('Invalid droppableId:', { source: source.droppableId, destination: destination.droppableId });
      setError('Invalid column data');
      return;
    }

    const sourceList = Array.from(data[source.droppableId]);
    const destList = Array.from(data[destination.droppableId]);
    
    console.log('sourceList length:', sourceList.length);
    console.log('source.index:', source.index);

    if (source.index >= sourceList.length) {
      console.error('Invalid source index:', source.index, 'for list length:', sourceList.length);
      setError('Invalid source index');
      return;
    }

    // 移動したアイテムを取得
    const [movedItem] = sourceList.splice(source.index, 1);
    console.log('movedItem:', movedItem);

    if (!movedItem || !movedItem.id) {
      console.error('Invalid moved item:', movedItem);
      setError('Invalid moved item');
      return;
    }

    const wordId = movedItem.id;
    console.log('wordId:', wordId);

    // 新しいカラムでの位置に挿入
    destList.splice(destination.index, 0, movedItem);

    // ステータスマッピング
    const statusMapping = {
      newWord: 'NewWord',
      learning: 'Learning',
      hardWord: 'HardWord',
      remembered: 'Remembered'
    };

    const newStatus = statusMapping[destination.droppableId];
    console.log('newStatus:', newStatus);

    if (!newStatus) {
      console.error('Invalid destination status:', destination.droppableId);
      setError('Invalid destination status');
      return;
    }

    // 状態を更新（オプティミスティック更新）
    const newData = {
      ...data,
      [source.droppableId]: sourceList,
      [destination.droppableId]: destList
    };
    setData(newData);

    // APIに送信
    try {
      console.log('Sending API request - Update word', wordId, 'to status:', newStatus);
      
      const response = await axios.put(`${API_URL}/update/${wordId}`, {
        status: newStatus
      });

      console.log('API Response:', response.data);
      setError(null); // エラーをクリア
      
    } catch (error) {
      console.log('=== API Error Details ===');
      console.error('Error updating word status:', error);
      
      // エラーの詳細をログ出力
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request details:', error.request);
      } else {
        console.error('Error message:', error.message);
      }

      // バックエンドエラーの場合、UI更新は維持するかユーザーに選択させる
      if (error.response && error.response.status === 500) {
        const keepChanges = window.confirm(
          'バックエンドエラーが発生しました。\n' +
          'UIの変更を維持しますか？\n\n' +
          '「OK」: 変更を維持（見た目だけ更新）\n' +
          '「キャンセル」: 元の状態に戻す'
        );
        
        if (!keepChanges) {
          // ユーザーが元に戻すことを選択した場合
          setData(data);
        }
        
        setError('バックエンドエラー：updateWord関数にreturnステートメントが不足している可能性があります。');
      } else if (error.code === 'ERR_NETWORK') {
        // ネットワークエラーの場合は元に戻す
        setData(data);
        setError('ネットワークエラー：サーバーが動作していないか、CORSの設定に問題があります。');
      } else {
        // その他のエラーの場合は元に戻す
        setData(data);
        setError(`APIエラー: ${error.message}`);
      }
    }
  };

  const columnIcons = [
    <FaStar className="col-icon" />,      // NewWord
    <FaLightbulb className="col-icon" />, // Learning
    <FaFire className="col-icon" />,      // HardWord
    <FaCheckCircle className="col-icon" /> // Remembered
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="learning-board-container">
      <h2>Learning Management Board</h2>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="board-columns">
          {Object.keys(data).map((key, idx) => (
            <Droppable droppableId={key} key={key}>
              {(provided) => (
                <div
                  className="column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <div className="column-header">
                    {columnIcons[idx]}
                    <h3>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</h3>
                  </div>
                  <div className="column-content">
                    {data[key]?.length > 0 ? (
                      data[key]
                        .filter(word => word._id || word.id)
                        .map((word, index) => {
                          const wordId = word._id || word.id;
                          if (!wordId) return null;
                          return (
                            <Draggable
                              key={wordId}
                              draggableId={wordId.toString()}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  className={`word-item ${snapshot.isDragging ? 'dragging' : ''}`}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setSelectedWord(word)}
                                  style={{
                                    ...provided.draggableProps.style,
                                    ...(snapshot.isDragging && {
                                      background: 'linear-gradient(135deg, #e91e63, #ff6090)',
                                      color: 'white',
                                      boxShadow: '0 8px 24px rgba(233,30,99,0.5)',
                                      transform: `${provided.draggableProps.style?.transform} rotate(5deg) scale(1.1)`,
                                      border: '2px solid #e91e63',
                                      zIndex: 1000
                                    })
                                  }}
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
    </div>
  );
};

export default LearningBoard;