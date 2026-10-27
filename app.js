const difficultyList = document.getElementById("difficulty-list");
const searchInput = document.getElementById("search-input");
const resultsCount = document.getElementById("results-count");
const noResults = document.getElementById("no-results");

const detailPanel = document.getElementById("detail-panel");
const detailContent = document.getElementById("detail-content");
const closeDetails = document.getElementById("close-details");

function renderDifficultyAreas(searchTerm = "") {
  const query = searchTerm.toLowerCase().trim();

  const matchingAreas = toolkit.filter(area => {
    const areaText = [
      area.id,
      area.title,
      area.moduleTitle,
      area.description,
      ...area.strategies.flatMap(strategy => [
        strategy.id,
        strategy.title,
        strategy.summary,
        strategy.example,
        strategy.howTo.join(" "),
        strategy.reviewNotes
      ])
    ]
      .join(" ")
      .toLowerCase();

    return query === "" || areaText.includes(query);
  });

  difficultyList.innerHTML = "";

  resultsCount.textContent =
    `${matchingAreas.length} of ${toolkit.length} difficulty areas shown`;

  noResults.hidden = matchingAreas.length !== 0;

  matchingAreas.forEach(area => {
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
        <p>${area.description}</p>

        <p class="status">
          Status: ${area.status || "Draft"}
        </p>

        <div class="strategy-list">
          ${area.strategies.map(strategy => `
            <button
              class="strategy-button"
              type="button"
              data-area-id="${area.id}"
              data-strategy-id="${strategy.id}"
            >
              <span class="strategy-code">${strategy.id}</span>
              <span>
                <strong>${strategy.title}</strong>
                <small>${strategy.summary}</small>
              </span>
              <span aria-hidden="true">›</span>
            </button>
          `).join("")}
        </div>
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

    difficultyList.appendChild(card);
  });
}

function matchingAreasIncludes(matchingAreas, query) {
  return query === "" || matchingAreas.includes(query);
}

function showStrategy(areaId, strategyId) {
  const area = toolkit.find(item => item.id === areaId);

  if (!area) {
    return;
  }

  const strategy = area.strategies.find(
    item => item.id === strategyId
  );

  if (!strategy) {
    return;
  }

  const sourceHTML = (strategy.sources || []).map(source => {
    if (source.url) {
      return `
        <li>
          <a
            href="${source.url}"
            target="_blank"
            rel="noopener noreferrer"
          >
            ${source.text}
          </a>
        </li>
      `;
    }

    return `<li>${source.text}</li>`;
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

    <h3>Supporting sources</h3>

    <ul class="sources">
      ${sourceHTML || "<li>Source details to be confirmed.</li>"}
    </ul>

    <h3>Review information</h3>

    <p>
      ${strategy.reviewNotes || "No review notes provided."}
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
