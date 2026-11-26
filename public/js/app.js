/* CraftIT 1.0.0 frontend. Game rules run here; the server stores accounts and save games. */
(function(){
"use strict";

/* ---------- Helfer ---------- */
var $ = function(s, r){ return (r || document).querySelector(s); };
var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var esc = function(s){ return String(s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); };
var eur = function(n){ return n.toLocaleString("de-DE") + " €"; };
var store = {
  get: function(k, d){ try { var v = localStorage.getItem("craftit-" + k); return v === null ? d : JSON.parse(v); } catch(e){ return d; } },
  set: function(k, v){ try { localStorage.setItem("craftit-" + k, JSON.stringify(v)); } catch(e){} }
};

/* ---------- Daten ---------- */
var users = [
  { id:"u1", name:"Derrik Winchester", mail:"derrik@example.test", role:"Server-Admin", saves:3, status:"aktiv" },
  { id:"u2", name:"Mira Stein",        mail:"mira@example.test",   role:"Spieler",      saves:2, status:"aktiv" },
  { id:"u3", name:"Jonas Keller",      mail:"jonas@example.test",  role:"Spieler",      saves:1, status:"aktiv" },
  { id:"u4", name:"Testkonto 2",       mail:"test2@example.test",  role:"Spieler",      saves:0, status:"gesperrt" }
];
var tickets = [
  { id:"T-1033", title:"Netzwerk-Ausfall Lager", cust:"Logistik Weidner", requester:"Tobias Lang, Lagerleitung", cat:"Netzwerk", impact:4, urgency:4, prio:"Kritisch", sla:"28 min", slaMin:28, status:"Major Incident", who:"Jonas Keller", inv:0, log:[], notes:[], resolution:"",
    thread:[{ k:"client", who:"Tobias Lang", text:"Lager meldet Ausfall aller Scanner. Router zeigt einen Firmware-Fehler.", when:"Vor 40 Minuten" }] },
  { id:"T-1031", title:"Drucker im Empfang druckt nicht", cust:"Bäckerei Krumm", requester:"Petra Krumm, Inhaberin", cat:"Drucken", impact:3, urgency:3, prio:"Hoch", sla:"2 h 10 min", slaMin:130, status:"Offen", who:"Ole Brandt", inv:0, log:[], notes:[], resolution:"",
    thread:[{ k:"client", who:"Petra Krumm", text:"Der Drucker im Empfang ist seit heute Morgen offline. Wir brauchen ihn für die Lieferscheine.", when:"Vor 14 Minuten" }] },
  { id:"T-1032", title:"Laptop startet nicht mehr (Bluetooth-Fehler)", cust:"Steuerbüro Hahn", requester:"Sven Hahn", cat:"Hardware", impact:2, urgency:2, prio:"Mittel", sla:"6 h", slaMin:360, status:"In Arbeit", who:"Mira Stein", inv:0, log:[], notes:[], resolution:"",
    thread:[{ k:"client", who:"Sven Hahn", text:"Laptop bleibt beim Start hängen. Das Treiber-Update von gestern könnte es sein.", when:"Vor 2 Stunden" }] },
  { id:"T-1034", title:"Passwort zurücksetzen", cust:"Arztpraxis Beispiel", requester:"Dr. Anna Beispiel", cat:"Konten und Zugriff", impact:1, urgency:2, prio:"Niedrig", sla:"1 Tag", slaMin:1440, status:"Gelöst", who:"Mira Stein", inv:2, log:[], notes:[], resolution:"Konto entsperrt, neues Passwort gesetzt. Kunde hat bestätigt.",
    thread:[{ k:"client", who:"Dr. Anna Beispiel", text:"Ich komme nicht mehr in mein Konto.", when:"Gestern" }, { k:"staff", who:"Mira Stein", text:"Lösung: Konto entsperrt, neues Passwort gesetzt. Kunde hat bestätigt.", when:"Gestern" }] }
];
var POOL = [
  { title:"Bildschirm bleibt schwarz", cust:"Arztpraxis Beispiel", requester:"Dr. Anna Beispiel", cat:"Hardware", impact:1, urgency:2 },
  { title:"E-Mail-Versand hängt", cust:"Bäckerei Krumm", requester:"Petra Krumm, Inhaberin", cat:"E-Mail", impact:2, urgency:3 },
  { title:"VPN verbindet nicht mehr", cust:"Steuerbüro Hahn", requester:"Sven Hahn", cat:"Netzwerk", impact:2, urgency:3 },
  { title:"Druckertreiber fehlt am neuen PC", cust:"Logistik Weidner", requester:"Tobias Lang, Lagerleitung", cat:"Drucken", impact:1, urgency:2 }
];
var changes = [
  { id:"CHG-204", title:"Firewall-Regel für Lager-VPN", type:"Normal", risk:"Mittel", status:"Zur Prüfung", cab:"Mo, 09:00" },
  { id:"CHG-205", title:"Passwort-Richtlinie (GPO) anpassen", type:"Standard", risk:"Niedrig", status:"Genehmigt", cab:"—" },
  { id:"CHG-206", title:"Notfall-Patch Druckerdienst", type:"Emergency", risk:"Hoch", status:"Zur Prüfung", cab:"Sofort" }
];
var services = [
  { id:"mail",  name:"E-Mail",          owner:"Jonas Keller", avail:99.8, cap:70 },
  { id:"files", name:"Dateiablage",     owner:"Jonas Keller", avail:97.1, cap:92 },
  { id:"print", name:"Drucken",         owner:"Ole Brandt",   avail:88.4, cap:45 },
  { id:"vpn",   name:"VPN Lager",       owner:"Jonas Keller", avail:99.2, cap:55 },
  { id:"erp",   name:"Warenwirtschaft", owner:"Mira Stein",   avail:100,  cap:40 }
];
var maint = [
  { svc:"Dateiablage", when:"Samstag 06:00", status:"geplant" }
];
var accessReq = [
  { id:"AR-301", who:"Lea Fischer", what:"Rolle Helpdesk", requester:"Lea Fischer (neu)", policy:"ok", status:"offen" },
  { id:"AR-302", who:"Tobias Lang", what:"Rolle Domänen-Admin", requester:"Tobias Lang, Lagerleitung", policy:"nur mit Freigabe", status:"offen" },
  { id:"AR-303", who:"Mira Stein", what:"Freigabe Ordner Buchhaltung", requester:"Mira Stein", policy:"ok", status:"offen" }
];
var audit = [
  { t:"Heute, 13:52", who:"Derrik", what:"Konto „Testkonto 2“ gesperrt", ref:"Login-Fehler" },
  { t:"Gestern, 16:10", who:"Jonas Keller", what:"Rolle Netzwerk-Admin vergeben", ref:"AR-298" }
];
var teams = [
  { name:"Helpdesk", members:3, roles:"Helpdesk, Passwort-Reset" },
  { name:"Netzwerk", members:2, roles:"Netzwerk-Admin" },
  { name:"Administration", members:1, roles:"Domänen-Admin (Soll: 2 Personen)" }
];
var routines = [
  { id:"r1", name:"Patch-Tag Drucker", asset:"HP-Empfang", due:"Heute", every:"wöchentlich", done:false },
  { id:"r2", name:"Backup-Wiederherstellungstest", asset:"NAS-Büro", due:"Freitag", every:"monatlich", done:false },
  { id:"r3", name:"Lizenz-Review Office 365", asset:"Lizenz Office", due:"in 9 Tagen", every:"quartalsweise", done:true }
];
var policies = [
  { id:"p1", name:"Passwortrichtlinie", value:"12 Zeichen, Wechsel alle 90 Tage", owner:"Derrik" },
  { id:"p2", name:"Update-Fenster", value:"Dienstag 22:00 bis 23:00", owner:"Jonas Keller" },
  { id:"p3", name:"Admin-Zugang", value:"nur mit Freigabe", owner:"Derrik" }
];
var resources = [
  { name:"Ersatzlaufwerke 4 TB", n:2, min:1 },
  { name:"Lizenzen Office 365", n:14, min:5 },
  { name:"Toner Drucker", n:1, min:2 }
];
var autos = [
  { id:"a1", name:"Passwort-Reset (Vorlage)", cost:420, on:false, risk:"Falsche Zuordnung kann Konten sperren." },
  { id:"a2", name:"Zertifikate erneuern", cost:300, on:false, risk:"Ein abgelaufenes Zertifikat wird ein Incident." },
  { id:"a3", name:"Druckerwarteschlange leeren", cost:120, on:true, risk:"Geringes Risiko." }
];
var COURSES = [
  { name:"Netzwerk-Grundlagen", cost:600 },
  { name:"Windows Server", cost:900 },
  { name:"Security Awareness", cost:300 }
];
var milestones = [
  { name:"Erster Kunde mit Support-Vertrag", done:true, unlock:"" },
  { name:"Zweite Mitarbeiterin einstellen", done:false, unlock:"Monitoring" },
  { name:"Major Incident erfolgreich lösen", done:false, unlock:"Szenario Standortausfall" },
  { name:"Zertifikat Netzwerk-Grundlagen", done:false, unlock:"zweites Rack" }
];
var scenarios = [
  { id:"sc1", name:"Standortausfall Lager", goal:"Netz wiederherstellen und Kunden informieren", locked:false },
  { id:"sc2", name:"Ransomware im Büro", goal:"Daten aus dem Backup zurückholen", locked:true }
];
var shiftLog = [];
var cash = 18420;
var staffList = ["Jonas Keller", "Mira Stein", "Ole Brandt", "Derrik Winchester"];
var staff = [
  { name:"Jonas Keller", role:"Netzwerk-Admin · Stufe 6", ini:"JK", energy:78, stress:32, skills:[["Netzwerk",90],["Windows",70],["Hardware",55],["Sicherheit",40]] },
  { name:"Mira Stein", role:"Kundenbetreuung · Stufe 3", ini:"MS", energy:48, stress:71, skills:[["Kundenkontakt",85],["Dokumentation",60],["Windows",45],["Netzwerk",20]], warn:"Burnout-Warnung" },
  { name:"Ole Brandt", role:"Hardware · Stufe 4", ini:"OB", energy:0, stress:0, skills:[["Hardware",88],["Drucker",92],["Windows",50],["Cloud",15]], sick:"Krank bis Donnerstag" }
];
var candidates = [
  { id:"c1", name:"Lea Fischer", skills:"Netzwerk 5 · Windows 4", pay:3200, note:"Zertifikat Netzwerk-Grundlagen" },
  { id:"c2", name:"Kemal Yildiz", skills:"Cloud 3 · Sicherheit 4", pay:3600, note:"Hohe Stressresistenz" }
];
var saves = [
  { id:"s1", name:"Nordlicht IT Service", mode:"Einzelspiel", diff:"Normal", day:42, saved:"Heute, 14:20", dot:"ok" },
  { id:"s2", name:"Krumm IT-Hilfe", mode:"Koop · 3 Mitglieder", diff:"Schwer", day:17, saved:"Gestern, 21:05", dot:"info" },
  { id:"s3", name:"Testfirma", mode:"Einzelspiel", diff:"Leicht", day:4, saved:"Vor 2 Tagen", dot:"mut" }
];
var invoices = [
  { id:"R-2041", cust:"Bäckerei Krumm", desc:"Ticket #1031", amt:420, status:"offen", due:"fällig in 6 Tagen" },
  { id:"R-2038", cust:"Logistik Weidner", desc:"Support-Vertrag Oktober", amt:1850, status:"überfällig", due:"seit 3 Tagen" },
  { id:"R-2035", cust:"Steuerbüro Hahn", desc:"Laptop-Reparatur", amt:180, status:"bezahlt", due:"beglichen" }
];
var prices = [
  { k:"Privat", f:0.9 }, { k:"Kleinunternehmen", f:1.0 }, { k:"Mittelstand", f:1.2 }, { k:"Behörde", f:1.4 }
];
var kb = {
  kb1: { t:"Drucker-Treiber sauber installieren", b:"1. Treiber nur vom Hersteller laden.\n2. Alte Druckertreiber im Druckserver entfernen.\n3. Testseite drucken.\n\nTipp: Treiber-Update außerhalb der Geschäftszeit planen, sonst fehlt dem Kunden der Drucker.", meta:"Zuletzt geprüft vor 12 Tagen · Gültig bis Q2" },
  kb2: { t:"WLAN-Firmware sicher aktualisieren", b:"Firmware nur im Change-Fenster einspielen.\n\nVor dem Update: Konfiguration sichern, Kunden informieren, Rückfallplan bereithalten.", meta:"Prüfen: Grund ist ein offenes Problem" },
  kb3: { t:"Passwort zurücksetzen (Vorlage)", b:"1. Identität über Rückruf bestätigen.\n2. Konto im Verzeichnis entsperren.\n3. Einmal-Passwort setzen, Änderung beim nächsten Login erzwingen.\n4. Kunden bestätigen lassen.", meta:"Aktuell · für den Empfang" }
};
/* ---------- Routen ---------- */
var ROUTES = {
  "postmortem": { g:"ITSM", t:"Post-Mortems" },
  "rechner":    { g:"Betrieb",t:"Arbeitsrechner" },
  "werkstatt":  { g:"Betrieb",t:"Werkstatt" },
  "zugriff":     { g:"Betrieb",t:"Zugriff" },
  "dienste":    { g:"Betrieb",t:"Dienste" },
  "berichte":   { g:"Betrieb",t:"Berichte" },
  "routinen":   { g:"ITSM",   t:"Assets und Routinen" },
  "login":        { g:"Konto",  t:"Anmelden" },
  "saves":        { g:"Spiel",  t:"Speicherstände" },
  "neues-spiel":  { g:"Spiel",  t:"Neues Spiel" },
  "einstellungen":{ g:"Spiel",  t:"Einstellungen" },
  "uebersicht":   { g:"Betrieb",t:"Übersicht" },
  "tickets":      { g:"Betrieb",t:"Tickets" },
  "ticket":       { g:"Betrieb",t:"Ticket" },
  "serverraum":   { g:"Betrieb",t:"Serverraum" },
  "personal":     { g:"Betrieb",t:"Personal" },
  "finanzen":     { g:"Betrieb",t:"Finanzen" },
  "verzeichnis":  { g:"Betrieb",t:"Active Directory" },
  "katalog":      { g:"ITSM",   t:"Service-Katalog" },
  "changes":      { g:"ITSM",   t:"Changes" },
  "cmdb":         { g:"ITSM",   t:"CMDB" },
  "probleme":     { g:"ITSM",   t:"Probleme" },
  "wissen":       { g:"ITSM",   t:"Wissen" },
  "admin":        { g:"Server", t:"Server-Admin" },
  "support":      { g:"Spiel",  t:"Hilfe und Support" },
  "changelog":    { g:"Spiel",  t:"Changelog" }
};
var currentTicket = "T-1033";

/* ---------- Toasts ---------- */
function toast(msg, kind){
  var el = document.createElement("div");
  el.className = "toast" + (kind ? " " + kind : "");
  el.innerHTML = "<span>" + esc(msg) + "</span>";
  $("#toasts").appendChild(el);
  setTimeout(function(){ el.remove(); }, 3200);
}

/* ---------- Modal ---------- */
var lastFocus = null;
function openModal(opts){
  lastFocus = document.activeElement;
  var wrap = document.createElement("div");
  wrap.className = "overlay";
  wrap.innerHTML =
    '<div class="modal' + (opts.wide ? " wide" : "") + '" role="dialog" aria-modal="true" aria-labelledby="mdTitle">' +
      '<div class="modal-h"><div><h2 id="mdTitle">' + esc(opts.title) + '</h2>' + (opts.sub ? '<p class="hint" style="margin-top:4px">' + esc(opts.sub) + '</p>' : '') + '</div>' +
      '<button class="btn btn-g btn-sm" type="button" data-close aria-label="Schließen">✕</button></div>' +
      '<form class="modal-b" novalidate>' + opts.body + '</form>' +
      '<div class="modal-f">' + (opts.actions || "") + '</div>' +
    '</div>';
  $("#modalRoot").appendChild(wrap);
  function close(){
    wrap.remove();
    document.removeEventListener("keydown", onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function onKey(e){ if (e.key === "Escape") close(); }
  document.addEventListener("keydown", onKey);
  wrap.addEventListener("click", function(e){
    if (e.target === wrap || e.target.closest("[data-close]")) { close(); return; }
    var b = e.target.closest("[data-mdact]");
    if (b && opts.onAction) opts.onAction(b.getAttribute("data-mdact"), wrap, close);
  });
  var first = wrap.querySelector("input,select,textarea");
  if (first) setTimeout(function(){ first.focus(); }, 30);
  if (opts.init) opts.init(wrap, close);
  return { el: wrap, close: close };
}
function confirmModal(title, text, label, kind, onYes){
  openModal({
    title: title,
    body: '<p class="muted" style="font-size:15px">' + text + '</p>',
    actions: '<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn ' + (kind || "") + '" type="button" data-mdact="yes">' + esc(label) + '</button>',
    onAction: function(a, el, close){ if (a === "yes"){ close(); onYes(); } }
  });
}
function field(id, label, input, err, hint){
  return '<div class="field"><label for="' + id + '">' + label + '</label>' + input +
    (hint ? '<div class="hint">' + hint + '</div>' : '') + '<div class="err" id="' + id + 'Err"></div></div>';
}
function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

/* ---------- Routing ---------- */
function currentRoute(){
  var h = (location.hash || "").replace("#", "");
  return ROUTES[h] ? h : "login";
}
function render(){
  var r = currentRoute();
  if (typeof platformGuard === "function" && !platformGuard(r)) return;
  document.body.setAttribute("data-route", r);
  document.body.classList.toggle("is-login", r === "login");
  $$("[data-screen]").forEach(function(s){ s.hidden = s.getAttribute("data-screen") !== r; });
  $$("[data-nav]").forEach(function(a){
    if (a.getAttribute("data-nav") === r) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  var meta = ROUTES[r];
  var crumbs = $("#crumbs");
  if (r === "login") { document.title = "Anmelden · CraftIT"; }
  else {
    crumbs.innerHTML = "<span>" + esc(meta.g) + "</span><span>/</span><b>" + esc(meta.t) + "</b>";
    document.title = meta.t + " · CraftIT";
  }
  renderAll();
  if (r === "ticket") renderTicket();
  if (r === "neues-spiel") wizardRender();
  closePops();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", render);

/* ---------- Thema ---------- */
function applyTheme(t){
  var root = document.documentElement;
  if (t === "light" || t === "dark") root.setAttribute("data-theme", t);
  else root.removeAttribute("data-theme");
  $$("[data-theme-set]").forEach(function(b){
    b.setAttribute("aria-pressed", b.getAttribute("data-theme-set") === t ? "true" : "false");
  });
  store.set("theme", t);
}
$$("[data-theme-set]").forEach(function(b){
  b.addEventListener("click", function(){ applyTheme(b.getAttribute("data-theme-set")); });
});

/* ---------- Popovers ---------- */
function closePops(){
  $$(".pop").forEach(function(p){ p.hidden = true; });
  $$("#bellBtn,#userBtn").forEach(function(b){ b.setAttribute("aria-expanded", "false"); });
}
function togglePop(btn, pop){
  var open = pop.hidden;
  closePops();
  if (open){ pop.hidden = false; btn.setAttribute("aria-expanded", "true"); }
}
$("#bellBtn").addEventListener("click", function(e){ e.stopPropagation(); togglePop(this, $("#bellPop")); });
$("#userBtn").addEventListener("click", function(e){ e.stopPropagation(); togglePop(this, $("#userPop")); });
document.addEventListener("click", function(e){
  if (!e.target.closest(".pop")) closePops();
});

/* ---------- Spielzeit ---------- */
var minutes = 14 * 60 + 20, day = 42, paused = false;
function tickClock(){
  if (paused || !P.save) return;
  minutes += 1;
  if (minutes >= 24 * 60){ minutes = 0; day += 1; }
  var hh = String(Math.floor(minutes / 60)).padStart(2, "0"), mm = String(minutes % 60).padStart(2, "0");
  $("#clock").innerHTML = "Tag <b>" + day + "</b> · <b>" + hh + ":" + mm + "</b>";
}
setInterval(tickClock, 4000);
$("#pauseBtn").addEventListener("click", function(){
  paused = !paused;
  this.textContent = paused ? "Weiter" : "Pause";
  this.setAttribute("aria-pressed", paused ? "true" : "false");
  toast(paused ? "Spielzeit angehalten." : "Spielzeit läuft weiter.");
});

/* ---------- Neues Spiel (Assistent) ---------- */
var wiz = { step:0, type:"einzel", name:"", diff:"normal", focus:"it" };
var WIZ_STEPS = ["Spielart", "Firma", "Schwierigkeit", "Bestätigen"];
function wizardRender(){
  $("#wizSteps").innerHTML = WIZ_STEPS.map(function(s, i){
    var cls = i === wiz.step ? "on" : (i < wiz.step ? "done" : "");
    return '<span class="step ' + cls + '"><b>' + (i < wiz.step ? "✓" : i + 1) + '</b>' + s + '</span>';
  }).join("");
  var b = "";
  if (wiz.step === 0){
    b = '<h2>Wie wollt ihr spielen?</h2><div class="grid g2e" role="group" aria-label="Spielart">' +
      '<button class="opt" type="button" data-wiz="type" data-v="einzel" aria-pressed="' + (wiz.type === "einzel") + '"><span class="t">Einzelspiel</span><span class="d">Eine Firma, eigener Takt. Die Zeit läuft nur, während du spielst.</span></button>' +
      '<button class="opt" type="button" data-wiz="type" data-v="koop" aria-pressed="' + (wiz.type === "koop") + '"><span class="t">Koop-Spiel</span><span class="d">Bis zu 6 Mitglieder mit Rollen Owner, Manager und Staff.</span></button></div>';
  }
  if (wiz.step === 1){
    b = '<h2>Firma benennen</h2>' +
      '<div class="field"><label for="wizName">Firmenname</label><input class="inp" id="wizName" maxlength="40" value="' + esc(wiz.name) + '" placeholder="z. B. Nordlicht IT Service"><div class="hint">Kann im Spiel später geändert werden.</div><div class="err" id="wizNameErr"></div></div>' +
      '<div class="field"><span class="lbl">Schwerpunkt</span><div class="grid g2e" role="group" aria-label="Schwerpunkt">' +
      '<button class="opt" type="button" data-wiz="focus" data-v="it" aria-pressed="' + (wiz.focus === "it") + '"><span class="t">IT-Service</span><span class="d">Tickets, Hardware, Serverraum.</span></button>' +
      '<button class="opt" type="button" data-wiz="focus" data-v="net" aria-pressed="' + (wiz.focus === "net") + '"><span class="t">Netzwerk-Spezialist</span><span class="d">Mehr Changes, mehr Infrastruktur.</span></button></div></div>';
  }
  if (wiz.step === 2){
    b = '<h2>Schwierigkeit</h2><div class="grid g3" role="group" aria-label="Schwierigkeit">' +
      [["leicht","Leicht","Mehr Zeit, mildere SLA."],["normal","Normal","Empfohlen für den Einstieg."],["schwer","Schwer","Strenge SLA, mehr Major Incidents."]].map(function(d){
        return '<button class="opt" type="button" data-wiz="diff" data-v="' + d[0] + '" aria-pressed="' + (wiz.diff === d[0]) + '"><span class="t">' + d[1] + '</span><span class="d">' + d[2] + '</span></button>';
      }).join("") + '</div><p class="hint">Die Schwierigkeit lässt sich nach dem Start nicht mehr ändern.</p>';
  }
  if (wiz.step === 3){
    b = '<h2>Alles bereit?</h2><dl class="kv">' +
      '<dt>Spielart</dt><dd>' + (wiz.type === "koop" ? "Koop-Spiel" : "Einzelspiel") + '</dd>' +
      '<dt>Firma</dt><dd>' + esc(wiz.name || "—") + '</dd>' +
      '<dt>Schwerpunkt</dt><dd>' + (wiz.focus === "it" ? "IT-Service" : "Netzwerk-Spezialist") + '</dd>' +
      '<dt>Schwierigkeit</dt><dd>' + ({leicht:"Leicht",normal:"Normal",schwer:"Schwer"})[wiz.diff] + '</dd></dl>' +
      '<div class="note info">Das Spiel startet mit Tag 1, 3 Mitarbeitenden und 18.420 € Startkapital.</div>';
  }
  $("#wizBody").innerHTML = b;
  $("#wizBack").disabled = wiz.step === 0;
  $("#wizNext").textContent = wiz.step === 3 ? "Spiel starten" : "Weiter";
}
$("#wizBody").addEventListener("click", function(e){
  var o = e.target.closest("[data-wiz]");
  if (!o) return;
  var k = o.getAttribute("data-wiz"), v = o.getAttribute("data-v");
  if (k === "type") wiz.type = v;
  if (k === "focus") wiz.focus = v;
  if (k === "diff") wiz.diff = v;
  wizardRender();
});
$("#wizBody").addEventListener("input", function(e){
  if (e.target.id === "wizName") wiz.name = e.target.value;
});
$("#wizBack").addEventListener("click", function(){ if (wiz.step > 0){ wiz.step--; wizardRender(); } });
$("#wizNext").addEventListener("click", function(){
  if (wiz.step === 1){
    var n = $("#wizName");
    if (!n || !n.value.trim()){ $("#wizNameErr").textContent = "Bitte einen Firmennamen eingeben."; if (n) n.setAttribute("aria-invalid","true"); if (n) n.focus(); return; }
  }
  if (wiz.step < 3){ wiz.step++; wizardRender(); return; }
  createSaveFromWizard();
});

/* ---------- Übersicht ---------- */
function renderHome(){
  var open = tickets.filter(function(t){ return t.status !== "Gelöst"; });
  $("#kpiOpen").textContent = open.length;
  $("#navTickets").textContent = open.length;
  $("#homeTickets").innerHTML = open.slice(0, 3).map(function(t){
    return '<button class="li" type="button" data-open="' + t.id + '" style="background:none;border:0;border-bottom:1px solid var(--line);color:var(--ink);text-align:left;width:100%;padding:14px 0"><span class="main-t"><span style="display:block;font-weight:650">' + esc(t.title) + '</span><span class="sub muted" style="font-size:13px">' + esc(t.id) + ' · ' + esc(t.cust) + '</span></span>' + prioTag(t.prio) + '</button>';
  }).join("");
}
function prioTag(p){
  var c = p === "Kritisch" ? "t-bad" : p === "Hoch" ? "t-warn" : p === "Mittel" ? "t-info" : "t-mut";
  return '<span class="tag ' + c + '">' + esc(p) + '</span>';
}
function statusTag(s){
  var c = s === "Major Incident" ? "t-bad" : s === "Gelöst" ? "t-ok" : s === "In Arbeit" ? "t-info" : "t-warn";
  return '<span class="tag ' + c + '">' + esc(s) + '</span>';
}

/* ---------- Tickets ---------- */
var ticketFilter = "all";
var ticketSort = { key:"prio", dir:-1 };
var PRIO_RANK = { "Kritisch":4, "Hoch":3, "Mittel":2, "Niedrig":1 };
var IMPACT = ["", "1 Person", "Team", "Gebäude", "Firma"];
var URGENCY = ["", "Wann es passt", "Diese Woche", "Heute", "Sofort"];
var CATS = ["Hardware", "Netzwerk", "Software", "Konten und Zugriff", "E-Mail", "Drucken", "Cloud", "Sicherheit", "Datenwiederherstellung", "Sonstiges"];
var INV = {
  ping:    ["PS> Test-Connection 10.0.4.21", "Zeitüberschreitung bei der Anfrage"],
  logs:    ["PS> Get-EventLog System -Newest 5", "Spooler: Treiber beim Start abgebrochen"],
  restart: ["PS> Restart-Service Spooler", "Dienst gestartet. Der Drucker meldet weiter offline."],
  driver:  ["PS> pnputil /add-driver treiber.inf /install", "Treiber installiert. Port 9100 noch nicht erreichbar."]
};
var closedInShift = [];
var baseTerm = null;

function prioFrom(i, u){ var s = i + u; return s >= 7 ? "Kritisch" : s >= 6 ? "Hoch" : s >= 4 ? "Mittel" : "Niedrig"; }
function sortVal(t, k){
  if (k === "prio") return PRIO_RANK[t.prio];
  if (k === "sla") return t.slaMin;
  if (k === "impact") return t.impact;
  if (k === "urgency") return t.urgency;
  if (k === "status") return t.status;
  if (k === "id") return t.id;
  if (k === "cat") return t.cat;
  return t.title;
}
function renderCash(){ $("#cashTitle").textContent = eur(cash) + " auf dem Konto."; }

function renderTickets(){
  var q = ($("#ticketSearch").value || "").toLowerCase();
  var cat = $("#ticketCat").value;
  var list = tickets.filter(function(t){
    if (ticketFilter === "open" && t.status === "Gelöst") return false;
    if (ticketFilter === "sla" && !(t.prio === "Kritisch" || t.prio === "Hoch")) return false;
    if (ticketFilter === "done" && t.status !== "Gelöst") return false;
    if (cat && t.cat !== cat) return false;
    if (q && (t.title + " " + t.cust + " " + t.id + " " + t.requester).toLowerCase().indexOf(q) < 0) return false;
    return true;
  });
  var k = ticketSort.key, d = ticketSort.dir;
  list.sort(function(a, b){
    var va = sortVal(a, k), vb = sortVal(b, k);
    return va < vb ? -d : va > vb ? d : 0;
  });
  $("#ticketRows").innerHTML = list.map(function(t){
    return '<tr class="click" data-open="' + t.id + '">' +
      '<td><div style="font-weight:650">' + esc(t.title) + '</div><div class="sub">' + esc(t.id) + '</div></td>' +
      '<td>' + esc(t.requester) + '<div class="sub">' + esc(t.cust) + '</div></td>' +
      '<td>' + esc(t.cat) + '</td>' +
      '<td>' + esc(IMPACT[t.impact]) + '<div class="sub">' + esc(URGENCY[t.urgency]) + '</div></td>' +
      '<td>' + prioTag(t.prio) + '</td>' +
      '<td class="num">' + esc(t.sla) + '</td>' +
      '<td>' + statusTag(t.status) + '</td>' +
      '<td>' + esc(t.who) + '</td>' +
      '<td><button class="btn btn-s btn-sm" type="button" data-assign="' + t.id + '">Zuweisen</button></td></tr>';
  }).join("");
  $$("#ticketHead [data-sort]").forEach(function(b){
    var key = b.getAttribute("data-sort");
    var on = key === k;
    b.setAttribute("aria-sort", on ? (d > 0 ? "ascending" : "descending") : "none");
    b.querySelector(".arr").textContent = on ? (d > 0 ? " ▲" : " ▼") : "";
  });
  $("#ticketEmpty").hidden = list.length > 0;
}
$("#ticketHead").addEventListener("click", function(e){
  var b = e.target.closest("[data-sort]");
  if (!b) return;
  var key = b.getAttribute("data-sort");
  ticketSort = ticketSort.key === key ? { key:key, dir:-ticketSort.dir } : { key:key, dir:1 };
  renderTickets();
});
$("#ticketCat").innerHTML = '<option value="">Alle Kategorien</option>' + CATS.map(function(c){ return '<option>' + esc(c) + '</option>'; }).join("");
$("#ticketCat").addEventListener("change", renderTickets);
$("#ticketRows").addEventListener("click", function(e){
  var a = e.target.closest("[data-assign]");
  if (a){ e.stopPropagation(); currentTicket = a.getAttribute("data-assign"); assignModal(); }
});
$("#ticketChips").addEventListener("click", function(e){
  var c = e.target.closest("[data-f]");
  if (!c) return;
  ticketFilter = c.getAttribute("data-f");
  $$("#ticketChips .chip").forEach(function(x){ x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
  renderTickets();
});
$("#ticketSearch").addEventListener("input", renderTickets);

document.addEventListener("click", function(e){
  var o = e.target.closest("[data-open]");
  if (o && !e.target.closest("[data-assign]")){ currentTicket = o.getAttribute("data-open"); location.hash = "ticket"; }
});

function findTicket(){ return tickets.filter(function(t){ return t.id === currentTicket; })[0] || tickets[0]; }
function addThread(t, k, who, text){
  t.thread.push({ k:k, who:who, text:text, when:"Gerade eben" });
}
function renderTicket(){
  var t = findTicket();
  if (baseTerm === null) baseTerm = $("#tkTerm").innerHTML;
  $("#tkId").textContent = t.id;
  $("#tkTitle").textContent = t.title;
  $("#tkStatus").textContent = t.status;
  $("#tkStatus").className = "tag " + (t.status === "Gelöst" ? "t-ok" : t.status === "Major Incident" ? "t-bad" : t.status === "Wartet auf Kunde" ? "t-warn" : "t-info");
  $("#tkKv").innerHTML =
    "<dt>Anfragende Person</dt><dd>" + esc(t.requester) + "</dd>" +
    "<dt>Kunde</dt><dd>" + esc(t.cust) + "</dd>" +
    "<dt>Kategorie</dt><dd>" + esc(t.cat) + "</dd>" +
    "<dt>Auswirkung</dt><dd>" + esc(IMPACT[t.impact]) + "</dd>" +
    "<dt>Dringlichkeit</dt><dd>" + esc(URGENCY[t.urgency]) + "</dd>" +
    "<dt>Priorität</dt><dd>" + prioTag(t.prio) + "</dd>" +
    "<dt>Zuständig</dt><dd>" + esc(t.who) + "</dd>" +
    "<dt>SLA-Rest</dt><dd class=\"num\">" + esc(t.sla) + "</dd>";
  $("#tkSla").textContent = t.sla;
  renderThread(t);
  $("#tkTerm").innerHTML = baseTerm + t.log.map(function(l){ return '<span>' + esc(l) + '</span>'; }).join("");
  $("#tkInvCount").textContent = t.inv + (t.inv === 1 ? " Schritt bisher" : " Schritte bisher");
  $("#tkReopen").hidden = t.status !== "Gelöst";
  $("#tkRequest").textContent = t.status === "Wartet auf Kunde" ? "Antwort erhalten" : "Rückfrage stellen";
  $("#tkRequest").setAttribute("data-act", "request");
  updateConn();
}
function investigate(k){
  var t = findTicket();
  var lines = INV[k];
  t.log.push(lines[0], lines[1]);
  t.inv++;
  renderTicket();
  renderAll();
}
$("#tkInv").addEventListener("click", function(e){
  var b = e.target.closest("[data-inv]");
  if (b) investigate(b.getAttribute("data-inv"));
});

function assignModal(){
  var t = findTicket();
  openModal({
    title: "Ticket zuweisen", sub: t.id + " · " + t.title,
    body: field("asgWho", "Zuständige Person", '<select class="inp" id="asgWho">' + staffList.map(function(n){ return '<option' + (n === t.who ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join("") + '</select>') +
      '<div class="hint">Die Auslastung der Person steht unter Personal.</div>',
    actions: '<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Zuweisen</button>',
    onAction: function(a, el, close){
      if (a !== "save") return;
      var who = $("#asgWho", el).value;
      t.who = who;
      if (t.status === "Offen") t.status = "In Arbeit";
      addThread(t, "staff", who, "Ticket übernommen.");
      close(); renderAll(); renderTicket();
      toast("Zugewiesen an " + who + ".", "ok");
    }
  });
}
function triageModal(){
  var t = findTicket();
  var impOpts = IMPACT.slice(1).map(function(l, i){ return '<option value="' + (i + 1) + '"' + (i + 1 === t.impact ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join("");
  var urgOpts = URGENCY.slice(1).map(function(l, i){ return '<option value="' + (i + 1) + '"' + (i + 1 === t.urgency ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join("");
  var catOpts = CATS.map(function(c){ return '<option' + (c === t.cat ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join("");
  openModal({
    title: "Triage", sub: t.id + " · Kategorie, Auswirkung und Dringlichkeit festlegen",
    body: field("triCat", "Kategorie", '<select class="inp" id="triCat">' + catOpts + '</select>') +
      '<div class="grid g2e" style="gap:14px">' + field("triImp", "Auswirkung", '<select class="inp" id="triImp">' + impOpts + '</select>') + field("triUrg", "Dringlichkeit", '<select class="inp" id="triUrg">' + urgOpts + '</select>') + '</div>' +
      '<div class="note info" id="triPrio"></div>' +
      '<div class="hint">Priorität ergibt sich aus Auswirkung und Dringlichkeit. Der Kunde hat „' + esc(t.prio) + '“ gewünscht.</div>',
    actions: '<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Triage speichern</button>',
    init: function(el){
      function upd(){
        var p = prioFrom(+$("#triImp", el).value, +$("#triUrg", el).value);
        $("#triPrio", el).textContent = "Neue Priorität: " + p;
      }
      el.addEventListener("change", upd);
      upd();
    },
    onAction: function(a, el, close){
      if (a !== "save") return;
      t.cat = $("#triCat", el).value;
      t.impact = +$("#triImp", el).value;
      t.urgency = +$("#triUrg", el).value;
      t.prio = prioFrom(t.impact, t.urgency);
      addThread(t, "staff", t.who, "Triage: " + t.cat + ", Auswirkung " + IMPACT[t.impact] + ", Dringlichkeit " + URGENCY[t.urgency] + ", Priorität " + t.prio + ".");
      close(); renderAll(); renderTicket();
      toast("Triage gespeichert. Priorität: " + t.prio + ".", "ok");
    }
  });
}
function noteModal(){
  var t = findTicket();
  openModal({
    title: "Interne Notiz", sub: "Nur für das Team sichtbar, der Kunde sieht sie nicht.",
    body: field("noteText", "Notiz", '<textarea class="inp" id="noteText" placeholder="z. B. Treiberstand auf dem Gerät prüfen"></textarea>', null, "Mindestens 3 Zeichen."),
    actions: '<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Notiz speichern</button>',
    onAction: function(a, el, close){
      if (a !== "save") return;
      var v = $("#noteText", el).value.trim();
      if (v.length < 3){ $("#noteTextErr", el).textContent = "Bitte mindestens 3 Zeichen eingeben."; return; }
      t.notes.push(v);
      t.thread.push({ k:"note", who:"Intern", text:v, when:"Gerade eben" });
      close(); renderTicket(); toast("Notiz gespeichert.", "ok");
    }
  });
}
function requestModal(){
  var t = findTicket();
  if (t.status === "Wartet auf Kunde"){
    t.status = "In Arbeit";
    t.thread.push({ k:"client", who:t.requester.split(",")[0], text:"Danke für die Rückmeldung. Ich warte dann auf Sie.", when:"Gerade eben" });
    renderAll(); renderTicket(); toast("Antwort erhalten. Das Ticket läuft weiter.", "ok");
    return;
  }
  openModal({
    title: "Rückfrage an den Kunden", sub: t.id + " · " + t.requester,
    body: field("askText", "Frage", '<textarea class="inp" id="askText" placeholder="z. B. Welches Modell steht auf dem Drucker?"></textarea>', null, "Das Ticket wartet dann auf Antwort. Der SLA-Timer läuft nur, wo die Regeln es erlauben."),
    actions: '<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Rückfrage senden</button>',
    onAction: function(a, el, close){
      if (a !== "save") return;
      var v = $("#askText", el).value.trim();
      if (v.length < 10){ $("#askTextErr", el).textContent = "Bitte eine konkrete Frage stellen (mindestens 10 Zeichen)."; return; }
      t.status = "Wartet auf Kunde";
      t.thread.push({ k:"ask", who:t.who, text:v, when:"Gerade eben" });
      close(); renderAll(); renderTicket(); toast("Rückfrage gesendet. Das Ticket wartet auf den Kunden.", "ok");
    }
  });
}
function resolveModal(){
  var t = findTicket();
  openModal({
    title: "Lösung dokumentieren", sub: t.id,
    body: field("resText", "Was wurde gemacht?", '<textarea class="inp" id="resText" placeholder="Ursache, Schritte, Ergebnis"></textarea>', null, "Mindestens 20 Zeichen. Ein Eintrag hilft später in der Wissensdatenbank.") +
      (t.inv === 0 ? '<div class="note warn">Noch keine Untersuchung. Ohne Schritte im Terminal ist die Lösung schwer nachzuvollziehen.</div>' : '') +
      '<label class="check"><input type="checkbox" id="resKb" checked> Als Wissensartikel vorschlagen</label>',
    actions: '<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn btn-ok" type="button" data-mdact="save">Als gelöst markieren</button>',
    onAction: function(a, el, close){
      if (a !== "save") return;
      var v = $("#resText", el).value.trim();
      if (v.length < 20){ $("#resTextErr", el).textContent = "Bitte mindestens 20 Zeichen beschreiben."; $("#resText", el).setAttribute("aria-invalid", "true"); $("#resText", el).focus(); return; }
      var wasMajor = t.status === "Major Incident";
      t.status = "Gelöst";
      t.resolution = v;
      if (wasMajor) pmCreate(t);
      if (closedInShift.indexOf(t.id) < 0) closedInShift.push(t.id);
      t.thread.push({ k:"staff", who:t.who, text:"Lösung: " + v, when:"Gerade eben" });
      close(); renderAll(); renderTicket();
      toast("Ticket " + t.id + " gelöst.", "ok");
    }
  });
}
function reopenTicket(){
  var t = findTicket();
  confirmModal("Lösung zurücknehmen?", "Das Ticket wird wieder geöffnet. Die alte Lösung bleibt im Verlauf sichtbar, damit nichts verloren geht.", "Wieder öffnen", "", function(){
    t.status = "Offen";
    closedInShift = closedInShift.filter(function(id){ return id !== t.id; });
    t.thread.push({ k:"note", who:"Intern", text:"Lösung zurückgenommen.", when:"Gerade eben" });
    renderAll(); renderTicket(); toast("Ticket " + t.id + " ist wieder offen.", "ok");
  });
}
function escalateModal(){
  var t = findTicket();
  openModal({
    title: "Eskalieren", sub: t.id + " · " + t.title,
    body: field("escLevel", "Stufe", '<select class="inp" id="escLevel"><option>Zweite Stufe (Senior)</option><option>Netzwerk-Team</option><option>Major Incident ausrufen</option></select>') +
      '<div class="note warn">Ein Major Incident setzt die Priorität auf Kritisch und startet den Krisenraum.</div>',
    actions: '<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Eskalieren</button>',
    onAction: function(a, el, close){
      if (a !== "save") return;
      var lvl = $("#escLevel", el).value;
      if (lvl.indexOf("Major") === 0){ t.status = "Major Incident"; t.prio = "Kritisch"; }
      addThread(t, "staff", t.who, "Eskaliert an: " + lvl + ".");
      close(); renderAll(); renderTicket();
      toast("Eskaliert an: " + lvl + ".", "ok");
    }
  });
}
function newTicketModal(){
  openModal({
    title: "Neues Ticket", sub: "Kunde meldet ein Problem oder Anliegen",
    body: field("ntCust", "Kunde", '<select class="inp" id="ntCust"><option>Bäckerei Krumm</option><option>Logistik Weidner</option><option>Steuerbüro Hahn</option><option>Arztpraxis Beispiel</option></select>') +
      field("ntTitle", "Kurzbeschreibung", '<input class="inp" id="ntTitle" maxlength="80" placeholder="z. B. Drucker offline">') +
      '<div class="grid g2e" style="gap:14px">' + field("ntImp", "Auswirkung", '<select class="inp" id="ntImp"><option value="1">1 Person</option><option value="2" selected>Team</option><option value="3">Gebäude</option><option value="4">Firma</option></select>') + field("ntUrg", "Dringlichkeit", '<select class="inp" id="ntUrg"><option value="1">Wann es passt</option><option value="2" selected>Diese Woche</option><option value="3">Heute</option><option value="4">Sofort</option></select>') + '</div>',
    actions: '<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Ticket anlegen</button>',
    onAction: function(a, el, close){
      if (a !== "save") return;
      var title = $("#ntTitle", el).value.trim();
      if (title.length < 3){ $("#ntTitleErr", el).textContent = "Bitte eine kurze Beschreibung eingeben."; $("#ntTitle", el).setAttribute("aria-invalid", "true"); $("#ntTitle", el).focus(); return; }
      var n = 1035 + tickets.length;
      var imp = +$("#ntImp", el).value, urg = +$("#ntUrg", el).value;
      var cust = $("#ntCust", el).value;
      tickets.unshift({ id:"T-" + n, title:title, cust:cust, requester:"Kontakt bei " + cust, cat:"Sonstiges", impact:imp, urgency:urg, prio:prioFrom(imp, urg), sla:"4 h", slaMin:240, status:"Offen", who:"—", inv:0, log:[], notes:[], resolution:"",
        thread:[{ k:"client", who:"Kontakt bei " + cust, text:title + ". Vom Kunden telefonisch gemeldet.", when:"Gerade eben" }] });
      close(); renderAll(); toast("Ticket T-" + n + " angelegt.", "ok");
    }
  });
}

/* ---------- Schicht ---------- */
var shiftIndex = 0;
function shiftPreview(){
  var open = tickets.filter(function(t){ return t.status !== "Gelöst"; }).length;
  return { done: closedInShift.length, open: open, paid: closedInShift.length * 150 };
}
function endShift(){
  var pre = shiftPreview();
  confirmModal("Schicht beenden?",
    "Erledigte Tickets werden bezahlt (" + pre.done + " Tickets). Offene Arbeit wandert in die nächste Schicht (" + pre.open + " Tickets). Zwei neue Tickets kommen dazu.",
    "Schicht beenden", "", function(){
      var paid = closedInShift.length * 150;
      cash += paid;
      for (var i = 0; i < 2; i++){
        var p = POOL[shiftIndex % POOL.length];
        shiftIndex++;
        var n = 1040 + shiftIndex;
        tickets.unshift({ id:"T-" + n, title:p.title, cust:p.cust, requester:p.requester, cat:p.cat, impact:p.impact, urgency:p.urgency, prio:prioFrom(p.impact, p.urgency), sla:"4 h", slaMin:240, status:"Offen", who:"—", inv:0, log:[], notes:[], resolution:"",
          thread:[{ k:"client", who:p.requester, text:p.title + ".", when:"Heute, Schichtbeginn" }] });
      }
      shiftLog.unshift({ day: day, done: pre.done, open: pre.open, added: 2, paid: paid });
      closedInShift = [];
      day += 1; minutes = 8 * 60; deliverOrders();
      $("#clock").innerHTML = "Tag <b>" + day + "</b> · <b>08:00</b>";
      renderAll();
      openModal({
        title: "Schichtbericht", sub: "Tag " + (day - 1) + " ist abgeschlossen.",
        body: '<dl class="kv"><dt>Erledigt</dt><dd class="num">' + pre.done + ' Tickets</dd><dt>Verschoben</dt><dd class="num">' + pre.open + ' Tickets</dd><dt>Neu eingegangen</dt><dd class="num">2 Tickets</dd><dt>Einnahmen</dt><dd class="num">' + eur(paid) + '</dd><dt>Kasse</dt><dd class="num">' + eur(cash) + '</dd></dl>' +
          '<div class="note info">Die Schicht beginnt um 08:00. Die Spielzeit läuft ab jetzt weiter.</div>',
        actions: '<button class="btn" type="button" data-close>Weiter</button>'
      });
    });
}

/* ---------- Changes ---------- */
function renderChanges(){
  $("#changeRows").innerHTML = changes.map(function(c){
    var rc = c.risk === "Hoch" ? "t-bad" : c.risk === "Mittel" ? "t-warn" : "t-ok";
    var tc = c.type === "Emergency" ? "t-bad" : c.type === "Normal" ? "t-info" : "t-ok";
    var action = c.status === "Zur Prüfung" ? '<button class="btn btn-sm" type="button" data-cab="' + c.id + '">CAB-Entscheid</button>' : "";
    return '<tr><td><div style="font-weight:650">' + esc(c.title) + '</div><div class="sub">' + esc(c.id) + '</div></td><td><span class="tag ' + tc + '">' + esc(c.type) + '</span></td><td><span class="tag ' + rc + '">' + esc(c.risk) + '</span></td><td>' + esc(c.status) + '</td><td>' + action + '</td></tr>';
  }).join("");
}
$("#changeRows").addEventListener("click", function(e){
  var b = e.target.closest("[data-cab]");
  if (!b) return;
  var c = changes.filter(function(x){ return x.id === b.getAttribute("data-cab"); })[0];
  openModal({
    title: "CAB-Entscheid", sub: c.id + " · " + c.title,
    body: '<fieldset style="border:0;padding:0;margin:0;display:flex;flex-direction:column;gap:10px"><legend class="lbl" style="margin-bottom:8px">Entscheidung</legend>' +
      '<label class="check" style="color:var(--ink)"><input type="radio" name="cab" value="ok" checked> Genehmigen</label>' +
      '<label class="check" style="color:var(--ink)"><input type="radio" name="cab" value="later"> Zurückstellen</label>' +
      '<label class="check" style="color:var(--ink)"><input type="radio" name="cab" value="no"> Ablehnen</label></fieldset>' +
      field("cabNote", "Begründung", '<textarea class="inp" id="cabNote" placeholder="Kurze Begründung für das Protokoll"></textarea>'),
    actions: '<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Entscheidung speichern</button>',
    onAction: function(a, el, close){
      if (a !== "save") return;
      var v = el.querySelector("input[name=cab]:checked").value;
      c.status = v === "ok" ? "Genehmigt" : v === "no" ? "Abgelehnt" : "Zurückgestellt";
      audit.unshift({ t:"Gerade eben", who:"CAB", what:c.id + " " + c.status.toLowerCase(), ref:c.id });
      close(); renderAll(); toast("CAB: " + c.id + " " + c.status.toLowerCase() + ".", v === "no" ? "bad" : "ok");
    }
  });
});
function newChangeModal(){
  openModal({
    title: "Change beantragen",
    body: field("chTitle", "Titel", '<input class="inp" id="chTitle" maxlength="80" placeholder="z. B. Switch-Firmware aktualisieren">') +
      field("chType", "Typ", '<select class="inp" id="chType"><option>Standard</option><option selected>Normal</option><option>Emergency</option></select>', null, "Standard ist vorab genehmigt. Emergency geht ohne CAB sofort raus.") +
      field("chRisk", "Risiko", '<select class="inp" id="chRisk"><option>Niedrig</option><option selected>Mittel</option><option>Hoch</option></select>'),
    actions: '<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Beantragen</button>',
    onAction: function(a, el, close){
      if (a !== "save") return;
      var title = $("#chTitle", el).value.trim();
      if (title.length < 3){ $("#chTitleErr", el).textContent = "Bitte einen Titel eingeben."; return; }
      var type = $("#chType", el).value;
      changes.unshift({ id:"CHG-" + (207 + changes.length - 3), title:title, type:type, risk:$("#chRisk", el).value, status: type === "Standard" ? "Genehmigt" : "Zur Prüfung", cab: type === "Emergency" ? "Sofort" : "Mo, 09:00" });
      close(); renderChanges(); renderAll(); toast("Change beantragt.", "ok");
    }
  });
}

/* ---------- Dienste ---------- */
function svcState(s){ return s.avail < 95 ? "bad" : s.cap >= 90 ? "warn" : "ok"; }
function renderServices(){
  var bad = services.filter(function(s){ return svcState(s) !== "ok"; });
  var avg = services.reduce(function(a, s){ return a + s.avail; }, 0) / services.length;
  $("#svcAvail").textContent = avg.toFixed(1).replace(".", ",") + " %";
  $("#svcWarn").textContent = bad.length;
  $("#svcMaint").textContent = maint.length;
  $("#svcRows").innerHTML = services.map(function(s){
    var st = svcState(s);
    var tag = st === "bad" ? '<span class="tag t-bad">Störung</span>' : st === "warn" ? '<span class="tag t-warn">Warnung</span>' : '<span class="tag t-ok">OK</span>';
    var bc = s.cap >= 90 ? "warn" : "";
    return '<tr><td><div style="font-weight:650">' + esc(s.name) + '</div><div class="sub">' + esc(s.owner) + '</div></td>' +
      '<td class="num">' + String(s.avail).replace(".", ",") + ' %</td>' +
      '<td style="min-width:150px"><div class="bar ' + bc + '"><i style="width:' + s.cap + '%"></i></div><div class="sub num">' + s.cap + ' %</div></td>' +
      '<td>' + tag + '</td>' +
      '<td style="text-align:right;white-space:nowrap"><button class="btn btn-s btn-sm" type="button" data-svc-cap="' + s.id + '">Kapazität</button> <button class="btn btn-s btn-sm" type="button" data-svc-restore="' + s.id + '">Wiederherstellen</button></td></tr>';
  }).join("");
  $("#svcAlerts").innerHTML = bad.length ? bad.map(function(s){
    var msg = s.avail < 95 ? s.name + " ist unter 95 % Verfügbarkeit. Bitte untersuchen." : s.name + " ist zu " + s.cap + " % ausgelastet.";
    return '<div class="note ' + (svcState(s) === "bad" ? "bad" : "warn") + '">' + esc(msg) + '</div>';
  }).join("") : '<div class="note ok">Keine Warnungen. Alle Dienste laufen.</div>';
  $("#maintList").innerHTML = maint.length ? maint.map(function(m){
    return '<div class="li"><div class="main-t"><div style="font-weight:650">' + esc(m.svc) + '</div><div class="sub muted" style="font-size:13px">' + esc(m.when) + ' · als Change eingeplant</div></div><span class="tag t-info">' + esc(m.status) + '</span></div>';
  }).join("") : '<p class="hint">Keine Wartung geplant.</p>';
}
function serviceCapModal(id){
  var s = services.filter(function(x){ return x.id === id; })[0];
  openModal({
    title: "Kapazität erhöhen", sub: s.name + " · aktuell " + s.cap + " % ausgelastet",
    body: field("capStep", "Zusatz", '<select class="inp" id="capStep"><option value="10">+10 % für 900 €</option><option value="20">+20 % für 1.800 €</option></select>', null, "Kostet Budget und dauert eine Schicht bis zur Umsetzung."),
    actions: '<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Beauftragen</button>',
    onAction: function(a, el, close){
      if (a !== "save") return;
      var step = +$("#capStep", el).value, cost = step === 10 ? 900 : 1800;
      if (cash < cost){ toast("Zu wenig Budget für diese Erweiterung.", "bad"); return; }
      cash -= cost;
      s.cap = Math.max(0, s.cap - step);
      audit.unshift({ t:"Gerade eben", who:"Derrik", what:"Kapazität „" + s.name + "“ erhöht", ref:"Dienst" });
      close(); renderAll(); toast(s.name + " hat jetzt mehr Reserve.", "ok");
    }
  });
}
function serviceRestoreModal(id){
  var s = services.filter(function(x){ return x.id === id; })[0];
  confirmModal("Aus Backup wiederherstellen?", "„" + esc(s.name) + "“ wird aus dem Backup vom Tag 03:00 zurückgeholt. Änderungen seit 03:00 gehen verloren.", "Wiederherstellen", "btn-d", function(){
    s.avail = Math.min(100, s.avail + 5);
    audit.unshift({ t:"Gerade eben", who:"Derrik", what:"Dienst „" + s.name + "“ aus Backup wiederhergestellt", ref:"Restore" });
    renderAll(); toast(s.name + " läuft wieder.", "ok");
  });
}
function maintModal(){
  openModal({
    title: "Wartungsfenster planen", sub: "Wartung läuft als Change und braucht die Zustimmung des CAB.",
    body: field("mtSvc", "Dienst", '<select class="inp" id="mtSvc">' + services.map(function(s){ return '<option>' + esc(s.name) + '</option>'; }).join("") + '</select>') +
      field("mtWhen", "Zeitfenster", '<select class="inp" id="mtWhen"><option>Dienstag 22:00 bis 23:00</option><option>Samstag 06:00 bis 08:00</option></select>') +
      field("mtNote", "Was wird gemacht?", '<textarea class="inp" id="mtNote" placeholder="z. B. Firmware einspielen, Neustart"></textarea>'),
    actions: '<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Als Change einreichen</button>',
    onAction: function(a, el, close){
      if (a !== "save") return;
      var note = $("#mtNote", el).value.trim();
      if (note.length < 5){ $("#mtNoteErr", el).textContent = "Bitte kurz beschreiben, was gemacht wird."; return; }
      var svc = $("#mtSvc", el).value, when = $("#mtWhen", el).value;
      maint.push({ svc:svc, when:when, status:"geplant" });
      changes.unshift({ id:"CHG-" + (207 + changes.length - 3), title:"Wartung: " + svc, type:"Normal", risk:"Mittel", status:"Zur Prüfung", cab:when });
      close(); renderAll(); toast("Wartung eingereicht. Das CAB entscheidet.", "ok");
    }
  });
}
document.addEventListener("click", function(e){
  var c = e.target.closest("[data-svc-cap]");
  if (c) return serviceCapModal(c.getAttribute("data-svc-cap"));
  var r = e.target.closest("[data-svc-restore]");
  if (r) return serviceRestoreModal(r.getAttribute("data-svc-restore"));
});

/* ---------- Zugriff ---------- */
function renderAccess(){
  $("#accRows").innerHTML = accessReq.map(function(r){
    var pol = r.policy === "ok" ? '<span class="tag t-ok">Richtlinie erfüllt</span>' : '<span class="tag t-warn">' + esc(r.policy) + '</span>';
    var act = r.status === "offen"
      ? '<button class="btn btn-sm" type="button" data-acc="ok" data-id="' + r.id + '">Genehmigen</button> <button class="btn btn-s btn-sm" type="button" data-acc="no" data-id="' + r.id + '">Ablehnen</button>'
      : '<span class="tag ' + (r.status === "genehmigt" ? "t-ok" : "t-mut") + '">' + esc(r.status) + '</span>';
    return '<tr><td><div style="font-weight:650">' + esc(r.who) + '</div><div class="sub">' + esc(r.requester) + '</div></td><td>' + esc(r.what) + '</td><td>' + pol + '</td><td style="text-align:right;white-space:nowrap">' + act + '</td></tr>';
  }).join("");
  $("#auditList").innerHTML = audit.length ? audit.map(function(a){
    return '<div class="li" style="padding:10px 0"><div class="main-t"><div style="font-weight:600">' + esc(a.what) + '</div><div class="sub muted" style="font-size:13px">' + esc(a.who) + ' · ' + esc(a.t) + ' · ' + esc(a.ref) + '</div></div></div>';
  }).join("") : '<p class="hint">Noch keine Änderungen.</p>';
  $("#teamList").innerHTML = teams.map(function(t){
    return '<div class="li" style="padding:10px 0"><div class="main-t"><div style="font-weight:650">' + esc(t.name) + '</div><div class="sub muted" style="font-size:13px">' + esc(t.roles) + '</div></div><span class="tag t-mut">' + t.members + ' Personen</span></div>';
  }).join("");
}
$("#accRows").addEventListener("click", function(e){
  var b = e.target.closest("[data-acc]");
  if (!b) return;
  var r = accessReq.filter(function(x){ return x.id === b.getAttribute("data-id"); })[0];
  var decision = b.getAttribute("data-acc");
  function apply(){
    r.status = decision === "ok" ? "genehmigt" : "abgelehnt";
    if (decision === "ok") adAccessGranted(r);
    audit.unshift({ t:"Gerade eben", who:"Derrik", what:(decision === "ok" ? "Zugriff genehmigt: " : "Zugriff abgelehnt: ") + r.what + " für " + r.who, ref:r.id });
    renderAll(); toast(r.id + " " + r.status + ".", decision === "ok" ? "ok" : "");
  }
  if (decision === "ok" && r.policy !== "ok"){
    confirmModal("Freigabe bestätigen?", "Die Richtlinie verlangt eine zweite Freigabe für „" + esc(r.what) + "“. Die Freigabe wird im Audit-Verlauf festgehalten.", "Freigeben", "", apply);
  } else apply();
});
document.addEventListener("click", function(e){
  var b = e.target.closest("[data-act='invite-access']");
  if (b) toast("Zugriffsanfragen kommen von Kunden und Mitarbeitern. Bearbeite sie in der Liste.");
});

/* ---------- Berichte ---------- */
function renderReports(){
  var open = tickets.filter(function(t){ return t.status !== "Gelöst"; }).length;
  var closed = tickets.length - open;
  $("#repSat").textContent = "4,2";
  $("#repSla").textContent = "94 %";
  $("#repLoad").textContent = "78 %";
  $("#repOpen").textContent = open;
  $("#repClosed").textContent = closed + " Tickets gelöst (Woche)";
  var rt = [["Kritisch", 22, 30], ["Hoch", 55, 60], ["Mittel", 78, 120], ["Niedrig", 90, 100]];
  $("#repBars").innerHTML = rt.map(function(r){
    var pct = Math.min(100, Math.round(r[1] / r[2] * 100));
    return '<div><div style="display:flex;justify-content:space-between;font-size:14px;font-weight:600"><span>' + r[0] + '</span><span class="num">' + r[1] + ' min Reaktion · Ziel ' + r[2] + '</span></div><div class="bar ' + (pct > 80 ? "bad" : pct > 60 ? "warn" : "") + '" style="margin-top:6px"><i style="width:' + pct + '%"></i></div></div>';
  }).join("");
  var sat = [["Drucken", 3.9], ["Netzwerk", 4.4], ["E-Mail", 4.6], ["Hardware", 4.1]];
  $("#repSatBars").innerHTML = sat.map(function(r){
    return '<div><div style="display:flex;justify-content:space-between;font-size:14px;font-weight:600"><span>' + r[0] + '</span><span class="num">' + String(r[1]).replace(".", ",") + ' von 5</span></div><div class="bar" style="margin-top:6px"><i style="width:' + (r[1] / 5 * 100) + '%"></i></div></div>';
  }).join("");
  var events = audit.map(function(a){ return { t:a.t, text:a.what + " (" + a.who + ")" }; });
  shiftLog.forEach(function(s){ events.push({ t:"Tag " + s.day, text:"Schicht beendet: " + s.done + " erledigt, " + s.open + " verschoben, " + eur(s.paid) + " eingenommen" }); });
  $("#repActivity").innerHTML = events.length ? events.map(function(e){
    return '<div class="li" style="padding:10px 0"><span class="main-t"><span style="display:block;font-size:14px">' + esc(e.text) + '</span><span class="sub muted" style="font-size:12px">' + esc(e.t) + '</span></span></div>';
  }).join("") : '<p class="hint">Noch keine Aktivität.</p>';
  var printBad = services.filter(function(s){ return s.id === "print" && svcState(s) === "bad"; }).length;
  var openPatch = routines.filter(function(r){ return !r.done && r.id === "r1"; }).length;
  var ex = [];
  if (printBad && openPatch) ex.push("Drucken liegt unter 95 % Verfügbarkeit. Die Routine „Patch-Tag Drucker“ ist offen. Ohne Patch-Tag steigen die Druckerstörungen.");
  if (services.some(function(s){ return s.id === "files" && s.cap >= 90; })) ex.push("Die Dateiablage ist fast voll. Ohne Kapazitätserhöhung drohen Ausfälle.");
  if (accessReq.some(function(r){ return r.status === "offen"; })) ex.push("Offene Zugriffsanfragen warten. Wartende Anfragen verlangsamen neue Mitarbeitende.");
  $("#repExplain").innerHTML = ex.length ? ex.map(function(x){ return '<div class="note info">' + esc(x) + '</div>'; }).join("") : '<div class="note ok">Keine Auffälligkeiten diese Woche.</div>';
}
$$("[data-period]").forEach(function(b){
  b.addEventListener("click", function(){
    b.parentElement.querySelectorAll("button").forEach(function(x){ x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
  });
});

/* ---------- Routinen, Richtlinien, Ressourcen ---------- */
function renderRoutines(){
  $("#routineRows").innerHTML = routines.map(function(r){
    var st = r.done ? '<span class="tag t-ok">erledigt</span>' : '<span class="tag t-warn">fällig ' + esc(r.due) + '</span>';
    var act = r.done ? '' : '<button class="btn btn-sm" type="button" data-routine="' + r.id + '">Erledigt</button>';
    return '<div class="li"><div class="main-t"><div style="font-weight:650">' + esc(r.name) + '</div><div class="sub muted" style="font-size:13px">' + esc(r.asset) + ' · ' + esc(r.every) + '</div></div><div style="display:flex;gap:8px;align-items:center">' + st + act + '</div></div>';
  }).join("");
  $("#policyList").innerHTML = policies.map(function(p){
    return '<div class="li"><div class="main-t"><div style="font-weight:650">' + esc(p.name) + '</div><div class="sub muted" style="font-size:13px">' + esc(p.value) + ' · Verantwortlich: ' + esc(p.owner) + '</div></div><button class="btn btn-s btn-sm" type="button" data-policy="' + p.id + '">Ändern</button></div>';
  }).join("");
  $("#resRows").innerHTML = resources.map(function(r, i){
    var low = r.n < r.min;
    return '<div class="li"><div class="main-t"><div style="font-weight:650">' + esc(r.name) + '</div><div class="sub muted" style="font-size:13px">Bestand ' + r.n + ' · Mindestbestand ' + r.min + '</div></div><div style="display:flex;gap:8px;align-items:center">' + (low ? '<span class="tag t-bad">knapp</span>' : '<span class="tag t-ok">ausreichend</span>') + '<button class="btn btn-s btn-sm" type="button" data-reorder="' + i + '">Nachbestellen (+3)</button></div></div>';
  }).join("");
}
document.addEventListener("click", function(e){
  var r = e.target.closest("[data-routine]");
  if (r){
    var rt = routines.filter(function(x){ return x.id === r.getAttribute("data-routine"); })[0];
    rt.done = true;
    audit.unshift({ t:"Gerade eben", who:"Derrik", what:"Routine erledigt: " + rt.name, ref:rt.asset });
    renderAll(); toast("Routine erledigt. Das senkt das Risiko von Wiederholungs-Incidents.", "ok");
    return;
  }
  var p = e.target.closest("[data-policy]");
  if (p){
    var pol = policies.filter(function(x){ return x.id === p.getAttribute("data-policy"); })[0];
    openModal({
      title: "Richtlinie ändern", sub: pol.name,
      body: field("polVal", "Neue Regel", '<input class="inp" id="polVal" maxlength="80" value="' + esc(pol.value) + '">', null, "Richtlinien-Änderungen laufen als Change durch das CAB."),
      actions: '<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Als Change einreichen</button>',
      onAction: function(a, el, close){
        if (a !== "save") return;
        var v = $("#polVal", el).value.trim();
        if (v.length < 3 || v === pol.value){ $("#polValErr", el).textContent = v === pol.value ? "Die Regel ist unverändert." : "Bitte eine Regel eingeben."; return; }
        changes.unshift({ id:"CHG-" + (207 + changes.length - 3), title:"Richtlinie: " + pol.name + " → " + v, type:"Normal", risk:"Niedrig", status:"Zur Prüfung", cab:"Mo, 09:00" });
        close(); renderAll(); toast("Änderung eingereicht. Das CAB entscheidet.", "ok");
      }
    });
    return;
  }
  var ro = e.target.closest("[data-reorder]");
  if (ro){
    var res = resources[+ro.getAttribute("data-reorder")];
    if (cash < 120){ toast("Zu wenig Budget für die Bestellung.", "bad"); return; }
    cash -= 120; res.n += 3;
    renderAll(); toast(res.name + ": 3 Stück bestellt (120 €).", "ok");
  }
});

/* ---------- Automatisierung, Schulung ---------- */
function renderAutomations(){
  $("#autoList").innerHTML = autos.map(function(a){
    return '<div class="row-sw"><div style="min-width:0"><div style="font-weight:650">' + esc(a.name) + '</div><div class="hint">' + eur(a.cost) + ' Einrichtung · ' + esc(a.risk) + '</div></div><button class="sw" type="button" role="switch" aria-checked="' + a.on + '" data-auto="' + a.id + '" aria-label="' + esc(a.name) + '"></button></div>';
  }).join("");
}
document.addEventListener("click", function(e){
  var s = e.target.closest("[data-auto]");
  if (s){
    var a = autos.filter(function(x){ return x.id === s.getAttribute("data-auto"); })[0];
    if (!a.on && cash < a.cost){ toast("Zu wenig Budget für diese Automatisierung.", "bad"); return; }
    if (!a.on) cash -= a.cost;
    a.on = !a.on;
    renderAll();
    toast(a.on ? a.name + " ist aktiv. Fehler landen als Incident." : a.name + " ist aus.", a.on ? "ok" : "");
    return;
  }
  var tr = e.target.closest("[data-act='train']");
  if (tr){
    openModal({
      title: "Schulung buchen", sub: "Schulungen kosten Budget und Zeit. Zertifikate schalten Verträge frei.",
      body: field("trStaff", "Person", '<select class="inp" id="trStaff">' + staff.map(function(p){ return '<option>' + esc(p.name) + '</option>'; }).join("") + '</select>') +
        field("trCourse", "Schulung", '<select class="inp" id="trCourse">' + COURSES.map(function(c){ return '<option value="' + c.cost + '">' + esc(c.name) + ' · ' + eur(c.cost) + '</option>'; }).join("") + '</select>'),
      actions: '<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Buchen</button>',
      onAction: function(a, el, close){
        if (a !== "save") return;
        var cost = +$("#trCourse", el).value, who = $("#trStaff", el).value;
        if (cash < cost){ toast("Zu wenig Budget für diese Schulung.", "bad"); return; }
        cash -= cost;
        renderAll();
        close(); toast(who + " ist für die Schulung angemeldet.", "ok");
      }
    });
  }
});

/* ---------- Meilensteine, Szenarien ---------- */
function renderMilestones(){
  var done = milestones.filter(function(m){ return m.done; }).length;
  $("#msBar").style.width = Math.round(done / milestones.length * 100) + "%";
  $("#msCount").textContent = done + " von " + milestones.length + " erreicht";
  $("#msList").innerHTML = milestones.map(function(m){
    return '<div class="li" style="padding:10px 0"><div class="main-t"><div style="font-weight:650">' + esc(m.name) + '</div>' +
      (m.unlock ? '<div class="sub muted" style="font-size:13px">Schaltet frei: ' + esc(m.unlock) + '</div>' : '') + '</div>' +
      (m.done ? '<span class="tag t-ok">erreicht</span>' : '<span class="tag t-mut">offen</span>') + '</div>';
  }).join("");
  $("#scenList").innerHTML = scenarios.map(function(s){
    return '<div class="li" style="padding:10px 0"><div class="main-t"><div style="font-weight:650">' + esc(s.name) + '</div><div class="sub muted" style="font-size:13px">' + esc(s.goal) + '</div></div>' +
      (s.locked ? '<span class="tag t-mut">gesperrt</span>' : '<button class="btn btn-s btn-sm" type="button" data-scen="' + s.id + '">Starten</button>') + '</div>';
  }).join("");
}
document.addEventListener("click", function(e){
  var b = e.target.closest("[data-scen]");
  if (!b) return;
  var n = 0;
  var pool = POOL.slice(0, 2);
  pool.forEach(function(p, i){
    var id = 1060 + tickets.length + i;
    tickets.unshift({ id:"T-" + id, title:"Szenario: " + p.title, cust:p.cust, requester:p.requester, cat:p.cat, impact:Math.max(p.impact, 3), urgency:4, prio:prioFrom(Math.max(p.impact, 3), 4), sla:"30 min", slaMin:30, status:"Major Incident", who:"—", inv:0, log:[], notes:[], resolution:"",
      thread:[{ k:"client", who:p.requester, text:p.title + ". Mehrere Kunden sind betroffen.", when:"Gerade eben" }] });
    n++;
  });
  renderAll(); location.hash = "tickets";
  toast("Szenario gestartet: " + n + " verknüpfte Tickets.", "bad");
});

/* ---------- Letzte Schicht, Tutorial ---------- */
function renderLastShift(){
  var s = shiftLog[0];
  $("#lastShift").innerHTML = s
    ? '<dl class="kv"><dt>Tag</dt><dd class="num">' + s.day + '</dd><dt>Erledigt</dt><dd class="num">' + s.done + ' Tickets</dd><dt>Verschoben</dt><dd class="num">' + s.open + ' Tickets</dd><dt>Einnahmen</dt><dd class="num">' + eur(s.paid) + '</dd></dl>'
    : '<p class="hint">Noch keine Schicht beendet. Erledige Tickets und beende die Schicht.</p>';
}

/* ---------- Übersicht: Kennzahlen ---------- */
function renderOverview(){
  var open = tickets.filter(function(t){ return t.status !== "Gelöst"; });
  var urgent = open.filter(function(t){ return t.prio === "Kritisch" || t.prio === "Hoch"; }).length;
  $("#ovUrgent").textContent = urgent;
  $("#ovSvc").textContent = services.filter(function(s){ return svcState(s) === "ok"; }).length + " von " + services.length;
}

/* ---------- Dispatcher für Aktionen ---------- */
document.addEventListener("click", function(e){
  var b = e.target.closest("[data-act]");
  if (!b) return;
  var a = b.getAttribute("data-act");
  if (a === "assign") assignModal();
  else if (a === "resolve") resolveModal();
  else if (a === "reopen") reopenTicket();
  else if (a === "escalate") escalateModal();
  else if (a === "triage") triageModal();
  else if (a === "note") noteModal();
  else if (a === "request") requestModal();
  else if (a === "newticket") newTicketModal();
  else if (a === "shift") endShift();
  else if (a === "newchange") newChangeModal();
  else if (a === "maint") maintModal();
  else if (a === "invite") inviteModal();
  else if (a === "export") exportMyData();
  else if (a === "logout") doLogout();
  else if (a === "pwchange") passwordModal(false);
  else if (a === "deleteacc") deleteAccountModal();
  else if (a === "backup") backupRun();
  else if (a === "invoice") invoiceModal();
  else if (a === "addserver") addServerModal();
  else if (a === "addcable") addCableModal();
  else if (a === "tutorial") confirmModal("Tutorial starten?", "Das Tutorial legt einen eigenen Speicherstand „Tutorial“ an (leichte Schwierigkeit).", "Starten", "", function(){ createSave("Tutorial", "single", "leicht", "it").then(function(){ toast("Tutorial gestartet. Fang mit dem kritischen Ticket an.", "ok"); }).catch(apiErr); });
  else if (a === "glossary") toast("Glossar: Begriffe wie Incident, Change, CMDB und SLA erklärt das Spiel direkt bei der Verwendung.");
  else if (a === "applicants") location.hash = "personal";
  else if (a === "impact") toast("Auswirkung: Router-Lager betrifft 14 Arbeitsplätze und 2 Kunden.", "ok");
  else if (a === "profil") profileModal();
  else if (a === "register") setAuthMode("register");
  else if (a === "pwreset") { e.preventDefault(); toast("Der Server verschickt keine E-Mails. Ein Server-Admin gibt dir ein vorläufiges Kennwort."); }
  else if (a === "newaccess") toast("Zugriffsanfragen kommen von Kunden und Mitarbeitern. Bearbeite sie in der Liste.");
  else if (a === "newservice" || a === "newci" || a === "newproblem" || a === "newarticle" || a === "newuser-ad") toast("Das Anlegen eigener Einträge kommt in einer späteren Version.");
  else if (a === "train" || a === "invite-access" || a === "addhw") { /* handled elsewhere */ }
  else toast("Diese Funktion kommt in einer späteren Version.");
});

/* Investigation terminal default content is captured on first render */
/* ---------- Changes ---------- */

/* ---------- CMDB ---------- */
var CI = {
  "HP-Empfang": { typ:"Drucker", kunde:"Bäckerei Krumm", st:"Offline", dep:["Empfang-PC","Lieferschein-Software"] },
  "Router-Lager": { typ:"Netzwerk", kunde:"Logistik Weidner", st:"Warnung", dep:["Scanner Lager 1–4","WLAN Lager","VPN"] },
  "NAS-Büro": { typ:"Speicher", kunde:"Steuerbüro Hahn", st:"OK", dep:["Buchhaltung","Datensicherung"] },
  "Lizenz Office": { typ:"Lizenz", kunde:"Steuerbüro Hahn", st:"Läuft ab", dep:["12 Benutzer"] }
};
function showCI(name){
  var c = CI[name];
  $("#ciDetail").innerHTML = '<div class="card-h"><h2>' + esc(name) + '</h2><span class="tag ' + (c.st === "OK" ? "t-ok" : c.st === "Offline" ? "t-bad" : "t-warn") + '">' + esc(c.st) + '</span></div>' +
    '<dl class="kv"><dt>Typ</dt><dd>' + esc(c.typ) + '</dd><dt>Kunde</dt><dd>' + esc(c.kunde) + '</dd></dl>' +
    '<h3 style="margin:18px 0 10px">Hängt daran</h3><div class="list" style="gap:8px">' + c.dep.map(function(d){ return '<div class="li" style="padding:0"><span>' + esc(d) + '</span><span class="tag t-mut">Abhängig</span></div>'; }).join("") + '</div>';
}
$$("[data-ci]").forEach(function(r){ r.addEventListener("click", function(){ showCI(r.getAttribute("data-ci")); }); });
showCI("HP-Empfang");

/* ---------- Wissen ---------- */
function showKb(id){
  var a = kb[id];
  $("#kbView").innerHTML = '<div class="card-h"><h2>' + esc(a.t) + '</h2></div><p class="hint" style="margin-bottom:12px">' + esc(a.meta) + '</p><div style="white-space:pre-line;font-size:15px;line-height:1.7">' + esc(a.b) + '</div>';
  $$("[data-kb]").forEach(function(x){ x.setAttribute("aria-current", x.getAttribute("data-kb") === id ? "true" : "false"); x.style.background = x.getAttribute("data-kb") === id ? "var(--surface2)" : "none"; });
}
$$("[data-kb]").forEach(function(b){ b.addEventListener("click", function(){ showKb(b.getAttribute("data-kb")); }); });
showKb("kb1");

/* ---------- Serverräume, Racks, Verkabelung ---------- */
var racks = [
  { id:"A", name:"Rack A · Serverraum", loc:"Keller, Hauptstandort", units:42 },
  { id:"B", name:"Rack B · Lager", loc:"Lager Halle 2", units:12 },
  { id:"C", name:"Rack C · Ausweichstandort", loc:"Rechenzentrum Nord (extern)", units:12 }
];
var devices = [
  { id:"pp",     name:"Patchpanel 24",      rack:"A", u:42, h:1, type:"net", role:"Verteilung",          os:"",                      load:0,  ports:24 },
  { id:"core",   name:"Switch Core 48",     rack:"A", u:41, h:1, type:"net", role:"Kernnetz",            os:"Firmware 9.3",          load:0,  ports:48 },
  { id:"router", name:"Router Edge",        rack:"A", u:40, h:1, type:"net", role:"Internetanbindung",   os:"Firmware 4.1",          load:0,  ports:4 },
  { id:"usvA",   name:"USV 3 kVA",          rack:"A", u:39, h:2, type:"pwr", role:"Stromversorgung",     os:"",                      load:74, ports:6 },
  { id:"ad1",    name:"Server AD-01",       rack:"A", u:37, h:2, type:"srv", role:"Active Directory",    os:"WinSec-OS Server 2022", load:34, ports:4 },
  { id:"file1",  name:"Server Dateien",     rack:"A", u:35, h:2, type:"srv", role:"Dateiserver",         os:"WinSec-OS Server 2022", load:58, ports:4 },
  { id:"bak1",   name:"Server Backup",      rack:"A", u:33, h:2, type:"srv", role:"Backup",              os:"Linux 24.04",           load:21, ports:4 },
  { id:"web1",   name:"Server Web",         rack:"A", u:31, h:1, type:"srv", role:"Webserver",           os:"Linux 24.04",           load:12, ports:2 },
  { id:"nas",    name:"NAS-Büro",           rack:"A", u:30, h:4, type:"sto", role:"Speicher",            os:"NAS-OS 7",              load:40, ports:4, bad:true },
  { id:"lsw",    name:"Switch Lager 24",    rack:"B", u:12, h:1, type:"net", role:"Lager-Netz",          os:"Firmware 9.3",          load:0,  ports:24 },
  { id:"wlan",   name:"WLAN-Controller",    rack:"B", u:11, h:1, type:"net", role:"WLAN Lager",          os:"Firmware 6.0",          load:0,  ports:2 },
  { id:"scan1",  name:"Server Scanner",     rack:"B", u:10, h:2, type:"srv", role:"Scanner-Dienst",      os:"Linux 24.04",           load:45, ports:2 },
  { id:"usvL",   name:"USV 1 kVA",          rack:"B", u:8,  h:1, type:"pwr", role:"Stromversorgung Lager", os:"",                    load:52, ports:4 },
  { id:"offsw",  name:"Switch Ausweich 24", rack:"C", u:12, h:1, type:"net", role:"Replikation",         os:"Firmware 9.3",          load:0,  ports:24 },
  { id:"off1",   name:"Server Ausweich",    rack:"C", u:10, h:2, type:"srv", role:"Replikation",         os:"Linux 24.04",           load:18, ports:4 },
  { id:"vpn",    name:"VPN-Gateway",        rack:"C", u:8,  h:1, type:"net", role:"VPN",                 os:"Firmware 3.2",          load:0,  ports:4 }
];
var cables = [
  { id:"K-001", a:"core",   pa:"P01",  b:"pp",     pb:"P01",  type:"LAN",   len:1.5, status:"ok" },
  { id:"K-002", a:"core",   pa:"P02",  b:"ad1",    pb:"NIC1", type:"LAN",   len:2,   status:"ok" },
  { id:"K-003", a:"core",   pa:"P03",  b:"file1",  pb:"NIC1", type:"LAN",   len:2,   status:"ok" },
  { id:"K-004", a:"core",   pa:"P04",  b:"bak1",   pb:"NIC1", type:"LAN",   len:2,   status:"ok" },
  { id:"K-005", a:"core",   pa:"P05",  b:"web1",   pb:"NIC1", type:"LAN",   len:2,   status:"ok" },
  { id:"K-006", a:"core",   pa:"P06",  b:"nas",    pb:"LAN1", type:"LAN",   len:2,   status:"ok" },
  { id:"K-007", a:"core",   pa:"P47",  b:"router", pb:"P01",  type:"LAN",   len:1,   status:"ok" },
  { id:"K-008", a:"core",   pa:"P46",  b:"offsw",  pb:"P01",  type:"LWL",   len:300, status:"ungetestet" },
  { id:"K-009", a:"core",   pa:"P48",  b:"lsw",    pb:"P24",  type:"LWL",   len:250, status:"ok" },
  { id:"K-010", a:"usvA",   pa:"S1",   b:"ad1",    pb:"PSU1", type:"Strom", len:2,   status:"ok" },
  { id:"K-011", a:"usvA",   pa:"S2",   b:"file1",  pb:"PSU1", type:"Strom", len:2,   status:"ok" },
  { id:"K-012", a:"usvA",   pa:"S3",   b:"bak1",   pb:"PSU1", type:"Strom", len:2,   status:"ok" },
  { id:"K-013", a:"usvA",   pa:"S4",   b:"core",   pb:"NT1",  type:"Strom", len:2,   status:"ok" },
  { id:"K-014", a:"lsw",    pa:"P01",  b:"wlan",   pb:"P01",  type:"LAN",   len:10,  status:"ok" },
  { id:"K-015", a:"usvL",   pa:"S1",   b:"scan1",  pb:"PSU1", type:"Strom", len:2,   status:"ok" },
  { id:"K-016", a:"offsw",  pa:"P02",  b:"off1",   pb:"NIC1", type:"LAN",   len:2,   status:"ok" },
  { id:"K-017", a:"vpn",    pa:"P01",  b:"offsw",  pb:"P03",  type:"LAN",   len:3,   status:"defekt" },
  { id:"K-018", a:"router", pa:"P02",  b:"vpn",    pb:"P04",  type:"WAN",   len:40,  status:"ok" }
];
var ROOM = { tab:"racks", rack:"A" };
var hlDev = null, hlCable = null;
var TYPE_NAME = { srv:"Server", net:"Netzwerk", pwr:"Stromversorgung", sto:"Speicher" };
var TYPE_TAG = { srv:"t-acc", net:"t-info", pwr:"t-warn", sto:"t-ok" };
var CABLE_TYPES = ["LAN", "LWL", "Strom", "KVM", "WAN"];

function devOf(id){ return devices.filter(function(d){ return d.id === id; })[0]; }
function rackOf(id){ return racks.filter(function(r){ return r.id === id; })[0]; }
function devName(id){ var d = devOf(id); return d ? d.name : id; }
function cablesOf(id){ return cables.filter(function(c){ return c.a === id || c.b === id; }); }
function devicesIn(rid){ return devices.filter(function(d){ return d.rack === rid; }).sort(function(x, y){ return y.u - x.u; }); }
function occupied(rid){
  var set = {};
  devices.forEach(function(d){
    if (d.rack !== rid) return;
    for (var i = 0; i < d.h; i++) set[d.u - i] = true;
  });
  return set;
}
function portUsed(devId, port){
  return cables.some(function(c){ return (c.a === devId && c.pa === port) || (c.b === devId && c.pb === port); });
}
function cableLine(c, id){
  var other = c.a === id ? c.b : c.a;
  var mine = c.a === id ? c.pa : c.pb;
  var theirs = c.a === id ? c.pb : c.pa;
  return '<div class="li" style="padding:8px 0"><span><span class="mono">' + esc(c.id) + '</span> · Port ' + esc(mine) + ' → ' + esc(devName(other)) + ' ' + esc(theirs) + '</span><span class="tag t-mut">' + esc(c.type) + '</span></div>';
}

function renderRackChips(){
  $("#rackChips").innerHTML = racks.map(function(r){
    return '<button class="chip" type="button" data-rack="' + r.id + '" aria-pressed="' + (r.id === ROOM.rack) + '">' + esc(r.name) + '</button>';
  }).join("");
}
function renderRackView(){
  var r = rackOf(ROOM.rack);
  var list = devicesIn(r.id);
  var occ = occupied(r.id);
  $("#rackTitle").textContent = r.name;
  $("#rackMeta").textContent = r.loc + " · " + r.units + " HE · " + list.length + " Geräte";
  var view = $("#rackView");
  view.style.gridTemplateRows = "repeat(" + r.units + ", 18px)";
  var html = "";
  for (var u = r.units; u >= 1; u--) {
    if (!occ[u]) html += '<div class="slot" style="grid-row:' + (r.units - u + 1) + '">' + u + '</div>';
  }
  list.forEach(function(d){
    var cls = "dev " + d.type + (d.bad ? " bad" : "");
    html += '<button type="button" class="' + cls + '" data-dev="' + d.id + '" style="grid-row:' + (r.units - d.u + 1) + ' / span ' + d.h + '"><span>' + esc(d.name) + '</span><span class="num sub2">' + d.u + '</span></button>';
  });
  view.innerHTML = html;
}
function renderDeviceList(){
  var list = devicesIn(ROOM.rack);
  $("#rackDevices").innerHTML = list.length ? list.map(function(d){
    var n = cablesOf(d.id).length;
    return '<button type="button" class="li btnrow" data-dev="' + d.id + '"><span class="main-t"><span style="display:block;font-weight:650">' + esc(d.name) + '</span><span class="sub muted" style="font-size:13px">HE ' + (d.u - d.h + 1) + '–' + d.u + ' · Ports ' + n + ' von ' + d.ports + ' · ' + esc(d.role) + '</span></span><span class="tag ' + TYPE_TAG[d.type] + '">' + TYPE_NAME[d.type] + '</span></button>';
  }).join("") : '<p class="hint">Dieses Rack ist leer.</p>';
}

function cableOn(c){ return hlCable === c.id || (!!hlDev && (c.a === hlDev || c.b === hlDev)); }
function renderTopo(){
  var colW = 300, nodeW = 236, nodeH = 44, gap = 60, top = 58, pos = {};
  racks.forEach(function(r, i){
    devicesIn(r.id).forEach(function(d, j){ pos[d.id] = { x: 24 + i * colW, y: top + j * gap }; });
  });
  var maxRows = Math.max.apply(null, racks.map(function(r){ return devicesIn(r.id).length; }));
  var W = 48 + racks.length * colW, H = top + maxRows * gap + 16;
  var active = !!(hlCable || hlDev);
  var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Verkabelungsplan aller Racks">';
  racks.forEach(function(r, i){
    s += '<text x="' + (24 + i * colW) + '" y="30" font-size="14" font-weight="700" class="rk">' + esc(r.name) + '</text>';
  });
  cables.forEach(function(c){
    var A = pos[c.a], B = pos[c.b];
    if (!A || !B) return;
    var y1 = A.y + nodeH / 2, y2 = B.y + nodeH / 2, x1, x2, c1, c2;
    if (A.x < B.x){ x1 = A.x + nodeW; x2 = B.x; c1 = x1 + 70; c2 = x2 - 70; }
    else if (A.x > B.x){ x1 = A.x; x2 = B.x + nodeW; c1 = x1 - 70; c2 = x2 + 70; }
    else { x1 = A.x + nodeW; x2 = B.x + nodeW; c1 = x1 + 60; c2 = x2 + 60; }
    var cls = "cable " + c.type.toLowerCase();
    if (active) cls += cableOn(c) ? " hl" : " dim";
    s += '<path class="' + cls + '" data-cable="' + c.id + '" d="M' + x1 + ' ' + y1 + ' C' + c1 + ' ' + y1 + ' ' + c2 + ' ' + y2 + ' ' + x2 + ' ' + y2 + '"><title>' + esc(c.id + ': ' + devName(c.a) + ' ' + c.pa + ' ↔ ' + devName(c.b) + ' ' + c.pb + ' (' + c.type + ', ' + String(c.len).replace('.', ',') + ' m)') + '</title></path>';
  });
  devices.forEach(function(d){
    var p = pos[d.id];
    if (!p) return;
    var used = cablesOf(d.id).length;
    s += '<g class="node' + (hlDev === d.id ? ' on' : '') + '" data-dev="' + d.id + '" tabindex="0" role="button" aria-label="' + esc(d.name) + '">' +
      '<rect x="' + p.x + '" y="' + p.y + '" width="' + nodeW + '" height="' + nodeH + '" rx="10"/>' +
      '<text x="' + (p.x + 12) + '" y="' + (p.y + 18) + '" font-size="13" font-weight="650">' + esc(d.name) + '</text>' +
      '<text class="sub" x="' + (p.x + 12) + '" y="' + (p.y + 34) + '" font-size="11">HE ' + d.u + ' · Ports ' + used + '/' + d.ports + ' · ' + esc(d.role) + '</text></g>';
  });
  s += '</svg>';
  $("#topo").outerHTML = s.replace('<svg ', '<svg id="topo" ');
}
function renderCables(){
  $("#cableRows").innerHTML = cables.map(function(c){
    var st = c.status === "ok" ? '<span class="tag t-ok">in Ordnung</span>' : c.status === "defekt" ? '<span class="tag t-bad">Defekt</span>' : '<span class="tag t-warn">ungetestet</span>';
    var typeCls = { LAN:"t-acc", LWL:"t-warn", Strom:"t-mut", KVM:"t-ok", WAN:"t-info" }[c.type] || "t-mut";
    return '<tr class="click' + (hlCable === c.id ? ' on' : '') + '" data-cable="' + c.id + '">' +
      '<td class="mono">' + c.id + '</td>' +
      '<td>' + esc(devName(c.a)) + '<div class="sub">Port ' + esc(c.pa) + '</div></td>' +
      '<td>' + esc(devName(c.b)) + '<div class="sub">Port ' + esc(c.pb) + '</div></td>' +
      '<td><span class="tag ' + typeCls + '">' + esc(c.type) + '</span></td>' +
      '<td class="num">' + String(c.len).replace('.', ',') + ' m</td>' +
      '<td>' + st + '</td>' +
      '<td style="text-align:right"><button class="btn btn-s btn-sm" type="button" data-test="' + c.id + '"' + (c.status === "ok" ? ' disabled' : '') + '>Prüfen</button></td></tr>';
  }).join("");
}
function renderServers(){
  var srv = devices.filter(function(d){ return d.type === "srv" || d.type === "sto"; });
  $("#serverRows").innerHTML = srv.map(function(d){
    var r = rackOf(d.rack);
    var st = d.bad ? '<span class="tag t-bad">Fehler</span>' : '<span class="tag t-ok">Läuft</span>';
    var bc = d.load > 80 ? "bad" : d.load > 60 ? "warn" : "";
    return '<tr class="click" data-dev="' + d.id + '"><td><div style="font-weight:650">' + esc(d.name) + '</div><div class="sub">' + esc(d.role) + '</div></td>' +
      '<td>' + esc(r.name) + '</td><td class="num">' + (d.u - d.h + 1) + '–' + d.u + '</td><td>' + esc(d.os || "—") + '</td>' +
      '<td style="min-width:150px"><div class="bar ' + bc + '"><i style="width:' + d.load + '%"></i></div><div class="sub num">' + d.load + ' %</div></td><td>' + st + '</td></tr>';
  }).join("");
}
function renderServerroom(){
  var srvN = devices.filter(function(d){ return d.type === "srv"; }).length;
  var locs = {};
  racks.forEach(function(r){ locs[r.loc] = true; });
  $("#kpiServers").textContent = srvN;
  $("#kpiRacks").textContent = racks.length + " Racks an " + Object.keys(locs).length + " Standorten";
  $("#kpiCables").textContent = cables.length;
  $("#kpiFaults").textContent = cables.filter(function(c){ return c.status === "defekt"; }).length + devices.filter(function(d){ return d.bad; }).length;
  renderRackChips(); renderRackView(); renderDeviceList(); renderTopo(); renderCables(); renderServers();
}
function setRoomTab(t){
  ROOM.tab = t;
  $$("#roomTabs [data-rtab]").forEach(function(b){ b.setAttribute("aria-selected", b.getAttribute("data-rtab") === t ? "true" : "false"); });
  $$("[data-rpanel]").forEach(function(p){ p.hidden = p.getAttribute("data-rpanel") !== t; });
}

function openDevice(id){
  var d = devOf(id), r = rackOf(d.rack), cs = cablesOf(id);
  var list = cs.map(function(c){ return cableLine(c, id); }).join("") || '<p class="hint">Keine Kabel angeschlossen.</p>';
  var extra = d.bad ? '<div class="note bad">Bereich 4 ist fehlerhaft. Ein Ersatzlaufwerk liegt im Lager.</div>' : "";
  openModal({
    title: d.name, sub: r.name + " · HE " + (d.u - d.h + 1) + "–" + d.u,
    wide: true,
    body: '<dl class="kv"><dt>Typ</dt><dd>' + TYPE_NAME[d.type] + '</dd><dt>Rolle</dt><dd>' + esc(d.role) + '</dd><dt>Betriebssystem</dt><dd>' + esc(d.os || "—") + '</dd><dt>Ports</dt><dd class="num">' + cs.length + ' von ' + d.ports + ' belegt</dd><dt>Status</dt><dd>' + (d.bad ? '<span class="tag t-bad">Fehler</span>' : '<span class="tag t-ok">Läuft</span>') + '</dd><dt>Last</dt><dd class="num">' + d.load + ' %</dd></dl>' + extra +
      '<h3 style="margin-top:4px">Kabel</h3><div class="list">' + list + '</div>',
    actions: '<button class="btn btn-s" type="button" data-close>Schließen</button>' + (d.type === "srv" ? '<button class="btn btn-s" type="button" data-mdact="reboot">Neu starten</button>' : ''),
    onAction: function(a, el, close){
      if (a !== "reboot") return;
      close();
      confirmModal("Server neu starten?", esc(d.name) + " ist kurz nicht erreichbar. Angebundene Tickets bekommen eine Info.", "Neu starten", "", function(){ toast(d.name + " startet neu.", "ok"); });
    }
  });
}
function devOptions(sel){
  return devices.map(function(d){ return '<option value="' + d.id + '"' + (d.id === sel ? ' selected' : '') + '>' + esc(d.name) + ' · ' + esc(rackOf(d.rack).name) + '</option>'; }).join("");
}
function addServerModal(){
  var rackOpts = racks.map(function(r){ return '<option value="' + r.id + '"' + (r.id === ROOM.rack ? ' selected' : '') + '>' + esc(r.name) + '</option>'; }).join("");
  openModal({
    title: "Server einbauen", sub: "Der Server braucht freie Höheneinheiten im Rack.",
    body: field("svName", "Name", '<input class="inp" id="svName" maxlength="40" placeholder="z. B. Server Buchhaltung">') +
      '<div class="grid g2e" style="gap:14px">' + field("svRack", "Rack", '<select class="inp" id="svRack">' + rackOpts + '</select>') + field("svU", "Oberste HE", '<input class="inp num" id="svU" inputmode="numeric" placeholder="z. B. 20">') + '</div>' +
      '<div class="grid g2e" style="gap:14px">' + field("svH", "Höhe in HE", '<select class="inp" id="svH"><option>1</option><option selected>2</option><option>3</option><option>4</option></select>') + field("svRole", "Rolle", '<select class="inp" id="svRole"><option>Dateiserver</option><option>Webserver</option><option>Datenbank</option><option>Backup</option><option>Active Directory</option></select>') + '</div>' +
      field("svOs", "Betriebssystem", '<select class="inp" id="svOs"><option>WinSec-OS Server 2022</option><option>Linux 24.04</option></select>'),
    actions: '<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Server einbauen</button>',
    onAction: function(a, el, close){
      if (a !== "save") return;
      var name = $("#svName", el).value.trim();
      var rid = $("#svRack", el).value, r = rackOf(rid);
      var u = parseInt($("#svU", el).value, 10), h = parseInt($("#svH", el).value, 10);
      var nameErr = name.length >= 2 ? "" : "Bitte einen Namen eingeben.";
      var uErr = "";
      if (!(u >= 1 && u <= r.units)) uErr = "Bitte eine HE zwischen 1 und " + r.units + " angeben.";
      else if (u - h + 1 < 1) uErr = "Mit dieser Höhe passt der Server nicht ins Rack.";
      else {
        var occ = occupied(rid);
        for (var i = 0; i < h; i++) if (occ[u - i]) { uErr = "HE " + (u - i) + " ist schon belegt. Wähle eine andere Stelle."; break; }
      }
      $("#svNameErr", el).textContent = nameErr;
      $("#svUErr", el).textContent = uErr;
      if (nameErr || uErr){ (nameErr ? $("#svName", el) : $("#svU", el)).focus(); return; }
      devices.push({ id:"srv" + Date.now(), name:name, rack:rid, u:u, h:h, type:"srv", role:$("#svRole", el).value, os:$("#svOs", el).value, load:0, ports:4 });
      ROOM.rack = rid;
      close(); renderServerroom(); toast(name + " ist eingebaut.", "ok");
    }
  });
}
function addCableModal(){
  var typeOpts = CABLE_TYPES.map(function(t){ return '<option>' + t + '</option>'; }).join("");
  openModal({
    title: "Kabel verlegen", sub: "Jeder Port nimmt nur ein Kabel auf.",
    body: '<div class="grid g2e" style="gap:14px">' +
      field("kbA", "Von Gerät", '<select class="inp" id="kbA">' + devOptions(devices[0].id) + '</select>') +
      field("kbAp", "Port", '<input class="inp mono" id="kbAp" maxlength="12" placeholder="z. B. P12">') + '</div>' +
      '<div class="grid g2e" style="gap:14px">' +
      field("kbB", "Nach Gerät", '<select class="inp" id="kbB">' + devOptions(devices[1].id) + '</select>') +
      field("kbBp", "Port", '<input class="inp mono" id="kbBp" maxlength="12" placeholder="z. B. NIC2">') + '</div>' +
      '<div class="grid g2e" style="gap:14px">' +
      field("kbT", "Kabeltyp", '<select class="inp" id="kbT">' + typeOpts + '</select>') +
      field("kbL", "Länge in Metern", '<input class="inp num" id="kbL" inputmode="decimal" value="2">', null, "Zwischen 0,5 und 300 m.") + '</div>',
    actions: '<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Kabel verlegen</button>',
    onAction: function(a, el, close){
      if (a !== "save") return;
      var A = $("#kbA", el).value, B = $("#kbB", el).value;
      var pa = $("#kbAp", el).value.trim(), pb = $("#kbBp", el).value.trim();
      var len = parseFloat(($("#kbL", el).value || "").replace(",", "."));
      var errA = "", errB = "", errL = "";
      if (!pa) errA = "Bitte einen Port eingeben."; else if (portUsed(A, pa)) errA = "Port " + pa + " ist an " + devName(A) + " schon belegt.";
      if (A === B) errB = "Quelle und Ziel müssen verschiedene Geräte sein.";
      else if (!pb) errB = "Bitte einen Port eingeben."; else if (portUsed(B, pb)) errB = "Port " + pb + " ist an " + devName(B) + " schon belegt.";
      if (!(len >= 0.5 && len <= 300)) errL = "Bitte eine Länge zwischen 0,5 und 300 m eingeben.";
      $("#kbAErr", el).textContent = errA;
      $("#kbBErr", el).textContent = errB;
      $("#kbLErr", el).textContent = errL;
      if (errA || errB || errL){ (errA ? $("#kbAp", el) : errB ? $("#kbBp", el) : $("#kbL", el)).focus(); return; }
      var id = "K-" + String(100 + cables.length).slice(-3);
      cables.push({ id:id, a:A, pa:pa, b:B, pb:pb, type:$("#kbT", el).value, len:len, status:"ungetestet" });
      close(); renderServerroom(); toast("Kabel " + id + " verlegt. Bitte prüfen.", "ok");
    }
  });
}

/* Klicks im Serverraum (Tabs, Racks, Geräte, Kabel) */
(function(){
  var sr = $('[data-screen="serverraum"]');
  if (!sr) return;
  sr.addEventListener("click", function(e){
    var t = e.target;
    var tab = t.closest("[data-rtab]");
    if (tab){ setRoomTab(tab.getAttribute("data-rtab")); return; }
    var rk = t.closest("[data-rack]");
    if (rk){ ROOM.rack = rk.getAttribute("data-rack"); renderServerroom(); return; }
    var test = t.closest("[data-test]");
    if (test){
      var c = cables.filter(function(x){ return x.id === test.getAttribute("data-test"); })[0];
      if (c && c.status !== "ok"){ c.status = "ok"; renderServerroom(); toast("Kabel " + c.id + " geprüft und in Ordnung.", "ok"); }
      return;
    }
    var path = t.closest("#topo [data-cable]");
    var row = t.closest("#cableRows [data-cable]");
    var cid = (path || row) ? (path || row).getAttribute("data-cable") : null;
    if (cid){ hlCable = hlCable === cid ? null : cid; hlDev = null; renderTopo(); renderCables(); return; }
    var dv = t.closest("[data-dev]");
    if (dv){
      var did = dv.getAttribute("data-dev");
      if (dv.closest("#topo")){ hlDev = hlDev === did ? null : did; hlCable = null; renderTopo(); renderCables(); }
      else openDevice(did);
    }
  });
  sr.addEventListener("keydown", function(e){
    if (e.key !== "Enter" && e.key !== " ") return;
    var g = e.target.closest && e.target.closest("#topo [data-dev]");
    if (g){ e.preventDefault(); g.dispatchEvent(new MouseEvent("click", { bubbles:true })); }
  });
})();

/* Sicherung: Backup-Status */
var backupBusy = false;
function backupRun(){
  if (backupBusy) return;
  backupBusy = true;
  toast("Backup läuft …");
  setTimeout(function(){ backupBusy = false; toast("Backup abgeschlossen (verschlüsselt).", "ok"); }, 1800);
}

/* ---------- Personal ---------- */
function renderStaff(){
  $("#staffGrid").innerHTML = staff.map(function(s){
    var tags = s.sick ? '<span class="tag t-mut">' + esc(s.sick) + '</span>' :
      '<span class="tag ' + (s.energy < 50 ? "t-warn" : "t-ok") + '">Energie ' + s.energy + ' %</span> <span class="tag ' + (s.stress > 60 ? "t-bad" : "t-ok") + '">Stress ' + s.stress + ' %</span>';
    return '<article class="card"><div style="display:flex;gap:14px;align-items:center"><span class="mark" style="width:44px;height:44px;border-radius:14px;background:var(--surface2);color:var(--ink)">' + esc(s.ini) + '</span><div style="min-width:0"><div style="font-weight:700;font-size:17px">' + esc(s.name) + '</div><div class="hint">' + esc(s.role) + '</div></div></div>' +
      '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 16px;margin:18px 0;font-size:14px">' +
      s.skills.map(function(k){ return '<div>' + k[0] + '<div class="bar" style="margin-top:6px"><i style="width:' + k[1] + '%"></i></div></div>'; }).join("") + '</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap">' + tags + '</div>' +
      (s.warn ? '<p class="hint" style="margin-top:12px">' + esc(s.warn) + '</p>' : '') + '</article>';
  }).join("");
  $("#candCount").textContent = candidates.length + " Kandidaten";
  $("#candList").innerHTML = candidates.length ? candidates.map(function(c){
    return '<div class="li"><div class="main-t"><div style="font-weight:650">' + esc(c.name) + '</div><div class="sub muted" style="font-size:13px">' + esc(c.skills) + ' · ' + eur(c.pay) + ' · ' + esc(c.note) + '</div></div><button class="btn btn-s btn-sm" type="button" data-hire="' + c.id + '">Einstellen</button></div>';
  }).join("") : '<p class="hint">Keine offenen Bewerbungen.</p>';
}
$("#candList").addEventListener("click", function(e){
  var b = e.target.closest("[data-hire]");
  if (!b) return;
  var c = candidates.filter(function(x){ return x.id === b.getAttribute("data-hire"); })[0];
  confirmModal("Einstellen?", esc(c.name) + " bekommt " + eur(c.pay) + " im Monat. Die Gehaltszahlung läuft ab dem nächsten Monat.", "Einstellen", "", function(){
    candidates = candidates.filter(function(x){ return x.id !== c.id; });
    staff.push({ name:c.name, role:c.note, ini:c.name.split(" ").map(function(p){ return p[0]; }).join("").slice(0,2), energy:80, stress:30, skills:[["Netzwerk",60],["Windows",50],["Hardware",40],["Sicherheit",30]] });
    renderStaff(); toast(c.name + " ist eingestellt.", "ok");
  });
});

/* ---------- Finanzen ---------- */
var invStatusTag = { "offen":"t-info", "überfällig":"t-bad", "bezahlt":"t-ok" };
function renderInvoices(){
  $("#invRows").innerHTML = invoices.map(function(i){
    return '<tr><td><div style="font-weight:650">' + esc(i.id) + '</div><div class="sub">' + esc(i.desc) + '</div></td><td>' + esc(i.cust) + '</td><td class="num">' + eur(i.amt) + '</td><td><span class="tag ' + invStatusTag[i.status] + '">' + esc(i.status) + '</span> <span class="sub" style="margin-left:6px">' + esc(i.due) + '</span></td></tr>';
  }).join("");
  var open = invoices.filter(function(i){ return i.status !== "bezahlt"; });
  var sum = open.reduce(function(a, i){ return a + i.amt; }, 0);
  $("#openInv").textContent = eur(sum);
  $("#openInvS").textContent = open.length + " Rechnungen";
}
function renderPrices(){
  var mult = store.get("prices", null) || {};
  $("#priceList").innerHTML = prices.map(function(p){
    var v = mult[p.k] !== undefined ? mult[p.k] : p.f;
    return '<div class="field"><label for="pr-' + p.k.slice(0,3) + '">' + esc(p.k) + ' · ×<span class="num" data-out>' + v.toFixed(1).replace(".", ",") + '</span></label><input type="range" min="0.5" max="2" step="0.1" value="' + v + '" id="pr-' + p.k.slice(0,3) + '" data-price="' + esc(p.k) + '"></div>';
  }).join("");
}
$("#priceList").addEventListener("input", function(e){
  var r = e.target.closest("[data-price]");
  if (!r) return;
  var v = +r.value;
  r.parentNode.querySelector("[data-out]").textContent = v.toFixed(1).replace(".", ",");
  var m = store.get("prices", {}) || {};
  m[r.getAttribute("data-price")] = v;
  store.set("prices", m);
});
function invoiceModal(){
  openModal({
    title: "Rechnung schreiben",
    body: field("ivCust", "Kunde", '<select class="inp" id="ivCust"><option>Bäckerei Krumm</option><option>Logistik Weidner</option><option>Steuerbüro Hahn</option><option>Arztpraxis Beispiel</option></select>') +
          field("ivDesc", "Leistung", '<input class="inp" id="ivDesc" maxlength="80" placeholder="z. B. Support-Vertrag November">') +
          field("ivAmt", "Betrag in Euro", '<input class="inp num" id="ivAmt" inputmode="decimal" placeholder="0,00">', null, "Mindestens 1 €. Der Kunde bekommt die Rechnung im Postfach."),
    actions: '<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Rechnung erstellen</button>',
    onAction: function(a, el, close){
      if (a !== "save") return;
      var desc = $("#ivDesc", el).value.trim();
      var amt = parseFloat(($("#ivAmt", el).value || "").replace(/\./g, "").replace(",", "."));
      var bad = false;
      if (!desc){ $("#ivDescErr", el).textContent = "Bitte eine Leistung eingeben."; bad = true; }
      if (!(amt >= 1)){ $("#ivAmtErr", el).textContent = "Bitte einen Betrag von mindestens 1 € eingeben."; bad = true; }
      if (bad) return;
      invoices.unshift({ id:"R-" + (2042 + invoices.length - 3), cust:$("#ivCust", el).value, desc:desc, amt:Math.round(amt), status:"offen", due:"fällig in 14 Tagen" });
      close(); renderInvoices(); toast("Rechnung erstellt.", "ok");
    }
  });
}

/* ---------- Einstellungen ---------- */
var prefs = store.get("prefs", { ai:true, sound:true, motion:false, cb:true, keys:true, ingame:true, mail:false });
function applyPrefs(){
  $$("[data-pref]").forEach(function(s){
    var k = s.getAttribute("data-pref");
    s.setAttribute("aria-checked", prefs[k] ? "true" : "false");
  });
  document.documentElement.toggleAttribute("data-motion", !!prefs.motion);
}
$$("[data-pref]").forEach(function(s){
  s.addEventListener("click", function(){
    var k = s.getAttribute("data-pref");
    prefs[k] = !prefs[k];
    store.set("prefs", prefs);
    applyPrefs();
  });
});
applyPrefs();
$$("[data-speed],[data-lang],[data-fs]").forEach(function(b){
  b.addEventListener("click", function(){
    var group = b.parentElement;
    group.querySelectorAll("button").forEach(function(x){ x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    if (b.hasAttribute("data-lang") && b.getAttribute("data-lang") === "en") toast("Englisch folgt in einer späteren Version. Die Oberfläche bleibt deutsch.");
    if (b.hasAttribute("data-fs")) document.documentElement.style.fontSize = b.getAttribute("data-fs") === "large" ? "16px" : "15px";
  });
});
/* ---------- Benachrichtigungen ---------- */
document.addEventListener("click", function(e){
  var g = e.target.closest("[data-go]");
  if (!g) return;
  closePops();
  location.hash = g.getAttribute("data-go");
});

/* ---------- RDP-Fernwartung ---------- */
var RDP_DATA = {
  "T-1031": {
    ping: "Zeitüberschreitung bei der Anfrage an 10.0.4.21",
    ipconfig: ["Ethernet: 10.0.4.12/24", "Gateway: 10.0.4.1", "Drucker-Port 9100: keine Verbindung"],
    logs: ["15.03  System  Spooler: Treiber HP-Universal 4.2 beim Start abgebrochen", "15.02  System  Druckauftrag 88 verworfen"],
    devices: [{ name:"HP-Universal", warn:true, text:"Treiber fehlt oder ist fehlerhaft" }, { name:"Netzwerk-Adapter", warn:false, text:"OK" }],
    services: [{ name:"spooler", st:"gestoppt" }, { name:"dhcp", st:"läuft" }],
    fix: "reinstall-driver hp-universal",
    fixOut: ["Treiber HP-Universal 4.3 installiert.", "Spooler antwortet. Testseite gedruckt. Der Drucker ist wieder online."],
    config: ["spooler: Start automatisch", "Treiber-Update: automatisch"]
  },
  "T-1032": {
    ping: "Antwort von 10.0.2.1: Zeit=4 ms",
    ipconfig: ["WLAN: Adapter erkannt, kein Zugriff aufs Netz", "Bluetooth: Adapter antwortet nicht"],
    logs: ["07:12  Bluetooth  Treiber 8.1 Fehler 0x80070002", "07:12  Kernel     Startvorgang angehalten"],
    devices: [{ name:"Bluetooth", warn:true, text:"Gerät antwortet nicht" }, { name:"WLAN-Adapter", warn:true, text:"Adapter ohne Antwort" }],
    services: [{ name:"bthserv", st:"gestoppt" }],
    fix: "reinstall-driver bluetooth",
    hardware: ["Treiber installiert. Der Adapter antwortet trotzdem nicht.", "Das deutet auf einen Hardwaredefekt hin. Werkstatt nötig."],
    config: ["bthserv: Start automatisch"]
  },
  "T-1033": {
    ping: "Zeitüberschreitung bei der Anfrage an 10.0.0.1",
    ipconfig: ["Lager-Netz: 10.0.0.23/24", "Gateway: 10.0.0.1 nicht erreichbar"],
    logs: ["03:55  Router  Firmware 9.3: Prüfsumme ungültig", "03:55  Router  Notmodus aktiv"],
    devices: [{ name:"router-fw", warn:true, text:"Prüfsumme ungültig" }],
    services: [{ name:"router-fw", st:"Fehler" }],
    fix: "restart-service router-fw",
    fixOut: ["Firmware aus Slot 2 gestartet.", "Der Router ist wieder da. Das Lager ist online."],
    config: ["router-fw: Slot 1 defekt, Slot 2 bereit"]
  },
  "T-1034": {
    ping: "Antwort von 10.0.5.9: Zeit=2 ms",
    ipconfig: ["Konto beispiel.a: gesperrt nach 5 Fehlversuchen"],
    logs: ["Gestern 09:12  Security  Konto gesperrt"],
    devices: [],
    services: [],
    fix: "reset-password beispiel.a",
    fixOut: ["Passwort für beispiel.a zurückgesetzt.", "Einmal-Passwort an den Kunden gesendet."],
    config: ["Sperrschwelle: 5 Fehlversuche"]
  }
};
var RDP_DEFAULT = { ping: "Antwort von 10.0.0.1: Zeit=3 ms", ipconfig: ["Keine Auffälligkeiten"], logs: ["Keine Auffälligkeiten im Protokoll."], devices: [], services: [], fix: null, config: ["Keine Konfiguration zu prüfen"] };
var RDP_HELP = [
  "help                 diese Hilfe",
  "ping <ziel>          Erreichbarkeit prüfen",
  "ipconfig             Netzwerk anzeigen",
  "get-eventlog         Ereignisprotokoll lesen",
  "view-config <dienst> Konfiguration anzeigen",
  "restart-service <dienst>",
  "reinstall-driver <treiber>",
  "reset-password <konto>",
  "exit                 Sitzung beenden"
];
var rdpActive = false;
var rdpLines = [];
var rdpWinApp = null;

function rc(){ return RDP_DATA[findTicket().id] || RDP_DEFAULT; }
function updateConn(){
  var el = $("#tkConn");
  if (!el) return;
  el.textContent = rdpActive ? "Verbunden" : "Nicht verbunden";
  el.className = "tag " + (rdpActive ? "t-ok" : "t-mut");
  $("#tkRdp").textContent = rdpActive ? "Sitzung öffnen" : "RDP verbinden";
}
function startRdp(){
  var t = findTicket();
  rdpActive = true;
  t.rdpMin = t.rdpMin || 0;
  rdpLines = ["WinSec-OS 11 · Fernwartung verbunden mit dem Rechner von " + t.cust + ".", "Tippe help für eine Befehlsübersicht."];
  $("#rdpTitle").textContent = "Fernwartung · " + t.cust + " · " + t.id;
  $("#rdpTime").textContent = "Sitzungszeit " + t.rdpMin + " min";
  $("#rdp").hidden = false;
  closeRdpWin();
  updateConn();
  openRdpApp("cmd");
}
function endRdp(){
  var t = findTicket();
  if (!rdpActive) return;
  rdpActive = false;
  t.thread.push({ k:"note", who:"Intern", text:"Fernwartung beendet nach " + t.rdpMin + " Minuten.", when:"Gerade eben" });
  $("#rdp").hidden = true;
  closeRdpWin();
  updateConn();
  renderTicket();
  renderAll();
  toast("Sitzung beendet.");
}
function closeRdpWin(){
  $("#rdpWin").hidden = true;
  rdpWinApp = null;
}
function renderRdpOut(){
  var o = $("#rdpOut");
  if (!o) return;
  o.innerHTML = rdpLines.map(function(l){ return '<div>' + esc(l) + '</div>'; }).join("");
  o.scrollTop = o.scrollHeight;
}
function openRdpApp(app){
  var c = rc();
  var titles = { cmd:"Eingabeaufforderung", events:"Ereignisanzeige", devmgr:"Geräte-Manager", svc:"Dienste", net:"Netzwerk" };
  var body = "";
  if (app === "cmd") {
    body = '<div class="term rdp-out" id="rdpOut" aria-live="polite"></div>' +
      '<form id="rdpForm" class="rdp-form"><span class="mono" aria-hidden="true">PS&gt;</span><input class="inp mono" id="rdpIn" autocomplete="off" aria-label="Befehl eingeben"></form>';
  }
  if (app === "events") {
    body = c.logs.map(function(l){ return '<div class="mono" style="padding:8px 0;border-bottom:1px solid var(--line)">' + esc(l) + '</div>'; }).join("") || '<p class="hint">Keine Einträge.</p>';
  }
  if (app === "devmgr") {
    body = c.devices.length ? c.devices.map(function(d){
      return '<div class="li" style="padding:10px 0"><div class="main-t"><div style="font-weight:650">' + esc(d.name) + '</div><div class="sub" style="font-size:13px;color:' + (d.warn ? 'var(--warn)' : 'var(--ink2)') + '">' + esc(d.text) + '</div></div>' +
        (d.warn ? '<button class="btn btn-sm" type="button" data-rdp-cmd="reinstall-driver ' + esc(d.name.toLowerCase()) + '">Treiber neu installieren</button>' : '') + '</div>';
    }).join("") : '<p class="hint">Keine Geräte mit Auffälligkeiten.</p>';
  }
  if (app === "svc") {
    body = c.services.length ? c.services.map(function(s){
      return '<div class="li" style="padding:10px 0"><div class="main-t"><div style="font-weight:650">' + esc(s.name) + '</div><div class="sub" style="font-size:13px">' + esc(s.st) + '</div></div><button class="btn btn-s btn-sm" type="button" data-rdp-cmd="restart-service ' + esc(s.name) + '">Neu starten</button></div>';
    }).join("") : '<p class="hint">Keine auffälligen Dienste.</p>';
  }
  if (app === "net") {
    body = '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><button class="btn btn-s btn-sm" type="button" data-rdp-net="ping">Erreichbarkeit prüfen</button><button class="btn btn-s btn-sm" type="button" data-rdp-net="ipconfig">IP-Konfiguration</button></div><div class="term" id="netOut" style="min-height:120px">Noch keine Ausgabe.</div>';
  }
  $("#rdpWt").textContent = titles[app];
  $("#rdpWb").innerHTML = body;
  $("#rdpWin").hidden = false;
  rdpWinApp = app;
  if (app === "cmd") {
    renderRdpOut();
    setTimeout(function(){ var i = $("#rdpIn"); if (i) i.focus(); }, 20);
  }
}
function rdpExec(raw){
  var s = (raw || "").trim();
  if (!s) return;
  var t = findTicket(), c = rc();
  var parts = s.split(/\s+/);
  var cmd = parts[0].toLowerCase();
  var arg = parts.slice(1).join(" ").toLowerCase();
  rdpLines.push("PS> " + s);
  var out = [];
  if (cmd !== "help" && cmd !== "exit") {
    t.inv++;
    t.rdpMin = (t.rdpMin || 0) + 2;
  }
  if (c.fix && (cmd + " " + arg).trim() === c.fix) {
    if (c.hardware) {
      out = c.hardware;
      t.rdpHw = true;
      t.thread.push({ k:"staff", who:t.who, text:"Fernwartung: Adapter antwortet nicht. Werkstatt nötig.", when:"Gerade eben" });
    } else {
      out = c.fixOut;
      t.fixed = true;
      t.thread.push({ k:"staff", who:t.who, text:"Fernwartung: " + c.fix + " ausgeführt. Ursache gefunden.", when:"Gerade eben" });
      toast("Fehler behoben. Lösung im Ticket dokumentieren.", "ok");
    }
  }
  else if (cmd === "help") out = RDP_HELP;
  else if (cmd === "ping") out = arg ? [c.ping] : ["Ziel fehlt. Beispiel: ping 10.0.0.1"];
  else if (cmd === "ipconfig") out = c.ipconfig;
  else if (cmd === "get-eventlog") out = c.logs;
  else if (cmd === "view-config") out = c.config;
  else if (cmd === "restart-service") out = arg ? ["Dienst " + arg + " wird neu gestartet ...", "Dienst " + arg + " läuft. Der Fehler besteht weiter."] : ["Dienstname fehlt."];
  else if (cmd === "reinstall-driver") out = arg ? ["Treiber " + arg + " wird neu installiert ...", "Kein passender Treiber gefunden. Prüfe den Namen im Geräte-Manager."] : ["Treibername fehlt."];
  else if (cmd === "reset-password") out = arg ? ["Passwort für " + arg + " zurückgesetzt. Einmal-Passwort gesetzt."] : ["Kontoname fehlt."];
  else if (cmd === "exit") { endRdp(); return; }
  else out = ["Befehl nicht erkannt: " + cmd + ". help zeigt alle Befehle."];
  out.forEach(function(l){ rdpLines.push(l); });
  $("#rdpTime").textContent = "Sitzungszeit " + (t.rdpMin || 0) + " min";
  renderRdpOut();
  renderTicket();
  renderAll();
}
$("#rdp").addEventListener("submit", function(e){
  if (e.target.id !== "rdpForm") return;
  e.preventDefault();
  var i = $("#rdpIn");
  rdpExec(i.value);
  i.value = "";
  i.focus();
});
$("#rdp").addEventListener("click", function(e){
  var t = e.target;
  if (t.closest("#rdpClose")) return endRdp();
  if (t.closest("#rdpWc")) return closeRdpWin();
  if (t.closest("#rdpStart")) return toast("Nutze die Symbole auf dem Desktop der Fernwartung.");
  var ic = t.closest("[data-rdp-app]");
  if (ic) return openRdpApp(ic.getAttribute("data-rdp-app"));
  var cm = t.closest("[data-rdp-cmd]");
  if (cm) return rdpExec(cm.getAttribute("data-rdp-cmd"));
  var nt = t.closest("[data-rdp-net]");
  if (nt) {
    var kind = nt.getAttribute("data-rdp-net");
    var lines = kind === "ping" ? [rc().ping] : rc().ipconfig;
    $("#netOut").innerHTML = lines.map(function(l){ return '<div>' + esc(l) + '</div>'; }).join("");
  }
});
$("#tkRdp").addEventListener("click", function(){
  if (rdpActive) { $("#rdp").hidden = false; openRdpApp(rdpWinApp || "cmd"); return; }
  confirmModal("Fernzugriff starten?", "Der Kunde muss zustimmen. Danach siehst und steuerst du seinen Rechner über WinSec-OS RDP. Die Sitzung wird protokolliert.", "Verbinden", "", startRdp);
});

/* ---------- Hardware-Werkstatt: Werkbank (Detail) ---------- */
var WB_TOOLS = { ph0:"PH0 (klein)", ph1:"PH1", torx:"Torx T5", pinzette:"Pinzette", spudger:"Spudger", druck:"Druckluft" };
var WB_CONN = { akku:"plug", ant1:"plug", ant2:"plug", fan:"plug", tast:"zif", touch:"zif", disp:"zif" };
var WB_CONN_NAME = { akku:"Akkustecker", ant1:"Antennenkabel 1", ant2:"Antennenkabel 2", fan:"Lüfterstecker", tast:"Tastatur-Flachbandkabel", touch:"Touchpad-Kabel", disp:"Display-Kabel (eDP)" };
var WB_PARTS = {
  akku:    { name:"Akku 56 Wh", short:"Akku", x:48, y:60, w:320, h:250, elec:true, conns:["akku"], clips:false,
             spec:[["Hersteller","Nordtek"],["Modell","NT-56"],["Spannung","11,4 V (3 Zellen)"],["Ladezyklen","412"],["Gesundheit","87 %"]],
             desc:"Lithium-Akku. Der Stecker sitzt auf dem Mainboard. Immer zuerst trennen, sonst droht ein Kurzschluss beim Ausbau anderer Teile." },
  ram1:    { name:"Arbeitsspeicher 8 GB, Steckplatz A", short:"RAM A", x:430, y:330, w:190, h:34, elec:true, conns:[], clips:true,
             spec:[["Standard","DDR4-2666 SO-DIMM"],["Kapazität","8 GB"],["Spannung","1,2 V"],["Latenz","CL19"]],
             desc:"Speichermodul. Die Klammern an beiden Enden halten es fest. Erst öffnen, dann nach oben kippen und ziehen." },
  ram2:    { name:"Arbeitsspeicher 8 GB, Steckplatz B", short:"RAM B", x:430, y:378, w:190, h:34, elec:true, conns:[], clips:true,
             spec:[["Standard","DDR4-2666 SO-DIMM"],["Kapazität","8 GB"],["Spannung","1,2 V"],["Latenz","CL19"]],
             desc:"Zweites Modul für den Dual-Channel-Betrieb. Beide Module sollten gleich sein." },
  ssd:     { name:"SSD 512 GB NVMe, M.2 2280", short:"SSD", x:640, y:330, w:130, h:26, elec:true, conns:[], clips:false,
             spec:[["Schnittstelle","PCIe 3.0 x4"],["Lesen","2 800 MB/s"],["Zustand","97 %"],["Inhalt","Kundenbuchhaltung"]],
             desc:"Die Festplatte mit den Kundendaten. Sie wird mit einer Schraube gehalten und bleibt beim Ausbau unbeschädigt, wenn der Akku vorher getrennt war." },
  wlan:    { name:"WLAN/Bluetooth-Modul 5.0", short:"WLAN/BT", x:640, y:420, w:100, h:50, elec:true, conns:["ant1","ant2"], clips:false,
             spec:[["Bauform","M.2 Key E"],["Funk","Wi-Fi 5, Bluetooth 5.0"],["Fehlercode","0x80070002"],["Antennen","2 × 2,4/5 GHz"]],
             desc:"Funkmodul mit zwei Antennenkabeln. Der Fehler: Der Adapter antwortet nicht. Vor dem Ausbau beide Antennen lösen." },
  luefter: { name:"CPU-Lüfter", short:"Lüfter", x:744, y:100, w:100, h:100, elec:true, conns:["fan"], clips:false,
             spec:[["Spannung","5 V"],["Stromaufnahme","0,5 A"],["Drehzahl max.","4 000 U/min"],["Staub","hoch"]],
             desc:"Kühlt die CPU. Staub bremst die Drehzahl, und ein fehlender Stecker zeigt sich im Test sofort." },
  kuehler: { name:"Kühlkörper mit Heatpipes", short:"Kühler", x:552, y:100, w:178, h:150, elec:false, conns:[], clips:false,
             spec:[["Bauart","2 Heatpipes Ø 6 mm"],["Kontakt","Kupferboden"],["Befestigung","4 Schrauben Torx T5"]],
             desc:"Leitet die Wärme der CPU ab. Beim Abnehmen muss die alte Paste entfernt und neue aufgetragen werden." },
  cpu:     { name:"Prozessor (CPU)", short:"CPU", x:606, y:145, w:70, h:60, elec:false, conns:[], clips:false,
             spec:[["Kerne","6"],["TDP","45 W"],["Sockel","BGA, verlötet"]],
             desc:"Unter dem Kühlkörper. Die Wärmeleitpaste zwischen CPU und Kühlkörper muss sauber und frisch sein." },
  speaker: { name:"Lautsprecher links", short:"Lautsprecher", x:90, y:370, w:110, h:110, elec:false, conns:[], clips:false, glue:true,
             spec:[["Leistung","2 W"],["Befestigung","Klebeband"]],
             desc:"Mit doppelseitigem Klebeband befestigt. Erst das Klebeband mit dem Spudger lösen, dann herausnehmen." },
  ladung:  { name:"DC-Ladebuchse 19 V", short:"Ladebuchse", x:36, y:330, w:22, h:30, elec:false, conns:[], clips:false,
             spec:[["Spannung","19 V"],["Strom","3,42 A"]],
             desc:"Die Buchse für das Netzteil. Mit dem Messgerät lässt sich prüfen, ob Spannung ankommt." },
  tast:    { name:"Tastatur-Flachbandkabel", short:"Tastatur", x:446, y:456, w:56, h:48, elec:true, conns:["tast"], clips:false,
             spec:[["Anschluss","ZIF, 30 Pins"],["Verriegelung","Klappe"]],
             desc:"Verbindet die Tastatur mit dem Mainboard. Erst die Klappe öffnen, dann das Kabel gerade herausziehen." },
  touch:   { name:"Touchpad-Kabel", short:"Touchpad", x:522, y:456, w:46, h:48, elec:true, conns:["touch"], clips:false,
             spec:[["Anschluss","ZIF, 10 Pins"],["Verriegelung","Klappe"]],
             desc:"Verbindet das Touchpad. Ein lockeres Kabel führt zu springendem Cursor." },
  disp:    { name:"Display-Kabel (eDP)", short:"Display", x:774, y:456, w:56, h:48, elec:true, conns:["disp"], clips:false,
             spec:[["Anschluss","eDP, 40 Pins"],["Verriegelung","Klappe"]],
             desc:"Führt das Bild zum Display. Ohne dieses Kabel bleibt der Bildschirm schwarz." }
};
var WB_ORDER = ["akku","ram1","ram2","ssd","wlan","luefter","kuehler","cpu","speaker","ladung","tast","touch","disp"];
var WB_SCREW_POS = {
  cover: [[120,96,"ph0"],[300,96,"ph0"],[450,96,"ph0"],[600,96,"ph0"],[780,96,"ph0"],[800,250,"ph0"],[800,380,"torx"],[200,500,"torx"],[450,500,"torx"],[700,500,"torx"]],
  akku:  [[64,76,"ph0"],[352,76,"ph0"],[64,294,"ph0"],[352,294,"ph0"]],
  ssd:   [[756,343,"ph0"]],
  wlan:  [[730,445,"ph0"]],
  luefter:[[834,110,"ph0"],[754,190,"ph0"]],
  kuehler:[[568,116,"torx"],[714,116,"torx"],[568,234,"torx"],[714,234,"torx"]]
};

function wbScrewsInit(){
  var list = [];
  Object.keys(WB_SCREW_POS).forEach(function(comp){
    WB_SCREW_POS[comp].forEach(function(q, i){
      list.push({ id:comp + "-" + i, comp:comp, n:i + 1, type:q[2], x:q[0], y:q[1], st:"drin" });
    });
  });
  return list;
}
function wbReset(){
  WS = {
    esd:false, tool:"ph0", tray:true, cover:false, sel:null, lost:0,
    stock:2, paste:1, damaged:false, min:0, quality:100, log:[], tested:null, checks:[], temps:null, read:{},
    wlanNew:false,
    screws: wbScrewsInit(),
    c: { akku:"verbunden", ant1:"verbunden", ant2:"verbunden", fan:"verbunden", tast:"verbunden", touch:"verbunden", disp:"verbunden" },
    p: {
      akku:    { st:"in" },
      ram1:    { st:"in", clips:"zu" },
      ram2:    { st:"in", clips:"zu" },
      ssd:     { st:"in" },
      wlan:    { st:"in", defekt:true },
      luefter: { st:"in", staub:true },
      kuehler: { st:"in" },
      cpu:     { paste:"alt" },
      speaker: { st:"in", glue:"geklebt" },
      ladung:  { st:"in" }
    }
  };
}
var WS = null;
wbReset();

function wbLog(line){ WS.log.unshift(line); }
function wbTick(m){ WS.min += m; }
function wbDamage(why){
  if (WS.damaged) return;
  WS.damaged = true;
  WS.quality = Math.max(0, WS.quality - 30);
  wbLog("Kurzschluss: Mainboard beschädigt. " + why);
}
function wbPowered(){ return WS.c.akku === "verbunden" && WS.p.akku.st === "in"; }
function wbScrews(comp){ return WS.screws.filter(function(s){ return s.comp === comp; }); }
function wbScrewsRaus(comp){ return wbScrews(comp).every(function(s){ return s.st === "raus" || s.st === "verloren"; }); }
function wbScrewDrin(comp){ return wbScrews(comp).every(function(s){ return s.st === "drin"; }); }
function wbCoverOff(){ return WS.cover; }

function wbConnText(c){
  var v = WS.c[c];
  if (v === "verbunden") return "verbunden";
  if (v === "entriegelt") return "Klappe offen";
  return "gelöst";
}
function wbText(k){
  if (k === "akku") return WS.p.akku.st === "in" ? (WS.c.akku === "verbunden" ? "verbunden" : "Stecker gelöst") : "ausgebaut";
  if (k === "ram1" || k === "ram2") return WS.p[k].st === "raus" ? "ausgebaut" : "eingesetzt" + (WS.p[k].clips === "offen" ? " · Klammern offen" : "");
  if (k === "ssd") return WS.p.ssd.st === "raus" ? "ausgebaut" : "eingesetzt";
  if (k === "wlan") {
    if (WS.p.wlan.st === "raus") return "ausgebaut";
    return (WS.wlanNew ? "neu" : "defekt") + " · Antennen " + (WS.c.ant1 === "verbunden" && WS.c.ant2 === "verbunden" ? "dran" : "lose");
  }
  if (k === "luefter") return WS.p.luefter.st === "raus" ? "ausgebaut" : (WS.c.fan === "verbunden" ? "eingebaut" : "Stecker gelöst") + (WS.p.luefter.staub ? " · staubig" : "");
  if (k === "kuehler") return WS.p.kuehler.st === "raus" ? "abgenommen" : "eingebaut";
  if (k === "cpu") return WS.p.kuehler.st === "raus" ? "Paste " + ({alt:"alt", leer:"entfernt", neu:"frisch"})[WS.p.cpu.paste] : "unter Kühlkörper";
  if (k === "speaker") return WS.p.speaker.st === "raus" ? "ausgebaut" : (WS.p.speaker.glue === "geklebt" ? "verklebt" : "Kleber gelöst");
  if (k === "ladung") return "eingebaut";
  if (k === "tast" || k === "touch" || k === "disp") return wbConnText(k);
  return "";
}
function wbClass(k){
  if (k === "wlan" && WS.wlanNew) return "neu";
  if (k === "wlan" && WS.p.wlan.defekt) return "defekt";
  if (WS.p[k] && WS.p[k].st === "raus") return "raus";
  if (k === "tast" || k === "touch" || k === "disp") return WS.c[k] === "verbunden" ? "" : "warn";
  if (k === "akku" && WS.c.akku !== "verbunden") return "warn";
  if (k === "kuehler" && WS.cpu_warn) return "warn";
  return "";
}

/* Aktionen für ein Bauteil (Liste für das Detailpanel) */
function wbActions(k){
  var a = [];
  var p = WS.p[k];
  if (k === "tast" || k === "touch" || k === "disp") {
    var v = WS.c[k];
    if (v === "verbunden") a.push(["zifOpen", "Klappe öffnen", "spudger", k]);
    if (v === "entriegelt") { a.push(["zifPull", "Kabel abziehen", "pinzette", k]); a.push(["zifClose", "Klappe schließen", "spudger", k]); }
    if (v === "gelöst") a.push(["zifIn", "Kabel einstecken", "pinzette", k]);
    return a;
  }
  if (k === "cpu") {
    if (p && p.paste === "alt" && WS.p.kuehler.st === "raus") a.push(["pasteRm", "Alte Paste entfernen (Tuch)", null, "cpu"]);
    if (WS.p.kuehler.st === "raus" && WS.p.cpu.paste === "leer" && WS.paste > 0) a.push(["pasteOn", "Frische Paste auftragen", null, "cpu"]);
    return a;
  }
  if (k === "akku") {
    if (WS.c.akku === "verbunden") a.push(["plugOff", "Akkustecker lösen", "pinzette", "akku"]);
    else if (p.st === "in") { a.push(["plugOn", "Akkustecker anstecken", "pinzette", "akku"]); }
    a.push(["messen", "Spannung messen", "multi", "akku"]);
  }
  if (k === "ladung") a.push(["messen", "Spannung messen", "multi", "ladung"]);
  if (k === "luefter") a.push(["messen", "Strom messen", "multi", "luefter"]);
  if (k === "ram1" || k === "ram2") {
    if (p.st === "in" && p.clips === "zu") a.push(["clipOpen", "Klammern öffnen", "spudger", k]);
    if (p.st === "in" && p.clips === "offen") a.push(["clipClose", "Klammern schließen", "spudger", k]);
  }
  if (k === "speaker" && p.glue === "geklebt" && p.st === "in") a.push(["glueOff", "Klebeband lösen", "spudger", k]);
  if (k === "kuehler" && p.st === "in" && !wbScrewDrin("kuehler") === false) { /* Schrauben werden unten gelistet */ }
  if (k === "wlan" && WS.p.wlan.st === "in") {
    if (WS.c.ant1 === "verbunden") a.push(["antOff1", "Antennenkabel 1 lösen", "pinzette", "ant1"]);
    else a.push(["antOn1", "Antennenkabel 1 anstecken", "pinzette", "ant1"]);
    if (WS.c.ant2 === "verbunden") a.push(["antOff2", "Antennenkabel 2 lösen", "pinzette", "ant2"]);
    else a.push(["antOn2", "Antennenkabel 2 anstecken", "pinzette", "ant2"]);
  }
  if (k === "luefter" && p.staub && p.st === "in") a.push(["reinigen", "Lüfter ausblasen", "druck", k]);
  if (k === "luefter" && p.st === "in" && WS.c.fan === "gelöst") a.push(["fanIn", "Lüfterstecker anstecken", "pinzette", "fan"]);
  if (k === "luefter" && p.st === "in" && WS.c.fan === "verbunden") a.push(["fanOff", "Lüfterstecker lösen", "pinzette", "fan"]);
  if (k === "ram1" || k === "ram2" || k === "ssd" || k === "luefter" || k === "wlan" || k === "speaker" || k === "kuehler" || k === "akku") {
    if (p.st === "in" && canRemove(k)) a.push(["ausbauen", "Ausbauen", null, k]);
    if (p.st === "raus") a.push(["einbauen", "Einsetzen (Schrauben danach)", null, k]);
  }
  return a;
}
function canRemove(k){
  var p = WS.p[k];
  if (!wbScrewsRaus(k)) return false;
  var cs = (WB_PARTS[k].conns || []);
  if (cs.some(function(c){ return WS.c[c] !== "gelöst"; })) return false;
  if (WB_PARTS[k].clips && (p.clips === "zu")) return false;
  if (WB_PARTS[k].glue && p.glue === "geklebt") return false;
  if (k === "wlan" && (WS.c.ant1 === "verbunden" || WS.c.ant2 === "verbunden")) return false;
  if (k === "kuehler" && WS.p.cpu.paste === "alt" && false) return false;
  return true;
}
function wbRemoveCheck(k){
  if (WB_PARTS[k].elec && wbPowered()) wbDamage("Der Akku war noch verbunden, als " + WB_PARTS[k].short + " entfernt wurde.");
}
function wbScrewAct(id){
  var s = WS.screws.filter(function(x){ return x.id === id; })[0];
  if (!s) return;
  if (s.comp === "cover") { if (WS.cover) { toast("Die Bodenplatte ist schon ab."); return; } }
  else if (!WS.cover) { toast("Erst die Bodenplatte abnehmen."); return; }
  if (WS.tool !== s.type) { toast("Dafür brauchst du den " + WB_TOOLS[s.type] + " (Werkzeug oben wählen)."); return; }
  var comp = s.comp;
  if (s.st === "drin") { s.st = "lose"; wbTick(1); wbLog("Schraube " + s.n + " (" + comp + ") gelöst, sitzt noch drin."); return; }
  if (s.st === "lose") {
    if (WS.tray) { s.st = "raus"; wbTick(1); wbLog("Schraube " + s.n + " in die Schraubenschale gelegt."); }
    else { s.st = "verloren"; WS.lost++; wbTick(1); wbLog("Schraube " + s.n + " ist ohne Schraubenschale verloren gegangen."); }
    return;
  }
  if (s.st === "raus" && comp !== "cover") {
    if (!(WS.p[comp] && WS.p[comp].st === "in")) { toast("Das Bauteil muss zuerst eingesetzt werden."); return; }
    s.st = "drin"; wbTick(1); wbLog("Schraube " + s.n + " (" + comp + ") festgedreht."); return;
  }
  if (s.st === "raus" && comp === "cover") { toast("Die Bodenplatte wird beim Schließen festgeschraubt."); return; }
}
function wbAct(k, act){
  var p = WS.p[k];
  if (act === "messen") {
    var v;
    if (k === "akku") v = WS.damaged ? "Spannung schwankt stark. Mainboard beschädigt." : (WS.c.akku === "verbunden" ? "11,4 V · in Ordnung" : "0 V · kein Akku angeschlossen");
    else if (k === "ladung") v = WS.damaged ? "19,6 V · schwankt" : (wbPowered() ? "19,1 V · in Ordnung" : "0 V · kein Akku, Netzteil nicht gesteckt");
    else v = (WS.c.fan === "verbunden" && WS.p.luefter.st === "in" && !WS.damaged) ? "5,0 V · 0,46 A" : "0 V · kein Strom";
    WS.read[k] = v; wbTick(2); wbLog("Messung " + WB_PARTS[k].short + ": " + v); toast(v); return;
  }
  if (!WS.cover) { toast("Erst die Bodenplatte abnehmen."); return; }
  if (act === "plugOff") { WS.c.akku = "gelöst"; wbTick(2); wbLog("Akkustecker gelöst."); return; }
  if (act === "plugOn") { WS.c.akku = "verbunden"; wbTick(2); wbLog("Akkustecker angesteckt."); return; }
  if (act === "antOff1") { WS.c.ant1 = "gelöst"; wbTick(1); wbLog("Antennenkabel 1 gelöst."); return; }
  if (act === "antOff2") { WS.c.ant2 = "gelöst"; wbTick(1); wbLog("Antennenkabel 2 gelöst."); return; }
  if (act === "antOn1") { WS.c.ant1 = "verbunden"; wbTick(1); wbLog("Antennenkabel 1 angesteckt."); return; }
  if (act === "antOn2") { WS.c.ant2 = "verbunden"; wbTick(1); wbLog("Antennenkabel 2 angesteckt."); return; }
  if (act === "fanOff") { WS.c.fan = "gelöst"; wbTick(1); wbLog("Lüfterstecker gelöst."); return; }
  if (act === "fanIn") { WS.c.fan = "verbunden"; wbTick(1); wbLog("Lüfterstecker angesteckt."); return; }
  if (act === "zifOpen") { WS.c[k] = "entriegelt"; wbTick(2); wbLog(WB_CONN_NAME[k] + ": Klappe geöffnet."); return; }
  if (act === "zifClose") { WS.c[k] = "verbunden"; wbTick(2); wbLog(WB_CONN_NAME[k] + ": Klappe geschlossen, verriegelt."); return; }
  if (act === "zifPull") { WS.c[k] = "gelöst"; wbTick(2); wbLog(WB_CONN_NAME[k] + " abgezogen."); return; }
  if (act === "zifIn") { WS.c[k] = "entriegelt"; wbTick(2); wbLog(WB_CONN_NAME[k] + " eingesteckt. Klappe noch offen."); return; }
  if (act === "clipOpen") { p.clips = "offen"; wbTick(1); wbLog(WB_PARTS[k].short + ": Klammern geöffnet."); return; }
  if (act === "clipClose") { p.clips = "zu"; wbTick(1); wbLog(WB_PARTS[k].short + ": Klammern geschlossen."); return; }
  if (act === "glueOff") { p.glue = "gelöst"; wbTick(2); wbLog("Klebeband vom Lautsprecher gelöst."); return; }
  if (act === "reinigen") { p.staub = false; wbTick(4); wbLog("Lüfter mit Druckluft ausgeblasen."); return; }
  if (act === "pasteRm") { WS.p.cpu.paste = "leer"; wbTick(3); wbLog("Alte Paste von CPU und Kühlkörper entfernt."); return; }
  if (act === "pasteOn") { if (WS.paste < 1) { toast("Keine Wärmeleitpaste mehr. Im Lager nachbestellen."); return; } WS.paste -= 1; WS.p.cpu.paste = "neu"; wbTick(3); wbLog("Frische Wärmeleitpaste aufgetragen (" + WS.paste + " Tube übrig)."); return; }
  if (act === "ausbauen") {
    if (!canRemove(k)) { toast("Vorher alle Schrauben und Stecker lösen."); return; }
    wbRemoveCheck(k);
    p.st = "raus"; wbTick(3); wbLog(WB_PARTS[k].name + " ausgebaut.");
    if (k === "wlan") WS.wlanNew = WS.wlanNew;
    return;
  }
  if (act === "einbauen") {
    if (k === "wlan") {
      if (WS.stock < 1) { toast("Kein WLAN-Modul im Lager. Bestelle im Tab Lager."); return; }
      WS.stock -= 1; WS.wlanNew = true; WS.p.wlan.defekt = false; p.st = "in"; wbTick(4);
      wbLog("Neues WLAN-Modul eingesetzt. Lager: " + WS.stock + ". Antennen noch lösen, dann anstecken.");
      return;
    }
    p.st = "in"; if (WB_PARTS[k].clips) p.clips = "zu"; if (k === "speaker") p.glue = "geklebt"; wbTick(3);
    wbLog(WB_PARTS[k].name + " eingesetzt. Schrauben festdrehen.");
    return;
  }
  if (act === "plugOn") return;
  toast("Dieser Schritt ist gerade nicht möglich.");
}
function wbCover(){
  if (!WS.cover) {
    if (!wbScrewsRaus("cover")) { toast("Erst alle zehn Bodenplatten-Schrauben lösen."); return; }
    if (!WS.esd) { WS.quality = Math.max(0, WS.quality - 10); wbLog("Ohne Antistatik-Armband geöffnet. Risiko für das Mainboard."); }
    WS.cover = true; wbTick(3); wbLog("Bodenplatte abgenommen.");
    return;
  }
  var need = [];
  if (WS.c.akku !== "verbunden" || WS.p.akku.st !== "in") need.push("Akku");
  ["ram1","ram2"].forEach(function(k){ if (WS.p[k].st !== "in" || WS.p[k].clips !== "zu") need.push(WB_PARTS[k].short); });
  if (WS.p.ssd.st !== "in") need.push("SSD");
  if (WS.p.wlan.st !== "in" || !WS.wlanNew) need.push("WLAN-Modul");
  if (WS.c.ant1 !== "verbunden" || WS.c.ant2 !== "verbunden") need.push("WLAN-Antennen");
  if (WS.p.luefter.st !== "in" || WS.c.fan !== "verbunden") need.push("Lüfter");
  if (WS.p.kuehler.st !== "in") need.push("Kühlkörper");
  if (WS.p.speaker.st !== "in") need.push("Lautsprecher");
  if (WS.c.tast !== "verbunden") need.push("Tastatur-Kabel");
  if (WS.c.touch !== "verbunden") need.push("Touchpad-Kabel");
  if (WS.c.disp !== "verbunden") need.push("Display-Kabel");
  if (need.length) { toast("Vor dem Schließen fehlt oder ist offen: " + need.join(", ") + "."); return; }
  WS.cover = false;
  wbScrews("cover").forEach(function(s){ s.st = s.st === "verloren" ? "verloren" : "drin"; });
  wbTick(4); wbLog("Bodenplatte geschlossen. " + (WS.lost ? WS.lost + " Schraube(n) fehlen." : "Alle zehn Schrauben festgedreht."));
}
function wbTemps(){
  var fanOk = WS.c.fan === "verbunden" && WS.p.luefter.st === "in";
  var base = 46;
  var cpu = base + (WS.p.cpu.paste === "neu" ? 0 : 18) + (fanOk ? 0 : 22) + (WS.p.luefter.staub ? 6 : 0) + (WS.p.kuehler.st === "in" ? 0 : 30);
  return { cpu: cpu, fan: fanOk ? (WS.p.luefter.staub ? "3 100" : "3 900") + " U/min" : "0 U/min" };
}
function wbTest(){
  if (WS.cover) { toast("Erst die Bodenplatte schließen."); return; }
  wbTick(6);
  var p = WS.p, c = WS.c;
  var t = wbTemps();
  WS.temps = t;
  var checks = [
    ["Akku und Ladebuchse", c.akku === "verbunden" && p.akku.st === "in", "Akkustecker nicht gesteckt"],
    ["Arbeitsspeicher A", p.ram1.st === "in" && p.ram1.clips === "zu" && !WS.damaged, "Modul sitzt nicht richtig"],
    ["Arbeitsspeicher B", p.ram2.st === "in" && p.ram2.clips === "zu" && !WS.damaged, "Modul sitzt nicht richtig"],
    ["SSD", p.ssd.st === "in", "SSD nicht eingebaut"],
    ["WLAN und Bluetooth", p.wlan.st === "in" && WS.wlanNew && c.ant1 === "verbunden" && c.ant2 === "verbunden", !WS.wlanNew ? "Modul ist noch defekt" : "Antennen nicht angesteckt"],
    ["Tastatur", c.tast === "verbunden", "Flachbandkabel nicht verriegelt"],
    ["Touchpad", c.touch === "verbunden", "Kabel locker"],
    ["Display", c.disp === "verbunden", "Kein Bild ohne Display-Kabel"],
    ["Lüfter", p.luefter.st === "in" && c.fan === "verbunden" && !p.luefter.staub, c.fan !== "verbunden" ? "Lüfter ohne Strom" : "Lüfter dreht zu langsam (Staub)"],
    ["Kühlung und Paste", p.kuehler.st === "in" && p.cpu.paste === "neu", p.kuehler.st !== "in" ? "Kühlkörper fehlt" : "Paste nicht erneuert"],
    ["Temperatur unter Last", t.cpu < 80, "CPU wird mit " + t.cpu + " °C zu heiß"],
    ["Lautsprecher", p.speaker.st === "in", "Lautsprecher fehlt"],
    ["Schrauben vollzählig", WS.lost === 0, WS.lost + " Schraube(n) verloren, es klappert"]
  ];
  WS.checks = checks.map(function(x){ return { name:x[0], ok:!!x[1], note:x[1] ? "in Ordnung" : x[2] }; });
  var allOk = WS.checks.every(function(x){ return x.ok; }) && !WS.damaged;
  var tk = tickets.filter(function(x){ return x.id === "T-1032"; })[0];
  if (WS.damaged) { WS.tested = "board"; wbLog("Test: Gerät startet nicht. Mainboard beschädigt."); }
  else if (allOk) {
    WS.tested = "ok"; wbLog("Test: alle 13 Prüfungen bestanden.");
    if (tk) { tk.hw = true; tk.fixed = true; tk.thread.push({ k:"staff", who:tk.who, text:"Werkbank: WLAN/Bluetooth-Modul getauscht, alle Prüfungen bestanden.", when:"Gerade eben" }); }
    wjBenchDone();
    toast("Gerät getestet und in Ordnung.", "ok");
  } else {
    WS.tested = "fail"; WS.quality = Math.max(0, WS.quality - 5);
    var bad = WS.checks.filter(function(x){ return !x.ok; });
    wbLog("Test: " + bad.length + " Prüfung(en) fehlgeschlagen. Erste: " + bad[0].name + " (" + bad[0].note + ").");
    toast("Test nicht bestanden. Details im Ergebnis.", "bad");
  }
}

/* Bauteil-Schritte für die Checkliste */
function wbSteps(){
  return [
    ["Antistatik-Armband anlegen", WS.esd],
    ["Akkustecker lösen und Akku ausbauen", WS.c.akku !== "verbunden" && WS.p.akku.st === "raus"],
    ["Bodenplatte abnehmen (zehn Schrauben)", WS.cover],
    ["WLAN-Antennen lösen und Modul tauschen", WS.wlanNew && WS.c.ant1 === "verbunden" && WS.c.ant2 === "verbunden"],
    ["Lüfter ausblasen, Stecker prüfen", !WS.p.luefter.staub && WS.c.fan === "verbunden"],
    ["Kühlkörper lösen, Paste erneuern, einsetzen", WS.p.cpu.paste === "neu" && WS.p.kuehler.st === "in"],
    ["Kabel für Tastatur, Touchpad und Display prüfen", WS.c.tast === "verbunden" && WS.c.touch === "verbunden" && WS.c.disp === "verbunden"],
    ["Bodenplatte schließen und testen", WS.tested === "ok"]
  ];
}
/* Darstellung der Werkbank */
var WB_DEFS = '<defs>' +
  '<linearGradient id="wbAlu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a3346"/><stop offset="1" stop-color="#151b28"/></linearGradient>' +
  '<linearGradient id="wbPcb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f4a33"/><stop offset="1" stop-color="#0a3024"/></linearGradient>' +
  '<linearGradient id="wbBatt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#25324a"/><stop offset="1" stop-color="#18202f"/></linearGradient>' +
  '<linearGradient id="wbCoverP" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1d2639"/><stop offset="1" stop-color="#121826"/></linearGradient>' +
  '<pattern id="wbFins" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#5b6679"/><rect width="3" height="8" fill="#7c889c"/></pattern>' +
  '<pattern id="wbTrace" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M0 11 H22 M11 0 V22" stroke="#2f8a62" stroke-width="1" fill="none" opacity=".5"/><circle cx="11" cy="11" r="1.6" fill="#c9a24a" opacity=".6"/></pattern>' +
  '<radialGradient id="wbSpk" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#1a2131"/><stop offset="1" stop-color="#0b0f17"/></radialGradient>' +
  '</defs>';

function wbScrewSvg(s){
  var x = s.x, y = s.y;
  if (s.st === "verloren") return "";
  var cls = "wb-screw" + (s.st === "raus" ? " out" : "");
  var head = s.st === "raus"
    ? '<circle cx="' + x + '" cy="' + y + '" r="8" fill="#05080d" stroke="#2c3442"/>'
    : '<circle cx="' + x + '" cy="' + y + '" r="8" fill="#2a3344" stroke="' + (s.st === "lose" ? "#f6c343" : "#8a96a8") + '" stroke-width="1.5"/>' +
      (s.st === "drin" ? '<path d="M' + (x - 5) + ' ' + y + ' H' + (x + 5) + ' M' + x + ' ' + (y - 5) + ' V' + (y + 5) + '" stroke="#c4cdda" stroke-width="1.6" stroke-linecap="round"/>' :
        '<path d="M' + (x - 5) + ' ' + (y - 3) + ' L' + (x + 5) + ' ' + (y + 3) + '" stroke="#f6c343" stroke-width="1.6" stroke-linecap="round"/>');
  var tag = s.type === "torx" ? '<path d="M' + x + ' ' + (y - 2) + ' l2 2 -2 2 -2 -2z" fill="#0b0f16" opacity=".8"/>' : '';
  return '<g class="' + cls + '" data-wb-screw="' + s.id + '" role="button" tabindex="0" aria-label="Schraube ' + s.n + ' ' + s.type + ' ' + s.st + '">' +
    '<circle cx="' + x + '" cy="' + y + '" r="16" fill="transparent"/>' + head + tag + '</g>';
}
function wbZif(key, x, w, color){
  var st = WS.c[key];
  var cx = x + w / 2;
  var open = st === "entriegelt";
  var lever = '<rect x="' + x + '" y="' + (open ? 469 : 472) + '" width="' + w + '" height="' + (open ? 6 : 4) + '" rx="2" fill="' + (open ? "#f6c343" : "#56627a") + '"/>';
  var cable = st === "gelöst"
    ? '<path d="M' + (cx + 14) + ' 504 C' + (cx + 20) + ' 526 ' + (cx + 24) + ' 542 ' + (cx + 26) + ' 562" stroke="' + color + '" stroke-width="5" fill="none" stroke-dasharray="4 4" opacity=".8"/>'
    : '<path d="M' + cx + ' 488 C' + cx + ' 520 ' + (cx + 6) + ' 540 ' + (cx + 6) + ' 562" stroke="' + color + '" stroke-width="5" fill="none"/>';
  return '<g class="wb-hit-g" data-wb-part="' + key + '" role="button" tabindex="0" aria-label="' + esc(WB_CONN_NAME[key]) + ', ' + esc(wbConnText(key)) + '">' +
    '<rect x="' + (x - 6) + '" y="456" width="' + (w + 12) + '" height="48" fill="transparent"/>' +
    '<rect x="' + x + '" y="476" width="' + w + '" height="12" rx="2" fill="#0a0d12" stroke="#56627a"/>' + lever + cable +
    '<text x="' + cx + '" y="464" text-anchor="middle" class="wb-sub2">' + esc(WB_PARTS[key].short) + '</text></g>';
}
function wbBay(x, y, w, h, label){
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="none" stroke="#3a4558" stroke-dasharray="5 5"/>' +
    '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 4) + '" text-anchor="middle" class="wb-sub2">' + esc(label) + '</text>';
}
function wbInterior(){
  var s = WB_DEFS;
  s += '<rect x="20" y="20" width="860" height="560" rx="26" fill="url(#wbAlu)" stroke="#3b4658" stroke-width="2"/>';
  s += '<rect x="34" y="34" width="832" height="532" rx="18" fill="#0d121c"/>';
  // DC-Buchse am linken Gehäuserand
  s += '<rect x="36" y="330" width="22" height="30" rx="4" fill="#0a0d12" stroke="#56627a"/><circle cx="47" cy="345" r="6" fill="#1b2230" stroke="#8a96a8"/>';
  // Hauptplatine (innerhalb des Gehäuses: 400 bis 856)
  s += '<rect x="400" y="60" width="456" height="440" rx="10" fill="url(#wbPcb)" stroke="#0d3b2a"/>';
  s += '<rect x="400" y="60" width="456" height="440" rx="10" fill="url(#wbTrace)"/>';
  s += '<text x="412" y="84" class="wb-sub2" style="fill:#6ec59b">NordTek NT-M4 · Rev. C</text>';
  // Akku mit drei mittigen Zellen
  var akkuOn = WS.c.akku === "verbunden";
  if (WS.p.akku.st === "in") {
    s += '<rect x="48" y="60" width="320" height="250" rx="16" fill="url(#wbBatt)" stroke="#32425e" stroke-width="1.5"/>';
    [76,168,260].forEach(function(cx){ s += '<rect x="' + cx + '" y="78" width="80" height="214" rx="10" fill="#1d2739" stroke="#34446a"/>'; });
    s += '<text x="208" y="182" text-anchor="middle" class="wb-txt" style="fill:#9fb0c8;font-size:15px">56 Wh</text><text x="208" y="202" text-anchor="middle" class="wb-sub2">NT-56 · 11,4 V</text>';
    s += '<path d="M368 275 H404" stroke="' + (akkuOn ? "#c4cdda" : "#f6c343") + '" stroke-width="3"' + (akkuOn ? '' : ' stroke-dasharray="4 3"') + '/>';
  } else s += wbBay(48, 60, 320, 250, "Akku ausgebaut");
  // Akkustecker auf der Platine
  s += '<rect x="404" y="262" width="14" height="26" rx="2" fill="#0a0d12" stroke="' + (akkuOn ? "#3ecf8e" : "#f6c343") + '" stroke-width="2"/>';
  // Lautsprecher
  if (WS.p.speaker.st === "in") {
    s += '<circle cx="145" cy="425" r="54" fill="url(#wbSpk)" stroke="' + (WS.p.speaker.glue === "geklebt" ? "#4b5a72" : "#f6c343") + '" stroke-dasharray="' + (WS.p.speaker.glue === "geklebt" ? "0" : "6 4") + '"/>';
    s += '<circle cx="145" cy="425" r="36" fill="#0b0f17" stroke="#222c3d"/>';
    for (var g = 0; g < 16; g++) { var ang = g * Math.PI * 2 / 16; s += '<circle cx="' + (145 + 26 * Math.cos(ang)).toFixed(1) + '" cy="' + (425 + 26 * Math.sin(ang)).toFixed(1) + '" r="1.6" fill="#2d3950"/>'; }
  } else s += wbBay(91, 371, 108, 108, "Lautsprecher");
  // CPU, darüber der Kühlkörper (zentriert auf der CPU)
  var pc = WS.p.cpu.paste;
  s += '<rect x="606" y="145" width="70" height="60" rx="6" fill="#0a0d12" stroke="#505c6e"/>';
  s += '<rect x="616" y="155" width="50" height="40" rx="4" fill="' + (pc === "neu" ? "#dfe6ef" : pc === "leer" ? "#4a4e57" : "#7a6a3a") + '" opacity=".9"/>';
  s += '<text x="641" y="179" text-anchor="middle" class="wb-sub2" style="fill:#c8d2e2">CPU</text>';
  if (WS.p.kuehler.st === "in") {
    s += '<rect x="552" y="100" width="178" height="150" rx="8" fill="url(#wbFins)" stroke="#8a96a8" stroke-width="1.5"/>';
    s += '<path d="M566 140 H716 M566 210 H716" stroke="#c8875a" stroke-width="6" stroke-linecap="round" opacity=".85"/>';
  } else s += wbBay(552, 100, 178, 150, "Kühlkörper abgenommen");
  // Lüfter rechts neben dem Kühlkörper, auf der Platine
  if (WS.p.luefter.st === "in") {
    s += '<rect x="744" y="100" width="100" height="100" rx="12" fill="#161b24" stroke="#2e3a4d"/>';
    s += '<g class="wb-fan' + (WS.c.fan === "verbunden" ? ' wb-spin' : '') + '" style="transform-origin:794px 150px">';
    for (var bl = 0; bl < 7; bl++) s += '<path d="M794 150 L813 125 Q794 113 775 125 Z" fill="#2a3446" transform="rotate(' + (bl * 360 / 7).toFixed(1) + ' 794 150)"/>';
    s += '</g><circle cx="794" cy="150" r="10" fill="#0c1018" stroke="#3b4658"/>';
    s += '<rect x="748" y="208" width="12" height="10" rx="2" fill="#0a0d12" stroke="' + (WS.c.fan === "verbunden" ? "#3ecf8e" : "#f6c343") + '"/>';
  } else s += wbBay(744, 100, 100, 100, "Lüfter ausgebaut");
  // Arbeitsspeicher
  ["ram1","ram2"].forEach(function(k, i){
    var y = i === 0 ? 330 : 378;
    if (WS.p[k].st === "in") {
      s += '<rect x="430" y="' + y + '" width="190" height="34" rx="4" fill="#123d28" stroke="#1d6b44"/>';
      for (var c = 0; c < 8; c++) s += '<rect x="' + (439 + c * 22) + '" y="' + (y + 8) + '" width="16" height="18" rx="2" fill="#0b0f14"/>';
      var cc = WS.p[k].clips === "offen" ? "#f6c343" : "#8fa0b8";
      s += '<rect x="422" y="' + (y - 2) + '" width="8" height="38" rx="3" fill="' + cc + '"/><rect x="620" y="' + (y - 2) + '" width="8" height="38" rx="3" fill="' + cc + '"/>';
    } else s += wbBay(430, y, 190, 34, "RAM " + (i === 0 ? "A" : "B") + " ausgebaut");
  });
  // SSD
  if (WS.p.ssd.st === "in") {
    s += '<rect x="640" y="330" width="130" height="26" rx="3" fill="#2b3a2e" stroke="#4c6b52"/><rect x="650" y="334" width="70" height="18" rx="2" fill="#d9e3c9"/><text x="685" y="347" text-anchor="middle" style="font-size:10px;fill:#2b3a2e;font-weight:700">512 GB</text>';
  } else s += wbBay(640, 330, 130, 26, "SSD");
  // WLAN-Modul mit Antennen zum rechten Rand
  if (WS.p.wlan.st === "in") {
    var a1 = WS.c.ant1 === "verbunden", a2 = WS.c.ant2 === "verbunden";
    var ant = function(on, d){ return '<path d="' + d + '" stroke="' + (on ? "#9fb0c8" : "#f6c343") + '" stroke-width="2.5" fill="none"' + (on ? '' : ' stroke-dasharray="5 4"') + '/>'; };
    s += ant(a1, "M657 428 C657 404 688 395 728 395 H850") + ant(a2, "M679 428 C679 410 702 405 728 405 H850");
    var wc = WS.wlanNew ? ["#1d4f3a", "#2f7a57"] : ["#4a2a2a", "#b44a4a"];
    s += '<rect x="640" y="420" width="100" height="50" rx="6" fill="' + wc[0] + '" stroke="' + wc[1] + '"/>';
    s += '<rect x="652" y="428" width="10" height="10" rx="2" fill="' + (a1 ? "#3ecf8e" : "#f6c343") + '"/><rect x="674" y="428" width="10" height="10" rx="2" fill="' + (a2 ? "#3ecf8e" : "#f6c343") + '"/>';
    s += '<rect x="692" y="434" width="24" height="26" rx="2" fill="#0c0f12"/>';
  } else s += wbBay(640, 420, 100, 50, "WLAN leer");
  // Flachbandstecker auf der Platine, Kabel zum Gehäuserand
  s += wbZif("tast", 452, 44, "#c9b458") + wbZif("touch", 528, 34, "#7aa2ff") + wbZif("disp", 780, 44, "#e46ad3");
  // Schrauben
  WS.screws.filter(function(x){ return x.comp !== "cover"; }).forEach(function(x){ s += wbScrewSvg(x); });
  // Trefferflächen
  WB_ORDER.forEach(function(k){
    var pt = WB_PARTS[k];
    if (!pt || k === "tast" || k === "touch" || k === "disp") return;
    var sel = WS.sel === k ? ' stroke="#3b82f6" stroke-width="3"' : '';
    s += '<rect class="wb-hit" data-wb-part="' + k + '" x="' + pt.x + '" y="' + pt.y + '" width="' + pt.w + '" height="' + pt.h + '" rx="8" fill="transparent" role="button" tabindex="0" aria-label="' + esc(pt.name) + '"' + sel + '/>';
  });
  return s;
}
function wbCoverView(){
  var s = '<rect x="20" y="20" width="860" height="560" rx="26" fill="url(#wbAlu)" stroke="#3b4658" stroke-width="2"/>' +
    '<rect x="34" y="34" width="832" height="532" rx="18" fill="url(#wbCoverP)" stroke="#2a3446"/>' +
    '<text x="450" y="300" text-anchor="middle" class="wb-title">Bodenplatte</text>' +
    '<text x="450" y="326" text-anchor="middle" class="wb-sub">Zehn Schrauben: 6× PH0 (klein), 4× Torx T5</text>' +
    '<text x="450" y="348" text-anchor="middle" class="wb-sub">Schrauben in die Schale legen, sonst gehen sie verloren.</text>';
  WS.screws.filter(function(x){ return x.comp === "cover"; }).forEach(function(x){ s += wbScrewSvg(x); });
  return s;
}
function renderWbSvg(){
  var body = WS.cover ? wbInterior() : wbCoverView();
  $("#wbSvg").innerHTML = '<svg viewBox="0 0 900 600" role="img" aria-label="' + (WS.cover ? 'Laptop geöffnet, Innenleben' : 'Laptop, Bodenplatte geschlossen') + '">' + body + '</svg>';
}

/* Bauteil-Detail */
function renderWbDetail(){
  var k = WS.sel;
  var list = '<div class="wb-list">' + WB_ORDER.filter(function(x){ return WB_PARTS[x]; }).map(function(x){
    var on = WS.sel === x;
    return '<button type="button" class="wb-li' + (on ? ' on' : '') + '" data-wb-part="' + x + '"><span>' + esc(WB_PARTS[x].short) + '</span><span class="sub">' + esc(wbText(x)) + '</span></button>';
  }).join("") + '</div>';
  if (!k) { $("#wbDetail").innerHTML = '<p class="hint" style="margin-bottom:12px">Wähle ein Bauteil aus der Liste oder im Bild.</p>' + list; return; }
  var pt = WB_PARTS[k];
  var acts = WS.cover ? wbActions(k) : [];
  var btns = acts.map(function(a){
    var tool = a[2] && a[2] !== 'multi' ? ' <span class="wb-tool">' + esc(WB_TOOLS[a[2]] || a[2]) + '</span>' : '';
    return '<button type="button" class="btn btn-s btn-sm wb-act" data-wb-act="' + esc(a[3]) + '|' + a[0] + '">' + esc(a[1]) + tool + '</button>';
  }).join("");
  var scr = wbScrews(k).map(function(s){
    var label = s.st === "drin" ? "Schraube " + s.n + " lösen" : s.st === "lose" ? "Schraube " + s.n + " herausnehmen" : s.st === "raus" ? "Schraube " + s.n + " festdrehen" : "verloren";
    var st = s.st === "drin" ? "fest" : s.st === "lose" ? "gelockert" : s.st === "raus" ? "in der Schale" : "verloren";
    return '<div class="wb-scr-row"><span>' + esc(label) + '</span><span class="sub">' + esc(s.type === "torx" ? "Torx T5" : "PH0") + ' · ' + st + '</span></div>';
  }).join("");
  var spec = '<dl class="kv" style="margin:12px 0">' + pt.spec.map(function(r){ return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join("") + '</dl>';
  var read = WS.read[k] ? '<div class="note info" style="margin-bottom:12px">Letzte Messung: ' + esc(WS.read[k]) + '</div>' : '';
  $("#wbDetail").innerHTML =
    '<div class="eyebrow">Bauteil</div><h3 style="font-size:18px;margin:6px 0 6px">' + esc(pt.name) + '</h3>' +
    '<span class="wb-state">' + esc(wbText(k)) + '</span>' +
    '<p class="muted" style="margin:12px 0 0;font-size:14px">' + esc(pt.desc) + '</p>' + spec + read +
    (scr ? '<div class="wb-sec"><div class="lbl" style="margin-bottom:6px">Schrauben</div>' + scr + '</div>' : '') +
    '<div class="wb-sec"><div class="lbl" style="margin-bottom:8px">Mögliche Schritte</div>' +
    (WS.cover ? (btns || '<span class="hint">Im Moment gibt es für dieses Bauteil nichts zu tun.</span>') : '<div class="note info">Erst die Bodenplatte abnehmen. Messen geht jederzeit.</div>' + (k === "akku" || k === "ladung" || k === "luefter" ? '<div style="margin-top:10px"><button type="button" class="btn btn-s btn-sm wb-act" data-wb-act="' + k + '|messen">Messen</button></div>' : '')) +
    '</div>' +
    '<div class="wb-sec"><div class="lbl" style="margin-bottom:6px">Alle Bauteile</div>' + list + '</div>';
}
function renderWbSteps(){
  $("#wbSteps").innerHTML = wbSteps().map(function(x, i){
    return '<div class="wb-step-row"><span class="wb-num ' + (x[1] ? "ok" : "") + '">' + (x[1] ? "✓" : i + 1) + '</span><span style="flex:1">' + esc(x[0]) + '</span><span class="sub">' + (x[1] ? "erledigt" : "offen") + '</span></div>';
  }).join("");
}
function renderWbResult(){
  if (WS.tested === null) { $("#wbResult").innerHTML = '<p class="hint">Noch nicht getestet. Bodenplatte schließen, dann Test starten.</p>'; return; }
  var head = WS.tested === "ok" ? '<div class="note ok">Alle 13 Prüfungen bestanden. Der Kunde bekommt das Gerät zurück.</div>'
    : WS.tested === "board" ? '<div class="note bad">Mainboard beschädigt. Reparaturangebot: Mainboard extern tauschen lassen.</div>'
    : '<div class="note warn">Nicht bestanden. Die Liste zeigt, wo es hängt.</div>';
  var t = WS.temps ? '<div class="wb-temps"><div><span class="sub">CPU unter Last</span><strong class="num">' + WS.temps.cpu + ' °C</strong></div><div><span class="sub">Lüfter</span><strong class="num">' + esc(WS.temps.fan) + '</strong></div></div>' : '';
  $("#wbResult").innerHTML = head + t + '<div class="wb-checks">' + WS.checks.map(function(c){
    return '<div class="wb-check"><span class="tag ' + (c.ok ? "t-ok" : "t-bad") + '">' + (c.ok ? "OK" : "Fehler") + '</span><span style="flex:1;font-weight:600">' + esc(c.name) + '</span><span class="sub">' + esc(c.note) + '</span></div>';
  }).join("") + '</div>';
}
function renderWbLog(){
  $("#wbLog").innerHTML = WS.log.slice(0, 18).map(function(l){ return '<div>' + esc(l) + '</div>'; }).join("") || '<div>Noch keine Schritte.</div>';
}
function renderWorkshop(){
  var h = Math.floor(WS.min / 60), m = WS.min % 60;
  $("#wbTime").textContent = (h ? h + " h " : "") + m + " min";
  $("#wbQuality").textContent = WS.quality + " %";
  $("#wbStock").textContent = WS.stock + " Module";
  $("#wbPaste").textContent = WS.paste + " Tube";
  $$("#wbTools [data-wb-tool]").forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-wb-tool") === WS.tool ? "true" : "false"); });
  var esd = $("#wbEsd");
  esd.setAttribute("aria-pressed", WS.esd ? "true" : "false");
  esd.textContent = WS.esd ? "Armband angelegt" : "Antistatik-Armband anlegen";
  var tray = $("#wbTray");
  tray.setAttribute("aria-pressed", WS.tray ? "true" : "false");
  tray.textContent = WS.tray ? "Schraubenschale: an" : "Schraubenschale: aus (Schrauben gehen verloren)";
  $("#wbCover").textContent = WS.cover ? "Bodenplatte schließen" : "Bodenplatte abnehmen";
  renderWbSvg(); renderWbDetail(); renderWbSteps(); renderWbResult(); renderWbLog();
}

/* Klicks auf der Werkbank */
(function(){
  var sec = $('[data-screen="werkstatt"]');
  if (!sec) return;
  sec.addEventListener("click", function(e){
    var t = e.target, x;
    if ((x = t.closest("[data-wb-screw]"))) { wbScrewAct(x.getAttribute("data-wb-screw")); renderWorkshop(); return; }
    if ((x = t.closest("[data-wb-act]"))) { var pr = x.getAttribute("data-wb-act").split("|"); var ad = WS.sel ? wbActions(WS.sel).filter(function(q){ return q[0] === pr[1]; })[0] : null; if (ad && ad[2] && ad[2] !== "multi" && WS.tool !== ad[2]) { toast("Dafür brauchst du den Werkzeug: " + (WB_TOOLS[ad[2]] || ad[2]) + ". Oben im Werkzeugfeld auswählen."); return; } wbAct(pr[0], pr[1]); renderWorkshop(); return; }
    if ((x = t.closest("[data-wb-part]"))) { WS.sel = x.getAttribute("data-wb-part"); renderWorkshop(); return; }
    if ((x = t.closest("[data-wb-tool]"))) { WS.tool = x.getAttribute("data-wb-tool"); renderWorkshop(); return; }
    if (t.closest("#wbTray")) { WS.tray = !WS.tray; renderWorkshop(); return; }
    if (t.closest("#wbEsd")) {
      if (!WS.esd && pcInv.esd < 1) { toast("Das Armband fehlt. Kaufe es im Shop am Arbeitsplatz."); return; }
      WS.esd = !WS.esd; wbTick(1); wbLog(WS.esd ? "Antistatik-Armband angelegt." : "Antistatik-Armband abgelegt."); renderWorkshop(); return;
    }
    if (t.closest("#wbCover")) { wbCover(); renderWorkshop(); return; }
    if (t.closest("#wbTest")) { wbTest(); renderWorkshop(); return; }
    if (t.closest("#wbReset")) { confirmModal("Werkbank neu beginnen?", "Der Laptop wird wieder in den Ausgangszustand versetzt. Das Protokoll geht verloren.", "Neu beginnen", "btn-d", function(){ wbReset(); renderWorkshop(); }); return; }
  });
  sec.addEventListener("keydown", function(e){
    if (e.key !== "Enter" && e.key !== " ") return;
    var el = e.target.closest && e.target.closest("[data-wb-part],[data-wb-screw]");
    if (el) { e.preventDefault(); el.dispatchEvent(new MouseEvent("click", { bubbles:true })); }
  });
})();



/* ---------- Arbeitsrechner ---------- */
var PC_APPS = [
  { id:"shop",    name:"Shop",         g:"€" },
  { id:"mail",    name:"Mails",        g:"@" },
  { id:"chat",    name:"Nachrichten",  g:"…" },
  { id:"bench",   name:"Benchmark",    g:"%" },
  { id:"browser", name:"Browser",      g:"⌕" },
  { id:"kal",     name:"Kalender",     g:"▦" },
  { id:"files",   name:"Dateien",      g:"▤" },
  { id:"notes",   name:"Notizen",      g:"✎" },
  { id:"pw",      name:"Passwörter",   g:"●" },
  { id:"mon",     name:"Monitoring",   g:"⌁" }
];
var SHOP = [
  { id:"ram",     name:"RAM 16 GB DDR5",           cat:"Hardware", price:140, desc:"Ersatz bei Speicherfehlern" },
  { id:"ssd",     name:"SSD 1 TB",                 cat:"Hardware", price:95,  desc:"Ersatz bei defekter Festplatte" },
  { id:"wlan",    name:"WLAN/Bluetooth-Modul",     cat:"Hardware", price:60,  desc:"Ersatz für Funkmodule (kommt ins Werkstatt-Lager)" },
  { id:"monitor", name:"Monitor 27 Zoll",          cat:"Hardware", price:210, desc:"Für Büroarbeitsplätze" },
  { id:"esd",     name:"Antistatik-Armband",       cat:"Werkzeug", price:25,  desc:"Nötig, bevor du in der Werkstatt Geräte öffnest" },
  { id:"set",     name:"Schraubendreher-Set",      cat:"Werkzeug", price:35,  desc:"Kreuzschlitz, Torx und Pinzette" },
  { id:"lic",     name:"Office-Lizenz (1 Jahr)",   cat:"Software", price:120, desc:"Für einen Arbeitsplatz" },
  { id:"av",      name:"Antivirus-Lizenz (1 Jahr)", cat:"Software", price:80, desc:"Schutz für einen Arbeitsplatz" }
];
var pcInv = { ram:0, ssd:0, wlan:0, monitor:0, esd:0, set:0, lic:0, av:0 };
var PC_CHAT = {
  "Team": [
    { who:"Mira Stein", t:"09:12", text:"Krumm hat schon wieder angerufen. Der Drucker." },
    { who:"Ole Brandt", t:"09:20", text:"Ich fahre um 11 Uhr hin." },
    { who:"Jonas Keller", t:"09:41", text:"Das Lager hat einen Router-Ausfall. Ich schaue nach dem Mittag." }
  ],
  "Lager": [
    { who:"Tobias Lang", t:"08:55", text:"Wann kommen die Scanner wieder?" }
  ]
};
var PC_CALENDAR = [
  { t:"Heute, 10:00", what:"Kundentermin Krumm: Drucker-Check vor Ort" },
  { t:"Heute, 14:00", what:"Mitarbeitergespräch: Mira Stein" },
  { t:"Morgen, 08:30", what:"Change-Fenster: Router-Firmware" },
  { t:"Freitag", what:"Lieferung WLAN-Module (bestellt)" }
];
var PC_FILES = {
  "Verträge": ["Support-Vertrag Krumm.pdf", "Support-Vertrag Weidner.pdf", "Vertrag Steuerbüro Hahn.pdf"],
  "Rechnungen 2026": ["R-2035 Steuerbüro Hahn.pdf", "R-2038 Logistik Weidner.pdf", "R-2041 Bäckerei Krumm.pdf"],
  "Anleitungen": ["Drucker-Treiber installieren.pdf", "WLAN-Firmware sicher aktualisieren.pdf", "Passwort zurücksetzen (Vorlage).pdf"]
};
var PC_PASSWORDS = [
  { name:"Router Lager", user:"admin", pw:"Lager-2026!" },
  { name:"Kunde Krumm (Drucker)", user:"krumm.d", pw:"Druck#4411" },
  { name:"Cloud-Admin", user:"derrik", pw:"Wolke-Schluessel-9" }
];
var pcState = { app:null, mail:null, chat:"Team", bench:null, benchRunning:false, files:null, pwShow:{}, notes: null };
var PC_SUPPLIERS = [
  { name:"Hardware-Schmiede", days:2, price:"ab 60 €" },
  { name:"Teile-Direkt", days:4, price:"ab 55 €" },
  { name:"Office-Lizenzhaus", days:1, price:"ab 80 €" }
];

function pcStore(k, d){ try { var v = localStorage.getItem("craftit-" + k); return v === null ? d : JSON.parse(v); } catch(e){ return d; } }
function pcSave(k, v){ try { localStorage.setItem("craftit-" + k, JSON.stringify(v)); } catch(e){} }
pcState.notes = pcStore("notes", "");

/* ---------- WinSec-OS Desktop ---------- */
var WSD = { wins: [], z: 10, active: null, wall: 0 };
var WSD_WALLS = [
  "radial-gradient(1200px 700px at 15% 10%, #1D4ED8 0%, rgba(29,78,216,0) 60%), linear-gradient(160deg, #0F2544 0%, #0A1322 70%, #070C18 100%)",
  "radial-gradient(1000px 600px at 85% 15%, #7C3AED 0%, rgba(124,58,237,0) 60%), linear-gradient(200deg, #1B2238 0%, #0C1224 60%, #090E1C 100%)",
  "radial-gradient(900px 600px at 30% 90%, #0891B2 0%, rgba(8,145,178,0) 60%), linear-gradient(160deg, #0D2A35 0%, #081A24 70%, #061219 100%)"
];
var WSD_STARTMENU = [];

function wsdDesk(){ return $("#wsdDesk"); }
function wsdClock(){
  var hh = String(Math.floor(minutes / 60)).padStart(2, "0"), mm = String(minutes % 60).padStart(2, "0");
  return "Tag " + day + " · " + hh + ":" + mm;
}
function wsdTrayTick(){ var el = $("#wsdTray"); if (el) el.textContent = wsdClock(); }

function renderPcIcons(){
  $("#pcIcons").innerHTML = PC_APPS.map(function(a){
    var n = a.id === "mail" ? PC_MAILS.filter(function(m){ return !m.read; }).length : 0;
    return '<button type="button" class="wsd-icon" data-desk-app="' + a.id + '" aria-label="' + esc(a.name) + '">' +
      '<span class="wsd-icon-g" aria-hidden="true">' + a.g + '</span><span class="wsd-icon-t">' + esc(a.name) + '</span>' +
      (n ? '<span class="wsd-badge" aria-label="' + n + ' ungelesen">' + n + '</span>' : '') + '</button>';
  }).join("");
  $("#pcBal").textContent = "Kasse " + eur(cash);
  $("#wsdStartList").innerHTML = PC_APPS.map(function(a){
    return '<button type="button" class="wsd-st-item" data-start-app="' + a.id + '"><span class="wsd-icon-g" aria-hidden="true">' + a.g + '</span>' + esc(a.name) + '</button>';
  }).join("");
  wsdTrayTick();
}
function pcTitle(id){ var a = PC_APPS.filter(function(x){ return x.id === id; })[0]; return a ? a.name : ""; }
function pcOpen(id){ wsdOpen(id); }
function pcClose(){ }
function renderPcWin(){
  WSD.wins.forEach(function(w){
    var el = wsdFrame(w);
    if (el) el.querySelector(".wsd-wb").innerHTML = pcBody(w.app);
  });
}

function wsdFrame(w){ return document.querySelector('.wsd-win[data-win="' + w.app + '"]'); }
function wsdPlace(w, el){
  var desk = wsdDesk();
  if (w.max) {
    el.style.left = "0px"; el.style.top = "0px";
    el.style.width = desk.clientWidth + "px"; el.style.height = desk.clientHeight + "px";
  } else {
    el.style.left = w.x + "px"; el.style.top = w.y + "px";
    el.style.width = w.w + "px"; el.style.height = w.h + "px";
  }
  el.style.zIndex = w.z;
  el.hidden = !!w.min;
}
function wsdFocus(w){
  WSD.active = w.app;
  w.z = ++WSD.z;
  WSD.wins.forEach(function(x){
    var el = wsdFrame(x);
    if (!el) return;
    el.style.zIndex = x.z;
    el.classList.toggle("active", x.app === w.app);
  });
  wsdTasks();
}
function wsdTasks(){
  $("#wsdTasks").innerHTML = WSD.wins.map(function(w){
    var a = PC_APPS.filter(function(x){ return x.id === w.app; })[0];
    return '<button type="button" class="wsd-task-btn' + (WSD.active === w.app && !w.min ? ' on' : '') + (w.min ? ' min' : '') + '" data-task="' + w.app + '" aria-label="' + esc(a.name) + '">' +
      '<span class="wsd-icon-g" aria-hidden="true">' + a.g + '</span><span class="wsd-task-t">' + esc(a.name) + '</span></button>';
  }).join("");
}
function wsdOpen(id){
  var w = WSD.wins.filter(function(x){ return x.app === id; })[0];
  if (w) {
    w.min = false;
    var el0 = wsdFrame(w);
    if (el0) wsdPlace(w, el0);
    wsdFocus(w);
    return;
  }
  var desk = wsdDesk();
  var dw = desk.clientWidth || 1000, dh = desk.clientHeight || 600;
  var n = WSD.wins.length % 6;
  w = { app:id, x: 24 + n * 28, y: 18 + n * 24, w: Math.min(960, Math.max(360, dw - 80)), h: Math.min(600, Math.max(260, dh - 80)), z: ++WSD.z, min:false, max:false };
  if (dw < 700) { w.max = true; }
  WSD.wins.push(w);
  var a = PC_APPS.filter(function(x){ return x.id === id; })[0];
  var el = document.createElement("div");
  el.className = "wsd-win";
  el.setAttribute("data-win", id);
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", a.name);
  el.innerHTML = '<div class="wsd-wt"><span class="wsd-ico" aria-hidden="true">' + a.g + '</span><span class="wsd-title">' + esc(a.name) + '</span>' +
    '<span class="wsd-btns"><button type="button" class="wsd-b" data-wmin aria-label="Minimieren">–</button><button type="button" class="wsd-b" data-wmax aria-label="Maximieren">□</button><button type="button" class="wsd-b wsd-x" data-wclose aria-label="Schließen">✕</button></span></div>' +
    '<div class="wsd-wb' + (id === "mail" || id === "kal" ? ' flush' : '') + '">' + pcBody(id) + '</div><div class="wsd-grip" data-wgrip aria-hidden="true"></div>';
  $("#wsdWins").appendChild(el);
  wsdPlace(w, el);
  wsdFocus(w);
  $("#wsdEmpty").hidden = true;
}
function wsdClose(id){
  WSD.wins = WSD.wins.filter(function(x){ return x.app !== id; });
  var el = document.querySelector('.wsd-win[data-win="' + id + '"]');
  if (el) el.remove();
  if (WSD.active === id) WSD.active = null;
  $("#wsdEmpty").hidden = WSD.wins.length > 0;
  wsdTasks();
}
function wsdMinimize(w){
  w.min = true;
  var el = wsdFrame(w); if (el) el.hidden = true;
  if (WSD.active === w.app) WSD.active = null;
  wsdTasks();
}
function wsdRestore(w){
  w.min = false;
  var el = wsdFrame(w); if (el) { wsdPlace(w, el); }
  wsdFocus(w);
}
function wsdMaxToggle(w){
  var el = wsdFrame(w);
  if (w.max) { w.max = false; } else { w.max = true; }
  if (el) wsdPlace(w, el);
  wsdFocus(w);
}
function wsdWinOf(app){ return WSD.wins.filter(function(x){ return x.app === app; })[0]; }
function wsdCascade(){
  WSD.wins.forEach(function(w, i){
    w.max = false; w.min = false;
    w.x = 24 + (i % 6) * 28; w.y = 18 + (i % 6) * 24;
    var el = wsdFrame(w); if (el) wsdPlace(w, el);
  });
  if (WSD.wins.length) wsdFocus(WSD.wins[WSD.wins.length - 1]);
}
function wsdHideMenus(){
  $("#wsdStart").hidden = true;
  $("#wsdStartBtn").setAttribute("aria-expanded", "false");
  $("#wsdCtx").hidden = true;
}

/* Interaktion: Fenster ziehen, skalieren, Taskleiste, Startmenü, Kontextmenü */
(function(){
  var desk = $("#wsdDesk");
  if (!desk) return;
  var drag = null;

  desk.addEventListener("pointerdown", function(e){
    if (e.button !== 0) return;
    var winEl = e.target.closest(".wsd-win");
    if (!winEl) return;
    var app = winEl.getAttribute("data-win");
    var w = wsdWinOf(app);
    if (!w) return;
    if (!e.target.closest("button")) wsdFocus(w);
    if (e.target.closest("[data-wmin]")) { wsdMinimize(w); return; }
    if (e.target.closest("[data-wmax]")) { wsdMaxToggle(w); return; }
    if (e.target.closest("[data-wclose]")) { wsdClose(app); return; }
    if (e.target.closest("[data-wgrip]") && !w.max) {
      drag = { kind:"resize", w:w, el:winEl, sx:e.clientX, sy:e.clientY, ow:w.w, oh:w.h };
      e.preventDefault(); return;
    }
    if (e.target.closest(".wsd-wt") && !e.target.closest("button")) {
      if (w.max) return;
      drag = { kind:"move", w:w, el:winEl, sx:e.clientX, sy:e.clientY, ox:w.x, oy:w.y };
      e.preventDefault();
    }
  });
  document.addEventListener("pointermove", function(e){
    if (!drag) return;
    var dw = desk.clientWidth, dh = desk.clientHeight;
    if (drag.kind === "move") {
      drag.w.x = Math.min(Math.max(0, drag.ox + e.clientX - drag.sx), Math.max(0, dw - 120));
      drag.w.y = Math.min(Math.max(0, drag.oy + e.clientY - drag.sy), Math.max(0, dh - 44));
    } else {
      drag.w.w = Math.min(Math.max(320, drag.ow + e.clientX - drag.sx), Math.max(320, dw - drag.w.x));
      drag.w.h = Math.min(Math.max(200, drag.oh + e.clientY - drag.sy), Math.max(200, dh - drag.w.y));
    }
    wsdPlace(drag.w, drag.el);
  });
  document.addEventListener("pointerup", function(){ drag = null; });

  desk.addEventListener("dblclick", function(e){
    var ic = e.target.closest("[data-desk-app]");
    if (ic) wsdOpen(ic.getAttribute("data-desk-app"));
  });
  desk.addEventListener("keydown", function(e){
    if (e.key !== "Enter") return;
    var ic = e.target.closest && e.target.closest("[data-desk-app]");
    if (ic) wsdOpen(ic.getAttribute("data-desk-app"));
  });
  desk.addEventListener("click", function(e){
    var ic = e.target.closest("[data-desk-app]");
    if (ic) {
      $$("#wsdDesk [data-desk-app]").forEach(function(x){ x.classList.toggle("sel", x === ic); });
    }
  });

  desk.addEventListener("contextmenu", function(e){
    if (e.target.closest(".wsd-win, .wsd-task, .wsd-startmenu, .wsd-ctx")) return;
    e.preventDefault();
    var r = desk.getBoundingClientRect();
    var m = $("#wsdCtx");
    m.hidden = false;
    m.style.left = Math.min(e.clientX - r.left, r.width - 220) + "px";
    m.style.top = Math.min(e.clientY - r.top, r.height - 140) + "px";
  });
  $("#wsdCtx").addEventListener("click", function(e){
    var b = e.target.closest("[data-ctx]");
    if (!b) return;
    var k = b.getAttribute("data-ctx");
    $("#wsdCtx").hidden = true;
    if (k === "wall") {
      WSD.wall = (WSD.wall + 1) % WSD_WALLS.length;
      desk.style.background = WSD_WALLS[WSD.wall];
      toast("Hintergrund gewechselt.");
    }
    if (k === "min") WSD.wins.forEach(function(w){ if (!w.min) wsdMinimize(w); });
    if (k === "cascade") wsdCascade();
  });

  var tasks = $("#wsdTasks");
  tasks.addEventListener("click", function(e){
    var b = e.target.closest("[data-task]");
    if (!b) return;
    var w = wsdWinOf(b.getAttribute("data-task"));
    if (!w) return;
    if (w.min) { wsdRestore(w); return; }
    if (WSD.active === w.app) { wsdMinimize(w); return; }
    wsdFocus(w);
  });

  var startBtn = $("#wsdStartBtn");
  startBtn.addEventListener("click", function(e){
    e.stopPropagation();
    var open = $("#wsdStart").hidden;
    wsdHideMenus();
    if (open) { $("#wsdStart").hidden = false; startBtn.setAttribute("aria-expanded", "true"); }
  });
  $("#wsdStart").addEventListener("click", function(e){
    e.stopPropagation();
    var a = e.target.closest("[data-start-app]");
    if (a) { wsdHideMenus(); wsdOpen(a.getAttribute("data-start-app")); return; }
    if (e.target.closest("[data-start-go]")) { wsdHideMenus(); location.hash = e.target.closest("[data-start-go]").getAttribute("data-start-go"); return; }
    if (e.target.closest("[data-start-off]")) {
      wsdHideMenus();
      confirmModal("Alle Fenster schließen?", "Der Arbeitsrechner fährt herunter. Offene Apps werden geschlossen. Entwürfe in den Notizen bleiben erhalten.", "Herunterfahren", "btn-d", function(){
        WSD.wins.slice().forEach(function(w){ wsdClose(w.app); });
        toast("Arbeitsrechner heruntergefahren.");
      });
    }
  });
  document.addEventListener("click", function(e){
    if (!e.target.closest("#wsdStart, #wsdStartBtn, #wsdCtx")) wsdHideMenus();
  });

  setInterval(wsdTrayTick, 4000);
})();

$("#wsdDesk").style.background = WSD_WALLS[0];

function pcBody(id){
  if (id === "shop") {
    var cats = ["Hardware", "Werkzeug", "Software"];
    return '<p class="hint" style="margin-bottom:14px">Dein Lager: ' + Object.keys(pcInv).filter(function(k){ return pcInv[k] > 0; }).map(function(k){ var it = SHOP.filter(function(s){ return s.id === k; })[0]; return (it ? it.name : k) + " ×" + pcInv[k]; }).join(", ") + (Object.keys(pcInv).some(function(k){ return pcInv[k] > 0; }) ? "" : "nichts") + '.</p>' +
      cats.map(function(c){
        return '<h3 style="margin:16px 0 8px">' + c + '</h3><div class="grid g2e" style="gap:12px">' + SHOP.filter(function(s){ return s.cat === c; }).map(function(s){
          return '<div class="card" style="padding:16px;display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:space-between;gap:8px"><span style="font-weight:700">' + esc(s.name) + '</span><span class="num" style="font-weight:700">' + eur(s.price) + '</span></div><div class="hint">' + esc(s.desc) + '</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto"><span class="tag t-mut">Im Lager: ' + pcInv[s.id] + '</span><button class="btn btn-sm" type="button" data-pc-buy="' + s.id + '">Kaufen</button></div></div>';
        }).join("") + '</div>';
      }).join("");
  }
  if (id === "mail") return pcMailBody();
  if (id === "chat") {
    var ch = pcState.chat;
    var msgs = (PC_CHAT[ch] || []).map(function(x){
      return '<div class="li" style="padding:10px 0;align-items:flex-start"><span class="tag t-mut">' + esc(x.t) + '</span><div style="flex:1;min-width:200px"><div style="font-weight:650;font-size:14px">' + esc(x.who) + '</div><div>' + esc(x.text) + '</div></div></div>';
    }).join("");
    return '<div class="grid" style="grid-template-columns:200px minmax(0,1fr);gap:20px;align-items:start">' +
      '<div class="list"><button type="button" class="btn ' + (ch === "Team" ? '' : 'btn-s') + ' btn-sm" data-pc-chan="Team" style="justify-content:flex-start;margin-bottom:6px">Team</button><button type="button" class="btn ' + (ch === "Lager" ? '' : 'btn-s') + ' btn-sm" data-pc-chan="Lager" style="justify-content:flex-start">Lager</button></div>' +
      '<div><div class="list">' + msgs + '</div><form id="pcChatForm" class="acts" style="margin-top:14px"><input class="inp" id="pcChatIn" placeholder="Nachricht an ' + esc(ch) + '" aria-label="Nachricht schreiben"><button class="btn btn-sm" type="submit">Senden</button></form></div></div>';
  }
  if (id === "bench") {
    var r = pcState.bench;
    var res = r ? '<div class="list" style="gap:10px;margin-top:16px">' +
      [["Prozessor", r.cpu, "Büroarbeit, Kundenportal"], ["Arbeitsspeicher", r.ram, "Mehrere Programme gleichzeitig"], ["Festplatte", r.disk, "Schnelle Starts und Backups"]].map(function(x){
        return '<div><div style="display:flex;justify-content:space-between;font-weight:650"><span>' + x[0] + '</span><span class="num">' + x[1] + ' Punkte</span></div><div class="bar" style="margin-top:6px"><i style="width:' + Math.min(100, x[1] / 30) + '%"></i></div><div class="hint" style="margin-top:4px">' + x[2] + '</div></div>';
      }).join("") + '</div><div class="note ok" style="margin-top:16px">Gesamturteil: gut für Büroarbeit. Für Grafik oder Spiele nicht geeignet.</div>' : '<p class="hint" style="margin-top:12px">Noch kein Test gelaufen.</p>';
    return '<p class="muted">Der Benchmark prüft Prozessor, Arbeitsspeicher und Festplatte. Nutze ihn, um Geräte aus Tickets einzuschätzen.</p>' +
      '<div class="acts" style="margin-top:14px"><button class="btn" type="button" data-pc-bench="run" ' + (pcState.benchRunning ? 'disabled' : '') + '>' + (pcState.benchRunning ? 'Test läuft …' : 'Test starten') + '</button></div>' + res;
  }
  if (id === "browser") {
    return '<div class="field" style="margin-bottom:14px"><label for="pcSearch">Lieferanten durchsuchen</label><input class="inp" id="pcSearch" placeholder="z. B. WLAN-Modul, SSD, Lizenz" aria-describedby="pcSearchHint"><div class="hint" id="pcSearchHint">Die Suche zeigt Lieferanten mit Preis und Lieferzeit.</div></div>' +
      '<div class="tw"><table><thead><tr><th>Lieferant</th><th>Lieferzeit</th><th>Preis</th><th><span class="sr">Aktion</span></th></tr></thead><tbody id="pcSupp">' + pcSuppRows("") + '</tbody></table></div>';
  }
  if (id === "kal") return pcCalBody();
  if (id === "files") {
    var folders = Object.keys(PC_FILES);
    var cur = pcState.files;
    return '<div class="grid" style="grid-template-columns:200px minmax(0,1fr);gap:20px;align-items:start"><div class="list">' + folders.map(function(f){ return '<button type="button" class="btn ' + (cur === f ? '' : 'btn-s') + ' btn-sm" data-pc-folder="' + esc(f) + '" style="justify-content:flex-start;margin-bottom:6px">' + esc(f) + '</button>'; }).join("") + '</div>' +
      '<div class="list">' + (cur ? PC_FILES[cur].map(function(x){ return '<div class="li" style="padding:10px 0"><span>' + esc(x) + '</span><span class="tag t-mut">PDF</span></div>'; }).join("") : '<p class="hint">Ordner wählen.</p>') + '</div></div>';
  }
  if (id === "notes") {
    return '<label for="pcNotes" class="lbl">Notizen für dich (bleiben in diesem Browser)</label><textarea class="inp" id="pcNotes" style="min-height:260px" placeholder="z. B. Kundentermin am Donnerstag, Drucker-Treiber prüfen">' + esc(pcState.notes) + '</textarea>';
  }
  if (id === "pw") {
    return '<p class="hint" style="margin-bottom:12px">Passwörter sind nur für den Besitzer sichtbar. Vorsicht beim Anzeigen, andere Personen könnten mitlesen.</p><div class="list">' +
      PC_PASSWORDS.map(function(p, i){
        var show = pcState.pwShow[i];
        return '<div class="li" style="padding:12px 0"><span class="main-t"><span style="display:block;font-weight:650">' + esc(p.name) + '</span><span class="sub muted mono" style="font-size:13px">' + esc(p.user) + ' · ' + (show ? esc(p.pw) : '●●●●●●●●') + '</span></span><button class="btn btn-s btn-sm" type="button" data-pc-pw="' + i + '">' + (show ? 'Verbergen' : 'Anzeigen') + '</button></div>';
      }).join("") + '</div>';
  }
  if (id === "mon") {
    return '<div class="list">' + services.map(function(s){
      var st = svcState(s);
      return '<div class="li" style="padding:12px 0"><span class="main-t"><span style="display:block;font-weight:650">' + esc(s.name) + '</span><span class="sub muted" style="font-size:13px">Verfügbarkeit ' + String(s.avail).replace(".", ",") + ' % · Auslastung ' + s.cap + ' %</span></span><span class="tag ' + (st === "bad" ? "t-bad" : st === "warn" ? "t-warn" : "t-ok") + '">' + (st === "bad" ? "Störung" : st === "warn" ? "Warnung" : "OK") + '</span></div>';
    }).join("") + '</div><div class="acts" style="margin-top:14px"><button class="btn btn-s btn-sm" type="button" data-go="dienste">Zu den Diensten</button></div>';
  }
  return '<p class="hint">Diese App ist noch nicht verfügbar.</p>';
}
function pcSuppRows(q){
  var f = (q || "").toLowerCase();
  return PC_SUPPLIERS.map(function(s){
    return '<tr><td style="font-weight:650">' + esc(s.name) + '</td><td class="num">' + s.days + ' Tage</td><td class="num">' + esc(s.price) + '</td><td style="text-align:right"><button class="btn btn-s btn-sm" type="button" data-go="rechner" data-pc-app="shop">Im Shop bestellen</button></td></tr>';
  }).join("");
}
function pcBuy(id){
  var it = SHOP.filter(function(s){ return s.id === id; })[0];
  if (cash < it.price) { toast("Zu wenig Budget für " + it.name + ".", "bad"); return; }
  cash -= it.price;
  pcInv[id]++;
  if (id === "wlan") WS.stock += 1;
  renderAll();
  renderPcWin();
  toast(it.name + " gekauft (" + eur(it.price) + ").", "ok");
}
function pcBench(){
  pcState.benchRunning = true;
  renderPcWin();
  setTimeout(function(){
    pcState.benchRunning = false;
    pcState.bench = { cpu: 2310, ram: 880, disk: 1950 };
    if (pcState.app === "bench") renderPcWin();
    toast("Benchmark fertig.", "ok");
  }, 1600);
}

document.addEventListener("click", function(e){
  var t = e.target;
  var ap = t.closest("[data-pc-app]");
  if (ap && t.closest("#pcIcons, [data-pc-app='shop']")) { pcOpen(ap.getAttribute("data-pc-app")); return; }
  if (t.closest("#pcWc")) { pcClose(); return; }
  var b = t.closest("[data-pc-buy]");
  if (b) { pcBuy(b.getAttribute("data-pc-buy")); return; }
  var m = t.closest("[data-pc-mail]");
  if (m) {
    var mid = +m.getAttribute("data-pc-mail");
    pcState.mail = mid;
    PC_MAILS.forEach(function(x){ if (x.id === mid) x.read = true; });
    renderPcIcons(); renderPcWin(); return;
  }
  var ot = t.closest("[data-pc-openticket]");
  if (ot) { currentTicket = ot.getAttribute("data-pc-openticket"); location.hash = "ticket"; return; }
  var rp = t.closest("[data-pc-reply]");
  if (rp) {
    var mm = PC_MAILS.filter(function(x){ return x.id === +rp.getAttribute("data-pc-reply"); })[0];
    openModal({
      title: "Antwort an " + mm.from.split(",")[0], sub: mm.subj,
      body: field("pcReply", "Deine Antwort", '<textarea class="inp" id="pcReply" placeholder="z. B. Ich komme heute um 11 Uhr vorbei."></textarea>', null, "Mindestens 10 Zeichen."),
      actions: '<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="send">Senden</button>',
      onAction: function(a, el, close){
        if (a !== "send") return;
        var v = $("#pcReply", el).value.trim();
        if (v.length < 10) { $("#pcReplyErr", el).textContent = "Bitte mindestens 10 Zeichen schreiben."; return; }
        mm.reply = v; close(); renderPcWin(); toast("Antwort gesendet.", "ok");
      }
    });
    return;
  }
  var ch = t.closest("[data-pc-chan]");
  if (ch) { pcState.chat = ch.getAttribute("data-pc-chan"); renderPcWin(); return; }
  var bn = t.closest("[data-pc-bench]");
  if (bn) { pcBench(); return; }
  var fo = t.closest("[data-pc-folder]");
  if (fo) { pcState.files = fo.getAttribute("data-pc-folder"); renderPcWin(); return; }
  var pw = t.closest("[data-pc-pw]");
  if (pw) { var i = +pw.getAttribute("data-pc-pw"); pcState.pwShow[i] = !pcState.pwShow[i]; renderPcWin(); return; }
});
document.addEventListener("submit", function(e){
  if (e.target.id === "pcChatForm") {
    e.preventDefault();
    var inp = $("#pcChatIn");
    var v = inp.value.trim();
    if (!v) return;
    (PC_CHAT[pcState.chat] = PC_CHAT[pcState.chat] || []).push({ who:"Derrik", t:"Jetzt", text:v });
    renderPcWin();
    $("#pcChatIn").focus();
  }
});
document.addEventListener("input", function(e){
  if (e.target.id === "pcSearch") { var tb = $("#pcSupp"); if (tb) tb.innerHTML = pcSuppRows(e.target.value); }
  if (e.target.id === "pcNotes") { pcState.notes = e.target.value; pcSave("notes", pcState.notes); }
});

/* ---------- Mails (Outlook-ähnlich) ---------- */
var PC_MAILS = [
  { id:1, folder:"inbox", from:"Petra Krumm", org:"Bäckerei Krumm", subj:"Drucker im Empfang: bitte heute noch", time:"Heute, 07:42", read:false, ticket:"T-1031",
    body:"Hallo, der Drucker geht seit heute früh nicht. Wir brauchen ihn für die Lieferscheine. Können Sie heute noch kommen?", replies:[] },
  { id:2, folder:"inbox", from:"Tobias Lang", org:"Logistik Weidner", subj:"Scanner im Lager tot", time:"Heute, 06:10", read:false, ticket:"T-1033",
    body:"Die Scanner im Lager sind seit Mitternacht weg. Die Ware steht. Bitte melden Sie sich sofort.", replies:[] },
  { id:3, folder:"inbox", from:"Mira Stein", org:"Team", subj:"Krumm ruft wieder an", time:"Heute, 08:15", read:false, ticket:"T-1031",
    body:"Bitte Petra Krumm zurückrufen, bevor du zum Termin fährst. Sie will wissen, ob der Drucker bis 11 Uhr läuft.", replies:[] },
  { id:4, folder:"inbox", from:"Sven Hahn", org:"Steuerbüro Hahn", subj:"Laptop startet nicht", time:"Gestern, 16:02", read:true, ticket:"T-1032",
    body:"Mein Laptop hängt beim Start. Bluetooth finde ich auch nicht mehr.", replies:[] },
  { id:5, folder:"inbox", from:"Lisa Berger", org:"Hardware-Schmiede", subj:"Angebot: WLAN-Module zum Sonderpreis", time:"Gestern, 11:20", read:false, ticket:null,
    body:"Wir können zehn WLAN/Bluetooth-Module zum Sonderpreis liefern. Bestellung bis Freitag.", replies:[] },
  { id:6, folder:"sent", from:"Derrik", org:"Nordlicht IT Service", to:"Logistik Weidner", subj:"Re: Netzwerk-Ausfall Lager", time:"Gestern, 09:00", read:true, ticket:"T-1033",
    body:"Wir sind dran. Der Router ist in Arbeit, Sie bekommen in einer Stunde ein Update.", replies:[] }
];
var MAIL_FOLDERS = [ { id:"inbox", name:"Posteingang" }, { id:"sent", name:"Gesendet" }, { id:"deleted", name:"Gelöschte Elemente" } ];
var mailState = { folder:"inbox", sel:null, compose:false, reply:false, query:"" };

function initials(n){ return n.split(/[\s,]+/).filter(Boolean).slice(0, 2).map(function(p){ return p[0]; }).join("").toUpperCase(); }
function mailFolderCount(f){ return PC_MAILS.filter(function(m){ return m.folder === f && !m.read; }).length; }
function mailVisible(){
  var q = (mailState.query || "").toLowerCase();
  return PC_MAILS.filter(function(m){
    if (m.folder !== mailState.folder) return false;
    if (q && (m.subj + " " + m.from + " " + m.org + " " + m.body).toLowerCase().indexOf(q) < 0) return false;
    return true;
  }).sort(function(a, b){ return b.id - a.id; });
}
function mailListHtml(){
  var list = mailVisible();
  if (!list.length) return '<p class="hint" style="padding:16px">Keine Mails in diesem Ordner.</p>';
  return list.map(function(m){
    var who = mailState.folder === "sent" ? "An " + (m.to || "") : m.from;
    return '<button type="button" class="ol-row' + (m.read ? '' : ' unread') + (mailState.sel === m.id ? ' sel' : '') + '" data-m-sel="' + m.id + '">' +
      '<span class="ol-av" aria-hidden="true">' + esc(initials(who)) + '</span>' +
      '<span class="ol-main"><span class="ol-top"><span class="ol-from">' + esc(who) + '</span><span class="ol-time">' + esc(m.time) + '</span></span>' +
      '<span class="ol-subj">' + esc(m.subj) + '</span><span class="ol-prev">' + esc(m.body) + '</span></span>' +
      (m.ticket ? '<span class="tag t-acc" style="align-self:flex-start">' + esc(m.ticket) + '</span>' : '') + '</button>';
  }).join("");
}
function mailReadHtml(){
  if (mailState.compose) {
    var opts = ["Petra Krumm (Bäckerei Krumm)", "Tobias Lang (Logistik Weidner)", "Sven Hahn (Steuerbüro Hahn)", "Lisa Berger (Hardware-Schmiede)", "Mira Stein (Team)"];
    return '<form id="mComposeForm" class="ol-compose" novalidate>' +
      '<h2 style="font-size:18px">Neue Nachricht</h2>' +
      '<div class="field"><label for="mTo">An</label><select class="inp" id="mTo">' + opts.map(function(o){ return '<option>' + esc(o) + '</option>'; }).join("") + '</select></div>' +
      '<div class="field"><label for="mSubj">Betreff</label><input class="inp" id="mSubj" maxlength="90" placeholder="z. B. Termin am Donnerstag"><div class="err" id="mSubjErr"></div></div>' +
      '<div class="field" style="flex:1"><label for="mBody">Nachricht</label><textarea class="inp" id="mBody" style="min-height:200px;flex:1" placeholder="Schreib den Text hier"></textarea><div class="err" id="mBodyErr"></div></div>' +
      '<div class="acts"><button class="btn" type="submit">Senden</button><button class="btn btn-s" type="button" data-m-cancel>Verwerfen</button></div></form>';
  }
  var m = PC_MAILS.filter(function(x){ return x.id === mailState.sel; })[0];
  if (!m) return '<div class="ol-empty"><p class="muted">Wähle eine Mail aus der Liste.</p></div>';
  var replies = m.replies.map(function(r){
    return '<div class="ol-reply"><div class="hint">' + esc(r.time) + ' · Derrik</div><p>' + esc(r.text) + '</p></div>';
  }).join("");
  return '<article class="ol-read">' +
    '<div class="ol-head"><div class="ol-av big" aria-hidden="true">' + esc(initials(m.from)) + '</div><div style="min-width:0;flex:1">' +
    '<h2 style="font-size:20px;overflow-wrap:anywhere">' + esc(m.subj) + '</h2>' +
    '<div style="font-weight:650">' + esc(m.from) + ' <span class="muted" style="font-weight:500">&lt;' + esc(addrOf(m)) + '&gt;</span></div>' +
    '<div class="hint">' + (m.folder === "sent" ? "An " + esc(m.to) : "An Derrik") + ' · ' + esc(m.time) + '</div></div></div>' +
    '<div class="acts" style="margin:14px 0">' +
    '<button class="btn btn-sm" type="button" data-m-reply="' + m.id + '">Antworten</button>' +
    (m.ticket ? '<button class="btn btn-s btn-sm" type="button" data-m-ticket="' + m.ticket + '">Ticket ' + m.ticket + ' öffnen</button>' : '') +
    '<button class="btn btn-g btn-sm" type="button" data-m-unread="' + m.id + '">' + (m.read ? 'Als ungelesen markieren' : 'Als gelesen markieren') + '</button>' +
    '<button class="btn btn-g btn-sm" type="button" data-m-del="' + m.id + '">Löschen</button></div>' +
    securityBar(m) + '<div class="ol-text">' + esc(m.body).split("\n").map(function(p){ return '<p>' + p + '</p>'; }).join("") + '</div>' +
    replies +
    (mailState.reply ? '<form id="mReplyForm" class="ol-replyform" data-id="' + m.id + '" novalidate><label for="mReplyText" class="lbl">Antwort an ' + esc(m.from) + '</label><textarea class="inp" id="mReplyText" style="min-height:120px" placeholder="Deine Antwort"></textarea><div class="err" id="mReplyErr"></div><div class="acts" style="margin-top:10px"><button class="btn btn-sm" type="submit">Senden</button><button class="btn btn-s btn-sm" type="button" data-m-cancel>Abbrechen</button></div></form>' : '') +
    '</article>';
}
function pcMailBody(){
  var folders = MAIL_FOLDERS.map(function(f){
    var n = mailFolderCount(f.id);
    return '<button type="button" class="ol-folder' + (mailState.folder === f.id ? ' on' : '') + '" data-m-folder="' + f.id + '">' + esc(f.name) + (n ? '<span class="ol-count">' + n + '</span>' : '') + '</button>';
  }).join("");
  return '<div class="ol">' +
    '<div class="ol-bar">' +
      '<button class="btn btn-sm" type="button" data-m-new>Neue Nachricht</button>' +
      '<span class="tag t-info">Sicherheit: ' + secScore + ' Pkt.</span><input class="inp ol-search" id="mSearch" placeholder="Mails durchsuchen" value="' + esc(mailState.query) + '" aria-label="Mails durchsuchen">' +
    '</div>' +
    '<div class="mail-grid">' +
      '<nav class="ol-folders" aria-label="Ordner">' + folders + '</nav>' +
      '<div class="ol-list" id="mList">' + mailListHtml() + '</div>' +
      '<div class="ol-pane">' + mailReadHtml() + '</div>' +
    '</div></div>';
}
function mailOpen(id){
  mailState.sel = id; mailState.compose = false; mailState.reply = false;
  var m = PC_MAILS.filter(function(x){ return x.id === id; })[0];
  if (m) m.read = true;
  renderPcWin(); renderPcIcons();
}

/* ---------- Kalender (Outlook-ähnlich) ---------- */
var CAL_CALS = {
  kunden: { name:"Kundentermine", c:"#2563EB" },
  intern: { name:"Intern", c:"#7C3AED" },
  change: { name:"Changes und CAB", c:"#D97706" }
};
var CAL_EVENTS = [
  { id:1, title:"Drucker-Check Krumm", date:"2026-11-26", start:"10:00", end:"11:30", cal:"kunden", loc:"Bäckerei Krumm, Empfang" },
  { id:2, title:"Mitarbeitergespräch Mira Stein", date:"2026-11-26", start:"14:00", end:"14:45", cal:"intern", loc:"Besprechungsraum" },
  { id:3, title:"Team-Standup", date:"2026-11-25", start:"09:00", end:"09:15", cal:"intern", loc:"Büro" },
  { id:4, title:"Netzwerk-Review Weidner", date:"2026-11-25", start:"13:00", end:"14:00", cal:"kunden", loc:"Logistik Weidner" },
  { id:5, title:"Change-Fenster Router-Firmware", date:"2026-11-27", start:"08:30", end:"10:00", cal:"change", loc:"Lager, Serverraum B" },
  { id:6, title:"Wartung Dateiablage", date:"2026-11-28", start:"06:00", end:"08:00", cal:"change", loc:"Serverraum A" },
  { id:7, title:"Lieferung WLAN-Module", date:"2026-11-27", start:"12:00", end:"12:30", cal:"intern", loc:"Wareneingang" }
];
var calState = { view:"week", anchor:"2026-11-26", sel:null, form:false, hidden:{} };
var CAL_H0 = 7, CAL_H1 = 19, CAL_PX = 48;
var WD = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
var MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

function calD(iso){ var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
function calISO(d){ return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function calAdd(iso, n){ var d = calD(iso); d.setDate(d.getDate() + n); return calISO(d); }
function calMonday(iso){ var d = calD(iso); var wd = d.getDay() || 7; d.setDate(d.getDate() - (wd - 1)); return calISO(d); }
function calMin(hm){ var p = hm.split(":"); return +p[0] * 60 + +p[1]; }
function calVisible(){ return CAL_EVENTS.filter(function(e){ return !calState.hidden[e.cal]; }); }
function calTitle(){
  var a = calD(calState.anchor);
  if (calState.view === "month") return MONTHS[a.getMonth()] + " " + a.getFullYear();
  if (calState.view === "day") return WD[(a.getDay() || 7) - 1] + ", " + a.getDate() + ". " + MONTHS[a.getMonth()] + " " + a.getFullYear();
  var mo = calD(calMonday(calState.anchor)), su = calD(calAdd(calMonday(calState.anchor), 6));
  return mo.getDate() + ". " + (mo.getMonth() !== su.getMonth() ? MONTHS[mo.getMonth()].slice(0, 3) + " " : "") + "–" + su.getDate() + ". " + MONTHS[su.getMonth()] + " " + su.getFullYear();
}
function calEventChip(e){
  return '<button type="button" class="cal-chip" style="background:' + CAL_CALS[e.cal].c + '" data-c-ev="' + e.id + '">' + e.start + ' ' + esc(e.title) + '</button>';
}
function calGridHtml(days){
  var hours = []; for (var h = CAL_H0; h < CAL_H1; h++) hours.push(h);
  var head = '<div class="cal-head"><div class="cal-gut"></div>' + days.map(function(d){
    var dd = calD(d), today = d === "2026-11-26";
    return '<div class="cal-dh' + (today ? ' today' : '') + '"><span>' + WD[(dd.getDay() || 7) - 1] + '</span><strong>' + dd.getDate() + '</strong></div>';
  }).join("") + '</div>';
  var labels = '<div class="cal-gut">' + hours.map(function(h){ return '<div class="cal-hl" style="height:' + CAL_PX + 'px">' + String(h).padStart(2, "0") + ':00</div>'; }).join("") + '</div>';
  var cols = days.map(function(d){
    var ev = calVisible().filter(function(e){ return e.date === d; });
    var lines = hours.map(function(h){ return '<div class="cal-slot" style="height:' + CAL_PX + 'px" data-c-slot="' + d + '|' + h + '"></div>'; }).join("");
    var evs = ev.map(function(e){
      var top = (calMin(e.start) - CAL_H0 * 60) * CAL_PX / 60;
      var hgt = Math.max(22, (calMin(e.end) - calMin(e.start)) * CAL_PX / 60 - 3);
      return '<button type="button" class="cal-ev' + (calState.sel === e.id ? ' sel' : '') + '" data-c-ev="' + e.id + '" style="top:' + Math.max(0, top) + 'px;height:' + hgt + 'px;background:' + CAL_CALS[e.cal].c + '"><span class="cal-et">' + e.start + '–' + e.end + '</span><span>' + esc(e.title) + '</span></button>';
    }).join("");
    return '<div class="cal-col" style="height:' + (hours.length * CAL_PX) + 'px">' + lines + evs + '</div>';
  }).join("");
  return '<div class="cal-scroll">' + head + '<div class="cal-body">' + labels + '<div class="cal-cols" style="grid-template-columns:repeat(' + days.length + ', minmax(0,1fr))">' + cols + '</div></div></div>';
}
function calMonthHtml(){
  var first = calMonday(calState.anchor.slice(0, 8) + "01");
  var cells = [];
  for (var i = 0; i < 42; i++) cells.push(calAdd(first, i));
  var a = calD(calState.anchor);
  return '<div class="cal-mhead">' + WD.map(function(w){ return '<div>' + w + '</div>'; }).join("") + '</div><div class="cal-month">' + cells.map(function(d){
    var dd = calD(d), other = dd.getMonth() !== a.getMonth();
    var ev = calVisible().filter(function(e){ return e.date === d; }).sort(function(x, y){ return x.start < y.start ? -1 : 1; });
    return '<div class="cal-cell' + (other ? ' other' : '') + (d === "2026-11-26" ? ' today' : '') + '"><button type="button" class="cal-dn" data-c-day="' + d + '">' + dd.getDate() + '</button>' +
      ev.slice(0, 3).map(calEventChip).join("") + (ev.length > 3 ? '<button type="button" class="cal-more" data-c-day="' + d + '">+' + (ev.length - 3) + ' weitere</button>' : '') + '</div>';
  }).join("") + '</div>';
}
function calSidePanel(){
  if (calState.form) {
    var base = calState.formDate || calState.anchor;
    return '<form id="calForm" novalidate class="ol-compose" style="gap:12px"><h2 style="font-size:17px">Neuer Termin</h2>' +
      '<div class="field"><label for="ceTitle">Titel</label><input class="inp" id="ceTitle" maxlength="80" placeholder="z. B. Kundentermin Krumm"><div class="err" id="ceTitleErr"></div></div>' +
      '<div class="field"><label for="ceDate">Datum</label><input class="inp" id="ceDate" type="date" value="' + base + '"></div>' +
      '<div class="grid g2e" style="gap:10px"><div class="field"><label for="ceStart">Beginn</label><input class="inp" id="ceStart" type="time" value="' + (calState.formStart || "09:00") + '"></div><div class="field"><label for="ceEnd">Ende</label><input class="inp" id="ceEnd" type="time" value="' + (calState.formEnd || "10:00") + '"><div class="err" id="ceEndErr"></div></div></div>' +
      '<div class="field"><label for="ceCal">Kalender</label><select class="inp" id="ceCal">' + Object.keys(CAL_CALS).map(function(k){ return '<option value="' + k + '">' + CAL_CALS[k].name + '</option>'; }).join("") + '</select></div>' +
      '<div class="field"><label for="ceLoc">Ort</label><input class="inp" id="ceLoc" maxlength="60"></div>' +
      '<div class="acts"><button class="btn" type="submit">Speichern</button><button class="btn btn-s" type="button" data-c-cancel>Abbrechen</button></div></form>';
  }
  var e = CAL_EVENTS.filter(function(x){ return x.id === calState.sel; })[0];
  if (e) {
    return '<div><div class="eyebrow" style="color:' + CAL_CALS[e.cal].c + '">' + CAL_CALS[e.cal].name + '</div><h2 style="font-size:19px;margin:6px 0 12px">' + esc(e.title) + '</h2>' +
      '<dl class="kv"><dt>Datum</dt><dd>' + esc(calD(e.date).getDate() + ". " + MONTHS[calD(e.date).getMonth()]) + '</dd><dt>Zeit</dt><dd class="num">' + e.start + ' – ' + e.end + '</dd><dt>Ort</dt><dd>' + esc(e.loc) + '</dd></dl>' +
      '<div class="acts" style="margin-top:16px">' + (e.cal === "change" ? '<button class="btn btn-s btn-sm" type="button" data-c-openchg="' + e.id + '">Zum Change</button>' : '') + '<button class="btn btn-d btn-sm" type="button" data-c-del="' + e.id + '">Termin löschen</button></div></div>';
  }
  return '<div class="muted"><h2 style="font-size:17px;color:var(--ink);margin-bottom:8px">Termine</h2><p>Klick auf einen freien Slot legt einen Termin an. Klick auf einen Termin zeigt die Details.</p><p class="hint" style="margin-top:10px">Changes aus dem Kalender sind mit dem CAB verknüpft.</p></div>';
}
function pcCalBody(){
  var days = calState.view === "day" ? [calState.anchor] : [];
  if (calState.view === "week") { var mo = calMonday(calState.anchor); for (var i = 0; i < 7; i++) days.push(calAdd(mo, i)); }
  var views = [["day","Tag"],["week","Woche"],["month","Monat"]].map(function(v){
    return '<button type="button" aria-pressed="' + (calState.view === v[0]) + '" data-c-view="' + v[0] + '">' + v[1] + '</button>';
  }).join("");
  var cals = Object.keys(CAL_CALS).map(function(k){
    return '<label class="ol-cal"><input type="checkbox" data-c-cal="' + k + '"' + (calState.hidden[k] ? '' : ' checked') + '><span class="ol-dot" style="background:' + CAL_CALS[k].c + '"></span>' + esc(CAL_CALS[k].name) + '</label>';
  }).join("");
  return '<div class="ol">' +
    '<div class="ol-bar" style="flex-wrap:wrap">' +
      '<button class="btn btn-sm" type="button" data-c-new>Neuer Termin</button>' +
      '<div class="acts" style="gap:4px"><button class="btn btn-s btn-sm" type="button" data-c-nav="-1" aria-label="Zurück">‹</button><button class="btn btn-s btn-sm" type="button" data-c-nav="0">Heute</button><button class="btn btn-s btn-sm" type="button" data-c-nav="1" aria-label="Weiter">›</button></div>' +
      '<strong style="font-size:15px">' + esc(calTitle()) + '</strong>' +
      '<div class="seg" role="group" aria-label="Ansicht" style="margin-left:auto">' + views + '</div>' +
    '</div>' +
    '<div class="cal-grid">' +
      '<aside class="ol-side"><div class="lbl" style="margin-bottom:8px">Kalender</div>' + cals + '</aside>' +
      '<div class="cal-main">' + (calState.view === "month" ? calMonthHtml() : calGridHtml(days)) + '</div>' +
      '<aside class="cal-detail">' + calSidePanel() + '</aside>' +
    '</div></div>';
}

/* ---------- Handler für Mails und Kalender ---------- */
$("#wsdWins").addEventListener("click", function(e){
  var t = e.target, x;
  if ((x = t.closest("[data-m-sel]"))) return mailOpen(+x.getAttribute("data-m-sel"));
  if ((x = t.closest("[data-m-folder]"))) { mailState.folder = x.getAttribute("data-m-folder"); mailState.sel = null; mailState.compose = false; mailState.reply = false; return renderPcWin(); }
  if (t.closest("[data-m-new]")) { mailState.compose = true; mailState.reply = false; mailState.sel = null; return renderPcWin(); }
  if (t.closest("[data-m-cancel]")) { mailState.compose = false; mailState.reply = false; return renderPcWin(); }
  if ((x = t.closest("[data-m-reply]"))) { mailState.reply = true; return renderPcWin(); }
  if ((x = t.closest("[data-m-ticket]"))) { currentTicket = x.getAttribute("data-m-ticket"); location.hash = "ticket"; return; }
  if ((x = t.closest("[data-m-unread]"))) {
    var mu = PC_MAILS.filter(function(m){ return m.id === +x.getAttribute("data-m-unread"); })[0];
    mu.read = !mu.read; renderPcWin(); renderPcIcons(); return;
  }
  if ((x = t.closest("[data-m-del]"))) {
    var md = PC_MAILS.filter(function(m){ return m.id === +x.getAttribute("data-m-del"); })[0];
    md.folder = "deleted"; mailState.sel = null; mailState.reply = false;
    renderPcWin(); renderPcIcons(); toast("Mail in Gelöschte Elemente verschoben.");
    return;
  }
  if (t.closest("[data-c-new]")) { calState.form = true; calState.sel = null; calState.formDate = calState.anchor; calState.formStart = "09:00"; calState.formEnd = "10:00"; return renderPcWin(); }
  if (t.closest("[data-c-cancel]")) { calState.form = false; return renderPcWin(); }
  if ((x = t.closest("[data-c-nav]"))) {
    var dir = +x.getAttribute("data-c-nav");
    if (dir === 0) calState.anchor = "2026-11-26";
    else calState.anchor = calAdd(calState.anchor, dir * (calState.view === "month" ? 28 : calState.view === "day" ? 1 : 7));
    return renderPcWin();
  }
  if ((x = t.closest("[data-c-view]"))) { calState.view = x.getAttribute("data-c-view"); return renderPcWin(); }
  if ((x = t.closest("[data-c-day]"))) { calState.anchor = x.getAttribute("data-c-day"); calState.view = "day"; calState.sel = null; return renderPcWin(); }
  if ((x = t.closest("[data-c-ev]"))) { calState.sel = +x.getAttribute("data-c-ev"); calState.form = false; return renderPcWin(); }
  if ((x = t.closest("[data-c-del]"))) {
    var id = +x.getAttribute("data-c-del");
    confirmModal("Termin löschen?", "Der Termin wird aus dem Kalender entfernt.", "Löschen", "btn-d", function(){
      CAL_EVENTS = CAL_EVENTS.filter(function(e){ return e.id !== id; });
      calState.sel = null; renderPcWin(); toast("Termin gelöscht.");
    });
    return;
  }
  if ((x = t.closest("[data-c-openchg]"))) { location.hash = "changes"; return; }
  if ((x = t.closest("[data-c-slot]")) && !t.closest(".cal-ev")) {
    var parts = x.getAttribute("data-c-slot").split("|");
    var hh = +parts[1];
    calState.form = true; calState.sel = null; calState.formDate = parts[0];
    calState.formStart = String(hh).padStart(2, "0") + ":00";
    calState.formEnd = String(hh + 1).padStart(2, "0") + ":00";
    return renderPcWin();
  }
  if ((x = t.closest("[data-c-cal]")) ) return;
});
$("#wsdWins").addEventListener("change", function(e){
  var x = e.target.closest("[data-c-cal]");
  if (x) { calState.hidden[x.getAttribute("data-c-cal")] = !x.checked; renderPcWin(); }
});
$("#wsdWins").addEventListener("input", function(e){
  if (e.target.id === "mSearch") { mailState.query = e.target.value; var l = $("#mList"); if (l) l.innerHTML = mailListHtml(); }
});
document.addEventListener("submit", function(e){
  var f = e.target;
  if (f.id === "mComposeForm") {
    e.preventDefault();
    var subj = $("#mSubj").value.trim(), body = $("#mBody").value.trim();
    $("#mSubjErr").textContent = subj.length >= 3 ? "" : "Bitte einen Betreff mit mindestens 3 Zeichen eingeben.";
    $("#mBodyErr").textContent = body.length >= 10 ? "" : "Bitte mindestens 10 Zeichen schreiben.";
    if (subj.length < 3 || body.length < 10) { ((subj.length < 3) ? $("#mSubj") : $("#mBody")).focus(); return; }
    var id = Date.now();
    PC_MAILS.push({ id:id, folder:"sent", from:"Derrik", org:"Nordlicht IT Service", to:$("#mTo").value, subj:subj, body:body, time:"Gerade eben", read:true, ticket:null, replies:[] });
    mailState.compose = false; mailState.folder = "sent"; mailState.sel = id;
    renderPcWin(); renderPcIcons(); toast("Mail gesendet.", "ok");
    return;
  }
  if (f.id === "mReplyForm") {
    e.preventDefault();
    var mid = +f.getAttribute("data-id");
    var txt = $("#mReplyText").value.trim();
    if (txt.length < 5) { $("#mReplyErr").textContent = "Bitte mindestens 5 Zeichen schreiben."; $("#mReplyText").focus(); return; }
    var m = PC_MAILS.filter(function(x){ return x.id === mid; })[0];
    m.replies.push({ time:"Gerade eben", text:txt });
    mailState.reply = false;
    renderPcWin(); toast("Antwort gesendet.", "ok");
    return;
  }
  if (f.id === "calForm") {
    e.preventDefault();
    var title = $("#ceTitle").value.trim(), date = $("#ceDate").value, st = $("#ceStart").value, en = $("#ceEnd").value;
    $("#ceTitleErr").textContent = title.length >= 3 ? "" : "Bitte einen Titel mit mindestens 3 Zeichen eingeben.";
    $("#ceEndErr").textContent = (en > st) ? "" : "Das Ende muss nach dem Beginn liegen.";
    if (title.length < 3 || en <= st || !date) { ((title.length < 3) ? $("#ceTitle") : $("#ceEnd")).focus(); return; }
    var nid = Math.max.apply(null, CAL_EVENTS.map(function(x){ return x.id; })) + 1;
    CAL_EVENTS.push({ id:nid, title:title, date:date, start:st, end:en, cal:$("#ceCal").value, loc:$("#ceLoc").value.trim() || "—" });
    calState.form = false; calState.sel = nid; calState.anchor = date;
    renderPcWin(); toast("Termin gespeichert.", "ok");
  }
});

/* ---------- Sicherheit: Phishing in den Mails ---------- */
var MAIL_ADDR = {
  1: "p.krumm@baeckerei-krumm.example",
  2: "t.lang@logistik-weidner.example",
  3: "mira.stein@nordlicht.example",
  4: "s.hahn@steuerbuero-hahn.example",
  5: "l.berger@hardware-schmiede.example",
  6: "derrik@nordlicht.example"
};
PC_MAILS.push(
  { id:7, folder:"inbox", from:"IT-Sicherheit Nordlicht", org:"Nordlicht IT", addr:"it-sicherheit@nordlicht-support.example",
    subj:"Dringend: Ihr Konto wird in 24 h gesperrt", time:"Heute, 09:03", read:false, ticket:null, phish:true,
    link:"https://nordlicht-login.example/pruefen",
    body:"Wir haben ungewöhnliche Anmeldungen festgestellt. Bitte bestätigen Sie Ihr Passwort über den Link unten, sonst wird Ihr Konto heute gesperrt.", replies:[] },
  { id:8, folder:"inbox", from:"Lisa Berger", org:"Hardware-Schmiede", addr:"l.berger@hardware-schmiede-b.example",
    subj:"Rechnung WLAN-Module: Zahlung bitte über den Link", time:"Gestern, 17:40", read:false, ticket:null, phish:true,
    link:"https://hardware-schmiede-b.example/zahlung",
    body:"Hallo, die Rechnung zu den WLAN-Modulen ist offen. Bitte aktualisieren Sie Ihre Zahlungsdaten über den Link, damit wir heute liefern können.", replies:[] }
);
var secScore = 0;
var secDone = {};
function addrOf(m){ return m.addr || MAIL_ADDR[m.id] || ""; }
function mailById(id){ return PC_MAILS.filter(function(m){ return m.id === id; })[0]; }
function securityBar(m){
  var link = m.link ? '<button class="btn btn-s btn-sm" type="button" data-sec-link="' + m.id + '">Link öffnen</button>' : '';
  var done = secDone[m.id] ? '<span class="tag t-mut">bereits bearbeitet</span>' : '<button class="btn btn-s btn-sm" type="button" data-sec-report="' + m.id + '">Als Phishing melden</button>';
  return '<div class="ol-sec"><div><div style="font-weight:700;font-size:14px">Sicherheit</div><div class="hint" style="font-size:13px">Prüfe Absender und Link, bevor du etwas tust.</div></div><div class="acts">' + link + done + '</div></div>';
}
function secReport(id){
  var m = mailById(id);
  if (!m) return;
  if (secDone[id]) { toast("Diese Mail ist schon bearbeitet."); return; }
  secDone[id] = true;
  if (m.phish) {
    secScore += 10;
    m.folder = "deleted";
    mailState.sel = null;
    toast("Richtig erkannt: Phishing gemeldet. +10 Punkte.", "ok");
  } else {
    secScore -= 5;
    toast("Fehlalarm: Die Mail ist echt. −5 Punkte.", "bad");
  }
  renderPcWin(); renderPcIcons();
}
function secLink(id){
  var m = mailById(id);
  if (!m || !m.link) return;
  if (!m.phish) { toast("Link geöffnet: Die Seite ist harmlos."); return; }
  secScore -= 15;
  secDone[id] = true;
  tickets.unshift({ id:"T-" + (1100 + tickets.length), title:"Sicherheitsvorfall: Zugangsdaten eingegeben", cust:"Nordlicht IT Service (intern)", requester:"Mitarbeitende/r", cat:"Sicherheit", impact:3, urgency:4, prio:"Hoch", sla:"1 h", slaMin:60, status:"Offen", who:"—", inv:0, log:[], notes:[], resolution:"",
    thread:[{ k:"client", who:"Mitarbeitende/r", text:"Ich habe auf einen Link in einer Mail geklickt und mein Passwort eingegeben.", when:"Gerade eben" }] });
  renderAll(); renderPcWin();
  toast("Zugangsdaten eingegeben. Sicherheitsvorfall eröffnet. −15 Punkte.", "bad");
}

/* ---------- Post-Mortem nach Major Incidents ---------- */
var PM_CAUSES = [
  { id:"firm",    name:"Firmware-Update ist fehlgeschlagen" },
  { id:"treiber", name:"Treiber-Update ist fehlerhaft" },
  { id:"hw",      name:"Hardware-Defekt" },
  { id:"config",  name:"Fehlkonfiguration" },
  { id:"mensch",  name:"Menschlicher Fehler ohne Folgen" }
];
var PM_MEASURES = [
  { id:"test",    name:"Updates vorher in einer Testumgebung prüfen", good:true },
  { id:"alarm",   name:"Alarm bei Prüfsummen- oder Startfehlern einrichten", good:true },
  { id:"backup",  name:"Vor jedem Update ein Konfigurations-Backup machen", good:true },
  { id:"schulung",name:"Team zu Updates schulen", good:false },
  { id:"keine",   name:"Keine Maßnahme nötig", good:false }
];
var postmortems = [
  { id:"PM-0998", ticket:"T-0998", title:"Druckserver-Ausfall Bäckerei Krumm", date:"Vor 9 Tagen", status:"abgegeben", correct:"treiber",
    cause:"treiber", measures:["test","alarm"], text:"Ein Treiber-Update hat den Spooler beim Start abstürzen lassen. Wir haben den Treiber zurückgerollt und das Update erst nach einem Test wieder freigegeben.",
    score:70, verdict:"Sehr gut",
    timeline:[{ when:"Tag 33 · 08:10", text:"Kunde meldet Ausfall des Druckservers" }, { when:"Tag 33 · 08:40", text:"Spooler startet nicht, Treiber ist neu" }, { when:"Tag 33 · 10:20", text:"Treiber zurückgerollt, Drucken läuft" }] }
];
var pmState = { sel:"PM-0998", cause:null, measures:{} };
function pmCreate(t){
  var tl = t.thread.map(function(e){ return { when:e.when, text:e.text }; });
  t.log.forEach(function(l){ tl.push({ when:"Fernwartung", text:l }); });
  postmortems.unshift({ id:"PM-" + t.id.replace("T-", ""), ticket:t.id, title:"Major Incident: " + t.title, date:"Gerade eben", status:"offen", correct:"firm",
    cause:null, measures:[], text:"", score:null, verdict:null, timeline:tl });
}
function pmScore(pm, cause, measures){
  var s = 0;
  if (cause === pm.correct) s += 40;
  measures.forEach(function(id){
    var m = PM_MEASURES.filter(function(x){ return x.id === id; })[0];
    s += m.good ? 15 : -10;
  });
  return Math.max(0, Math.min(85, s));
}
function pmVerdict(s){ return s >= 60 ? "Sehr gut" : s >= 35 ? "Gut" : "Verbesserung nötig"; }
function pmList(){
  return postmortems.map(function(pm){
    var on = pmState.sel === pm.id;
    var tag = pm.status === "abgegeben" ? '<span class="tag t-ok">Abgegeben</span>' : '<span class="tag t-warn">Offen</span>';
    return '<button type="button" class="pm-card' + (on ? ' on' : '') + '" data-pm-sel="' + esc(pm.id) + '">' +
      '<span class="pm-card-top">' + tag + '<span class="hint">' + esc(pm.ticket) + ' · ' + esc(pm.date) + '</span></span>' +
      '<span class="pm-card-t">' + esc(pm.title) + '</span>' +
      (pm.score !== null ? '<span class="pm-card-s"><span class="num">' + pm.score + '</span> Lernpunkte · ' + esc(pm.verdict) + '</span>' : '<span class="hint">Bericht noch nicht abgegeben</span>') + '</button>';
  }).join("");
}
function pmTimeline(pm){
  return '<div class="pm-tl">' + pm.timeline.map(function(e){
    return '<div class="pm-tl-i"><span class="pm-tl-w">' + esc(e.when) + '</span><span class="pm-tl-t">' + esc(e.text) + '</span></div>';
  }).join("") + '</div>';
}
function pmDetail(){
  var pm = postmortems.filter(function(x){ return x.id === pmState.sel; })[0];
  if (!pm) return '<p class="hint">Wähle einen Bericht.</p>';
  var head = '<div class="pm-head"><div><div class="eyebrow">Post-Mortem · ' + esc(pm.ticket) + '</div><h2 style="font-size:24px;margin-top:6px">' + esc(pm.title) + '</h2></div></div>';
  if (pm.status === "abgegeben") {
    var fb = pm.cause === pm.correct ? "Die Ursache ist richtig erkannt." : "Die Ursache war: " + PM_CAUSES.filter(function(c){ return c.id === pm.correct; })[0].name + ".";
    var missed = PM_MEASURES.filter(function(m){ return m.good && pm.measures.indexOf(m.id) < 0; }).map(function(m){ return m.name; });
    return head +
      '<div class="pm-score"><div><div class="l">Lernpunkte</div><div class="pm-big num">' + pm.score + '</div></div><div><span class="tag ' + (pm.score >= 60 ? "t-ok" : pm.score >= 35 ? "t-info" : "t-warn") + '">' + esc(pm.verdict) + '</span><p class="hint" style="margin-top:8px">' + esc(fb) + '</p>' +
      (missed.length ? '<p class="hint" style="margin-top:6px">Auch sinnvoll gewesen: ' + esc(missed.join("; ")) + '.</p>' : '') + '</div></div>' +
      '<h3 style="margin:22px 0 10px">Zeitlinie</h3>' + pmTimeline(pm) +
      '<h3 style="margin:22px 0 10px">Bericht</h3><div class="pm-text">' + esc(pm.text) + '</div>';
  }
  var causes = PM_CAUSES.map(function(c){
    return '<label class="pm-opt"><input type="radio" name="pmCause" value="' + c.id + '"><span>' + esc(c.name) + '</span></label>';
  }).join("");
  var measures = PM_MEASURES.map(function(m){
    return '<label class="pm-opt"><input type="checkbox" data-pm-m="' + m.id + '"><span>' + esc(m.name) + '</span></label>';
  }).join("");
  return head +
    '<h3 style="margin:18px 0 10px">Zeitlinie</h3>' + pmTimeline(pm) +
    '<div class="grid g2e" style="gap:24px;margin-top:20px"><div><h3 style="margin-bottom:10px">Ursache</h3><div class="pm-opts" id="pmCauses">' + causes + '</div></div>' +
    '<div><h3 style="margin-bottom:10px">Maßnahmen (bis zu drei)</h3><div class="pm-opts">' + measures + '</div></div></div>' +
    '<div class="field" style="margin-top:20px"><label for="pmText">Bericht</label><textarea class="inp" id="pmText" style="min-height:120px" placeholder="Was ist passiert, warum, und was ändern wir? Mindestens 40 Zeichen."></textarea><div class="err" id="pmTextErr"></div></div>' +
    '<div class="acts" style="margin-top:14px;justify-content:space-between;align-items:center"><span class="hint">Lernpunkte zeigen, wie gut die Ursache und die Maßnahmen zur Lage passen.</span><button class="btn" type="button" data-pm-submit>Bericht abgeben</button></div>';
}
function renderPostmortems(){
  var l = $("#pmList"), d = $("#pmDetail");
  if (!l || !d) return;
  l.innerHTML = pmList();
  d.innerHTML = pmDetail();
}

/* ---------- Kundenkommunikation im Ticket ---------- */
var CUST_POS = ["Danke, das hilft mir weiter.", "Super, dann warte ich auf das Ergebnis.", "Klingt gut. Bitte melden Sie sich, wenn es fertig ist."];
var CUST_NEU = ["Okay. Wann ist es ungefähr fertig?", "Was muss ich dafür tun?"];
var CUST_NEG = ["Das verstehe ich nicht. Können Sie das einfacher erklären?", "Das hilft mir gerade nicht. Ich brauche das heute noch!"];
function tkMood(t){ return typeof t.mood === "number" ? t.mood : 60; }
function renderThread(t){
  var mood = tkMood(t);
  $("#tkMood").style.left = mood + "%";
  $("#tkMoodTxt").textContent = mood >= 60 ? "zufrieden" : mood >= 40 ? "unsicher" : "verärgert";
  $("#tkAi").textContent = prefs.ai ? "KI-Texte (lokal)" : "Vorlagen";
  $("#tkThread").innerHTML = t.thread.map(function(e){
    if (e.k === "note") return '<div class="bub bub-n"><div class="bub-meta">Intern · ' + esc(e.when) + '</div>' + esc(e.text) + '</div>';
    if (e.k === "ask") return '<div class="bub bub-a"><div class="bub-meta">Rückfrage · ' + esc(e.when) + '</div>' + esc(e.text) + '</div>';
    if (e.k === "client") return '<div class="bub bub-c"><div class="bub-meta">' + esc(e.who) + ' · ' + esc(e.when) + (e.src ? ' <span class="bub-ai">' + esc(e.src) + '</span>' : '') + '</div>' + esc(e.text) + '</div>';
    return '<div class="bub bub-s"><div class="bub-meta">' + esc(e.who) + ' · ' + esc(e.when) + '</div>' + esc(e.text) + '</div>';
  }).join("") || '<p class="hint">Noch keine Nachrichten.</p>';
}

/* ---------- Handler ---------- */
$("#wsdWins").addEventListener("click", function(e){
  var t = e.target, x;
  if ((x = t.closest("[data-sec-report]"))) { secReport(+x.getAttribute("data-sec-report")); return; }
  if ((x = t.closest("[data-sec-link]"))) { secLink(+x.getAttribute("data-sec-link")); return; }
});
var pmSec = $('[data-screen="postmortem"]');
if (pmSec) pmSec.addEventListener("click", function(e){
  var t = e.target, x;
  if ((x = t.closest("[data-pm-sel]"))) { pmState.sel = x.getAttribute("data-pm-sel"); pmState.cause = null; pmState.measures = {}; renderPostmortems(); return; }
  if (t.closest("[data-pm-submit]")) {
    var pm = postmortems.filter(function(p){ return p.id === pmState.sel; })[0];
    var cause = document.querySelector('input[name="pmCause"]:checked');
    var text = ($("#pmText") ? $("#pmText").value : "").trim();
    var ms = Object.keys(pmState.measures).filter(function(k){ return pmState.measures[k]; });
    var err = "";
    if (!cause) err = "Bitte eine Ursache wählen.";
    else if (text.length < 40) err = "Der Bericht braucht mindestens 40 Zeichen.";
    if (!err && ms.length > 3) err = "Höchstens drei Maßnahmen.";
    if (err) { toast(err, "bad"); return; }
    var sc = pmScore(pm, cause.value, ms);
    pm.status = "abgegeben"; pm.cause = cause.value; pm.measures = ms; pm.text = text; pm.score = sc; pm.verdict = pmVerdict(sc);
    renderPostmortems();
    toast("Bericht abgegeben: " + sc + " Lernpunkte.", "ok");
  }
});
if (pmSec) pmSec.addEventListener("change", function(e){
  if (e.target.matches && e.target.matches("[data-pm-m]")) pmState.measures[e.target.getAttribute("data-pm-m")] = e.target.checked;
  if (e.target.name === "pmCause") pmState.cause = e.target.value;
});
document.addEventListener("submit", function(e){
  if (e.target.id !== "tkChatForm") return;
  e.preventDefault();
  var t = findTicket();
  var v = $("#tkChatIn").value.trim();
  if (v.length < 10) { $("#tkChatErr").textContent = "Mindestens 10 Zeichen. Schreib klar und freundlich."; $("#tkChatIn").focus(); return; }
  $("#tkChatErr").textContent = "";
  var d = (v.length >= 60 ? 8 : v.length >= 25 ? 4 : -6) + (/bitte|danke|verstehe|entschuldig|gern/i.test(v) ? 5 : 0) + (/fachbegriff|einfach gesagt|sie müssen/i.test(v) ? -3 : 0);
  t.mood = Math.max(0, Math.min(100, tkMood(t) + d));
  t.thread.push({ k:"staff", who:t.who === "—" ? "Team" : t.who, text:v, when:"Gerade eben" });
  $("#tkChatIn").value = "";
  renderTicket();
  setTimeout(function(){
    var m = tkMood(t);
    var pool = m >= 60 ? CUST_POS : m >= 40 ? CUST_NEU : CUST_NEG;
    t.thread.push({ k:"client", who:t.requester.split(",")[0], text:pool[t.thread.length % pool.length], when:"Gerade eben", src: prefs.ai ? "KI · lokal" : "Vorlage" });
    renderTicket();
  }, 900);
});

/* ---------- Werkstatt: Auftragssystem ---------- */
var WJ_STAGES = ["Eingang", "Datensicherung", "Diagnose", "Angebot", "Kundenfreigabe", "Reparatur", "Rückgabe"];
var WJ_FAULTS = {
  bt:      { name:"WLAN/Bluetooth-Modul defekt", min:150, parts:["wlan"], hint:"Bluetooth-Adapter antwortet nicht",
             checks:[["Akku","ok"],["Lüfter","ok"],["Arbeitsspeicher","ok"],["SSD","ok"],["WLAN/Bluetooth","fehler"]] },
  treiber: { name:"Treiber-Update fehlerhaft", min:30, parts:[], hint:"Hardware wirkt in Ordnung, Software ist defekt",
             checks:[["Netzteil","ok"],["Arbeitsspeicher","ok"],["SSD","ok"],["Drucker-Port","ok"],["Treiber (Software)","fehler"]] },
  display: { name:"Display defekt", min:90, parts:["display"], hint:"Bild flackert, Panel zeigt Streifen",
             checks:[["Hintergrundbeleuchtung","ok"],["Kabel","ok"],["Display-Panel","fehler"]] },
  rolle:   { name:"Einzugsrolle verschlissen", min:60, parts:["rolle"], hint:"Papier wird nicht eingezogen",
             checks:[["Einzugsmotor","ok"],["Sensor","ok"],["Einzugsrolle","fehler"]] }
};
var WJ_PARTS = [
  { id:"wlan",    name:"WLAN/Bluetooth-Modul", price:60,  lead:0, stock:0 },
  { id:"display", name:"Display 24 Zoll",      price:120, lead:3, stock:0 },
  { id:"rolle",   name:"Einzugsrolle HP",      price:18,  lead:2, stock:0 },
  { id:"netzteil",name:"Netzteil 65 W",        price:45,  lead:1, stock:1 },
  { id:"ssd",     name:"SSD 1 TB",             price:95,  lead:1, stock:1 },
  { id:"ram",     name:"RAM 16 GB",            price:140, lead:1, stock:2 }
];
var WJ_STATIONS = [
  { id:"pruef", name:"Prüfstand", price:900, desc:"Automatische Tests für Akku, RAM, SSD, Display und Funk. Ohne Prüfstand bleibt nur die Sichtprüfung, und der Befund ist nicht bestätigt." },
  { id:"sich",  name:"Datensicherungs-Station", price:600, desc:"Sichert Kundendaten direkt am Arbeitsplatz. Sicherungen klappen auch, wenn das NAS ausfällt." },
  { id:"schrank", name:"Ersatzteilschrank", price:400, desc:"Übersichtliche Lagerfächer. Teile werden schneller gefunden und seltener doppelt bestellt." }
];
var WJ_OWNED = {};
var WJ_LOANERS = 2;
var WJ_LABOUR = 55;
var WJ_ORDERS = [];
var WJ_JOBS = [
  { id:"J-101", dev:"Laptop Business 14 G3", owner:"Steuerbüro Hahn", ticket:"T-1032", age:6, warranty:false, replace:950, fault:"bt", stage:5, needsBackup:true, backup:false, noAck:true, risk:false, decision:"repair", repaired:false, bench:true, loaner:false, loanCost:0, findings:[], min:0 },
  { id:"J-102", dev:"Desktop-PC Empfang", owner:"Bäckerei Krumm", ticket:"T-1031", age:3, warranty:true, replace:780, fault:"treiber", stage:0, needsBackup:true, backup:false, noAck:false, risk:false, decision:null, repaired:false, bench:false, loaner:false, loanCost:0, findings:[], min:0 },
  { id:"J-103", dev:"Monitor 24 Zoll", owner:"Arztpraxis Beispiel", ticket:null, age:4, warranty:false, replace:240, fault:"display", stage:0, needsBackup:false, backup:false, noAck:false, risk:false, decision:null, repaired:false, bench:false, loaner:false, loanCost:0, findings:[], min:0 },
  { id:"J-104", dev:"Drucker HP LaserJet", owner:"Logistik Weidner", ticket:null, age:5, warranty:false, replace:690, fault:"rolle", stage:0, needsBackup:false, backup:false, noAck:false, risk:false, decision:null, repaired:false, bench:false, loaner:false, loanCost:0, findings:[], min:0 }
];
var wjTab = "jobs";

function wjJob(id){ return WJ_JOBS.filter(function(j){ return j.id === id; })[0]; }
function wjPart(id){ return WJ_PARTS.filter(function(p){ return p.id === id; })[0]; }
function wjStock(id){ return id === "wlan" ? WS.stock : wjPart(id).stock; }
function wjTake(id){ if (id === "wlan") WS.stock -= 1; else wjPart(id).stock -= 1; }
function wjNas(){ var n = devices.filter(function(d){ return d.id === "nas"; })[0]; return !!n && !n.bad; }
function wjQuote(j){
  var f = WJ_FAULTS[j.fault];
  var parts = f.parts.map(function(id){ var p = wjPart(id); return { id:id, name:p.name, price:p.price, lead:p.lead, stock:wjStock(id) }; });
  var partSum = parts.reduce(function(a, p){ return a + p.price; }, 0);
  var labour = Math.round(f.min / 60 * WJ_LABOUR);
  var repair = partSum + labour;
  var rec;
  if (j.warranty) rec = { kind:"rma", text:"Herstellergarantie: Die Reparatur kostet den Kunden nichts. Sie dauert rund zwei Wochen und braucht ein Leihgerät." };
  else if (repair > j.replace * 0.5 || j.age >= 6) rec = { kind:"replace", text:"Ersatz empfehlen: Die Reparatur kostet mehr als die Hälfte des Neupreises, oder das Gerät ist alt." };
  else rec = { kind:"repair", text:"Reparatur lohnt sich: günstig, und das Gerät bleibt noch einige Jahre im Einsatz." };
  return { parts:parts, partSum:partSum, minutes:f.min, labour:labour, repair:repair, replace:j.replace, rec:rec, name:f.name };
}
function wjTick(j){ return j; }

function wjPipeline(j){
  return WJ_STAGES.map(function(name, i){
    var cls = i < j.stage ? "done" : i === j.stage ? "cur" : "todo";
    return '<span class="wj-step ' + cls + '"><b>' + (i < j.stage ? "✓" : i + 1) + '</b>' + esc(name) + '</span>';
  }).join("");
}
function wjStatus(j){
  if (j.stage === 6) return j.status || "Abgeschlossen";
  if (j.decision === "replace" && j.stage === 4) return "Ersatz angeboten";
  if (j.repaired) return "Reparatur fertig";
  return WJ_STAGES[j.stage];
}
function wjNext(j){
  if (j.stage === 0) return '<button class="btn btn-sm" type="button" data-wj="accept" data-id="' + j.id + '">Eingang annehmen</button>';
  if (j.stage === 1) return '<button class="btn btn-sm" type="button" data-wj="backup" data-id="' + j.id + '">' + (j.needsBackup ? "Daten sichern" : "Weiter zur Diagnose") + '</button>' +
      (j.needsBackup ? '<button class="btn btn-g btn-sm" type="button" data-wj="nobackup" data-id="' + j.id + '">Ohne Sicherung weiter</button>' : '');
  if (j.stage === 2) return '<button class="btn btn-sm" type="button" data-wj="diag" data-id="' + j.id + '">Diagnose durchführen</button>';
  if (j.stage === 3) return '<button class="btn btn-sm" type="button" data-wj="quote" data-id="' + j.id + '">Angebot erstellen</button>';
  if (j.stage === 4) return '<button class="btn btn-sm" type="button" data-wj="agree" data-id="' + j.id + '">Kunde stimmt zu</button>' +
      '<button class="btn btn-s btn-sm" type="button" data-wj="refuse" data-id="' + j.id + '">Kunde lehnt ab</button>';
  if (j.stage === 5) {
    if (j.bench) return j.repaired ? '<button class="btn btn-sm" type="button" data-wj="finish" data-id="' + j.id + '">Rückgabe an den Kunden</button>' : '<button class="btn btn-s btn-sm" type="button" data-wj="gotobench">Zur Werkbank</button>';
    if (j.repaired) return '<button class="btn btn-sm" type="button" data-wj="finish" data-id="' + j.id + '">Test bestanden, Rückgabe</button>';
    return '<button class="btn btn-sm" type="button" data-wj="repair" data-id="' + j.id + '">Reparatur starten</button>';
  }
  return "";
}
function wjLoanBtn(j){
  if (j.stage < 4 || j.stage > 5 || j.loaner) return "";
  return '<button class="btn btn-s btn-sm" type="button" data-wj="loan" data-id="' + j.id + '"' + (WJ_LOANERS < 1 ? ' disabled' : '') + '>Leihgerät ausgeben (' + WJ_LOANERS + ' frei)</button>';
}
function renderWjJobs(){
  var open = WJ_JOBS.filter(function(j){ return j.stage < 6; }).length;
  var bench = WJ_JOBS.filter(function(j){ return j.bench; })[0];
  $("#wjKpiOpen").textContent = open;
  $("#wjKpiBench").textContent = bench && bench.stage === 5 ? "belegt" : "frei";
  $("#wjKpiOrders").textContent = WJ_ORDERS.length;
  $("#wjKpiLoan").textContent = WJ_LOANERS;
  $("#wjList").innerHTML = WJ_JOBS.map(function(j){
    var ticket = j.ticket ? '<span class="tag t-acc">' + esc(j.ticket) + '</span>' : '';
    var bk = j.stage === 6 ? '' : (j.needsBackup ? (j.backup ? '<span class="tag t-ok">Daten gesichert</span>' : '<span class="tag t-warn">Keine Sicherung</span>') : '<span class="tag t-mut">Keine Daten</span>');
    var warn = j.stage < 6 && j.needsBackup && !j.backup && j.stage > 1 ? '<div class="note warn" style="margin-top:12px">Ohne Datensicherung kann die Reparatur Kundendaten kosten.</div>' : '';
    var fnd = j.findings.length ? '<div class="wj-find">' + j.findings.map(function(f){ return '<div>' + esc(f) + '</div>'; }).join("") + '</div>' : '';
    var st = j.stage === 6 ? 't-ok' : j.decision === "replace" ? 't-warn' : 't-info';
    return '<article class="wj-card">' +
      '<div class="wj-top"><div style="min-width:0"><div class="eyebrow">' + esc(j.id) + ' · ' + esc(j.owner) + '</div><h3 style="font-size:18px;margin-top:4px">' + esc(j.dev) + '</h3>' +
      '<div class="wj-meta">' + ticket + '<span class="tag t-mut">' + j.age + ' Jahre alt</span>' + (j.warranty ? '<span class="tag t-ok">Garantie</span>' : '<span class="tag t-mut">ohne Garantie</span>') + bk + '</div></div>' +
      '<span class="tag ' + st + '">' + esc(wjStatus(j)) + '</span></div>' +
      '<div class="wj-steps">' + wjPipeline(j) + '</div>' + warn + fnd +
      '<div class="acts wj-acts">' + wjNext(j) + wjLoanBtn(j) + '</div></article>';
  }).join("");
  $("#wjLoaners").innerHTML = '<div class="wj-loan-n num">' + WJ_LOANERS + '<span> frei von 2</span></div><p class="hint">Leihgeräte überbrücken Reparaturen. Eine Ausgabe kostet 40 € Gebühr.</p>' +
    WJ_JOBS.filter(function(j){ return j.loaner; }).map(function(j){ return '<div class="li" style="padding:8px 0"><span>' + esc(j.owner) + '</span><span class="tag t-info">' + esc(j.id) + '</span></div>'; }).join("");
}
function renderWjStock(){
  $("#wjParts").innerHTML = WJ_PARTS.map(function(p){
    var s = wjStock(p.id);
    var low = s < 1;
    return '<tr><td><div style="font-weight:650">' + esc(p.name) + '</div><div class="sub">' + (p.lead ? 'Lieferzeit ' + p.lead + ' Tag' + (p.lead > 1 ? 'e' : '') : 'sofort verfügbar') + '</div></td>' +
      '<td class="num">' + s + '</td><td class="num">' + eur(p.price) + '</td>' +
      '<td><span class="tag ' + (low ? 't-bad' : 't-ok') + '">' + (low ? 'fehlt' : 'verfügbar') + '</span></td>' +
      '<td style="text-align:right;white-space:nowrap"><select class="inp" id="wq-' + p.id + '" style="width:72px;height:34px;display:inline-block" aria-label="Menge">' + [1,2,3,4,5].map(function(n){ return '<option>' + n + '</option>'; }).join("") + '</select> <button class="btn btn-sm" type="button" data-wbuy="' + p.id + '">Bestellen</button></td></tr>';
  }).join("");
  $("#wjOrders").innerHTML = WJ_ORDERS.length ? WJ_ORDERS.map(function(o){
    return '<div class="li" style="padding:10px 0"><span class="main-t"><span style="display:block;font-weight:650">' + o.qty + ' × ' + esc(wjPart(o.part).name) + '</span><span class="sub muted" style="font-size:13px">Ankunft: Tag ' + o.due + '</span></span><span class="tag t-info">unterwegs</span></div>';
  }).join("") : '<p class="hint">Keine offenen Bestellungen.</p>';
}
function renderWjStations(){
  $("#wjStations").innerHTML = WJ_STATIONS.map(function(s){
    var owned = !!WJ_OWNED[s.id];
    return '<article class="wj-card"><div class="wj-top"><div><div class="eyebrow">Ausstattung</div><h3 style="font-size:18px;margin-top:4px">' + esc(s.name) + '</h3></div><span class="tag ' + (owned ? 't-ok' : 't-mut') + '">' + (owned ? 'eingerichtet' : eur(s.price)) + '</span></div>' +
      '<p class="muted" style="margin:10px 0 16px">' + esc(s.desc) + '</p>' +
      '<div class="acts">' + (owned ? '<span class="hint">Eingerichtet</span>' : '<button class="btn btn-sm" type="button" data-wstation="' + s.id + '">Für ' + eur(s.price) + ' kaufen</button>') + '</div></article>';
  }).join("");
}
function renderWorkshopJobs(){
  renderWjJobs(); renderWjStock(); renderWjStations();
}

/* Aktionen */
function wjBenchDone(){
  var j = wjJob("J-101");
  if (!j) return;
  j.repaired = true;
  if (!j.backup) j.risk = true;
  j.findings.push("Werkbank: WLAN/Bluetooth-Modul getauscht, Test bestanden.");
  renderAll();
}
function wjDiag(j){
  var f = WJ_FAULTS[j.fault];
  var full = !!WJ_OWNED.pruef;
  var rows = f.checks.map(function(c){
    var res = c[1] === "ok" ? '<span class="tag t-ok">bestanden</span>' : '<span class="tag t-bad">Fehler</span>';
    return '<div class="li" style="padding:10px 0"><span style="font-weight:600">' + esc(c[0]) + '</span>' + (full ? res : '<span class="tag t-mut">nicht geprüft</span>') + '</div>';
  }).join("");
  openModal({
    title: "Diagnose · " + j.id, sub: j.dev + " · " + j.owner, wide: true,
    body: (full
      ? '<div class="note ok">Prüfstand aktiv: Alle Tests laufen automatisch.</div>'
      : '<div class="note warn">Kein Prüfstand. Du siehst nur die Sichtprüfung. Der Befund bleibt unbestätigt, und ein Fehlbefund kostet Zeit und Geld.</div>') +
      '<div class="card" style="padding:16px 18px">' + rows + '</div>' +
      '<div class="note info">Sichtprüfung: ' + esc(f.hint) + '.</div>',
    actions: '<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Befund übernehmen</button>',
    onAction: function(a, el, close){
      if (a !== "save") return;
      j.findings.push(full ? "Diagnose bestätigt: " + f.checks.filter(function(c){ return c[1] === "fehler"; })[0][0] + " defekt." : "Sichtprüfung: " + f.hint + " (nicht bestätigt).");
      if (!full) j.min += 30;
      j.stage = 3;
      close(); renderAll(); toast("Befund übernommen.", "ok");
    }
  });
}
function wjQuoteModal(j){
  var q = wjQuote(j);
  var lines = q.parts.length ? q.parts.map(function(p){
    var tag = p.stock > 0 ? '<span class="tag t-ok">im Lager</span>' : '<span class="tag t-bad">bestellen, ' + p.lead + ' Tag' + (p.lead === 1 ? '' : 'e') + '</span>';
    return '<div class="li" style="padding:8px 0"><span>' + esc(p.name) + ' ' + tag + '</span><span class="num">' + eur(p.price) + '</span></div>';
  }).join("") : '<p class="hint">Keine Teile nötig.</p>';
  var recTag = q.rec.kind === "repair" ? "t-ok" : q.rec.kind === "rma" ? "t-info" : "t-warn";
  openModal({
    title: "Angebot · " + j.id, sub: q.name + " · " + j.owner, wide: true,
    body: '<div class="grid g2e" style="gap:16px"><div class="card" style="padding:16px 18px"><div class="eyebrow">Reparatur</div>' + lines +
      '<div class="li" style="padding:8px 0"><span>Arbeitszeit ' + q.minutes + ' min à ' + WJ_LABOUR + ' €/h</span><span class="num">' + eur(q.labour) + '</span></div>' +
      '<div class="li" style="padding:12px 0 0;border-bottom:0"><span style="font-weight:800">Summe Reparatur</span><span class="num" style="font-weight:800;font-size:18px">' + (j.warranty ? '0 €' : eur(q.repair)) + '</span></div></div>' +
      '<div class="card" style="padding:16px 18px"><div class="eyebrow">Ersatz</div><div style="font-size:26px;font-weight:800;margin:8px 0" class="num">' + eur(q.replace) + '</div><p class="hint">Neugerät für den Kunden, inklusive Einrichtung.</p></div></div>' +
      '<div class="note ' + (q.rec.kind === "repair" ? "ok" : q.rec.kind === "rma" ? "info" : "warn") + '" style="margin-top:14px"><span class="tag ' + recTag + '" style="margin-right:6px">Empfehlung</span>' + esc(q.rec.text) + '</div>' +
      '<p class="hint" style="margin-top:12px">Die Entscheidung trifft der Kunde. Du legst das Angebot vor, er wählt.</p>',
    actions: '<button class="btn btn-s" type="button" data-close>Schließen</button>' +
      '<button class="btn btn-s" type="button" data-mdact="writeoff">Abschreiben</button>' +
      (j.warranty ? '<button class="btn btn-s" type="button" data-mdact="rma">Herstellergarantie</button>' : '') +
      '<button class="btn btn-s" type="button" data-mdact="replace">Ersatz anbieten</button>' +
      '<button class="btn" type="button" data-mdact="repair">Reparatur anbieten</button>',
    onAction: function(a, el, close){
      if (a === "writeoff") { close(); j.decision = "writeoff"; wjFinish(j); return; }
      close();
      j.decision = a; j.stage = 4;
      j.findings.push("Angebot: " + (a === "repair" ? "Reparatur für " + eur(q.repair) : a === "replace" ? "Ersatz für " + eur(q.replace) : "Herstellergarantie"));
      renderAll(); toast("Angebot gesendet. Warte auf die Entscheidung des Kunden.", "ok");
    }
  });
}
function wjBackupConfirm(j){
  if (!j.needsBackup) { j.stage = 2; renderAll(); return; }
  if (!WJ_OWNED.sich && !wjNas()) { toast("NAS nicht erreichbar: Sicherung fehlgeschlagen. Erst im Serverraum prüfen oder die Datensicherungs-Station kaufen.", "bad"); return; }
  j.backup = true; j.min += 20; j.stage = 2;
  j.findings.push("Daten gesichert" + (WJ_OWNED.sich ? " (Datensicherungs-Station)." : " (NAS)."));
  renderAll(); toast("Daten gesichert.", "ok");
}
function wjFinish(j){
  var q = wjQuote(j);
  var total = j.decision === "replace" ? j.replace : (j.decision === "repair" ? q.repair + j.loanCost : 0);
  if (total > 0) invoices.unshift({ id:"R-" + (2050 + invoices.length), cust:j.owner, desc:(j.decision === "replace" ? "Ersatzgerät: " : "Reparatur: ") + j.dev, amt:total, status:"offen", due:"fällig in 14 Tagen" });
  if (j.risk) tickets.unshift({ id:"T-" + (1200 + tickets.length), title:"Datenverlust nach Reparatur: " + j.dev, cust:j.owner, requester:"Kontakt bei " + j.owner, cat:"Datenwiederherstellung", impact:2, urgency:4, prio:"Hoch", sla:"2 h", slaMin:120, status:"Offen", who:"—", inv:0, log:[], notes:[], resolution:"",
    thread:[{ k:"client", who:"Kontakt bei " + j.owner, text:"Nach der Reparatur fehlen Dateien. Vorher wurde keine Sicherung gemacht.", when:"Gerade eben" }] });
  if (j.loaner) { WJ_LOANERS++; j.loaner = false; }
  j.stage = 6;
  j.status = j.decision === "replace" ? "Ersatz übergeben" : j.decision === "writeoff" ? "Abgeschrieben" : j.decision === "rma" ? "Vom Hersteller zurück" : "Abgeschlossen";
  renderAll();
  toast(j.id + ": " + j.status + (total ? " · Rechnung " + eur(total) : "") + ".", "ok");
}
function wjRepair(j){
  var q = wjQuote(j);
  var missing = q.parts.filter(function(p){ return p.stock < 1; });
  if (missing.length) { toast("Im Lager fehlt: " + missing.map(function(p){ return p.name; }).join(", ") + ". Bestelle im Tab Lager.", "bad"); return; }
  q.parts.forEach(function(p){ wjTake(p.id); });
  j.min += q.minutes;
  j.repaired = true;
  j.findings.push("Reparatur durchgeführt: " + q.name + ".");
  if (j.needsBackup && !j.backup) j.risk = true;
  renderAll(); toast("Reparatur fertig. Jetzt testen und zurückgeben.", "ok");
}
function wjLoan(j){
  if (WJ_LOANERS < 1) { toast("Kein Leihgerät frei.", "bad"); return; }
  if (cash < 40) { toast("Zu wenig Budget für die Leihgebühr.", "bad"); return; }
  cash -= 40; j.loanCost = (j.loanCost || 0) + 40;
  WJ_LOANERS--; j.loaner = true;
  renderAll(); toast("Leihgerät an " + j.owner + " ausgegeben (40 €).", "ok");
}
function orderPart(id, qty){
  var p = wjPart(id);
  var cost = p.price * qty;
  if (cash < cost) { toast("Zu wenig Budget für die Bestellung.", "bad"); return; }
  cash -= cost;
  if (p.lead === 0) { if (id === "wlan") WS.stock += qty; else p.stock += qty; toast(qty + " × " + p.name + " sofort geliefert.", "ok"); }
  else { WJ_ORDERS.push({ part:id, qty:qty, due:day + p.lead }); toast(qty + " × " + p.name + " bestellt. Ankunft in " + p.lead + " Tag" + (p.lead > 1 ? "en" : "") + ".", "ok"); }
  renderAll();
}
function deliverOrders(){
  var arrived = WJ_ORDERS.filter(function(o){ return o.due <= day; });
  WJ_ORDERS = WJ_ORDERS.filter(function(o){ return o.due > day; });
  arrived.forEach(function(o){
    if (o.part === "wlan") WS.stock += o.qty; else wjPart(o.part).stock += o.qty;
    toast("Lieferung eingetroffen: " + o.qty + " × " + wjPart(o.part).name + ".", "ok");
  });
}
function buyStation(id){
  var s = WJ_STATIONS.filter(function(x){ return x.id === id; })[0];
  if (WJ_OWNED[id]) return;
  if (cash < s.price) { toast("Zu wenig Budget für " + s.name + ".", "bad"); return; }
  confirmModal(s.name + " einrichten?", s.desc, "Für " + eur(s.price) + " einrichten", "", function(){
    cash -= s.price; WJ_OWNED[id] = true; renderAll(); toast(s.name + " ist eingerichtet.", "ok");
  });
}

/* Klicks im Werkstatt-Bereich */
(function(){
  var sec = $('[data-screen="werkstatt"]');
  if (!sec) return;
  sec.addEventListener("click", function(e){
    var t = e.target, x;
    if ((x = t.closest("[data-wtab-btn]"))) {
      wjTab = x.getAttribute("data-wtab-btn");
      $$('[data-wtab-btn]').forEach(function(b){ b.setAttribute("aria-pressed", b === x ? "true" : "false"); });
      $$('[data-wtab]').forEach(function(p){ p.hidden = p.getAttribute("data-wtab") !== wjTab; });
      return;
    }
    if ((x = t.closest("[data-wj]"))) {
      var j = wjJob(x.getAttribute("data-id"));
      var a = x.getAttribute("data-wj");
      if (a === "accept") { j.stage = 1; j.findings.push("Eingang angenommen."); renderAll(); }
      else if (a === "backup") wjBackupConfirm(j);
      else if (a === "nobackup") confirmModal("Ohne Datensicherung weitermachen?", "Wenn bei der Reparatur Daten verloren gehen, kommt ein Ticket zurück. Das ist dein Risiko.", "Trotzdem weiter", "btn-d", function(){ j.noAck = true; j.stage = 2; j.findings.push("Ohne Datensicherung weitergearbeitet."); renderAll(); });
      else if (a === "diag") wjDiag(j);
      else if (a === "quote") wjQuoteModal(j);
      else if (a === "agree") { if (j.decision === "replace") { wjFinish(j); } else { j.stage = 5; j.findings.push("Kunde hat zugestimmt."); renderAll(); } }
      else if (a === "refuse") { j.stage = 3; j.decision = null; j.findings.push("Kunde hat abgelehnt."); renderAll(); toast("Kunde lehnt ab. Angebot neu erstellen.", "bad"); }
      else if (a === "repair") wjRepair(j);
      else if (a === "finish") wjFinish(j);
      else if (a === "loan") wjLoan(j);
      else if (a === "gotobench") { location.hash = "werkstatt"; wjTab = "bench"; $$('[data-wtab-btn]').forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-wtab-btn") === "bench" ? "true" : "false"); }); $$('[data-wtab]').forEach(function(p){ p.hidden = p.getAttribute("data-wtab") !== "bench"; }); }
      return;
    }
    if ((x = t.closest("[data-wbuy]"))) {
      var id = x.getAttribute("data-wbuy");
      orderPart(id, +document.getElementById("wq-" + id).value);
      return;
    }
    if ((x = t.closest("[data-wstation]"))) { buyStation(x.getAttribute("data-wstation")); return; }
  });
})();

/* ---------- Active Directory: Daten ---------- */
var AD = {
  domain: "nordlicht.local",
  netbios: "NORDLICHT",
  level: "WinSec-OS Server 2022",
  sidBase: "S-1-5-21-3623811015-3361044348-30300820-",
  ous: [
    { id:"dom",        name:"nordlicht.local",   parent:null,     kind:"domain",    prot:true,  desc:"Domäne" },
    { id:"builtin",    name:"Builtin",           parent:"dom",    kind:"container", prot:true,  desc:"Vordefinierte lokale Gruppen" },
    { id:"users",      name:"Users",             parent:"dom",    kind:"container", prot:true,  desc:"Standardcontainer für Benutzer" },
    { id:"dcs",        name:"Domain Controllers",parent:"dom",    kind:"ou",        prot:true,  desc:"Domänencontroller" },
    { id:"ma",         name:"Mitarbeiter",       parent:"dom",    kind:"ou",        prot:true,  desc:"Eigene Mitarbeitende" },
    { id:"ma-it",      name:"IT",                parent:"ma",     kind:"ou",        prot:true,  desc:"IT-Team" },
    { id:"ma-adm",     name:"Admin-Konten",      parent:"ma-it",  kind:"ou",        prot:true,  desc:"Getrennte Konten für Verwaltungsaufgaben (Tier 0)" },
    { id:"ma-vw",      name:"Verwaltung",        parent:"ma",     kind:"ou",        prot:true,  desc:"Büro und Buchhaltung" },
    { id:"ma-empf",    name:"Empfang",           parent:"ma",     kind:"ou",        prot:true,  desc:"Empfang und Telefon" },
    { id:"kunden",     name:"Kunden",            parent:"dom",    kind:"ou",        prot:true,  desc:"Konten der betreuten Kunden" },
    { id:"k-krumm",    name:"Krumm",             parent:"kunden", kind:"ou",        prot:true,  desc:"Bäckerei Krumm" },
    { id:"k-weidner",  name:"Weidner",           parent:"kunden", kind:"ou",        prot:true,  desc:"Logistik Weidner" },
    { id:"k-hahn",     name:"Hahn",              parent:"kunden", kind:"ou",        prot:true,  desc:"Steuerbüro Hahn" },
    { id:"k-beispiel", name:"Beispiel",          parent:"kunden", kind:"ou",        prot:true,  desc:"Arztpraxis Beispiel" },
    { id:"grp",        name:"Gruppen",           parent:"dom",    kind:"ou",        prot:true,  desc:"Sicherheits- und Verteilergruppen" },
    { id:"comp",       name:"Computer",          parent:"dom",    kind:"ou",        prot:true,  desc:"Arbeitsplätze und Server" },
    { id:"comp-ws",    name:"Arbeitsplätze",     parent:"comp",   kind:"ou",        prot:true,  desc:"Clients" },
    { id:"comp-srv",   name:"Server",            parent:"comp",   kind:"ou",        prot:true,  desc:"Mitgliedsserver" },
    { id:"svc",        name:"Dienstkonten",      parent:"dom",    kind:"ou",        prot:true,  desc:"Konten für Dienste und Programme" },
    { id:"dis",        name:"Deaktiviert",       parent:"dom",    kind:"ou",        prot:true,  desc:"Deaktivierte Konten vor der Löschung" }
  ],
  users: [
    { id:"administrator", first:"", last:"", display:"Administrator", ou:"users", title:"", dept:"", company:"Nordlicht IT Service", mail:"", phone:"", office:"", desc:"Vordefiniertes Konto für die Verwaltung", enabled:true, locked:false, pwdSet:-420, neverExp:true, mustChange:false, lastLogon:-1, created:-1500, failed:0, rid:500, sensitive:true, spn:"", manager:"", profile:"", script:"", home:"" },
    { id:"krbtgt", first:"", last:"", display:"krbtgt", ou:"users", title:"", dept:"", company:"", mail:"", phone:"", office:"", desc:"Dienstkonto für das Schlüsselverteilungscenter", enabled:false, locked:false, pwdSet:-900, neverExp:true, mustChange:false, lastLogon:null, created:-1500, failed:0, rid:502, sensitive:false, spn:"kadmin/changepw", manager:"", profile:"", script:"", home:"" },
    { id:"derrik.w", first:"Derrik", last:"Winchester", display:"Derrik Winchester", ou:"ma-it", title:"Geschäftsführer, IT-Leitung", dept:"IT", company:"Nordlicht IT Service", mail:"derrik@nordlicht.example", phone:"+49 40 1234-10", office:"OG 1", desc:"Alltagskonto", enabled:true, locked:false, pwdSet:-30, neverExp:false, mustChange:false, lastLogon:0, created:-1400, failed:0, rid:1104, sensitive:false, spn:"", manager:"", profile:"", script:"anmelden.cmd", home:"\\\\FS-01\\home\\derrik.w" },
    { id:"adm.derrik", first:"Derrik", last:"Winchester (Admin)", display:"ADM Derrik Winchester", ou:"ma-adm", title:"Verwaltungskonto", dept:"IT", company:"Nordlicht IT Service", mail:"", phone:"", office:"", desc:"Nur für Domänenverwaltung, keine Mails, kein Internet", enabled:true, locked:false, pwdSet:-20, neverExp:false, mustChange:false, lastLogon:-2, created:-600, failed:0, rid:1180, sensitive:true, spn:"", manager:"derrik.w", profile:"", script:"", home:"" },
    { id:"jonas.k", first:"Jonas", last:"Keller", display:"Jonas Keller", ou:"ma-it", title:"Netzwerk-Admin", dept:"IT", company:"Nordlicht IT Service", mail:"jonas@nordlicht.example", phone:"+49 40 1234-12", office:"OG 1", desc:"", enabled:true, locked:false, pwdSet:-61, neverExp:false, mustChange:false, lastLogon:0, created:-900, failed:0, rid:1110, sensitive:false, spn:"", manager:"derrik.w", profile:"", script:"anmelden.cmd", home:"\\\\FS-01\\home\\jonas.k" },
    { id:"ole.b", first:"Ole", last:"Brandt", display:"Ole Brandt", ou:"ma-it", title:"Hardware-Techniker", dept:"IT", company:"Nordlicht IT Service", mail:"ole@nordlicht.example", phone:"+49 40 1234-14", office:"Werkstatt", desc:"Zurzeit krank", enabled:true, locked:false, pwdSet:-75, neverExp:false, mustChange:false, lastLogon:-3, created:-800, failed:0, rid:1112, sensitive:false, spn:"", manager:"derrik.w", profile:"", script:"anmelden.cmd", home:"\\\\FS-01\\home\\ole.b" },
    { id:"mira.s", first:"Mira", last:"Stein", display:"Mira Stein", ou:"ma-vw", title:"Kundenbetreuung", dept:"Service", company:"Nordlicht IT Service", mail:"mira@nordlicht.example", phone:"+49 40 1234-20", office:"EG", desc:"", enabled:true, locked:false, pwdSet:-12, neverExp:false, mustChange:false, lastLogon:0, created:-500, failed:0, rid:1120, sensitive:false, spn:"", manager:"derrik.w", profile:"", script:"anmelden.cmd", home:"\\\\FS-01\\home\\mira.s" },
    { id:"empfang.1", first:"Empfang", last:"Theke", display:"Empfang Theke", ou:"ma-empf", title:"Empfang", dept:"Service", company:"Nordlicht IT Service", mail:"empfang@nordlicht.example", phone:"+49 40 1234-0", office:"EG", desc:"Gemeinsames Konto am Empfang", enabled:true, locked:false, pwdSet:-300, neverExp:true, mustChange:false, lastLogon:0, created:-700, failed:0, rid:1130, sensitive:false, spn:"", manager:"mira.s", profile:"", script:"anmelden.cmd", home:"" },
    { id:"alt.praktikant", first:"Paul", last:"Praktikant", display:"Paul Praktikant", ou:"ma-vw", title:"Praktikant", dept:"Verwaltung", company:"Nordlicht IT Service", mail:"praktikum@nordlicht.example", phone:"", office:"", desc:"Praktikum im Frühjahr", enabled:true, locked:false, pwdSet:-200, neverExp:false, mustChange:false, lastLogon:-182, created:-260, failed:0, rid:1140, sensitive:false, spn:"", manager:"mira.s", profile:"", script:"anmelden.cmd", home:"" },
    { id:"p.krumm", first:"Petra", last:"Krumm", display:"Petra Krumm", ou:"k-krumm", title:"Inhaberin", dept:"", company:"Bäckerei Krumm", mail:"p.krumm@baeckerei-krumm.example", phone:"", office:"", desc:"", enabled:true, locked:false, pwdSet:-40, neverExp:true, mustChange:false, lastLogon:0, created:-380, failed:0, rid:1201, sensitive:false, spn:"", manager:"", profile:"", script:"", home:"" },
    { id:"t.lang", first:"Tobias", last:"Lang", display:"Tobias Lang", ou:"k-weidner", title:"Lagerleitung", dept:"Lager", company:"Logistik Weidner", mail:"t.lang@logistik-weidner.example", phone:"", office:"", desc:"", enabled:true, locked:true, pwdSet:-50, neverExp:false, mustChange:false, lastLogon:-1, created:-420, failed:5, rid:1210, sensitive:false, spn:"", manager:"", profile:"", script:"", home:"" },
    { id:"s.hahn", first:"Sven", last:"Hahn", display:"Sven Hahn", ou:"k-hahn", title:"Steuerberater", dept:"", company:"Steuerbüro Hahn", mail:"s.hahn@steuerbuero-hahn.example", phone:"", office:"", desc:"", enabled:true, locked:false, pwdSet:-96, neverExp:false, mustChange:false, lastLogon:-1, created:-360, failed:1, rid:1220, sensitive:false, spn:"", manager:"", profile:"", script:"", home:"" },
    { id:"hahn.m", first:"Martina", last:"Hahn", display:"Martina Hahn", ou:"k-hahn", title:"Buchhaltung", dept:"", company:"Steuerbüro Hahn", mail:"m.hahn@steuerbuero-hahn.example", phone:"", office:"", desc:"Hat Passwort vergessen (Ticket offen)", enabled:true, locked:false, pwdSet:-70, neverExp:false, mustChange:false, lastLogon:-2, created:-360, failed:3, rid:1221, sensitive:false, spn:"", manager:"s.hahn", profile:"", script:"", home:"" },
    { id:"beispiel.a", first:"Anna", last:"Beispiel", display:"Dr. Anna Beispiel", ou:"k-beispiel", title:"Ärztin", dept:"", company:"Arztpraxis Beispiel", mail:"praxis@beispiel.example", phone:"", office:"", desc:"", enabled:true, locked:true, pwdSet:-30, neverExp:false, mustChange:false, lastLogon:-1, created:-300, failed:5, rid:1230, sensitive:false, spn:"", manager:"", profile:"", script:"", home:"" },
    { id:"svc_backup", first:"", last:"", display:"Dienst Sicherung", ou:"svc", title:"", dept:"", company:"", mail:"", phone:"", office:"", desc:"Sicherungssoftware auf BK-01", enabled:true, locked:false, pwdSet:-1830, neverExp:true, mustChange:false, lastLogon:0, created:-1830, failed:0, rid:1300, sensitive:false, spn:"backup/bk-01.nordlicht.local", manager:"", profile:"", script:"", home:"", gmsa:false },
    { id:"svc_sql", first:"", last:"", display:"Dienst SQL", ou:"svc", title:"", dept:"", company:"", mail:"", phone:"", office:"", desc:"Datenbank der Warenwirtschaft", enabled:true, locked:false, pwdSet:-120, neverExp:true, mustChange:false, lastLogon:0, created:-900, failed:0, rid:1301, sensitive:false, spn:"MSSQLSvc/fs-01.nordlicht.local:1433", manager:"", profile:"", script:"", home:"", gmsa:false }
  ],
  groups: [
    { id:"g-admins",   name:"Administratoren",            ou:"builtin", scope:"Domänenlokal", type:"Sicherheit", desc:"Volle Rechte auf Domänencontrollern", members:["g-da","g-ea","administrator"], rid:544, prot:true, builtin:true },
    { id:"g-rdp",      name:"Remotedesktopbenutzer",      ou:"builtin", scope:"Domänenlokal", type:"Sicherheit", desc:"Darf sich per RDP anmelden", members:["g-it"], rid:555, prot:false, builtin:true },
    { id:"g-backupop", name:"Sicherungs-Operatoren",      ou:"builtin", scope:"Domänenlokal", type:"Sicherheit", desc:"Darf Dateien sichern und wiederherstellen", members:["svc_backup"], rid:551, prot:true, builtin:true },
    { id:"g-da",       name:"Domänen-Admins",             ou:"users",   scope:"Global",       type:"Sicherheit", desc:"Verwaltung der Domäne. Soll: höchstens 2 Mitglieder.", members:["administrator","adm.derrik","derrik.w","jonas.k","empfang.1"], rid:512, prot:true, builtin:true },
    { id:"g-ea",       name:"Organisations-Admins",       ou:"users",   scope:"Universal",    type:"Sicherheit", desc:"Verwaltung der Gesamtstruktur", members:["administrator"], rid:519, prot:true, builtin:true },
    { id:"g-sa",       name:"Schema-Admins",              ou:"users",   scope:"Universal",    type:"Sicherheit", desc:"Darf das Schema ändern. Im Alltag leer lassen.", members:["administrator"], rid:518, prot:true, builtin:true },
    { id:"g-du",       name:"Domänen-Benutzer",           ou:"users",   scope:"Global",       type:"Sicherheit", desc:"Alle Benutzerkonten der Domäne", members:[], rid:513, prot:false, builtin:true, implicit:true },
    { id:"g-pu",       name:"Protected Users",            ou:"users",   scope:"Global",       type:"Sicherheit", desc:"Zusätzlicher Schutz für Admin-Konten (kein NTLM, kurze Tickets)", members:[], rid:525, prot:true, builtin:true },
    { id:"g-it",       name:"GG_IT",                      ou:"grp",     scope:"Global",       type:"Sicherheit", desc:"Alle IT-Mitarbeitenden", members:["derrik.w","jonas.k","ole.b"], rid:1400, prot:false },
    { id:"g-helpdesk", name:"GG_Helpdesk",                ou:"grp",     scope:"Global",       type:"Sicherheit", desc:"Darf Kennwörter von Kunden zurücksetzen", members:["mira.s","jonas.k"], rid:1401, prot:false },
    { id:"g-hahn",     name:"GG_Buchhaltung_Hahn",        ou:"grp",     scope:"Global",       type:"Sicherheit", desc:"Mitarbeitende im Steuerbüro Hahn", members:["s.hahn","hahn.m"], rid:1402, prot:false },
    { id:"g-weidner",  name:"GG_Lager_Weidner",           ou:"grp",     scope:"Global",       type:"Sicherheit", desc:"Lagerteam Weidner", members:["t.lang"], rid:1403, prot:false },
    { id:"g-dl-buch",  name:"DL_Freigabe_Buchhaltung_RW", ou:"grp",     scope:"Domänenlokal", type:"Sicherheit", desc:"Lesen und Schreiben auf \\\\FS-01\\Buchhaltung", members:["g-hahn"], rid:1410, prot:false },
    { id:"g-dl-lager", name:"DL_Freigabe_Lager_R",        ou:"grp",     scope:"Domänenlokal", type:"Sicherheit", desc:"Lesen auf \\\\FS-01\\Lager", members:["g-weidner"], rid:1411, prot:false },
    { id:"g-all",      name:"Verteiler_Alle",             ou:"grp",     scope:"Universal",    type:"Verteiler",  desc:"Rundmail an alle Mitarbeitenden", members:["derrik.w","jonas.k","ole.b","mira.s","empfang.1"], rid:1420, prot:false }
  ],
  computers: [
    { id:"c-dc01",   name:"DC-01",      ou:"dcs",     os:"WinSec-OS Server 2022", ip:"10.0.1.10", role:"Domänencontroller", site:"Hauptstandort", enabled:true, lastLogon:0,    rid:1000 },
    { id:"c-dc02",   name:"DC-02",      ou:"dcs",     os:"WinSec-OS Server 2022", ip:"10.0.3.10", role:"Domänencontroller", site:"Ausweichstandort", enabled:true, lastLogon:-3, rid:1001 },
    { id:"c-fs01",   name:"FS-01",      ou:"comp-srv",os:"WinSec-OS Server 2022", ip:"10.0.1.20", role:"Dateiserver",       site:"Hauptstandort", enabled:true, lastLogon:0,    rid:1050 },
    { id:"c-bk01",   name:"BK-01",      ou:"comp-srv",os:"Linux 24.04 (Mitglied)", ip:"10.0.1.21", role:"Sicherung",       site:"Hauptstandort", enabled:true, lastLogon:0,    rid:1051 },
    { id:"c-empf",   name:"WS-EMPF-01", ou:"comp-ws", os:"WinSec-OS 11",          ip:"10.0.1.101",role:"Arbeitsplatz",      site:"Hauptstandort", enabled:true, lastLogon:0,    rid:1060 },
    { id:"c-it01",   name:"WS-IT-01",   ou:"comp-ws", os:"WinSec-OS 11",          ip:"10.0.1.110",role:"Arbeitsplatz",      site:"Hauptstandort", enabled:true, lastLogon:0,    rid:1061 },
    { id:"c-hahn",   name:"NB-HAHN-01", ou:"comp-ws", os:"WinSec-OS 11",          ip:"10.0.1.55", role:"Notebook (in Reparatur)", site:"Hauptstandort", enabled:true, lastLogon:-2, rid:1062 },
    { id:"c-lager",  name:"WS-LAGER-03",ou:"comp-ws", os:"WinSec-OS 11",          ip:"10.0.2.33", role:"Arbeitsplatz",      site:"Lager", enabled:true, lastLogon:-1,   rid:1063 },
    { id:"c-alt",    name:"WS-ALT-07",  ou:"comp-ws", os:"WinSec-OS 10",          ip:"10.0.1.77", role:"Arbeitsplatz",      site:"Hauptstandort", enabled:true, lastLogon:-210, rid:1064 }
  ],
  pwPolicy: { minLen:8, complex:true, maxAge:90, history:12, lockThreshold:5, lockDuration:30 },
  pso: { name:"PSO_Admins", appliesTo:"g-da", minLen:15, complex:true, maxAge:60, lockThreshold:3, lockDuration:60, prec:10 },
  gpos: [
    { id:"gpo-ddp", name:"Default Domain Policy", status:"aktiviert", desc:"Kennwort- und Sperrrichtlinie der Domäne",
      links:[{ ou:"dom", enforced:false, enabled:true }], settings:[] },
    { id:"gpo-ddcp", name:"Default Domain Controllers Policy", status:"aktiviert", desc:"Rechte auf Domänencontrollern",
      links:[{ ou:"dcs", enforced:false, enabled:true }],
      settings:[{ s:"Computer", c:"Benutzerrechte", k:"Lokal anmelden zulassen", v:"Administratoren" }, { s:"Computer", c:"Überwachung", k:"Anmeldeereignisse überwachen", v:"Erfolg und Fehler" }] },
    { id:"gpo-lock", name:"GPO_Mitarbeiter_Bildschirmsperre", status:"aktiviert", desc:"Sperrt verlassene Arbeitsplätze",
      links:[{ ou:"ma", enforced:false, enabled:true }],
      settings:[{ s:"Benutzer", c:"Bildschirm", k:"Bildschirmschoner mit Kennwortschutz", v:"Ein" }, { s:"Benutzer", c:"Bildschirm", k:"Sperre nach", v:"10 Minuten" }] },
    { id:"gpo-drive", name:"GPO_Laufwerke_Kunden", status:"aktiviert", desc:"Netzlaufwerke für Kundenkonten",
      links:[{ ou:"kunden", enforced:false, enabled:true }],
      settings:[{ s:"Benutzer", c:"Laufwerke", k:"Laufwerk S:", v:"\\\\FS-01\\Kunden" }, { s:"Benutzer", c:"Bildschirm", k:"Sperre nach", v:"15 Minuten" }] },
    { id:"gpo-upd", name:"GPO_Update_Fenster", status:"aktiviert", desc:"Wann Updates installiert werden",
      links:[{ ou:"comp", enforced:false, enabled:true }],
      settings:[{ s:"Computer", c:"Updates", k:"Automatische Installation", v:"Dienstag, 22:00" }, { s:"Computer", c:"Updates", k:"Neustart erzwingen", v:"Aus" }] },
    { id:"gpo-fw", name:"GPO_Firewall_Server", status:"aktiviert", desc:"Firewall-Regeln für Server",
      links:[{ ou:"comp-srv", enforced:true, enabled:true }],
      settings:[{ s:"Computer", c:"Firewall", k:"Eingehend RDP (3389)", v:"nur aus 10.0.1.0/24" }, { s:"Computer", c:"Firewall", k:"Profil Domäne", v:"Ein" }] },
    { id:"gpo-usb", name:"GPO_USB_Sperre", status:"aktiviert", desc:"Sperrt USB-Speicher. Noch nirgends verknüpft.",
      links:[], settings:[{ s:"Computer", c:"Geräte", k:"Wechseldatenträger", v:"Lesen und Schreiben verweigert" }] }
  ],
  delegations: [
    { ou:"kunden", to:"g-helpdesk", rights:"Kennwörter zurücksetzen, Konten entsperren" },
    { ou:"ma", to:"g-it", rights:"Benutzer erstellen, ändern und löschen" }
  ],
  sites: [
    { name:"Hauptstandort", subnet:"10.0.1.0/24", dcs:["DC-01"], gc:true },
    { name:"Lager", subnet:"10.0.2.0/24", dcs:[], gc:false },
    { name:"Ausweichstandort", subnet:"10.0.3.0/24", dcs:["DC-02"], gc:true }
  ],
  siteLinks: [
    { name:"Haupt–Ausweich", sites:"Hauptstandort, Ausweichstandort", cost:100, interval:15 },
    { name:"Haupt–Lager", sites:"Hauptstandort, Lager", cost:200, interval:60 }
  ],
  repl: [
    { from:"DC-01", to:"DC-02", ctx:"DC=nordlicht,DC=local", last:-3, ok:false, err:"8524: Die DNS-Suche nach DC-02 ist fehlgeschlagen." },
    { from:"DC-02", to:"DC-01", ctx:"DC=nordlicht,DC=local", last:-3, ok:false, err:"8524: Die DNS-Suche nach DC-01 ist fehlgeschlagen." },
    { from:"DC-01", to:"DC-02", ctx:"CN=Configuration", last:-3, ok:false, err:"8524: Die DNS-Suche nach DC-02 ist fehlgeschlagen." }
  ],
  fsmo: { "Schemamaster":"DC-01", "Domänennamenmaster":"DC-01", "RID-Master":"DC-01", "PDC-Emulator":"DC-01", "Infrastrukturmaster":"DC-01" },
  dns: [
    { id:"r1", name:"dc-01", type:"A", value:"10.0.1.10", stamp:"statisch" },
    { id:"r2", name:"dc-02", type:"A", value:"10.0.9.10", stamp:"statisch" },
    { id:"r3", name:"fs-01", type:"A", value:"10.0.1.20", stamp:"statisch" },
    { id:"r4", name:"bk-01", type:"A", value:"10.0.1.21", stamp:"statisch" },
    { id:"r5", name:"intranet", type:"CNAME", value:"fs-01.nordlicht.local", stamp:"statisch" },
    { id:"r6", name:"_ldap._tcp", type:"SRV", value:"0 100 389 dc-01.nordlicht.local", stamp:"statisch" },
    { id:"r7", name:"_ldap._tcp", type:"SRV", value:"0 100 389 dc-02.nordlicht.local", stamp:"statisch" },
    { id:"r8", name:"_kerberos._tcp", type:"SRV", value:"0 100 88 dc-01.nordlicht.local", stamp:"statisch" },
    { id:"r9", name:"ws-empf-01", type:"A", value:"10.0.1.101", stamp:"vor 1 Tag" },
    { id:"r10", name:"nb-hahn-01", type:"A", value:"10.0.1.55", stamp:"vor 2 Tagen" },
    { id:"r11", name:"ws-alt-07", type:"A", value:"10.0.1.77", stamp:"vor 210 Tagen", stale:true },
    { id:"r12", name:"ws-lager-03", type:"A", value:"10.0.2.33", stamp:"vor 1 Tag" }
  ],
  deleted: [
    { kind:"user", obj:{ id:"m.alt", first:"Mia", last:"Alt", display:"Mia Alt", ou:"ma-vw", title:"Buchhaltung (ausgeschieden)", dept:"Verwaltung", company:"Nordlicht IT Service", mail:"", phone:"", office:"", desc:"Ausgeschieden", enabled:false, locked:false, pwdSet:-400, neverExp:false, mustChange:false, lastLogon:-120, created:-1100, failed:0, rid:1150, sensitive:false, spn:"", manager:"", profile:"", script:"", home:"" }, when:-3, from:"ma-vw" }
  ],
  events: [
    { d:-12, t:"09:14", id:4728, txt:"Mitglied zu Domänen-Admins hinzugefügt: empfang.1 (durch jonas.k)" },
    { d:-3,  t:"03:00", id:1925, txt:"Replikation DC-01 → DC-02 fehlgeschlagen (8524)" },
    { d:-1,  t:"07:58", id:4625, txt:"Fehlgeschlagene Anmeldung: t.lang (5×, WS-LAGER-03)" },
    { d:-1,  t:"07:59", id:4740, txt:"Konto gesperrt: t.lang" },
    { d:-1,  t:"08:30", id:4625, txt:"Fehlgeschlagene Anmeldung: beispiel.a (5×)" },
    { d:-1,  t:"08:31", id:4740, txt:"Konto gesperrt: beispiel.a" },
    { d:0,   t:"08:02", id:4624, txt:"Anmeldung: derrik.w an WS-IT-01" }
  ],
  daAllowed: ["administrator", "adm.derrik"]
};
var adState = { tab:"aduc", node:"ma-it", sel:null, ptab:"general", open:{ dom:true, ma:true, kunden:true, comp:true, "ma-it":true }, grpSel:"g-da", gpoSel:"gpo-ddp", rsop:"derrik.w", search:"" };

/* ---------- Active Directory: Logik ---------- */
function adOu(id){ return AD.ous.filter(function(o){ return o.id === id; })[0]; }
function adUser(id){ return AD.users.filter(function(u){ return u.id === id; })[0]; }
function adGroup(id){ return AD.groups.filter(function(g){ return g.id === id; })[0]; }
function adComp(id){ return AD.computers.filter(function(c){ return c.id === id; })[0]; }
function adObj(id){ return adUser(id) || adGroup(id) || adComp(id); }
function adKind(id){ return adUser(id) ? "user" : adGroup(id) ? "group" : adComp(id) ? "computer" : null; }
function adName(id){
  var o = adObj(id);
  if (!o) return id;
  return o.display || o.name;
}
function adAge(v){ return v === null || v === undefined ? null : day - (day + v) === 0 ? 0 : -v; }
function adAgeText(v){
  if (v === null || v === undefined) return "nie";
  var a = -v;
  return a === 0 ? "heute" : a === 1 ? "gestern" : "vor " + a + " Tagen";
}
function adChildren(id){ return AD.ous.filter(function(o){ return o.parent === id; }); }
function adPath(id){
  var p = [], o = adOu(id);
  while (o) { p.unshift(o); o = o.parent ? adOu(o.parent) : null; }
  return p;
}
function adDn(ouId, cn){
  var parts = [];
  if (cn) parts.push("CN=" + cn);
  adPath(ouId).slice().reverse().forEach(function(o){
    if (o.kind === "domain") return;
    parts.push((o.kind === "container" ? "CN=" : "OU=") + o.name);
  });
  parts.push("DC=nordlicht", "DC=local");
  return parts.join(",");
}
function adObjectsIn(ou){
  return {
    ous: adChildren(ou),
    users: AD.users.filter(function(u){ return u.ou === ou; }),
    groups: AD.groups.filter(function(g){ return g.ou === ou; }),
    computers: AD.computers.filter(function(c){ return c.ou === ou; })
  };
}
function adCount(ou){
  var o = adObjectsIn(ou);
  return o.users.length + o.groups.length + o.computers.length;
}

/* Mitgliedschaften */
function adDirectGroups(id){ return AD.groups.filter(function(g){ return g.members.indexOf(id) >= 0 || (g.implicit && adUser(id)); }); }
function adAllGroups(id){
  var seen = {}, out = [];
  (function walk(x, via){
    adDirectGroups(x).forEach(function(g){
      if (seen[g.id]) return;
      seen[g.id] = true;
      out.push({ g:g, via:via });
      walk(g.id, g.name);
    });
  })(id, null);
  return out;
}
function adEffectiveMembers(gid){
  var seen = {}, out = [];
  (function walk(g, via){
    g.members.forEach(function(m){
      var sub = adGroup(m);
      if (sub) { if (!seen[m]) { seen[m] = true; walk(sub, sub.name); } }
      else if (!seen[m]) { seen[m] = true; out.push({ id:m, via:via }); }
    });
  })(adGroup(gid), null);
  return out;
}
function adIsPrivileged(id){ return adAllGroups(id).some(function(x){ return ["g-da","g-ea","g-sa","g-admins"].indexOf(x.g.id) >= 0; }); }

/* Kennwortrichtlinie */
function adPolicyFor(uid){
  var inPso = adAllGroups(uid).some(function(x){ return x.g.id === AD.pso.appliesTo; });
  if (inPso) return { name:AD.pso.name + " (feinkörnig)", minLen:AD.pso.minLen, complex:AD.pso.complex, maxAge:AD.pso.maxAge, lockThreshold:AD.pso.lockThreshold };
  var p = AD.pwPolicy;
  return { name:"Default Domain Policy", minLen:p.minLen, complex:p.complex, maxAge:p.maxAge, lockThreshold:p.lockThreshold };
}
function adCheckPw(uid, pw){
  var pol = adPolicyFor(uid), errs = [];
  if (pw.length < pol.minLen) errs.push("mindestens " + pol.minLen + " Zeichen");
  if (pol.complex) {
    var cats = [/[a-zäöüß]/.test(pw), /[A-ZÄÖÜ]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9äöüÄÖÜß]/.test(pw)].filter(Boolean).length;
    if (cats < 3) errs.push("drei von vier Zeichenarten (klein, groß, Ziffer, Sonderzeichen)");
    if (pw.toLowerCase().indexOf(uid.split(".")[0].toLowerCase()) >= 0) errs.push("darf den Anmeldenamen nicht enthalten");
  }
  return { ok:errs.length === 0, errs:errs, pol:pol };
}
function adPwExpired(u){ if (u.neverExp || !u.enabled) return false; return -u.pwdSet > adPolicyFor(u.id).maxAge; }
function adUserStatus(u){
  if (!u.enabled) return ["deaktiviert", "t-mut"];
  if (u.locked) return ["gesperrt", "t-bad"];
  if (u.mustChange) return ["Kennwortwechsel nötig", "t-warn"];
  if (adPwExpired(u)) return ["Kennwort abgelaufen", "t-warn"];
  return ["aktiv", "t-ok"];
}
function adUac(u){
  var v = 512;
  if (!u.enabled) v += 2;
  if (u.neverExp) v += 65536;
  if (u.sensitive) v += 1048576;
  return v;
}

/* Gruppenrichtlinien: resultierende Richtlinie */
function adGpoSettings(g){
  if (g.id === "gpo-ddp") {
    var p = AD.pwPolicy;
    return [
      { s:"Computer", c:"Kennwortrichtlinie", k:"Minimale Kennwortlänge", v:p.minLen + " Zeichen" },
      { s:"Computer", c:"Kennwortrichtlinie", k:"Komplexitätsanforderungen", v:p.complex ? "Aktiviert" : "Deaktiviert" },
      { s:"Computer", c:"Kennwortrichtlinie", k:"Maximales Kennwortalter", v:p.maxAge + " Tage" },
      { s:"Computer", c:"Kennwortrichtlinie", k:"Kennwortchronik", v:p.history + " Kennwörter" },
      { s:"Computer", c:"Kontosperrung", k:"Sperrschwelle", v:p.lockThreshold + " Fehlversuche" },
      { s:"Computer", c:"Kontosperrung", k:"Sperrdauer", v:p.lockDuration + " Minuten" }
    ];
  }
  return g.settings;
}
function adRsop(uid){
  var u = adUser(uid);
  if (!u) return { gpos:[], settings:[] };
  var path = adPath(u.ou).map(function(o){ return o.id; });
  var applied = [];
  path.forEach(function(ouId, depth){
    AD.gpos.forEach(function(g){
      g.links.forEach(function(l){
        if (l.ou === ouId && l.enabled && g.status === "aktiviert") applied.push({ g:g, ou:ouId, enforced:l.enforced, depth:depth });
      });
    });
  });
  // Reihenfolge: normal von oben nach unten, erzwungene zuletzt (und von unten nach oben, damit die oberste gewinnt)
  var normal = applied.filter(function(a){ return !a.enforced; });
  var enf = applied.filter(function(a){ return a.enforced; }).reverse();
  var order = normal.concat(enf);
  var win = {};
  order.forEach(function(a){
    adGpoSettings(a.g).forEach(function(st){
      win[st.s + "|" + st.c + "|" + st.k] = { s:st.s, c:st.c, k:st.k, v:st.v, src:a.g.name, enforced:a.enforced };
    });
  });
  return { gpos:order, settings:Object.keys(win).map(function(k){ return win[k]; }) };
}

/* Replikation, DNS */
function adDnsOk(){
  var r = AD.dns.filter(function(x){ return x.name === "dc-02" && x.type === "A"; })[0];
  var r1 = AD.dns.filter(function(x){ return x.name === "dc-01" && x.type === "A"; })[0];
  return !!r && r.value === "10.0.3.10" && !!r1 && r1.value === "10.0.1.10";
}
function adReplOk(){ return AD.repl.every(function(r){ return r.ok; }); }
function adLog(id, txt){
  var hh = String(Math.floor(minutes / 60)).padStart(2, "0"), mm = String(minutes % 60).padStart(2, "0");
  AD.events.push({ d:0, t:hh + ":" + mm, id:id, txt:txt });
}

/* Sicherheitsbefunde (aus den Daten berechnet) */
function adFindings(){
  var f = [];
  var da = adGroup("g-da");
  da.members.forEach(function(m){
    if (AD.daAllowed.indexOf(m) < 0) f.push({ sev:"hoch", key:"da-" + m, title:adName(m) + " ist Mitglied der Domänen-Admins", detail:m === "derrik.w" ? "Alltagskonto mit Mail und Internet. Für Verwaltung gibt es adm.derrik." : m === "empfang.1" ? "Gemeinsames Konto am Empfang. Ein Phishing-Klick dort gibt die ganze Domäne frei." : "Braucht für die tägliche Arbeit keine Domänenrechte.", fix:"Aus Domänen-Admins entfernen", act:"rmda", arg:m });
  });
  var k = adUser("krbtgt");
  if (k && -k.pwdSet > 180) f.push({ sev:"hoch", key:"krbtgt", title:"krbtgt-Kennwort ist " + (-k.pwdSet) + " Tage alt", detail:"Gestohlene Kerberos-Tickets bleiben gültig, solange das Kennwort gleich bleibt. Empfehlung: zweimal zurücksetzen, mit Abstand.", fix:"krbtgt zurücksetzen", act:"krbtgt", arg:"" });
  AD.users.forEach(function(u){
    if (u.spn && u.enabled && u.neverExp && -u.pwdSet > 365 && !u.gmsa) f.push({ sev:"hoch", key:"spn-" + u.id, title:u.id + ": Dienstkonto mit altem Kennwort und SPN", detail:"Kennwort " + (-u.pwdSet) + " Tage alt, läuft nie ab. Solche Konten lassen sich offline knacken (Kerberoasting).", fix:"Als verwaltetes Dienstkonto (gMSA) umstellen", act:"gmsa", arg:u.id });
    if (u.enabled && u.lastLogon !== null && -u.lastLogon > 90 && u.id !== "krbtgt") f.push({ sev:"mittel", key:"stale-" + u.id, title:u.display + ": seit " + (-u.lastLogon) + " Tagen nicht angemeldet", detail:"Verwaiste Konten sind ein Einfallstor.", fix:"Deaktivieren und verschieben", act:"stale", arg:u.id });
    if (u.enabled && u.neverExp && !u.spn && u.id !== "administrator" && u.ou.indexOf("k-") !== 0 && u.id !== "empfang.1") {}
  });
  var adm = adUser("administrator");
  if (adm && -adm.pwdSet > 365) f.push({ sev:"mittel", key:"admpw", title:"Kennwort des Administrators ist " + (-adm.pwdSet) + " Tage alt", detail:"Das vordefinierte Konto sollte selten genutzt und regelmäßig neu gesetzt werden.", fix:"Kennwort zurücksetzen", act:"pw", arg:"administrator" });
  var emp = adUser("empfang.1");
  if (emp && emp.neverExp) f.push({ sev:"niedrig", key:"empneverexp", title:"Empfang Theke: Kennwort läuft nie ab", detail:"Gemeinsame Konten mit Dauerkennwort werden selten geändert.", fix:"Ablauf wieder einschalten", act:"exp", arg:"empfang.1" });
  AD.computers.forEach(function(c){
    if (c.enabled && -c.lastLogon > 90) f.push({ sev:"mittel", key:"stalec-" + c.id, title:c.name + ": seit " + (-c.lastLogon) + " Tagen nicht gemeldet", detail:"Alte Computerkonten verwirren die Inventur und bleiben ungepatcht.", fix:"Computerkonto deaktivieren", act:"stalec", arg:c.id });
  });
  AD.gpos.forEach(function(g){ if (!g.links.length) f.push({ sev:"niedrig", key:"unl-" + g.id, title:g.name + " ist nirgends verknüpft", detail:"Die Richtlinie wirkt nicht. Entweder verknüpfen oder löschen.", fix:"Zur Gruppenrichtlinie", act:"gogpo", arg:g.id }); });
  if (!adReplOk()) f.push({ sev:"hoch", key:"repl", title:"Replikation zwischen DC-01 und DC-02 schlägt fehl", detail:"Änderungen erreichen den zweiten Domänencontroller nicht. Fehler 8524 deutet auf DNS.", fix:"Zu Standorten und Replikation", act:"gorepl", arg:"" });
  if (!adGroup("g-pu").members.some(function(m){ return m === "adm.derrik"; })) f.push({ sev:"niedrig", key:"pu", title:"Admin-Konto nicht in Protected Users", detail:"adm.derrik würde von zusätzlichem Schutz profitieren.", fix:"adm.derrik hinzufügen", act:"pu", arg:"adm.derrik" });
  return f;
}
function adScore(){
  var w = { hoch:8, mittel:4, niedrig:2 };
  return Math.max(0, 100 - adFindings().reduce(function(a, x){ return a + w[x.sev]; }, 0));
}

/* Aktionen */
function adSetMember(gid, id, add){
  var g = adGroup(gid);
  if (!g) return;
  var i = g.members.indexOf(id);
  if (add && i < 0) { g.members.push(id); adLog(gid === "g-da" ? 4728 : 4732, "Mitglied zu " + g.name + " hinzugefügt: " + id + " (durch Derrik)"); }
  if (!add && i >= 0) { g.members.splice(i, 1); adLog(4729, "Mitglied aus " + g.name + " entfernt: " + id + " (durch Derrik)"); }
}
function adFix(act, arg){
  if (act === "rmda") { adSetMember("g-da", arg, false); toast(adName(arg) + " aus Domänen-Admins entfernt.", "ok"); }
  else if (act === "krbtgt") {
    confirmModal("krbtgt-Kennwort zurücksetzen?", "Empfehlung: jetzt einmal, nach der nächsten Replikation ein zweites Mal. Sitzungen laufen danach neu an.", "Zurücksetzen", "", function(){
      adUser("krbtgt").pwdSet = 0; adLog(4724, "Kennwort zurückgesetzt: krbtgt"); renderAD(); toast("krbtgt zurückgesetzt. Zweiten Reset nach der Replikation einplanen.", "ok");
    }); return;
  }
  else if (act === "gmsa") { var u = adUser(arg); u.gmsa = true; u.pwdSet = 0; adLog(4724, "Dienstkonto auf gMSA umgestellt: " + arg); toast(arg + " nutzt jetzt ein verwaltetes Kennwort (alle 30 Tage automatisch).", "ok"); }
  else if (act === "stale") { var su = adUser(arg); su.enabled = false; su.ou = "dis"; adLog(4725, "Konto deaktiviert und verschoben: " + arg); toast(su.display + " deaktiviert und nach „Deaktiviert“ verschoben.", "ok"); }
  else if (act === "stalec") { var c = adComp(arg); c.enabled = false; adLog(4743, "Computerkonto deaktiviert: " + c.name); toast(c.name + " deaktiviert.", "ok"); }
  else if (act === "pw") { adResetPw(arg); return; }
  else if (act === "exp") { adUser(arg).neverExp = false; toast("Kennwortablauf für " + arg + " eingeschaltet.", "ok"); }
  else if (act === "gogpo") { adState.tab = "gpo"; adState.gpoSel = arg; }
  else if (act === "gorepl") { adState.tab = "sites"; }
  else if (act === "pu") { adSetMember("g-pu", arg, true); toast(arg + " ist jetzt in Protected Users.", "ok"); }
  renderAD();
}
function adOuOptions(sel, onlyOu){
  var out = [];
  (function walk(id, depth){
    var o = adOu(id);
    if (!onlyOu || o.kind !== "container" || true) out.push('<option value="' + o.id + '"' + (o.id === sel ? ' selected' : '') + '>' + "  ".repeat(depth).replace(/ /g, "  ") + esc(o.name) + '</option>');
    adChildren(id).forEach(function(c){ walk(c.id, depth + 1); });
  })("dom", 0);
  return out.join("");
}
function adResetPw(uid){
  var u = adUser(uid);
  var pol = adPolicyFor(uid);
  openModal({
    title:"Kennwort zurücksetzen", sub:u.display + " (" + AD.netbios + "\\" + u.id + ")",
    body: field("adPw1", "Neues Kennwort", '<input class="inp" id="adPw1" type="password" autocomplete="new-password">', null, "Richtlinie: " + pol.name + " · mindestens " + pol.minLen + " Zeichen" + (pol.complex ? ", komplex" : "")) +
      field("adPw2", "Kennwort bestätigen", '<input class="inp" id="adPw2" type="password" autocomplete="new-password">') +
      '<label class="check"><input type="checkbox" id="adPwMust" checked> Benutzer muss das Kennwort bei der nächsten Anmeldung ändern</label>' +
      (u.locked ? '<label class="check"><input type="checkbox" id="adPwUnlock" checked> Konto entsperren (gesperrt nach ' + u.failed + ' Fehlversuchen)</label>' : '') +
      '<div class="note info" id="adPwHint">Tipp: drei zufällige Wörter mit Ziffer, zum Beispiel „Kaffee-Brücke-47“.</div>',
    actions:'<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Zurücksetzen</button>',
    onAction:function(a, el, close){
      if (a !== "save") return;
      var p1 = $("#adPw1", el).value, p2 = $("#adPw2", el).value;
      var chk = adCheckPw(uid, p1);
      $("#adPw1Err", el).textContent = chk.ok ? "" : "Erfüllt die Richtlinie nicht: " + chk.errs.join("; ") + ".";
      $("#adPw2Err", el).textContent = p1 === p2 ? "" : "Die Kennwörter stimmen nicht überein.";
      if (!chk.ok || p1 !== p2) return;
      u.pwdSet = 0; u.mustChange = $("#adPwMust", el).checked; u.failed = 0;
      var unl = $("#adPwUnlock", el);
      if (unl && unl.checked) { u.locked = false; adLog(4767, "Konto entsperrt: " + uid); }
      adLog(4724, "Kennwort zurückgesetzt: " + uid + " (durch Derrik)");
      close(); renderAD(); toast("Kennwort für " + u.display + " gesetzt.", "ok");
    }
  });
}
function adNewUser(){
  var ou = adOu(adState.node) && adOu(adState.node).kind !== "domain" ? adState.node : "ma";
  openModal({
    title:"Neuer Benutzer", sub:"Wird erstellt in: " + adDn(ou), wide:true,
    body:'<div class="grid g2e" style="gap:14px">' + field("anFirst", "Vorname", '<input class="inp" id="anFirst">') + field("anLast", "Nachname", '<input class="inp" id="anLast">') + '</div>' +
      '<div class="grid g2e" style="gap:14px">' + field("anSam", "Anmeldename", '<input class="inp" id="anSam" placeholder="vorname.n">', null, "Wird zu " + AD.netbios + "\\name und name@" + AD.domain) + field("anOu", "Organisationseinheit", '<select class="inp" id="anOu">' + adOuOptions(ou) + '</select>') + '</div>' +
      '<div class="grid g2e" style="gap:14px">' + field("anTitle", "Position", '<input class="inp" id="anTitle">') + field("anTpl", "Vorlage (Gruppen übernehmen)", '<select class="inp" id="anTpl"><option value="">keine</option><option value="mira.s">Kundenbetreuung (wie Mira Stein)</option><option value="jonas.k">IT (wie Jonas Keller)</option><option value="hahn.m">Kunde Hahn (wie Martina Hahn)</option></select>') + '</div>' +
      '<div class="grid g2e" style="gap:14px">' + field("anPw", "Startkennwort", '<input class="inp" id="anPw" type="password" autocomplete="new-password">') + '<div class="field"><span class="lbl">Optionen</span><label class="check"><input type="checkbox" id="anMust" checked> Kennwort bei erster Anmeldung ändern</label><label class="check"><input type="checkbox" id="anDis"> Konto deaktiviert anlegen</label></div></div>',
    init:function(el){
      function upd(){ var f = $("#anFirst", el).value.trim().toLowerCase(), l = $("#anLast", el).value.trim().toLowerCase(); if (f && l && !$("#anSam", el).dataset.touched) $("#anSam", el).value = (f + "." + l[0]).replace(/[^a-z0-9.]/g, ""); }
      $("#anFirst", el).addEventListener("input", upd); $("#anLast", el).addEventListener("input", upd);
      $("#anSam", el).addEventListener("input", function(){ this.dataset.touched = "1"; });
    },
    actions:'<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Benutzer erstellen</button>',
    onAction:function(a, el, close){
      if (a !== "save") return;
      var fn = $("#anFirst", el).value.trim(), ln = $("#anLast", el).value.trim(), sam = $("#anSam", el).value.trim().toLowerCase();
      var bad = false;
      $("#anFirstErr", el).textContent = fn ? "" : "Vorname fehlt."; if (!fn) bad = true;
      $("#anLastErr", el).textContent = ln ? "" : "Nachname fehlt."; if (!ln) bad = true;
      var samErr = !/^[a-z0-9][a-z0-9._-]{1,19}$/.test(sam) ? "2 bis 20 Zeichen: Kleinbuchstaben, Ziffern, Punkt." : adObj(sam) ? "Der Anmeldename ist schon vergeben." : "";
      $("#anSamErr", el).textContent = samErr; if (samErr) bad = true;
      var chk = adCheckPw(sam || "x", $("#anPw", el).value);
      $("#anPwErr", el).textContent = chk.ok ? "" : "Richtlinie: " + chk.errs.join("; ") + "."; if (!chk.ok) bad = true;
      if (bad) return;
      var nu = { id:sam, first:fn, last:ln, display:fn + " " + ln, ou:$("#anOu", el).value, title:$("#anTitle", el).value.trim(), dept:"", company:"Nordlicht IT Service", mail:"", phone:"", office:"", desc:"", enabled:!$("#anDis", el).checked, locked:false, pwdSet:0, neverExp:false, mustChange:$("#anMust", el).checked, lastLogon:null, created:0, failed:0, rid:1500 + AD.users.length, sensitive:false, spn:"", manager:"", profile:"", script:"anmelden.cmd", home:"\\\\FS-01\\home\\" + sam };
      AD.users.push(nu);
      var tpl = $("#anTpl", el).value;
      if (tpl) adDirectGroups(tpl).forEach(function(g){ if (!g.implicit && !g.builtin) adSetMember(g.id, sam, true); });
      adLog(4720, "Benutzer erstellt: " + sam + " in " + adOu(nu.ou).name);
      adState.node = nu.ou; adState.sel = sam;
      close(); renderAD(); toast("Benutzer " + sam + " erstellt.", "ok");
    }
  });
}
function adNewGroup(){
  openModal({
    title:"Neue Gruppe", sub:"Namensschema: GG_ für globale, DL_ für domänenlokale Gruppen (AGDLP)",
    body:field("ngName", "Gruppenname", '<input class="inp" id="ngName" placeholder="GG_Vertrieb">') +
      '<div class="grid g2e" style="gap:14px">' + field("ngScope", "Gruppenbereich", '<select class="inp" id="ngScope"><option>Global</option><option>Domänenlokal</option><option>Universal</option></select>') + field("ngType", "Gruppentyp", '<select class="inp" id="ngType"><option>Sicherheit</option><option>Verteiler</option></select>') + '</div>' +
      field("ngOu", "Organisationseinheit", '<select class="inp" id="ngOu">' + adOuOptions("grp") + '</select>') + field("ngDesc", "Beschreibung", '<input class="inp" id="ngDesc">'),
    actions:'<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Gruppe erstellen</button>',
    onAction:function(a, el, close){
      if (a !== "save") return;
      var n = $("#ngName", el).value.trim();
      if (n.length < 3) { $("#ngNameErr", el).textContent = "Bitte einen Namen eingeben."; return; }
      if (AD.groups.some(function(g){ return g.name.toLowerCase() === n.toLowerCase(); })) { $("#ngNameErr", el).textContent = "Diese Gruppe gibt es schon."; return; }
      var id = "g-" + n.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      AD.groups.push({ id:id, name:n, ou:$("#ngOu", el).value, scope:$("#ngScope", el).value, type:$("#ngType", el).value, desc:$("#ngDesc", el).value.trim(), members:[], rid:1600 + AD.groups.length, prot:false });
      adLog(4727, "Gruppe erstellt: " + n);
      adState.grpSel = id; close(); renderAD(); toast("Gruppe " + n + " erstellt.", "ok");
    }
  });
}
function adNewOu(){
  var parent = adOu(adState.node) && adOu(adState.node).kind !== "container" ? adState.node : "dom";
  openModal({
    title:"Neue Organisationseinheit",
    body:field("noName", "Name", '<input class="inp" id="noName" placeholder="z. B. Vertrieb">') + field("noParent", "Übergeordnet", '<select class="inp" id="noParent">' + adOuOptions(parent) + '</select>') +
      field("noDesc", "Beschreibung", '<input class="inp" id="noDesc">') + '<label class="check"><input type="checkbox" id="noProt" checked> Vor versehentlichem Löschen schützen</label>',
    actions:'<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Erstellen</button>',
    onAction:function(a, el, close){
      if (a !== "save") return;
      var n = $("#noName", el).value.trim(), par = $("#noParent", el).value;
      if (n.length < 2) { $("#noNameErr", el).textContent = "Bitte einen Namen eingeben."; return; }
      if (adOu(par).kind === "container") { $("#noNameErr", el).textContent = "In Standardcontainern lassen sich keine OUs anlegen."; return; }
      if (adChildren(par).some(function(o){ return o.name.toLowerCase() === n.toLowerCase(); })) { $("#noNameErr", el).textContent = "Diese OU gibt es dort schon."; return; }
      var id = "ou-" + Date.now();
      AD.ous.push({ id:id, name:n, parent:par, kind:"ou", prot:$("#noProt", el).checked, desc:$("#noDesc", el).value.trim() });
      adState.open[par] = true; adState.node = id; adState.sel = null;
      adLog(5137, "OU erstellt: " + adDn(id).replace(/^CN=[^,]*,/, ""));
      close(); renderAD(); toast("OU " + n + " erstellt.", "ok");
    }
  });
}
function adNewComputer(){
  openModal({
    title:"Neues Computerkonto", sub:"Bereitet den Domänenbeitritt vor",
    body:field("ncName", "Computername", '<input class="inp" id="ncName" placeholder="WS-VERTRIEB-01" maxlength="15">', null, "Höchstens 15 Zeichen (NetBIOS).") + field("ncOu", "Organisationseinheit", '<select class="inp" id="ncOu">' + adOuOptions("comp-ws") + '</select>'),
    actions:'<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Erstellen</button>',
    onAction:function(a, el, close){
      if (a !== "save") return;
      var n = $("#ncName", el).value.trim().toUpperCase();
      if (!/^[A-Z0-9][A-Z0-9-]{1,14}$/.test(n)) { $("#ncNameErr", el).textContent = "2 bis 15 Zeichen: Buchstaben, Ziffern, Bindestrich."; return; }
      if (AD.computers.some(function(c){ return c.name === n; })) { $("#ncNameErr", el).textContent = "Den Namen gibt es schon."; return; }
      AD.computers.push({ id:"c-" + n.toLowerCase(), name:n, ou:$("#ncOu", el).value, os:"(noch nicht beigetreten)", ip:"", role:"Arbeitsplatz", site:"Hauptstandort", enabled:true, lastLogon:null, rid:1700 + AD.computers.length });
      adLog(4741, "Computerkonto erstellt: " + n);
      close(); renderAD(); toast("Computerkonto " + n + " erstellt.", "ok");
    }
  });
}
function adMove(id){
  var o = adObj(id);
  openModal({
    title:"Verschieben", sub:adName(id),
    body:field("mvOu", "Ziel", '<select class="inp" id="mvOu">' + adOuOptions(o.ou) + '</select>') + '<p class="hint">Beim Verschieben ändern sich die wirksamen Gruppenrichtlinien.</p>',
    actions:'<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Verschieben</button>',
    onAction:function(a, el, close){
      if (a !== "save") return;
      var t = $("#mvOu", el).value;
      if (adOu(t).kind === "domain") { $("#mvOuErr", el).textContent = "Bitte eine OU oder einen Container wählen."; return; }
      o.ou = t; adState.node = t; adLog(5139, "Objekt verschoben: " + adName(id) + " nach " + adOu(t).name);
      close(); renderAD(); toast(adName(id) + " nach " + adOu(t).name + " verschoben.", "ok");
    }
  });
}
function adAddToGroup(id){
  var opts = AD.groups.filter(function(g){ return !g.implicit && g.members.indexOf(id) < 0 && g.id !== id; }).map(function(g){ return '<option value="' + g.id + '">' + esc(g.name) + ' (' + g.scope + ')</option>'; }).join("");
  openModal({
    title:"Zu Gruppe hinzufügen", sub:adName(id),
    body:field("agGroup", "Gruppe", '<select class="inp" id="agGroup">' + opts + '</select>') + '<div class="note warn" id="agWarn" hidden></div>',
    init:function(el){
      function upd(){ var g = adGroup($("#agGroup", el).value); var w = $("#agWarn", el); if (g && g.prot) { w.hidden = false; w.textContent = "Geschützte Gruppe mit weitreichenden Rechten. Jede Aufnahme wird im Audit sichtbar."; } else w.hidden = true; }
      $("#agGroup", el).addEventListener("change", upd); upd();
    },
    actions:'<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Hinzufügen</button>',
    onAction:function(a, el, close){
      if (a !== "save") return;
      var g = adGroup($("#agGroup", el).value);
      if (!g) return;
      if (adGroup(id) && g.scope === "Global" && adGroup(id).scope !== "Global") { toast("Globale Gruppen können nur globale Gruppen enthalten (AGDLP).", "bad"); return; }
      adSetMember(g.id, id, true);
      close(); renderAD(); toast(adName(id) + " ist jetzt in " + g.name + ".", "ok");
    }
  });
}
function adDelete(id){
  var o = adObj(id), k = adKind(id);
  if (k === "group" && o.builtin) { toast("Vordefinierte Gruppen lassen sich nicht löschen.", "bad"); return; }
  if (id === "administrator" || id === "krbtgt") { toast("Dieses Konto ist vom System geschützt.", "bad"); return; }
  if (k === "computer" && o.role === "Domänencontroller") { toast("Domänencontroller werden nicht im Verzeichnis gelöscht, sondern herabgestuft.", "bad"); return; }
  confirmModal(adName(id) + " löschen?", "Das Objekt landet im AD-Papierkorb und kann 180 Tage lang mit allen Attributen und Gruppenmitgliedschaften wiederhergestellt werden.", "Löschen", "btn-d", function(){
    var groups = AD.groups.filter(function(g){ return g.members.indexOf(id) >= 0; }).map(function(g){ return g.id; });
    groups.forEach(function(gid){ var g = adGroup(gid); g.members.splice(g.members.indexOf(id), 1); });
    AD.deleted.unshift({ kind:k, obj:o, when:0, from:o.ou, groups:groups });
    if (k === "user") AD.users.splice(AD.users.indexOf(o), 1);
    if (k === "group") AD.groups.splice(AD.groups.indexOf(o), 1);
    if (k === "computer") AD.computers.splice(AD.computers.indexOf(o), 1);
    adLog(k === "user" ? 4726 : k === "group" ? 4730 : 4743, "Objekt gelöscht: " + adName(id));
    adState.sel = null; renderAD(); toast("In den AD-Papierkorb verschoben.", "ok");
  });
}
function adRestore(i){
  var d = AD.deleted[i];
  if (!adOu(d.from)) { toast("Die ursprüngliche OU gibt es nicht mehr. Erst die OU wiederherstellen.", "bad"); return; }
  if (d.kind === "user") AD.users.push(d.obj);
  if (d.kind === "group") AD.groups.push(d.obj);
  if (d.kind === "computer") AD.computers.push(d.obj);
  (d.groups || []).forEach(function(gid){ var g = adGroup(gid); if (g && g.members.indexOf(d.obj.id) < 0) g.members.push(d.obj.id); });
  AD.deleted.splice(i, 1);
  adLog(5138, "Objekt wiederhergestellt: " + (d.obj.display || d.obj.name));
  renderAD(); toast((d.obj.display || d.obj.name) + " wiederhergestellt, mit Gruppen.", "ok");
}
function adDeleteOu(id){
  var o = adOu(id);
  if (o.kind !== "ou") { toast("Standardcontainer lassen sich nicht löschen.", "bad"); return; }
  if (o.prot) { toast("Die OU ist vor versehentlichem Löschen geschützt. Schutz erst in den Eigenschaften aufheben.", "bad"); return; }
  if (adCount(id) || adChildren(id).length) { toast("Die OU ist nicht leer.", "bad"); return; }
  AD.ous.splice(AD.ous.indexOf(o), 1);
  AD.gpos.forEach(function(g){ g.links = g.links.filter(function(l){ return l.ou !== id; }); });
  adState.node = o.parent; renderAD(); toast("OU " + o.name + " gelöscht.", "ok");
}
function adReplicate(){
  if (adDnsOk()) {
    AD.repl.forEach(function(r){ r.ok = true; r.last = 0; r.err = ""; });
    adLog(1988, "Replikation erfolgreich: alle Partitionen synchron");
    toast("Replikation erfolgreich. DC-01 und DC-02 sind synchron.", "ok");
  } else {
    AD.repl.forEach(function(r){ r.ok = false; });
    adLog(1925, "Replikation fehlgeschlagen (8524). DNS prüfen.");
    toast("Fehler 8524: DNS-Suche fehlgeschlagen. Die A-Einträge der Domänencontroller prüfen.", "bad");
  }
  renderAD();
}
function adTransferRole(role){
  var cur = AD.fsmo[role], target = cur === "DC-01" ? "DC-02" : "DC-01";
  if (!adReplOk()) { toast("Rolle nicht übertragbar: Die Replikation zum Ziel funktioniert nicht.", "bad"); return; }
  confirmModal("Rolle übertragen?", "„" + role + "“ geht von " + cur + " an " + target + ". Das Ziel muss erreichbar und aktuell sein.", "Übertragen", "", function(){
    AD.fsmo[role] = target; adLog(1458, "FSMO-Rolle übertragen: " + role + " an " + target); renderAD(); toast(role + " liegt jetzt auf " + target + ".", "ok");
  });
}
function adEditDns(rid){
  var r = AD.dns.filter(function(x){ return x.id === rid; })[0];
  var isNew = !r;
  r = r || { id:"r" + Date.now(), name:"", type:"A", value:"", stamp:"statisch" };
  openModal({
    title:isNew ? "Neuer DNS-Eintrag" : "DNS-Eintrag bearbeiten", sub:"Zone " + AD.domain,
    body:'<div class="grid g2e" style="gap:14px">' + field("dnName", "Name", '<input class="inp mono" id="dnName" value="' + esc(r.name) + '">') + field("dnType", "Typ", '<select class="inp" id="dnType">' + ["A","CNAME","SRV","MX","TXT"].map(function(t){ return '<option' + (t === r.type ? ' selected' : '') + '>' + t + '</option>'; }).join("") + '</select>') + '</div>' +
      field("dnVal", "Wert", '<input class="inp mono" id="dnVal" value="' + esc(r.value) + '">', null, "A: IPv4-Adresse. CNAME: Zielname. SRV: Priorität Gewicht Port Ziel."),
    actions:'<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Speichern</button>',
    onAction:function(a, el, close){
      if (a !== "save") return;
      var n = $("#dnName", el).value.trim().toLowerCase(), t = $("#dnType", el).value, v = $("#dnVal", el).value.trim();
      if (!n) { $("#dnNameErr", el).textContent = "Name fehlt."; return; }
      if (t === "A" && !/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(v)) { $("#dnValErr", el).textContent = "Keine gültige IPv4-Adresse."; return; }
      if (t === "A" && v.split(".").some(function(x){ return +x > 255; })) { $("#dnValErr", el).textContent = "Keine gültige IPv4-Adresse."; return; }
      if (!v) { $("#dnValErr", el).textContent = "Wert fehlt."; return; }
      r.name = n; r.type = t; r.value = v; r.stamp = "statisch";
      if (isNew) AD.dns.push(r);
      adLog(5136, "DNS-Eintrag gespeichert: " + n + " " + t + " " + v);
      close(); renderAD(); toast("DNS-Eintrag gespeichert." + (n === "dc-02" && v === "10.0.3.10" ? " Jetzt die Replikation neu anstoßen." : ""), "ok");
    }
  });
}
function adEditPolicy(isPso){
  var p = isPso ? AD.pso : AD.pwPolicy;
  openModal({
    title:isPso ? "Feinkörnige Kennwortrichtlinie " + AD.pso.name : "Kennwortrichtlinie (Default Domain Policy)", sub:isPso ? "Gilt für Domänen-Admins und geht der Domänenrichtlinie vor" : "Gilt für alle Konten der Domäne",
    body:'<div class="grid g2e" style="gap:14px">' + field("ppMin", "Minimale Länge", '<input class="inp num" id="ppMin" type="number" min="1" max="64" value="' + p.minLen + '">') + field("ppAge", "Maximales Alter (Tage)", '<input class="inp num" id="ppAge" type="number" min="0" max="999" value="' + p.maxAge + '">') + '</div>' +
      '<div class="grid g2e" style="gap:14px">' + field("ppLock", "Sperrschwelle", '<input class="inp num" id="ppLock" type="number" min="0" max="50" value="' + p.lockThreshold + '">', null, "0 bedeutet: nie sperren") + field("ppDur", "Sperrdauer (Minuten)", '<input class="inp num" id="ppDur" type="number" min="0" max="999" value="' + p.lockDuration + '">') + '</div>' +
      '<label class="check"><input type="checkbox" id="ppCx"' + (p.complex ? ' checked' : '') + '> Komplexitätsanforderungen</label>' +
      '<div class="note info">Aktuelle Empfehlung: lange Passphrasen statt häufiger Wechsel. Mindestens 12 Zeichen, Sperrschwelle 5 bis 10.</div>',
    actions:'<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Übernehmen</button>',
    onAction:function(a, el, close){
      if (a !== "save") return;
      var mn = +$("#ppMin", el).value, ag = +$("#ppAge", el).value, lk = +$("#ppLock", el).value, du = +$("#ppDur", el).value;
      if (!(mn >= 1 && mn <= 64)) { $("#ppMinErr", el).textContent = "1 bis 64."; return; }
      p.minLen = mn; p.maxAge = ag; p.lockThreshold = lk; p.lockDuration = du; p.complex = $("#ppCx", el).checked;
      adLog(4739, "Richtlinie geändert: " + (isPso ? AD.pso.name : "Default Domain Policy"));
      close(); renderAD(); toast("Richtlinie übernommen. Wirkt beim nächsten Kennwortwechsel.", "ok");
    }
  });
}
function adLinkGpo(gid){
  var g = AD.gpos.filter(function(x){ return x.id === gid; })[0];
  openModal({
    title:"Gruppenrichtlinie verknüpfen", sub:g.name,
    body:field("lkOu", "Mit OU oder Domäne verknüpfen", '<select class="inp" id="lkOu">' + adOuOptions("comp") + '</select>') + '<label class="check"><input type="checkbox" id="lkEnf"> Erzwungen (setzt sich gegen tiefer liegende Richtlinien durch)</label>',
    actions:'<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Verknüpfen</button>',
    onAction:function(a, el, close){
      if (a !== "save") return;
      var ou = $("#lkOu", el).value;
      if (adOu(ou).kind === "container") { $("#lkOuErr", el).textContent = "Mit Standardcontainern (Users, Builtin) lassen sich keine Richtlinien verknüpfen."; return; }
      if (g.links.some(function(l){ return l.ou === ou; })) { $("#lkOuErr", el).textContent = "Schon mit dieser OU verknüpft."; return; }
      g.links.push({ ou:ou, enforced:$("#lkEnf", el).checked, enabled:true });
      adLog(5136, "GPO verknüpft: " + g.name + " mit " + adOu(ou).name);
      close(); renderAD(); toast(g.name + " wirkt jetzt auf " + adOu(ou).name + ".", "ok");
    }
  });
}
/* Anbindung an die Zugriffsanfragen */
function adAccessGranted(r){
  if (/Helpdesk/.test(r.what)) {
    var u = AD.users.filter(function(x){ return x.display === r.who || x.id === "lea.f"; })[0];
    if (u) { adSetMember("g-helpdesk", u.id, true); toast(u.display + " ist im AD jetzt in GG_Helpdesk.", "ok"); }
    else toast("Im AD gibt es noch kein Konto für " + r.who + ". Erst unter Verzeichnis anlegen.", "bad");
  }
  if (/Domänen-Admin/.test(r.what)) toast("Hinweis: Domänen-Admin-Rechte im AD bitte nicht über Anfragen vergeben. Der Sicherheitswert sinkt.", "bad");
}

/* ---------- Active Directory: Oberfläche ---------- */
var AD_ICON = { domain:"", ou:"", container:"", user:"", group:"", computer:"" };
function adTag(t, cls){ return '<span class="tag ' + cls + '">' + esc(t) + '</span>'; }

function adTreeHtml(id, depth){
  var o = adOu(id), kids = adChildren(id), open = !!adState.open[id];
  var row = '<div class="ad-node' + (adState.node === id && !adState.search ? ' on' : '') + '" style="padding-left:' + (6 + depth * 16) + 'px">' +
    (kids.length ? '<button type="button" class="ad-tog' + (open ? ' open' : '') + '" data-ad-toggle="' + id + '" aria-label="' + (open ? "Zuklappen" : "Aufklappen") + '" aria-expanded="' + open + '"></button>' : '<span class="ad-tog-sp"></span>') +
    '<button type="button" class="ad-nb" data-ad-node="' + id + '"><span class="ad-ic ' + o.kind + '">' + AD_ICON[o.kind] + '</span><span class="ad-nn">' + esc(o.name) + '</span>' +
    (adCount(id) ? '<span class="ad-cnt">' + adCount(id) + '</span>' : '') + '</button></div>';
  if (open) kids.forEach(function(k){ row += adTreeHtml(k.id, depth + 1); });
  return row;
}
function adRowsFor(list, showOu){
  return list.map(function(r){
    var on = adState.sel === r.id ? ' class="click on"' : ' class="click"';
    return '<tr' + on + ' data-ad-row="' + r.kind + ':' + esc(r.id) + '"><td><span class="ad-ic ' + r.kind + '">' + AD_ICON[r.kind] + '</span> <strong>' + esc(r.name) + '</strong>' + (r.sub ? '<div class="sub">' + esc(r.sub) + '</div>' : '') + '</td>' +
      '<td>' + esc(r.type) + '</td>' + (showOu ? '<td>' + esc(r.ou) + '</td>' : '') + '<td>' + esc(r.desc) + '</td><td>' + r.status + '</td></tr>';
  }).join("");
}
function adListItems(){
  var q = (adState.search || "").toLowerCase();
  var items = [];
  function addUser(u){ var st = adUserStatus(u); items.push({ kind:"user", id:u.id, name:u.display, sub:u.id + "@" + AD.domain, type:u.spn ? "Dienstkonto" : "Benutzer", desc:u.title || u.desc, status:adTag(st[0], st[1]), ou:adOu(u.ou).name }); }
  function addGroup(g){ items.push({ kind:"group", id:g.id, name:g.name, sub:"", type:"Gruppe · " + g.scope + (g.type === "Verteiler" ? " · Verteiler" : ""), desc:g.desc, status:g.implicit ? adTag("alle Benutzer", "t-mut") : adTag(g.members.length + " Mitglieder", g.prot ? "t-warn" : "t-mut"), ou:adOu(g.ou).name }); }
  function addComp(c){ items.push({ kind:"computer", id:c.id, name:c.name, sub:c.ip, type:"Computer · " + c.role, desc:c.os, status:!c.enabled ? adTag("deaktiviert", "t-mut") : (-c.lastLogon > 90 ? adTag("inaktiv " + (-c.lastLogon) + " T.", "t-warn") : adTag(adAgeText(c.lastLogon), "t-ok")), ou:adOu(c.ou).name }); }
  if (q) {
    AD.users.forEach(function(u){ if ((u.display + " " + u.id + " " + u.title + " " + u.company).toLowerCase().indexOf(q) >= 0) addUser(u); });
    AD.groups.forEach(function(g){ if ((g.name + " " + g.desc).toLowerCase().indexOf(q) >= 0) addGroup(g); });
    AD.computers.forEach(function(c){ if ((c.name + " " + c.ip + " " + c.role).toLowerCase().indexOf(q) >= 0) addComp(c); });
    return items;
  }
  var o = adObjectsIn(adState.node);
  o.ous.forEach(function(x){ items.push({ kind:x.kind === "container" ? "container" : "ou", id:x.id, name:x.name, sub:"", type:x.kind === "container" ? "Container" : "Organisationseinheit", desc:x.desc, status:adTag(adCount(x.id) + " Objekte", "t-mut"), ou:"" }); });
  o.users.slice().sort(function(a, b){ return a.display < b.display ? -1 : 1; }).forEach(addUser);
  o.groups.slice().sort(function(a, b){ return a.name < b.name ? -1 : 1; }).forEach(addGroup);
  o.computers.forEach(addComp);
  return items;
}
function renderAdList(){
  var q = adState.search;
  var items = adListItems();
  $("#adListHead").innerHTML = '<tr><th>Name</th><th>Typ</th>' + (q ? '<th>OU</th>' : '') + '<th>Beschreibung</th><th>Status</th></tr>';
  $("#adList").innerHTML = items.length ? adRowsFor(items, !!q) : '<tr><td colspan="5" class="hint">' + (q ? "Keine Treffer für „" + esc(q) + "“." : "Diese OU ist leer.") + '</td></tr>';
  $("#adCrumb").innerHTML = q ? 'Suche nach <strong>' + esc(q) + '</strong> · ' + items.length + ' Treffer' :
    adPath(adState.node).map(function(o){ return '<button type="button" class="ad-crumb" data-ad-node="' + o.id + '">' + esc(o.name) + '</button>'; }).join('<span class="muted"> › </span>');
}

/* Eigenschaften */
function adIn(id, label, val, extra){ return '<div class="field"><label for="' + id + '">' + label + '</label><input class="inp" id="' + id + '" value="' + esc(val || "") + '"' + (extra || "") + '></div>'; }
function adChk(id, label, on, hint){ return '<label class="check ad-chk"><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + '> <span>' + label + (hint ? '<span class="hint" style="display:block;font-weight:500">' + hint + '</span>' : '') + '</span></label>'; }
function adPtabs(tabs){
  return '<div class="tabs ad-ptabs" role="tablist">' + tabs.map(function(t){ return '<button type="button" role="tab" data-ad-ptab="' + t[0] + '" aria-selected="' + (adState.ptab === t[0]) + '">' + t[1] + '</button>'; }).join("") + '</div>';
}
function adAttrTable(rows){
  return '<div class="ad-attrs"><table><thead><tr><th>Attribut</th><th>Wert</th></tr></thead><tbody>' + rows.map(function(r){ return '<tr><td class="mono">' + esc(r[0]) + '</td><td class="mono">' + esc(String(r[1])) + '</td></tr>'; }).join("") + '</tbody></table></div>';
}
function adUserProps(u){
  var tabs = [["general","Allgemein"],["account","Konto"],["member","Mitglied von"],["org","Organisation"],["profile","Profil"],["attr","Attribute"]];
  if (!tabs.some(function(t){ return t[0] === adState.ptab; })) adState.ptab = "general";
  var st = adUserStatus(u), pol = adPolicyFor(u.id);
  var head = '<div class="ad-ph"><span class="ad-av">' + esc((u.first[0] || u.display[0] || "?") + (u.last[0] || "")) + '</span><div style="min-width:0"><h3>' + esc(u.display) + '</h3><div class="hint mono">' + esc(AD.netbios + "\\" + u.id) + '</div></div>' + adTag(st[0], st[1]) + '</div>' +
    '<div class="acts ad-acts"><button class="btn btn-sm" type="button" data-ad-act="pw" data-id="' + esc(u.id) + '">Kennwort zurücksetzen</button>' +
    (u.locked ? '<button class="btn btn-s btn-sm" type="button" data-ad-act="unlock" data-id="' + esc(u.id) + '">Entsperren</button>' : '') +
    '<button class="btn btn-s btn-sm" type="button" data-ad-act="toggle" data-id="' + esc(u.id) + '">' + (u.enabled ? "Deaktivieren" : "Aktivieren") + '</button>' +
    '<button class="btn btn-s btn-sm" type="button" data-ad-act="addgrp" data-id="' + esc(u.id) + '">Zu Gruppe…</button>' +
    '<button class="btn btn-s btn-sm" type="button" data-ad-act="move" data-id="' + esc(u.id) + '">Verschieben</button>' +
    '<button class="btn btn-g btn-sm" type="button" data-ad-act="del" data-id="' + esc(u.id) + '">Löschen</button></div>';
  var body = "";
  if (adState.ptab === "general") body = '<div class="grid g2e" style="gap:12px">' + adIn("adfFirst", "Vorname", u.first) + adIn("adfLast", "Nachname", u.last) + '</div>' + adIn("adfDisplay", "Anzeigename", u.display) + adIn("adfDesc", "Beschreibung", u.desc) +
    '<div class="grid g2e" style="gap:12px">' + adIn("adfOffice", "Büro", u.office) + adIn("adfPhone", "Telefon", u.phone) + '</div>' + adIn("adfMail", "E-Mail", u.mail) +
    '<div class="acts"><button class="btn btn-sm" type="button" data-ad-save="general">Speichern</button></div>';
  if (adState.ptab === "account") body = '<dl class="kv ad-kv"><dt>Anmeldename</dt><dd class="mono">' + esc(u.id + "@" + AD.domain) + '</dd><dt>Vor Windows 2000</dt><dd class="mono">' + esc(AD.netbios + "\\" + u.id) + '</dd>' +
    '<dt>Kennwort gesetzt</dt><dd>' + adAgeText(u.pwdSet) + (adPwExpired(u) ? ' ' + adTag("abgelaufen", "t-warn") : '') + '</dd><dt>Richtlinie</dt><dd>' + esc(pol.name) + ' · min. ' + pol.minLen + ' Zeichen · ' + pol.maxAge + ' Tage</dd>' +
    '<dt>Letzte Anmeldung</dt><dd>' + adAgeText(u.lastLogon) + '</dd><dt>Fehlversuche</dt><dd>' + u.failed + ' von ' + pol.lockThreshold + '</dd><dt>Konto gesperrt</dt><dd>' + (u.locked ? adTag("ja", "t-bad") + ' <button class="btn btn-s btn-sm" type="button" data-ad-act="unlock" data-id="' + esc(u.id) + '">Entsperren</button>' : "nein") + '</dd></dl>' +
    '<div class="lbl" style="margin:14px 0 6px">Kontooptionen</div>' +
    adChk("adfMust", "Benutzer muss Kennwort bei der nächsten Anmeldung ändern", u.mustChange) +
    adChk("adfNever", "Kennwort läuft nie ab", u.neverExp, u.spn ? "Bei Dienstkonten besser ein verwaltetes Dienstkonto (gMSA) nutzen." : "") +
    adChk("adfDis", "Konto ist deaktiviert", !u.enabled) +
    adChk("adfSens", "Konto ist vertraulich und kann nicht delegiert werden", u.sensitive, "Empfohlen für alle Admin-Konten.") +
    '<div class="acts" style="margin-top:12px"><button class="btn btn-sm" type="button" data-ad-save="account">Übernehmen</button></div>';
  if (adState.ptab === "member") {
    var direct = adDirectGroups(u.id), all = adAllGroups(u.id);
    body = '<div class="lbl" style="margin-bottom:6px">Direkt</div>' + direct.map(function(g){
      return '<div class="li ad-li"><span><span class="ad-ic group"></span> ' + esc(g.name) + ' <span class="sub">' + esc(g.scope) + '</span>' + (g.prot ? ' ' + adTag("geschützt", "t-warn") : '') + '</span>' + (g.implicit ? '<span class="hint">primäre Gruppe</span>' : '<button class="btn btn-g btn-sm" type="button" data-ad-rmgrp="' + g.id + '">Entfernen</button>') + '</div>';
    }).join("") +
    '<div class="lbl" style="margin:14px 0 6px">Indirekt über Verschachtelung</div>' + (all.filter(function(x){ return x.via; }).map(function(x){ return '<div class="li ad-li"><span><span class="ad-ic group"></span> ' + esc(x.g.name) + '</span><span class="sub">über ' + esc(x.via) + '</span></div>'; }).join("") || '<p class="hint">Keine.</p>') +
    '<div class="acts" style="margin-top:12px"><button class="btn btn-sm" type="button" data-ad-act="addgrp" data-id="' + esc(u.id) + '">Hinzufügen…</button></div>';
  }
  if (adState.ptab === "org") {
    var mgrOpts = '<option value="">keiner</option>' + AD.users.filter(function(x){ return x.id !== u.id && x.first; }).map(function(x){ return '<option value="' + x.id + '"' + (x.id === u.manager ? ' selected' : '') + '>' + esc(x.display) + '</option>'; }).join("");
    var reports = AD.users.filter(function(x){ return x.manager === u.id; });
    body = adIn("adfTitle", "Position", u.title) + '<div class="grid g2e" style="gap:12px">' + adIn("adfDept", "Abteilung", u.dept) + adIn("adfCompany", "Firma", u.company) + '</div>' +
      '<div class="field"><label for="adfMgr">Vorgesetzte Person</label><select class="inp" id="adfMgr">' + mgrOpts + '</select></div>' +
      '<div class="lbl" style="margin:12px 0 6px">Direkt unterstellt</div>' + (reports.map(function(x){ return '<div class="li ad-li"><span>' + esc(x.display) + '</span><span class="sub">' + esc(x.title) + '</span></div>'; }).join("") || '<p class="hint">Niemand.</p>') +
      '<div class="acts" style="margin-top:12px"><button class="btn btn-sm" type="button" data-ad-save="org">Speichern</button></div>';
  }
  if (adState.ptab === "profile") body = adIn("adfProfile", "Profilpfad", u.profile, ' placeholder="\\\\FS-01\\profile\\' + esc(u.id) + '"') + adIn("adfScript", "Anmeldeskript", u.script) + adIn("adfHome", "Basisordner (Laufwerk H:)", u.home) +
    '<p class="hint">Der Basisordner wird bei der Anmeldung als H: verbunden.</p><div class="acts" style="margin-top:8px"><button class="btn btn-sm" type="button" data-ad-save="profile">Speichern</button></div>';
  if (adState.ptab === "attr") body = adAttrTable([
    ["distinguishedName", adDn(u.ou, u.display)], ["sAMAccountName", u.id], ["userPrincipalName", u.id + "@" + AD.domain], ["objectSid", AD.sidBase + u.rid],
    ["userAccountControl", adUac(u) + " (0x" + adUac(u).toString(16) + ")"], ["whenCreated", adAgeText(u.created)], ["pwdLastSet", adAgeText(u.pwdSet)], ["lastLogonTimestamp", adAgeText(u.lastLogon)],
    ["badPwdCount", u.failed], ["lockoutTime", u.locked ? "gesetzt" : "0"], ["adminCount", adIsPrivileged(u.id) ? 1 : "(nicht gesetzt)"], ["servicePrincipalName", u.spn || "(nicht gesetzt)"],
    ["memberOf", adDirectGroups(u.id).filter(function(g){ return !g.implicit; }).map(function(g){ return g.name; }).join("; ") || "(leer)"], ["manager", u.manager ? adName(u.manager) : "(nicht gesetzt)"]
  ]);
  return head + adPtabs(tabs) + '<div class="ad-pbody">' + body + '</div>';
}
function adGroupProps(g, wide){
  var tabs = [["general","Allgemein"],["members","Mitglieder"],["member","Mitglied von"],["attr","Attribute"]];
  if (!tabs.some(function(t){ return t[0] === adState.ptab; })) adState.ptab = wide ? "members" : "general";
  var head = '<div class="ad-ph"><span class="ad-av grp">GR</span><div style="min-width:0"><h3>' + esc(g.name) + '</h3><div class="hint">' + esc(g.scope + " · " + g.type) + '</div></div>' + (g.prot ? adTag("geschützt", "t-warn") : "") + '</div>' +
    '<div class="acts ad-acts"><button class="btn btn-s btn-sm" type="button" data-ad-act="addgrp" data-id="' + esc(g.id) + '">Zu Gruppe…</button><button class="btn btn-s btn-sm" type="button" data-ad-act="move" data-id="' + esc(g.id) + '">Verschieben</button>' + (g.builtin ? '' : '<button class="btn btn-g btn-sm" type="button" data-ad-act="del" data-id="' + esc(g.id) + '">Löschen</button>') + '</div>';
  var body = "";
  if (adState.ptab === "general") body = adIn("agfName", "Gruppenname", g.name, g.builtin ? " disabled" : "") + adIn("agfDesc", "Beschreibung", g.desc) +
    '<div class="grid g2e" style="gap:12px"><div class="field"><label for="agfScope">Gruppenbereich</label><select class="inp" id="agfScope"' + (g.builtin ? ' disabled' : '') + '>' + ["Domänenlokal","Global","Universal"].map(function(s){ return '<option' + (s === g.scope ? ' selected' : '') + '>' + s + '</option>'; }).join("") + '</select></div>' +
    '<div class="field"><label for="agfType">Gruppentyp</label><select class="inp" id="agfType"' + (g.builtin ? ' disabled' : '') + '>' + ["Sicherheit","Verteiler"].map(function(s){ return '<option' + (s === g.type ? ' selected' : '') + '>' + s + '</option>'; }).join("") + '</select></div></div>' +
    '<p class="hint">Bereich wechseln: Global und Domänenlokal nur über Universal. Verteilergruppen vergeben keine Rechte.</p><div class="acts" style="margin-top:8px"><button class="btn btn-sm" type="button" data-ad-save="group">Speichern</button></div>';
  if (adState.ptab === "members") {
    var eff = g.implicit ? [] : adEffectiveMembers(g.id);
    var addOpts = AD.users.map(function(u){ return '<option value="' + u.id + '">' + esc(u.display) + ' (' + u.id + ')</option>'; }).join("") + AD.groups.filter(function(x){ return x.id !== g.id && !x.implicit; }).map(function(x){ return '<option value="' + x.id + '">Gruppe: ' + esc(x.name) + '</option>'; }).join("");
    body = (g.implicit ? '<p class="hint">Enthält automatisch alle ' + AD.users.length + ' Benutzerkonten (primäre Gruppe).</p>' :
      '<div class="lbl" style="margin-bottom:6px">Direkte Mitglieder (' + g.members.length + ')</div>' + (g.members.map(function(m){
        var k = adKind(m); var bad = g.id === "g-da" && AD.daAllowed.indexOf(m) < 0;
        return '<div class="li ad-li"><span><span class="ad-ic ' + k + '">' + AD_ICON[k] + '</span> ' + esc(adName(m)) + (bad ? ' ' + adTag("nicht vorgesehen", "t-bad") : '') + '</span><button class="btn btn-g btn-sm" type="button" data-ad-rmmem="' + esc(m) + '">Entfernen</button></div>';
      }).join("") || '<p class="hint">Keine Mitglieder.</p>') +
      '<div class="ad-addrow"><select class="inp" id="agfAdd" aria-label="Mitglied wählen">' + addOpts + '</select><button class="btn btn-sm" type="button" data-ad-addmem="' + g.id + '">Hinzufügen</button></div>' +
      '<div class="lbl" style="margin:14px 0 6px">Effektive Mitglieder, aufgelöst (' + eff.length + ')</div>' + (eff.map(function(x){ return '<div class="li ad-li"><span>' + esc(adName(x.id)) + '</span><span class="sub">' + (x.via ? "über " + esc(x.via) : "direkt") + '</span></div>'; }).join("") || '<p class="hint">Keine.</p>'));
    if (g.id === "g-da") body = '<div class="note warn" style="margin-bottom:12px">Soll: höchstens zwei Konten (Administrator und ein getrenntes Admin-Konto). Jedes weitere Mitglied ist ein Risiko.</div>' + body;
    if (g.scope === "Domänenlokal" && !g.builtin) body = '<div class="note info" style="margin-bottom:12px">AGDLP: Konten kommen in globale Gruppen, globale Gruppen in domänenlokale, domänenlokale Gruppen bekommen die Rechte.</div>' + body;
  }
  if (adState.ptab === "member") body = adDirectGroups(g.id).map(function(x){ return '<div class="li ad-li"><span><span class="ad-ic group"></span> ' + esc(x.name) + '</span><span class="sub">' + esc(x.scope) + '</span></div>'; }).join("") || '<p class="hint">Diese Gruppe ist in keiner anderen Gruppe.</p>';
  if (adState.ptab === "attr") body = adAttrTable([["distinguishedName", adDn(g.ou, g.name)], ["sAMAccountName", g.name], ["objectSid", AD.sidBase + g.rid], ["groupType", (g.scope === "Global" ? 2 : g.scope === "Universal" ? 8 : 4) + (g.type === "Sicherheit" ? " | 0x80000000 (Sicherheit)" : " (Verteiler)")], ["adminCount", g.prot ? 1 : "(nicht gesetzt)"], ["member", g.members.map(adName).join("; ") || "(leer)"]]);
  return head + adPtabs(tabs) + '<div class="ad-pbody">' + body + '</div>';
}
function adCompProps(c){
  var tabs = [["general","Allgemein"],["attr","Attribute"]];
  if (!tabs.some(function(t){ return t[0] === adState.ptab; })) adState.ptab = "general";
  var head = '<div class="ad-ph"><span class="ad-av comp">PC</span><div style="min-width:0"><h3>' + esc(c.name) + '</h3><div class="hint">' + esc(c.role) + '</div></div>' + (c.enabled ? adTag("aktiv", "t-ok") : adTag("deaktiviert", "t-mut")) + '</div>' +
    '<div class="acts ad-acts">' + (c.role === "Domänencontroller" ? '' : '<button class="btn btn-s btn-sm" type="button" data-ad-act="toggle" data-id="' + c.id + '">' + (c.enabled ? "Deaktivieren" : "Aktivieren") + '</button><button class="btn btn-s btn-sm" type="button" data-ad-act="resetcomp" data-id="' + c.id + '">Konto zurücksetzen</button><button class="btn btn-s btn-sm" type="button" data-ad-act="move" data-id="' + c.id + '">Verschieben</button><button class="btn btn-g btn-sm" type="button" data-ad-act="del" data-id="' + c.id + '">Löschen</button>') + '</div>';
  var body = adState.ptab === "attr" ? adAttrTable([["distinguishedName", adDn(c.ou, c.name)], ["sAMAccountName", c.name + "$"], ["dNSHostName", c.name.toLowerCase() + "." + AD.domain], ["objectSid", AD.sidBase + c.rid], ["operatingSystem", c.os], ["lastLogonTimestamp", adAgeText(c.lastLogon)], ["userAccountControl", c.role === "Domänencontroller" ? "532480 (Server-Vertrauen)" : c.enabled ? "4096 (Arbeitsstation)" : "4098 (deaktiviert)"]]) :
    '<dl class="kv ad-kv"><dt>DNS-Name</dt><dd class="mono">' + esc(c.name.toLowerCase() + "." + AD.domain) + '</dd><dt>Betriebssystem</dt><dd>' + esc(c.os) + '</dd><dt>IP-Adresse</dt><dd class="mono">' + esc(c.ip || "—") + '</dd><dt>Standort</dt><dd>' + esc(c.site) + '</dd><dt>Letzte Meldung</dt><dd>' + adAgeText(c.lastLogon) + '</dd><dt>OU</dt><dd>' + esc(adOu(c.ou).name) + '</dd></dl>' +
    (c.role === "Domänencontroller" ? '<div class="note info" style="margin-top:12px">Domänencontroller verwaltest du unter Standorte und Replikation.</div>' : '');
  return head + adPtabs(tabs) + '<div class="ad-pbody">' + body + '</div>';
}
function adOuProps(o){
  var links = [];
  AD.gpos.forEach(function(g){ g.links.forEach(function(l){ if (l.ou === o.id) links.push({ g:g, l:l }); }); });
  var dels = AD.delegations.filter(function(d){ return d.ou === o.id; });
  var cnt = adObjectsIn(o.id);
  return '<div class="ad-ph"><span class="ad-av ou">' + (o.kind === "domain" ? "DC" : "OU") + '</span><div style="min-width:0"><h3>' + esc(o.name) + '</h3><div class="hint">' + (o.kind === "domain" ? "Domäne · " + esc(AD.level) : o.kind === "container" ? "Standardcontainer" : "Organisationseinheit") + '</div></div></div>' +
    '<div class="acts ad-acts">' + (o.kind !== "container" ? '<button class="btn btn-s btn-sm" type="button" data-ad-act="newsubou" data-id="' + o.id + '">Neue Unter-OU</button>' : '') + (o.kind === "ou" ? '<button class="btn btn-g btn-sm" type="button" data-ad-act="delou" data-id="' + o.id + '">OU löschen</button>' : '') + '</div>' +
    '<dl class="kv ad-kv"><dt>Pfad</dt><dd class="mono" style="font-size:12px">' + esc(o.kind === "domain" ? "DC=nordlicht,DC=local" : adDn(o.id)) + '</dd><dt>Beschreibung</dt><dd>' + esc(o.desc || "—") + '</dd><dt>Inhalt</dt><dd>' + cnt.users.length + ' Benutzer, ' + cnt.groups.length + ' Gruppen, ' + cnt.computers.length + ' Computer, ' + cnt.ous.length + ' Unter-OUs</dd></dl>' +
    (o.kind === "ou" ? adChk("adOuProt", "Objekt vor zufälligem Löschen schützen", o.prot) + '<div class="acts" style="margin-top:8px"><button class="btn btn-s btn-sm" type="button" data-ad-save="ou">Übernehmen</button></div>' : '') +
    '<div class="lbl" style="margin:16px 0 6px">Verknüpfte Gruppenrichtlinien</div>' + (links.map(function(x){ return '<div class="li ad-li"><span>' + esc(x.g.name) + '</span><span>' + (x.l.enforced ? adTag("erzwungen", "t-warn") : '') + (x.l.enabled ? '' : adTag("deaktiviert", "t-mut")) + '</span></div>'; }).join("") || '<p class="hint">Keine direkt verknüpft. Es wirken die Richtlinien der übergeordneten OUs.</p>') +
    '<div class="lbl" style="margin:16px 0 6px">Delegierte Rechte</div>' + (dels.map(function(d){ return '<div class="li ad-li"><span>' + esc(adName(d.to)) + '</span><span class="sub">' + esc(d.rights) + '</span></div>'; }).join("") || '<p class="hint">Keine Delegation. Nur Domänen-Admins dürfen hier ändern.</p>');
}
function renderAdProps(){
  var el = $("#adProps");
  if (adState.sel && adObj(adState.sel)) {
    var k = adKind(adState.sel), o = adObj(adState.sel);
    el.innerHTML = k === "user" ? adUserProps(o) : k === "group" ? adGroupProps(o) : adCompProps(o);
  } else el.innerHTML = adOuProps(adOu(adState.node));
}

/* Gruppen-Tab */
function renderAdGroups(){
  var q = ($("#adGrpQ") || { value:"" }).value.toLowerCase();
  $("#adGrpList").innerHTML = AD.groups.filter(function(g){ return !q || g.name.toLowerCase().indexOf(q) >= 0; }).sort(function(a, b){ return a.name < b.name ? -1 : 1; }).map(function(g){
    return '<button type="button" class="ad-gli' + (adState.grpSel === g.id ? ' on' : '') + '" data-ad-grp="' + g.id + '"><span><strong>' + esc(g.name) + '</strong><span class="sub" style="display:block">' + esc(g.scope + " · " + g.type + " · " + adOu(g.ou).name) + '</span></span>' + (g.prot ? adTag("geschützt", "t-warn") : adTag(g.implicit ? "alle" : String(g.members.length), "t-mut")) + '</button>';
  }).join("");
  var g = adGroup(adState.grpSel);
  $("#adGrpDetail").innerHTML = g ? adGroupProps(g, true) : '<p class="hint">Gruppe wählen.</p>';
}

/* Gruppenrichtlinien-Tab */
function renderAdGpo(){
  $("#adGpoList").innerHTML = AD.gpos.map(function(g){
    return '<button type="button" class="ad-gli' + (adState.gpoSel === g.id ? ' on' : '') + '" data-ad-gpo="' + g.id + '"><span><strong>' + esc(g.name) + '</strong><span class="sub" style="display:block">' + (g.links.length ? g.links.length + " Verknüpfung" + (g.links.length > 1 ? "en" : "") : "nicht verknüpft") + '</span></span>' + (g.status === "aktiviert" ? adTag("aktiv", "t-ok") : adTag("aus", "t-mut")) + '</button>';
  }).join("");
  var g = AD.gpos.filter(function(x){ return x.id === adState.gpoSel; })[0];
  var links = g.links.map(function(l, i){
    return '<tr><td>' + esc(adOu(l.ou).name) + '<div class="sub mono">' + esc(l.ou === "dom" ? "DC=nordlicht,DC=local" : adDn(l.ou)) + '</div></td>' +
      '<td><button type="button" class="sw" role="switch" aria-checked="' + l.enforced + '" data-ad-enf="' + g.id + '|' + i + '" aria-label="Erzwungen"></button></td>' +
      '<td><button type="button" class="sw" role="switch" aria-checked="' + l.enabled + '" data-ad-lnk="' + g.id + '|' + i + '" aria-label="Verknüpfung aktiviert"></button></td>' +
      '<td style="text-align:right"><button class="btn btn-g btn-sm" type="button" data-ad-unlink="' + g.id + '|' + i + '">Entfernen</button></td></tr>';
  }).join("");
  var sets = adGpoSettings(g);
  var bySc = {};
  sets.forEach(function(s){ (bySc[s.s + "konfiguration"] = bySc[s.s + "konfiguration"] || []).push(s); });
  var setHtml = Object.keys(bySc).map(function(sc){
    return '<div class="lbl" style="margin:14px 0 6px">' + esc(sc) + '</div>' + bySc[sc].map(function(s){ return '<div class="li ad-li"><span><span class="sub">' + esc(s.c) + ' ›</span> ' + esc(s.k) + '</span><strong>' + esc(s.v) + '</strong></div>'; }).join("");
  }).join("");
  $("#adGpoDetail").innerHTML = '<div class="ad-ph"><span class="ad-av ou" style="font-size:12px">GPO</span><div style="min-width:0"><h3>' + esc(g.name) + '</h3><div class="hint">' + esc(g.desc) + '</div></div>' + (g.status === "aktiviert" ? adTag("aktiviert", "t-ok") : adTag("deaktiviert", "t-mut")) + '</div>' +
    '<div class="acts ad-acts"><button class="btn btn-sm" type="button" data-ad-link="' + g.id + '">Verknüpfen…</button><button class="btn btn-s btn-sm" type="button" data-ad-gpostatus="' + g.id + '">' + (g.status === "aktiviert" ? "Deaktivieren" : "Aktivieren") + '</button>' + (g.id === "gpo-ddp" ? '<button class="btn btn-s btn-sm" type="button" data-ad-policy="ddp">Kennwortrichtlinie bearbeiten</button>' : '') + '</div>' +
    '<div class="lbl" style="margin:10px 0 6px">Verknüpfungen</div>' + (g.links.length ? '<div class="tw"><table><thead><tr><th>OU</th><th>Erzwungen</th><th>Aktiv</th><th><span class="sr">Aktion</span></th></tr></thead><tbody>' + links + '</tbody></table></div>' : '<div class="note warn">Nicht verknüpft. Die Einstellungen wirken nirgends.</div>') +
    setHtml;
  // Feinkörnige Richtlinie
  var p = AD.pso;
  $("#adPso").innerHTML = '<div class="card-h"><h2>Feinkörnige Kennwortrichtlinie</h2><button class="btn btn-s btn-sm" type="button" data-ad-policy="pso">Bearbeiten</button></div>' +
    '<dl class="kv ad-kv"><dt>Name</dt><dd>' + esc(p.name) + '</dd><dt>Gilt für</dt><dd>' + esc(adName(p.appliesTo)) + '</dd><dt>Länge</dt><dd>' + p.minLen + ' Zeichen</dd><dt>Max. Alter</dt><dd>' + p.maxAge + ' Tage</dd><dt>Sperrschwelle</dt><dd>' + p.lockThreshold + ' Fehlversuche</dd></dl>';
  // Resultierende Richtlinie
  var opts = AD.users.map(function(u){ return '<option value="' + u.id + '"' + (u.id === adState.rsop ? ' selected' : '') + '>' + esc(u.display) + '</option>'; }).join("");
  var r = adRsop(adState.rsop), u = adUser(adState.rsop);
  $("#adRsop").innerHTML = '<div class="card-h"><h2>Resultierende Richtlinie</h2></div><div class="field"><label for="adRsopSel">Für Benutzer</label><select class="inp" id="adRsopSel">' + opts + '</select></div>' +
    (u ? '<p class="hint" style="margin:8px 0">OU: ' + esc(adPath(u.ou).map(function(o){ return o.name; }).join(" › ")) + '</p>' : '') +
    '<div class="lbl" style="margin:10px 0 6px">Angewendet, in Reihenfolge</div>' + (r.gpos.map(function(a, i){ return '<div class="li ad-li"><span><span class="tag t-mut">' + (i + 1) + '</span> ' + esc(a.g.name) + '</span><span class="sub">' + esc(adOu(a.ou).name) + (a.enforced ? " · erzwungen" : "") + '</span></div>'; }).join("") || '<p class="hint">Keine.</p>') +
    '<div class="lbl" style="margin:14px 0 6px">Wirksame Einstellungen</div>' + (r.settings.map(function(s){ return '<div class="li ad-li"><span>' + esc(s.k) + '<span class="sub" style="display:block">aus ' + esc(s.src) + '</span></span><strong>' + esc(s.v) + '</strong></div>'; }).join("") || '<p class="hint">Keine.</p>') +
    (u && adPolicyFor(u.id).name !== "Default Domain Policy" ? '<div class="note info" style="margin-top:12px">Für dieses Konto gilt bei Kennwörtern zusätzlich ' + esc(adPolicyFor(u.id).name) + '.</div>' : '');
}

/* Standorte und Replikation */
function renderAdSites(){
  $("#adSites").innerHTML = AD.sites.map(function(s){ return '<tr><td><strong>' + esc(s.name) + '</strong></td><td class="mono">' + esc(s.subnet) + '</td><td>' + (s.dcs.join(", ") || '<span class="hint">kein DC, Anmeldung über Standortverknüpfung</span>') + '</td><td>' + (s.gc ? adTag("Globaler Katalog", "t-info") : "") + '</td></tr>'; }).join("");
  $("#adLinks").innerHTML = AD.siteLinks.map(function(l){ return '<tr><td>' + esc(l.name) + '</td><td>' + esc(l.sites) + '</td><td class="num">' + l.cost + '</td><td class="num">' + l.interval + ' min</td></tr>'; }).join("");
  $("#adDcs").innerHTML = AD.computers.filter(function(c){ return c.role === "Domänencontroller"; }).map(function(c){
    var reach = c.name === "DC-02" ? adDnsOk() : true;
    return '<tr><td><strong>' + esc(c.name) + '</strong><div class="sub">' + esc(c.os) + '</div></td><td>' + esc(c.site) + '</td><td class="mono">' + esc(c.ip) + '</td><td>' + (reach ? adTag("erreichbar", "t-ok") : adTag("Name nicht auflösbar", "t-bad")) + '</td></tr>';
  }).join("");
  $("#adRepl").innerHTML = AD.repl.map(function(r){ return '<tr><td>' + esc(r.from) + ' → ' + esc(r.to) + '</td><td class="mono" style="font-size:12px">' + esc(r.ctx) + '</td><td>' + adAgeText(r.last) + '</td><td>' + (r.ok ? adTag("erfolgreich", "t-ok") : adTag("Fehler", "t-bad") + '<div class="sub">' + esc(r.err) + '</div>') + '</td></tr>'; }).join("");
  $("#adFsmo").innerHTML = Object.keys(AD.fsmo).map(function(k){ return '<tr><td>' + esc(k) + '</td><td><strong>' + esc(AD.fsmo[k]) + '</strong></td><td style="text-align:right"><button class="btn btn-s btn-sm" type="button" data-ad-fsmo="' + esc(k) + '">Übertragen</button></td></tr>'; }).join("");
  $("#adReplNote").innerHTML = adReplOk() ? '<div class="note ok">Alle Partitionen synchron. Änderungen erreichen beide Domänencontroller.</div>' : '<div class="note bad">Fehler 8524 bedeutet: Der Name des Partners ließ sich nicht auflösen. Prüfe im DNS die A-Einträge der Domänencontroller, dann neu replizieren.</div>';
}

/* DNS */
function renderAdDns(){
  $("#adDns").innerHTML = AD.dns.map(function(r){
    var wrong = r.name === "dc-02" && r.type === "A" && r.value !== "10.0.3.10";
    return '<tr><td class="mono">' + esc(r.name) + '</td><td>' + esc(r.type) + '</td><td class="mono">' + esc(r.value) + (wrong ? ' ' + adTag("passt nicht zu DC-02 (10.0.3.10)", "t-bad") : '') + '</td><td>' + (r.stale ? adTag(r.stamp, "t-warn") : esc(r.stamp)) + '</td>' +
      '<td style="text-align:right;white-space:nowrap"><button class="btn btn-s btn-sm" type="button" data-ad-dnsedit="' + r.id + '">Bearbeiten</button> <button class="btn btn-g btn-sm" type="button" data-ad-dnsdel="' + r.id + '">Löschen</button></td></tr>';
  }).join("");
}
function adNslookup(q){
  q = (q || "").trim().toLowerCase().replace("." + AD.domain, "");
  if (!q) return "Namen eingeben, zum Beispiel dc-02.";
  var hits = AD.dns.filter(function(r){ return r.name === q; });
  if (!hits.length) return "*** " + q + "." + AD.domain + " wurde nicht gefunden: Non-existent domain";
  return hits.map(function(r){ return "Name: " + r.name + "." + AD.domain + "   " + r.type + "   " + r.value; }).join("\n");
}

/* Sicherheit und Papierkorb */
function renderAdSec(){
  var f = adFindings(), sc = adScore();
  $("#adScore").innerHTML = '<div class="ad-score"><div class="ad-score-n num" style="color:' + (sc >= 80 ? "var(--ok)" : sc >= 55 ? "var(--warn)" : "var(--bad)") + '">' + sc + '</div><div><div class="l" style="font-weight:700">Sicherheitswert</div><div class="hint">' + f.length + ' offene Befunde · ' + f.filter(function(x){ return x.sev === "hoch"; }).length + ' davon hoch</div></div></div><div class="bar ' + (sc >= 80 ? "ok" : sc >= 55 ? "warn" : "bad") + '" style="margin-top:12px"><i style="width:' + sc + '%"></i></div>';
  $("#adFindings").innerHTML = f.length ? f.map(function(x){
    return '<div class="ad-find"><span class="tag ' + (x.sev === "hoch" ? "t-bad" : x.sev === "mittel" ? "t-warn" : "t-mut") + '">' + x.sev + '</span><div style="flex:1;min-width:200px"><div style="font-weight:650">' + esc(x.title) + '</div><div class="hint">' + esc(x.detail) + '</div></div><button class="btn btn-s btn-sm" type="button" data-ad-fix="' + x.act + '|' + esc(x.arg) + '">' + esc(x.fix) + '</button></div>';
  }).join("") : '<div class="note ok">Keine offenen Befunde. Gute Arbeit.</div>';
  $("#adEvents").innerHTML = AD.events.slice().reverse().map(function(e){ return '<tr><td class="num">' + (e.d === 0 ? "heute" : e.d === -1 ? "gestern" : "vor " + (-e.d) + " T.") + ' ' + esc(e.t) + '</td><td class="mono">' + e.id + '</td><td>' + esc(e.txt) + '</td></tr>'; }).join("");
}
function renderAdBin(){
  $("#adBin").innerHTML = AD.deleted.length ? AD.deleted.map(function(d, i){
    var o = d.obj;
    return '<tr><td><span class="ad-ic ' + d.kind + '">' + AD_ICON[d.kind] + '</span> <strong>' + esc(o.display || o.name) + '</strong></td><td>' + (d.kind === "user" ? "Benutzer" : d.kind === "group" ? "Gruppe" : "Computer") + '</td><td>' + esc(adOu(d.from) ? adOu(d.from).name : "(gelöscht)") + '</td><td>' + adAgeText(d.when) + '</td><td>noch ' + (180 + d.when) + ' Tage</td><td style="text-align:right"><button class="btn btn-sm" type="button" data-ad-restore="' + i + '">Wiederherstellen</button></td></tr>';
  }).join("") : '<tr><td colspan="6" class="hint">Der Papierkorb ist leer.</td></tr>';
}

/* Gesamt */
function renderAD(){
  if (!$("#adTree")) return;
  var act = AD.users.filter(function(u){ return u.enabled; }).length, lk = AD.users.filter(function(u){ return u.locked; }).length;
  $("#adKpiUsers").textContent = act;
  $("#adKpiUsersS").textContent = lk ? lk + " gesperrt" : "keins gesperrt";
  $("#adKpiGroups").textContent = AD.groups.length;
  $("#adKpiComp").textContent = AD.computers.length;
  var sc = adScore();
  $("#adKpiScore").textContent = sc;
  $("#adKpiScore").style.color = sc >= 80 ? "var(--ok)" : sc >= 55 ? "var(--warn)" : "var(--bad)";
  $("#adKpiRepl").textContent = adReplOk() ? "OK" : "Fehler";
  $("#adKpiRepl").style.color = adReplOk() ? "var(--ok)" : "var(--bad)";
  $$("[data-ad-tab]").forEach(function(b){ b.setAttribute("aria-selected", b.getAttribute("data-ad-tab") === adState.tab ? "true" : "false"); });
  $$("[data-ad-panel]").forEach(function(p){ p.hidden = p.getAttribute("data-ad-panel") !== adState.tab; });
  var tb = adState.tab;
  if (tb !== "aduc") $("#adProps").innerHTML = "";
  if (tb !== "groups") $("#adGrpDetail").innerHTML = "";
  if (tb === "aduc") { $("#adTree").innerHTML = adTreeHtml("dom", 0); renderAdList(); renderAdProps(); }
  if (tb === "groups") renderAdGroups();
  if (tb === "gpo") renderAdGpo();
  if (tb === "sites") renderAdSites();
  if (tb === "dns") renderAdDns();
  if (tb === "sec") renderAdSec();
  if (tb === "bin") renderAdBin();
  $("#adBinCount").textContent = AD.deleted.length;
}

/* Klicks und Eingaben */
(function(){
  var sec = $('[data-screen="verzeichnis"]');
  if (!sec) return;
  sec.addEventListener("click", function(e){
    var t = e.target, x;
    if ((x = t.closest("[data-ad-tab]"))) { adState.tab = x.getAttribute("data-ad-tab"); adState.ptab = "general"; renderAD(); return; }
    if ((x = t.closest("[data-ad-toggle]"))) { var id = x.getAttribute("data-ad-toggle"); adState.open[id] = !adState.open[id]; renderAD(); return; }
    if ((x = t.closest("[data-ad-node]"))) { adState.node = x.getAttribute("data-ad-node"); adState.open[adState.node] = true; adState.sel = null; adState.search = ""; var si = $("#adSearch"); if (si) si.value = ""; renderAD(); return; }
    if ((x = t.closest("[data-ad-row]"))) {
      var v = x.getAttribute("data-ad-row").split(":"), kind = v[0], oid = v.slice(1).join(":");
      if (kind === "ou" || kind === "container") { adState.node = oid; adState.open[oid] = true; adState.sel = null; }
      else { adState.sel = oid; if (adState.ptab === "members" && kind !== "group") adState.ptab = "general"; }
      renderAD(); return;
    }
    if ((x = t.closest("[data-ad-ptab]"))) { adState.ptab = x.getAttribute("data-ad-ptab"); renderAD(); return; }
    if ((x = t.closest("[data-ad-new]"))) { var n = x.getAttribute("data-ad-new"); if (n === "user") adNewUser(); if (n === "group") adNewGroup(); if (n === "ou") adNewOu(); if (n === "computer") adNewComputer(); return; }
    if ((x = t.closest("[data-ad-act]"))) {
      var a = x.getAttribute("data-ad-act"), id2 = x.getAttribute("data-id"), o = adObj(id2);
      if (a === "pw") adResetPw(id2);
      if (a === "unlock") { o.locked = false; o.failed = 0; adLog(4767, "Konto entsperrt: " + id2); renderAD(); toast(o.display + " entsperrt.", "ok"); }
      if (a === "toggle") { o.enabled = !o.enabled; adLog(o.enabled ? 4722 : 4725, (o.enabled ? "Konto aktiviert: " : "Konto deaktiviert: ") + adName(id2)); renderAD(); toast(adName(id2) + (o.enabled ? " aktiviert." : " deaktiviert."), "ok"); }
      if (a === "move") adMove(id2);
      if (a === "addgrp") adAddToGroup(id2);
      if (a === "del") adDelete(id2);
      if (a === "resetcomp") { adLog(4742, "Computerkonto zurückgesetzt: " + o.name); toast("Konto von " + o.name + " zurückgesetzt. Der Rechner muss neu der Domäne beitreten.", "ok"); renderAD(); }
      if (a === "newsubou") { adState.node = id2; adNewOu(); }
      if (a === "delou") adDeleteOu(id2);
      return;
    }
    if ((x = t.closest("[data-ad-save]"))) {
      var w = x.getAttribute("data-ad-save"), u = adUser(adState.sel), g;
      if (w === "general" && u) { u.first = $("#adfFirst").value.trim(); u.last = $("#adfLast").value.trim(); u.display = $("#adfDisplay").value.trim() || u.display; u.desc = $("#adfDesc").value.trim(); u.office = $("#adfOffice").value.trim(); u.phone = $("#adfPhone").value.trim(); u.mail = $("#adfMail").value.trim(); }
      if (w === "account" && u) {
        var dis = $("#adfDis").checked;
        if (dis === u.enabled) adLog(dis ? 4725 : 4722, (dis ? "Konto deaktiviert: " : "Konto aktiviert: ") + u.id);
        u.mustChange = $("#adfMust").checked; u.neverExp = $("#adfNever").checked; u.enabled = !dis; u.sensitive = $("#adfSens").checked;
        adLog(4738, "Benutzerkonto geändert: " + u.id);
      }
      if (w === "org" && u) { u.title = $("#adfTitle").value.trim(); u.dept = $("#adfDept").value.trim(); u.company = $("#adfCompany").value.trim(); u.manager = $("#adfMgr").value; }
      if (w === "profile" && u) { u.profile = $("#adfProfile").value.trim(); u.script = $("#adfScript").value.trim(); u.home = $("#adfHome").value.trim(); }
      if (w === "group") {
        g = adGroup(adState.tab === "groups" ? adState.grpSel : adState.sel);
        var ns = $("#agfScope").value;
        if (!g.builtin && ns !== g.scope && ((g.scope === "Global" && ns === "Domänenlokal") || (g.scope === "Domänenlokal" && ns === "Global"))) { toast("Global und Domänenlokal lassen sich nur über Universal umwandeln.", "bad"); return; }
        if (!g.builtin) { g.name = $("#agfName").value.trim() || g.name; g.scope = ns; g.type = $("#agfType").value; }
        g.desc = $("#agfDesc").value.trim();
        adLog(4737, "Gruppe geändert: " + g.name);
      }
      if (w === "ou") { adOu(adState.node).prot = $("#adOuProt").checked; }
      renderAD(); toast("Gespeichert.", "ok"); return;
    }
    if ((x = t.closest("[data-ad-rmgrp]"))) { adSetMember(x.getAttribute("data-ad-rmgrp"), adState.sel, false); renderAD(); toast("Aus der Gruppe entfernt.", "ok"); return; }
    if ((x = t.closest("[data-ad-rmmem]"))) { var gg = adGroup(adState.tab === "groups" ? adState.grpSel : adState.sel); adSetMember(gg.id, x.getAttribute("data-ad-rmmem"), false); renderAD(); toast(adName(x.getAttribute("data-ad-rmmem")) + " aus " + gg.name + " entfernt.", "ok"); return; }
    if ((x = t.closest("[data-ad-addmem]"))) {
      var tg = adGroup(x.getAttribute("data-ad-addmem")), mem = $("#agfAdd").value;
      if (tg.members.indexOf(mem) >= 0) { toast("Schon Mitglied.", "bad"); return; }
      var mg = adGroup(mem);
      if (mg && tg.scope === "Global" && mg.scope !== "Global") { toast("Globale Gruppen können nur Konten und globale Gruppen enthalten.", "bad"); return; }
      if (mg && adAllGroups(tg.id).some(function(y){ return y.g.id === mem; })) { toast("Das ergäbe eine Schleife in der Verschachtelung.", "bad"); return; }
      adSetMember(tg.id, mem, true); renderAD(); toast(adName(mem) + " zu " + tg.name + " hinzugefügt.", "ok"); return;
    }
    if ((x = t.closest("[data-ad-grp]"))) { adState.grpSel = x.getAttribute("data-ad-grp"); adState.ptab = "members"; renderAD(); return; }
    if ((x = t.closest("[data-ad-gpo]"))) { adState.gpoSel = x.getAttribute("data-ad-gpo"); renderAD(); return; }
    if ((x = t.closest("[data-ad-enf]")) || (x = t.closest("[data-ad-lnk]")) || (x = t.closest("[data-ad-unlink]"))) {
      var attr = x.hasAttribute("data-ad-enf") ? "data-ad-enf" : x.hasAttribute("data-ad-lnk") ? "data-ad-lnk" : "data-ad-unlink";
      var pr = x.getAttribute(attr).split("|"), gp = AD.gpos.filter(function(y){ return y.id === pr[0]; })[0], li = gp.links[+pr[1]];
      if (attr === "data-ad-enf") li.enforced = !li.enforced;
      if (attr === "data-ad-lnk") li.enabled = !li.enabled;
      if (attr === "data-ad-unlink") { gp.links.splice(+pr[1], 1); toast("Verknüpfung entfernt.", "ok"); }
      adLog(5136, "GPO-Verknüpfung geändert: " + gp.name);
      renderAD(); return;
    }
    if ((x = t.closest("[data-ad-link]"))) { adLinkGpo(x.getAttribute("data-ad-link")); return; }
    if ((x = t.closest("[data-ad-gpostatus]"))) { var gs = AD.gpos.filter(function(y){ return y.id === x.getAttribute("data-ad-gpostatus"); })[0]; gs.status = gs.status === "aktiviert" ? "deaktiviert" : "aktiviert"; renderAD(); toast(gs.name + " " + gs.status + ".", "ok"); return; }
    if ((x = t.closest("[data-ad-policy]"))) { adEditPolicy(x.getAttribute("data-ad-policy") === "pso"); return; }
    if (t.closest("[data-ad-repl]")) { adReplicate(); return; }
    if ((x = t.closest("[data-ad-fsmo]"))) { adTransferRole(x.getAttribute("data-ad-fsmo")); return; }
    if ((x = t.closest("[data-ad-dnsedit]"))) { adEditDns(x.getAttribute("data-ad-dnsedit")); return; }
    if (t.closest("[data-ad-dnsnew]")) { adEditDns(null); return; }
    if ((x = t.closest("[data-ad-dnsdel]"))) {
      var rid = x.getAttribute("data-ad-dnsdel"), rr = AD.dns.filter(function(y){ return y.id === rid; })[0];
      confirmModal("DNS-Eintrag löschen?", rr.name + " (" + rr.type + " " + rr.value + ") wird entfernt.", "Löschen", "btn-d", function(){ AD.dns.splice(AD.dns.indexOf(rr), 1); renderAD(); toast("Eintrag gelöscht.", "ok"); });
      return;
    }
    if (t.closest("[data-ad-scav]")) {
      var st = AD.dns.filter(function(y){ return y.stale; });
      if (!st.length) { toast("Keine veralteten Einträge.", "ok"); return; }
      confirmModal("Veraltete Einträge bereinigen?", st.length + " dynamische Einträge älter als 90 Tage werden gelöscht: " + st.map(function(y){ return y.name; }).join(", ") + ".", "Bereinigen", "", function(){ AD.dns = AD.dns.filter(function(y){ return !y.stale; }); renderAD(); toast("Bereinigt.", "ok"); });
      return;
    }
    if (t.closest("[data-ad-ns]")) { $("#adNsOut").textContent = adNslookup($("#adNs").value); return; }
    if ((x = t.closest("[data-ad-fix]"))) { var fp = x.getAttribute("data-ad-fix").split("|"); adFix(fp[0], fp.slice(1).join("|")); return; }
    if ((x = t.closest("[data-ad-restore]"))) { adRestore(+x.getAttribute("data-ad-restore")); return; }
  });
  sec.addEventListener("input", function(e){
    if (e.target.id === "adSearch") { adState.search = e.target.value; adState.sel = null; renderAdList(); renderAdProps(); }
    if (e.target.id === "adGrpQ") renderAdGroups();
  });
  sec.addEventListener("change", function(e){
    if (e.target.id === "adRsopSel") { adState.rsop = e.target.value; renderAD(); }
  });
  sec.addEventListener("keydown", function(e){
    if (e.target.id === "adNs" && e.key === "Enter") { e.preventDefault(); $("#adNsOut").textContent = adNslookup(e.target.value); }
  });
})();

/* ---------- Gesamt-Render ---------- */
function renderAll(){
  renderHome(); renderTickets(); renderChanges(); renderUsers(); renderInvoices();
  renderSaves(); renderStaff(); renderPrices(); renderServerroom();
  renderServices(); renderAccess(); renderReports(); renderRoutines(); renderAutomations();
  renderMilestones(); renderLastShift(); renderCash(); renderOverview(); renderWorkshop(); updateConn(); renderPcIcons(); renderPostmortems(); renderWorkshopJobs(); renderAD();
  $("#bellCount").textContent = tickets.filter(function(t){ return t.prio === "Kritisch" && t.status !== "Gelöst"; }).length + 2;
}

/* ---------- Plattform: Server, Konten, Speicherstände, Admin ---------- */
var P = { status:null, user:null, save:null, rev:0, lastSaved:"", saving:false, adminData:null, authMode:"login",
  savesList:[], savesMeta:{ owned:0, limit:5 }, defaultState:null, company:"Nordlicht IT Service", prices:{}, settingsTimer:null, savedAt:null };
var FREE_ROUTES = ["login", "saves", "neues-spiel", "einstellungen", "admin", "support", "changelog"];
var START_CASH = { leicht:25000, normal:18420, schwer:12000 };

function api(method, url, body){
  var opt = { method:method, headers:{ "X-Requested-With":"craftit" }, credentials:"same-origin" };
  if (body !== undefined) { opt.headers["Content-Type"] = "application/json"; opt.body = JSON.stringify(body); }
  return fetch("/api" + url, opt).then(function(r){
    return r.json().catch(function(){ return {}; }).then(function(data){
      if (!r.ok) {
        var e = new Error(data.error || ("Fehler " + r.status));
        e.status = r.status; e.data = data;
        if (r.status === 401 && P.user && url !== "/auth/login") { sessionLost(); }
        throw e;
      }
      return data;
    });
  });
}
function apiErr(e){ toast(e.message || "Unbekannter Fehler.", "bad"); }
function sessionLost(){
  P.user = null; P.save = null; paused = true;
  toast("Die Sitzung ist abgelaufen. Bitte neu anmelden.", "bad");
  setAuthMode("login");
  location.hash = "login";
}

/* Spielstand */
function captureState(){
  return JSON.parse(JSON.stringify({
    schema:1, company:P.company, day:day, minutes:minutes,
    tickets:tickets, changes:changes, services:services, maint:maint, accessReq:accessReq, audit:audit, teams:teams,
    routines:routines, policies:policies, resources:resources, autos:autos, milestones:milestones, scenarios:scenarios,
    shiftLog:shiftLog, cash:cash, staff:staff, candidates:candidates, invoices:invoices, closedInShift:closedInShift, shiftIndex:shiftIndex,
    racks:racks, devices:devices, cables:cables, WS:WS, pcInv:pcInv, PC_CHAT:PC_CHAT, PC_MAILS:PC_MAILS, CAL_EVENTS:CAL_EVENTS,
    secScore:secScore, secDone:secDone, postmortems:postmortems, WJ_PARTS:WJ_PARTS, WJ_OWNED:WJ_OWNED, WJ_LOANERS:WJ_LOANERS,
    WJ_ORDERS:WJ_ORDERS, WJ_JOBS:WJ_JOBS, AD:AD, prices:P.prices || {}, notes:pcState.notes || ""
  }));
}
function applyState(src){
  var c = JSON.parse(JSON.stringify(src));
  P.company = c.company || "Nordlicht IT Service";
  day = c.day; minutes = c.minutes;
  tickets = c.tickets; changes = c.changes; services = c.services; maint = c.maint; accessReq = c.accessReq; audit = c.audit; teams = c.teams;
  routines = c.routines; policies = c.policies; resources = c.resources; autos = c.autos; milestones = c.milestones; scenarios = c.scenarios;
  shiftLog = c.shiftLog; cash = c.cash; staff = c.staff; candidates = c.candidates; invoices = c.invoices; closedInShift = c.closedInShift; shiftIndex = c.shiftIndex;
  racks = c.racks; devices = c.devices; cables = c.cables; WS = c.WS; pcInv = c.pcInv; PC_CHAT = c.PC_CHAT; PC_MAILS = c.PC_MAILS; CAL_EVENTS = c.CAL_EVENTS;
  secScore = c.secScore; secDone = c.secDone; postmortems = c.postmortems; WJ_PARTS = c.WJ_PARTS; WJ_OWNED = c.WJ_OWNED; WJ_LOANERS = c.WJ_LOANERS;
  WJ_ORDERS = c.WJ_ORDERS; WJ_JOBS = c.WJ_JOBS; AD = c.AD; P.prices = c.prices || {}; pcState.notes = c.notes || "";
  // Ansichtszustände zurücksetzen
  currentTicket = tickets[0] ? tickets[0].id : null;
  adState.sel = null; adState.node = "ma-it"; adState.tab = "aduc"; adState.search = "";
  ROOM.rack = "A"; hlDev = null; hlCable = null;
  mailState.sel = null; mailState.compose = false; mailState.reply = false;
  pmState.sel = postmortems[0] ? postmortems[0].id : null;
  WSD.wins.slice().forEach(function(w){ wsdClose(w.app); });
  rdpActive = false; var rd = $("#rdp"); if (rd) rd.hidden = true;
  wiz = { step:0, type:"einzel", name:"", diff:"normal", focus:"it" };
  showClock(); updateCompany();
}
function showClock(){
  var hh = String(Math.floor(minutes / 60)).padStart(2, "0"), mm = String(minutes % 60).padStart(2, "0");
  $("#clock").innerHTML = "Tag <b>" + day + "</b> · <b>" + hh + ":" + mm + "</b>";
}
function updateCompany(){ $$(".js-company").forEach(function(el){ el.textContent = P.company; }); }

/* Autosave */
function setSaveStatus(kind, msg){
  var el = $("#saveStatus");
  if (!el) return;
  el.hidden = !P.save;
  var t = P.savedAt ? P.savedAt.toLocaleTimeString("de-DE", { hour:"2-digit", minute:"2-digit" }) : "";
  var map = { ok:["Gespeichert " + t, "t-ok"], saving:["Speichert …", "t-info"], error:["Nicht gespeichert", "t-bad"], conflict:["Konflikt", "t-bad"], idle:["Nicht gespeichert", "t-mut"] };
  var m = map[kind] || map.idle;
  el.textContent = m[0];
  el.className = "tag save-status " + m[1];
  el.title = msg || "Klicken zum Speichern";
}
function autosave(force){
  if (!P.save || P.saving) return Promise.resolve(false);
  var st = captureState(), str = JSON.stringify(st);
  if (!force && str === P.lastSaved) return Promise.resolve(true);
  P.saving = true; setSaveStatus("saving");
  return api("PUT", "/saves/" + P.save.id, { rev:P.rev, state:st }).then(function(r){
    P.rev = r.rev; P.lastSaved = str; P.saving = false; P.savedAt = new Date(); setSaveStatus("ok");
    return true;
  }).catch(function(e){
    P.saving = false;
    if (e.status === 409) { setSaveStatus("conflict"); conflictModal(); }
    else setSaveStatus("error", e.message);
    return false;
  });
}
function conflictModal(){
  openModal({
    title:"Spielstand wurde geändert", sub:"Ein Mitspieler hat in der Zwischenzeit gespeichert.",
    body:'<p class="muted">Du kannst den neuesten Stand laden (deine letzten Änderungen gehen verloren) oder deine Version behalten und damit den Stand des Mitspielers überschreiben.</p>',
    actions:'<button class="btn btn-s" type="button" data-mdact="keep">Meine Version behalten</button><button class="btn" type="button" data-mdact="reload">Neuesten Stand laden</button>',
    onAction:function(a, el, close){
      close();
      if (a === "reload") loadSave(P.save.id, true);
      if (a === "keep") api("GET", "/saves/" + P.save.id).then(function(d){ P.rev = d.save.rev; return autosave(true); }).then(function(ok){ if (ok) toast("Deine Version ist gespeichert.", "ok"); }).catch(apiErr);
    }
  });
}
setInterval(function(){ autosave(false); }, 30000);
$("#saveStatus").addEventListener("click", function(){ autosave(true).then(function(ok){ if (ok) toast("Gespeichert.", "ok"); }); });
document.addEventListener("visibilitychange", function(){ if (document.visibilityState === "hidden") autosave(false); });

/* Anmeldung, Einrichtung, Registrierung */
function setAuthMode(mode){
  P.authMode = mode;
  var reg = P.status ? P.status.registration : "invite";
  var t = { login:["Anmelden", "Mit deinem CraftIT-Konto weitermachen.", "Anmelden"], setup:["Server einrichten", "Lege das erste Konto an. Es wird Server-Admin.", "Server einrichten"], register:["Konto erstellen", reg === "invite" ? "Du brauchst einen Einladungscode vom Server-Admin." : "Ein Konto für Einzel- und Koop-Spiele.", "Konto erstellen"] }[mode];
  $("#authTitle").textContent = t[0]; $("#authLead").textContent = t[1]; $("#authSubmit").textContent = t[2];
  $("#fServer").hidden = mode !== "setup";
  $("#fEmail").hidden = mode === "login";
  $("#fPw2").hidden = mode === "login";
  $("#fInvite").hidden = !(mode === "register" && reg === "invite");
  $("#authForgot").hidden = mode !== "login";
  $("#loginPw").setAttribute("autocomplete", mode === "login" ? "current-password" : "new-password");
  $("#authErr").hidden = true;
  ["loginMailErr", "loginPwErr", "authPw2Err", "authInviteErr"].forEach(function(id){ $("#" + id).textContent = ""; });
  var sw = $("#authSwitch");
  if (mode === "login") sw.innerHTML = reg === "closed" ? 'Die Registrierung ist geschlossen. Konten legt der Server-Admin an.' : 'Noch kein Konto? <a href="#" class="crumb-link" data-auth-mode="register">Konto erstellen</a>';
  else if (mode === "register") sw.innerHTML = 'Schon ein Konto? <a href="#" class="crumb-link" data-auth-mode="login">Anmelden</a>';
  else sw.innerHTML = 'Der Server hat noch kein Konto. Das erste wird Server-Admin.';
}
document.addEventListener("click", function(e){
  var m = e.target.closest("[data-auth-mode]");
  if (m) { e.preventDefault(); setAuthMode(m.getAttribute("data-auth-mode")); }
});
$("#loginForm").addEventListener("submit", function(e){
  e.preventDefault();
  var mode = P.authMode;
  var name = $("#loginMail").value.trim(), pw = $("#loginPw").value;
  var ok = true;
  function bad(id, msg){ $("#" + id).textContent = msg; ok = false; }
  ["loginMailErr", "loginPwErr", "authPw2Err", "authInviteErr"].forEach(function(id){ $("#" + id).textContent = ""; });
  $("#authErr").hidden = true;
  if (!name) bad("loginMailErr", "Bitte den Benutzernamen eingeben.");
  else if (mode !== "login" && !/^[A-Za-z0-9][A-Za-z0-9._-]{2,31}$/.test(name)) bad("loginMailErr", "3 bis 32 Zeichen: Buchstaben, Ziffern, Punkt, Bindestrich, Unterstrich.");
  if (!pw) bad("loginPwErr", "Bitte das Kennwort eingeben.");
  else if (mode !== "login" && pw.length < 8) bad("loginPwErr", "Mindestens 8 Zeichen.");
  if (mode !== "login" && pw !== $("#authPw2").value) bad("authPw2Err", "Die Kennwörter stimmen nicht überein.");
  if (mode === "register" && !$("#fInvite").hidden && !$("#authInvite").value.trim()) bad("authInviteErr", "Bitte den Einladungscode eingeben.");
  if (!ok) return;
  var btn = $("#authSubmit"); btn.disabled = true;
  var req = mode === "setup" ? api("POST", "/setup", { username:name, password:pw, email:$("#authEmail").value.trim(), serverName:$("#authServer").value.trim() })
    : mode === "register" ? api("POST", "/auth/register", { username:name, password:pw, email:$("#authEmail").value.trim(), invite:$("#authInvite").value.trim() })
    : api("POST", "/auth/login", { username:name, password:pw });
  req.then(function(d){
    $("#loginPw").value = ""; $("#authPw2").value = "";
    if (P.status) P.status.needsSetup = false;
    onLoggedIn(d.user);
    toast(mode === "setup" ? "Server eingerichtet. Willkommen!" : mode === "register" ? "Konto erstellt. Willkommen!" : "Angemeldet als " + d.user.display + ".", "ok");
  }).catch(function(e){ var el = $("#authErr"); el.textContent = e.message; el.hidden = false; })
    .then(function(){ btn.disabled = false; });
});
function onLoggedIn(user){
  P.user = user;
  applyUserSettings();
  updateUserUI();
  refreshSupportBadge();
  if (user.mustChange) setTimeout(function(){ passwordModal(true); }, 300);
  var h = (location.hash || "").replace("#", "");
  // Resume the save that was open before a reload, on the page that was open.
  var last = +_localGet("lastSave:" + user.id, 0);
  if (last) {
    loadSave(last, true, ROUTES[h] && h !== "login" && h !== "neues-spiel" ? h : "uebersicht").then(function(ok){
      if (!ok) { location.hash = "saves"; render(); }
    });
    return;
  }
  location.hash = (FREE_ROUTES.indexOf(h) > 0 && (h !== "admin" || user.role === "admin")) ? h : "saves";
  render();
}
function applyUserSettings(){
  var s = (P.user && P.user.settings) || {};
  P.applying = true;
  if (s.theme) applyTheme(s.theme);
  if (s.prefs) { prefs = s.prefs; applyPrefs(); }
  P.applying = false;
}
function updateUserUI(){
  var u = P.user;
  document.body.classList.toggle("no-save", !P.save);
  $$(".js-userdisplay").forEach(function(el){ el.textContent = u ? u.display : "—"; });
  $$(".js-user").forEach(function(el){ el.textContent = u ? u.username : "—"; });
  var role = $("#userRole");
  if (role) role.textContent = u ? (u.role === "admin" ? "Server-Admin" : "Spieler") + " · " + (P.save ? P.company : "kein Spielstand geöffnet") : "";
  var ns = $("#navServer");
  if (ns) ns.hidden = !u || u.role !== "admin";
  var g = $("#greet");
  if (g && u) { var hr = Math.floor(minutes / 60); g.textContent = (hr < 11 ? "Guten Morgen, " : hr < 18 ? "Guten Tag, " : "Guten Abend, ") + u.display + "."; }
}
function doLogout(){
  var finish = function(){
    api("POST", "/auth/logout").catch(function(){}).then(function(){
      P.user = null; P.save = null; P.adminData = null; paused = true;
      applyState(P.defaultState);
      setSaveStatus("idle");
      setAuthMode("login");
      updateUserUI();
      if (location.hash !== "#login") location.hash = "login"; else render();
      toast("Abgemeldet.");
    });
  };
  if (P.save) autosave(false).then(finish); else finish();
}

/* Routen-Schutz (wird von render() aufgerufen) */
function platformGuard(r){
  if (!P.user) { if (r !== "login") { location.replace("#login"); return false; } return true; }
  if (r === "login") { doLogout(); return false; }
  if (r === "admin" && P.user.role !== "admin") { toast("Nur für Server-Admins.", "bad"); location.replace(P.save ? "#uebersicht" : "#saves"); return false; }
  if (!P.save && FREE_ROUTES.indexOf(r) < 0) { location.replace("#saves"); return false; }
  if (r === "saves") loadSavesList();
  if (r === "admin") loadAdmin();
  if (r === "support") loadSupport();
  if (r === "changelog") loadChangelog();
  updateUserUI();
  if (P.save) autosave(false);
  return true;
}

/* Einstellungen am Konto speichern */
var _localGet = store.get, _localSet = store.set;
store.get = function(k, d){
  if (k === "prices") return P.prices && Object.keys(P.prices).length ? P.prices : d;
  if (P.user && (k === "theme" || k === "prefs")) { var v = (P.user.settings || {})[k]; return v === undefined ? d : v; }
  return _localGet(k, d);
};
store.set = function(k, v){
  if (k === "prices") { P.prices = v; return; }
  if (k === "theme") _localSet(k, v);
  if (P.user && !P.applying && (k === "theme" || k === "prefs")) {
    P.user.settings = P.user.settings || {};
    P.user.settings[k] = v;
    clearTimeout(P.settingsTimer);
    P.settingsTimer = setTimeout(function(){ api("PUT", "/me/settings", { settings:P.user.settings }).catch(apiErr); }, 600);
  }
};

/* Speicherstände */
function relTime(iso){
  var d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "gerade eben";
  if (d < 3600) return "vor " + Math.floor(d / 60) + " Min.";
  if (d < 86400) return "vor " + Math.floor(d / 3600) + " Std.";
  return new Date(iso).toLocaleDateString("de-DE");
}
function loadSavesList(){
  return api("GET", "/saves").then(function(d){ P.savesList = d.saves; P.savesMeta = { owned:d.owned, limit:d.limit }; renderSaves(); }).catch(function(e){ if (e.status !== 401) apiErr(e); });
}
function renderSaves(){
  var grid = $("#saveGrid");
  if (!grid) return;
  var diffName = { leicht:"Leicht", normal:"Normal", schwer:"Schwer" };
  grid.innerHTML = P.savesList.map(function(s){
    var open = P.save && P.save.id === s.id;
    var mode = s.mode === "coop" ? "Koop · " + s.members.length + " Mitglied" + (s.members.length === 1 ? "" : "er") : "Einzelspiel";
    return '<article class="card save" data-save-id="' + s.id + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px"><div style="min-width:0"><h2 style="font-size:19px;overflow-wrap:anywhere">' + esc(s.name) + '</h2><div class="hint">' + esc(mode) + (s.owner ? '' : ' · eingeladen') + '</div></div>' +
      '<span class="tag ' + (open ? 't-ok' : 't-info') + '">' + (open ? 'geöffnet' : 'Tag ' + s.day) + '</span></div>' +
      '<div class="meta"><span class="tag t-mut">Schwierigkeit ' + esc(diffName[s.diff] || s.diff) + '</span><span class="tag t-mut">Gespeichert ' + esc(relTime(s.updatedAt)) + '</span>' + (open ? '<span class="tag t-mut">Tag ' + s.day + '</span>' : '') + '</div>' +
      '<div class="acts" style="margin-top:auto"><button class="btn btn-sm" type="button" data-save-play="' + s.id + '">' + (open ? 'Weiterspielen' : 'Fortsetzen') + '</button>' +
      '<button class="btn btn-s btn-sm" type="button" data-save-export="' + s.id + '">Exportieren</button>' +
      (s.mode === "coop" ? '<button class="btn btn-s btn-sm" type="button" data-save-members="' + s.id + '">Mitglieder</button>' : '') +
      (s.owner ? '<button class="btn btn-d btn-sm" type="button" data-save-del="' + s.id + '">Löschen</button>' : '<button class="btn btn-d btn-sm" type="button" data-save-leave="' + s.id + '">Verlassen</button>') +
      '</div></article>';
  }).join("") +
  (P.savesMeta.owned < P.savesMeta.limit ? '<button class="card new-card" type="button" data-go="neues-spiel" style="cursor:pointer;color:var(--ink)"><span class="tag t-acc">+ Neues Spiel</span><span class="muted">Eine neue Firma gründen. Noch ' + (P.savesMeta.limit - P.savesMeta.owned) + ' Plätze frei.</span></button>' : '');
  if (!P.savesList.length) grid.insertAdjacentHTML("afterbegin", '<div class="card" style="grid-column:1/-1"><h2>Noch kein Speicherstand</h2><p class="muted" style="margin-top:6px">Gründe deine erste Firma mit „Neues Spiel“ oder importiere eine Speicherdatei.</p></div>');
  $("#saveCount").textContent = P.savesMeta.owned + " von " + P.savesMeta.limit + " belegt";
}
function loadSave(id, silent, route){
  var go = function(){
    return api("GET", "/saves/" + id).then(function(d){
      applyState(d.state);
      P.save = d.save; P.rev = d.save.rev; P.lastSaved = JSON.stringify(captureState()); P.savedAt = new Date(d.save.updatedAt);
      _localSet("lastSave:" + P.user.id, d.save.id);
      paused = false; $("#pauseBtn").textContent = "Pause"; $("#pauseBtn").setAttribute("aria-pressed", "false");
      setSaveStatus("ok"); updateUserUI(); renderAll();
      if (!silent) toast("„" + d.save.name + "“ geladen. Tag " + day + ".", "ok");
      var target = route || "uebersicht";
      if (location.hash === "#" + target) render(); else location.hash = target;
      return true;
    }).catch(function(e){
      if (P.user) _localSet("lastSave:" + P.user.id, 0);
      if (!silent || e.status !== 404) apiErr(e);
      return false;
    });
  };
  if (P.save && P.save.id !== id) return autosave(false).then(go);
  return go();
}
function download(url){
  var a = document.createElement("a");
  a.href = url; a.download = ""; document.body.appendChild(a); a.click(); a.remove();
}
function membersModal(id){
  var s = P.savesList.filter(function(x){ return x.id === id; })[0];
  if (!s) return;
  var me = P.user.id;
  openModal({
    title:"Koop-Mitglieder", sub:s.name + " · höchstens " + ((P.status && 6) || 6) + " Mitglieder",
    body:'<div class="list">' + s.members.map(function(m){
      return '<div class="li"><span><strong>' + esc(m.display) + '</strong> <span class="sub">' + esc(m.username) + '</span></span>' +
        (m.role === "owner" ? '<span class="tag t-acc">Besitzer</span>' : (s.owner ? '<button class="btn btn-s btn-sm" type="button" data-mdact="rm:' + m.id + '">Entfernen</button>' : '<span class="tag t-mut">Mitglied</span>')) + '</div>';
    }).join("") + '</div>' +
      (s.owner ? field("mbName", "Mitspieler hinzufügen", '<input class="inp" id="mbName" placeholder="Benutzername" autocomplete="off">', null, "Die Person sieht den Spielstand danach in ihrer Liste.") : '<p class="hint">Nur der Besitzer kann Mitglieder verwalten.</p>'),
    actions:'<button class="btn btn-s" type="button" data-close>Schließen</button>' + (s.owner ? '<button class="btn" type="button" data-mdact="add">Hinzufügen</button>' : ''),
    onAction:function(a, el, close){
      if (a === "add") {
        var n = $("#mbName", el).value.trim();
        if (!n) { $("#mbNameErr", el).textContent = "Bitte einen Benutzernamen eingeben."; return; }
        api("POST", "/saves/" + id + "/members", { username:n }).then(function(){ close(); toast(n + " ist jetzt Mitglied.", "ok"); return loadSavesList(); }).then(function(){ membersModal(id); }).catch(function(e){ $("#mbNameErr", el).textContent = e.message; });
      }
      if (a.indexOf("rm:") === 0) {
        api("DELETE", "/saves/" + id + "/members/" + a.slice(3)).then(function(){ close(); toast("Mitglied entfernt.", "ok"); return loadSavesList(); }).then(function(){ membersModal(id); }).catch(apiErr);
      }
    }
  });
}
$("#saveGrid").addEventListener("click", function(e){
  var b;
  if ((b = e.target.closest("[data-save-play]"))) return loadSave(+b.getAttribute("data-save-play"));
  if ((b = e.target.closest("[data-save-export]"))) { var ex = +b.getAttribute("data-save-export"); (P.save && P.save.id === ex ? autosave(false) : Promise.resolve()).then(function(){ download("/api/saves/" + ex + "/export"); toast("Speicherdatei wird heruntergeladen.", "ok"); }); return; }
  if ((b = e.target.closest("[data-save-members]"))) return membersModal(+b.getAttribute("data-save-members"));
  if ((b = e.target.closest("[data-save-del]"))) {
    var id = +b.getAttribute("data-save-del"), s = P.savesList.filter(function(x){ return x.id === id; })[0];
    confirmModal("Speicherstand löschen?", "„" + esc(s.name) + "“ wird dauerhaft entfernt" + (s.mode === "coop" ? ", auch für alle Mitspieler" : "") + ". Exportiere ihn vorher, wenn du ihn behalten willst.", "Endgültig löschen", "btn-d", function(){
      api("DELETE", "/saves/" + id).then(function(){
        if (P.save && P.save.id === id) { P.save = null; paused = true; applyState(P.defaultState); setSaveStatus("idle"); }
        toast("Speicherstand gelöscht.", "bad"); loadSavesList();
      }).catch(apiErr);
    });
    return;
  }
  if ((b = e.target.closest("[data-save-leave]"))) {
    var lid = +b.getAttribute("data-save-leave");
    confirmModal("Koop-Spiel verlassen?", "Du verlierst den Zugang zu diesem Spielstand. Der Besitzer kann dich wieder einladen.", "Verlassen", "btn-d", function(){
      api("DELETE", "/saves/" + lid + "/members/" + P.user.id).then(function(){
        if (P.save && P.save.id === lid) { P.save = null; paused = true; applyState(P.defaultState); setSaveStatus("idle"); }
        toast("Spiel verlassen.", "ok"); loadSavesList();
      }).catch(apiErr);
    });
  }
});
$("#importFile").addEventListener("change", function(e){
  var f = e.target.files && e.target.files[0];
  if (!f) return;
  if (f.size > 5 * 1024 * 1024) { toast("Die Datei ist zu groß (höchstens 5 MB).", "bad"); e.target.value = ""; return; }
  var rd = new FileReader();
  rd.onload = function(){
    var data;
    try { data = JSON.parse(rd.result); } catch (x) { toast("Die Datei ist kein gültiges JSON.", "bad"); return; }
    api("POST", "/saves/import", data).then(function(d){ toast("„" + d.save.name + "“ importiert.", "ok"); loadSavesList(); }).catch(apiErr);
  };
  rd.readAsText(f);
  e.target.value = "";
});
function createSave(name, mode, diff, focus){
  var st = JSON.parse(JSON.stringify(P.defaultState));
  st.company = name; st.day = 1; st.minutes = 8 * 60; st.cash = START_CASH[diff] || START_CASH.normal;
  return api("POST", "/saves", { name:name, mode:mode, diff:diff, focus:focus, state:st }).then(function(d){ return loadSave(d.save.id); });
}
function createSaveFromWizard(){
  var name = wiz.name.trim();
  createSave(name, wiz.type === "koop" ? "coop" : "single", wiz.diff, wiz.focus).then(function(){
    toast("„" + name + "“ gegründet. Viel Erfolg!", "ok");
  }).catch(apiErr);
}

/* Konto */
function exportMyData(){ download("/api/me/export"); toast("Deine Daten werden heruntergeladen.", "ok"); }
function profileModal(){
  openModal({
    title:"Profil bearbeiten", sub:"Konto " + P.user.username,
    body:field("pfDisplay", "Anzeigename", '<input class="inp" id="pfDisplay" maxlength="60" value="' + esc(P.user.display) + '">') +
      field("pfEmail", "E-Mail (optional)", '<input class="inp" id="pfEmail" type="email" value="' + esc(P.user.email || "") + '">'),
    actions:'<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Speichern</button>',
    onAction:function(a, el, close){
      if (a !== "save") return;
      api("PUT", "/me/profile", { display:$("#pfDisplay", el).value, email:$("#pfEmail", el).value }).then(function(d){
        P.user.display = d.user.display; P.user.email = d.user.email; updateUserUI(); close(); toast("Profil gespeichert.", "ok");
      }).catch(function(e){ $("#pfDisplayErr", el).textContent = e.message; });
    }
  });
}
function passwordModal(forced){
  openModal({
    title:forced ? "Neues Kennwort festlegen" : "Kennwort ändern", sub:forced ? "Der Server-Admin hat dein Kennwort zurückgesetzt. Bitte jetzt ein eigenes wählen." : "Konto " + P.user.username,
    body:field("pcCur", forced ? "Vorläufiges Kennwort" : "Aktuelles Kennwort", '<input class="inp" id="pcCur" type="password" autocomplete="current-password">') +
      field("pcNew", "Neues Kennwort", '<input class="inp" id="pcNew" type="password" autocomplete="new-password">', null, "Mindestens 8 Zeichen.") +
      field("pcNew2", "Neues Kennwort wiederholen", '<input class="inp" id="pcNew2" type="password" autocomplete="new-password">'),
    actions:'<button class="btn btn-s" type="button" data-close>' + (forced ? "Später" : "Abbrechen") + '</button><button class="btn" type="button" data-mdact="save">Kennwort ändern</button>',
    onAction:function(a, el, close){
      if (a !== "save") return;
      var n1 = $("#pcNew", el).value, n2 = $("#pcNew2", el).value;
      $("#pcNew2Err", el).textContent = n1 === n2 ? "" : "Die Kennwörter stimmen nicht überein.";
      if (n1 !== n2) return;
      api("PUT", "/me/password", { current:$("#pcCur", el).value, next:n1 }).then(function(){ P.user.mustChange = false; close(); toast("Kennwort geändert.", "ok"); })
        .catch(function(e){ $("#pcNewErr", el).textContent = e.message; });
    }
  });
}
function deleteAccountModal(){
  openModal({
    title:"Konto löschen?", sub:"Alle eigenen Speicherstände und das Profil werden entfernt.",
    body:'<div class="note bad">Das geht nicht rückgängig. Exportiere vorher deine Daten.</div>' +
      field("delPw", "Kennwort", '<input class="inp" id="delPw" type="password" autocomplete="current-password">') +
      field("delConf", "Zur Bestätigung LÖSCHEN eingeben", '<input class="inp" id="delConf" autocomplete="off" placeholder="LÖSCHEN">'),
    actions:'<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn btn-d" type="button" data-mdact="save" id="delGo" disabled>Konto endgültig löschen</button>',
    init:function(el){
      var inp = $("#delConf", el), go = $("#delGo", el);
      inp.addEventListener("input", function(){ go.disabled = inp.value.trim() !== "LÖSCHEN"; });
    },
    onAction:function(a, el, close){
      if (a !== "save") return;
      api("DELETE", "/me", { password:$("#delPw", el).value, confirm:$("#delConf", el).value.trim() }).then(function(){
        close(); P.user = null; P.save = null; paused = true; applyState(P.defaultState); setSaveStatus("idle"); setAuthMode("login"); updateUserUI();
        location.hash = "login"; render(); toast("Dein Konto wurde gelöscht.", "bad");
      }).catch(function(e){ $("#delPwErr", el).textContent = e.message; });
    }
  });
}

/* Server-Admin */
function loadAdmin(){ return api("GET", "/admin/overview").then(function(d){ P.adminData = d; renderAdmin(); }).catch(function(e){ if (e.status !== 401) apiErr(e); }); }
function renderUsers(){ if (P.adminData) renderAdmin(); }
function fmtBytes(n){ if (!n && n !== 0) return "—"; var u = ["B","KB","MB","GB","TB"], i = 0; while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; } return (i ? n.toFixed(1).replace(".", ",") : n) + " " + u[i]; }
function fmtTime(iso){ return iso ? new Date(iso).toLocaleString("de-DE", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" }) : "—"; }
function renderAdmin(){
  var d = P.adminData;
  if (!d || !$("#userRows")) return;
  $("#admServerName").textContent = d.settings.serverName;
  $("#admVersion").textContent = d.version;
  $("#admTitle").textContent = d.health.db && !d.settings.maintenance ? "Alles läuft." : d.settings.maintenance ? "Wartungsmodus aktiv." : "Achtung: Datenbank meldet Fehler.";
  $("#admDb").textContent = d.health.db ? "OK" : "Fehler"; $("#admDb").style.color = d.health.db ? "var(--ok)" : "var(--bad)";
  $("#admDbS").textContent = fmtBytes(d.health.dbSize) + " · " + d.health.saves + " Speicherstände · " + d.health.sessions + " Sitzungen";
  $("#admAi").textContent = d.health.aiConfigured ? "Eingerichtet" : "Aus"; $("#admAi").style.color = d.health.aiConfigured ? "var(--ok)" : "var(--warn)";
  $("#admAiS").textContent = d.health.aiConfigured ? "Test unten" : "Vorlagen aktiv";
  var lb = d.backups[0];
  $("#admBackup").textContent = lb ? fmtTime(lb.at) : "keine"; $("#admBackupS").textContent = lb ? fmtBytes(lb.size) + " · " + d.backups.length + " vorhanden" : "Jetzt eine anlegen";
  if (d.health.disk) { var pct = Math.round(d.health.disk.free / d.health.disk.total * 100); $("#admDisk").textContent = pct + " %"; $("#admDiskS").textContent = fmtBytes(d.health.disk.free) + " frei von " + fmtBytes(d.health.disk.total); }
  else { $("#admDisk").textContent = "—"; $("#admDiskS").textContent = "nicht ermittelbar"; }
  $("#userRows").innerHTML = d.users.map(function(u){
    var me = P.user && u.id === P.user.id;
    var st = u.locked ? '<span class="dot" style="background:var(--bad)"></span>gesperrt' : u.must_change ? '<span class="dot" style="background:var(--warn)"></span>Kennwortwechsel' : '<span class="dot" style="background:var(--ok)"></span>aktiv';
    return '<tr><td><div style="font-weight:650">' + esc(u.display) + (me ? ' <span class="tag t-acc">du</span>' : '') + '</div><div class="sub">' + esc(u.username) + (u.email ? ' · ' + esc(u.email) : '') + '</div></td>' +
      '<td>' + (u.role === "admin" ? "Server-Admin" : "Spieler") + '</td><td class="num">' + u.saves + '</td><td>' + st + '<div class="sub">zuletzt ' + esc(fmtTime(u.last_login)) + '</div></td>' +
      '<td style="text-align:right;white-space:nowrap">' + (u.locked ? '<button class="btn btn-s btn-sm" type="button" data-adm-unlock="' + u.id + '">Entsperren</button> ' : '') +
      '<button class="btn btn-s btn-sm" type="button" data-adm-edit="' + u.id + '">Bearbeiten</button> ' +
      (me ? '' : '<button class="btn btn-g btn-sm" type="button" data-adm-reset="' + u.id + '">Kennwort</button><button class="btn btn-g btn-sm" type="button" data-adm-del="' + u.id + '">Löschen</button>') + '</td></tr>';
  }).join("");
  $("#admInvites").innerHTML = d.invites.length ? d.invites.map(function(i){
    return '<div class="li"><span><span class="mono" style="font-weight:700">' + esc(i.code) + '</span> <span class="sub">' + esc(i.email || "ohne E-Mail") + ' · ' + (i.role === "admin" ? "Admin" : "Spieler") + '</span></span>' + (i.used_at ? '<span class="tag t-mut">eingelöst</span>' : '<span class="tag t-ok">offen</span>') + '</div>';
  }).join("") : '<p class="hint">Noch keine Einladungen.</p>';
  $$("#regSeg [data-reg]").forEach(function(x){ x.setAttribute("aria-pressed", x.getAttribute("data-reg") === d.settings.registration ? "true" : "false"); });
  $("#admLimits").textContent = "Limits: " + d.settings.maxSaves + " Stände je Spieler, " + d.settings.maxMembers + " Koop-Mitglieder.";
  var mb = $("#maintBtn"); mb.setAttribute("aria-pressed", d.settings.maintenance ? "true" : "false"); mb.textContent = d.settings.maintenance ? "Wartung beenden" : "Wartungsmodus";
  $("#admBackups").innerHTML = d.backups.length ? d.backups.map(function(b){ return '<div class="li"><span class="mono" style="font-size:13px">' + esc(b.file) + '</span><span class="sub">' + fmtBytes(b.size) + ' · ' + esc(fmtTime(b.at)) + '</span></div>'; }).join("") : '<p class="hint">Noch keine Sicherung.</p>';
  $("#admLog").innerHTML = d.log.map(function(l){ return '<div><b>' + esc(fmtTime(l.at)) + '</b> ' + esc(l.level.padEnd(5, " ")) + ' ' + esc(l.action) + (l.detail ? ': ' + esc(l.detail) : '') + (l.actor ? ' <span class="muted">(' + esc(l.actor) + ')</span>' : '') + '</div>'; }).join("") || '<div>Noch keine Einträge.</div>';
}
function inviteModal(){
  if (!P.user || P.user.role !== "admin") { toast("Nur Server-Admins können einladen.", "bad"); return; }
  openModal({
    title:"Benutzer einladen", sub:"Es entsteht ein Einladungscode. Er gilt für eine Registrierung.",
    body:field("ivMail", "E-Mail (optional, nur zur Erinnerung)", '<input class="inp" id="ivMail" type="email" placeholder="name@firma.de">') +
      field("ivRole", "Rolle", '<select class="inp" id="ivRole"><option value="player">Spieler</option><option value="admin">Server-Admin</option></select>'),
    actions:'<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Code erstellen</button>',
    onAction:function(a, el, close){
      if (a !== "save") return;
      api("POST", "/admin/invites", { email:$("#ivMail", el).value.trim(), role:$("#ivRole", el).value }).then(function(d){
        close(); loadAdmin();
        openModal({ title:"Einladungscode", sub:"Gib diesen Code an die Person weiter. Sie gibt ihn bei „Konto erstellen“ ein.",
          body:'<div class="mono" id="invCode" style="font-size:28px;font-weight:800;letter-spacing:.1em;text-align:center;padding:12px;border:1px dashed var(--line);border-radius:12px">' + esc(d.code) + '</div>' +
            (P.status && P.status.registration !== "invite" ? '' : '') + '<p class="hint">Die Registrierung muss auf „Nur Einladung“ oder „Offen“ stehen.</p>',
          actions:'<button class="btn btn-s" type="button" data-mdact="copy">Kopieren</button><button class="btn" type="button" data-close>Fertig</button>',
          onAction:function(x){ if (x === "copy" && navigator.clipboard) navigator.clipboard.writeText(d.code).then(function(){ toast("Code kopiert.", "ok"); }, function(){ toast("Kopieren nicht möglich. Bitte markieren.", "bad"); }); } });
      }).catch(function(e){ $("#ivMailErr", el).textContent = e.message; });
    }
  });
}
function editUserModal(u){
  var me = P.user && u.id === P.user.id;
  openModal({
    title:"Benutzer bearbeiten", sub:u.username,
    body:field("euName", "Anzeigename", '<input class="inp" id="euName" maxlength="60" value="' + esc(u.display) + '">') +
      field("euMail", "E-Mail", '<input class="inp" id="euMail" type="email" value="' + esc(u.email || "") + '">') +
      field("euRole", "Rolle", '<select class="inp" id="euRole"' + (me ? ' disabled' : '') + '><option value="player"' + (u.role === "player" ? ' selected' : '') + '>Spieler</option><option value="admin"' + (u.role === "admin" ? ' selected' : '') + '>Server-Admin</option></select>') +
      '<div class="row-sw" style="padding:4px 0"><div><div style="font-weight:650">Konto gesperrt</div><div class="hint">Gesperrte Benutzer können sich nicht anmelden.</div></div><button class="sw" type="button" role="switch" id="euLock" aria-checked="' + (!!u.locked) + '" aria-label="Konto sperren"' + (me ? ' disabled' : '') + '></button></div>' +
      (me ? '<div class="note info">Dein eigenes Konto kannst du nicht sperren oder herabstufen.</div>' : ''),
    init:function(el){ var lk = $("#euLock", el); lk.addEventListener("click", function(){ lk.setAttribute("aria-checked", lk.getAttribute("aria-checked") === "true" ? "false" : "true"); }); },
    actions:'<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Speichern</button>',
    onAction:function(a, el, close){
      if (a !== "save") return;
      var mail = $("#euMail", el).value.trim();
      if (mail && !validEmail(mail)) { $("#euMailErr", el).textContent = "Bitte eine gültige E-Mail-Adresse eingeben."; return; }
      api("PUT", "/admin/users/" + u.id, { display:$("#euName", el).value, email:mail, role:$("#euRole", el).value, locked:$("#euLock", el).getAttribute("aria-checked") === "true" })
        .then(function(){ close(); toast("Änderungen an " + u.username + " gespeichert.", "ok"); loadAdmin(); })
        .catch(function(e){ $("#euNameErr", el).textContent = e.message; });
    }
  });
}
(function(){
  var sec = $('[data-screen="admin"]');
  sec.addEventListener("click", function(e){
    var b, d = P.adminData;
    if ((b = e.target.closest("[data-adm-edit]"))) { var u = d.users.filter(function(x){ return x.id === +b.getAttribute("data-adm-edit"); })[0]; if (u) editUserModal(u); return; }
    if ((b = e.target.closest("[data-adm-unlock]"))) { api("POST", "/admin/users/" + b.getAttribute("data-adm-unlock") + "/unlock").then(function(){ toast("Konto entsperrt.", "ok"); loadAdmin(); }).catch(apiErr); return; }
    if ((b = e.target.closest("[data-adm-reset]"))) {
      var rid = b.getAttribute("data-adm-reset");
      confirmModal("Kennwort zurücksetzen?", "Es entsteht ein vorläufiges Kennwort. Die Person muss es bei der nächsten Anmeldung ändern. Offene Sitzungen enden.", "Zurücksetzen", "", function(){
        api("POST", "/admin/users/" + rid + "/reset-password").then(function(r){
          loadAdmin();
          openModal({ title:"Vorläufiges Kennwort", sub:"Nur jetzt sichtbar. Bitte sicher weitergeben.", body:'<div class="mono" id="tmpPw" style="font-size:22px;font-weight:800;text-align:center;padding:12px;border:1px dashed var(--line);border-radius:12px">' + esc(r.temporaryPassword) + '</div>', actions:'<button class="btn" type="button" data-close>Fertig</button>' });
        }).catch(apiErr);
      });
      return;
    }
    if ((b = e.target.closest("[data-adm-del]"))) {
      var did = b.getAttribute("data-adm-del");
      confirmModal("Benutzer löschen?", "Das Konto und alle eigenen Speicherstände werden entfernt.", "Löschen", "btn-d", function(){ api("DELETE", "/admin/users/" + did).then(function(){ toast("Benutzer gelöscht.", "bad"); loadAdmin(); }).catch(apiErr); });
      return;
    }
    if (e.target.closest("#admInviteBtn")) { inviteModal(); return; }
    if ((b = e.target.closest("[data-reg]"))) { api("PUT", "/admin/settings", { registration:b.getAttribute("data-reg") }).then(function(){ if (P.status) P.status.registration = b.getAttribute("data-reg"); toast("Registrierung: " + b.textContent + ".", "ok"); loadAdmin(); }).catch(apiErr); return; }
    if (e.target.closest("#admBackupBtn")) { api("POST", "/admin/backup").then(function(r){ toast("Backup erstellt: " + r.backup.file, "ok"); loadAdmin(); }).catch(apiErr); return; }
    if (e.target.closest("#aiTest")) {
      var t = $("#aiTest"); t.disabled = true; t.textContent = "Teste …";
      api("POST", "/admin/ai-test").then(function(r){ $("#aiHint").textContent = r.message; toast(r.message, r.ok ? "ok" : "bad"); }).catch(apiErr).then(function(){ t.disabled = false; t.textContent = "Testen"; });
      return;
    }
    if (e.target.closest("#maintBtn")) {
      var on = !(d && d.settings.maintenance);
      var apply = function(){ api("PUT", "/admin/settings", { maintenance:on }).then(function(){ toast(on ? "Wartungsmodus an. Spieler wurden abgemeldet." : "Wartungsmodus aus.", on ? "bad" : "ok"); loadAdmin(); }).catch(apiErr); };
      if (on) confirmModal("Wartungsmodus einschalten?", "Spieler werden abgemeldet und können sich nicht anmelden, bis du den Modus ausschaltest.", "Einschalten", "", apply); else apply();
    }
  });
})();

/* Start */
// Read-only view for the end-to-end tests and for debugging in the browser console.
window.craftit = {
  state: function(){ return captureState(); },
  info: function(){ return { saving:P.saving, dirty:!!P.save && P.lastSaved !== JSON.stringify(captureState()), save:P.save ? { id:P.save.id, name:P.save.name, rev:P.rev } : null, user:P.user ? P.user.username : null }; }
};
function boot(){
  P.defaultState = captureState();
  paused = true;
  var t = _localGet("theme", null);
  applyTheme(t === "light" || t === "dark" ? t : "system");
  renderAll();
  setRoomTab("racks");
  setSaveStatus("idle");
  api("GET", "/status").then(function(st){
    P.status = st;
    setAuthMode(st.needsSetup ? "setup" : "login");
    if (st.user) { onLoggedIn(st.user); }
    else { if (location.hash !== "#login") location.replace("#login"); render(); }
  }).catch(function(){
    setAuthMode("login");
    if (location.hash !== "#login") location.replace("#login");
    render();
    toast("Der Server ist nicht erreichbar.", "bad");
  });
}

/* ---------- Changelog ---------- */
var CL = { data:null };
var CL_TYPE = { "new":["Neu","t-ok"], changed:["Geändert","t-info"], fixed:["Behoben","t-warn"], removed:["Entfernt","t-bad"], security:["Sicherheit","t-bad"], tech:["Technik","t-mut"] };
function mdInline(s){
  return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
}
function loadChangelog(){
  if (CL.data) { renderChangelog(); return; }
  api("GET", "/changelog").then(function(d){ CL.data = d; renderChangelog(); }).catch(apiErr);
}
function renderChangelog(){
  if (!CL.data) return;
  var inst = P.status ? P.status.version : "";
  $("#clLead").textContent = "Alle Änderungen am Spiel. Installiert ist Version " + inst + ".";
  var q = ($("#clSearch").value || "").trim().toLowerCase(), ty = $("#clType").value;
  var shown = 0, total = 0;
  var html = CL.data.versions.map(function(v){
    var unrel = v.version.toLowerCase() === "unreleased";
    var items = v.changes.filter(function(c){
      total++;
      var hay = (v.version + " " + v.date + " " + c.text).toLowerCase();
      return (!ty || c.type === ty) && (!q || hay.indexOf(q) >= 0);
    });
    shown += items.length;
    if (!items.length) return "";
    var isInst = v.version.replace(/^v/, "") === inst;
    return '<section class="card cl-ver"><div class="card-h"><div><h2>' + (unrel ? "Noch nicht veröffentlicht" : "Version " + esc(v.version)) + (isInst ? ' <span class="tag t-ok">installiert</span>' : '') + '</h2>' +
      (v.date || v.intro ? '<div class="hint" style="margin-top:4px">' + esc(v.date ? new Date(v.date).toLocaleDateString("de-DE") : "") + (v.date && v.intro ? " · " : "") + mdInline(v.intro || "") + '</div>' : '') + '</div>' + (unrel ? '<span class="tag t-warn">kommt mit der nächsten Version</span>' : '') + '</div>' +
      '<ul class="cl-list">' + items.map(function(c){ var t = CL_TYPE[c.type] || CL_TYPE.changed; return '<li><span class="tag ' + t[1] + '">' + t[0] + '</span><span>' + mdInline(c.text) + '</span></li>'; }).join("") + '</ul></section>';
  }).join("");
  $("#clList").innerHTML = html || '<div class="card"><p class="muted">Keine Änderung passt zur Suche.</p></div>';
  $("#clCount").textContent = q || ty ? shown + " von " + total + " Änderungen" : CL.data.versions.length + " Versionen, " + total + " Änderungen";
}
(function(){
  var s = $("#clSearch"), t = $("#clType");
  if (s) s.addEventListener("input", renderChangelog);
  if (t) t.addEventListener("change", renderChangelog);
})();

/* ---------- Hilfe und Support ---------- */
var SUP = { list:[], sel:null, scope:"mine", status:"", detail:null, tab:"tickets" };
var SUP_CAT = { fehler:"Fehler", frage:"Frage", idee:"Idee", konto:"Konto" };
var SUP_ST = { offen:["Offen","t-warn"], bearbeitung:["In Bearbeitung","t-info"], beantwortet:["Beantwortet","t-ok"], geschlossen:["Geschlossen","t-mut"] };
var SUP_PRIO = { niedrig:"Niedrig", normal:"Normal", hoch:"Hoch" };
var SUP_FAQ = [
  ["Wie speichert das Spiel?", "Während du spielst, speichert das Spiel alle 30 Sekunden, beim Seitenwechsel und wenn du den Tab verlässt. Oben rechts siehst du, wann zuletzt gespeichert wurde. Ein Klick darauf speichert sofort."],
  ["Wie spiele ich mit anderen zusammen?", "Lege ein Spiel als Koop-Spiel an. Unter Speicherstände fügst du über „Mitglieder“ andere Konten hinzu. Speichern zwei Personen gleichzeitig, fragt das Spiel, welche Version gilt."],
  ["Wie läuft die Zeit?", "Die Spieluhr läuft, solange ein Spielstand geöffnet ist. Mit „Pause“ hältst du sie an. „Schicht beenden“ auf der Übersicht schließt den Tag ab: Erledigtes wird bezahlt, neue Tickets kommen."],
  ["Ich habe mein Kennwort vergessen.", "Ein Server-Admin kann dir ein vorläufiges Kennwort geben. Du änderst es bei der nächsten Anmeldung."],
  ["Kann ich meinen Spielstand sichern?", "Ja. Unter Speicherstände lädt „Exportieren“ eine Datei herunter. „Importieren“ legt daraus einen neuen Spielstand an. Unter Einstellungen exportierst du alle deine Daten."],
  ["Wo sehe ich, was sich geändert hat?", "Unter Changelog stehen alle Versionen mit ihren Änderungen, durchsuchbar und nach Art gefiltert."]
];
function refreshSupportBadge(){
  if (!P.user) return;
  api("GET", "/support/summary").then(function(d){
    var b = $("#navSupportCnt");
    if (b) { b.hidden = !d.unread; b.textContent = d.unread; }
  }).catch(function(){});
}
setInterval(refreshSupportBadge, 60000);
function loadSupport(){
  var sc = $("#supScope");
  if (sc) sc.hidden = !(P.user && P.user.role === "admin");
  return api("GET", "/support" + (SUP.scope === "all" ? "?scope=all" : "")).then(function(d){
    SUP.list = d.tickets; renderSupList();
    if (SUP.sel && SUP.list.some(function(t){ return t.id === SUP.sel; })) openSupTicket(SUP.sel); else { SUP.sel = null; SUP.detail = null; renderSupDetail(); }
    refreshSupportBadge();
  }).catch(function(e){ if (e.status !== 401) apiErr(e); });
}
function renderSupList(){
  $$("#supScope [data-sup-scope]").forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-sup-scope") === SUP.scope ? "true" : "false"); });
  var list = SUP.list.filter(function(t){ return !SUP.status || t.status === SUP.status; });
  $("#supList").innerHTML = list.length ? list.map(function(t){
    var st = SUP_ST[t.status];
    return '<button type="button" class="sup-item' + (SUP.sel === t.id ? ' on' : '') + '" data-sup-open="' + t.id + '">' +
      '<span class="sup-item-top"><span class="mono hint">#' + t.id + '</span>' + (t.unread ? '<span class="sup-dot" aria-label="ungelesen"></span>' : '') + '<span class="tag ' + st[1] + '">' + st[0] + '</span></span>' +
      '<strong>' + esc(t.subject) + '</strong>' +
      '<span class="hint">' + esc(SUP_CAT[t.category]) + (SUP.scope === "all" ? ' · ' + esc(t.owner) : '') + ' · ' + esc(relTime(t.updatedAt)) + ' · ' + t.messages + ' Nachricht' + (t.messages === 1 ? '' : 'en') + '</span></button>';
  }).join("") : '<p class="hint" style="padding:8px 4px">' + (SUP.list.length ? "Kein Ticket mit diesem Status." : "Noch keine Tickets. Über „Neues Ticket“ erreichst du die Admins.") + '</p>';
}
function openSupTicket(id){
  SUP.sel = id;
  return api("GET", "/support/" + id).then(function(d){ SUP.detail = d.ticket; renderSupList(); renderSupDetail(); refreshSupportBadge(); }).catch(apiErr);
}
function renderSupDetail(){
  var el = $("#supDetail"), t = SUP.detail;
  if (!t) { el.innerHTML = '<div class="sup-empty"><h2>Wie können wir helfen?</h2><p class="muted">Wähle links ein Ticket oder öffne ein neues. Fehler, Fragen, Ideen und Konto-Anliegen landen bei den Server-Admins.</p></div>'; return; }
  var admin = P.user.role === "admin" && !t.mine;
  var st = SUP_ST[t.status];
  var ctrls = admin
    ? '<div class="sup-ctrls"><label class="lbl" for="supSetStatus">Status</label><select class="inp" id="supSetStatus">' + Object.keys(SUP_ST).map(function(k){ return '<option value="' + k + '"' + (k === t.status ? ' selected' : '') + '>' + SUP_ST[k][0] + '</option>'; }).join("") + '</select>' +
      '<label class="lbl" for="supSetPrio">Priorität</label><select class="inp" id="supSetPrio">' + Object.keys(SUP_PRIO).map(function(k){ return '<option value="' + k + '"' + (k === t.priority ? ' selected' : '') + '>' + SUP_PRIO[k] + '</option>'; }).join("") + '</select></div>'
    : '';
  el.innerHTML = '<div class="sup-head"><div style="min-width:0"><div class="eyebrow">Ticket #' + t.id + ' · ' + esc(SUP_CAT[t.category]) + (admin ? ' · von ' + esc(t.owner) : '') + '</div><h2 style="font-size:21px;margin-top:6px;overflow-wrap:anywhere">' + esc(t.subject) + '</h2>' +
      (t.context ? '<div class="hint" style="margin-top:4px">' + esc(t.context) + '</div>' : '') + '</div><span class="tag ' + st[1] + '">' + st[0] + '</span></div>' + ctrls +
    '<div class="thread sup-thread">' + t.thread.map(function(m){
      var cls = m.internal ? "bub bub-n" : m.mine ? "bub bub-s" : "bub bub-c";
      return '<div class="' + cls + '"><div class="bub-meta">' + esc(m.author) + (m.admin ? ' <span class="bub-ai">Admin</span>' : '') + (m.internal ? ' <span class="bub-ai">intern</span>' : '') + ' · ' + esc(fmtTime(m.at)) + '</div>' + esc(m.body) + '</div>';
    }).join("") + '</div>' +
    '<form id="supReply" class="chat-form" novalidate><label class="lbl" for="supReplyText">' + (t.status === "geschlossen" ? "Antworten öffnet das Ticket wieder" : "Antwort") + '</label><textarea class="inp" id="supReplyText" placeholder="Deine Nachricht"></textarea><div class="err" id="supReplyErr"></div>' +
      '<div class="acts" style="justify-content:space-between;align-items:center;margin-top:8px"><span>' + (admin ? '<label class="check"><input type="checkbox" id="supInternal"> Interne Notiz (nur Admins sehen sie)</label>' : '') + '</span><button class="btn" type="submit">Senden</button></div></form>' +
    '<div class="acts" style="margin-top:14px;border-top:1px solid var(--line);padding-top:14px">' +
      (t.mine ? (t.status === "geschlossen" ? '<button class="btn btn-s btn-sm" type="button" data-sup-status="offen">Wieder öffnen</button>' : '<button class="btn btn-s btn-sm" type="button" data-sup-status="geschlossen">Ticket schließen</button>') : '') +
      ((t.mine || P.user.role === "admin") ? '<button class="btn btn-g btn-sm" type="button" data-sup-del="' + t.id + '">Löschen</button>' : '') + '</div>';
  var th = $(".sup-thread", el); if (th) th.scrollTop = th.scrollHeight;
}
function newSupportModal(){
  var ctx = (P.save ? "Spielstand „" + P.save.name + "“, Tag " + day : "kein Spielstand offen") + " · Version " + (P.status ? P.status.version : "?") + " · Seite " + currentRoute();
  openModal({
    title:"Neues Support-Ticket", sub:"Die Server-Admins antworten hier im Ticket.",
    body:field("snSubject", "Betreff", '<input class="inp" id="snSubject" maxlength="120" placeholder="z. B. Ticket lässt sich nicht lösen">') +
      field("snCat", "Kategorie", '<select class="inp" id="snCat"><option value="fehler">Fehler im Spiel</option><option value="frage">Frage</option><option value="idee">Idee oder Wunsch</option><option value="konto">Konto und Anmeldung</option></select>') +
      field("snBody", "Beschreibung", '<textarea class="inp" id="snBody" style="min-height:140px" placeholder="Was hast du gemacht, was hast du erwartet, was ist passiert?"></textarea>') +
      '<label class="check"><input type="checkbox" id="snCtx" checked> Spielstand, Version und Seite mitsenden</label><p class="hint mono" style="font-size:12px">' + esc(ctx) + '</p>',
    actions:'<button class="btn btn-s" type="button" data-close>Abbrechen</button><button class="btn" type="button" data-mdact="save">Ticket senden</button>',
    onAction:function(a, el, close){
      if (a !== "save") return;
      api("POST", "/support", { subject:$("#snSubject", el).value, category:$("#snCat", el).value, body:$("#snBody", el).value, context:$("#snCtx", el).checked ? ctx : "" })
        .then(function(d){ close(); SUP.scope = "mine"; SUP.sel = d.ticket.id; toast("Ticket #" + d.ticket.id + " gesendet.", "ok"); loadSupport(); })
        .catch(function(e){ $("#snBodyErr", el).textContent = e.message; });
    }
  });
}
(function(){
  var sec = $('[data-screen="support"]');
  if (!sec) return;
  sec.addEventListener("click", function(e){
    var b;
    if ((b = e.target.closest("[data-sup-tab]"))) {
      SUP.tab = b.getAttribute("data-sup-tab");
      $$("[data-sup-tab]").forEach(function(x){ x.setAttribute("aria-selected", x === b ? "true" : "false"); });
      $$("[data-sup-panel]").forEach(function(p){ p.hidden = p.getAttribute("data-sup-panel") !== SUP.tab; });
      return;
    }
    if (e.target.closest("#supNew")) { newSupportModal(); return; }
    if ((b = e.target.closest("[data-sup-open]"))) { openSupTicket(+b.getAttribute("data-sup-open")); return; }
    if ((b = e.target.closest("[data-sup-scope]"))) { SUP.scope = b.getAttribute("data-sup-scope"); SUP.sel = null; loadSupport(); return; }
    if ((b = e.target.closest("[data-sup-status]"))) { api("PATCH", "/support/" + SUP.detail.id, { status:b.getAttribute("data-sup-status") }).then(function(d){ SUP.detail = d.ticket; loadSupport(); toast("Status geändert.", "ok"); }).catch(apiErr); return; }
    if ((b = e.target.closest("[data-sup-del]"))) {
      var id = +b.getAttribute("data-sup-del");
      confirmModal("Ticket löschen?", "Das Ticket und alle Nachrichten werden entfernt.", "Löschen", "btn-d", function(){ api("DELETE", "/support/" + id).then(function(){ SUP.sel = null; SUP.detail = null; toast("Ticket gelöscht.", "bad"); loadSupport(); }).catch(apiErr); });
    }
  });
  sec.addEventListener("change", function(e){
    if (e.target.id === "supStatusFilter") { SUP.status = e.target.value; renderSupList(); }
    if (e.target.id === "supSetStatus") api("PATCH", "/support/" + SUP.detail.id, { status:e.target.value }).then(function(d){ SUP.detail = d.ticket; loadSupport(); toast("Status: " + SUP_ST[d.ticket.status][0] + ".", "ok"); }).catch(apiErr);
    if (e.target.id === "supSetPrio") api("PATCH", "/support/" + SUP.detail.id, { priority:e.target.value }).then(function(d){ SUP.detail = d.ticket; toast("Priorität: " + SUP_PRIO[d.ticket.priority] + ".", "ok"); }).catch(apiErr);
  });
  sec.addEventListener("submit", function(e){
    if (e.target.id !== "supReply") return;
    e.preventDefault();
    var txt = $("#supReplyText").value.trim();
    if (txt.length < 2) { $("#supReplyErr").textContent = "Die Nachricht ist leer."; return; }
    var internal = !!($("#supInternal") && $("#supInternal").checked);
    api("POST", "/support/" + SUP.detail.id + "/messages", { body:txt, internal:internal }).then(function(d){ SUP.detail = d.ticket; renderSupDetail(); loadSupport(); toast(internal ? "Notiz gespeichert." : "Nachricht gesendet.", "ok"); }).catch(function(x){ $("#supReplyErr").textContent = x.message; });
  });
  $("#supFaq").innerHTML = SUP_FAQ.map(function(f){ return '<details class="sup-faq"><summary>' + esc(f[0]) + '</summary><p>' + esc(f[1]) + '</p></details>'; }).join("");
})();

boot();
})();