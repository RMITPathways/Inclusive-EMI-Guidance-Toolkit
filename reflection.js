// Three-part teaching reflection for every difficulty area.
(() => {
  function loadAnswers(storageKey) {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));

      return saved && typeof saved === "object" && !Array.isArray(saved)
        ? saved
        : {};
    } catch {
      return {};
    }
  }

  function printReflection(area, prompts, answers) {
    const frame = document.createElement("iframe");
    frame.title = "Reflection print view";
    frame.style.cssText =
      "position:fixed;width:1px;height:1px;left:-9999px;border:0;";

    document.body.appendChild(frame);

    const doc = frame.contentDocument;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Teaching reflection</title>
        <style>
          body {
            font: 12pt Arial, sans-serif;
            line-height: 1.5;
            margin: 2cm;
            color: #000054;
          }
          h1 { font-size: 20pt; }
          h2 { font-size: 13pt; margin-bottom: 0.3rem; }
          p { white-space: pre-wrap; color: #203040; }
          section { break-inside: avoid; }
        </style>
      </head>
      <body></body>
      </html>
    `);
    doc.close();

    doc.title = `${area.id} teaching reflection`;

    const title = doc.createElement("h1");
    title.textContent = "Inclusive EMI Guidance Toolkit";

    const subtitle = doc.createElement("p");
    subtitle.textContent =
      `${area.id}: ${area.title} — Teaching reflection`;

    doc.body.append(title, subtitle);

    prompts.forEach(prompt => {
      const section = doc.createElement("section");
      const heading = doc.createElement("h2");
      const response = doc.createElement("p");

      heading.textContent = prompt.label;
      response.textContent = answers[prompt.name] || "Not completed.";

      section.append(heading, response);
      doc.body.appendChild(section);
    });

    frame.contentWindow.focus();
    frame.contentWindow.print();

    setTimeout(() => frame.remove(), 60000);
  }

  function addAreaReflection(area, areaContent) {
    if (areaContent.querySelector(".reflection")) return;

    const storageKey = `emi-reflection-${area.id}-v1`;
    let answers = loadAnswers(storageKey);

    const prompts = [
      {
        name: "before",
        label: "1. Before: Review your current practice",
        hint:
          `Thinking about “${area.title}”, what have you noticed ` +
          "about your students’ experiences or difficulties? " +
          "What do you currently do to support them, and how well does it work?"
      },
      {
        name: "plan",
        label: "2. Plan: Choose something to try",
        hint:
          `Which strategy from “${area.title}” will you try or adapt? ` +
          "How will you use it in an upcoming lesson? " +
          "What will you look for to see whether it helps?"
      },
      {
        name: "after",
        label: "3. After: Observe and reflect",
        hint:
          "What happened? What did students’ work, questions or " +
          "participation show you? What will you keep or change next time?"
      }
    ];

    const reflection = document.createElement("details");
    reflection.className = "reflection";

    reflection.innerHTML = `
      <summary>
        Reflect on your teaching — plan, try and review
      </summary>

      <div class="reflection-body">
        <p>
          Choose one strategy to try, then return after teaching
          to reflect on what happened.
        </p>

        <p class="reflection-note">
          Entries are saved only in this browser on this device.
          They are not submitted to RMIT or MOET.
          Clearing browser data may remove them.
          Avoid including students’ names or identifying details.
        </p>

        <div data-reflection-fields></div>

        <div class="reflection-actions">
          <button type="button" data-print>
            Print / save as PDF
          </button>

          <button type="button" data-clear>
            Clear my reflection
          </button>
        </div>

        <p
          class="reflection-note"
          data-save-status
          role="status"
        ></p>
      </div>
    `;

    prompts.forEach(prompt => {
      const wrapper = document.createElement("div");
      wrapper.className = "reflection-field";

      const label = document.createElement("label");
      label.htmlFor = `reflection-${area.id}-${prompt.name}`;
      label.textContent = prompt.label;

      const hint = document.createElement("p");
      hint.className = "reflection-note";
      hint.id = `reflection-hint-${area.id}-${prompt.name}`;
      hint.textContent = prompt.hint;

      const textarea = document.createElement("textarea");
      textarea.id = label.htmlFor;
      textarea.rows = 3;
      textarea.dataset.field = prompt.name;
      textarea.setAttribute("aria-describedby", hint.id);
      textarea.value = answers[prompt.name] || "";

      wrapper.append(label, hint, textarea);

      reflection
        .querySelector("[data-reflection-fields]")
        .appendChild(wrapper);
    });

    const fields = reflection.querySelectorAll("[data-field]");
    const status = reflection.querySelector("[data-save-status]");

    function collectAnswers() {
      fields.forEach(field => {
        answers[field.dataset.field] = field.value;
      });
    }

    function saveAnswers() {
      collectAnswers();

      try {
        localStorage.setItem(storageKey, JSON.stringify(answers));
        status.textContent = "Saved in this browser.";
      } catch {
        status.textContent =
          "Browser saving is unavailable. Print or save your reflection before leaving.";
      }
    }

    reflection.addEventListener("input", saveAnswers);

    reflection.querySelector("[data-clear]").addEventListener("click", () => {
      if (!window.confirm(`Clear your ${area.id} reflection?`)) return;

      answers = {};

      fields.forEach(field => {
        field.value = "";
      });

      try {
        localStorage.removeItem(storageKey);
        status.textContent = "Reflection cleared.";
      } catch {
        status.textContent =
          "Visible entries cleared, but browser storage could not be updated.";
      }
    });

    reflection.querySelector("[data-print]").addEventListener("click", () => {
      collectAnswers();
      printReflection(area, prompts, answers);
    });

    const backLink = areaContent.querySelector(".back-link");
    areaContent.insertBefore(reflection, backLink);
  }

  function addReflections() {
    toolkit.forEach(area => {
      const areaContent = document.getElementById(`area-${area.id}`);

      if (areaContent) {
        addAreaReflection(area, areaContent);
      }
    });
  }

  const list = document.getElementById("difficulty-list");

  if (list) {
    const observer = new MutationObserver(addReflections);
    observer.observe(list, { childList: true });
    addReflections();
  }
})();
