// frontend/src/config.js
export const API_URL = 'http://jpdict-api.azurewebsites.net';
export const OLD_API_URL = 'https://api-dot-kaizenjapanese-461712.an.r.appspot.com';

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