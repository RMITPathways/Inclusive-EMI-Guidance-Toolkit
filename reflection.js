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
    name: "before",
    label: "1. Before: Review your current practice",
    hint: "What have you noticed about students’ understanding of task instructions? What do you currently do to support them, and how well does it work?"
  },
  {
    name: "plan",
    label: "2. Plan: Choose something to try",
    hint: "Which strategy for helping students understand task instructions will you try or adapt? How will you use it in an upcoming lesson? What will you look for to see whether it helps?"
  },
  {
    name: "after",
    label: "3. After: Observe and reflect",
    hint: "What happened? What did students’ work, questions or participation show you? What will you keep or change next time?"
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
      <summary>Reflect on your teaching — plan, try and review</summary>
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

        <p class="reflection-note" data-save-status role="status"></p>
      </div>
    `;

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

reflection.querySelector("[data-reflection-fields]").appendChild(wrapper);
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

const items = prompts;
      items.forEach(item => {
        const section = doc.createElement("section");
        const heading = doc.createElement("h2");
        const response = doc.createElement("p");

        heading.textContent = item.label;
      response.textContent = answers[item.name] || "Not completed.";

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
