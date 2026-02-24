importScripts("utils/profile-template.js", "utils/storage.js", "utils/parser.js", "utils/llm.js");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Resume AutoFill installed");
});

function fallbackChatUpdate(currentMarkdown, message) {
  const note = `- ${new Date().toISOString()}: ${message}`;
  if (!currentMarkdown.trim()) {
    return `# Profile\n\n## Notes\n${note}\n`;
  }

  if (currentMarkdown.includes("## Notes")) {
    return `${currentMarkdown.trim()}\n${note}\n`;
  }

  return `${currentMarkdown.trim()}\n\n## Notes\n${note}\n`;
}

function detectFieldCategory(field) {
  const key = `${field?.label || ""} ${field?.name || ""} ${field?.id || ""}`.toLowerCase();
  if (key.includes("email") || key.includes("mail")) return "email";
  if (key.includes("phone") || key.includes("mobile")) return "phone";
  if (key.includes("authorization") || key.includes("work auth") || key.includes("visa") || key.includes("sponsor")) {
    return "workAuthorization";
  }
  if (key.includes("remote")) return "openToRemote";
  if (key.includes("education") || key.includes("university") || key.includes("school")) return "education";
  if (key.includes("skill")) return "skills";
  if (key.includes("experience") || key.includes("summary") || key.includes("about")) return "experience";
  if (key.includes("name")) return "name";
  return "other";
}

function profileHasCategory(profile, category) {
  const p = profile || {};
  switch (category) {
    case "name":
      return !!String(p.fullName || "").trim();
    case "email":
      return !!String(p.email || "").trim();
    case "phone":
      return !!String(p.phone || "").trim();
    case "education":
      return !!String(p.education || "").trim();
    case "skills":
      return Array.isArray(p.skills) && p.skills.length > 0;
    case "experience":
      return !!String(p.experience || "").trim();
    case "workAuthorization":
      return !!String(p.workAuthorization || "").trim();
    case "openToRemote":
      return !!String(p.openToRemote || "").trim();
    default:
      return true;
  }
}

function sanitizeFieldMap(fields, fieldMap) {
  const safeMap = {};
  for (const [selector, value] of Object.entries(fieldMap || {})) {
    if (value === undefined || value === null || String(value).trim() === "") continue;
    safeMap[selector] = value;
  }

  return { safeMap };
}

function filterMissingByProfile(missingFields, fields, profile) {
  const fieldsBySelector = new Map((fields || []).map((f) => [f.selector, f]));
  const filtered = [];
  for (const item of missingFields || []) {
    const field = fieldsBySelector.get(item.selector) || {
      selector: item.selector,
      label: item.label || item.selector,
      name: ""
    };
    const category = detectFieldCategory(field);
    if (!profileHasCategory(profile, category)) {
      filtered.push({
        selector: field.selector,
        label: field.label || field.name || field.selector,
        reason: item.reason || "No related information in profile.md."
      });
    }
  }
  return filtered;
}

function buildExpectedUnresolved(fields, safeMap, profile) {
  const unresolved = [];
  const mappedSelectors = new Set(Object.keys(safeMap || {}));
  for (const field of fields || []) {
    if (mappedSelectors.has(field.selector)) continue;
    const category = detectFieldCategory(field);
    if (category === "other") continue;
    if (profileHasCategory(profile, category)) continue;

    unresolved.push({
      selector: field.selector,
      label: field.label || field.name || field.selector,
      reason: "No related information found in profile.md."
    });
  }
  return unresolved;
}

async function syncGlobalProfileFromMarkdown(markdown) {
  await ResumeStorage.setProfileMarkdown(markdown || "");
  const profile = ResumeParser.parseProfileMarkdown(markdown || "");
  await ResumeStorage.setResumeProfile(profile);
  return profile;
}

async function getInterviewContext(sessionId) {
  const activeSessionId = await ResumeStorage.getActiveInterviewSessionId();
  const targetSessionId = sessionId || activeSessionId;
  const sessionData = await ResumeStorage.getInterviewSession(targetSessionId);
  return {
    session: sessionData.session,
    history: sessionData.history || [],
    sessionId: sessionData.session?.id || targetSessionId
  };
}

function getDefaultProfileTemplate() {
  return String(globalThis.ResumeProfileTemplate?.MARKDOWN_TEMPLATE || "");
}

