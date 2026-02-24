// --- Translations ---
const translations = {
  en: {
    app_title: "Interview Mode",
    app_subtitle: "Interactive Profile Builder",
    title_session: "Session",
    btn_new: "New Session",
    btn_rename: "Rename",
    btn_delete: "Delete",
    btn_start_interview: "Start Interview",
    btn_voice_input: "Voice Input",
    btn_voice_stop: "Stop Voice",
    ph_chat_input: "Type your answer here...",
    btn_send: "Send",
    title_profile_preview: "Live Profile Preview",
    btn_refresh: "Refresh",
    lbl_completeness: "Completeness",
    status_listening: "Listening...",
    status_voice_stopped: "Voice capture stopped.",
    status_voice_error: "Voice error: ",
    status_starting: "Starting interview...",
    status_started: "Interview started.",
    status_updating: "Updating profile.md...",
    status_saved: "Saved to profile.md",
    status_saved_auto: "Saved to profile.md (auto research filled {n} field group{s}).",
    status_session_created: "Session created.",
    status_session_renamed: "Session renamed.",
    status_session_deleted: "Session deleted.",
    status_session_switched: "Session switched.",
    status_lang_set: "Fill language set to {lang}.",
    error_no_session: "Please create or select a session first.",
    error_no_input: "Please type or record an answer first.",
    error_start_failed: "Failed to start interview.",
    error_turn_failed: "Interview turn failed.",
    error_create_failed: "Failed to create session.",
    error_rename_failed: "Failed to rename session.",
    error_delete_failed: "Failed to delete session.",
    error_switch_failed: "Failed to switch session.",
    error_lang_failed: "Failed to update fill language.",
    error_load_failed: "Failed to load interview data.",
    error_refresh_failed: "Failed to refresh profile.md.",
    error_empty_name: "Session name cannot be empty.",
    prompt_session_name: "Session name:",
    prompt_rename_session: "Rename session:",
    confirm_delete: "Delete this session? This removes its interview history.",
    msg_assistant_start: "Press Start Interview and we will turn your work stories into profile.md.",
    msg_assistant_default: "Let's begin.",
    msg_next_default: "Tell me about your most recent project.",
    msg_next_placeholder: "Press \"Start Interview\" to begin.",
    role_interviewer: "Interviewer",
    role_you: "You",
    no_gaps: "No required gaps."
  },
  zh: {
    app_title: "面试模式",
    app_subtitle: "交互式简历构建器",
    title_session: "会话",
    btn_new: "新建会话",
    btn_rename: "重命名",
    btn_delete: "删除",
    btn_start_interview: "开始面试",
    btn_voice_input: "语音输入",
    btn_voice_stop: "停止语音",
    ph_chat_input: "在此输入你的回答...",
    btn_send: "发送",
    title_profile_preview: "实时档案预览",
    btn_refresh: "刷新",
    lbl_completeness: "完整度",
    status_listening: "正在聆听...",
    status_voice_stopped: "语音输入已停止。",
    status_voice_error: "语音错误：",
    status_starting: "正在开始面试...",
    status_started: "面试已开始。",
    status_updating: "正在更新 profile.md...",
    status_saved: "已保存到 profile.md",
    status_saved_auto: "已保存到 profile.md (自动填充了 {n} 组字段)。",
    status_session_created: "会话已创建。",
    status_session_renamed: "会话已重命名。",
    status_session_deleted: "会话已删除。",
    status_session_switched: "会话已切换。",
    status_lang_set: "填充语言已设置为 {lang}。",
    error_no_session: "请先创建或选择一个会话。",
    error_no_input: "请先输入或录制回答。",
    error_start_failed: "启动面试失败。",
    error_turn_failed: "面试对话失败。",
    error_create_failed: "创建会话失败。",
    error_rename_failed: "重命名会话失败。",
    error_delete_failed: "删除会话失败。",
    error_switch_failed: "切换会话失败。",
    error_lang_failed: "更新填充语言失败。",
    error_load_failed: "加载面试数据失败。",
    error_refresh_failed: "刷新 profile.md 失败。",
    error_empty_name: "会话名称不能为空。",
    prompt_session_name: "会话名称：",
    prompt_rename_session: "重命名会话：",
    confirm_delete: "删除此会话？这将删除其面试历史记录。",
    msg_assistant_start: "点击“开始面试”，我们将把你的工作经历转化为 profile.md。",
    msg_assistant_default: "让我们开始吧。",
    msg_next_default: "请告诉我你最近的一个项目。",
    msg_next_placeholder: "点击“开始面试”以开始。",
    role_interviewer: "面试官",
    role_you: "你",
    no_gaps: "没有必需的缺失项。"
  }
};

