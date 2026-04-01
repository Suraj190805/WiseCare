'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Volume2, Navigation, CheckCircle, AlertCircle, Radio } from 'lucide-react';

// ─── Wake word ───
const WAKE_WORD = 'hey care';
const WAKE_WORD_VARIANTS = [
  'hey care', 'hey car', 'hey ker', 'a care', 'hey claire', 
  'hey there', 'hey cair', 'hey kare', 'hey carer', 'hey karen',
  'hey care.', 'hey care,', 'hey care!', 'hey care?',
  'a care', 'hey keer', 'hey gear', 'hey clear', 'hey cure',
  'hey core', 'hey carry', 'hey carey', 'hey cher', 'hey cheer',
];

// ─── Voice command definitions per role ───
const VOICE_ROUTES = {
  patient: [
    { keywords: ['dashboard', 'home', 'main', 'overview'], route: '/dashboard', label: 'Dashboard' },
    { keywords: ['medication', 'medications', 'medicine', 'medicines', 'pills', 'drugs'], route: '/dashboard/medications', label: 'Medications' },
    { keywords: ['diet', 'nutrition', 'food', 'meal', 'meals'], route: '/dashboard/diet', label: 'Diet & Nutrition' },
    { keywords: ['chat', 'companion', 'ai', 'assistant', 'talk'], route: '/dashboard/chat', label: 'AI Companion' },
    { keywords: ['emergency', 'sos', 'help', 'urgent', 'danger'], route: '/dashboard/emergency', label: 'Emergency SOS' },
    { keywords: ['location', 'map', 'gps', 'where', 'track', 'tracking'], route: '/dashboard/location', label: 'Location' },
    { keywords: ['appointment', 'appointments', 'schedule', 'doctor visit', 'booking'], route: '/dashboard/appointments', label: 'Appointments' },
    { keywords: ['settings', 'setting', 'preferences', 'profile', 'account'], route: '/dashboard/settings', label: 'Settings' },
  ],
  doctor: [
    { keywords: ['dashboard', 'home', 'main', 'overview'], route: '/doctor', label: 'Dashboard' },
    { keywords: ['patient', 'patients', 'my patients'], route: '/doctor/patients', label: 'My Patients' },
    { keywords: ['appointment', 'appointments', 'schedule', 'calendar'], route: '/doctor/appointments', label: 'Appointments' },
    { keywords: ['record', 'records', 'health records', 'medical records'], route: '/doctor/records', label: 'Health Records' },
    { keywords: ['interaction', 'interactions', 'drug interaction', 'drug interactions'], route: '/doctor/interactions', label: 'Drug Interactions' },
    { keywords: ['report', 'reports', 'analytics'], route: '/doctor/reports', label: 'Reports' },
  ],
  caregiver: [
    { keywords: ['dashboard', 'home', 'main', 'overview'], route: '/caregiver', label: 'Dashboard' },
    { keywords: ['patient', 'patients', 'linked patients'], route: '/caregiver/patients', label: 'Linked Patients' },
    { keywords: ['alert', 'alerts', 'notification', 'notifications'], route: '/caregiver/alerts', label: 'Alerts' },
    { keywords: ['location', 'map', 'gps', 'where', 'track', 'live location'], route: '/caregiver/location', label: 'Live Location' },
    { keywords: ['activity', 'activities', 'monitor', 'monitoring'], route: '/caregiver/activity', label: 'Activity Monitor' },
    { keywords: ['medication', 'medications', 'medicine', 'medicines'], route: '/caregiver/medications', label: 'Medications' },
  ],
  global: [
    { keywords: ['login', 'sign in', 'log in'], route: '/login', label: 'Login' },
    { keywords: ['home page', 'landing', 'welcome'], route: '/', label: 'Home' },
    { keywords: ['logout', 'log out', 'sign out'], route: '/login', label: 'Logout', action: 'logout' },
  ],
};

const VOICE_ACTIONS = [
  { keywords: ['scroll down', 'go down', 'page down'], action: 'scroll_down', label: 'Scroll Down' },
  { keywords: ['scroll up', 'go up', 'page up'], action: 'scroll_up', label: 'Scroll Up' },
  { keywords: ['go back', 'back', 'previous', 'return'], action: 'go_back', label: 'Go Back' },
  { keywords: ['scroll top', 'top', 'beginning'], action: 'scroll_top', label: 'Scroll to Top' },
  { keywords: ['refresh', 'reload'], action: 'refresh', label: 'Refresh Page' },
];

