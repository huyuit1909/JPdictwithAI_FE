import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Autocomplete, 
  TextField, 
  Chip, 
  Box, 
  IconButton,
  Typography,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './styles/AssistantModal.css';

const AssistantModal = ({ isOpen, onClose }) => {
  const [savedWords, setSavedWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [generatedText, setGeneratedText] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchSavedWords();
    }
  }, [isOpen]);

  const fetchSavedWords = async () => {
    try {
      const response = await fetch('https://api-dot-kaizenjapanese-461712.an.r.appspot.com/list');
      const data = await response.json();
      setSavedWords(data.list_word || []);
    } catch (error) {
      setError('単語の取得に失敗しました。');
    }
  };

  const handleWordSelect = (event, newValue) => {
    if (newValue.length <= 5) {
      setSelectedWords(newValue);
      setError(null);
    } else {
      setError('最大5つまでの単語を選択してください。');
    }
  };

  const handleGenerate = async () => {
    if (selectedWords.length < 3) {
      setError('最低3つの単語を選択してください。');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://api-dot-kaizenjapanese-461712.an.r.appspot.com/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word_array: selectedWords.map(word => word.word).join(',')
        }),
      });
      
      const data = await response.json();
      setGeneratedText(data.result);
    } catch (error) {
      setError('文章の生成に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <IconButton 
              className="close-button"
              onClick={onClose}
              sx={{
                position: 'absolute',
                right: '1.5rem',
                top: '1.5rem',
                color: 'rgba(0, 0, 0, 0.54)',
                '&:hover': {
                  color: '#ff4081',
                  transform: 'rotate(90deg)',
                  transition: 'all 0.3s ease-in-out',
                },
              }}
            >
              <CloseIcon />
            </IconButton>

            <Typography variant="h4" component="h2" className="modal-title">
              例文作成支援
            </Typography>
            
            <div className="word-selection">
              <Typography variant="h6" component="h3" className="section-title">
                単語を選択（3-5個）
              </Typography>
              <Box sx={{ width: '100%', mb: 2 }}>
                <Autocomplete
                  multiple
                  options={savedWords}
                  getOptionLabel={(option) => option.word}
                  value={selectedWords}
                  onChange={handleWordSelect}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      placeholder="単語を選択..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '15px',
                          transition: 'all 0.3s ease',
                          '&.Mui-focused fieldset': {
                            borderColor: '#ff4081',
                            borderWidth: '2px',
                          },
                          '&:hover fieldset': {
                            borderColor: '#ff4081',
                          },
                        },
                        '& .MuiInputBase-input': {
                          fontSize: '1.1rem',
                          padding: '15px',
                        },
                      }}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={option.id}
                        label={option.word}
                        {...getTagProps({ index })}
                        sx={{
                          backgroundColor: '#ff4081',
                          color: 'white',
                          fontSize: '1rem',
                          padding: '20px 10px',
                          borderRadius: '12px',
                          '&:hover': {
                            backgroundColor: '#f50057',
                          },
                          '& .MuiChip-deleteIcon': {
                            color: 'white',
                            '&:hover': {
                              color: 'rgba(255, 255, 255, 0.7)',
                            },
                          },
                        }}
                      />
                    ))
                  }
                />
              </Box>
            </div>

            {error && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            <div className="action-buttons">
              <Button
                variant="contained"
                onClick={handleGenerate}
                disabled={selectedWords.length < 3 || isLoading}
                sx={{
                  backgroundColor: '#ff4081',
                  padding: '12px 40px',
                  fontSize: '1.1rem',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#f50057',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 15px rgba(255, 64, 129, 0.3)',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'rgba(255, 64, 129, 0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                生成
              </Button>
            </div>

            {isLoading && (
              <motion.div 
                className="loading-animation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div className="loading-circle" />
                <div className="loading-particles">
                  <div className="particle" />
                  <div className="particle" />
                  <div className="particle" />
                  <div className="particle" />
                  <div className="particle" />
                  <div className="particle" />
                </div>
                <div className="loading-text">生成中...</div>
              </motion.div>
            )}

            {generatedText && !isLoading && (
              <motion.div 
                className="generated-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-content markdown-body">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="markdown-paragraph" {...props} />,
                      h1: ({node, ...props}) => <h1 className="markdown-h1" {...props} />,
                      h2: ({node, ...props}) => <h2 className="markdown-h2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="markdown-h3" {...props} />,
                      ul: ({node, ...props}) => <ul className="markdown-ul" {...props} />,
                      ol: ({node, ...props}) => <ol className="markdown-ol" {...props} />,
                      li: ({node, ...props}) => <li className="markdown-li" {...props} />,
                      code: ({node, ...props}) => <code className="markdown-code" {...props} />,
                      pre: ({node, ...props}) => <pre className="markdown-pre" {...props} />,
                    }}
                  >
                    {generatedText}
                  </ReactMarkdown>
                </div>
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopy}
                  sx={{
                    marginTop: 2,
                    borderColor: '#ff4081',
                    color: '#ff4081',
                    padding: '10px 30px',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    textTransform: 'none',
                    borderWidth: '2px',
                    '&:hover': {
                      borderColor: '#f50057',
                      backgroundColor: 'rgba(255, 64, 129, 0.04)',
                      borderWidth: '2px',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  コピー
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssistantModal; 