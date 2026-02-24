// --- Translations ---
const translations = {
  en: {
    nav_quick_action: "Quick Action",
    nav_profile: "Profile",
    nav_chat: "Chat",
    nav_settings: "Settings",
    nav_preview: "Preview",
    nav_history: "History",
    nav_help: "Help",
    title_quick_action: "Quick Action",
    btn_fill_current: "Fill Current Page",
    hint_fill_current: "Trigger autofill directly on the current tab.",
    lbl_autofill_language: "Autofill value language",
    opt_lang_auto: "Auto",
    opt_lang_zh: "中文",
    opt_lang_en: "English",
    btn_open_interview_page: "Open Interview Page",
    hint_open_interview_page: "Open a full page for interview-style chat and voice input.",
    lbl_auto_multipage: "Enable multi-page auto continue",
    lbl_max_pages: "Max pages per run",
    title_profile: "Profile Markdown",
    hint_import: "Import TXT/MD/PDF. Recommended to maintain profile.md below.",
    btn_import: "Import As Profile",
    btn_save_profile: "Save profile.md",
    title_chat: "Chat With LLM",
    ph_chat_input: "e.g. I recently did an internship at ByteDance, please update my project experience.",
    btn_send: "Send",
    title_settings: "LLM Provider Settings",
    lbl_provider: "Provider Format",
    lbl_base_url: "Base URL",
    ph_base_url: "Leave empty to use official endpoint",
    lbl_model: "Model",
    lbl_api_key: "API Key",
    hint_settings: "You can use official endpoints or your own proxy Base URL.",
    btn_save_settings: "Save Settings",
    title_preview: "Structured Preview",
    title_history: "History",
    title_help: "How to Use",
    help_step1_title: "1. Setup Profile",
    help_step1_desc: "Go to the <strong>Profile</strong> tab. You can import your existing resume (PDF/TXT/MD) or manually edit the `profile.md`. This is the source of truth for autofilling.",
    help_step2_title: "2. Configure LLM",
    help_step2_desc: "Go to the <strong>Settings</strong> tab. Enter your API Key and select the provider (OpenAI, Claude, etc.). This is required for the extension to understand your profile and the job application forms.",
    help_step3_title: "3. Autofill",
    help_step3_desc: "Navigate to a job application page. Open this extension and go to <strong>Quick Action</strong>. Click \"Fill Current Page\". The extension will analyze the page and fill in the fields based on your profile.",
    help_step4_title: "4. Chat & Update",
    help_step4_desc: "Use the <strong>Chat</strong> tab to update your profile using natural language. For example, \"Add my new phone number 123-456-7890\".",
    status_importing: "Importing file...",
    status_imported: "Imported and saved as profile.md",
    status_saved: "profile.md saved.",
    status_talking: "Talking to LLM...",
    status_chat_updated: "profile.md updated from chat.",
    status_settings_saved: "Settings saved.",
    status_triggering: "Triggering autofill on current page...",
    status_no_tab: "No active tab found.",
    status_restricted: "This page is restricted (e.g. chrome://). Open a normal web page instead.",
    status_failed: "Failed to trigger autofill.",
    status_complete: "Autofill complete",
    status_needs_manual: "fields need manual input.",
    status_error_file: "Please choose a file first.",
    status_error_chat: "Please type a message.",
    status_error_settings: "Failed to save settings",
    status_error_load: "Failed to load popup data."
  },
  zh: {
    nav_quick_action: "快速操作",
    nav_profile: "简历档案",
    nav_chat: "AI 对话",
    nav_settings: "设置",
    nav_preview: "预览",
    nav_history: "历史记录",
    nav_help: "使用帮助",
    title_quick_action: "快速操作",
    btn_fill_current: "填充当前页面",
    hint_fill_current: "在当前标签页直接触发自动填写。",
    lbl_autofill_language: "自动填写内容语言",
    opt_lang_auto: "自动",
    opt_lang_zh: "中文",
    opt_lang_en: "英文",
    btn_open_interview_page: "打开采访页面",
    hint_open_interview_page: "打开完整页面进行采访式对话和语音输入。",
    lbl_auto_multipage: "启用多页自动继续",
    lbl_max_pages: "每次运行最大页数",
    title_profile: "简历档案 (Markdown)",
    hint_import: "可导入 TXT/MD/PDF。建议长期维护下方的 profile.md。",
    btn_import: "导入为档案",
    btn_save_profile: "保存 profile.md",
    title_chat: "与 LLM 对话 (自动维护)",
    ph_chat_input: "例如：我最近在字节做了一个推荐系统实习，请更新到项目经历",
    btn_send: "发送",
    title_settings: "LLM 提供商设置",
    lbl_provider: "提供商格式",
    lbl_base_url: "Base URL",
    ph_base_url: "留空以使用官方接口",
    lbl_model: "模型",
    lbl_api_key: "API Key",
    hint_settings: "可填官方地址，也可填你自己的中转站 Base URL。",
    btn_save_settings: "保存设置",
    title_preview: "结构化预览",
    title_history: "历史记录",
    title_help: "如何使用",
    help_step1_title: "1. 设置档案",
    help_step1_desc: "进入 <strong>简历档案</strong> 标签页。你可以导入现有的简历 (PDF/TXT/MD) 或手动编辑 `profile.md`。这是自动填充的数据来源。",
    help_step2_title: "2. 配置 LLM",
    help_step2_desc: "进入 <strong>设置</strong> 标签页。输入你的 API Key 并选择提供商 (OpenAI, Claude 等)。这是插件理解你的简历和招聘表格所必需的。",
    help_step3_title: "3. 自动填充",
    help_step3_desc: "导航到招聘页面。打开此插件并进入 <strong>快速操作</strong>。点击“填充当前页面”。插件将分析页面并根据你的档案填写字段。",
    help_step4_title: "4. 对话更新",
    help_step4_desc: "使用 <strong>AI 对话</strong> 标签页通过自然语言更新你的档案。例如，“添加我的新电话号码 123-456-7890”。",
    status_importing: "正在导入文件...",
    status_imported: "已导入并保存为 profile.md",
    status_saved: "profile.md 已保存。",
    status_talking: "正在与 LLM 对话...",
    status_chat_updated: "profile.md 已根据对话更新。",
    status_settings_saved: "设置已保存。",
    status_triggering: "正在当前页面触发自动填充...",
    status_no_tab: "未找到活动标签页。",
    status_restricted: "此页面受限 (如 chrome://)。请打开普通网页。",
    status_failed: "触发自动填充失败。",
    status_complete: "自动填充完成",
    status_needs_manual: "个字段需要手动输入。",
    status_error_file: "请先选择一个文件。",
    status_error_chat: "请输入消息。",
    status_error_settings: "保存设置失败",
    status_error_load: "加载数据失败。"
  }
};

