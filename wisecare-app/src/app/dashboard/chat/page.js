'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Bot, User, Volume2, VolumeX, Trash2, Globe } from 'lucide-react';
import { MOCK_CHAT_HISTORY, AI_SYSTEM_PROMPT } from '@/lib/mockData';

export default function ChatPage() {
  const [messages, setMessages] = useState(MOCK_CHAT_HISTORY);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const languages = [
    { code: 'en-IN', label: 'English' },
    { code: 'hi-IN', label: 'हिन्दी' },
    { code: 'kn-IN', label: 'ಕನ್ನಡ' },
    { code: 'ta-IN', label: 'தமிழ்' },
    { code: 'te-IN', label: 'తెలుగు' },
    { code: 'bn-IN', label: 'বাংলা' },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getAIResponse = async (userMessage) => {
    // Simulated AI responses based on keywords
    const msg = userMessage.toLowerCase();
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1500));

    if (msg.includes('medicine') || msg.includes('medication') || msg.includes('pill')) {
      return "Here's your medication update:\n\n💊 **Completed today:**\n• Metformin 500mg (8:00 AM) ✅\n• Amlodipine 5mg (9:00 AM) ✅\n• Aspirin 75mg (8:00 AM) ✅\n\n⏰ **Still pending:**\n• Metformin 500mg at 8:00 PM\n• Atorvastatin 10mg at 9:00 PM\n\nYou're doing great today! 87% adherence this week. 💪";
    }
    if (msg.includes('pain') || msg.includes('hurt') || msg.includes('ache')) {
      return "I'm sorry to hear you're in pain. 😟 Can you tell me:\n\n1. Where exactly is the pain?\n2. When did it start?\n3. How would you rate it from 1-10?\n\nIf you're experiencing severe chest pain, difficulty breathing, or sudden numbness, please use the **SOS button** immediately or I can contact Dr. Priya Sharma for you.\n\nFor mild discomfort, try gentle stretching and stay hydrated. 💧";
    }
    if (msg.includes('food') || msg.includes('eat') || msg.includes('hungry') || msg.includes('diet')) {
      return "Based on your diabetes management plan, here are some good options right now:\n\n🥗 **Light Snack Ideas:**\n• A handful of almonds (5-6 pieces)\n• Apple slices with a touch of cinnamon\n• Cucumber & carrot sticks with hummus\n• Green tea (unsweetened)\n\n⚠️ **Avoid:** Sugary snacks, white bread, processed foods\n\n🕐 Your dinner at 7:30 PM is planned: Wheat roti with lauki sabzi. Would you like to adjust it?";
    }
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return `Hello, Rajan! 😊 How are you feeling today? Is there anything I can help you with?\n\nHere are some things I can do:\n• 💊 Check your medication schedule\n• 🍽️ Suggest healthy meals\n• 📞 Schedule a doctor appointment\n• 🏃 Review your activity today\n• 🆘 Trigger an emergency alert\n\nJust ask me anything!`;
    }
    if (msg.includes('exercise') || msg.includes('walk') || msg.includes('active')) {
      return "Great thinking about staying active! 🚶‍♂️\n\nToday's activity so far:\n• **Steps:** 3,200 / 5,000 goal\n• **Active minutes:** 45 minutes\n\n**Recommended for your health:**\n• 15-20 minute gentle walk after meals\n• Chair yoga (great for joints)\n• Light stretching in the morning\n\n⚠️ Avoid high-intensity exercises. Keep your heart rate below 110 BPM with your blood pressure medication.\n\nShall I set a walking reminder for after lunch?";
    }
    if (msg.includes('sleep') || msg.includes('tired') || msg.includes('rest')) {
      return "Let's talk about your sleep! 😴\n\n**Last night:** You slept 7.5 hours — that's good!\n\n**Tips for better sleep:**\n• 🌙 Take Atorvastatin at 9 PM (as scheduled)\n• 📱 Reduce screen time 1 hour before bed\n• ☕ No caffeine after 3 PM\n• 🧘 Try deep breathing for 5 minutes at bedtime\n\nYour sleep has been consistent this week. Keep it up!";
    }
    if (msg.includes('doctor') || msg.includes('appointment') || msg.includes('consult')) {
      return "📋 **Your upcoming appointments:**\n\n1. **Dr. Priya Sharma** (Cardiologist)\n   📅 Today at 3:00 PM — Video Call\n   \n2. **Dr. Rajesh Iyer** (Endocrinologist)\n   📅 April 5 at 11:00 AM — In-person\n\nWould you like me to:\n• 📹 Start the video call with Dr. Priya?\n• 📅 Schedule a new appointment?\n• 📝 Prepare your health summary for the doctor?";
    }
    return "I understand! Let me think about that... 🤔\n\nAs your AI health companion, I'm here to help with:\n• Medication schedules and reminders\n• Diet and nutrition advice\n• Exercise recommendations\n• Doctor appointments\n• Health questions and wellness tips\n\nCould you tell me more about what you need? I'll do my best to help! 💙";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const response = await getAIResponse(input.trim());

    const aiMsg = {
      id: `msg_${Date.now() + 1}`,
      role: 'ai',
      content: response,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };

    setIsTyping(false);
    setMessages(prev => [...prev, aiMsg]);

    // TTS
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(response.replace(/[*#_]/g, '').replace(/\n/g, '. '));
      utterance.lang = selectedLang;
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser. Try Chrome.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang;
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fade-in" style={{ height: 'calc(100vh - var(--header-height) - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-teal), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            🤖
          </div>
          <div>
            <h2 style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>CareCompanion AI</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--accent-emerald)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)' }} />
              Online • Ready to help
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Language selector */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--border-radius-sm)', padding: '8px 12px',
                color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)',
                cursor: 'pointer', appearance: 'none', paddingRight: '32px'
              }}
            >
              {languages.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            <Globe size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          </div>

          {isSpeaking && (
            <motion.button
              className="btn btn-icon btn-ghost sm"
              onClick={stopSpeaking}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <VolumeX size={18} />
            </motion.button>
          )}

          <button
            className="btn btn-icon btn-ghost sm"
            onClick={() => setMessages(MOCK_CHAT_HISTORY.slice(0, 1))}
            title="Clear chat"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{ flex: 1, overflow: 'auto' }}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
              <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                {msg.role === 'ai' ? 'CareCompanion AI' : 'You'}
              </span>
              <span style={{ fontSize: 'var(--font-size-xs)', opacity: 0.7, marginLeft: 'auto' }}>
                {msg.timestamp}
              </span>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{
                __html: msg.content
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br/>')
              }}
            />
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            className="chat-bubble ai"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div style={{ display: 'flex', gap: '6px', padding: '8px 4px' }}>
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-muted)' }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <motion.button
          className={`voice-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
          whileTap={{ scale: 0.9 }}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? <MicOff size={22} /> : <Mic size={22} />}
        </motion.button>

        <textarea
          className="chat-input"
          placeholder={isListening ? '🎙️ Listening...' : 'Type your message or tap the mic...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        <motion.button
          className="btn btn-primary btn-icon"
          onClick={handleSend}
          disabled={!input.trim()}
          whileTap={{ scale: 0.9 }}
          style={{ opacity: input.trim() ? 1 : 0.5 }}
        >
          <Send size={20} />
        </motion.button>
      </div>

      {/* Voice listening indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed', bottom: '120px', left: '50%', transform: 'translateX(-50%)',
              padding: '12px 24px', background: 'var(--accent-rose)', color: 'white',
              borderRadius: 'var(--border-radius-full)', display: 'flex', alignItems: 'center', gap: '10px',
              fontSize: 'var(--font-size-sm)', fontWeight: 600, boxShadow: '0 4px 20px rgba(244,63,94,0.4)'
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Mic size={18} />
            </motion.div>
            Listening... Speak now
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
