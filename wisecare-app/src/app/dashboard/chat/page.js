'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Bot, User, Volume2, VolumeX, Trash2, Globe, Languages } from 'lucide-react';
import { MOCK_CHAT_HISTORY, AI_SYSTEM_PROMPT } from '@/lib/mockData';
import { useLanguage } from '@/lib/LanguageContext';

// Language code mapping: global language code -> speech API code
const LANG_MAP = {
  en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN', mr: 'mr-IN',
};

// Language display names for UI
const LANG_NAMES = {
  en: 'English', hi: 'हिन्दी', kn: 'ಕನ್ನಡ', ta: 'தமிழ்', te: 'తెలుగు', bn: 'বাংলা', mr: 'मराठी',
};

// Translated AI responses per language
const AI_RESPONSES = {
  en: {
    medication: "Here's your medication update:\n\n💊 **Completed today:**\n• Metformin 500mg (8:00 AM) ✅\n• Amlodipine 5mg (9:00 AM) ✅\n• Aspirin 75mg (8:00 AM) ✅\n\n⏰ **Still pending:**\n• Metformin 500mg at 8:00 PM\n• Atorvastatin 10mg at 9:00 PM\n\nYou're doing great today! 87% adherence this week. 💪",
    pain: "I'm sorry to hear you're in pain. 😟 Can you tell me:\n\n1. Where exactly is the pain?\n2. When did it start?\n3. How would you rate it from 1-10?\n\nIf you're experiencing severe chest pain, difficulty breathing, or sudden numbness, please use the **SOS button** immediately or I can contact Dr. Priya Sharma for you.\n\nFor mild discomfort, try gentle stretching and stay hydrated. 💧",
    food: "Based on your diabetes management plan, here are some good options right now:\n\n🥗 **Light Snack Ideas:**\n• A handful of almonds (5-6 pieces)\n• Apple slices with a touch of cinnamon\n• Cucumber & carrot sticks with hummus\n• Green tea (unsweetened)\n\n⚠️ **Avoid:** Sugary snacks, white bread, processed foods\n\n🕐 Your dinner at 7:30 PM is planned: Wheat roti with lauki sabzi. Would you like to adjust it?",
    hello: "Hello, Rajan! 😊 How are you feeling today? Is there anything I can help you with?\n\nHere are some things I can do:\n• 💊 Check your medication schedule\n• 🍽️ Suggest healthy meals\n• 📞 Schedule a doctor appointment\n• 🏃 Review your activity today\n• 🆘 Trigger an emergency alert\n\nJust ask me anything!",
    exercise: "Great thinking about staying active! 🚶‍♂️\n\nToday's activity so far:\n• **Steps:** 3,200 / 5,000 goal\n• **Active minutes:** 45 minutes\n\n**Recommended for your health:**\n• 15-20 minute gentle walk after meals\n• Chair yoga (great for joints)\n• Light stretching in the morning\n\n⚠️ Avoid high-intensity exercises. Keep your heart rate below 110 BPM with your blood pressure medication.\n\nShall I set a walking reminder for after lunch?",
    sleep: "Let's talk about your sleep! 😴\n\n**Last night:** You slept 7.5 hours — that's good!\n\n**Tips for better sleep:**\n• 🌙 Take Atorvastatin at 9 PM (as scheduled)\n• 📱 Reduce screen time 1 hour before bed\n• ☕ No caffeine after 3 PM\n• 🧘 Try deep breathing for 5 minutes at bedtime\n\nYour sleep has been consistent this week. Keep it up!",
    doctor: "📋 **Your upcoming appointments:**\n\n1. **Dr. Priya Sharma** (Cardiologist)\n   📅 Today at 3:00 PM — Video Call\n   \n2. **Dr. Rajesh Iyer** (Endocrinologist)\n   📅 April 5 at 11:00 AM — In-person\n\nWould you like me to:\n• 📹 Start the video call with Dr. Priya?\n• 📅 Schedule a new appointment?\n• 📝 Prepare your health summary for the doctor?",
    fallback: "I understand! Let me think about that... 🤔\n\nAs your AI health companion, I'm here to help with:\n• Medication schedules and reminders\n• Diet and nutrition advice\n• Exercise recommendations\n• Doctor appointments\n• Health questions and wellness tips\n\nCould you tell me more about what you need? I'll do my best to help! 💙",
  },
  hi: {
    medication: "आपकी दवाइयों की जानकारी:\n\n💊 **आज पूरी हुई:**\n• मेटफॉर्मिन 500mg (सुबह 8:00) ✅\n• एम्लोडिपिन 5mg (सुबह 9:00) ✅\n• एस्पिरिन 75mg (सुबह 8:00) ✅\n\n⏰ **अभी बाकी:**\n• मेटफॉर्मिन 500mg शाम 8:00 बजे\n• एटोरवास्टैटिन 10mg रात 9:00 बजे\n\nआज आप बहुत अच्छा कर रहे हैं! इस हफ़्ते 87% अनुपालन। 💪",
    pain: "मुझे दुख है कि आपको दर्द हो रहा है। 😟 बताइए:\n\n1. दर्द कहां हो रहा है?\n2. कब से शुरू हुआ?\n3. 1 से 10 में कितना दर्द है?\n\nअगर छाती में तेज़ दर्द, सांस लेने में तकलीफ़, या अचानक सुन्नपन है, तो कृपया **SOS बटन** दबाएं या मैं डॉ. प्रिया शर्मा को संपर्क कर सकता हूं।\n\nहल्की तकलीफ़ के लिए हल्का स्ट्रेचिंग करें और पानी पीते रहें। 💧",
    food: "आपकी डायबिटीज़ योजना के अनुसार कुछ अच्छे विकल्प:\n\n🥗 **हल्के नाश्ते के विचार:**\n• एक मुट्ठी बादाम (5-6 टुकड़े)\n• दालचीनी के साथ सेब के टुकड़े\n• खीरा और गाजर की स्टिक्स\n• बिना चीनी की ग्रीन टी\n\n⚠️ **बचें:** मीठे स्नैक्स, सफ़ेद ब्रेड, प्रोसेस्ड फूड\n\n🕐 आपका रात का खाना 7:30 बजे: गेहूँ की रोटी और लौकी की सब्ज़ी।",
    hello: "नमस्ते, राजन! 😊 आज कैसा महसूस कर रहे हैं? मैं आपकी कैसे मदद कर सकता हूं?\n\nमैं ये कर सकता हूं:\n• 💊 दवाइयों का शेड्यूल देखें\n• 🍽️ स्वस्थ भोजन सुझाव\n• 📞 डॉक्टर की अपॉइंटमेंट\n• 🏃 आज की गतिविधि देखें\n• 🆘 आपातकालीन अलर्ट\n\nकुछ भी पूछें!",
    exercise: "सक्रिय रहने के बारे में सोचना बहुत अच्छा! 🚶‍♂️\n\nआज की गतिविधि:\n• **कदम:** 3,200 / 5,000 लक्ष्य\n• **सक्रिय मिनट:** 45 मिनट\n\n**सुझाव:**\n• खाने के बाद 15-20 मिनट टहलें\n• कुर्सी योग\n• सुबह हल्का स्ट्रेचिंग\n\n⚠️ तीव्र व्यायाम से बचें। हृदय गति 110 BPM से नीचे रखें।",
    sleep: "चलिए नींद के बारे में बात करते हैं! 😴\n\n**कल रात:** आपने 7.5 घंटे सोए — बहुत अच्छा!\n\n**बेहतर नींद के सुझाव:**\n• 🌙 रात 9 बजे एटोरवास्टैटिन लें\n• 📱 सोने से 1 घंटा पहले स्क्रीन कम करें\n• ☕ दोपहर 3 बजे के बाद कैफ़ीन नहीं\n• 🧘 सोने से पहले 5 मिनट गहरी सांस लें",
    doctor: "📋 **आपकी आगामी अपॉइंटमेंट:**\n\n1. **डॉ. प्रिया शर्मा** (हृदय रोग विशेषज्ञ)\n   📅 आज दोपहर 3:00 बजे — वीडियो कॉल\n   \n2. **डॉ. राजेश अय्यर** (एंडोक्राइनोलॉजिस्ट)\n   📅 5 अप्रैल सुबह 11:00 — व्यक्तिगत\n\nक्या मैं:\n• 📹 डॉ. प्रिया से वीडियो कॉल शुरू करूं?\n• 📅 नई अपॉइंटमेंट शेड्यूल करूं?",
    fallback: "मैं समझ गया! 🤔\n\nआपका AI स्वास्थ्य सहायक होने के नाते, मैं मदद कर सकता हूं:\n• दवाइयों का शेड्यूल और रिमाइंडर\n• आहार और पोषण सलाह\n• व्यायाम के सुझाव\n• डॉक्टर अपॉइंटमेंट\n• स्वास्थ्य सवाल और सुझाव\n\nमुझे और बताइए! 💙",
  },
  kn: {
    medication: "ನಿಮ್ಮ ಔಷಧಿಗಳ ವಿವರ:\n\n💊 **ಇಂದು ಪೂರ್ಣಗೊಂಡಿದೆ:**\n• ಮೆಟ್ಫಾರ್ಮಿನ್ 500mg (ಬೆಳಿಗ್ಗೆ 8:00) ✅\n• ಅಮ್ಲೋಡಿಪಿನ್ 5mg (ಬೆಳಿಗ್ಗೆ 9:00) ✅\n• ಆಸ್ಪಿರಿನ್ 75mg (ಬೆಳಿಗ್ಗೆ 8:00) ✅\n\n⏰ **ಬಾಕಿ ಇದೆ:**\n• ಮೆಟ್ಫಾರ್ಮಿನ್ 500mg ಸಂಜೆ 8:00\n• ಅಟೋರ್ವಾಸ್ಟಾಟಿನ್ 10mg ರಾತ್ರಿ 9:00\n\nಇಂದು ನೀವು ಚೆನ್ನಾಗಿ ಮಾಡುತ್ತಿದ್ದೀರಿ! ಈ ವಾರ 87% ಅನುಸರಣೆ। 💪",
    pain: "ನಿಮಗೆ ನೋವಾಗುತ್ತಿದೆ ಎಂದು ಕೇಳಿ ಬೇಸರವಾಯಿತು. 😟 ದಯವಿಟ್ಟು ಹೇಳಿ:\n\n1. ನೋವು ಎಲ್ಲಿ ಇದೆ?\n2. ಯಾವಾಗ ಪ್ರಾರಂಭವಾಯಿತು?\n3. 1 ರಿಂದ 10 ರಲ್ಲಿ ಎಷ್ಟು ನೋವು?\n\nತೀವ್ರ ಎದೆನೋವು, ಉಸಿರಾಟ ತೊಂದರೆ ಇದ್ದರೆ **SOS ಬಟನ್** ಒತ್ತಿ ಅಥವಾ ನಾನು ಡಾ. ಪ್ರಿಯಾ ಶರ್ಮಾ ಅವರನ್ನು ಸಂಪರ್ಕಿಸಬಹುದು.\n\nಸ್ವಲ್ಪ ನೋವಿಗೆ ಹಗುರ ಸ್ಟ್ರೆಚಿಂಗ್ ಮಾಡಿ ಮತ್ತು ನೀರು ಕುಡಿಯಿರಿ. 💧",
    food: "ನಿಮ್ಮ ಡಯಾಬಿಟಿಸ್ ಯೋಜನೆಯ ಪ್ರಕಾರ ಒಳ್ಳೆಯ ಆಯ್ಕೆಗಳು:\n\n🥗 **ಲಘು ತಿಂಡಿ ಆಲೋಚನೆಗಳು:**\n• ಒಂದು ಹಿಡಿ ಬಾದಾಮಿ (5-6 ತುಂಡು)\n• ಸೇಬಿನ ಹೋಳುಗಳು ದಾಲ್ಚಿನ್ನಿ ಜೊತೆ\n• ಸೌತೆಕಾಯಿ ಮತ್ತು ಕ್ಯಾರೆಟ್ ಸ್ಟಿಕ್ಗಳು\n• ಸಕ್ಕರೆ ರಹಿತ ಗ್ರೀನ್ ಟೀ\n\n⚠️ **ತಪ್ಪಿಸಿ:** ಸಿಹಿ ತಿಂಡಿಗಳು, ಬಿಳಿ ಬ್ರೆಡ್\n\n🕐 ರಾತ್ರಿ ಊಟ 7:30 ಕ್ಕೆ: ಗೋಧಿ ರೋಟಿ ಮತ್ತು ಲೌಕಿ ಸಬ್ಜಿ.",
    hello: "ನಮಸ್ಕಾರ, ರಾಜನ್! 😊 ಇಂದು ಹೇಗಿದ್ದೀರಿ? ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?\n\nನಾನು ಮಾಡಬಹುದಾದ ಕೆಲಸಗಳು:\n• 💊 ಔಷಧಿ ವೇಳಾಪಟ್ಟಿ\n• 🍽️ ಆರೋಗ್ಯಕರ ಆಹಾರ ಸಲಹೆ\n• 📞 ವೈದ್ಯರ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್\n• 🏃 ಇಂದಿನ ಚಟುವಟಿಕೆ\n• 🆘 ತುರ್ತು ಎಚ್ಚರಿಕೆ\n\nಏನಾದರೂ ಕೇಳಿ!",
    exercise: "ಸಕ್ರಿಯರಾಗಿರುವ ಬಗ್ಗೆ ಯೋಚಿಸುವುದು ಒಳ್ಳೆಯದು! 🚶‍♂️\n\nಇಂದಿನ ಚಟುವಟಿಕೆ:\n• **ಹೆಜ್ಜೆಗಳು:** 3,200 / 5,000 ಗುರಿ\n• **ಸಕ್ರಿಯ ನಿಮಿಷಗಳು:** 45 ನಿಮಿಷ\n\n**ಶಿಫಾರಸು:**\n• ಊಟದ ನಂತರ 15-20 ನಿಮಿಷ ನಡೆಯಿರಿ\n• ಕುರ್ಚಿ ಯೋಗ\n• ಬೆಳಿಗ್ಗೆ ಹಗುರ ಸ್ಟ್ರೆಚಿಂಗ್\n\n⚠️ ತೀವ್ರ ವ್ಯಾಯಾಮ ಬೇಡ. ಹೃದಯ ಬಡಿತ 110 BPM ಕೆಳಗೆ ಇಡಿ.",
    sleep: "ನಿಮ್ಮ ನಿದ್ರೆ ಬಗ್ಗೆ ಮಾತಾಡೋಣ! 😴\n\n**ಕಳೆದ ರಾತ್ರಿ:** 7.5 ಗಂಟೆ ನಿದ್ರೆ — ಒಳ್ಳೆಯದು!\n\n**ಉತ್ತಮ ನಿದ್ರೆಗೆ ಸಲಹೆ:**\n• 🌙 ರಾತ್ರಿ 9 ಕ್ಕೆ ಅಟೋರ್ವಾಸ್ಟಾಟಿನ್ ತೆಗೆದುಕೊಳ್ಳಿ\n• 📱 ಮಲಗುವ 1 ಗಂಟೆ ಮೊದಲು ಸ್ಕ್ರೀನ್ ಕಡಿಮೆ\n• ☕ ಮಧ್ಯಾಹ್ನ 3 ನಂತರ ಕೆಫೀನ್ ಬೇಡ\n• 🧘 ಮಲಗುವ ಮೊದಲು 5 ನಿಮಿಷ ಆಳ ಉಸಿರಾಟ",
    doctor: "📋 **ನಿಮ್ಮ ಮುಂಬರುವ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು:**\n\n1. **ಡಾ. ಪ್ರಿಯಾ ಶರ್ಮಾ** (ಹೃದ್ರೋಗ ತಜ್ಞ)\n   📅 ಇಂದು ಮಧ್ಯಾಹ್ನ 3:00 — ವೀಡಿಯೊ ಕಾಲ್\n   \n2. **ಡಾ. ರಾಜೇಶ್ ಅಯ್ಯರ್** (ಎಂಡೋಕ್ರೈನಾಲಜಿಸ್ಟ್)\n   📅 ಏಪ್ರಿಲ್ 5 ಬೆಳಿಗ್ಗೆ 11:00 — ವ್ಯಕ್ತಿಗತ\n\nನಾನು:\n• 📹 ಡಾ. ಪ್ರಿಯಾ ಅವರೊಂದಿಗೆ ವೀಡಿಯೊ ಕಾಲ್ ಪ್ರಾರಂಭಿಸಲೇ?\n• 📅 ಹೊಸ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಶೆಡ್ಯೂಲ್ ಮಾಡಲೇ?",
    fallback: "ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡೆ! 🤔\n\nನಿಮ್ಮ AI ಆರೋಗ್ಯ ಸಹಾಯಕನಾಗಿ, ನಾನು ಸಹಾಯ ಮಾಡಬಹುದು:\n• ಔಷಧಿ ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ಜ್ಞಾಪನೆಗಳು\n• ಆಹಾರ ಮತ್ತು ಪೋಷಣೆ ಸಲಹೆ\n• ವ್ಯಾಯಾಮ ಶಿಫಾರಸುಗಳು\n• ವೈದ್ಯರ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು\n• ಆರೋಗ್ಯ ಪ್ರಶ್ನೆಗಳು\n\nಇನ್ನಷ್ಟು ಹೇಳಿ! 💙",
  },
  ta: {
    medication: "உங்கள் மருந்து புதுப்பிப்பு:\n\n💊 **இன்று முடிந்தது:**\n• மெட்ஃபார்மின் 500mg (காலை 8:00) ✅\n• அம்லோடிபின் 5mg (காலை 9:00) ✅\n• ஆஸ்பிரின் 75mg (காலை 8:00) ✅\n\n⏰ **நிலுவையில்:**\n• மெட்ஃபார்மின் 500mg மாலை 8:00\n• அடோர்வாஸ்டடின் 10mg இரவு 9:00\n\nஇன்று நீங்கள் சிறப்பாக செய்கிறீர்கள்! 87% இணக்கம். 💪",
    hello: "வணக்கம், ராஜன்! 😊 இன்று எப்படி உணர்கிறீர்கள்?\n\nநான் உதவ முடியும்:\n• 💊 மருந்து நேரம்\n• 🍽️ ஆரோக்கிய உணவு\n• 📞 மருத்துவர் சந்திப்பு\n• 🏃 செயல்பாடு\n• 🆘 அவசர உதவி\n\nகேளுங்கள்!",
    fallback: "புரிகிறது! 🤔\n\nநான் உதவ முடியும்:\n• மருந்து நினைவூட்டல்\n• உணவு ஆலோசனை\n• உடற்பயிற்சி\n• மருத்துவர் சந்திப்பு\n\nமேலும் சொல்லுங்கள்! 💙",
  },
  te: {
    medication: "మీ మందుల సమాచారం:\n\n💊 **ఇవాళ పూర్తయింది:**\n• మెట్‌ఫార్మిన్ 500mg (ఉదయం 8:00) ✅\n• అమ్లోడిపిన్ 5mg (ఉదయం 9:00) ✅\n• ఆస్పిరిన్ 75mg (ఉదయం 8:00) ✅\n\n⏰ **మిగిలి ఉంది:**\n• మెట్‌ఫార్మిన్ 500mg సాయంత్రం 8:00\n• అటోర్వాస్టాటిన్ 10mg రాత్రి 9:00\n\nఈ రోజు బాగా చేస్తున్నారు! 87% అనుసరణ. 💪",
    hello: "నమస్కారం, రాజన్! 😊 ఈరోజు ఎలా ఉన్నారు?\n\nనేను సహాయం చేయగలను:\n• 💊 మందుల షెడ్యూల్\n• 🍽️ ఆరోగ్యకరమైన ఆహారం\n• 📞 డాక్టర్ అపాయింట్‌మెంట్\n• 🆘 అత్యవసర హెచ్చరిక\n\nఏదైనా అడగండి!",
    fallback: "అర్థమైంది! 🤔\n\nమీ AI ఆరోగ్య సహాయకుడిగా సహాయం చేయగలను:\n• మందుల రిమైండర్లు\n• ఆహార సలహా\n• వ్యాయామ సూచనలు\n• డాక్టర్ అపాయింట్‌మెంట్లు\n\nమరింత చెప్పండి! 💙",
  },
  bn: {
    hello: "নমস্কার, রাজন! 😊 আজ কেমন আছেন?\n\nআমি সাহায্য করতে পারি:\n• 💊 ওষুধের সময়সূচী\n• 🍽️ স্বাস্থ্যকর খাবার\n• 📞 ডাক্তারের অ্যাপয়েন্টমেন্ট\n• 🆘 জরুরি সতর্কতা\n\nকিছু জিজ্ঞাসা করুন!",
    fallback: "বুঝেছি! 🤔\n\nআপনার AI স্বাস্থ্য সহায়ক হিসেবে সাহায্য করতে পারি:\n• ওষুধের রিমাইন্ডার\n• খাদ্য পরামর্শ\n• ব্যায়ামের সুপারিশ\n\nআরও বলুন! 💙",
  },
  mr: {
    hello: "नमस्कार, राजन! 😊 आज कसे वाटत आहे?\n\nमी मदत करू शकतो:\n• 💊 औषधांचे वेळापत्रक\n• 🍽️ आरोग्यदायी जेवण\n• 📞 डॉक्टरांची भेट\n• 🆘 आणीबाणी सूचना\n\nकाहीही विचारा!",
    fallback: "समजले! 🤔\n\nतुमचा AI आरोग्य सहाय्यक म्हणून मदत करू शकतो:\n• औषधांचे रिमाइंडर\n• आहार सल्ला\n• व्यायाम शिफारसी\n\nअधिक सांगा! 💙",
  },
};