let currentLang = localStorage.getItem("resume_autofill_lang") || "en";

// --- DOM Elements ---
const uploadBtn = document.getElementById("uploadBtn");
const saveMdBtn = document.getElementById("saveMdBtn");
const sendChatBtn = document.getElementById("sendChatBtn");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const fillCurrentPageBtn = document.getElementById("fillCurrentPageBtn");
const openInterviewPageBtn = document.getElementById("openInterviewPageBtn");

const statusEl = document.getElementById("status");
const profileBox = document.getElementById("profileBox");
const historyList = document.getElementById("historyList");
const chatBox = document.getElementById("chatBox");
const fillProgressList = document.getElementById("fillProgressList");

const fileInput = document.getElementById("resumeFile");
const profileMdInput = document.getElementById("profileMdInput");
const chatInput = document.getElementById("chatInput");
const providerInput = document.getElementById("provider");
const baseUrlInput = document.getElementById("baseUrl");
const modelInput = document.getElementById("model");
const apiKeyInput = document.getElementById("apiKey");
const autoMultiPageInput = document.getElementById("autoMultiPage");
const maxAutoPagesInput = document.getElementById("maxAutoPages");
const autofillLanguageInput = document.getElementById("autofillLanguage");

const navItems = document.querySelectorAll(".nav-item");
const tabContents = document.querySelectorAll(".tab-content");
const langEnBtn = document.getElementById("langEn");
const langZhBtn = document.getElementById("langZh");

const PROVIDER_DEFAULTS = {
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini"
  },
  claude: {
    baseUrl: "https://api.anthropic.com/v1",
    model: "claude-3-5-sonnet-latest"
  },
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-1.5-flash"
  }
};

