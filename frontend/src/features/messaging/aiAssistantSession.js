import { AI_ASSISTANT_PEER_ID } from '../../shared/constants/aiAssistant.js';
import {
  getContactAvatarUrl,
  getContactProfile,
} from '../../shared/constants/contactProfiles.js';
import {
  getAiCommandChips,
  getAiQuickPrompts,
  getAiUserTextForPrompt,
  resolveAiAssistantReply,
} from '../chat/aiAssistantReplies.js';

export const AI_ASSISTANT_CHAT_ID = AI_ASSISTANT_PEER_ID;

const STORAGE_KEY = 'linkup.aiAssistant.messages';
export const AI_HOME_TOAST_PENDING_KEY = 'linkup.aiHomePromptPending';
export const AI_HOME_TOAST_SHOWN_KEY = 'linkup.aiHomePromptShown';
export const AI_ASSISTANT_UPDATED_EVENT = 'linkup:ai-assistant-updated';
export const AI_HOME_TOAST_EVENT = 'linkup:ai-home-toast';

function welcomeMessages(t) {
  const intro = t(
    'chat.ai.welcome',
    'Hi! I am your LinkUp assistant. Ask about profile, network, jobs, or type help for commands.',
  );
  return [
    {
      id: 'ai-welcome',
      chatId: AI_ASSISTANT_CHAT_ID,
      senderId: AI_ASSISTANT_CHAT_ID,
      content: intro,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isMine: false,
      isAiAssistant: true,
      sender: {
        id: AI_ASSISTANT_CHAT_ID,
        firstName: t('chat.ai.name', 'AI Assistant'),
        avatarUrl: null,
      },
    },
  ];
}

export function buildAiAssistantDisplayChat(t) {
  const profile = getContactProfile(AI_ASSISTANT_PEER_ID, {
    name: t('chat.ai.name', 'AI Assistant'),
  });

  return {
    id: AI_ASSISTANT_CHAT_ID,
    isAiAssistant: true,
    name: t('chat.ai.name', 'AI Assistant'),
    avatar: getContactAvatarUrl(profile, AI_ASSISTANT_PEER_ID),
    avatarSrc: getContactAvatarUrl(profile, AI_ASSISTANT_PEER_ID),
    lastMessage: t('chat.ai.preview', 'Ask me anything about LinkUp'),
    time: new Date().toISOString(),
    unread: false,
    activeNow: true,
    title: t('chat.ai.subtitle', 'Personal assistant · LinkUp'),
    companion: {
      id: AI_ASSISTANT_CHAT_ID,
      firstName: t('chat.ai.name', 'AI Assistant'),
      profileTitle: t('chat.ai.subtitle', 'Personal assistant · LinkUp'),
      headline: t('chat.ai.subtitle', 'Personal assistant · LinkUp'),
    },
  };
}

export function loadAiAssistantMessages(t) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  return welcomeMessages(t);
}

export function clearAiAssistantMessages() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function buildDemoGreetingMessage(content) {
  const now = new Date().toISOString();
  return {
    id: `ai-demo-${Date.now()}`,
    chatId: AI_ASSISTANT_CHAT_ID,
    senderId: AI_ASSISTANT_CHAT_ID,
    content,
    sentAt: now,
    createdAt: now,
    isMine: false,
    isAiAssistant: true,
    sender: {
      id: AI_ASSISTANT_CHAT_ID,
      firstName: 'AI Assistant',
      avatarUrl: getContactAvatarUrl(
        getContactProfile(AI_ASSISTANT_PEER_ID),
        AI_ASSISTANT_CHAT_ID,
      ),
    },
  };
}

/** Fresh AI chat + bottom-right prompt after demo login. */
export function prepareDemoAiAssistantSession() {
  clearAiAssistantMessages();

  const greeting = buildDemoGreetingMessage(
    'Hi! I am your LinkUp assistant. Ask about profile, network, jobs, or type help for commands.',
  );
  saveAiAssistantMessages([greeting]);

  try {
    sessionStorage.removeItem(AI_HOME_TOAST_SHOWN_KEY);
    sessionStorage.setItem(AI_HOME_TOAST_PENDING_KEY, '1');
  } catch {
    /* ignore */
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AI_ASSISTANT_UPDATED_EVENT));
    window.dispatchEvent(new CustomEvent(AI_HOME_TOAST_EVENT));
  }
}

export function saveAiAssistantMessages(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    /* ignore */
  }
}

export function isAiAssistantChatId(chatId) {
  return String(chatId || '').trim().toLowerCase() === AI_ASSISTANT_CHAT_ID;
}

export function mapAiNavigatePath(path) {
  const map = {
    '/home': '/app',
    '/profile': '/app/profile',
    '/network': '/app/network',
    '/vacancies': '/app/vacancies',
    '/chat': '/app/messages',
    '/messages': '/app/messages',
  };
  return map[path] ?? (path?.startsWith('/app') ? path : `/app${path || ''}`);
}

export function processAiAssistantSend({ userText, lang, currentUserId, t }) {
  const trimmed = String(userText || '').trim();
  const { text, action } = resolveAiAssistantReply(trimmed, lang);
  const now = new Date().toISOString();

  const userMessage = {
    id: `ai-user-${Date.now()}`,
    chatId: AI_ASSISTANT_CHAT_ID,
    senderId: currentUserId,
    content: trimmed,
    sentAt: now,
    createdAt: now,
    isMine: true,
  };

  const aiMessage = {
    id: `ai-bot-${Date.now() + 1}`,
    chatId: AI_ASSISTANT_CHAT_ID,
    senderId: AI_ASSISTANT_CHAT_ID,
    content: text,
    sentAt: new Date(Date.now() + 1).toISOString(),
    createdAt: new Date(Date.now() + 1).toISOString(),
    isMine: false,
    isAiAssistant: true,
    sender: {
      id: AI_ASSISTANT_CHAT_ID,
      firstName: t('chat.ai.name', 'AI Assistant'),
      avatarUrl: getContactAvatarUrl(
        getContactProfile(AI_ASSISTANT_PEER_ID),
        AI_ASSISTANT_CHAT_ID,
      ),
    },
  };

  return { userMessage, aiMessage, action };
}

export { getAiCommandChips, getAiQuickPrompts, getAiUserTextForPrompt };