// Keywords per language for matching
const KEYWORDS = {
  en: { medication: ['medicine','medication','pill','drug'], pain: ['pain','hurt','ache'], food: ['food','eat','hungry','diet'], hello: ['hello','hi','hey'], exercise: ['exercise','walk','active'], sleep: ['sleep','tired','rest'], doctor: ['doctor','appointment','consult'] },
  hi: { medication: ['दवा','दवाइ','गोली'], pain: ['दर्द','तकलीफ'], food: ['खाना','भूख','आहार'], hello: ['नमस्ते','हेलो','हाय'], exercise: ['व्यायाम','चल','टहल'], sleep: ['नींद','थक','आराम'], doctor: ['डॉक्टर','अपॉइंटमेंट'] },
  kn: { medication: ['ಔಷಧಿ','ಮಾತ್ರೆ','ಗುಳಿಗೆ'], pain: ['ನೋವು','ಬೇನೆ'], food: ['ಊಟ','ಹಸಿವು','ಆಹಾರ'], hello: ['ನಮಸ್ಕಾರ','ಹಲೋ','ಹಾಯ್'], exercise: ['ವ್ಯಾಯಾಮ','ನಡೆ','ವಾಕ್'], sleep: ['ನಿದ್ರೆ','ಸುಸ್ತು','ವಿಶ್ರಾಂತಿ'], doctor: ['ವೈದ್ಯ','ಡಾಕ್ಟರ್','ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್'] },
  ta: { medication: ['மருந்து','மாத்திரை'], pain: ['வலி','நோவு'], food: ['உணவு','பசி','சாப்பாடு'], hello: ['வணக்கம்','ஹலோ'], exercise: ['உடற்பயிற்சி','நட'], sleep: ['தூக்கம்','சோர்வு'], doctor: ['மருத்துவர்','டாக்டர்'] },
  te: { medication: ['మందు','మాత్ర'], pain: ['నొప్పి','బాధ'], food: ['ఆహారం','ఆకలి','తిండి'], hello: ['నమస్కారం','హలో'], exercise: ['వ్యాయామం','నడక'], sleep: ['నిద్ర','అలసట'], doctor: ['డాక్టర్','వైద్యుడు'] },
  bn: { medication: ['ওষুধ','বড়ি'], pain: ['ব্যথা','কষ্ট'], food: ['খাবার','খিদে'], hello: ['নমস্কার','হ্যালো'], exercise: ['ব্যায়াম','হাঁটা'], sleep: ['ঘুম','ক্লান্ত'], doctor: ['ডাক্তার'] },
  mr: { medication: ['औषध','गोळी'], pain: ['दुखत','वेदना'], food: ['जेवण','भूक','खाणे'], hello: ['नमस्कार','हॅलो'], exercise: ['व्यायाम','चाल'], sleep: ['झोप','थकवा'], doctor: ['डॉक्टर'] },
};

