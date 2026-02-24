(function initContentScript() {
  function reportProgress(step, message, extra = {}) {
    chrome.runtime.sendMessage({
      type: "AUTOFILL_PROGRESS",
      payload: {
        step,
        message,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        ...extra
      }
    });
  }

  function getLabelTextForInput(input) {
    if (!input) return "";

    const aria = input.getAttribute("aria-label");
    if (aria) return aria.trim();

    const id = input.id;
    if (id) {
      const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
      if (label?.textContent) return label.textContent.trim();
    }

    const parentLabel = input.closest("label");
    if (parentLabel?.textContent) return parentLabel.textContent.trim();

    const placeholder = input.getAttribute("placeholder");
    if (placeholder) return placeholder.trim();

    return "";
  }

  function buildUniqueSelector(el) {
    if (el.id) return `#${CSS.escape(el.id)}`;

    const name = el.getAttribute("name");
    if (name) {
      const candidate = `${el.tagName.toLowerCase()}[name="${CSS.escape(name)}"]`;
      if (document.querySelectorAll(candidate).length === 1) return candidate;
    }

    const dataAuto = el.getAttribute("data-testid") || el.getAttribute("data-qa");
    if (dataAuto) {
      const candidate = `${el.tagName.toLowerCase()}[data-testid="${CSS.escape(dataAuto)}"]`;
      if (document.querySelectorAll(candidate).length === 1) return candidate;
    }

    const all = Array.from(document.querySelectorAll(el.tagName));
    const index = all.indexOf(el);
    return `${el.tagName.toLowerCase()}:nth-of-type(${index + 1})`;
  }

  function isElementVisible(el) {
    if (!el || !el.isConnected) return false;
    if (el.closest("[hidden]")) return false;
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function collectFormFields() {
    function extractOptions(node) {
      if (!node) return [];

      if (node.tagName === "SELECT") {
        return Array.from(node.options || [])
          .slice(0, 20)
          .map((opt) => ({
            label: (opt.textContent || "").trim(),
            value: opt.value || ""
          }))
          .filter((opt) => opt.label || opt.value);
      }

      if (node.type === "radio") {
        const groupName = node.name || "";
        if (!groupName) return [];
        const radios = Array.from(document.querySelectorAll(`input[type="radio"][name="${CSS.escape(groupName)}"]`));
        return radios
          .slice(0, 20)
          .map((radio) => ({
            label: getLabelTextForInput(radio),
            value: radio.value || ""
          }))
          .filter((opt) => opt.label || opt.value);
      }

      return [];
    }

    const nodes = Array.from(
      document.querySelectorAll("input:not([type='hidden']):not([type='submit']), textarea, select")
    );

    return nodes
      .filter((node) => isElementVisible(node) && !node.disabled && !node.readOnly)
      .map((node) => ({
        tag: node.tagName.toLowerCase(),
        type: node.type || "",
        name: node.name || "",
        id: node.id || "",
        label: getLabelTextForInput(node),
        placeholder: node.getAttribute("placeholder") || "",
        required: !!node.required,
        options: extractOptions(node),
        selector: buildUniqueSelector(node)
      }));
  }

  function setNativeValue(el, value) {
    if (!el) return;

    if (el.tagName === "SELECT") {
      const options = Array.from(el.options);
      const matched = options.find((opt) => (opt.textContent || "").trim() === value || opt.value === value);
      if (matched) {
        el.value = matched.value;
      }
    } else if (el.type === "checkbox" || el.type === "radio") {
      if (value === true || value === "true" || value === "yes") {
        el.checked = true;
      }
    } else {
      el.value = value;
    }

    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function detectNextStepElement() {
    const candidates = Array.from(
      document.querySelectorAll("button, input[type='button'], input[type='submit'], a[role='button']")
    );
    const patterns = ["next", "continue", "下一步", "继续", "保存并继续"];
    for (const el of candidates) {
      if (!isElementVisible(el)) continue;
      if (el.disabled) continue;
      const text = (el.innerText || el.value || "").trim().toLowerCase();
      if (!text) continue;
      if (patterns.some((p) => text.includes(p))) {
        return { element: el, text };
      }
    }
    return null;
  }

  async function autofillCurrentStep(stepIndex, fillLanguage = "auto") {
    reportProgress("start", `Starting autofill for step ${stepIndex}...`);

    const fields = collectFormFields();
    reportProgress("collect_fields", `Step ${stepIndex}: collected ${fields.length} visible fields.`, {
      fieldCount: fields.length,
      stepIndex
    });

    if (!fields.length) {
      reportProgress("error", `Step ${stepIndex}: no fillable fields found.`);
      throw new Error("No fillable fields found on this page.");
    }

    reportProgress("map_request", `Step ${stepIndex}: requesting field mapping...`);
    const response = await chrome.runtime.sendMessage({
      type: "MAP_FORM_FIELDS",
      payload: {
        fields,
        url: window.location.href,
        fillLanguage
      }
    });

    if (!response?.ok) {
      reportProgress("error", response?.error || "Field mapping failed.");
      throw new Error(response?.error || "Failed to map fields.");
    }

    const fieldMap = response.fieldMap || {};
    const unresolvedFields = Array.isArray(response.unresolvedFields) ? response.unresolvedFields : [];
    reportProgress("map_done", `Step ${stepIndex}: received mapping for ${Object.keys(fieldMap).length} fields.`, {
      mappedCount: Object.keys(fieldMap).length,
      unresolvedCount: unresolvedFields.length,
      stepIndex
    });
    let count = 0;

    Object.entries(fieldMap).forEach(([selector, value]) => {
      if (value === undefined || value === null || value === "") return;
      const el = document.querySelector(selector);
      if (!el) return;
      setNativeValue(el, value);
      count += 1;
    });
    reportProgress("fill_done", `Step ${stepIndex}: filled ${count} fields.`, { filledCount: count, stepIndex });

    if (unresolvedFields.length) {
      reportProgress("needs_input", `Step ${stepIndex}: ${unresolvedFields.length} fields still need user input.`, {
        unresolvedFields,
        stepIndex
      });
    }

    return {
      count,
      unresolvedFields
    };
  }

  async function waitForNextStepRender() {
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  async function autofillPage(options = {}) {
    const notify = options.notify !== false;
    const autoMultiPage = !!options.autoMultiPage;
    const maxAutoPages = Math.max(1, Math.min(10, Number(options.maxAutoPages) || 3));
    const fillLanguage = String(options.fillLanguage || "auto");

    let totalCount = 0;
    let pageIndex = 1;
    let nextStepHint = "";
    const unresolvedMap = new Map();

    while (pageIndex <= maxAutoPages) {
      const stepResult = await autofillCurrentStep(pageIndex, fillLanguage);
      totalCount += stepResult.count;

      for (const item of stepResult.unresolvedFields || []) {
        unresolvedMap.set(item.selector, item);
      }

      const nextStep = detectNextStepElement();
      nextStepHint = nextStep?.text || "";

      if (!autoMultiPage) {
        if (nextStepHint) {
          reportProgress("next_step_hint", `Detected possible next-step button: "${nextStepHint}".`);
        }
        break;
      }

      if (!nextStep) {
        reportProgress("multi_done", "No next-step button detected. Multi-page autofill finished.");
        break;
      }

      if (pageIndex >= maxAutoPages) {
        reportProgress("multi_done", `Reached max pages limit (${maxAutoPages}).`);
        break;
      }

      reportProgress("next_step_click", `Clicking next-step button: "${nextStep.text}".`, { stepIndex: pageIndex });
      nextStep.element.click();
      await waitForNextStepRender();
      pageIndex += 1;
    }

    if (notify) {
      alert(`AutoFill complete: ${totalCount} fields updated.`);
    }

    return {
      count: totalCount,
      unresolvedFields: Array.from(unresolvedMap.values()),
      nextStepHint,
      pagesProcessed: pageIndex
    };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "TRIGGER_AUTOFILL_FROM_POPUP") return;

    autofillPage({
      notify: false,
      fillLanguage: String(message?.payload?.fillLanguage || "auto"),
      autoMultiPage: !!message?.payload?.autoMultiPage,
      maxAutoPages: Number(message?.payload?.maxAutoPages) || 3
    })
      .then((result) =>
        sendResponse({
          ok: true,
          count: result.count,
          unresolvedFields: result.unresolvedFields || [],
          nextStepHint: result.nextStepHint || "",
          pagesProcessed: result.pagesProcessed || 1
        })
      )
      .catch((err) => sendResponse({ ok: false, error: err?.message || "Autofill failed" }));

    return true;
  });
})();
