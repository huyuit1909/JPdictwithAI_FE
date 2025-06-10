// frontend/src/config.js
export const API_URL = 'https://jpdict-api.azurewebsites.net';

// API Endpoints
export const API_ENDPOINTS = {
  VOCABULARY: {
    LIST: '/api/vocabulary',
    ADD: '/api/vocabulary/add',
    DELETE: '/api/vocabulary/delete',
  },
  GRAMMAR: {
    CHECK: '/api/grammar/check',
    TTS: '/api/tts/synthesize',
  },
  DICTIONARY: {
    SEARCH: '/api/dictionary/search',
  },
  TRANSLATE: {
    TEXT: '/api/translate',
  },
};