function normalizeFillLanguage(value) {
  const v = String(value || "auto").toLowerCase();
  if (v === "zh" || v === "en" || v === "auto") return v;
  return "auto";
}

function pickQuotedValue(text, key) {
  const re = new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`, "i");
  const m = String(text || "").match(re);
  return m?.[1]?.trim() || "";
}

function uniqueStrings(items) {
  return Array.from(new Set((items || []).filter(Boolean)));
}

function extractResearchTargets(markdown) {
  const text = String(markdown || "");
  const institutionNames = [];
  const awardNames = [];

  const institutionRe = /name_en\s*:\s*["']([^"']+)["']/gi;
  let m;
  while ((m = institutionRe.exec(text))) {
    const value = String(m[1] || "").trim();
    if (!value || /^previous\b/i.test(value)) continue;
    institutionNames.push(value);
  }

  const awardRe = /name_en\s*:\s*["']([^"']+)["']/gi;
  while ((m = awardRe.exec(text))) {
    const raw = String(m[1] || "").trim();
    if (!raw || /^previous\b/i.test(raw)) continue;
    if (/scholarship|award|prize|competition|cup|fellowship/i.test(raw)) {
      awardNames.push(raw);
    }
  }

  return {
    institutions: uniqueStrings(institutionNames).slice(0, 3),
    awards: uniqueStrings(awardNames).slice(0, 3)
  };
}

async function wikipediaSearchFirst(query) {
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}` +
    `&format=json&origin=*&utf8=1&srlimit=1`;
  const resp = await fetch(url);
  if (!resp.ok) return null;
  const data = await resp.json();
  const first = data?.query?.search?.[0];
  if (!first?.title) return null;
  return first.title;
}

async function wikipediaSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const resp = await fetch(url);
  if (!resp.ok) return null;
  const data = await resp.json();
  const extract = String(data?.extract || "").trim();
  if (!extract) return null;
  const sourceUrl = data?.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
  return {
    title: data?.title || title,
    extract,
    sourceUrl
  };
}

