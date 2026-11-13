const USERS = {
  "567832": { name: "Kauanny Brito", area: "Manutenção Preditiva", role: "maintenance", length: 6 },
  "135739": { name: "Gabryelle Piedade", area: "Manutenção Preventiva", role: "maintenance", length: 6 },
  "142167": { name: "Mariana Coelho", area: "Manutenção Corretiva", role: "maintenance", length: 6 },
  "11124691": { name: "Tainá Silva", area: "Gestão", role: "manager", length: 8 },
  "11192781": { name: "Ester Barbosa", area: "Gestão", role: "manager", length: 8 },
  "11135670": { name: "Daise Mirelly", area: "Gestão", role: "manager", length: 8 }
};
const seedMachines = [
  { name: "Máquina 23", sector: "Usinagem", status: "Em análise", type: "Corretiva", updated: "11/11/2026 08:45" },
  { name: "Máquina 08", sector: "Montagem", status: "Em teste", type: "Preventiva", updated: "11/11/2026 08:20" },
  { name: "Máquina 15", sector: "Caldeiraria", status: "Operando", type: "Preditiva", updated: "10/11/2026 17:10" },
  { name: "Máquina 27", sector: "Embalagem", status: "Pendente", type: "Corretiva", updated: "10/11/2026 16:33" },
  { name: "Máquina 32", sector: "Utilidades", status: "Em manutenção", type: "Corretiva", updated: "10/11/2026 15:20" },
  { name: "Máquina 12", sector: "Usinagem", status: "Operando", type: "Preventiva", updated: "09/11/2026 08:15" },
  { name: "Máquina 04", sector: "Montagem", status: "Operando", type: "Corretiva", updated: "09/11/2026 07:42" },
  { name: "Máquina 18", sector: "Caldeiraria", status: "Operando", type: "Preditiva", updated: "08/11/2026 07:10" }
];
const seedOccurrences = [
  { id: 1, machine: "Máquina 23", sector: "Usinagem", problem: "Superaquecimento", shift: "A", area: "Manutenção Corretiva", status: "Em análise", responsible: "Kauanny Brito", action: "Inspeção inicial e verificação do sistema de refrigeração.", handoff: "Turno B deve continuar os testes antes de liberar a máquina.", released: "Não", date: "11/11/2026 08:45" },
  { id: 2, machine: "Máquina 08", sector: "Montagem", problem: "Vazamento", shift: "B", area: "Manutenção Preventiva", status: "Em teste", responsible: "Gabryelle Piedade", action: "Ajuste de conexão e teste de vedação.", handoff: "Acompanhar pressão durante a próxima hora.", released: "Não", date: "11/11/2026 08:20" },
  { id: 3, machine: "Máquina 15", sector: "Caldeiraria", problem: "Ruído anormal", shift: "A", area: "Manutenção Preditiva", status: "Resolvido", responsible: "Mariana Coelho", action: "Lubrificação e reaperto dos componentes.", handoff: "Máquina liberada após teste.", released: "Sim", date: "10/11/2026 17:10" },
  { id: 4, machine: "Máquina 27", sector: "Embalagem", problem: "Falha no sensor", shift: "B", area: "Manutenção Corretiva", status: "Pendente", responsible: "Kauanny Brito", action: "Sensor isolado para avaliação.", handoff: "Aguardar peça de reposição.", released: "Não", date: "10/11/2026 16:33" },
  { id: 5, machine: "Máquina 32", sector: "Utilidades", problem: "Queda de pressão", shift: "A", area: "Manutenção Corretiva", status: "Em manutenção", responsible: "Gabryelle Piedade", action: "Verificação de válvula e linha de alimentação.", handoff: "Monitorar pressão após intervenção.", released: "Não", date: "10/11/2026 15:20" }
];
let machines = load("tc3_machines", seedMachines),
  occurrences = load("tc3_occurrences", seedOccurrences),
  profiles = load("tc3_profiles", {}),
  currentUser = null;

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback
  }
  catch { return fallback }
}
function save() {
  localStorage.setItem("tc3_machines", JSON.stringify(machines));
  localStorage.setItem("tc3_occurrences", JSON.stringify(occurrences));
  localStorage.setItem("tc3_profiles", JSON.stringify(profiles))
}
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
function esc(v = "") {
  return String(v).replace(/[&<>"']/g,
    c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&quot;", "'": "&#39;" }[c]))
}
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2600)
}
function statusClass(s) {
  return s.toLowerCase().replaceAll(" ", "-")
}
function badge(s) {
  return `<span class="status ${statusClass(s)}">${esc(s)}</span>`
}
function manager() {
  return currentUser?.role === "manager"
}
function showAuth(view) {
  ["auth-choice", "register-form",
    "login-form"].forEach(id => $("#" + id).classList.toggle("hidden", id !== view));
  $("#login-error").textContent = "";
  $("#register-error").textContent = ""
}
function register(e) {
  e.preventDefault();
  const email = $("#register-email").value.trim(),
    name = $("#register-name").value.trim().replace(/\s+/g, " "),
    phone = $("#register-phone").value.trim(),
    pin = $("#register-pin").value.trim(),
    ra = $("#register-ra").value.trim(),
    user = USERS[ra],
    err = $("#register-error");
  if (!user || ra.length !== user.length) {
    err.textContent = "Não autorizado: o RA não corresponde a uma das áreas permitidas.";
    return
  }
  if (name.toLocaleLowerCase("pt-BR") !== user.name.toLocaleLowerCase("pt-BR")) {
    err.textContent = "Nome e sobrenome não correspondem ao RA informado.";
    return
  } if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    err.textContent = "Informe um e-mail válido.";
    return
  } if (phone.replace(/\D/g, "").length < 10) {
    err.textContent = "Informe um telefone válido com DDD.";
    return
  } if (!/^\d{4}$/.test(pin)) {
    err.textContent = "A senha deve conter exatamente 4 dígitos.";
    return
  } if (profiles[ra]) {
    err.textContent = "Este RA já possui cadastro. Utilize a opção Entrar.";
    return
  } profiles[ra] = { email, phone, pin, createdAt: new Date().toISOString() };
  save();
  toast("Cadastro concluído. Agora entre no sistema.");
  $("#register-form").reset();
  showAuth("auth-choice")
}
function login(e) {
  e.preventDefault();
  const name = $("#login-name").value.trim().replace(/\s+/g, " "),
    ra = $("#login-ra").value.trim(),
    pin = $("#login-pin").value.trim(),
    user = USERS[ra],
    err = $("#login-error");
  if (!user || ra.length !== user.length) {
    err.textContent = "Não autorizado: RA não cadastrado ou incompatível com a área permitida.";
    return
  }
  if (name.toLocaleLowerCase("pt-BR") !== user.name.toLocaleLowerCase("pt-BR")) {
    err.textContent = "O nome e sobrenome não correspondem ao RA informado.";
    return
  }
  if (!/^\d{4}$/.test(pin)) {
    err.textContent = "A senha deve conter exatamente 4 dígitos.";
    return
  }
  const savedProfile = profiles[ra],
    legacyPin = localStorage.getItem("tc3_pin_" + ra),
    saved = savedProfile?.pin || legacyPin; if (!saved) {
      err.textContent = "Este RA ainda não foi cadastrado. Escolha Cadastrar primeiro.";
      return
    } if (saved !== pin) {
      err.textContent = "Senha incorreta. Verifique os 4 dígitos.";
      return
    }
  if (!savedProfile && legacyPin) {
    profiles[ra] = { email: "", phone: "", pin, legacy: true };
    save()
  } currentUser = {
    ...user, ra, email: savedProfile?.email || "",
    phone: savedProfile?.phone || ""
  }; localStorage.setItem("tc3_session", JSON.stringify(currentUser));
  $("#login-form").reset(); startApp()
}
function startApp() {
  if (!currentUser) return;
  $("#login-screen").classList.add("hidden");
  $("#app").classList.remove("hidden");
  $("#profile-name").textContent = currentUser.name;
  $("#profile-role").textContent = manager() ? "Gestor" : currentUser.area.replace("Manutenção ", "");
  $("#greeting").textContent = `Olá, ${currentUser.name.split(" ")[0]}!`;
  $$(".manager-only").forEach(el => el.classList.toggle("hidden", !manager()));
  $$(".nav-item.manager-only").forEach(el => el.classList.toggle("hidden", !manager()));
  renderAll(); populateMachineSelectors();
  go("dashboard"); clock()
}
function logout() {
  localStorage.removeItem("tc3_session");
  currentUser = null;
  $("#app").classList.add("hidden");
  $("#login-screen").classList.remove("hidden");
  $("#login-form").reset();
}
function go(page) {
  if ((["gestao", "indicadores", "exportar"].includes(page)) && !manager()) {
    toast("Acesso restrito aos gestores.");
    return
  }
  $$(".page").forEach(p => p.classList.toggle("active", p.id === `page-${page}`));
  $$(".nav-item").forEach(n => n.classList.toggle("active", n.dataset.page === page));
  $("#sidebar").classList.remove("open"); $("#scrim").classList.remove("show");
  if (page === "historico") renderTimeline();
  if (page === "gestao") renderAI();
  if (page === "indicadores") renderIndicators()
}
function clock() {
  const update = () => {
    const d = new Date();
    $("#date-time").innerHTML = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) + `<small>${d.toLocaleTimeString("pt-BR",
      { hour: "2-digit", minute: "2-digit" })}</small>`
  }; update(); setInterval(update, 30000)
}
function kpi(icon, label, value, note, color) {
  return `<div class="kpi" style="--accent:${color}">
  <div class="kpi-icon">${icon}
  </div>
  <div>
  <div class="kpi-label">${label}</div>
  <div class="kpi-value">${value}</div>
  <div class="kpi-note">${note}</div>
  </div>
  </div>` }