// Language-aware welcome messages
const WELCOME_MESSAGES = {
  en: 'Good morning, Rajan! 🌅 I hope you slept well. You have 3 medications scheduled for today. Would you like me to remind you about them?',
  hi: 'सुप्रभात, राजन! 🌅 मुझे उम्मीद है कि आपकी नींद अच्छी रही। आज 3 दवाइयाँ निर्धारित हैं। क्या मैं आपको उनके बारे में याद दिलाऊं?',
  kn: 'ಶುಭೋದಯ, ರಾಜನ್! 🌅 ನೀವು ಚೆನ್ನಾಗಿ ಮಲಗಿದ್ದೀರಿ ಎಂದು ಭಾವಿಸುತ್ತೇನೆ. ಇಂದು 3 ಔಷಧಿಗಳು ನಿಗದಿಯಾಗಿವೆ. ನಾನು ನಿಮಗೆ ನೆನಪಿಸಲೇ?',
  ta: 'காலை வணக்கம், ராஜன்! 🌅 நீங்கள் நன்றாக தூங்கியிருப்பீர்கள் என நம்புகிறேன். இன்று 3 மருந்துகள் திட்டமிடப்பட்டுள்ளன. நினைவூட்டவா?',
  te: 'శుభోదయం, రాజన్! 🌅 మీరు బాగా నిద్రపోయారని ఆశిస్తున్నాను. ఈరోజు 3 మందులు షెడ్యూల్ చేయబడ్డాయి. గుర్తు చేయమంటారా?',
  bn: 'সুপ্রভাত, রাজন! 🌅 আশা করি আপনি ভালো ঘুমিয়েছেন। আজ ৩টি ওষুধ নির্ধারিত আছে। মনে করিয়ে দেব?',
  mr: 'सुप्रभात, राजन! 🌅 तुम्ही चांगली झोप घेतली असेल अशी आशा. आज 3 औषधे निर्धारित आहेत. आठवण करून देऊ?',
};

