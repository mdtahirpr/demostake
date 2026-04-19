// ── PROPERTY CARD HTML ──
function propCardHTML(p) {
  const funded = p.funded;
  const val = p.totalValue.toLocaleString();
  return `
    <div class="prop-card" onclick="location.href='property-detail.html?id=${p.id}'">
      <div class="prop-thumb" style="background:${p.gradient}">
        <span class="prop-emoji">${p.emoji}</span>
        <div class="prop-tags">
          <span class="badge ${p.badgeClass}">${p.region}</span>
          <span class="badge dark">${funded}% funded</span>
        </div>
      </div>
      <div class="prop-body">
        <p class="prop-name">${p.name}</p>
        <p class="prop-loc">${p.location} · ${p.type}</p>
        <div class="prog-bg sm"><div class="prog-fill" style="width:${funded}%;background:${funded > 80 ? '#1a9e72' : '#378add'}"></div></div>
        <div class="prop-meta">
          <div class="prop-meta-item">
            <p class="meta-lbl">Annual return</p>
            <p class="meta-val green">${p.annualReturn}%</p>
          </div>
          <div class="prop-meta-item center">
            <p class="meta-lbl">Min. invest</p>
            <p class="meta-val">${p.currency} ${p.minInvest.toLocaleString()}</p>
          </div>
          <div class="prop-meta-item right">
            <p class="meta-lbl">Total value</p>
            <p class="meta-val">${p.currency} ${val}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── RENDER HOME FEATURED (first 3) ──
function renderFeaturedProps() {
  const el = document.getElementById('featured-props');
  if (!el) return;
  el.innerHTML = properties.slice(0, 3).map(propCardHTML).join('');
}

// ── RENDER ALL PROPS (properties page) ──
let currentList = [...properties];

function renderAllProps() {
  const el = document.getElementById('props-grid');
  if (!el) return;
  el.innerHTML = currentList.map(propCardHTML).join('');
  const count = document.getElementById('results-count');
  if (count) count.textContent = `Showing ${currentList.length} ${currentList.length === 1 ? 'property' : 'properties'}`;
}

function filterProps(filter, btn) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  if (filter === 'all') {
    currentList = [...properties];
  } else {
    currentList = properties.filter(p => p.market === filter || p.category === filter);
  }
  renderAllProps();
}

function sortProps(val) {
  if (val === 'return-high') currentList.sort((a, b) => b.annualReturn - a.annualReturn);
  else if (val === 'return-low') currentList.sort((a, b) => a.annualReturn - b.annualReturn);
  else if (val === 'funded-high') currentList.sort((a, b) => b.funded - a.funded);
  else if (val === 'min-low') currentList.sort((a, b) => a.minInvest - b.minInvest);
  else currentList = [...properties];
  renderAllProps();
}

// ── PROPERTY DETAIL PAGE ──
function loadDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id')) || 0;
  const p = properties[id];
  if (!p) return;

  // Hero
  const hero = document.getElementById('detail-hero');
  if (hero) {
    hero.style.background = p.gradient;
    hero.innerHTML = `<span style="font-size:100px;line-height:1">${p.emoji}</span>`;
  }

  // Description
  const desc = document.getElementById('detail-desc');
  if (desc) desc.textContent = p.desc;

  // Facts table
  const factsEl = document.getElementById('detail-facts');
  if (factsEl) {
    factsEl.innerHTML = p.facts.map(([k, v]) => `
      <div class="fact-row"><span class="fact-key">${k}</span><span class="fact-val">${v}</span></div>
    `).join('');
  }

  // Location map placeholder
  const locEl = document.getElementById('detail-location-text');
  if (locEl) locEl.textContent = p.location;

  // Header card
  const hCard = document.getElementById('detail-header-card');
  if (hCard) {
    hCard.innerHTML = `
      <p class="ic-type">${p.type} · ${p.location}</p>
      <h2 class="ic-name">${p.name}</h2>
      <div class="ic-stats">
        <div class="ic-stat"><p class="ic-stat-lbl">Annual return</p><p class="ic-stat-val green">${p.annualReturn}%</p></div>
        <div class="ic-stat"><p class="ic-stat-lbl">Investors</p><p class="ic-stat-val">${p.investors}</p></div>
        <div class="ic-stat"><p class="ic-stat-lbl">Funded</p><p class="ic-stat-val">${p.funded}%</p></div>
      </div>
    `;
  }

  // Progress bar
  const bar = document.getElementById('prog-bar');
  if (bar) bar.style.width = p.funded + '%';
  const raised = Math.round(p.totalValue * p.funded / 100);
  const raisedEl = document.getElementById('prog-raised');
  if (raisedEl) raisedEl.textContent = `${p.currency} ${raised.toLocaleString()} raised`;
  const pctEl = document.getElementById('prog-pct');
  if (pctEl) pctEl.textContent = `${p.funded}%`;
  const invEl = document.getElementById('prog-investors');
  if (invEl) invEl.textContent = `${p.investors} investors`;
  const remEl = document.getElementById('prog-remaining');
  if (remEl) remEl.textContent = `${100 - p.funded}% remaining`;

  // Currency symbol
  const curr = document.getElementById('invest-curr-symbol');
  if (curr) curr.textContent = p.currency;

  // Quick amounts
  const qa = document.getElementById('quick-amounts');
  if (qa) {
    const amounts = [500, 1000, 5000, 10000];
    qa.innerHTML = amounts.map(a => `<button onclick="setAmount(${a})">${a.toLocaleString()}</button>`).join('');
  }

  // Calc return default
  window._currentProp = p;
  calcReturn();

  // Similar props
  const simEl = document.getElementById('similar-props');
  if (simEl) {
    const similar = properties.filter(x => x.id !== p.id && (x.market === p.market || x.category === p.category)).slice(0, 3);
    simEl.innerHTML = similar.map(propCardHTML).join('');
  }
}

function calcReturn() {
  const p = window._currentProp;
  if (!p) return;
  const amount = parseFloat(document.getElementById('invest-input').value) || 0;
  const yearly = Math.round(amount * p.annualReturn / 100);
  const monthly = Math.round(yearly / 12);
  const fiveYr = Math.round(amount + yearly * 5);
  const curr = p.currency;
  const el = (id) => document.getElementById(id);
  if (el('ret-yearly')) el('ret-yearly').textContent = `${curr} ${yearly.toLocaleString()}`;
  if (el('ret-monthly')) el('ret-monthly').textContent = `${curr} ${monthly.toLocaleString()} / mo`;
  if (el('ret-5yr')) el('ret-5yr').textContent = `${curr} ${fiveYr.toLocaleString()}`;
}