async function buildResearchFindings(markdown) {
  const targets = extractResearchTargets(markdown);
  const findings = [];

  for (const schoolName of targets.institutions) {
    try {
      const title =
        (await wikipediaSearchFirst(`${schoolName} university`)) ||
        (await wikipediaSearchFirst(schoolName));
      if (!title) continue;
      const summary = await wikipediaSummary(title);
      if (!summary) continue;
      findings.push({
        type: "institution",
        targetName: schoolName,
        factText: summary.extract,
        sourceUrl: summary.sourceUrl,
        sourceTitle: summary.title
      });
    } catch (err) {
      console.warn("research lookup school failed", schoolName, err);
    }
  }

  for (const awardName of targets.awards) {
    try {
      const title =
        (await wikipediaSearchFirst(`${awardName} competition`)) ||
        (await wikipediaSearchFirst(awardName));
      if (!title) continue;
      const summary = await wikipediaSummary(title);
      if (!summary) continue;
      findings.push({
        type: "award",
        targetName: awardName,
        factText: summary.extract,
        sourceUrl: summary.sourceUrl,
        sourceTitle: summary.title
      });
    } catch (err) {
      console.warn("research lookup award failed", awardName, err);
    }
  }

  return findings;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      switch (message?.type) {
        case "SAVE_SETTINGS": {
          await ResumeStorage.setSettings(message.payload || {});
          sendResponse({ ok: true });
          return;
        }
        case "GET_SETTINGS": {
          const settings = await ResumeStorage.getSettings();
          sendResponse({ ok: true, settings });
          return;
        }
        case "SAVE_PROFILE_MD": {
          const markdown = message.payload?.markdown || "";
          await ResumeStorage.setProfileMarkdown(markdown);
          const profile = ResumeParser.parseProfileMarkdown(markdown);
          await ResumeStorage.setResumeProfile(profile);
          sendResponse({ ok: true, profile });
          return;
        }
        case "GET_PROFILE_MD": {
          const markdown = await ResumeStorage.getProfileMarkdown();
          const chatHistory = await ResumeStorage.getChatHistory();
          sendResponse({ ok: true, markdown, chatHistory });
          return;
        }
        case "CHAT_UPDATE_PROFILE_MD": {
          const userMessage = (message.payload?.message || "").trim();
          if (!userMessage) {
            sendResponse({ ok: false, error: "Empty message" });
            return;
          }

          const settings = await ResumeStorage.getSettings();
          const currentMarkdown = await ResumeStorage.getProfileMarkdown();
          const history = await ResumeStorage.getChatHistory();

          let reply = "";
          let updatedMarkdown = currentMarkdown;

          try {
            const llmResp = await ResumeLLM.chatUpdateProfileMarkdown(
              userMessage,
              currentMarkdown,
              history,
              settings
            );
            reply = llmResp.reply;
            updatedMarkdown = llmResp.updatedMarkdown;
          } catch (err) {
            console.warn("LLM chat update failed, fallback", err);
            updatedMarkdown = fallbackChatUpdate(currentMarkdown, userMessage);
            reply = "LLM not available. I added your message into the Notes section.";
          }

          await ResumeStorage.setProfileMarkdown(updatedMarkdown);
          const profile = ResumeParser.parseProfileMarkdown(updatedMarkdown);
          await ResumeStorage.setResumeProfile(profile);

          const now = new Date().toISOString();
          await ResumeStorage.addChatMessage({ role: "user", content: userMessage, createdAt: now });
          await ResumeStorage.addChatMessage({ role: "assistant", content: reply, createdAt: now });

          sendResponse({
            ok: true,
            reply,
            updatedMarkdown,
            profile
          });
          return;
        }
        case "INTERVIEW_START": {
          const requestedSessionId = message.payload?.sessionId || "";
          const settings = await ResumeStorage.getSettings();
          const ctx = await getInterviewContext(requestedSessionId);
          const currentMarkdown = ctx.session?.markdown || "";
          const history = ctx.history || [];
          const fillLanguage = normalizeFillLanguage(message.payload?.fillLanguage || ctx.session?.fillLanguage || "auto");

          let reply = "";
          let nextQuestion = "";
          try {
            const llmResp = await ResumeLLM.startInterview(currentMarkdown, history, settings, fillLanguage);
            reply = llmResp.reply;
            nextQuestion = llmResp.nextQuestion || "";
          } catch (err) {
            console.warn("LLM interview start failed, fallback", err);
            reply = "Let's begin. We'll walk through your recent work and convert it into profile.md.";
            nextQuestion = "What is the most recent project you delivered, and what outcome did it improve?";
          }

          const now = new Date().toISOString();
          await ResumeStorage.appendInterviewMessage(ctx.sessionId, { role: "assistant", content: reply, createdAt: now });
          await ResumeStorage.updateInterviewSession(ctx.sessionId, { nextQuestion, fillLanguage });

          sendResponse({
            ok: true,
            reply,
            nextQuestion,
            sessionId: ctx.sessionId,
            fillLanguage
          });
          return;
        }
        case "INTERVIEW_TURN": {
          const userMessage = (message.payload?.message || "").trim();
          const requestedSessionId = message.payload?.sessionId || "";
          if (!userMessage) {
            sendResponse({ ok: false, error: "Empty message" });
            return;
          }

          const settings = await ResumeStorage.getSettings();
          const ctx = await getInterviewContext(requestedSessionId);
          const currentMarkdown = ctx.session?.markdown || "";
          const history = ctx.history || [];
          const fillLanguage = normalizeFillLanguage(message.payload?.fillLanguage || ctx.session?.fillLanguage || "auto");

          let reply = "";
          let nextQuestion = "";
          let updatedMarkdown = currentMarkdown;
          let researchAppliedCount = 0;
          let researchSources = [];

          try {
            const llmResp = await ResumeLLM.interviewUpdateProfileMarkdown(
              userMessage,
              currentMarkdown,
              history,
              settings,
              fillLanguage
            );
            reply = llmResp.reply;
            updatedMarkdown = llmResp.updatedMarkdown;
            nextQuestion = llmResp.nextQuestion || "";

            try {
              const findings = await buildResearchFindings(updatedMarkdown);
              if (findings.length) {
                const enrichResultWithLang = await ResumeLLM.applyResearchFindingsToProfile(
                  updatedMarkdown,
                  findings,
                  settings,
                  fillLanguage
                );
                updatedMarkdown = enrichResultWithLang.updatedMarkdown || updatedMarkdown;
                researchAppliedCount = Array.isArray(enrichResultWithLang.appliedFindings)
                  ? enrichResultWithLang.appliedFindings.length
                  : 0;
                researchSources = findings.slice(0, 6).map((item) => item.sourceUrl).filter(Boolean);
              }
            } catch (researchErr) {
              console.warn("Interview research enrich failed", researchErr);
            }
          } catch (err) {
            console.warn("LLM interview turn failed, fallback", err);
            updatedMarkdown = fallbackChatUpdate(currentMarkdown, userMessage);
            reply = "I captured that note in profile.md. Please add one concrete metric (%, time, count) for impact.";
            nextQuestion = "What measurable result did your work produce?";
          }

          const now = new Date().toISOString();
          await ResumeStorage.appendInterviewMessage(ctx.sessionId, { role: "user", content: userMessage, createdAt: now });
          await ResumeStorage.appendInterviewMessage(ctx.sessionId, { role: "assistant", content: reply, createdAt: now });
          await ResumeStorage.updateInterviewSession(ctx.sessionId, {
            markdown: updatedMarkdown,
            nextQuestion,
            fillLanguage
          });
          const profile = await syncGlobalProfileFromMarkdown(updatedMarkdown);

          sendResponse({
            ok: true,
            reply,
            nextQuestion,
            updatedMarkdown,
            profile,
            sessionId: ctx.sessionId,
            researchAppliedCount,
            researchSources,
            fillLanguage
          });
          return;
        }
        case "INTERVIEW_SESSION_LIST": {
          const sessions = await ResumeStorage.listInterviewSessions();
          const activeSessionId = await ResumeStorage.getActiveInterviewSessionId();
          sendResponse({ ok: true, sessions, activeSessionId });
          return;
        }
        case "INTERVIEW_SESSION_GET": {
          const sessionId = message.payload?.sessionId || "";
          const activeSessionId = await ResumeStorage.getActiveInterviewSessionId();
          const targetSessionId = sessionId || activeSessionId;
          const data = await ResumeStorage.getInterviewSession(targetSessionId);
          if (!data?.session) {
            sendResponse({ ok: false, error: "Session not found." });
            return;
          }
          sendResponse({
            ok: true,
            session: data.session,
            history: data.history || [],
            activeSessionId
          });
          return;
        }
        case "INTERVIEW_SESSION_CREATE": {
          const name = (message.payload?.name || "").trim();
          const currentMarkdown = await ResumeStorage.getProfileMarkdown();
          const seedMarkdown = (currentMarkdown || "").trim() || getDefaultProfileTemplate();
          const session = await ResumeStorage.createInterviewSession(name, seedMarkdown);
          await ResumeStorage.setActiveInterviewSession(session.id);
          const profile = await syncGlobalProfileFromMarkdown(session.markdown || "");
          sendResponse({ ok: true, session, profile });
          return;
        }
        case "INTERVIEW_TEMPLATE_GET": {
          sendResponse({ ok: true, template: getDefaultProfileTemplate() });
          return;
        }
        case "INTERVIEW_SESSION_RENAME": {
          const sessionId = (message.payload?.sessionId || "").trim();
          const name = (message.payload?.name || "").trim();
          if (!sessionId || !name) {
            sendResponse({ ok: false, error: "sessionId and name are required." });
            return;
          }
          const session = await ResumeStorage.updateInterviewSession(sessionId, { name });
          if (!session) {
            sendResponse({ ok: false, error: "Session not found." });
            return;
          }
          sendResponse({ ok: true, session });
          return;
        }
        case "INTERVIEW_SESSION_DELETE": {
          const sessionId = (message.payload?.sessionId || "").trim();
          if (!sessionId) {
            sendResponse({ ok: false, error: "sessionId is required." });
            return;
          }
          const result = await ResumeStorage.deleteInterviewSession(sessionId);
          await ResumeStorage.setActiveInterviewSession(result.activeSessionId);
          const active = await ResumeStorage.getInterviewSession(result.activeSessionId);
          const profile = await syncGlobalProfileFromMarkdown(active?.session?.markdown || "");
          sendResponse({
            ok: true,
            sessions: result.sessions,
            activeSessionId: result.activeSessionId,
            profile
          });
          return;
        }
        case "INTERVIEW_SESSION_SET_ACTIVE": {
          const sessionId = (message.payload?.sessionId || "").trim();
          if (!sessionId) {
            sendResponse({ ok: false, error: "sessionId is required." });
            return;
          }
          const ok = await ResumeStorage.setActiveInterviewSession(sessionId);
          if (!ok) {
            sendResponse({ ok: false, error: "Session not found." });
            return;
          }
          const data = await ResumeStorage.getInterviewSession(sessionId);
          const profile = await syncGlobalProfileFromMarkdown(data?.session?.markdown || "");
          sendResponse({
            ok: true,
            session: data.session,
            history: data.history || [],
            profile
          });
          return;
        }
        case "INTERVIEW_SESSION_SET_LANGUAGE": {
          const sessionId = (message.payload?.sessionId || "").trim();
          const fillLanguage = normalizeFillLanguage(message.payload?.fillLanguage || "auto");
          if (!sessionId) {
            sendResponse({ ok: false, error: "sessionId is required." });
            return;
          }
          const session = await ResumeStorage.updateInterviewSession(sessionId, { fillLanguage });
          if (!session) {
            sendResponse({ ok: false, error: "Session not found." });
            return;
          }
          sendResponse({ ok: true, session });
          return;
        }
        case "UPLOAD_RESUME_TEXT": {
          const rawText = (message.payload?.text || "").trim();
          if (!rawText) {
            sendResponse({ ok: false, error: "Empty resume text" });
            return;
          }

          await ResumeStorage.setResumeRaw(rawText);
          await ResumeStorage.setProfileMarkdown(rawText);
          const settings = await ResumeStorage.getSettings();

          let profile = null;
          try {
            profile = await ResumeLLM.parseResumeWithLLM(rawText, settings);
          } catch (err) {
            console.warn("LLM parse failed, fallback to local parser", err);
          }

          if (!profile) {
            profile = ResumeParser.parseResumeText(rawText);
          }

          await ResumeStorage.setResumeProfile(profile);
          sendResponse({ ok: true, profile, source: profile.rawText ? "local" : "llm" });
          return;
        }
        case "GET_PROFILE": {
          const profile = await ResumeStorage.getResumeProfile();
          sendResponse({ ok: true, profile });
          return;
        }
        case "GET_HISTORY": {
          const history = await ResumeStorage.getFormHistory();
          sendResponse({ ok: true, history });
          return;
        }
        case "MAP_FORM_FIELDS": {
          const fields = message.payload?.fields || [];
          const fillLanguage = normalizeFillLanguage(message.payload?.fillLanguage || "auto");
          const settings = await ResumeStorage.getSettings();
          const preferredLanguage = fillLanguage === "auto" ? normalizeFillLanguage(settings.autofillLanguage) : fillLanguage;
          const profileMarkdown = await ResumeStorage.getProfileMarkdown();
          const profile =
            (await ResumeStorage.getResumeProfile()) || ResumeParser.parseProfileMarkdown(profileMarkdown);

          if (!profileMarkdown && !profile) {
            sendResponse({ ok: false, error: "No profile markdown found." });
            return;
          }

          let fieldMap = null;
          let unresolvedFields = [];
          try {
            if (profileMarkdown) {
              const llmResult = await ResumeLLM.mapFieldsWithLLM(
                fields,
                profileMarkdown,
                settings,
                preferredLanguage
              );
              fieldMap = llmResult?.fieldMap || null;
              unresolvedFields = llmResult?.missingFields || [];
            }
          } catch (err) {
            console.warn("LLM form mapping failed, fallback", err);
          }

          if (!fieldMap) {
            fieldMap = ResumeLLM.mapFieldsHeuristically(fields, profile || {});
          }

          const sanitized = sanitizeFieldMap(fields, fieldMap);
          const filteredLlmMissing = filterMissingByProfile(unresolvedFields, fields, profile || {});
          const expectedUnresolved = buildExpectedUnresolved(fields, sanitized.safeMap, profile || {});
          unresolvedFields = [...filteredLlmMissing, ...expectedUnresolved];
          const uniqueUnresolved = Array.from(
            new Map(
              unresolvedFields.map((item) => [
                item.selector,
                {
                  selector: item.selector,
                  label: item.label,
                  reason: item.reason || "Missing from profile."
                }
              ])
            ).values()
          );

          await ResumeStorage.addFormHistory({
            url: sender?.tab?.url || message.payload?.url || "",
            createdAt: new Date().toISOString(),
            matchedFields: Object.keys(sanitized.safeMap).length
          });

          sendResponse({
            ok: true,
            fieldMap: sanitized.safeMap,
            unresolvedFields: uniqueUnresolved
          });
          return;
        }
        default:
          sendResponse({ ok: false, error: "Unknown message type" });
      }
    } catch (error) {
      sendResponse({ ok: false, error: error?.message || String(error) });
    }
  })();

  return true;
});
