(function initStorage(global) {
  const KEYS = {
    RESUME_RAW: "resumeRaw",
    RESUME_PROFILE: "resumeProfile",
    PROFILE_MD: "profileMarkdown",
    CHAT_HISTORY: "chatHistory",
    FORM_HISTORY: "formHistory",
    SETTINGS: "settings",
    INTERVIEW_SESSIONS: "interviewSessions",
    INTERVIEW_ACTIVE_SESSION_ID: "interviewActiveSessionId",
    INTERVIEW_HISTORY_BY_SESSION: "interviewHistoryBySession"
  };

  const DEFAULT_SETTINGS = {
    provider: "openai",
    baseUrl: "",
    model: "",
    llmApiKey: "",
    llmEndpoint: "",
    autofillLanguage: "auto",
    autoMultiPage: false,
    maxAutoPages: 3
  };

  function get(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, resolve);
    });
  }

  function set(values) {
    return new Promise((resolve) => {
      chrome.storage.local.set(values, resolve);
    });
  }

  async function getResumeProfile() {
    const data = await get([KEYS.RESUME_PROFILE]);
    return data[KEYS.RESUME_PROFILE] || null;
  }

  async function setResumeProfile(profile) {
    await set({ [KEYS.RESUME_PROFILE]: profile });
  }

  async function setResumeRaw(raw) {
    await set({ [KEYS.RESUME_RAW]: raw });
  }

  async function getProfileMarkdown() {
    const data = await get([KEYS.PROFILE_MD]);
    return data[KEYS.PROFILE_MD] || "";
  }

  async function setProfileMarkdown(markdown) {
    await set({ [KEYS.PROFILE_MD]: markdown || "" });
  }

  async function getChatHistory() {
    const data = await get([KEYS.CHAT_HISTORY]);
    return data[KEYS.CHAT_HISTORY] || [];
  }

  async function addChatMessage(message) {
    const history = await getChatHistory();
    history.push(message);
    const trimmed = history.slice(-50);
    await set({ [KEYS.CHAT_HISTORY]: trimmed });
  }

  async function getFormHistory() {
    const data = await get([KEYS.FORM_HISTORY]);
    return data[KEYS.FORM_HISTORY] || [];
  }

  async function addFormHistory(item) {
    const history = await getFormHistory();
    history.unshift(item);
    const trimmed = history.slice(0, 30);
    await set({ [KEYS.FORM_HISTORY]: trimmed });
  }

  async function getSettings() {
    const data = await get([KEYS.SETTINGS]);
    return {
      ...DEFAULT_SETTINGS,
      ...(data[KEYS.SETTINGS] || {})
    };
  }

  async function setSettings(settings) {
    await set({ [KEYS.SETTINGS]: { ...DEFAULT_SETTINGS, ...(settings || {}) } });
  }

  function makeSessionId() {
    return `is_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function makeDefaultSession(markdown) {
    const now = new Date().toISOString();
    const defaultMarkdown = String(global.ResumeProfileTemplate?.MARKDOWN_TEMPLATE || "");
    return {
      id: makeSessionId(),
      name: "Interview Session 1",
      createdAt: now,
      updatedAt: now,
      markdown: markdown || defaultMarkdown,
      nextQuestion: "",
      fillLanguage: "auto"
    };
  }

  async function ensureInterviewState() {
    const data = await get([
      KEYS.INTERVIEW_SESSIONS,
      KEYS.INTERVIEW_ACTIVE_SESSION_ID,
      KEYS.INTERVIEW_HISTORY_BY_SESSION,
      KEYS.PROFILE_MD,
      KEYS.CHAT_HISTORY
    ]);

    let sessions = Array.isArray(data[KEYS.INTERVIEW_SESSIONS]) ? data[KEYS.INTERVIEW_SESSIONS] : [];
    let activeSessionId = data[KEYS.INTERVIEW_ACTIVE_SESSION_ID] || "";
    let historyBySession = data[KEYS.INTERVIEW_HISTORY_BY_SESSION] || {};

    if (!sessions.length) {
      const seedMarkdown = String(data[KEYS.PROFILE_MD] || "");
      const defaultSession = makeDefaultSession(seedMarkdown);
      sessions = [defaultSession];
      activeSessionId = defaultSession.id;
      const legacyHistory = Array.isArray(data[KEYS.CHAT_HISTORY]) ? data[KEYS.CHAT_HISTORY].slice(-80) : [];
      historyBySession = {
        ...historyBySession,
        [defaultSession.id]: legacyHistory
      };

      await set({
        [KEYS.INTERVIEW_SESSIONS]: sessions,
        [KEYS.INTERVIEW_ACTIVE_SESSION_ID]: activeSessionId,
        [KEYS.INTERVIEW_HISTORY_BY_SESSION]: historyBySession
      });
    }

    if (!sessions.some((s) => s.id === activeSessionId)) {
      activeSessionId = sessions[0].id;
      await set({ [KEYS.INTERVIEW_ACTIVE_SESSION_ID]: activeSessionId });
    }

    return { sessions, activeSessionId, historyBySession };
  }

  async function listInterviewSessions() {
    const state = await ensureInterviewState();
    return state.sessions.map((s) => ({
      id: s.id,
      name: s.name,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      nextQuestion: s.nextQuestion || "",
      messageCount: Array.isArray(state.historyBySession[s.id]) ? state.historyBySession[s.id].length : 0
    }));
  }

  async function getActiveInterviewSessionId() {
    const state = await ensureInterviewState();
    return state.activeSessionId;
  }

  async function getInterviewSession(sessionId) {
    const state = await ensureInterviewState();
    const id = sessionId || state.activeSessionId;
    const session = state.sessions.find((s) => s.id === id) || state.sessions[0];
    return {
      session,
      history: Array.isArray(state.historyBySession[session.id]) ? state.historyBySession[session.id] : []
    };
  }

  async function createInterviewSession(name, markdown = "") {
    const state = await ensureInterviewState();
    const now = new Date().toISOString();
    const count = state.sessions.length + 1;
    const defaultMarkdown = String(global.ResumeProfileTemplate?.MARKDOWN_TEMPLATE || "");
    const session = {
      id: makeSessionId(),
      name: String(name || "").trim() || `Interview Session ${count}`,
      createdAt: now,
      updatedAt: now,
      markdown: markdown || defaultMarkdown,
      nextQuestion: "",
      fillLanguage: "auto"
    };
    const sessions = [session, ...state.sessions];
    const historyBySession = { ...state.historyBySession, [session.id]: [] };
    await set({
      [KEYS.INTERVIEW_SESSIONS]: sessions,
      [KEYS.INTERVIEW_ACTIVE_SESSION_ID]: session.id,
      [KEYS.INTERVIEW_HISTORY_BY_SESSION]: historyBySession
    });
    return session;
  }

  async function updateInterviewSession(sessionId, patch = {}) {
    const state = await ensureInterviewState();
    const now = new Date().toISOString();
    const sessions = state.sessions.map((item) =>
      item.id === sessionId ? { ...item, ...patch, updatedAt: now, id: item.id } : item
    );
    await set({ [KEYS.INTERVIEW_SESSIONS]: sessions });
    return sessions.find((s) => s.id === sessionId) || null;
  }

  async function setActiveInterviewSession(sessionId) {
    const state = await ensureInterviewState();
    if (!state.sessions.some((s) => s.id === sessionId)) return false;
    await set({ [KEYS.INTERVIEW_ACTIVE_SESSION_ID]: sessionId });
    return true;
  }

  async function deleteInterviewSession(sessionId) {
    const state = await ensureInterviewState();
    let sessions = state.sessions.filter((item) => item.id !== sessionId);
    const historyBySession = { ...state.historyBySession };
    delete historyBySession[sessionId];

    if (!sessions.length) {
      const defaultSession = makeDefaultSession("");
      sessions = [defaultSession];
      historyBySession[defaultSession.id] = [];
    }

    const nextActiveId = sessions.some((s) => s.id === state.activeSessionId) ? state.activeSessionId : sessions[0].id;

    await set({
      [KEYS.INTERVIEW_SESSIONS]: sessions,
      [KEYS.INTERVIEW_ACTIVE_SESSION_ID]: nextActiveId,
      [KEYS.INTERVIEW_HISTORY_BY_SESSION]: historyBySession
    });

    return {
      sessions,
      activeSessionId: nextActiveId
    };
  }

  async function appendInterviewMessage(sessionId, message) {
    const state = await ensureInterviewState();
    const id = sessionId || state.activeSessionId;
    const history = Array.isArray(state.historyBySession[id]) ? [...state.historyBySession[id]] : [];
    history.push(message);
    const trimmed = history.slice(-120);
    const historyBySession = { ...state.historyBySession, [id]: trimmed };
    await set({ [KEYS.INTERVIEW_HISTORY_BY_SESSION]: historyBySession });
    return trimmed;
  }

  global.ResumeStorage = {
    KEYS,
    get,
    set,
    getResumeProfile,
    setResumeProfile,
    setResumeRaw,
    getProfileMarkdown,
    setProfileMarkdown,
    getChatHistory,
    addChatMessage,
    getFormHistory,
    addFormHistory,
    getSettings,
    setSettings,
    listInterviewSessions,
    getActiveInterviewSessionId,
    getInterviewSession,
    createInterviewSession,
    updateInterviewSession,
    setActiveInterviewSession,
    deleteInterviewSession,
    appendInterviewMessage
  };
})(globalThis);
