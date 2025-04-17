"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import "../app/styles/globals.css";

type NewsArticle = {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
};

export default function NewsTracker() {
  const [query, setQuery] = useState("");
  const [sportsNews, setSportsNews] = useState<NewsArticle[]>([]);
  const [politicsNews, setPoliticsNews] = useState<NewsArticle[]>([]);
  const [generalNews, setGeneralNews] = useState<NewsArticle[]>([]);
  const [currentTrendNews, setCurrentTrendNews] = useState<NewsArticle[]>([]);
  const [searchedNews, setSearchedNews] = useState<NewsArticle[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  const [messages, setMessages] = useState<{ content: string; role: string }[]>([]);
  const [userInput, setUserInput] = useState("");
  const chatbotRef = useRef<HTMLDivElement>(null);

  const fetchNews = async (category: string) => {
    try {
      const res = await fetch(`/api/news?q=${encodeURIComponent(category)}`);
      const data = await res.json();
      if (!data.articles) {
        setError("No articles found.");
        return;
      }
      switch (category) {
        case "sports": setSportsNews(data.articles); break;
        case "politics": setPoliticsNews(data.articles); break;
        case "general": setGeneralNews(data.articles); break;
        case "current trends": setCurrentTrendNews(data.articles); break;
      }
    } catch {
      setError("Error fetching news.");
    }
  };

  const searchNews = async (searchQuery: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/news?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (!data.articles || data.articles.length === 0) {
        setError("No results found for your search.");
        setSearchedNews([]);
      } else {
        setSearchedNews(data.articles);
      }
    } catch {
      setError("Failed to fetch search results.");
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      setSearching(true);
      searchNews(trimmedQuery);
    } else {
      setSearching(false);
      setError("Please enter a search term!");
    }
  };

  // Handle sending the user's input to the Gemini API
  const sendMessage = async (message: string) => {
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ content: message, role: "user" }],
        }),
      });

      const data = await res.json();
      if (data.response) {
        // Update the chat with the chatbot's response
        setMessages((prevMessages) => [
          ...prevMessages,
          { content: data.response, role: "assistant" },
        ]);
      } else {
        console.error("No response data:", data);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Handle the user input and send it to the API when they press Enter or the "Send" button
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = userInput.trim();
    if (trimmedMessage) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { content: trimmedMessage, role: "user" },
      ]);
      sendMessage(trimmedMessage);
      setUserInput(""); // Clear input field after sending
    }
  };

  useEffect(() => {
    fetchNews("general");
    fetchNews("current trends");
    fetchNews("politics");
    fetchNews("sports");
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatbotRef.current && !chatbotRef.current.contains(event.target as Node)) {
        setShowChatbot(false);
      }
    };
    if (showChatbot) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showChatbot]);

  const renderNewsCards = (newsArray: NewsArticle[]) =>
    newsArray.slice(0, 10).map((item, idx) => (
      <motion.div
        key={item.url || idx}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="news-card"
      >
        {item.urlToImage && <img src={item.urlToImage} alt={item.title || "News"} className="news-image" />}
        <h3 className="news-title">{item.title}</h3>
        <p className="news-description">{item.description}</p>
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="news-link">Read more</a>
      </motion.div>
    ));

  return (
    <div className="news-container">
      <motion.h1 className="news-heading-left" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <span className="highlighted-title">News Context & Evolution Chatbot</span>
      </motion.h1>

      <form onSubmit={handleSubmit} className="news-form-below-heading chatbot-bar-wrapper">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="news-input"
        />
        <button type="submit" className="news-button">Search</button>
        {searching && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSearching(false);
              setSearchedNews([]);
              setError("");
            }}
            className="news-clear-button"
          >
            Clear
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowChatbot(!showChatbot)}
          className="chatbot-icon-inline"
        >
          💬
        </button>
      </form>

      {showChatbot && (
        <div ref={chatbotRef} className="chatbox">
          <div className="chatbox-header">
            <h3>Gemini Chatbot</h3>
            <button onClick={() => setShowChatbot(false)}>Close</button>
          </div>
          <div className="chatbox-content">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <p>{msg.content}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="chatbox-input-form">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask something..."
              className="chatbox-input"
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}

      {error && (
        <motion.div className="news-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <p>{error}</p>
        </motion.div>
      )}

      {loading && (
        <motion.div className="news-loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="spinner"></div>
          <p>Loading...</p>
        </motion.div>
      )}

      {searching ? (
        <motion.div className="news-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <h2 className="news-subheading">Search Results</h2>
          <div className="news-scroll">{renderNewsCards(searchedNews)}</div>
        </motion.div>
      ) : (
        [
          { title: "General", data: generalNews },
          { title: "Current Trends", data: currentTrendNews },
          { title: "Politics", data: politicsNews },
          { title: "Sports", data: sportsNews },
        ].map(({ title, data }) => (
          <motion.div key={title} className="news-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <h2 className="news-subheading">{title}</h2>
            <div className="news-scroll">{renderNewsCards(data)}</div>
          </motion.div>
        ))
      )}
    </div>
  );
}