export default function ChatPage() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const selectedLang = LANG_MAP[language] || 'en-IN';
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const prevLangRef = useRef(language);

  // Set initial welcome message in the selected language
  useEffect(() => {
    const welcomeMsg = {
      id: 'msg_welcome',
      role: 'ai',
      content: WELCOME_MESSAGES[language] || WELCOME_MESSAGES.en,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
    setMessages([welcomeMsg]);
  }, []);

  // When language changes, reset chat with new welcome in that language
  useEffect(() => {
    if (prevLangRef.current !== language) {
      prevLangRef.current = language;
      const welcomeMsg = {
        id: 'msg_welcome',
        role: 'ai',
        content: WELCOME_MESSAGES[language] || WELCOME_MESSAGES.en,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      };
      setMessages([welcomeMsg]);
    }
  }, [language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getAIResponse = async (userMessage) => {
    const msg = userMessage.toLowerCase();
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1500));

    const lang = language || 'en';
    const responses = AI_RESPONSES[lang] || AI_RESPONSES.en;
    const keywords = KEYWORDS[lang] || KEYWORDS.en;
    // Also check English keywords as fallback
    const enKeywords = KEYWORDS.en;

    const matchTopic = (topic) => {
      const localKw = keywords[topic] || [];
      const enKw = enKeywords[topic] || [];
      return [...localKw, ...enKw].some(kw => msg.includes(kw));
    };

    const fb = responses.fallback || AI_RESPONSES.en.fallback;
    if (matchTopic('medication')) return responses.medication || fb;
    if (matchTopic('pain')) return responses.pain || fb;
    if (matchTopic('food')) return responses.food || fb;
    if (matchTopic('hello')) return responses.hello || fb;
    if (matchTopic('exercise')) return responses.exercise || fb;
    if (matchTopic('sleep')) return responses.sleep || fb;
    if (matchTopic('doctor')) return responses.doctor || fb;
    return fb;
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

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interim = '';
      finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInput(finalTranscript || interim);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-send if we got a final transcript
      if (finalTranscript.trim()) {
        setTimeout(() => {
          document.getElementById('chat-send-btn')?.click();
        }, 300);
      }
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
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
            onClick={() => {
              const welcomeMsg = {
                id: 'msg_welcome',
                role: 'ai',
                content: WELCOME_MESSAGES[language] || WELCOME_MESSAGES.en,
                timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
              };
              setMessages([welcomeMsg]);
            }}
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
          placeholder={isListening ? `🎙️ Listening in ${LANG_NAMES[language] || 'English'}...` : `Type in ${LANG_NAMES[language] || 'English'} or tap the mic...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        <motion.button
          id="chat-send-btn"
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
            🎙️ Listening in {LANG_NAMES[language] || 'English'}... Speak now
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