function on(el, eventName, handler) {
  if (!el) return;
  el.addEventListener(eventName, handler);
}

// --- UI Logic ---

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
    if (t[key]) {
      if (el.tagName === "INPUT" && el.type === "placeholder") {
         // handle placeholder if needed, but usually we use data-i18n-placeholder
      } else {
         el.innerHTML = t[key]; // Use innerHTML to support <strong> tags
      }
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (t[key]) {
      el.placeholder = t[key];
    }
  });
}

function switchTab(tabId) {
  // Update nav items
  navItems.forEach(item => {
    if (item.getAttribute("data-tab") === tabId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Update tab contents
  tabContents.forEach(content => {
    if (content.id === `tab-${tabId}`) {
      content.classList.add("active");
    } else {
      content.classList.remove("active");
    }
  });
}

// Event Listeners for UI
navItems.forEach(item => {
  on(item, "click", () => {
    switchTab(item.getAttribute("data-tab"));
  });
});

on(langEnBtn, "click", () => updateLanguage("en"));
on(langZhBtn, "click", () => updateLanguage("zh"));

// Initialize UI
updateLanguage(currentLang);


// --- Core Logic ---

function getTranslation(key) {
  return translations[currentLang][key] || key;
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#d13438" : "#5c6675";
}

function resetFillProgress() {
  fillProgressList.innerHTML = "";
}

function appendFillProgress(message) {
  const li = document.createElement("li");
  const t = new Date().toLocaleTimeString();
  li.textContent = `[${t}] ${message}`;
  fillProgressList.appendChild(li);
  fillProgressList.scrollTop = fillProgressList.scrollHeight;
}

function isRestrictedUrl(url) {
  if (!url) return true;
  return (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("edge://") ||
    url.startsWith("about:") ||
    url.startsWith("view-source:")
  );
}

async function sendFillRequest(tabId, options) {
  return chrome.tabs.sendMessage(tabId, {
    type: "TRIGGER_AUTOFILL_FROM_POPUP",
    payload: options || {}
  });
}

function renderProfile(profile) {
  if (!profile) {
    profileBox.textContent = "No profile yet.";
    return;
  }
  profileBox.textContent = JSON.stringify(profile, null, 2);
}

function renderHistory(history) {
  historyList.innerHTML = "";
  if (!history || !history.length) {
    const li = document.createElement("li");
    li.textContent = "No records yet.";
    historyList.appendChild(li);
    return;
  }

  history.forEach((item) => {
    const li = document.createElement("li");
    const time = new Date(item.createdAt).toLocaleString();
    li.textContent = `${time} | ${item.matchedFields} fields | ${item.url || "Unknown URL"}`;
    historyList.appendChild(li);
  });
}

function renderChat(history) {
  chatBox.innerHTML = "";
  if (!history || !history.length) {
    const empty = document.createElement("div");
    empty.className = "chat-item";
    empty.textContent = "No chat yet.";
    chatBox.appendChild(empty);
    return;
  }

  history.forEach((msg) => {
    const item = document.createElement("div");
    item.className = "chat-item";

    const role = document.createElement("span");
    role.className = "chat-role";
    role.textContent = msg.role === "assistant" ? "LLM: " : "You: ";

    const content = document.createElement("span");
    content.textContent = msg.content || "";

    item.appendChild(role);
    item.appendChild(content);
    chatBox.appendChild(item);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}

function applyProviderDefaultsIfEmpty() {
  const provider = providerInput.value || "openai";
  const defaults = PROVIDER_DEFAULTS[provider] || PROVIDER_DEFAULTS.openai;

  if (!baseUrlInput.value.trim()) {
    baseUrlInput.placeholder = defaults.baseUrl;
  }

  if (!modelInput.value.trim()) {
    modelInput.placeholder = defaults.model;
  }
}

async function readFileAsText(file) {
  return file.text();
}

async function saveProfileMarkdown(markdown) {
  const resp = await chrome.runtime.sendMessage({
    type: "SAVE_PROFILE_MD",
    payload: { markdown }
  });

  if (!resp?.ok) {
    throw new Error(resp?.error || "Failed to save markdown");
  }

  renderProfile(resp.profile);
}

async function refreshData() {
  const profileResp = await chrome.runtime.sendMessage({ type: "GET_PROFILE" });
  if (profileResp?.ok) renderProfile(profileResp.profile);

  const mdResp = await chrome.runtime.sendMessage({ type: "GET_PROFILE_MD" });
  if (mdResp?.ok) {
    profileMdInput.value = mdResp.markdown || "";
    renderChat(mdResp.chatHistory || []);
  }

  const historyResp = await chrome.runtime.sendMessage({ type: "GET_HISTORY" });
  if (historyResp?.ok) renderHistory(historyResp.history);

  const settingsResp = await chrome.runtime.sendMessage({ type: "GET_SETTINGS" });
  if (settingsResp?.ok) {
    const settings = settingsResp.settings || {};
    providerInput.value = settings.provider || "openai";
    baseUrlInput.value = settings.baseUrl || "";
    modelInput.value = settings.model || "";
    apiKeyInput.value = settings.llmApiKey || "";
    autoMultiPageInput.checked = !!settings.autoMultiPage;
    maxAutoPagesInput.value = String(settings.maxAutoPages || 3);
    if (autofillLanguageInput) {
      autofillLanguageInput.value = settings.autofillLanguage || "auto";
    }
    applyProviderDefaultsIfEmpty();
  }
}

on(providerInput, "change", () => {
  applyProviderDefaultsIfEmpty();
});

on(uploadBtn, "click", async () => {
  try {
    const file = fileInput.files?.[0];
    if (!file) {
      setStatus(getTranslation("status_error_file"), true);
      return;
    }

    setStatus(getTranslation("status_importing"));
    const text = await readFileAsText(file);
    profileMdInput.value = text;
    await saveProfileMarkdown(text);
    setStatus(getTranslation("status_imported"));
    await refreshData();
  } catch (err) {
    setStatus(err?.message || "Import failed.", true);
  }
});

on(saveMdBtn, "click", async () => {
  try {
    await saveProfileMarkdown(profileMdInput.value);
    setStatus(getTranslation("status_saved"));
  } catch (err) {
    setStatus(err?.message || "Failed to save profile.md", true);
  }
});

on(sendChatBtn, "click", async () => {
  const message = chatInput.value.trim();
  if (!message) {
    setStatus(getTranslation("status_error_chat"), true);
    return;
  }

  try {
    setStatus(getTranslation("status_talking"));
    const resp = await chrome.runtime.sendMessage({
      type: "CHAT_UPDATE_PROFILE_MD",
      payload: { message }
    });

    if (!resp?.ok) {
      setStatus(resp?.error || "Chat failed.", true);
      return;
    }

    profileMdInput.value = resp.updatedMarkdown || "";
    renderProfile(resp.profile);
    chatInput.value = "";
    setStatus(getTranslation("status_chat_updated"));
    await refreshData();
  } catch (err) {
    setStatus(err?.message || "Chat failed.", true);
  }
});

on(saveSettingsBtn, "click", async () => {
  const provider = providerInput.value || "openai";
  const defaults = PROVIDER_DEFAULTS[provider] || PROVIDER_DEFAULTS.openai;

  const payload = {
    provider,
    baseUrl: baseUrlInput.value.trim() || defaults.baseUrl,
    model: modelInput.value.trim() || defaults.model,
    llmApiKey: apiKeyInput.value.trim(),
    autofillLanguage: (autofillLanguageInput && autofillLanguageInput.value) || "auto",
    autoMultiPage: !!autoMultiPageInput.checked,
    maxAutoPages: Math.max(1, Math.min(10, Number(maxAutoPagesInput.value) || 3))
  };

  const resp = await chrome.runtime.sendMessage({
    type: "SAVE_SETTINGS",
    payload
  });

  if (!resp?.ok) {
    setStatus(resp?.error || getTranslation("status_error_settings"), true);
    return;
  }

  setStatus(getTranslation("status_settings_saved"));
});

on(fillCurrentPageBtn, "click", async () => {
  let activeTab = null;
  try {
    resetFillProgress();
    appendFillProgress("Popup: preparing autofill request.");
    fillCurrentPageBtn.disabled = true;
    setStatus(getTranslation("status_triggering"));
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTab = tabs?.[0];

    if (!activeTab?.id) {
      appendFillProgress("Popup: failed to find active tab.");
      setStatus(getTranslation("status_no_tab"), true);
      fillCurrentPageBtn.disabled = false;
      return;
    }

    if (isRestrictedUrl(activeTab.url || "")) {
      appendFillProgress("Popup: this page does not allow extension scripts.");
      setStatus(getTranslation("status_restricted"), true);
      fillCurrentPageBtn.disabled = false;
      return;
    }

    appendFillProgress("Popup: request sent to content script.");
    const autofillOptions = {
      fillLanguage: (autofillLanguageInput && autofillLanguageInput.value) || "auto",
      autoMultiPage: !!autoMultiPageInput.checked,
      maxAutoPages: Math.max(1, Math.min(10, Number(maxAutoPagesInput.value) || 3))
    };
    let resp;
    try {
      resp = await sendFillRequest(activeTab.id, autofillOptions);
    } catch (_) {
      appendFillProgress("Popup: content script not ready, injecting now...");
      await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        files: ["content.js"]
      });
      appendFillProgress("Popup: injected. Retrying autofill request...");
      resp = await sendFillRequest(activeTab.id, autofillOptions);
    }

    if (!resp?.ok) {
      appendFillProgress(`Content: failed - ${resp?.error || "unknown error"}`);
      setStatus(resp?.error || getTranslation("status_failed"), true);
      fillCurrentPageBtn.disabled = false;
      return;
    }

    appendFillProgress(
      `Content: completed, filled ${resp.count || 0} fields across ${resp.pagesProcessed || 1} page(s).`
    );
    const unresolved = Array.isArray(resp.unresolvedFields) ? resp.unresolvedFields : [];
    if (unresolved.length) {
      appendFillProgress(`Content: ${unresolved.length} fields need manual input.`);
      unresolved.slice(0, 5).forEach((item) => {
        appendFillProgress(`Manual: ${item.label || item.selector} (${item.reason || "missing"})`);
      });
      if (unresolved.length > 5) {
        appendFillProgress(`Manual: ...and ${unresolved.length - 5} more fields.`);
      }
    }

    if (resp.nextStepHint) {
      appendFillProgress(`Hint: possible next-step button found ("${resp.nextStepHint}").`);
      appendFillProgress("Hint: click next page, then run Fill Current Page again.");
    }

    setStatus(
      unresolved.length
        ? `Filled ${resp.count || 0} fields on ${resp.pagesProcessed || 1} page(s); ${unresolved.length} ${getTranslation("status_needs_manual")}`
        : `${getTranslation("status_complete")}: ${resp.count || 0} fields updated on ${resp.pagesProcessed || 1} page(s).`
    );
    fillCurrentPageBtn.disabled = false;
  } catch (err) {
    appendFillProgress("Popup: cannot reach content script.");
    const msg = err?.message || "";
    if (activeTab && (activeTab.url || "").startsWith("file://")) {
      setStatus("Enable 'Allow access to file URLs' in extension settings, then refresh page.", true);
    } else if (msg.includes("Cannot access contents")) {
      setStatus("Extension cannot access this page. Try another page or refresh and retry.", true);
    } else {
      setStatus("Cannot reach this page. Refresh target page and ensure extension access is allowed.", true);
    }
    fillCurrentPageBtn.disabled = false;
  }
});

on(openInterviewPageBtn, "click", async () => {
  try {
    const url = chrome.runtime.getURL("chat/chat.html");
    await chrome.tabs.create({ url });
    setStatus("Opened Interview Page.");
  } catch (err) {
    setStatus(err?.message || "Failed to open interview page.", true);
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== "AUTOFILL_PROGRESS") return;
  const payload = message.payload || {};
  const text = payload.message;
  if (!text) return;
  appendFillProgress(`Content: ${text}`);

  if (payload.step === "needs_input" && Array.isArray(payload.unresolvedFields)) {
    payload.unresolvedFields.slice(0, 5).forEach((item) => {
      appendFillProgress(`Manual: ${item.label || item.selector} (${item.reason || "missing"})`);
    });
    if (payload.unresolvedFields.length > 5) {
      appendFillProgress(`Manual: ...and ${payload.unresolvedFields.length - 5} more fields.`);
    }
  }
});

refreshData().catch((err) => {
  setStatus(err?.message || getTranslation("status_error_load"), true);
});
