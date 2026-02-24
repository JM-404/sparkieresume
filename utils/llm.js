(function initLlm(global) {
  function getProviderDefaults(provider) {
    switch (provider) {
      case "claude":
        return {
          baseUrl: "https://api.anthropic.com/v1",
          model: "claude-3-5-sonnet-latest"
        };
      case "gemini":
        return {
          baseUrl: "https://generativelanguage.googleapis.com/v1beta",
          model: "gemini-1.5-flash"
        };
      case "openai":
      default:
        return {
          baseUrl: "https://api.openai.com/v1",
          model: "gpt-4.1-mini"
        };
    }
  }

  function normalizeSettings(settings) {
    const provider = settings?.provider || "openai";
    const defaults = getProviderDefaults(provider);
    return {
      provider,
      baseUrl: (settings?.baseUrl || defaults.baseUrl).replace(/\/$/, ""),
      model: settings?.model || defaults.model,
      llmApiKey: settings?.llmApiKey || "",
      llmEndpoint: settings?.llmEndpoint || ""
    };
  }

  const INTERVIEW_PROFILE_TEMPLATE = String(global.ResumeProfileTemplate?.MARKDOWN_TEMPLATE || "");

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

  function countListItems(sectionText) {
    const matches = String(sectionText || "").match(/^\s*-\s+/gm);
    return matches ? matches.length : 0;
  }

  function countSubItems(sectionText) {
    const matches = String(sectionText || "").match(/^\s*##\s+/gm);
    return matches ? matches.length : 0;
  }

  function hasField(sectionText, key) {
    return new RegExp(`\\b${key}\\b\\s*:`, "i").test(String(sectionText || ""));
  }

  function hasYamlKey(markdown, key) {
    return new RegExp(`(^|\\n)\\s*${key}\\s*:`, "i").test(String(markdown || ""));
  }

  function countYamlListEntry(markdown, key) {
    const matches = String(markdown || "").match(new RegExp(`-\\s+${key}\\s*:`, "gi"));
    return matches ? matches.length : 0;
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

  function buildInterviewCoverageSnapshot(profileMarkdown) {
    const text = String(profileMarkdown || "");
    const basicSection = extractTopLevelSection(text, "Basic Information");
    const educationSection = extractTopLevelSection(text, "Education");
    const workSection = extractTopLevelSection(text, "Work Experience");
    const projectsSection = extractTopLevelSection(text, "Projects");
    const awardsSection = extractTopLevelSection(text, "Honors & Awards");
    const publicationsSection = extractTopLevelSection(text, "Publications & Research");
    const skillsSection = extractTopLevelSection(text, "Skills");
    const onlineSection = extractTopLevelSection(text, "Online Presence");
    const contactSection = extractTopLevelSection(text, "Contact Information");

    const baseInfoRequired = [
      "full_name_en",
      "full_name_cn",
      "nationality",
      "github",
      "linkedin"
    ];
    const missingBaseInfoFields = baseInfoRequired.filter(
      (field) => !hasNonEmptyYamlValue(field === "github" || field === "linkedin" ? onlineSection : basicSection, field)
    );
    if (!/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(contactSection)) missingBaseInfoFields.push("contact_email");
    if (!/(\+?\d[\d\s().-]{7,}\d)/.test(contactSection)) missingBaseInfoFields.push("contact_phone");

    const educationRequired = ["name_en", "major_en", "level", "start_date", "expected_graduation", "value"];
    const missingEducationFields = educationRequired.filter((field) => !hasNonEmptyYamlValue(educationSection, field));

    const skillsRequired = ["technical_skills", "programming_languages", "soft_skills"];
    const missingSkillFields = skillsRequired.filter((field) => !hasNonEmptyYamlValue(skillsSection, field));

    const sectionCounts = {
      educationItems: countNonEmptyYamlValue(educationSection, "name_en"),
      experienceItems: countNonEmptyYamlValue(workSection, "title_en"),
      projectsItems: countNonEmptyYamlValue(projectsSection, "name"),
      awardsItems: countNonEmptyYamlValue(awardsSection, "name_en"),
      publicationsItems: countNonEmptyYamlValue(publicationsSection, "title")
    };

    const requiredMissing = [];
    if (missingBaseInfoFields.length) requiredMissing.push(`Basic Information fields: ${missingBaseInfoFields.join(", ")}`);
    if (missingEducationFields.length) requiredMissing.push(`Education fields: ${missingEducationFields.join(", ")}`);
    if (sectionCounts.experienceItems === 0) requiredMissing.push("Work Experience: add at least one entry");
    if (sectionCounts.projectsItems === 0) requiredMissing.push("Projects: add at least one entry");
    if (missingSkillFields.length) requiredMissing.push(`Skills fields: ${missingSkillFields.join(", ")}`);

    return {
      sectionCounts,
      missingBaseInfoFields,
      missingEducationFields,
      missingSkillFields,
      requiredMissing,
      hasLowExperience: sectionCounts.experienceItems < 2
    };
  }

  function makeTaskPrompt(task, payload) {
    if (task === "resume_parse") {
      return {
        system:
          "You extract structured resume data. Return strict JSON only.",
        user: `Return JSON with key profile. Schema: {\"profile\":{\"fullName\":string,\"email\":string,\"phone\":string,\"education\":string,\"skills\":string[],\"experience\":string,\"workAuthorization\":string,\"openToRemote\":string}}.\nResume text:\n${payload.text}`
      };
    }

    if (task === "form_map") {
      return {
        system:
          "You map job form fields from candidate profile markdown. Return strict JSON only.",
        user: `Return JSON with keys fieldMap and missingFields.
Rules:
1) fieldMap: dictionary from selector to value.
2) Only use selectors from provided fields.
3) Never invent facts. If info is not present in profile markdown, do not fill it.
4) missingFields: array of {selector,label,reason} for fields that need user input.
5) Fill language mode: ${payload.preferredLanguage || "auto"}.
   - "zh": prefer Chinese values for free-text choices when both zh/en equivalents exist.
   - "en": prefer English values for free-text choices when both zh/en equivalents exist.
   - "auto": infer from page field labels/options language.
Profile markdown:
${payload.profileMarkdown}
Fields:
${JSON.stringify(payload.fields)}`
      };
    }

    if (task === "interview_start") {
      return {
        system:
          "You are a concise career interviewer and profile editor. Return strict JSON only.",
        user: `Return JSON with keys: reply, nextQuestion.
Rules:
1) Ask exactly one focused question in nextQuestion.
2) reply should be short, interview-style, and actionable.
2.1) Language mode = ${payload.preferredLanguage || "auto"}.
   - If "zh": write reply/nextQuestion and newly filled free-text values in Chinese.
   - If "en": write reply/nextQuestion and newly filled free-text values in English.
   - If "auto": follow the user's latest language.
3) Maintain profile completeness state from coverageSnapshot and prioritize:
   - First: fill required gaps (Basic Information, Education required fields, Work Experience, Projects, Skills structured fields).
   - Then: deepen existing items with quantifiable outcomes.
4) If a section already has 2+ items, guide user to other underfilled sections.
5) If experience is limited, actively mine hidden experiences (coursework, volunteering, competitions, freelance, labs, clubs) and help reframe impact.
6) Keep markdown aligned to this template (do not collapse it into coarse sections):
${INTERVIEW_PROFILE_TEMPLATE}
Candidate profile markdown:
${payload.profileMarkdown}
Coverage snapshot:
${JSON.stringify(payload.coverageSnapshot || {})}
Recent chat history:
${JSON.stringify(payload.chatHistory || [])}`
      };
    }

    if (task === "interview_turn") {
      return {
        system:
          "You are a career interviewer that updates candidate profile markdown safely. Return strict JSON only.",
        user: `Return JSON with keys: reply, updatedMarkdown, nextQuestion.
Rules:
1) Keep reply short and interview-like.
1.1) Language mode = ${payload.preferredLanguage || "auto"}.
   - If "zh": write reply/nextQuestion and newly filled free-text values in Chinese.
   - If "en": write reply/nextQuestion and newly filled free-text values in English.
   - If "auto": follow the user's latest language.
2) Update markdown only with concrete facts from user message/history.
3) Do not invent company names, dates, metrics, or responsibilities.
4) Keep markdown concise and aligned to this template:
${INTERVIEW_PROFILE_TEMPLATE}
5) Maintain profile completeness state from coverageSnapshot and prioritize:
   - First: fill required gaps (Basic Information, Education required fields, Work Experience, Projects, Skills structured fields).
   - Then: deepen existing items with quantifiable outcomes.
6) If a section already has 2+ items, guide user toward other sections.
7) If experience is limited, mine hidden experiences and reframe transferable impact.
8) Ask exactly one focused follow-up question in nextQuestion.
Current markdown:
${payload.profileMarkdown}
Coverage snapshot:
${JSON.stringify(payload.coverageSnapshot || {})}
Chat history:
${JSON.stringify(payload.chatHistory || [])}
User message:
${payload.message}`
      };
    }

    if (task === "profile_research_enrich") {
      return {
        system:
          "You enrich profile markdown from web findings with high precision. Return strict JSON only.",
        user: `Return JSON with keys: updatedMarkdown, appliedFindings.
Rules:
1) Use findings only when they directly match existing entities in markdown (same institution/award/project name).
2) Fill only currently empty fields. Do not overwrite non-empty user-entered values.
3) Never fabricate facts. If uncertain, skip.
4) Prefer adding website, city/country, organizer/issuer, and brief verifiable descriptors.
5) Keep markdown structure unchanged and aligned with this template:
${INTERVIEW_PROFILE_TEMPLATE}
6) Language mode = ${payload.preferredLanguage || "auto"} for newly added free-text values.
Current markdown:
${payload.profileMarkdown}
Findings:
${JSON.stringify(payload.findings || [])}`
      };
    }

    return {
      system:
        "You maintain a candidate profile markdown file for job applications. Return strict JSON only.",
      user: `Return JSON with keys reply and updatedMarkdown. Keep markdown concise and well-structured.\nCurrent markdown:\n${payload.profileMarkdown}\nChat history:\n${JSON.stringify(payload.chatHistory || [])}\nUser message:\n${payload.message}`
    };
  }

  function extractTextFromOpenAIResponse(data) {
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      return content.map((part) => (typeof part === "string" ? part : part?.text || "")).join("\n");
    }
    return "";
  }

  function extractTextFromClaudeResponse(data) {
    const blocks = data?.content || [];
    if (!Array.isArray(blocks)) return "";
    return blocks.map((b) => b?.text || "").join("\n");
  }

  function extractTextFromGeminiResponse(data) {
    const parts = data?.candidates?.[0]?.content?.parts || [];
    if (!Array.isArray(parts)) return "";
    return parts.map((p) => p?.text || "").join("\n");
  }

  function tryParseJson(text) {
    const raw = (text || "").trim();
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (_) {}

    const fenced = raw.match(/```json\s*([\s\S]*?)\s*```/i) || raw.match(/```\s*([\s\S]*?)\s*```/i);
    if (fenced?.[1]) {
      try {
        return JSON.parse(fenced[1].trim());
      } catch (_) {}
    }

    const first = raw.indexOf("{");
    const last = raw.lastIndexOf("}");
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(raw.slice(first, last + 1));
      } catch (_) {}
    }

    return null;
  }

  function trimText(value, maxLen = 240) {
    const text = String(value || "").trim();
    if (text.length <= maxLen) return text;
    return `${text.slice(0, maxLen)}...`;
  }

  function sanitizeFieldForPrompt(field) {
    const base = {
      selector: String(field?.selector || ""),
      tag: String(field?.tag || ""),
      type: String(field?.type || ""),
      name: trimText(field?.name || "", 120),
      id: trimText(field?.id || "", 120),
      label: trimText(field?.label || "", 180),
      placeholder: trimText(field?.placeholder || "", 180),
      required: !!field?.required
    };

    const options = Array.isArray(field?.options) ? field.options : [];
    if (options.length) {
      base.options = options.slice(0, 20).map((opt) => ({
        label: trimText(opt?.label || "", 80),
        value: trimText(opt?.value || "", 80)
      }));
      if (options.length > 20) {
        base.optionsTruncated = options.length - 20;
      }
    }

    return base;
  }

  function sanitizeFieldsForPrompt(fields) {
    const list = Array.isArray(fields) ? fields : [];
    return list.slice(0, 120).map((f) => sanitizeFieldForPrompt(f));
  }

  async function postLegacyEndpoint(payload, settings) {
    const endpoint = settings?.llmEndpoint;
    if (!endpoint) return null;

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(settings?.llmApiKey ? { Authorization: `Bearer ${settings.llmApiKey}` } : {})
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      throw new Error(`Legacy LLM endpoint failed: ${resp.status}`);
    }

    return resp.json();
  }

  async function postByProvider(task, payload, settings) {
    if (settings?.llmEndpoint) {
      return postLegacyEndpoint({ task, ...payload }, settings);
    }

    const cfg = normalizeSettings(settings);
    if (!cfg.llmApiKey) {
      return null;
    }

    const prompt = makeTaskPrompt(task, payload);

    if (cfg.provider === "claude") {
      const resp = await fetch(`${cfg.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": cfg.llmApiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: cfg.model,
          max_tokens: 1800,
          system: prompt.system,
          messages: [{ role: "user", content: prompt.user }]
        })
      });

      if (!resp.ok) {
        throw new Error(`Claude request failed: ${resp.status}`);
      }

      const data = await resp.json();
      const parsed = tryParseJson(extractTextFromClaudeResponse(data));
      if (!parsed) throw new Error("Claude returned non-JSON content");
      return parsed;
    }

    if (cfg.provider === "gemini") {
      const resp = await fetch(`${cfg.baseUrl}/models/${encodeURIComponent(cfg.model)}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": cfg.llmApiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            role: "system",
            parts: [{ text: prompt.system }]
          },
          contents: [
            {
              role: "user",
              parts: [{ text: prompt.user }]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json"
          }
        })
      });

      if (!resp.ok) {
        throw new Error(`Gemini request failed: ${resp.status}`);
      }

      const data = await resp.json();
      const parsed = tryParseJson(extractTextFromGeminiResponse(data));
      if (!parsed) throw new Error("Gemini returned non-JSON content");
      return parsed;
    }

    const resp = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.llmApiKey}`
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user }
        ]
      })
    });

    if (!resp.ok) {
      throw new Error(`OpenAI-compatible request failed: ${resp.status}`);
    }

    const data = await resp.json();
    const parsed = tryParseJson(extractTextFromOpenAIResponse(data));
    if (!parsed) throw new Error("OpenAI-compatible model returned non-JSON content");
    return parsed;
  }

  async function parseResumeWithLLM(rawText, settings) {
    const data = await postByProvider("resume_parse", { text: rawText }, settings);
    return data?.profile || null;
  }

  async function mapFieldsWithLLM(fields, profileMarkdown, settings, preferredLanguage = "auto") {
    const safeFields = sanitizeFieldsForPrompt(fields);
    const data = await postByProvider(
      "form_map",
      { fields: safeFields, profileMarkdown, preferredLanguage },
      settings
    );
    if (!data) return null;
    return {
      fieldMap: data?.fieldMap || null,
      missingFields: Array.isArray(data?.missingFields) ? data.missingFields : []
    };
  }

  async function chatUpdateProfileMarkdown(userMessage, profileMarkdown, chatHistory, settings) {
    const data = await postByProvider(
      "profile_chat_update",
      { message: userMessage, profileMarkdown, chatHistory },
      settings
    );

    return {
      reply: data?.reply || "I updated your profile markdown.",
      updatedMarkdown: data?.updatedMarkdown || profileMarkdown
    };
  }

  async function startInterview(profileMarkdown, chatHistory, settings, preferredLanguage = "auto") {
    const coverageSnapshot = buildInterviewCoverageSnapshot(profileMarkdown);
    const data = await postByProvider(
      "interview_start",
      { profileMarkdown, chatHistory, coverageSnapshot, preferredLanguage },
      settings
    );
    return {
      reply: data?.reply || "Let's start with your most recent work. What did you build and why did it matter?",
      nextQuestion:
        data?.nextQuestion ||
        "Let's fill missing core sections first. What is one recent experience (company/lab/club/project) with timeline and outcome?"
    };
  }

  async function interviewUpdateProfileMarkdown(
    userMessage,
    profileMarkdown,
    chatHistory,
    settings,
    preferredLanguage = "auto"
  ) {
    const coverageSnapshot = buildInterviewCoverageSnapshot(profileMarkdown);
    const data = await postByProvider(
      "interview_turn",
      { message: userMessage, profileMarkdown, chatHistory, coverageSnapshot, preferredLanguage },
      settings
    );

    return {
      reply: data?.reply || "Captured. I updated your profile markdown.",
      updatedMarkdown: data?.updatedMarkdown || profileMarkdown,
      nextQuestion:
        data?.nextQuestion ||
        "What was your specific contribution, and how would you quantify its impact (time, revenue, quality, scale)?"
    };
  }

  async function applyResearchFindingsToProfile(profileMarkdown, findings, settings, preferredLanguage = "auto") {
    if (!Array.isArray(findings) || !findings.length) {
      return { updatedMarkdown: profileMarkdown, appliedFindings: [] };
    }
    const data = await postByProvider(
      "profile_research_enrich",
      { profileMarkdown, findings, preferredLanguage },
      settings
    );
    return {
      updatedMarkdown: data?.updatedMarkdown || profileMarkdown,
      appliedFindings: Array.isArray(data?.appliedFindings) ? data.appliedFindings : []
    };
  }

  function mapFieldsHeuristically(fields, profile) {
    const map = {};
    const safe = profile || {};

    for (const field of fields) {
      const key = `${field?.label || ""} ${field?.name || ""} ${field?.id || ""}`.toLowerCase();
      const hasAny = (tokens) => tokens.some((token) => key.includes(token));

      if (hasAny(["name", "full name", "姓名", "名字", "联系人"])) {
        map[field.selector] = safe.fullName || "";
        continue;
      }
      if (hasAny(["mail", "email", "邮箱", "电子邮件", "e-mail"])) {
        map[field.selector] = safe.email || "";
        continue;
      }
      if (hasAny(["phone", "mobile", "tel", "联系电话", "手机号", "手机", "电话"])) {
        map[field.selector] = safe.phone || "";
        continue;
      }
      if (hasAny(["skill", "skills", "技能", "擅长", "技术栈"])) {
        map[field.selector] = Array.isArray(safe.skills) ? safe.skills.join(", ") : "";
        continue;
      }
      if (hasAny(["school", "education", "university", "college", "学校", "学历", "教育", "毕业院校"])) {
        map[field.selector] = safe.education || "";
        continue;
      }
      if (hasAny(["experience", "summary", "about", "经历", "工作经验", "项目经验", "个人简介"])) {
        map[field.selector] = safe.experience || "";
        continue;
      }
      if (
        hasAny(["authorization", "sponsor", "visa", "work auth", "签证", "工作许可", "工作授权", "是否需要赞助"])
      ) {
        map[field.selector] = safe.workAuthorization || "";
        continue;
      }
      if (hasAny(["remote", "远程", "居家办公"])) {
        map[field.selector] = safe.openToRemote || "";
        continue;
      }
      if (hasAny(["city", "location", "城市", "地区", "意向城市"])) {
        map[field.selector] = safe.location || safe.city || "";
      }
    }

    return map;
  }

  global.ResumeLLM = {
    parseResumeWithLLM,
    mapFieldsWithLLM,
    chatUpdateProfileMarkdown,
    mapFieldsHeuristically,
    startInterview,
    interviewUpdateProfileMarkdown,
    applyResearchFindingsToProfile
  };
})(globalThis);
