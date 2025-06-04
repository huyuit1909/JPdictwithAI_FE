import React, { useState } from "react";
import { Tooltip } from "@mui/material";
import "./styles/AssistantModal.css";

const GrammarChecker = () => {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        'https://api-dot-kaizenjapanese-461712.an.r.appspot.com/assistant/grammar',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paragraph: inputText }),
        }
      );

      const data = await response.json();
      console.log('API Response:', data);
      
      let parsedData;
      try {
        const jsonStr = data.result.match(/```json\n([\s\S]*)\n```/)[1];
        parsedData = JSON.parse(jsonStr);
        
        // 元のテキストを保存
        parsedData.original_text = inputText;
        
        // 修正箇所をソート（開始位置の昇順）
        parsedData.changes = parsedData.changes.sort((a, b) => a.orig_start - b.orig_start);
        
        console.log('Parsed Data:', parsedData);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        throw new Error('Invalid response format');
      }

      setResult(parsedData);
    } catch (error) {
      console.error('Error:', error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setInputText('');
  };

  const renderOriginalText = () => {
    if (!result || !result.changes || !result.original_text) return null;

    const text = result.original_text;
    let lastIndex = 0;
    const elements = [];

    // 修正箇所は既にソート済み（APIレスポンス処理時）
    result.changes.forEach((change, index) => {
      // 修正箇所の前のテキストを追加
      if (change.orig_start > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {text.slice(lastIndex, change.orig_start)}
          </span>
        );
      }

      // 修正箇所をハイライト表示
      elements.push(
        <Tooltip
          key={`original-${index}`}
          title={
            <div className="p-4">
              <div className="space-y-2">
                <div className="text-red-300">修正前: {change.old}</div>
                <div className="text-green-300">修正後: {change.new}</div>
                <div className="text-gray-300 text-sm border-t border-gray-700 pt-2 mt-2">
                  {change.reason}
                </div>
              </div>
            </div>
          }
          arrow
          componentsProps={{
            tooltip: {
              sx: {
                bgcolor: 'rgba(31, 41, 55, 0.95)',
                '& .MuiTooltip-arrow': {
                  color: 'rgba(31, 41, 55, 0.95)',
                },
                maxWidth: '400px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              },
            },
          }}
        >
          <span 
            className="cursor-help px-1 rounded transition-colors duration-200"
            style={{ 
              backgroundColor: '#fff9c4', 
              borderBottom: '2px solid #e91e63'
            }}
          >
            {text.slice(change.orig_start, change.orig_end)}
          </span>
        </Tooltip>
      );

      lastIndex = change.orig_end;
    });

    // 最後の修正箇所以降のテキストを追加
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h4 className="text-sm font-medium text-gray-500 mb-2">元のテキスト:</h4>
        <div className="text-lg leading-relaxed">
          {elements}
        </div>
      </div>
    );
  };

  const renderCorrectedText = () => {
    if (!result || !result.changes || !result.corrected_text) return null;

    const text = result.corrected_text;
    let lastIndex = 0;
    const elements = [];

    // 修正箇所は既にソート済み（APIレスポンス処理時）
    result.changes.forEach((change, index) => {
      // 修正箇所の前のテキストを追加
      if (change.corrected_start > lastIndex) {
        elements.push(
          <span key={`text-${index}`} className="text-gray-800">
            {text.slice(lastIndex, change.corrected_start)}
          </span>
        );
      }

      // 修正箇所を追加（ツールチップなし）
      elements.push(
        <span 
          key={`correction-${index}`}
          className="bg-gradient-to-r from-green-100 to-green-50 px-2 py-0.5 rounded-md border border-green-200"
        >
          {text.slice(change.corrected_start, change.corrected_end)}
        </span>
      );

      lastIndex = change.corrected_end;
    });

    // 最後の修正箇所以降のテキストを追加
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end" className="text-gray-800">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return (
      <div className="space-y-6">
        <div className="p-4 border border-pink-100 rounded-lg bg-white">
          <h4 className="text-sm font-medium text-gray-500 mb-2">修正後のテキスト:</h4>
          <div className="text-lg leading-relaxed">
            {elements}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-pink-300 bg-clip-text text-transparent">
          日本語文法チェッカー
        </h1>
        <p className="text-gray-600 mt-2">
          文章を入力して、文法の修正案を確認できます
        </p>
      </div>
      
      {!result ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-40 p-4 border-2 border-pink-200 rounded-lg focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-all duration-300 resize-none"
              placeholder="日本語の文章を入力してください..."
            />
            <div className="flex justify-center mt-4">
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="bg-gradient-to-r from-pink-500 to-pink-400 text-white px-8 py-2 rounded-lg 
                         hover:from-pink-600 hover:to-pink-500 transition-all duration-300 disabled:opacity-50 
                         disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    確認中...
                  </div>
                ) : '文法チェック'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 space-y-6">
          {renderOriginalText()}
          <div className="flex justify-center">
            <button
              onClick={handleReset}
              className="bg-gradient-to-r from-gray-500 to-gray-400 text-white px-8 py-2 rounded-lg 
                       hover:from-gray-600 hover:to-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              新しいチェック
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-gradient-to-br from-white to-pink-50 rounded-lg shadow-lg p-6 border border-pink-100">
          <div className="text-lg leading-relaxed mb-8 p-6 bg-white rounded-lg shadow-sm border border-pink-100">
            <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-pink-500 to-pink-300 bg-clip-text text-transparent">
              修正された文章
            </h3>
            {renderCorrectedText()}
          </div>
          
          {result.changes && result.changes.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-pink-500 to-pink-300 bg-clip-text text-transparent">
                修正詳細
              </h3>
              <div className="space-y-4">
                {result.changes.map((change, index) => (
                  <div 
                    key={index} 
                    className="bg-white p-6 rounded-lg border-l-4 border-pink-400 shadow-md hover:shadow-lg 
                             transition-all duration-300 hover:translate-x-1"
                  >
                    <div className="flex items-center mb-4">
                      <span className="bg-gradient-to-r from-pink-500 to-pink-400 text-white text-sm px-3 py-1 rounded-full font-medium">
                        修正 {index + 1}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="relative overflow-hidden rounded-lg group">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative p-4 border border-red-200 rounded-lg">
                          <span className="font-medium text-red-600">元の表現:</span>
                          <p className="mt-1 text-gray-800">{change.old}</p>
                        </div>
                      </div>
                      <div className="relative overflow-hidden rounded-lg group">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative p-4 border border-green-200 rounded-lg">
                          <span className="font-medium text-green-600">修正後:</span>
                          <p className="mt-1 text-gray-800">{change.new}</p>
                        </div>
                      </div>
                      <div className="relative overflow-hidden rounded-lg group">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-pink-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative p-4 border border-pink-200 rounded-lg">
                          <span className="font-medium text-pink-600">修正理由:</span>
                          <p className="mt-1 text-gray-800">{change.reason}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GrammarChecker;