let currentLang = localStorage.getItem("resume_autofill_lang") || "en";

// --- DOM Elements ---
const chatBox = document.getElementById("chatBox");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const startInterviewBtn = document.getElementById("startInterviewBtn");
const micBtn = document.getElementById("micBtn");
const fillLanguageSelect = document.getElementById("fillLanguageSelect");
const statusEl = document.getElementById("status");
const profileMdView = document.getElementById("profileMdView");
const refreshMdBtn = document.getElementById("refreshMdBtn");
const sessionSelect = document.getElementById("sessionSelect");
const newSessionBtn = document.getElementById("newSessionBtn");
const renameSessionBtn = document.getElementById("renameSessionBtn");
const deleteSessionBtn = document.getElementById("deleteSessionBtn");
const completenessScoreEl = document.getElementById("completenessScore");
const completenessFillEl = document.getElementById("completenessFill");
const requiredMissingListEl = document.getElementById("requiredMissingList");
const langEnBtn = document.getElementById("langEn");
const langZhBtn = document.getElementById("langZh");

let recognition = null;
let isRecognizing = false;
let activeSessionId = "";
let defaultProfileTemplate = "# Personal Profile Template";
let fillLanguage = "auto";

// --- UI Logic ---

function getTranslation(key, params = {}) {
  let text = translations[currentLang][key] || key;
  Object.keys(params).forEach(k => {
    text = text.replace(`{${k}}`, params[k]);
  });
  return text;
}

function updateLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("resume_autofill_lang", lang);
  
  // Update buttons state
  if (lang === "en") {
    langEnBtn.classList.add("active");
    langZhBtn.classList.remove("active");
    document.documentElement.lang = "en";
  } else {
    langEnBtn.classList.remove("active");
    langZhBtn.classList.add("active");
    document.documentElement.lang = "zh";
  }

  // Update text content
  const t = translations[lang];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (t[key]) el.innerHTML = t[key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (t[key]) el.placeholder = t[key];
  });
  
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.getAttribute("data-i18n-title");
    if (t[key]) el.title = t[key];
  });
}

langEnBtn.addEventListener("click", () => updateLanguage("en"));
langZhBtn.addEventListener("click", () => updateLanguage("zh"));

// Initialize UI
updateLanguage(currentLang);

function setStatus(text, isError = false) {
  statusEl.textContent = text || "";
  statusEl.style.color = isError ? "#d13438" : "#5c6675";
}

