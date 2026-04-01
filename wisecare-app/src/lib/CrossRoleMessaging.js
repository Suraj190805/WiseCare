'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, ChevronDown, User, Stethoscope, Heart } from 'lucide-react';
import { useSharedData } from './SharedDataStore';

const ROLE_CONFIG = {
  patient: { name: 'Rajan Kumar', avatar: 'RK', icon: User, color: 'var(--accent-teal)', label: 'Patient' },
  doctor: { name: 'Dr. Priya Sharma', avatar: 'PS', icon: Stethoscope, color: 'var(--primary-soft)', label: 'Doctor' },
  caregiver: { name: 'Meera Kumar', avatar: 'MK', icon: Heart, color: 'var(--accent-purple)', label: 'Caregiver' },
};

function timeFormat(ts) {
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function CrossRoleMessaging({ currentRole = 'patient' }) {
  const { messages, sendMessage, markMessageRead, markAllMessagesRead, getUnreadMessageCount, getMessagesForRole } = useSharedData();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [text, setText] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const otherRoles = Object.keys(ROLE_CONFIG).filter(r => r !== currentRole);
  const totalUnread = getUnreadMessageCount(currentRole);

  const currentConfig = ROLE_CONFIG[currentRole];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeChat]);

  useEffect(() => {
    if (activeChat && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeChat]);

  const handleSend = () => {
    if (!text.trim() || !activeChat) return;
    const targetConfig = ROLE_CONFIG[activeChat];
    sendMessage({
      from: currentRole,
      fromName: currentConfig.name,
      to: activeChat,
      toName: targetConfig.name,
      text: text.trim(),
    });
    setText('');
  };

  const handleOpenChat = (role) => {
    setActiveChat(role);
    // Mark messages from this role as read
    messages.filter(m => m.from === role && m.to === currentRole && !m.read).forEach(m => {
      markMessageRead(m.id);
    });
  };

  const chatMessages = activeChat
    ? messages.filter(m =>
        (m.from === currentRole && m.to === activeChat) ||
        (m.from === activeChat && m.to === currentRole)
      ).sort((a, b) => a.timestamp - b.timestamp)
    : [];

  const getUnreadFrom = (role) => messages.filter(m => m.from === role && m.to === currentRole && !m.read).length;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) setActiveChat(null); }}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 500,
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--accent-teal))',
          border: 'none', cursor: 'pointer', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(79, 107, 255, 0.4)',
        }}
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
        {totalUnread > 0 && !isOpen && (
          <div style={{
            position: 'absolute', top: '-4px', right: '-4px',
            width: '22px', height: '22px', borderRadius: '50%',
            background: 'var(--accent-rose)', color: '#fff',
            fontSize: '0.7rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg-base)',
          }}>
            {totalUnread}
          </div>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: '92px', right: '24px', zIndex: 501,
              width: '360px', maxHeight: '520px',
              background: 'var(--bg-card)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--border-radius-lg)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              {activeChat ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => setActiveChat(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                  >
                    ←
                  </button>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${ROLE_CONFIG[activeChat].color}, var(--primary))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 700,
                  }}>
                    {ROLE_CONFIG[activeChat].avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{ROLE_CONFIG[activeChat].name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)' }} />
                      Online
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>Messages</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    Sending as {currentConfig.name}
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            {!activeChat ? (
              /* Contact List */
              <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
                {otherRoles.map(role => {
                  const config = ROLE_CONFIG[role];
                  const unread = getUnreadFrom(role);
                  const lastMsg = messages
                    .filter(m => (m.from === role && m.to === currentRole) || (m.from === currentRole && m.to === role))
                    .sort((a, b) => b.timestamp - a.timestamp)[0];

                  return (
                    <motion.div
                      key={role}
                      whileHover={{ background: 'rgba(79, 107, 255, 0.05)' }}
                      onClick={() => handleOpenChat(role)}
                      style={{
                        display: 'flex', gap: '12px', alignItems: 'center',
                        padding: '14px 12px', borderRadius: 'var(--border-radius-sm)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        background: `linear-gradient(135deg, ${config.color}, var(--primary))`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.85rem', fontWeight: 700, position: 'relative',
                      }}>
                        {config.avatar}
                        <div style={{
                          position: 'absolute', bottom: '0', right: '0',
                          width: '10px', height: '10px', borderRadius: '50%',
                          background: 'var(--accent-emerald)', border: '2px solid var(--bg-card)',
                        }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{config.name}</span>
                          {unread > 0 && (
                            <span style={{
                              width: '20px', height: '20px', borderRadius: '50%',
                              background: 'var(--primary)', color: '#fff',
                              fontSize: '0.65rem', fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {unread}
                            </span>
                          )}
                        </div>
                        <div style={{
                          fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {lastMsg ? lastMsg.text : 'No messages yet'}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* Chat View */
              <>
                <div
                  ref={scrollRef}
                  style={{
                    flex: 1, overflow: 'auto', padding: '16px',
                    display: 'flex', flexDirection: 'column', gap: '10px',
                  }}
                >
                  {chatMessages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                      <MessageSquare size={32} style={{ marginBottom: '8px', opacity: 0.3 }} />
                      <p>No messages yet</p>
                      <p style={{ fontSize: 'var(--font-size-xs)' }}>Send a message to start the conversation</p>
                    </div>
                  )}
                  {chatMessages.map(msg => {
                    const isMine = msg.from === currentRole;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          display: 'flex',
                          justifyContent: isMine ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div style={{
                          maxWidth: '80%',
                          padding: '10px 14px',
                          borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          background: isMine
                            ? 'linear-gradient(135deg, var(--primary), rgba(79, 107, 255, 0.8))'
                            : 'var(--bg-elevated)',
                          color: isMine ? '#fff' : 'var(--text-primary)',
                          fontSize: 'var(--font-size-sm)',
                          lineHeight: 1.5,
                        }}>
                          <div>{msg.text}</div>
                          <div style={{
                            fontSize: '0.6rem', marginTop: '4px',
                            color: isMine ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)',
                            textAlign: 'right',
                          }}>
                            {timeFormat(msg.timestamp)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Input */}
                <div style={{
                  padding: '12px 16px', borderTop: '1px solid var(--border-subtle)',
                  display: 'flex', gap: '8px', alignItems: 'center',
                }}>
                  <input
                    ref={inputRef}
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    style={{
                      flex: 1, background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '20px', padding: '10px 16px',
                      color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)',
                      outline: 'none',
                    }}
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSend}
                    disabled={!text.trim()}
                    style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: text.trim() ? 'var(--primary)' : 'var(--bg-elevated)',
                      border: 'none', cursor: text.trim() ? 'pointer' : 'default',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: text.trim() ? '#fff' : 'var(--text-muted)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Send size={16} />
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
