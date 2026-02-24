(function initParser(global) {
  function normalizeText(input) {
    return (input || "").replace(/\r/g, "").trim();
  }

  function pickEmail(text) {
    const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    return m ? m[0] : "";
  }

  function pickPhone(text) {
    const m = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
    return m ? m[0].trim() : "";
  }

  function pickName(text) {
    const firstLine = text.split("\n").map((l) => l.trim()).find(Boolean) || "";
    if (firstLine.length > 1 && firstLine.length < 80) {
      return firstLine;
    }
    return "";
  }

  function pickSection(markdown, names) {
    const lines = markdown.split("\n");
    let active = false;
    const out = [];

    for (const line of lines) {
      const heading = line.match(/^#{1,4}\s+(.+)$/);
      if (heading) {
        const normalized = heading[1].trim().toLowerCase();
        active = names.some((n) => normalized.includes(n));
        continue;
      }
      if (active && line.trim()) out.push(line.trim());
    }

    return out.join("\n");
  }

  function pickYesNo(text, patterns) {
    const lines = text.split("\n");
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      const normalized = line.toLowerCase();
      if (!patterns.some((p) => normalized.includes(p))) continue;
      if (/(yes|y|true|可以|是|有)/i.test(normalized)) return "Yes";
      if (/(no|n|false|不|否|无)/i.test(normalized)) return "No";
    }
    return "";
  }

  function parseProfileMarkdown(markdown) {
    const text = normalizeText(markdown);
    const skillsSection = pickSection(text, ["skills", "技术", "技能"]);
    const skills = skillsSection
      .split(/\n|,|\||;/)
      .map((s) => s.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 30);

    return {
      fullName: pickName(text),
      email: pickEmail(text),
      phone: pickPhone(text),
      education: pickSection(text, ["education", "学历", "教育"]),
      skills,
      experience: pickSection(text, ["experience", "经历", "工作", "项目"]),
      workAuthorization: pickYesNo(text, ["work authorization", "work auth", "sponsorship", "visa", "工签"]),
      openToRemote: pickYesNo(text, ["open to remote", "remote", "远程"]),
      rawText: text,
      parsedAt: new Date().toISOString()
    };
  }

  function parseResumeText(rawText) {
    return parseProfileMarkdown(rawText);
  }

  global.ResumeParser = {
    parseResumeText,
    parseProfileMarkdown
  };
})(globalThis);