function appendMessage(role, text) {
  const bubble = document.createElement("div");
  const isUser = role === "user";
  bubble.className = `chat-bubble ${isUser ? "user" : "ai"}`;

  const roleLabel = document.createElement("div");
  roleLabel.className = "chat-role-label";
  roleLabel.textContent = isUser ? getTranslation("role_you") : getTranslation("role_interviewer");
  
  const content = document.createElement("div");
  content.textContent = text || "";

  bubble.appendChild(roleLabel);
  bubble.appendChild(content);
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function renderHistory(history) {
  chatBox.innerHTML = "";
  if (!Array.isArray(history) || !history.length) {
    appendMessage("assistant", getTranslation("msg_assistant_start"));
    return;
  }

  history.slice(-120).forEach((msg) => {
    appendMessage(msg.role === "assistant" ? "assistant" : "user", msg.content || "");
  });
}

// --- Markdown & Completeness Logic ---

function hasYamlKey(markdown, key) {
  return new RegExp(`(^|\\n)\\s*${key}\\s*:`, "i").test(String(markdown || ""));
}

function extractTopLevelSection(markdown, title) {
  const md = String(markdown || "");
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const startRe = new RegExp(`^##\\s+.*${escaped}.*$`, "im");
  const startMatch = md.match(startRe);
  if (!startMatch || startMatch.index === undefined) return "";
  const start = startMatch.index + startMatch[0].length;
  const tail = md.slice(start);
  const next = tail.search(/\n##\s+/);
  return (next >= 0 ? tail.slice(0, next) : tail).trim();
}

function hasNonEmptyYamlValue(markdown, key) {
  const regex = new RegExp(`(^|\\n)\\s*${key}\\s*:\\s*([^\\n#]*)`, "gi");
  let match;
  while ((match = regex.exec(String(markdown || "")))) {
    const value = String(match[2] || "").trim().replace(/^["']|["']$/g, "");
    if (value && value !== "[]" && value !== "{}") return true;
  }
  return false;
}

function countNonEmptyYamlValue(markdown, key) {
  const regex = new RegExp(`(^|\\n)\\s*${key}\\s*:\\s*([^\\n#]*)`, "gi");
  let count = 0;
  let match;
  while ((match = regex.exec(String(markdown || "")))) {
    const value = String(match[2] || "").trim().replace(/^["']|["']$/g, "");
    if (value && value !== "[]" && value !== "{}") count += 1;
  }
  return count;
}

function computeCompleteness(markdown) {
  const text = String(markdown || "");
  const basicSection = extractTopLevelSection(text, "Basic Information");
  const educationSection = extractTopLevelSection(text, "Education");
  const workSection = extractTopLevelSection(text, "Work Experience");
  const projectsSection = extractTopLevelSection(text, "Projects");
  const awardsSection = extractTopLevelSection(text, "Honors & Awards");
  const publicationsSection = extractTopLevelSection(text, "Publications & Research");
  const skillsSection = extractTopLevelSection(text, "Skills");
  const onlineSection = extractTopLevelSection(text, "Online Presence");
  const contactSection = extractTopLevelSection(text, "Contact Information");

  const basicFields = ["full_name_en", "full_name_cn", "nationality", "phone", "email", "github", "linkedin"];
  const educationFields = ["name_en", "major_en", "level", "start_date", "expected_graduation", "gpa"];
  const skillFields = ["technical_skills", "programming_languages", "soft_skills"];

  const basicFound =
    ["full_name_en", "full_name_cn", "nationality"].filter((field) => hasNonEmptyYamlValue(basicSection, field)).length +
    ["github", "linkedin"].filter((field) => hasNonEmptyYamlValue(onlineSection, field)).length +
    (/(\+?\d[\d\s().-]{7,}\d)/.test(contactSection) ? 1 : 0) +
    (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(contactSection) ? 1 : 0);
  const educationFound = ["name_en", "major_en", "level", "start_date", "expected_graduation"].filter((field) =>
    hasNonEmptyYamlValue(educationSection, field)
  ).length + (hasNonEmptyYamlValue(educationSection, "value") ? 1 : 0);
  const skillsFound = skillFields.filter((field) => hasNonEmptyYamlValue(skillsSection, field)).length;
  const experienceItems = countNonEmptyYamlValue(workSection, "title_en");
  const projectsItems = countNonEmptyYamlValue(projectsSection, "name");
  const awardsItems = countNonEmptyYamlValue(awardsSection, "name_en");
  const publicationsItems = countNonEmptyYamlValue(publicationsSection, "title");

  const sections = [
    { label: "Basic Info", current: basicFound, target: 7 },
    { label: "Education", current: educationFound, target: 5 },
    { label: "Experience", current: Math.min(experienceItems, 2), target: 2 },
    { label: "Projects", current: Math.min(projectsItems, 2), target: 2 },
    { label: "Skills", current: skillsFound, target: 3 },
    { label: "Awards", current: Math.min(awardsItems, 1), target: 1 },
    { label: "Publications", current: Math.min(publicationsItems, 1), target: 1 }
  ];

  const totalCurrent = sections.reduce((acc, s) => acc + s.current, 0);
  const totalTarget = sections.reduce((acc, s) => acc + s.target, 0);
  const score = totalTarget ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  const requiredMissing = [];
  const missingBaseInfoFields = [];
  if (!hasNonEmptyYamlValue(basicSection, "full_name_en") && !hasNonEmptyYamlValue(basicSection, "full_name_cn")) {
    missingBaseInfoFields.push("full_name_en/full_name_cn");
  }
  if (!hasNonEmptyYamlValue(basicSection, "nationality")) missingBaseInfoFields.push("nationality");
  if (!/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(contactSection)) missingBaseInfoFields.push("contact_email");
  if (!/(\+?\d[\d\s().-]{7,}\d)/.test(contactSection)) missingBaseInfoFields.push("contact_phone");
  if (!hasNonEmptyYamlValue(onlineSection, "github")) missingBaseInfoFields.push("github");
  if (!hasNonEmptyYamlValue(onlineSection, "linkedin")) missingBaseInfoFields.push("linkedin");

  const missingEducationFields = ["name_en", "major_en", "level", "start_date", "expected_graduation"].filter(
    (field) => !hasNonEmptyYamlValue(educationSection, field)
  );
  if (!hasNonEmptyYamlValue(educationSection, "value")) missingEducationFields.push("gpa.value");
  const missingSkillFields = skillFields.filter((field) => !hasNonEmptyYamlValue(skillsSection, field));
  if (missingBaseInfoFields.length) requiredMissing.push(`Basic Information: ${missingBaseInfoFields.join(", ")}`);
  if (missingEducationFields.length) requiredMissing.push(`Education: ${missingEducationFields.join(", ")}`);
  if (!experienceItems) requiredMissing.push("Experience: add at least one entry");
  if (!projectsItems) requiredMissing.push("Projects: add at least one entry");
  if (missingSkillFields.length) requiredMissing.push(`Skills: ${missingSkillFields.join(", ")}`);

  return { score, sections, requiredMissing };
}

function renderCompleteness(markdown) {
  const data = computeCompleteness(markdown || "");
  completenessScoreEl.textContent = `${data.score}%`;
  completenessFillEl.style.width = `${data.score}%`;

  requiredMissingListEl.innerHTML = "";
  if (!data.requiredMissing.length) {
    const li = document.createElement("div");
    li.textContent = getTranslation("no_gaps");
    li.style.color = "var(--success)";
    requiredMissingListEl.appendChild(li);
  } else {
    data.requiredMissing.forEach((item) => {
      const li = document.createElement("div");
      li.textContent = `• ${item}`;
      requiredMissingListEl.appendChild(li);
    });
  }
}

// --- Session & API Logic ---

function renderSessions(sessions, activeId) {
  sessionSelect.innerHTML = "";
  (sessions || []).forEach((session) => {
    const option = document.createElement("option");
    option.value = session.id;
    option.textContent = session.name;
    sessionSelect.appendChild(option);
  });
  if (activeId) {
    sessionSelect.value = activeId;
  }
}

async function fetchSessionList() {
  const resp = await chrome.runtime.sendMessage({ type: "INTERVIEW_SESSION_LIST" });
  if (!resp?.ok) throw new Error(resp?.error || "Failed to load sessions.");
  activeSessionId = resp.activeSessionId || "";
  renderSessions(resp.sessions || [], activeSessionId);
}

async function loadTemplate() {
  const resp = await chrome.runtime.sendMessage({ type: "INTERVIEW_TEMPLATE_GET" });
  if (resp?.ok && (resp.template || "").trim()) {
    defaultProfileTemplate = resp.template;
  }
}

async function loadSession(sessionId) {
  const resp = await chrome.runtime.sendMessage({
    type: "INTERVIEW_SESSION_GET",
    payload: { sessionId }
  });
  if (!resp?.ok) throw new Error(resp?.error || "Failed to load session.");

  activeSessionId = resp.session?.id || resp.activeSessionId || sessionId || "";
  if (activeSessionId) sessionSelect.value = activeSessionId;

  renderHistory(resp.history || []);
  // nextQuestionEl.textContent = resp.session?.nextQuestion || getTranslation("msg_next_placeholder");
  fillLanguage = String(resp.session?.fillLanguage || "auto");
  if (fillLanguageSelect) fillLanguageSelect.value = fillLanguage;

  const markdown = (resp.session?.markdown || "").trim() || defaultProfileTemplate;
  profileMdView.textContent = markdown;
  renderCompleteness(markdown);
}

async function refreshProfileMarkdown() {
  if (!activeSessionId) return;
  await loadSession(activeSessionId);
}

async function loadInitialData() {
  await loadTemplate();
  await fetchSessionList();
  if (!activeSessionId && sessionSelect.value) activeSessionId = sessionSelect.value;
  if (activeSessionId) {
    await loadSession(activeSessionId);
  }
}

async function startInterview() {
  if (!activeSessionId) {
    setStatus(getTranslation("error_no_session"), true);
    return;
  }

  setStatus(getTranslation("status_starting"));
  startInterviewBtn.disabled = true;

  try {
    const resp = await chrome.runtime.sendMessage({
      type: "INTERVIEW_START",
      payload: { sessionId: activeSessionId, fillLanguage }
    });
    if (!resp?.ok) {
      setStatus(resp?.error || getTranslation("error_start_failed"), true);
      return;
    }

    appendMessage("assistant", resp.reply || getTranslation("msg_assistant_default"));
    // nextQuestionEl.textContent = resp.nextQuestion || getTranslation("msg_next_default");
    await refreshProfileMarkdown();
    setStatus(getTranslation("status_started"));
  } catch (err) {
    setStatus(err?.message || getTranslation("error_start_failed"), true);
  } finally {
    startInterviewBtn.disabled = false;
  }
}

async function sendTurn() {
  if (!activeSessionId) {
    setStatus(getTranslation("error_no_session"), true);
    return;
  }

  const message = chatInput.value.trim();
  if (!message) {
    setStatus(getTranslation("error_no_input"), true);
    return;
  }

  appendMessage("user", message);
  chatInput.value = "";
  setStatus(getTranslation("status_updating"));
  sendBtn.disabled = true;

  try {
    const resp = await chrome.runtime.sendMessage({
      type: "INTERVIEW_TURN",
      payload: { message, sessionId: activeSessionId, fillLanguage }
    });

    if (!resp?.ok) {
      setStatus(resp?.error || getTranslation("error_turn_failed"), true);
      return;
    }

    appendMessage("assistant", resp.reply || "Captured.");
    // nextQuestionEl.textContent = resp.nextQuestion || getTranslation("msg_next_default");

    const updatedMarkdown =
      typeof resp.updatedMarkdown === "string" ? resp.updatedMarkdown.trim() || defaultProfileTemplate : null;
    if (updatedMarkdown) {
      profileMdView.textContent = updatedMarkdown;
      renderCompleteness(updatedMarkdown);
    } else {
      await refreshProfileMarkdown();
    }

    await fetchSessionList();
    const applied = Number(resp.researchAppliedCount) || 0;
    if (applied > 0) {
      setStatus(getTranslation("status_saved_auto", { n: applied, s: applied > 1 ? "s" : "" }));
    } else {
      setStatus(getTranslation("status_saved"));
    }
  } catch (err) {
    setStatus(err?.message || getTranslation("error_turn_failed"), true);
  } finally {
    sendBtn.disabled = false;
  }
}

async function createSession() {
  const name = window.prompt(getTranslation("prompt_session_name"), "");
  if (name === null) return;

  const resp = await chrome.runtime.sendMessage({
    type: "INTERVIEW_SESSION_CREATE",
    payload: { name: name.trim() }
  });
  if (!resp?.ok) {
    setStatus(resp?.error || getTranslation("error_create_failed"), true);
    return;
  }

  await fetchSessionList();
  activeSessionId = resp.session?.id || activeSessionId;
  if (activeSessionId) await loadSession(activeSessionId);
  setStatus(getTranslation("status_session_created"));
}

async function renameSession() {
  if (!activeSessionId) return;
  const currentName = sessionSelect.options[sessionSelect.selectedIndex]?.textContent || "";
  const nextName = window.prompt(getTranslation("prompt_rename_session"), currentName);
  if (nextName === null) return;
  const name = nextName.trim();
  if (!name) {
    setStatus(getTranslation("error_empty_name"), true);
    return;
  }

  const resp = await chrome.runtime.sendMessage({
    type: "INTERVIEW_SESSION_RENAME",
    payload: { sessionId: activeSessionId, name }
  });
  if (!resp?.ok) {
    setStatus(resp?.error || getTranslation("error_rename_failed"), true);
    return;
  }

  await fetchSessionList();
  if (activeSessionId) sessionSelect.value = activeSessionId;
  setStatus(getTranslation("status_session_renamed"));
}

async function deleteSession() {
  if (!activeSessionId) return;
  const ok = window.confirm(getTranslation("confirm_delete"));
  if (!ok) return;

  const resp = await chrome.runtime.sendMessage({
    type: "INTERVIEW_SESSION_DELETE",
    payload: { sessionId: activeSessionId }
  });
  if (!resp?.ok) {
    setStatus(resp?.error || getTranslation("error_delete_failed"), true);
    return;
  }

  await fetchSessionList();
  activeSessionId = resp.activeSessionId || activeSessionId;
  if (activeSessionId) {
    await loadSession(activeSessionId);
  }
  setStatus(getTranslation("status_session_deleted"));
}

async function setActiveSession(sessionId) {
  if (!sessionId) return;
  const resp = await chrome.runtime.sendMessage({
    type: "INTERVIEW_SESSION_SET_ACTIVE",
    payload: { sessionId }
  });
  if (!resp?.ok) {
    setStatus(resp?.error || getTranslation("error_switch_failed"), true);
    return;
  }

  activeSessionId = sessionId;
  renderHistory(resp.history || []);
  // nextQuestionEl.textContent = resp.session?.nextQuestion || getTranslation("msg_next_placeholder");
  fillLanguage = String(resp.session?.fillLanguage || "auto");
  if (fillLanguageSelect) fillLanguageSelect.value = fillLanguage;
  const markdown = (resp.session?.markdown || "").trim() || defaultProfileTemplate;
  profileMdView.textContent = markdown;
  renderCompleteness(markdown);
  setStatus(getTranslation("status_session_switched"));
}

async function setSessionLanguage(nextLanguage) {
  if (!activeSessionId) return;
  const lang = ["auto", "zh", "en"].includes(nextLanguage) ? nextLanguage : "auto";
  const resp = await chrome.runtime.sendMessage({
    type: "INTERVIEW_SESSION_SET_LANGUAGE",
    payload: { sessionId: activeSessionId, fillLanguage: lang }
  });
  if (!resp?.ok) {
    setStatus(resp?.error || getTranslation("error_lang_failed"), true);
    return;
  }
  fillLanguage = lang;
  if (fillLanguageSelect) fillLanguageSelect.value = fillLanguage;
  setStatus(getTranslation("status_lang_set", { lang: fillLanguage }));
}

function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    micBtn.disabled = true;
    micBtn.textContent = "Voice Not Supported";
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onstart = () => {
    isRecognizing = true;
    micBtn.textContent = getTranslation("btn_voice_stop");
    setStatus(getTranslation("status_listening"));
  };

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      transcript += event.results[i][0].transcript;
    }
    chatInput.value = transcript.trim();
  };

  recognition.onerror = (event) => {
    setStatus(getTranslation("status_voice_error") + event.error, true);
  };

  recognition.onend = () => {
    isRecognizing = false;
    micBtn.textContent = getTranslation("btn_voice_input");
    if (!statusEl.textContent || statusEl.textContent === getTranslation("status_listening")) {
      setStatus(getTranslation("status_voice_stopped"));
    }
  };
}

function toggleMic() {
  if (!recognition) return;
  if (isRecognizing) {
    recognition.stop();
    return;
  }
  recognition.start();
}

sendBtn.addEventListener("click", sendTurn);
chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    sendTurn();
  }
});
startInterviewBtn.addEventListener("click", startInterview);
micBtn.addEventListener("click", toggleMic);
refreshMdBtn.addEventListener("click", () => {
  refreshProfileMarkdown().catch((err) => setStatus(err?.message || getTranslation("error_refresh_failed"), true));
});
sessionSelect.addEventListener("change", () => {
  const nextId = sessionSelect.value;
  setActiveSession(nextId).catch((err) => setStatus(err?.message || getTranslation("error_switch_failed"), true));
});
newSessionBtn.addEventListener("click", () => {
  createSession().catch((err) => setStatus(err?.message || getTranslation("error_create_failed"), true));
});
renameSessionBtn.addEventListener("click", () => {
  renameSession().catch((err) => setStatus(err?.message || getTranslation("error_rename_failed"), true));
});
deleteSessionBtn.addEventListener("click", () => {
  deleteSession().catch((err) => setStatus(err?.message || getTranslation("error_delete_failed"), true));
});
if (fillLanguageSelect) {
  fillLanguageSelect.addEventListener("change", () => {
    setSessionLanguage(fillLanguageSelect.value).catch((err) =>
      setStatus(err?.message || getTranslation("error_lang_failed"), true)
    );
  });
}

setupSpeechRecognition();
loadInitialData().catch((err) => setStatus(err?.message || getTranslation("error_load_failed"), true));
