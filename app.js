const difficultyList = document.getElementById("difficulty-list");
const searchInput = document.getElementById("search-input");
const resultsCount = document.getElementById("results-count");
const noResults = document.getElementById("no-results");

const detailPanel = document.getElementById("detail-panel");
const detailContent = document.getElementById("detail-content");
const closeDetails = document.getElementById("close-details");

const groups = [
  {
    title: "Understanding teaching and materials",
    ids: ["D01", "D02", "D03", "D04", "D05", "D09"]
  },
  {
    title: "Speaking and working with others",
    ids: ["D06", "D07", "D08", "D11", "D18", "D19"]
  },
  {
    title: "Assignments and feedback",
    ids: ["D10", "D12"]
  },
  {
    title: "Independent study and accessing support",
    ids: ["D13", "D14", "D15", "D16", "D17"]
  }
];

function renderDifficultyAreas(searchTerm = "") {
  const query = searchTerm.toLowerCase().trim();

  const matchingAreas = toolkit.filter(area => {
    const group = groups.find(item => item.ids.includes(area.id));

    const areaText = [
      group ? group.title : "",
      area.id,
      area.title,
      area.moduleTitle,
      area.description,
      ...(area.strategies || []).flatMap(strategy => [
        strategy.id,
        strategy.title,
        strategy.summary,
        strategy.example,
        (strategy.howTo || []).join(" ")
      ])
    ].join(" ").toLowerCase();

    return query === "" || areaText.includes(query);
  });

  difficultyList.innerHTML = "";

  resultsCount.textContent =
    `${matchingAreas.length} of ${toolkit.length} difficulty areas shown`;

  noResults.hidden = matchingAreas.length !== 0;

  groups.forEach(group => {
    const areas = group.ids
      .map(id => matchingAreas.find(area => area.id === id))
      .filter(Boolean);

    if (areas.length === 0) {
      return;
    }

    const groupSection = document.createElement("details");
    groupSection.className = "toolkit-group";
    groupSection.open = query !== "";

    const heading = document.createElement("summary");
    heading.className = "toolkit-group-heading";
    heading.textContent = `${group.title} (${areas.length})`;

    groupSection.appendChild(heading);

    const groupContent = document.createElement("div");
    groupContent.className = "toolkit-group-content";

    areas.forEach(area => {
      const card = document.createElement("article");
      card.className = "difficulty-card";

      card.innerHTML = `
        <button
          class="difficulty-button"
          type="button"
          aria-expanded="false"
          aria-controls="area-${area.id}"
        >
          <span>
            <span class="area-code">${area.id}</span>
            <strong>${area.title}</strong>
          </span>
          <span class="arrow" aria-hidden="true">›</span>
        </button>

        <div
          id="area-${area.id}"
          class="difficulty-content"
          hidden
        >
          <p>${area.description || ""}</p>
${area.practicalGuideUrl ? `
  <p>
    <a href="${area.practicalGuideUrl}"
       target="_blank"
       rel="noopener noreferrer">
      ${area.practicalGuide || "Download practical guide"}
    </a>
  </p>
` : ""}
          <p class="status">
            Status: ${area.status || "Draft"}
          </p>

          <div class="strategy-list">
            ${(area.strategies || []).map(strategy => `
              <button
                class="strategy-button"
                type="button"
                data-area-id="${area.id}"
                data-strategy-id="${strategy.id}"
              >
                <span class="strategy-code">${strategy.id}</span>
                <span>
                  <strong>${strategy.title}</strong>
                  <small>${strategy.summary || ""}</small>
                </span>
                <span aria-hidden="true">›</span>
              </button>
             `).join("")}
          </div>

          <p class="back-link">
            <a href="#areas-heading">↑ Back to teaching areas</a>
          </p>
        </div>
      `;

      const areaButton = card.querySelector(".difficulty-button");
      const areaContent = card.querySelector(".difficulty-content");

      areaButton.addEventListener("click", () => {
        const isOpen = !areaContent.hidden;

        areaContent.hidden = isOpen;
        areaButton.setAttribute("aria-expanded", String(!isOpen));
      });

      card.querySelectorAll(".strategy-button").forEach(button => {
        button.addEventListener("click", () => {
          showStrategy(
            button.dataset.areaId,
            button.dataset.strategyId
          );
        });
      });

      groupContent.appendChild(card);
    });

    groupSection.appendChild(groupContent);
    difficultyList.appendChild(groupSection);
  });
}

function showStrategy(areaId, strategyId) {
  const area = toolkit.find(item => item.id === areaId);

  if (!area) {
    return;
  }

  const strategy = (area.strategies || []).find(
    item => item.id === strategyId
  );

  if (!strategy) {
    return;
  }

  const sourceHTML = (strategy.sources || []).map(source => {
  // Keeps existing sources working until they are reformatted.
  if (!source.title) {
    return `
      <li>
        ${source.url
          ? `<a href="${source.url}"
                target="_blank"
                rel="noopener noreferrer">${source.text}</a>`
          : source.text}
      </li>
    `;
  }

  const titleHTML = source.url
    ? `<a href="${source.url}"
          target="_blank"
          rel="noopener noreferrer"><em>${source.title}</em></a>`
    : `<em>${source.title}</em>`;

  return `
    <li>
      ${source.author} (${source.year || "n.d."}).
      ${titleHTML}.
      ${source.locator
        ? `<span class="source-locator">${source.locator}</span>`
        : ""}
    </li>
  `;
}).join("");
  detailContent.innerHTML = `
    <p class="area-code">${strategy.id}</p>

    <h2>${strategy.title}</h2>

    <p class="detail-area">
      Difficulty area: <strong>${area.title}</strong>
    </p>

    <h3>How to do it</h3>

    <ul>
      ${(strategy.howTo || [])
        .map(item => `<li>${item}</li>`)
        .join("")}
    </ul>

    <h3>Subject example</h3>

    <div class="example-box">
      <p>${strategy.example || "No example provided yet."}</p>
    </div>
${area.practicalGuideUrl ? `
  <h3>Practical guide</h3>
  <p>
    <a href="${area.practicalGuideUrl}"
       target="_blank"
       rel="noopener noreferrer">
      ${area.practicalGuide || "Download practical guide"}
    </a>
  </p>
` : ""}
    <h3>Supporting sources</h3>

    <ul class="sources">
      ${sourceHTML || "<li>Source details to be confirmed.</li>"}
    </ul>

    <h3>Review information</h3>

    <p>
      ${strategy.reviewNotes || "No review notes provided."}
    </p>

    <p class="back-link">
      <a href="#areas-heading">↑ Back to teaching areas</a>
    </p>
  `;

  detailPanel.hidden = false;

  detailPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

searchInput.addEventListener("input", event => {
  renderDifficultyAreas(event.target.value);
});

closeDetails.addEventListener("click", () => {
  detailPanel.hidden = true;
  detailContent.innerHTML = "";
});

renderDifficultyAreas();