function renderDashboard() {
  const open = occurrences.filter(o => o.status !== "Resolvido").length,
    done = occurrences.filter(o => o.status === "Resolvido").length,
    maintenance = machines.filter(m => m.status === "Em manutenção").length;
  $("#kpi-grid").innerHTML = [kpi("▣", "Máquinas cadastradas", machines.length, "Total de máquinas no sistema", "#3185f4"),
  kpi("⚠", "Máquinas com ocorrência", open, "Aguardando continuidade", "#ed4358"),
  kpi("🔧", "Manutenções em andamento", maintenance, "Em execução", "#f3c94b"),
  kpi("✓", "Máquinas liberadas", done, "Ocorrências resolvidas", "#35bd83"),
  kpi("!", "Ocorrências não resolvidas", open, "Precisam de acompanhamento", "#f27b48"),
  kpi("⚒", "Manutenções realizadas", done, "Registros concluídos", "#8870f4")].join("");
  const stats = [["Operando", machines.filter(m => m.status === "Operando").length, "#35bd83"],
  ["Em manutenção", maintenance, "#f3c94b"], ["Parada",
    machines.filter(m => m.status === "Parada").length, "#ed4358"],
  ["Em teste", machines.filter(m => m.status === "Em teste").length, "#3185f4"],
  ["Aguardando intervenção", machines.filter(m => m.status === "Pendente").length, "#8870f4"]];
  const total = machines.length || 1; let acc = 0, stops = [];
  stats.forEach(x => {
    let pct = x[1] / total * 100;
    stops.push(`${x[2]} ${acc}% ${acc + pct}%`); acc += pct
  });
  $("#machine-donut").style.background = `conic-gradient(${stops.join(",")})`;
  $("#machine-total").textContent = machines.length;
  $("#machine-legend").innerHTML = stats.map(x =>
    `<div class="legend-row"><i class="legend-dot" style="background:${x[2]}">
    </i>
    <span>${x[0]}</span><b>${x[1]} 
    <small>${(x[1] / total * 100).toFixed(1)}%</small></b>
    </div>`).join("");
  const types = ["Preditiva", "Preventiva", "Corretiva"].map((t, i) => [t, occurrences.filter(o => o.area.endsWith(t)).length,
    ["#3185f4", "#35bd83", "#ed4358"][i]]);
  const tt = types.reduce((a, x) => a + x[1], 0) || 1;
  let ta = 0, tc = [];
  types.forEach(x => {
    let p = x[1] / tt * 100;
    tc.push(`${x[2]} ${ta}% ${ta + p}%`); ta += p
  });
  $("#type-donut").style.background = `conic-gradient(${tc.join(",")})`;
  $("#type-total").textContent = tt;
  $("#type-legend").innerHTML = types.map(x => `<div class="legend-row"><i class="legend-dot" style="background:${x[2]}"></i>
    <span>${x[0]}</span><b>${x[1]}</b></div>`).join("");
  $("#recent-table").innerHTML = occurrences.slice(0, 5).map(o => `<tr><td>${esc(o.machine)}</td>
  <td>${esc(o.problem)}</td><td>${esc(o.shift)}</td>
  <td>${badge(o.status)}</td>
  <td>${esc(o.responsible)}</td>
  </tr>`).join("");
  const last = occurrences[0];
  $("#continuity-card").innerHTML = last ? `<div class="continuity-card"><div>
  <h4>▣ ${esc(last.machine)} ${badge(last.status)}</h4>
  <small>Turno ${esc(last.shift)} → Próximo turno</small>
  <p>${esc(last.problem)}. ${esc(last.action)} ${esc(last.handoff)}</p>
  </div>
  <div class="continuity-meta">Última atualização<b>${esc(last.date)}</b>
  <br>Responsável<b>${esc(last.responsible)}</b></div>
  </div>` : "<p class='muted'>Nenhuma passagem registrada.</p>";
  $("#maintenance-table").innerHTML = occurrences.slice(0, 5).map(o => `<tr><td>${esc(o.machine)}</td>
  <td>${esc(o.area.replace("Manutenção ", ""))}</td>
  <td>${esc(o.date)}</td>
  <td>${esc(o.responsible)}</td><td>—</td>
  </tr>`).join("");
  $("#alerts").innerHTML = `<div class="alert-line"><span></span>${open} ocorrências precisam de continuidade.</div>
  <div class="alert-line"><span style="background:#f3c94b"></span>${machines.filter(m => m.status === "Em teste").length} 
  máquinas aguardando teste.</div><div class="alert-line">
  <span style="background:#ed4358">
  </span>${machines.filter(m => m.status === "Parada").length} máquinas paradas.</div>`;
  const sectors = [...new Set(occurrences.map(o => o.sector))];
  $("#sector-bars").innerHTML = sectors.map(s => {
    let n = occurrences.filter(o => o.sector === s).length; return `<div class="sector-row">
    <span>${esc(s)}</span>
    <div class="bar">
    <i style="width:${n / Math.max(1, ...sectors.map(x => occurrences.filter(o => o.sector === x).length)) * 100}%"></i>
    </div><b>${n}</b></div>`
  }).join("");
  $("#mini-indicators").innerHTML = `<div class="mini-box">Total de ocorrências<strong>${occurrences.length}</strong></div><div class="mini-box">Resolvidas<strong>${done}</strong></div><div class="mini-box">Máquina com mais registros<strong>${mostReported()}</strong></div><div class="mini-box">Pendentes<strong>${open}</strong></div>`;
  $("#machine-history-preview").innerHTML = last ? `<div class="history-link">▣ ${esc(last.machine)} — ${esc(last.status)}</div><div class="history-link">＋ Últimas ocorrências</div><div class="history-link">＋ Manutenções realizadas</div><div class="history-link">＋ Quem realizou</div><div class="history-link">＋ Problemas recorrentes</div>` : "Sem histórico.";
  $("#notification-count").textContent = open;
}
function mostReported() {
  const count = {};
  occurrences.forEach(o => count[o.machine] = (count[o.machine] || 0) + 1);
  return Object.keys(count).sort((a, b) => count[b] - count[a])[0] || "—"
}
function renderMachines() {
  const q = ($("#machine-search")?.value || "").toLowerCase();
  const rows = machines.filter(m => (m.name + m.sector).toLowerCase().includes(q));
  $("#machine-count").textContent = `${rows.length} máquinas`;
  $("#machines-table").innerHTML = rows.map(m => `<tr><td>${esc(m.name)}</td>
  <td>${esc(m.sector)}</td>
  <td>${badge(m.status)}</td>
  <td>${esc(m.type)}</td>
  <td>${esc(m.updated)}</td>
  </tr>`).join("")
}
function renderOccurrences() {
  const q = ($("#occ-search")?.value || "").toLowerCase(), s = $("#occ-status")?.value || "all";
  $("#occ-table").innerHTML = occurrences.filter(o => (o.machine + o.problem + o.responsible)
    .toLowerCase().includes(q) && (s === "all" || o.status === s))
    .map(o => `<tr><td>${esc(o.machine)}</td>
  <td>${esc(o.problem)}</td>
  <td>${esc(o.shift)}</td>
  <td>${esc(o.area)}</td>
  <td>${badge(o.status)}</td>
  <td>${esc(o.responsible)}</td>
  <td>${esc(o.date)}</td></tr>`).join("")
}
function renderTimeline() {
  $("#timeline").innerHTML = occurrences.map(o => `<article class="timeline-item">
    <div class="timeline-date">${esc(o.date)} · Turno ${esc(o.shift)}</div><h3>${esc(o.machine)} — ${esc(o.problem)} 
    ${badge(o.status)}</h3><p><b>Responsável:</b> ${esc(o.responsible)} · ${esc(o.area)}</p><p><b>O que foi feito:</b> 
    ${esc(o.action)}</p><p><b>Teste:</b> 
    ${esc(o.test || "Não informado")} · <b>Resultado:</b> 
    ${esc(o.result || "Não informado")}</p><p><b>Passagem para o próximo turno:</b> 
    ${esc(o.handoff || "Nenhuma orientação informada.")}</p></article>`).join("") || "<p class='muted'>Nenhum registro no histórico.</p>"
}
function renderMaintenance() {
  $("#all-maintenance").innerHTML = occurrences.map(o => `<tr>
    <td>${esc(o.machine)}</td>
    <td>${esc(o.area)}</td>
    <td>${esc(o.problem)}</td>
    <td>${esc(o.responsible)}</td>
    <td>${esc(o.date)}</td>
    <td>${badge(o.status)}</td>
    </tr>`).join("")
}
function summary() {
  const pending = occurrences.filter(o => o.status !== "Resolvido"),
    byMachine = {};
  occurrences.forEach(o => byMachine[o.machine] = (byMachine[o.machine] || 0) + 1);
  const repeated = Object.entries(byMachine).filter(x => x[1] > 1).map(x => `${x[0]} (${x[1]} registros)`);
  return `Foram registrados ${occurrences.length} 
  eventos envolvendo ${new Set(occurrences.map(o => o.machine)).size} 
  máquinas. ${pending.length} ocorrência(s) ainda precisam de acompanhamento. 
  ${repeated.length ? `Há repetição de registros em: ${repeated.join(", ")}.` : "Não há máquinas com mais de um registro no conjunto atual."} 
  A prioridade operacional é garantir que as pendências tenham responsável, orientação clara e confirmação de liberação antes da retomada.`
}
function renderAI() {
  $("#ai-summary").textContent = summary();
  const counts = {};
  occurrences.forEach(o => counts[o.machine] = (counts[o.machine] || 0) + 1);
  const repeats = Object.entries(counts).filter(x => x[1] > 1); $("#rework-alerts").innerHTML = repeats.length ? repeats.map(x =>
    `<div class="alert-line"><span style="background:#ed4358">
    </span>${esc(x[0])}: ${x[1]} registros. Verificar recorrência antes de encerrar a ocorrência.</div>`)
    .join("") : "<p class='muted'>Nenhuma repetição identificada nos registros atuais. O alerta será atualizado conforme novas ocorrências forem cadastradas.</p>";
  populateMachineSelectors()
}
function populateMachineSelectors() {
  ["#machine-ai-select", "#manager-machine-select"]
    .forEach(sel => {
      const el = $(sel); if (!el)
        return;
      const previous = el.value; el.innerHTML = '<option value="">Selecione uma máquina</option>' + machines
        .map(m => `<option value="${esc(m.name)}">${esc(m.name)} — ${esc(m.sector)}</option>`)
        .join(""); if (machines.some(m => m.name === previous)) el.value = previous
    })
}
function machineAnalysis(machineName) {
  const machine = machines.find(m => m.name === machineName),
    rows = occurrences.filter(o => o.machine === machineName);
  if (!machine)
    return "Selecione uma máquina cadastrada para iniciar a análise.";
  const pending = rows.filter(o => o.status !== "Resolvido"),
    problems = [...new Set(rows.map(o => o.problem))];
  const latest = rows[0]; return `<h4>${esc(machine.name)} · ${esc(machine.sector)}</h4><p>
  <b>Situação atual:</b> ${esc(machine.status)} · <b>Tipo:</b> ${esc(machine.type)}</p>
  <p><b>Registros encontrados:</b> ${rows.length} · <b>Pendências:</b> 
  ${pending.length}</p>
  <p><b>Problemas identificados:</b> 
  ${problems.length ? problems.map(esc)
      .join(", ") : "Nenhum registro associado"}</p>
    ${latest ? `<p><b>Último procedimento:</b> 
      ${esc(latest.action || "Não informado")}</p><p><b>Teste e resultado:</b> 
      ${esc(latest.test || "Não informado")} — ${esc(latest.result || "Resultado não informado")}</p>
      <p><b>Última orientação:</b> 
      ${esc(latest.handoff || "Nenhuma orientação registrada")}</p>
      <p><b>Responsável / turno:</b> ${esc(latest.responsible)} · Turno ${esc(latest.shift)} · ${esc(latest.date)}</p>` : ""}<p>
      <b>Recomendação do assistente:</b> 
      ${pending.length ? "Manter a ocorrência aberta, designar responsável para a próxima etapa e registrar teste de confirmação antes da liberação." : "Conferir os testes finais e manter o acompanhamento preventivo."}</p>`
}
function organizeOccurrence() {
  const form = $("#occ-form"),
    data = new FormData(form),
    problem = String(data.get("problem") || "").trim(),
    action = String(data.get("action") || "").trim(),
    test = String(data.get("test") || "").trim(),
    result = String(data.get("result") || "").trim(),
    status = String(data.get("status") || "Em análise"),
    handoff = String(data.get("handoff") || "").trim();
  if (!problem || !action) {
    toast("Preencha o problema e o procedimento antes de organizar.");
    return
  }
  const next = handoff || (status === "Resolvido" ? "Manter acompanhamento de rotina." : "Próximo turno: continuar a análise, executar o teste pendente e atualizar o status."); const preview = `<h4>Registro estruturado sugerido</h4><p><b>Problema:</b> ${esc(problem)}</p><p><b>Procedimento realizado:</b> ${esc(action)}</p><p><b>Teste:</b> ${esc(test || "Não informado — registrar o teste executado")}</p><p><b>Resultado:</b> ${esc(result || "Não informado — preencher após o teste")}</p><p><b>Status:</b> ${esc(status)}</p><p><b>Próxima etapa:</b> ${esc(next)}</p><p class="muted">Sugestão organizada localmente a partir dos campos preenchidos. Para análise generativa por IA real, é necessária conexão com serviço de IA e backend seguro.</p>`; const box = $("#organized-preview"); box.innerHTML = preview; box.classList.remove("hidden"); if (!handoff) form.elements.handoff.value = next
}
function analyzeSelectedMachine() {
  const name = $("#manager-machine-select").value;
  $("#manager-machine-analysis").innerHTML = machineAnalysis(name)
}
function summarizeSelectedMachine() {
  const name = $("#machine-ai-select").value;
  $("#machine-ai-summary").innerHTML = machineAnalysis(name)
}
function renderIndicators() {
  const open = occurrences.filter(o => o.status !== "Resolvido").length,
    done = occurrences.length - open;
  $("#indicator-kpis").innerHTML = [kpi("▣", "Máquinas cadastradas", machines.length, "Cadastro atual", "#3185f4"),
  kpi("⚠", "Ocorrências registradas", occurrences.length, "Total de eventos", "#ed4358"),
  kpi("✓", "Ocorrências resolvidas", done, "Status resolvido", "#35bd83"),
  kpi("◷", "Pendências", open, "Aguardando continuidade", "#f3c94b")].join("");
  const sectors = [...new Set(occurrences.map(o => o.sector))];
  $("#indicator-sectors").innerHTML = sectors.map(s => `<div class="sector-row">
      <span>${esc(s)}</span><div class="bar">
      <i style="width:${occurrences.filter(o => o.sector === s).length / Math.max(1, occurrences.length) * 100}%"></i>
      </div><b>${occurrences.filter(o => o.sector === s).length}</b>
      </div>`).join("")
}
function renderAll() {
  renderDashboard();
  renderMachines();
  renderOccurrences();
  renderMaintenance();
  const sectors = [...new Set(machines.map(m => m.sector))];
  $("#sector-filter").innerHTML = '<option value="all">Todos</option>' + sectors.map(s => `<option>${esc(s)}</option>`)
    .join("");
  populateMachineSelectors()
}
function csvDownload(filename, rows) {
  const cols = Object.keys(rows[0] || {});
  const csv = [cols.join(";"), ...rows.map(r => cols.map(c => `"${String(r[c] ?? "")
    .replaceAll('"', '""')}"`)
    .join(";"))]
    .join("\r\n");
  download(filename, "\ufeff" + csv, "text/csv;charset=utf-8")
}
function download(name, data, type) {
  const a = document.createElement("a"),
    url = URL.createObjectURL(new Blob([data], { type }));
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url)
}
function exportData(type) {
  if (!manager()) {
    toast("Somente gestores podem exportar os dados completos.");
    return
  }
  if (type === "occurrences") csvDownload("turno-conectado-ocorrencias.csv", occurrences);
  if (type === "history") csvDownload("turno-conectado-historico.csv",
    occurrences.map(o => ({
      data: o.date,
      maquina: o.machine,
      turno: o.shift,
      problema: o.problem,
      acao: o.action,
      orientacao: o.handoff,
      responsavel: o.responsible,
      status: o.status
    })));
  if (type === "indicators") csvDownload("turno-conectado-indicadores.csv",
    [{
      maquinas: machines.length,
      ocorrencias: occurrences.length,
      resolvidas: occurrences.filter(o => o.status === "Resolvido").length,
      pendentes: occurrences.filter(o => o.status !== "Resolvido").length,
      maquina_com_mais_registros: mostReported()
    }]);
  if (type === "backup") download("turno-conectado-backup.json", JSON.stringify({
    machines, occurrences, exportedAt: new Date().toISOString()
  }, null, 2), "application/json");
  toast("Arquivo preparado para download.")
}
$("#register-phone").addEventListener("input", e => {
  let v = e.target.value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 3)} 
  ${v.slice(3, 7)}-${v.slice(7)}`;
  else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
  else if (v.length) v = `(${v}`; e.target.value = v
});
$("#register-ra").addEventListener("input", e => e.target.value = e.target.value.replace(/\D/g, "").slice(0, 8));
$("#login-ra").addEventListener("input", e => e.target.value = e.target.value.replace(/\D/g, "").slice(0, 8));
$("#register-pin").addEventListener("input", e => e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4));
$("#login-pin").addEventListener("input", e => e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4));
$("#show-register").addEventListener("click", () => showAuth("register-form"));
$("#show-login").addEventListener("click", () => showAuth("login-form"));
$("#back-from-register").addEventListener("click", () => showAuth("auth-choice"));
$("#back-from-login").addEventListener("click", () => showAuth("auth-choice"));
$("#register-form").addEventListener("submit", register);
$("#login-form").addEventListener("submit", login);
$("#logout-button").addEventListener("click", logout);
$("#profile-button").addEventListener("click", () => $("#profile-menu").classList.toggle("hidden"));
$("#profile-details").addEventListener("click", () => {
  toast(`${currentUser.name} · ${currentUser.area} · RA ${currentUser.ra}`);
  $("#profile-menu").classList.add("hidden")
});
$("#main-nav").addEventListener("click", e => {
  const b = e.target.closest("[data-page]");
  if (b) go(b.dataset.page)
});
document.addEventListener("click", e => {
  const goBtn = e.target.closest("[data-go]");
  if (goBtn) go(goBtn.dataset.go);
  const exp = e.target.closest("[data-export]");
  if (exp) exportData(exp.dataset.export)
});
$("#menu-toggle").addEventListener("click", () => {
  $("#sidebar").classList.add("open");
  $("#scrim").classList.add("show")
});
$("#close-menu").addEventListener("click", () => {
  $("#sidebar").classList.remove("open");
  $("#scrim").classList.remove("show")
});
$("#scrim").addEventListener("click", () => {
  $("#sidebar").classList.remove("open");
  $("#scrim").classList.remove("show")
});
$("#occ-form").addEventListener("submit", e => {
  e.preventDefault(); const f = new FormData(e.target),
    o = {
      id: Date.now(),
      machine: f.get("machine").trim(),
      sector: f.get("sector"),
      problem: f.get("problem").trim(),
      shift: f.get("shift"),
      area: f.get("area"),
      status: f.get("status"),
      responsible: currentUser.name, action: f.get("action").trim(),
      test: f.get("test").trim(),
      result: f.get("result").trim(),
      handoff: f.get("handoff").trim(),
      nextStep: f.get("handoff").trim(),
      released: f.get("released"),
      date: new Date().toLocaleString("pt-BR")
    };
  occurrences.unshift(o);
  let m = machines.find(x => x.name.toLowerCase() === o.machine.toLowerCase());
  if (!m) {
    m = {
      name: o.machine, sector: o.sector, status: o.status, type: o.area.replace("Manutenção ", ""),
      updated: o.date
    };
    machines.unshift(m)
  }
  else { m.status = o.status; m.updated = o.date; m.type = o.area.replace("Manutenção ", "") }
  save(); e.target.reset(); $("#form-feedback").textContent = "Ocorrência salva e compartilhada neste navegador.";
  renderAll(); toast("Ocorrência registrada.")
});
$("#organize-occurrence").addEventListener("click", organizeOccurrence);
$("#machine-ai-button").addEventListener("click", summarizeSelectedMachine);
$("#analyze-machine-history").addEventListener("click", analyzeSelectedMachine);
$("#machine-search").addEventListener("input", renderMachines);
$("#occ-search").addEventListener("input", renderOccurrences);
$("#occ-status").addEventListener("change", renderOccurrences);
$("#refresh-ai").addEventListener("click", () => { renderAI(); toast("Resumo atualizado com os registros atuais.") });
$("#notifications").addEventListener("click", () => toast(`${occurrences.filter(o => o.status !== "Resolvido").length} ocorrência(s) aguardando continuidade.`));
$("#period-filter").addEventListener("change", () => toast("Filtro de período selecionado."));
$("#sector-filter").addEventListener("change", () => toast("Setor selecionado."));
$("#shift-filter").addEventListener("change", () => toast("Turno selecionado."));

showAuth("auth-choice");

try {
  const s = localStorage.getItem("tc3_session");

  if (s) {
    currentUser = JSON.parse(s);
    startApp();
  }
} catch {
  localStorage.removeItem("tc3_session");
}
function identificarMaquinaQR() {
  const parametros = new URLSearchParams(window.location.search);
  const nomeMaquina = parametros.get("maquina");

  if (!nomeMaquina) return;

  const maquina = machines.find(
    m => m.name.toLowerCase() === nomeMaquina.toLowerCase()
  );

  if (!maquina) {
    toast("Máquina não encontrada no sistema.");
    return;
  }

  go("registrar");

  const campoMaquina = $("#occ-form").elements.machine;

  if (campoMaquina) {
    campoMaquina.value = maquina.name;
    campoMaquina.dispatchEvent(new Event("change", {
      bubbles: true
    }));
  }

  toast(`Máquina identificada: ${maquina.name}`);
}