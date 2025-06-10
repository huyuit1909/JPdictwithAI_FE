// src/components/TranslateText.js
import React, { useState, useEffect } from "react";
import "./styles/TranslateText.css";
import { FaLanguage } from "react-icons/fa";
import { API_URL } from "./config";
import { franc } from 'franc';

const ISO6393_TO_CODE = {
  vie: "vi",
  jpn: "ja",
  eng: "en",
  cmn: "zh",
  kor: "ko",
  fra: "fr",
  deu: "de",
  spa: "es",
  ita: "it",
  rus: "ru",
};

const LANGUAGES = [
  { code: "vi", label: "Vietnamese" },
  { code: "ja", label: "Japanese" },
  { code: "en", label: "English" },
  { code: "zh", label: "Chinese" },
  { code: "ko", label: "Korean" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
  { code: "it", label: "Italian" },
  { code: "ru", label: "Russian" },
];

const TranslateText = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("vi");
  const [target, setTarget] = useState("ja");
  const [detectedLanguage, setDetectedLanguage] = useState(null);

  // 言語検出のディバウンス処理
  useEffect(() => {
    const detectLanguage = () => {
      if (inputText.trim().length >= 10) {
        const detected = franc(inputText);
        const mapped = ISO6393_TO_CODE[detected];
        
        if (mapped) {
          setDetectedLanguage(LANGUAGES.find(lang => lang.code === mapped)?.label);
          if (mapped !== source) {
            setSource(mapped);
          }
        } else {
          // 検出された言語が対応言語リストにない場合
          setDetectedLanguage("Unknown");
          // デフォルトの言語を設定
          if (source !== "en") {
            setSource("en");
          }
        }
      } else {
        setDetectedLanguage(null);
      }
    };

    const timeoutId = setTimeout(detectLanguage, 500);
    return () => clearTimeout(timeoutId);
  }, [inputText, source]);

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          source_lang: source,
          target_lang: target,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Translation failed");
      }
      setTranslatedText(data.result);
    } catch (error) {
      console.error("Error translating text:", error);
      setTranslatedText("Translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="translate-container">
      <div className="translate-section">
        <div className="select-row">
          <label>
            Source:　
            <select value={source} onChange={(e) => setSource(e.target.value)}>
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
            {detectedLanguage && (
              <span style={{ marginLeft: 8, color: "#888", fontSize: 13 }}>
                (Detected: {detectedLanguage})
              </span>
            )}
          </label>
        </div>
        <h2>{LANGUAGES.find((l) => l.code === source)?.label || "Source"}</h2>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type text to translate... (at least 10 characters for auto-detection)"
        />
      </div>
      <div className="translate-button-section">
        <button onClick={handleTranslate} disabled={loading || !inputText.trim()}>
          <FaLanguage className="translate-icon" />
          {loading ? "Translating..." : "Translate"}
        </button>
      </div>
      <div className="translate-section">
        <div className="select-row">
          <label>
            Target:　
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <h2>{LANGUAGES.find((l) => l.code === target)?.label || "Target"}</h2>
        <textarea
          value={translatedText}
          readOnly
          placeholder="Translation will appear here"
        />
      </div>
    </div>
  );
};

export default TranslateText;
