// Reflection pilot: D01 only.
(() => {
  const storageKey = "emi-reflection-D01-v1";
  let answers = {};

  try {
    answers = JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    answers = {};
  }

  const prompts = [
    {
      name: "notice",
      label: "What have you noticed?",
      hint: "Describe something in students’ work, questions or participation that suggests difficulty with instructions."
    },
    {
      name: "current",
      label: "What do you currently do?",
      hint: "How well does your current approach work? What tells you this?"
    },
    {
      name: "plan",
      label: "How will you use the selected strategy?",
      hint: "Identify an upcoming lesson or task and explain what you will do."
    },
    {
      name: "evidence",
      label: "What will you look for?",
      hint: "Identify an observable sign that students understand the instructions."
    },
    {
      name: "outcome",
      label: "What happened?",
      hint: "After teaching, record what you noticed in students’ work, questions or feedback."
    },
    {
      name: "next",
      label: "What will you keep or change?",
      hint: "Decide what to continue, adjust or try next."
    }
  ];

  function addReflection() {
    const areaContent = document.getElementById("area-D01");

    if (!areaContent || areaContent.querySelector(".reflection")) return;

    const area = toolkit.find(item => item.id === "D01");
    if (!area) return;

    const reflection = document.createElement("details");
    reflection.className = "reflection";

    reflection.innerHTML = `
      <summary>Reflect on your teaching</summary>
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

        <h3>Before teaching</h3>
        <div data-before-fields></div>

        <label for="reflection-strategy">
          Which strategy will you try or adapt?
        </label>
        <select id="reflection-strategy" data-field="strategy">
          <option value="">Select a strategy</option>
        </select>

        <div data-plan-fields></div>

        <h3>After teaching</h3>
        <div data-after-fields></div>

        <div class="reflection-actions">
          <button type="button" data-print>
            Print / save as PDF
          </button>
          <button type="button" data-clear>
            Clear my reflection
          </button>
        </div>

        <p class="reflection-note" data-save-status role="status"></p>
      </div>
    `;

    const select = reflection.querySelector("select");

    area.strategies.forEach(strategy => {
      const option = document.createElement("option");
      option.value = strategy.id;
      option.textContent = `${strategy.id}: ${strategy.title}`;
      select.appendChild(option);
    });

    prompts.forEach((prompt, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "reflection-field";

      const label = document.createElement("label");
      label.htmlFor = `reflection-${prompt.name}`;
      label.textContent = prompt.label;

      const hint = document.createElement("p");
      hint.className = "reflection-note";
      hint.id = `reflection-hint-${prompt.name}`;
      hint.textContent = prompt.hint;

      const textarea = document.createElement("textarea");
      textarea.id = label.htmlFor;
      textarea.rows = 3;
      textarea.dataset.field = prompt.name;
      textarea.setAttribute("aria-describedby", hint.id);

      wrapper.append(label, hint, textarea);

      const target = index < 2
        ? "[data-before-fields]"
        : index < 4
          ? "[data-plan-fields]"
          : "[data-after-fields]";

      reflection.querySelector(target).appendChild(wrapper);
    });

    const fields = reflection.querySelectorAll("[data-field]");
    const status = reflection.querySelector("[data-save-status]");

    fields.forEach(field => {
      field.value = answers[field.dataset.field] || "";
    });

    function saveAnswers() {
      fields.forEach(field => {
        answers[field.dataset.field] = field.value;
      });

      try {
        localStorage.setItem(storageKey, JSON.stringify(answers));
        status.textContent = "Saved in this browser.";
      } catch {
        status.textContent =
          "Browser saving is unavailable. Print or save your reflection before leaving.";
      }
    }

    reflection.addEventListener("input", saveAnswers);
    reflection.addEventListener("change", saveAnswers);

    reflection.querySelector("[data-clear]").addEventListener("click", () => {
      if (!window.confirm("Clear your D01 reflection?")) return;

      answers = {};
      fields.forEach(field => {
        field.value = "";
      });

      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Clearing the visible fields still works.
      }

      status.textContent = "Reflection cleared.";
    });

    reflection.querySelector("[data-print]").addEventListener("click", () => {
      // Create a separate print view containing only this reflection.
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
          <title>D01 teaching reflection</title>
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
        <body>
          <h1>Inclusive EMI Guidance Toolkit</h1>
          <p>D01: Understanding task instructions — Teaching reflection</p>
        </body>
        </html>
      `);
      doc.close();

      const items = [
        ...prompts.slice(0, 2),
        { name: "strategy", label: "Selected strategy" },
        ...prompts.slice(2)
      ];

      items.forEach(item => {
        const section = doc.createElement("section");
        const heading = doc.createElement("h2");
        const response = doc.createElement("p");

        heading.textContent = item.label;
        response.textContent = item.name === "strategy"
          ? select.value
            ? select.options[select.selectedIndex].textContent
            : "Not selected."
          : answers[item.name] || "Not completed.";

        section.append(heading, response);
        doc.body.appendChild(section);
      });

      frame.contentWindow.focus();
      frame.contentWindow.print();

      // Allow time for the browser to finish using the print view.
      setTimeout(() => frame.remove(), 60000);
    });

    const backLink = areaContent.querySelector(".back-link");
    areaContent.insertBefore(reflection, backLink);
  }

  // Restore the reflection whenever search rebuilds the difficulty cards.
  const list = document.getElementById("difficulty-list");

  if (list) {
    const observer = new MutationObserver(addReflection);
    observer.observe(list, { childList: true });
    addReflection();
  }
})();
