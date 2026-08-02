(() => {
  const searchInput = document.getElementById("search-input");
  const classFilter = document.getElementById("class-filter");
  const resultsList = document.getElementById("results-list");
  const selectedList = document.getElementById("selected-list");
  const generateBtn = document.getElementById("generate-btn");
  const generateError = document.getElementById("generate-error");
  const consultationSection = document.getElementById("consultation-section");
  const consultationOutput = document.getElementById("consultation-output");
  const printBtn = document.getElementById("print-btn");
  const loadingBanner = document.getElementById("loading-banner");

  const selected = new Map();

  function otcBadge(otcOrRx) {
    const v = (otcOrRx || "").toLowerCase();
    let cls = "rx", label = "Rx";
    if (v === "otc" || v.startsWith("otc (")) { cls = "otc"; label = "OTC"; }
    else if (v.includes("/")) { cls = "mixed"; label = otcOrRx; }
    let extra = "";
    if (v.includes("controlled")) {
      extra = `<span class="badge controlled">Controlled</span>`;
    }
    return `<span class="badge ${cls}">${label}</span>${extra}`;
  }

  function renderResults(results) {
    resultsList.innerHTML = "";
    if (results.length === 0) {
      resultsList.innerHTML = `<li class="empty-hint">No matching drugs found.</li>`;
      return;
    }
    for (const d of results) {
      const li = document.createElement("li");
      const isChecked = selected.has(d.id);
      const brandStr = d.brand_names && d.brand_names.length ? ` (${d.brand_names.join(", ")})` : "";
      li.innerHTML = `
        <input type="checkbox" data-id="${d.id}" ${isChecked ? "checked" : ""}>
        <div>
          <div class="result-name">${escapeHtml(d.generic_name)}${escapeHtml(brandStr)} ${otcBadge(d.otc_or_rx)}</div>
          <div class="result-meta">${escapeHtml(d.drug_class)}</div>
          <div class="result-meta">${escapeHtml(d.description)}</div>
        </div>
      `;
      const checkbox = li.querySelector("input");
      const toggle = () => {
        checkbox.checked = !checkbox.checked;
        applyToggle(d, checkbox.checked);
      };
      checkbox.addEventListener("click", (e) => {
        e.stopPropagation();
        applyToggle(d, checkbox.checked);
      });
      li.addEventListener("click", (e) => {
        if (e.target !== checkbox) toggle();
      });
      resultsList.appendChild(li);
    }
  }

  function applyToggle(d, isSelected) {
    if (isSelected) selected.set(d.id, d);
    else selected.delete(d.id);
    renderSelected();
  }

  function renderSelected() {
    selectedList.innerHTML = "";
    if (selected.size === 0) {
      selectedList.innerHTML = `<li class="empty-hint">No drugs selected yet.</li>`;
      generateBtn.disabled = true;
      return;
    }
    generateBtn.disabled = false;
    for (const d of selected.values()) {
      const li = document.createElement("li");
      const brandStr = d.brand_names && d.brand_names.length ? ` (${d.brand_names.join(", ")})` : "";
      li.innerHTML = `<span>${escapeHtml(d.generic_name)}${escapeHtml(brandStr)} ${otcBadge(d.otc_or_rx)}</span>
        <button class="remove-btn" data-id="${d.id}" title="Remove">✕</button>`;
      li.querySelector(".remove-btn").addEventListener("click", () => {
        selected.delete(d.id);
        renderSelected();
        const cb = resultsList.querySelector(`input[data-id="${d.id}"]`);
        if (cb) cb.checked = false;
      });
      selectedList.appendChild(li);
    }
  }

  function runSearch() {
    const q = searchInput.value;
    const cls = classFilter.value;
    const results = window.PharmacyData.searchDrugs(q, cls, 50);
    renderResults(results);
  }

  let searchTimer = null;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(runSearch, 120);
  });
  classFilter.addEventListener("change", runSearch);

  function sevClass(sev) {
    return "sev-" + sev.toLowerCase();
  }

  function renderList(items) {
    if (!items || items.length === 0) return "";
    return `<ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : str;
    return div.innerHTML;
  }

  function renderDrugConsultation(d) {
    const brandStr = d.brand_names && d.brand_names.length ? ` (${d.brand_names.join(", ")})` : "";
    const sectionsByNumber = {};
    for (const s of d.sections) sectionsByNumber[s.number] = s;

    const s1 = sectionsByNumber[1].content;
    const s2 = sectionsByNumber[2].content;
    const s3 = sectionsByNumber[3].content;
    const s4 = sectionsByNumber[4].content;
    const s5 = sectionsByNumber[5].content;
    const s6 = sectionsByNumber[6].content;
    const s7 = sectionsByNumber[7].content;

    return `
      <div class="drug-consult">
        <h3>${escapeHtml(d.generic_name)}${escapeHtml(brandStr)} ${otcBadge(d.otc_or_rx)}</h3>

        <div class="ccr-section">
          <h4>1. Name &amp; description</h4>
          <p><strong>${escapeHtml(s1.drug_class)}.</strong> ${escapeHtml(s1.description)}</p>
        </div>

        <div class="ccr-section">
          <h4>2. Route, dosage form, dosage &amp; duration</h4>
          <p><strong>Route:</strong> ${escapeHtml(s2.route)}<br>
          <strong>Dosage form(s):</strong> ${escapeHtml(s2.dosage_forms.join(", "))}<br>
          <strong>Dosage:</strong> ${escapeHtml(s2.dosage)}<br>
          <strong>Duration:</strong> ${escapeHtml(s2.duration)}</p>
        </div>

        <div class="ccr-section">
          <h4>3. Directions for use &amp; storage</h4>
          ${renderList(s3.directions)}
          <p><strong>Storage:</strong> ${escapeHtml(s3.storage)}</p>
        </div>

        <div class="ccr-section">
          <h4>4. Precautions &amp; warnings</h4>
          <p><strong>Contraindications:</strong></p>
          ${renderList(s4.contraindications)}
          <p><strong>Serious side effects — seek care if these occur:</strong></p>
          ${renderList(s4.severe_side_effects_to_avoid)}
          <p><strong>Common side effects:</strong></p>
          ${renderList(s4.common_side_effects)}
          <p><strong>Known interactions, incl. OTC/nonprescription products:</strong></p>
          ${renderList(s4.otc_and_other_interactions)}
          <p><strong>If these occur, the patient should:</strong></p>
          ${renderList(s4.action_if_occur)}
        </div>

        <div class="ccr-section">
          <h4>5. Self-monitoring techniques</h4>
          ${renderList(s5.self_monitoring)}
        </div>

        <div class="ccr-section">
          <h4>6. Refill information</h4>
          <p>${escapeHtml(s6.refill_information)}</p>
        </div>

        <div class="ccr-section">
          <h4>7. Missed dose instructions</h4>
          <p>${escapeHtml(s7.missed_dose)}</p>
        </div>
      </div>
    `;
  }

  function renderInteractions(interactions) {
    let body;
    if (interactions.length === 0) {
      body = `<p class="no-interactions">No known interactions were found among the selected medications in this reference database.</p>`;
    } else {
      body = interactions
        .map((i) => `
          <div class="interaction-card ${sevClass(i.severity)}">
            <p><span class="sev-label ${sevClass(i.severity)}">${escapeHtml(i.severity)}</span>
              ${i.otc_related ? '<span class="otc-tag">Involves OTC</span>' : ""}
              — <strong>${escapeHtml(i.drug_a)} + ${escapeHtml(i.drug_b)}</strong></p>
            <p><strong>Mechanism:</strong> ${escapeHtml(i.mechanism)}</p>
            <p><strong>Clinical effect:</strong> ${escapeHtml(i.clinical_effect)}</p>
            <p><strong>Management:</strong> ${escapeHtml(i.management)}</p>
          </div>
        `)
        .join("");
    }
    return `
      <div class="interactions-block">
        <h3>Interactions among selected medications</h3>
        ${body}
      </div>
    `;
  }

  generateBtn.addEventListener("click", () => {
    generateError.hidden = true;
    const ids = Array.from(selected.keys());
    try {
      const data = window.PharmacyData.buildConsultation(ids);
      let html = renderInteractions(data.interactions);
      html += data.drugs.map(renderDrugConsultation).join("");
      consultationOutput.innerHTML = html;
      consultationSection.hidden = false;
      consultationSection.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      generateError.textContent = "Failed to generate consultation: " + err.message;
      generateError.hidden = false;
    }
  });

  printBtn.addEventListener("click", () => window.print());

  async function init() {
    await window.PharmacyData.loadData();
    for (const c of window.PharmacyData.getAllDrugClasses()) {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      classFilter.appendChild(opt);
    }
    if (loadingBanner) loadingBanner.hidden = true;
    runSearch();
  }

  init();
})();
