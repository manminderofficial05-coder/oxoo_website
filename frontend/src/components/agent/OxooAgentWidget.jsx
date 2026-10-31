import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquare, X, Minus, RotateCcw, Send, Sparkles, Copy, Check,
  Bot, AlertCircle, ArrowUpRight, CheckCircle2, ShieldCheck, ExternalLink,
  ChevronRight, CornerDownLeft, LifeBuoy
} from 'lucide-react';
import {
  getAgentConfig,
  sendAgentChat,
  getAgentHistory,
  clearAgentHistory,
  confirmAgentAction
} from '../../api';
import './oxoo-agent.css';

/**
 * Format markdown safely into React elements
 * Supports: bold (**text**), headers (### text), lists (* or -), blockquotes (>), inline code (`code`), links [text](/path)
 */
function MarkdownRenderer({ content, onNavigate }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let currentList = [];

  const flushList = (key) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} style={{ margin: '4px 0 8px 18px', padding: 0 }}>
          {currentList.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '3px' }}>{parseInline(item, onNavigate)}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // List item
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      currentList.push(trimmed.slice(2));
      return;
    }

    // Flush any pending list
    flushList(idx);

    if (!trimmed) {
      elements.push(<div key={`sp-${idx}`} style={{ height: '6px' }} />);
      return;
    }

    // Header 3
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h3-${idx}`} style={{ margin: '8px 0 4px', fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
          {parseInline(trimmed.slice(4), onNavigate)}
        </h4>
      );
      return;
    }

    // Header 2 or 1
    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      elements.push(
        <h3 key={`h2-${idx}`} style={{ margin: '10px 0 6px', fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
          {parseInline(trimmed.replace(/^#+\s/, ''), onNavigate)}
        </h3>
      );
      return;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      elements.push(
        <div key={`bq-${idx}`} style={{ borderLeft: '3px solid #0284c7', padding: '6px 10px', background: '#f0f9ff', margin: '6px 0', fontSize: '12px', color: '#0369a1', borderRadius: '0 6px 6px 0' }}>
          {parseInline(trimmed.slice(2), onNavigate)}
        </div>
      );
      return;
    }

    // Standard paragraph
    elements.push(
      <p key={`p-${idx}`} style={{ margin: '0 0 6px' }}>
        {parseInline(trimmed, onNavigate)}
      </p>
    );
  });

  flushList(lines.length);

  return <div className="oxoo-markdown-content">{elements}</div>;
}

/**
 * Parse inline bold, code, and markdown links [Label](/path)
 */
function parseInline(text, onNavigate) {
  // Regex to match **bold**, `code`, and [label](url)
  const tokens = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push(<strong key={match.index}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      tokens.push(<code key={match.index}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
      const labelMatch = token.match(/\[([^\]]+)\]/);
      const urlMatch = token.match(/\(([^)]+)\)/);
      const label = labelMatch ? labelMatch[1] : 'Link';
      const url = urlMatch ? urlMatch[1] : '#';

      tokens.push(
        <button
          key={match.index}
          type="button"
          onClick={() => onNavigate(url)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: '#0284c7',
            fontWeight: 600,
            textDecoration: 'underline',
            cursor: 'pointer',
            font: 'inherit',
            display: 'inline'
          }}
        >
          {label}
        </button>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.substring(lastIndex));
  }

  return tokens;
}

export default function OxooAgentWidget() {
  const navigate = useNavigate();
  const location = useLocation();

  // Widget visibility & state
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    enabled: true,
    agentName: 'OXOO Agent',
    welcomeMessage: "Hi! I'm OXOO Agent. How can I help you today? Ask me about our software, pricing plans, website and app development, AI solutions, subscriptions, or support.",
    suggestedQuestions: [
      'Explore OXOO applications',
      'Compare pricing plans',
      'Find a website development package',
      'Explore Android and iOS app development',
      'Learn about AI chatbots',
      'Manage my subscription',
      'Find an invoice',
      'Contact customer support'
    ],
    status: 'Online • Database Grounded',
    allowCustomerActions: true
  });

  const [conversationId, setConversationId] = useState(() => {
    return localStorage.getItem('oxoo_agent_conv_id') || '';
  });
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Do not render on full-screen admin console or embedded login if desired
  const isAdminRoute = location.pathname.startsWith('/admin') && !location.pathname.startsWith('/admin-login');

  // Load config on mount
  useEffect(() => {
    getAgentConfig().then((cfg) => {
      if (cfg && cfg.success) {
        setConfig(prev => ({ ...prev, ...cfg }));
      }
    }).catch(() => {});
  }, []);

  // Initialize or load conversation history
  useEffect(() => {
    if (conversationId) {
      getAgentHistory(conversationId).then((res) => {
        if (res && res.success && res.messages && res.messages.length > 0) {
          const loaded = res.messages.map(m => ({
            id: m.id,
            sender: m.sender,
            content: m.content,
            action: m.structured_payload && Object.keys(m.structured_payload).length > 0 ? m.structured_payload : null,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMessages(loaded);
        } else {
          initWelcomeMessage();
        }
      }).catch(() => {
        initWelcomeMessage();
      });
    } else {
      initWelcomeMessage();
    }
  }, [conversationId]);

  // Set default welcome message
  const initWelcomeMessage = () => {
    setMessages([
      {
        id: 'welcome_1',
        sender: 'agent',
        content: config.welcomeMessage || "Hi! I'm OXOO Agent. How can I help you today? Ask me about our software, pricing plans, website and app development, AI solutions, subscriptions, or support.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Auto-scroll to bottom of messages
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false);
      setUnreadCount(0);
    }
  }, [isOpen, messages]);

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  };

  // Internal Navigation Link Handler
  const handleNavigate = (url) => {
    if (!url) return;
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(url);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMsgId = `user_${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await sendAgentChat({
        message: text,
        conversationId,
        sessionId: localStorage.getItem('oxoo_session_id') || ''
      });

      if (res && res.success) {
        if (res.conversationId && res.conversationId !== conversationId) {
          setConversationId(res.conversationId);
          localStorage.setItem('oxoo_agent_conv_id', res.conversationId);
        }

        const agentMsg = {
          id: `agent_${Date.now()}`,
          sender: 'agent',
          content: res.reply,
          links: res.links || [],
          action: res.action || null,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, agentMsg]);
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      } else {
        throw new Error(res?.message || 'No response from assistant');
      }
    } catch (err) {
      const errorMsg = {
        id: `err_${Date.now()}`,
        sender: 'agent',
        isError: true,
        content: `I encountered an issue connecting to the knowledge base: ${err.message || 'Service temporarily unavailable'}. You can contact support directly at support@oxoo.ai or try again.`,
        links: [{ label: 'Contact Support', url: '/contact' }],
        retryText: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Enter to send, Shift+Enter for new line
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Copy message text
  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Clear conversation
  const handleClearConversation = async () => {
    if (conversationId) {
      await clearAgentHistory(conversationId);
    }
    const newConvId = `conv_${Math.random().toString(36).substring(2, 14)}`;
    setConversationId(newConvId);
    localStorage.setItem('oxoo_agent_conv_id', newConvId);
    setConfirmClearOpen(false);
    initWelcomeMessage();
  };

  // Execute confirmed consequential action (e.g. ticket creation)
  const handleConfirmAction = async (action) => {
    setIsLoading(true);
    try {
      const res = await confirmAgentAction({
        actionPayload: action,
        conversationId
      });

      if (res && res.success) {
        setActionSuccessMessage(res.message);
        setPendingAction(null);

        // Append confirmation receipt to chat
        setMessages(prev => [
          ...prev,
          {
            id: `act_${Date.now()}`,
            sender: 'agent',
            content: `**Action Confirmed!**\n\n${res.message}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error(res.message || 'Action execution failed');
      }
    } catch (err) {
      alert(`Action could not be completed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // If agent is disabled by admin in platform_settings, hide widget
  if (config.enabled === false) {
    return null;
  }

  return (
    <>
      {/* 1. FLOATING LAUNCHER BUTTON */}
      <div className="oxoo-agent-launcher-wrap" style={{ display: isOpen ? 'none' : 'flex' }}>
        <div className="oxoo-agent-tooltip" role="tooltip">
          <Sparkles size={14} style={{ color: '#00f2fe' }} />
          <span>Chat with OXOO Agent</span>
        </div>

        <button
          type="button"
          className="oxoo-agent-launcher-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open OXOO AI Agent Chat"
          aria-expanded={isOpen}
        >
          {/* Subtle Ambient Pulse Ring */}
          <div className="oxoo-agent-pulse-ring" aria-hidden="true" />

          {/* Official OXOO Mark + Dedicated Glowing AI Badge */}
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src="/oxoo-logo-symbol.png"
                alt="OXOO"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', transform: 'scale(1.08)', display: 'block' }}
                onError={(e) => {
                  // Fallback icon if symbol is not found
                  e.target.style.display = 'none';
                }}
              />
            </div>
            {/* Dedicated AI Assistant Badge */}
            <div
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                background: '#00f2fe',
                color: '#0a192f',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px #00f2fe',
                border: '1.5px solid #0a192f',
                zIndex: 2
              }}
              title="AI Assistant Active"
            >
              <Sparkles size={10} style={{ strokeWidth: 2.5 }} />
            </div>
          </div>

          {/* Real Notification Dot if unread */}
          {unreadCount > 0 && (
            <div className="oxoo-agent-notif-dot" title={`${unreadCount} unread message`} />
          )}
        </button>
      </div>

      {/* 2. CHAT MODAL WINDOW */}
      {isOpen && (
        <div
          className="oxoo-agent-window"
          role="dialog"
          aria-modal="true"
          aria-label="OXOO AI Assistant Chat Panel"
        >
          {/* Header */}
          <div className="oxoo-agent-header">
            <div className="oxoo-agent-header-brand">
              <div className="oxoo-agent-avatar" aria-hidden="true">
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src="/oxoo-logo-symbol.png"
                    alt="OXOO Agent"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', transform: 'scale(1.08)', display: 'block' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              </div>

              <div className="oxoo-agent-title-group">
                <h3>
                  {config.agentName || 'OXOO Agent'}
                  <span className="oxoo-agent-status-badge">
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                    Online
                  </span>
                </h3>
                <p>Your AI-powered OXOO assistant</p>
              </div>
            </div>

            <div className="oxoo-agent-header-actions">
              {/* Clear conversation */}
              <button
                type="button"
                className="oxoo-agent-icon-btn"
                onClick={() => setConfirmClearOpen(true)}
                title="Restart & clear conversation"
                aria-label="Clear conversation history"
              >
                <RotateCcw size={14} />
              </button>

              {/* Minimize */}
              <button
                type="button"
                className="oxoo-agent-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                aria-label="Minimize chat panel"
              >
                <Minus size={15} />
              </button>

              {/* Close */}
              <button
                type="button"
                className="oxoo-agent-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close chat panel"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="oxoo-agent-messages-container" aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={`oxoo-msg-row ${m.sender}`}>
                <div className="oxoo-msg-bubble">
                  {/* Markdown Answer */}
                  <MarkdownRenderer content={m.content} onNavigate={handleNavigate} />

                  {/* Interactive Plan Comparison Card */}
                  {m.action && m.action.type === 'compare_plans' && m.action.plans && (
                    <div className="oxoo-action-card">
                      <h4>
                        <ShieldCheck size={14} style={{ color: '#0284c7' }} />
                        {m.action.title || 'Official Published Plans'}
                      </h4>
                      <div className="oxoo-action-card-grid">
                        {m.action.plans.map((p, pIdx) => (
                          <div key={pIdx} className="oxoo-plan-card-item">
                            <div className="plan-info">
                              <strong>{p.name}</strong>
                              <span>{p.monthly} • {p.yearly}</span>
                            </div>
                            <button
                              type="button"
                              className="oxoo-btn-action"
                              onClick={() => handleNavigate(`/checkout?plan=${encodeURIComponent(p.name)}`)}
                            >
                              Choose Plan
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Consequential Action Card (Support Ticket Draft) */}
                  {m.action && m.action.type === 'create_ticket_draft' && (
                    <div className="oxoo-action-card" style={{ borderLeft: '3px solid #0284c7' }}>
                      <h4>
                        <LifeBuoy size={14} style={{ color: '#0284c7' }} />
                        {m.action.title || 'Draft Support Ticket'}
                      </h4>
                      <p style={{ fontSize: '11.5px', color: '#64748b', margin: '4px 0 8px' }}>
                        Confirming will immediately log ticket with our engineering on-call queue.
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="oxoo-btn-action"
                          onClick={() => {
                            setPendingAction({
                              type: 'create_support_ticket',
                              data: {
                                subject: 'User request from OXOO Agent',
                                description: m.content.slice(0, 200),
                                priority: 'Medium',
                                category: 'Technical'
                              }
                            });
                          }}
                        >
                          Confirm & Create Ticket
                        </button>
                        <button
                          type="button"
                          className="oxoo-btn-action-cancel"
                          onClick={() => handleNavigate('/help')}
                        >
                          Open Help Desk
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Contextual Action Links */}
                  {m.links && m.links.length > 0 && (
                    <div className="oxoo-chip-links">
                      {m.links.map((link, lIdx) => (
                        <button
                          key={lIdx}
                          type="button"
                          className="oxoo-chip-link"
                          onClick={() => handleNavigate(link.url)}
                        >
                          <span>{link.label}</span>
                          <ArrowUpRight size={12} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Metadata & Actions */}
                  <div className="oxoo-msg-meta">
                    <span>{m.time}</span>
                    {m.sender === 'agent' && (
                      <>
                        <button
                          type="button"
                          className="oxoo-msg-action-btn"
                          onClick={() => handleCopy(m.id, m.content)}
                          title="Copy answer"
                          aria-label="Copy answer to clipboard"
                        >
                          {copiedMsgId === m.id ? (
                            <>
                              <Check size={11} style={{ color: '#10b981' }} />
                              <span style={{ color: '#10b981' }}>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        {m.isError && m.retryText && (
                          <button
                            type="button"
                            className="oxoo-msg-action-btn"
                            style={{ color: '#ef4444' }}
                            onClick={() => handleSendMessage(m.retryText)}
                            title="Retry question"
                          >
                            <RotateCcw size={11} />
                            <span>Retry</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Loader */}
            {isLoading && (
              <div className="oxoo-msg-row agent">
                <div className="oxoo-typing-bubble" role="status" aria-label="OXOO Agent is thinking">
                  <div className="oxoo-typing-dot" />
                  <div className="oxoo-typing-dot" />
                  <div className="oxoo-typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions Pills Carousel */}
          {messages.length <= 3 && config.suggestedQuestions && config.suggestedQuestions.length > 0 && (
            <div className="oxoo-suggested-wrap">
              <div className="oxoo-suggested-label">Suggested Questions</div>
              <div className="oxoo-suggested-chips">
                {config.suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="oxoo-chip-btn"
                    onClick={() => handleSendMessage(q)}
                    disabled={isLoading}
                  >
                    <span>{q}</span>
                    <ChevronRight size={12} style={{ opacity: 0.6 }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Input Area */}
          <div className="oxoo-agent-footer">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="oxoo-input-form"
            >
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about software, pricing, apps, or support..."
                rows={1}
                className="oxoo-textarea"
                aria-label="Message for OXOO Agent"
                disabled={isLoading}
              />

              <button
                type="submit"
                className="oxoo-send-btn"
                disabled={!inputText.trim() || isLoading}
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </form>

            <div className="oxoo-footer-footnote">
              <span>Press <strong>Enter</strong> to send • <strong>Shift+Enter</strong> for newline</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <ShieldCheck size={11} style={{ color: '#0284c7' }} /> Verified Catalog
              </span>
            </div>
          </div>

          {/* Clear Conversation Confirmation Overlay */}
          {confirmClearOpen && (
            <div className="oxoo-confirm-overlay" role="dialog" aria-modal="true">
              <div className="oxoo-confirm-modal">
                <AlertCircle size={28} style={{ color: '#ef4444', margin: '0 auto 8px' }} />
                <h4>Clear Conversation?</h4>
                <p>This will delete your current chat history and reset the assistant.</p>
                <div className="oxoo-confirm-actions">
                  <button
                    type="button"
                    className="oxoo-btn-action-cancel"
                    onClick={() => setConfirmClearOpen(false)}
                  >
                    Keep History
                  </button>
                  <button
                    type="button"
                    className="oxoo-btn-action"
                    style={{ background: '#ef4444' }}
                    onClick={handleClearConversation}
                  >
                    Clear History
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Consequential Action Confirmation Overlay */}
          {pendingAction && (
            <div className="oxoo-confirm-overlay" role="dialog" aria-modal="true">
              <div className="oxoo-confirm-modal" style={{ maxWidth: '340px', textAlign: 'left' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={18} style={{ color: '#0284c7' }} />
                  Confirm Action
                </h4>
                <p style={{ fontSize: '13px', color: '#334155', margin: '8px 0 12px' }}>
                  Please confirm that you want to execute the following action:
                </p>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                  <div><strong>Action:</strong> {pendingAction.type}</div>
                  <div><strong>Subject:</strong> {pendingAction.data?.subject || 'Support Ticket'}</div>
                  <div><strong>Priority:</strong> {pendingAction.data?.priority || 'Medium'}</div>
                </div>
                <div className="oxoo-confirm-actions" style={{ justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="oxoo-btn-action-cancel"
                    onClick={() => setPendingAction(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="oxoo-btn-action"
                    onClick={() => handleConfirmAction(pendingAction)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Yes, Execute'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