function detectRole(pathname) {
  if (pathname.startsWith('/doctor')) return 'doctor';
  if (pathname.startsWith('/caregiver')) return 'caregiver';
  if (pathname.startsWith('/dashboard')) return 'patient';
  return null;
}

// Play a short activation chime using Web Audio API
function playActivationChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime + 0.08);
    osc1.stop(ctx.currentTime + 0.3);
    osc2.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Audio not available, silently skip
  }
}

function containsWakeWord(text) {
  const normalized = text.toLowerCase().trim();
  return WAKE_WORD_VARIANTS.some(variant => normalized.includes(variant));
}

// Extract command after wake word (e.g. "hey care open medications" → "open medications")
function extractCommandAfterWakeWord(text) {
  const normalized = text.toLowerCase().trim();
  for (const variant of WAKE_WORD_VARIANTS) {
    const idx = normalized.indexOf(variant);
    if (idx !== -1) {
      const afterWake = normalized.substring(idx + variant.length).trim();
      if (afterWake.length > 1) return afterWake;
    }
  }
  return null;
}

export default function VoiceNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  
  // States
  const [wakeWordActive, setWakeWordActive] = useState(false);   // Background listener on
  const [isListening, setIsListening] = useState(false);          // Command mode active
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [wakeWordHeard, setWakeWordHeard] = useState(false);      // Flash animation when wake word detected
  const [micPermission, setMicPermission] = useState('unknown');  // 'unknown' | 'granted' | 'denied' | 'prompt'
  
  // Refs
  const wakeRecognitionRef = useRef(null);  // Background wake word listener
  const cmdRecognitionRef = useRef(null);   // Command recognition
  const timeoutRef = useRef(null);
  const hintTimeoutRef = useRef(null);
  const restartTimeoutRef = useRef(null);
  const isCommandModeRef = useRef(false);   // Prevents wake listener from interfering
  const wakeWordActiveRef = useRef(false);  // Mirror state to ref for use in callbacks
  const hasAutoStartedRef = useRef(false);  // Track if we already auto-started

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Keep ref in sync with state
  useEffect(() => {
    wakeWordActiveRef.current = wakeWordActive;
  }, [wakeWordActive]);

  // ─── Check microphone permission on mount ───
  useEffect(() => {
    if (!isSupported) return;
    
    // Check current permission status
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' })
        .then(result => {
          setMicPermission(result.state); // 'granted', 'denied', or 'prompt'
          
          // Listen for permission changes
          result.onchange = () => {
            setMicPermission(result.state);
          };
        })
        .catch(() => {
          // Some browsers don't support querying mic permission
          setMicPermission('unknown');
        });
    }
  }, [isSupported]);

  // ─── Start wake word listener function ───
  const startWakeWordListener = useCallback(() => {
    if (!wakeRecognitionRef.current) return false;
    
    try {
      wakeRecognitionRef.current.start();
      setWakeWordActive(true);
      return true;
    } catch (e) {
      // Already started or other issue — check if it's running
      if (e.message && e.message.includes('already started')) {
        setWakeWordActive(true);
        return true;
      }
      console.warn('Could not start wake word listener:', e.message);
      return false;
    }
  }, []);

  const stopWakeWordListener = useCallback(() => {
    try {
      wakeRecognitionRef.current?.abort();
    } catch (e) {}
    clearTimeout(restartTimeoutRef.current);
    setWakeWordActive(false);
  }, []);

  // ─── Initialize WAKE WORD listener (background, continuous) ───
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const wakeRecognition = new SpeechRecognition();
    wakeRecognition.continuous = true;
    wakeRecognition.interimResults = true;
    wakeRecognition.lang = 'en-US';
    wakeRecognition.maxAlternatives = 5;

    wakeRecognition.onresult = (event) => {
      // Don't process if we're already in command mode
      if (isCommandModeRef.current) return;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        // Check all alternatives for better wake word detection
        for (let j = 0; j < event.results[i].length; j++) {
          const text = event.results[i][j].transcript.toLowerCase().trim();
          
          if (containsWakeWord(text)) {
            // Wake word detected!
            const inlineCommand = extractCommandAfterWakeWord(text);
            activateCommandMode(inlineCommand);
            return;
          }
        }
      }
    };

    wakeRecognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // Normal — will restart via onend
      } else if (event.error === 'not-allowed') {
        setWakeWordActive(false);
        setMicPermission('denied');
        console.warn('Microphone access denied for wake word listener');
        return;
      } else if (event.error === 'network') {
        // Network error — retry after a delay
      }
    };

    wakeRecognition.onend = () => {
      // Auto-restart wake word listener unless in command mode
      if (!isCommandModeRef.current && wakeWordActiveRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          try {
            wakeRecognition.start();
          } catch (e) {
            // If can't restart, try again after a longer delay
            restartTimeoutRef.current = setTimeout(() => {
              try { wakeRecognition.start(); } catch (e2) {}
            }, 2000);
          }
        }, 300);
      }
    };

    wakeRecognitionRef.current = wakeRecognition;

    return () => {
      wakeRecognition.abort();
      clearTimeout(restartTimeoutRef.current);
    };
  }, [isSupported]); // Only recreate on mount — no wakeWordActive dependency

  // ─── Initialize COMMAND listener ───
  useEffect(() => {
    if (!isSupported) {
      setStatus('unsupported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const cmdRecognition = new SpeechRecognition();
    cmdRecognition.continuous = false;
    cmdRecognition.interimResults = true;
    cmdRecognition.lang = 'en-US';
    cmdRecognition.maxAlternatives = 3;

    cmdRecognition.onstart = () => {
      setIsListening(true);
      setStatus('listening');
      setStatusMessage('Listening for command...');
      setTranscript('');
    };

    cmdRecognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        processCommand(finalTranscript.toLowerCase().trim());
      }
    };

    cmdRecognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        setStatus('error');
        setStatusMessage('No speech detected. Try again.');
      } else if (event.error === 'not-allowed') {
        setStatus('error');
        setStatusMessage('Microphone access denied.');
      } else {
        setStatus('error');
        setStatusMessage('Could not recognize. Try again.');
      }
      deactivateCommandMode();
    };

    cmdRecognition.onend = () => {
      setIsListening(false);
      clearTimeout(timeoutRef.current);
      // Return to wake word mode after command finishes
      deactivateCommandMode();
    };

    cmdRecognitionRef.current = cmdRecognition;

    return () => {
      cmdRecognition.abort();
      clearTimeout(timeoutRef.current);
      clearTimeout(hintTimeoutRef.current);
    };
  }, [isSupported]);

  // ─── AUTO-START wake word on page load (the KEY fix) ───
  // This requests mic permission automatically and starts listening
  useEffect(() => {
    if (!isSupported || hasAutoStartedRef.current) return;
    if (pathname === '/') return; // Don't auto-start on landing page
    
    const autoStart = async () => {
      hasAutoStartedRef.current = true;
      
      // Small delay to let components mount
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Try to get mic permission first
      try {
        // This triggers the browser permission prompt if not yet granted
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Permission granted — stop the test stream
        stream.getTracks().forEach(track => track.stop());
        setMicPermission('granted');
        
        // Now start the wake word listener
        startWakeWordListener();
      } catch (err) {
        if (err.name === 'NotAllowedError') {
          setMicPermission('denied');
          console.warn('Mic permission denied — wake word won\'t auto-start');
        } else {
          console.warn('Mic not available:', err.message);
        }
      }
    };

    autoStart();
  }, [isSupported, pathname, startWakeWordListener]);

  // ─── Restart wake word when navigating (if it was active) ───
  useEffect(() => {
    if (!isSupported || !wakeWordActive || isCommandModeRef.current) return;
    
    // After navigation, ensure wake word listener is running
    const restartTimer = setTimeout(() => {
      if (wakeWordActiveRef.current && !isCommandModeRef.current) {
        try {
          wakeRecognitionRef.current?.start();
        } catch (e) {
          // Already running, which is fine
        }
      }
    }, 1000);
    
    return () => clearTimeout(restartTimer);
  }, [pathname, isSupported, wakeWordActive]);

  // ─── Activate / Deactivate wake word listening ───
  const toggleWakeWord = useCallback(() => {
    if (!isSupported) return;

    if (wakeWordActive) {
      stopWakeWordListener();
    } else {
      // If permission is denied, try requesting again
      if (micPermission === 'denied') {
        setStatusMessage('Please allow microphone access in your browser settings.');
        setStatus('error');
        setTimeout(() => { setStatus('idle'); setStatusMessage(''); }, 3000);
        return;
      }
      startWakeWordListener();
    }
  }, [isSupported, wakeWordActive, micPermission, startWakeWordListener, stopWakeWordListener]);

  // ─── Command mode transitions ───
  const activateCommandMode = useCallback((inlineCommand = null) => {
    isCommandModeRef.current = true;
    
    // Stop wake word listener
    try {
      wakeRecognitionRef.current?.abort();
    } catch (e) {}
    clearTimeout(restartTimeoutRef.current);

    // Visual + audio feedback
    setWakeWordHeard(true);
    playActivationChime();
    setTimeout(() => setWakeWordHeard(false), 1500);

    if (inlineCommand) {
      // User said "hey care medications" — process inline
      setIsListening(true);
      setStatus('processing');
      setTranscript(inlineCommand);
      setTimeout(() => processCommand(inlineCommand), 400);
    } else {
      // Start command listener
      try {
        cmdRecognitionRef.current?.start();
        // Auto-stop after 8 seconds
        timeoutRef.current = setTimeout(() => {
          cmdRecognitionRef.current?.stop();
        }, 8000);
      } catch (e) {
        console.error('Failed to start command recognition:', e);
        deactivateCommandMode();
      }
    }
  }, []);

  const deactivateCommandMode = useCallback(() => {
    isCommandModeRef.current = false;
    setIsListening(false);
    clearTimeout(timeoutRef.current);
    
    // Restart wake word listener after a short delay
    if (wakeWordActiveRef.current) {
      restartTimeoutRef.current = setTimeout(() => {
        try {
          wakeRecognitionRef.current?.start();
        } catch (e) {
          // Try again after another delay
          restartTimeoutRef.current = setTimeout(() => {
            try { wakeRecognitionRef.current?.start(); } catch (e2) {}
          }, 1000);
        }
      }, 600);
    }
  }, []);

  // ─── Show hint on first visit ───
  useEffect(() => {
    const hasSeenHint = sessionStorage.getItem('voice_nav_hint_seen');
    if (!hasSeenHint && isSupported) {
      hintTimeoutRef.current = setTimeout(() => {
        setShowHint(true);
        setTimeout(() => {
          setShowHint(false);
          sessionStorage.setItem('voice_nav_hint_seen', 'true');
        }, 6000);
      }, 3000);
    }
  }, [isSupported]);

  // ─── Process voice command ───
  const processCommand = useCallback((text) => {
    setStatus('processing');
    setStatusMessage('Processing...');

    // Strip wake word from text if present
    let cleanText = text;
    for (const variant of WAKE_WORD_VARIANTS) {
      cleanText = cleanText.replace(variant, '').trim();
    }
    if (!cleanText) cleanText = text;

    const role = detectRole(pathname);

    // Check voice actions first
    for (const action of VOICE_ACTIONS) {
      if (action.keywords.some(kw => cleanText.includes(kw))) {
        executeAction(action);
        return;
      }
    }

    // Check role-specific routes
    if (role && VOICE_ROUTES[role]) {
      for (const routeDef of VOICE_ROUTES[role]) {
        if (routeDef.keywords.some(kw => cleanText.includes(kw))) {
          navigateTo(routeDef);
          return;
        }
      }
    }

    // Check global routes
    for (const routeDef of VOICE_ROUTES.global) {
      if (routeDef.keywords.some(kw => cleanText.includes(kw))) {
        if (routeDef.action === 'logout') {
          localStorage.removeItem('carecompanion_user');
        }
        navigateTo(routeDef);
        return;
      }
    }

    // No match
    setStatus('error');
    setStatusMessage(`Couldn't understand "${cleanText}". Try a page name.`);
    addToHistory(cleanText, null, false);

    setTimeout(() => {
      setStatus('idle');
      setStatusMessage('');
    }, 3000);
  }, [pathname, router]);

  const navigateTo = useCallback((routeDef) => {
    setStatus('success');
    setStatusMessage(`Navigating to ${routeDef.label}`);
    addToHistory(transcript, routeDef.label, true);
    speak(`Going to ${routeDef.label}`);

    setTimeout(() => {
      router.push(routeDef.route);
      setStatus('idle');
      setStatusMessage('');
      setTranscript('');
    }, 800);
  }, [router, transcript]);

  const executeAction = useCallback((actionDef) => {
    setStatus('success');
    setStatusMessage(actionDef.label);
    addToHistory(transcript, actionDef.label, true);

    switch (actionDef.action) {
      case 'scroll_down': window.scrollBy({ top: 400, behavior: 'smooth' }); break;
      case 'scroll_up': window.scrollBy({ top: -400, behavior: 'smooth' }); break;
      case 'scroll_top': window.scrollTo({ top: 0, behavior: 'smooth' }); break;
      case 'go_back': router.back(); break;
      case 'refresh': window.location.reload(); break;
    }

    setTimeout(() => {
      setStatus('idle');
      setStatusMessage('');
      setTranscript('');
    }, 1500);
  }, [router, transcript]);

  const addToHistory = (command, result, success) => {
    setCommandHistory(prev => [
      { command, result, success, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9),
    ]);
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Manual mic button click — still available as fallback
  const toggleListening = () => {
    if (!isSupported) {
      setStatus('unsupported');
      setStatusMessage('Voice not supported in this browser');
      return;
    }

    if (isListening) {
      cmdRecognitionRef.current?.stop();
      deactivateCommandMode();
      setStatus('idle');
    } else {
      activateCommandMode();
    }
  };

  const role = detectRole(pathname);
  const availableCommands = [
    ...(role && VOICE_ROUTES[role] ? VOICE_ROUTES[role] : []),
    ...VOICE_ROUTES.global,
  ];

  // Don't render on landing page
  if (pathname === '/') return null;

  return (
    <>
      {/* Floating Mic Button */}
      <motion.button
        id="voice-nav-btn"
        onClick={toggleListening}
        className={`voice-nav-fab ${isListening ? 'active' : ''} ${status === 'success' ? 'success' : ''} ${status === 'error' ? 'error' : ''} ${wakeWordHeard ? 'wake-detected' : ''}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
        title={wakeWordActive ? 'Say "Hey Care" or click to activate' : 'Voice Navigation'}
      >
        {isListening ? <Mic size={24} /> : wakeWordActive ? <Mic size={24} /> : <MicOff size={24} />}
        {isListening && (
          <>
            <span className="voice-nav-ripple" />
            <span className="voice-nav-ripple delay-1" />
            <span className="voice-nav-ripple delay-2" />
          </>
        )}
        {/* Subtle breathing animation when wake word is active but not in command mode */}
        {wakeWordActive && !isListening && (
          <span className="voice-nav-wake-active-ring" />
        )}
      </motion.button>

      {/* Wake word status indicator */}
      <motion.button
        className={`voice-nav-wake-indicator ${wakeWordActive ? 'active' : ''} ${wakeWordHeard ? 'heard' : ''}`}
        onClick={toggleWakeWord}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.4, type: 'spring', stiffness: 260, damping: 20 }}
        title={wakeWordActive ? '"Hey Care" listening — click to disable' : 'Enable "Hey Care" wake word'}
      >
        <Radio size={14} />
        <span className="voice-nav-wake-label">
          {wakeWordActive ? 'Hey Care ✓' : micPermission === 'denied' ? 'Mic Blocked' : 'Off'}
        </span>
        {wakeWordActive && <span className="voice-nav-wake-dot" />}
      </motion.button>

      {/* Hint tooltip */}
      <AnimatePresence>
        {showHint && !isListening && (
          <motion.div
            className="voice-nav-hint"
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
          >
            <Mic size={16} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
            <span>
              {wakeWordActive 
                ? <>Voice is <strong>active</strong>! Just say <strong>"Hey Care"</strong> + a command to navigate hands-free!</>
                : <>Say <strong>"Hey Care"</strong> followed by a command to navigate hands-free!</>
              }
            </span>
            <button onClick={() => setShowHint(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wake word detected flash */}
      <AnimatePresence>
        {wakeWordHeard && !isListening && (
          <motion.div
            className="voice-nav-wake-flash"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <CheckCircle size={20} style={{ color: 'var(--accent-teal)' }} />
            <span>"Hey Care" detected!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listening Overlay */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="voice-nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="voice-nav-modal"
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="voice-nav-viz">
                <div className="voice-nav-viz-ring ring-1" />
                <div className="voice-nav-viz-ring ring-2" />
                <div className="voice-nav-viz-ring ring-3" />
                <div className="voice-nav-viz-icon">
                  <Mic size={32} />
                </div>
              </div>

              <p className="voice-nav-modal-title">
                {status === 'processing' ? 'Processing...' : 'Listening...'}
              </p>

              {transcript && (
                <motion.p
                  className="voice-nav-transcript"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  &ldquo;{transcript}&rdquo;
                </motion.p>
              )}

              <p className="voice-nav-modal-hint">
                Say a page name like <strong>&ldquo;medications&rdquo;</strong>, <strong>&ldquo;appointments&rdquo;</strong>, or <strong>&ldquo;go back&rdquo;</strong>
              </p>

              <button
                className="voice-nav-cancel"
                onClick={() => {
                  cmdRecognitionRef.current?.stop();
                  deactivateCommandMode();
                  setStatus('idle');
                }}
              >
                <X size={18} /> Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Toast */}
      <AnimatePresence>
        {!isListening && status !== 'idle' && status !== 'unsupported' && statusMessage && (
          <motion.div
            className={`voice-nav-toast ${status}`}
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.9 }}
          >
            {status === 'success' ? (
              <CheckCircle size={20} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
            ) : (
              <AlertCircle size={20} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />
            )}
            <span>{statusMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            className="voice-nav-panel"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="voice-nav-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Navigation size={18} style={{ color: 'var(--accent-teal)' }} />
                <span style={{ fontWeight: 700 }}>Voice Commands</span>
              </div>
              <button onClick={() => setShowPanel(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Wake word info */}
            <div className="voice-nav-panel-section" style={{ background: 'var(--accent-teal-soft)', padding: '14px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--font-size-sm)' }}>
                <Radio size={16} style={{ color: 'var(--accent-teal)' }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--accent-teal)' }}>
                    Wake Word: &ldquo;Hey Care&rdquo; {wakeWordActive ? '— Active ✓' : '— Inactive'}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {wakeWordActive 
                      ? 'Just say "Hey Care" + command — no clicking needed!'
                      : 'Click the indicator to enable hands-free activation'
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="voice-nav-panel-section">
              <div className="voice-nav-panel-label">Navigation</div>
              {availableCommands.map((cmd, i) => (
                <div key={i} className="voice-nav-cmd-item">
                  <span style={{ fontWeight: 500 }}>{cmd.label}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                    &ldquo;{cmd.keywords[0]}&rdquo;
                  </span>
                </div>
              ))}
            </div>

            <div className="voice-nav-panel-section">
              <div className="voice-nav-panel-label">Actions</div>
              {VOICE_ACTIONS.map((action, i) => (
                <div key={i} className="voice-nav-cmd-item">
                  <span style={{ fontWeight: 500 }}>{action.label}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                    &ldquo;{action.keywords[0]}&rdquo;
                  </span>
                </div>
              ))}
            </div>

            {commandHistory.length > 0 && (
              <div className="voice-nav-panel-section">
                <div className="voice-nav-panel-label">Recent</div>
                {commandHistory.map((item, i) => (
                  <div key={i} className="voice-nav-cmd-item" style={{ opacity: 0.7 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {item.success ? (
                        <CheckCircle size={12} style={{ color: 'var(--accent-emerald)' }} />
                      ) : (
                        <AlertCircle size={12} style={{ color: 'var(--accent-rose)' }} />
                      )}
                      <span style={{ fontSize: 'var(--font-size-xs)' }}>&ldquo;{item.command}&rdquo;</span>
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help / Panel toggle button */}
      <motion.button
        className="voice-nav-help-btn"
        onClick={() => setShowPanel(!showPanel)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 20 }}
        title="Voice Commands List"
      >
        <Volume2 size={16} />
      </motion.button>
    </>
  );
}
