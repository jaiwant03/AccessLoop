import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const DEFAULT_SUGGESTIONS = [
  'Find a camera for my project.',
  'Which laboratories are available?',
  'How can I book a resource?',
  'Why was my booking rejected?',
  'How does the waiting list work?',
  'How do I return borrowed equipment?',
  'How can I report damaged equipment?',
];

const ChatbotDrawer = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hi! I'm your AccessLoop AI assistant. I can help you discover resources, understand booking requirements and navigate the platform. What would you like to know?",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const sendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMessage = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chatbot/message', { message: query });
      const botMessage = {
        sender: 'bot',
        text: res.data.reply,
        resources: res.data.resources || [],
        suggestions: res.data.suggestions || DEFAULT_SUGGESTIONS.slice(0, 3),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'I encountered an issue connecting to the knowledge base. Please try asking again.',
          suggestions: DEFAULT_SUGGESTIONS.slice(0, 3),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-drawer-overlay" onClick={onClose}>
      <div className="chatbot-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-title-group">
            <div className="chatbot-icon-bubble">
              <Bot size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1rem', color: '#17231C' }}>
                  AccessLoop AI
                </h4>
                <span className="badge badge-green" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                  Online
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                {user ? `Contextual Assistant (${user.role})` : 'Public Guide'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem', borderRadius: '50%' }}
            aria-label="Close Assistant"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages List */}
        <div className="chatbot-messages-container">
          <div
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: '#F0FDF4',
              borderRadius: '8px',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              fontSize: '0.75rem',
              color: '#15803D',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
            }}
          >
            <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Trusted Assistant:</strong> Answers reflect real MongoDB inventory & campus guidelines. Final access and damage decisions remain under verified human oversight.
            </div>
          </div>

          {messages.map((m, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                className={`chat-bubble ${
                  m.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'
                }`}
              >
                <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>

                {/* Real Resource Cards if returned */}
                {m.resources && m.resources.length > 0 && (
                  <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16A34A', textTransform: 'uppercase' }}>
                      Verified Matching Resources
                    </div>
                    {m.resources.map((r) => (
                      <Link
                        key={r.id}
                        to={`/resources/${r.id}`}
                        onClick={onClose}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0.75rem',
                          backgroundColor: '#F8FAF9',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '0.825rem',
                          color: '#17231C',
                          fontWeight: 600,
                        }}
                      >
                        <div>
                          <div>{r.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 400 }}>
                            {r.category} • {r.location}
                          </div>
                        </div>
                        <ExternalLink size={14} color="#16A34A" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggestions chips right after bot message */}
              {m.sender === 'bot' && m.suggestions && m.suggestions.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                  {m.suggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      className="suggestion-chip"
                      onClick={() => sendMessage(sug)}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="chat-bubble chat-bubble-bot" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} className="ai-pulse-dot" />
              <span style={{ fontSize: '0.825rem', color: '#64748B' }}>
                Analyzing campus resources...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          className="chatbot-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Ask about resources, booking rules, returns..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={{ fontSize: '0.875rem', padding: '0.6rem 0.85rem' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!input.trim() || loading}
            style={{ padding: '0.6rem 0.85rem' }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotDrawer;
