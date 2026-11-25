// Obsidia Relay: mengerjakan jawaban AI di server Cloudflare agar tetap jalan
// saat aplikasi Obsidia ditutup, lalu mengirim notifikasi ke HP saat jawaban siap.
import { DurableObject } from "cloudflare:workers";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Max-Age": "86400",
};
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...CORS } });
const te = new TextEncoder();
const b64u = {
  enc(buf) {
    const b = new Uint8Array(buf);
    let s = "";
    for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  },
  dec(str) {
    let s = String(str).replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  },
};
const cat = (...parts) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let i = 0;
  for (const p of parts) { out.set(p, i); i += p.length; }
  return out;
};
const MAX_BODY = 4 * 1024 * 1024;
const JOB_ID = /^[A-Za-z0-9_-]{6,80}$/;

async function passwordOk(req, env) {
  const got = te.encode((req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, ""));
  const want = te.encode(env.OBSIDIA_PASSWORD || "");
  if (!want.length || got.length !== want.length) return false;
  return crypto.subtle.timingSafeEqual ? crypto.subtle.timingSafeEqual(got, want) : got.every((v, i) => v === want[i]);
}

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    if (path === "/") return json({ app: "obsidia-relay", ok: true });
    if (!env.OBSIDIA_PASSWORD) return json({ error: "OBSIDIA_PASSWORD belum diatur di Cloudflare." }, 500);
    if (!(await passwordOk(req, env))) return json({ error: "Kata sandi salah." }, 401);
    const hub = env.HUB.get(env.HUB.idFromName("hub"));
    try {
      if (path === "/ping") return json({ ok: true, subs: await hub.subCount() });
      if (path === "/vapid" && req.method === "GET") return json({ key: await hub.vapidPublic() });
      if (path === "/subscribe" && req.method === "POST") {
        const b = await req.json();
        await hub.addSub(b.sub, b.origin);
        return json({ ok: true });
      }
      if (path === "/test-push" && req.method === "POST") {
        const sent = await hub.notify({ title: "Obsidia", body: "Notifikasi berhasil. Kamu akan diberi tahu saat jawaban siap.", tag: "obsidia-test", url: "./" });
        return json({ sent });
      }
      if (path === "/jobs" && req.method === "POST") {
        const len = +(req.headers.get("Content-Length") || 0);
        if (len > MAX_BODY) return json({ error: "Pesan dan lampiran terlalu besar untuk server." }, 413);
        const b = await req.json();
        if (!b || !JOB_ID.test(b.id || "")) return json({ error: "ID tugas tidak valid." }, 400);
        if (!Array.isArray(b.queue) || !b.queue.length || !b.req) return json({ error: "Tugas tidak lengkap." }, 400);
        const job = env.JOB.get(env.JOB.idFromName(b.id));
        return json(await job.start(b));
      }
      const m = path.match(/^\/jobs\/([A-Za-z0-9_-]{6,80})(\/cancel)?$/);
      if (m) {
        const job = env.JOB.get(env.JOB.idFromName(m[1]));
        if (m[2] && req.method === "POST") return json(await job.cancel());
        if (req.method === "DELETE") return json(await job.remove());
        return json(await job.status());
      }
      return json({ error: "Tidak ditemukan." }, 404);
    } catch (e) {
      return json({ error: String((e && e.message) || e).slice(0, 300) }, 400);
    }
  },
};

/* ---------------- Hub: kunci notifikasi dan daftar perangkat ---------------- */
export class Hub extends DurableObject {
  async vapid() {
    let v = await this.ctx.storage.get("vapid");
    if (!v) {
      const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
      v = { pub: b64u.enc(await crypto.subtle.exportKey("raw", kp.publicKey)), jwk: await crypto.subtle.exportKey("jwk", kp.privateKey) };
      await this.ctx.storage.put("vapid", v);
    }
    return v;
  }
  async vapidPublic() { return (await this.vapid()).pub; }
  async subCount() { return ((await this.ctx.storage.get("subs")) || []).length; }
  async addSub(sub, origin) {
    if (!sub || !/^https:\/\//.test(sub.endpoint || "") || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) throw new Error("Langganan notifikasi tidak valid.");
    const subs = ((await this.ctx.storage.get("subs")) || []).filter((s) => s.endpoint !== sub.endpoint);
    subs.push({ endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } });
    await this.ctx.storage.put("subs", subs.slice(-10));
    if (/^https:\/\//.test(origin || "")) await this.ctx.storage.put("origin", origin);
  }
  async notify(msg) {
    const subs = (await this.ctx.storage.get("subs")) || [];
    if (!subs.length) return 0;
    const v = await this.vapid();
    const contact = (await this.ctx.storage.get("origin")) || "mailto:obsidia@example.com";
    const keep = [];
    let sent = 0;
    for (const s of subs) {
      try {
        const r = await sendPush(s, JSON.stringify(msg), v, contact);
        if (r.status === 404 || r.status === 410) continue;
        keep.push(s);
        if (r.ok) sent++;
      } catch (e) { keep.push(s); }
    }
    await this.ctx.storage.put("subs", keep);
    return sent;
  }
}

/* ---------------- Job: satu jawaban AI ---------------- */
export class Job extends DurableObject {
  async start(b) {
    const old = await this.ctx.storage.get("job");
    if (old) return { id: old.id, state: old.state };
    const job = {
      id: b.id, chat: String(b.chat || ""), title: String(b.title || "Obsidia").slice(0, 80),
      queue: b.queue.slice(0, 10), req: b.req, state: "queued", created: Date.now(),
    };
    await this.ctx.storage.put("job", job);
    await this.ctx.storage.setAlarm(Date.now() + 50);
    return { id: job.id, state: job.state };
  }
  async status() {
    const j = await this.ctx.storage.get("job");
    if (!j) return { state: "missing" };
    const { queue, req, ...pub } = j;
    return pub;
  }
  async cancel() {
    const j = await this.ctx.storage.get("job");
    if (j && (j.state === "queued" || j.state === "running")) {
      j.state = "cancelled"; j.queue = null; j.req = null; j.finished = Date.now();
      await this.ctx.storage.put("job", j);
    }
    return { ok: true };
  }
  async remove() { await this.ctx.storage.deleteAll(); return { ok: true }; }
  async alarm(info) {
    const j = await this.ctx.storage.get("job");
    if (!j) return;
    if (j.state === "done" || j.state === "error" || j.state === "cancelled") {
      const end = (j.finished || j.created) + 24 * 3600 * 1000;
      if (Date.now() >= end - 60000) await this.ctx.storage.deleteAll(); // pembersihan setelah 24 jam
      else await this.ctx.storage.setAlarm(end);
      return;
    }
    if (j.state === "running" && info && info.retryCount > 0) {
      j.state = "error"; j.tried = [{ name: "Server", status: 0, msg: "Server terhenti saat mengerjakan jawaban." }];
    } else {
      j.state = "running"; j.started = Date.now();
      await this.ctx.storage.put("job", j);
      const tried = [];
      for (const q of j.queue) {
        const now = await this.ctx.storage.get("job");
        if (!now || now.state === "cancelled") return;
        try {
          const r = await callProvider(q, j.req);
          Object.assign(j, { text: r.text, think: r.think, provider: q.name, pv: q.pv, model: q.model, state: "done" });
          break;
        } catch (e) {
          const status = e.status || 0;
          tried.push({ pv: q.pv, name: q.name, status, msg: String(e.message || e).slice(0, 300) });
          if (!(status === 0 || status === 429 || status >= 500)) break;
        }
      }
      if (j.state !== "done") j.state = "error";
      j.tried = tried;
    }
    const now = await this.ctx.storage.get("job");
    if (!now || now.state === "cancelled") return;
    j.finished = Date.now(); j.queue = null; j.req = null;
    await this.ctx.storage.put("job", j);
    await this.ctx.storage.setAlarm(Date.now() + 24 * 3600 * 1000);
    // Beri aplikasi waktu mengambil jawaban sendiri; kalau sudah diambil, notifikasi tidak perlu.
    await new Promise((r) => setTimeout(r, 5000));
    const after = await this.ctx.storage.get("job");
    if (!after || after.seen) return;
    try {
      const hub = this.env.HUB.get(this.env.HUB.idFromName("hub"));
      await hub.notify(
        j.state === "done"
          ? { title: "Jawaban siap: " + j.title, body: preview(j.text), tag: j.id, url: "./?job=" + j.id }
          : { title: "Obsidia gagal menjawab", body: "Buka Obsidia untuk melihat penyebabnya.", tag: j.id, url: "./?job=" + j.id }
      );
    } catch (e) {}
  }
}

const preview = (t) =>
  String(t || "").replace(/```[\s\S]*?(```|$)/g, " ").replace(/[#*`>_]/g, "").replace(/\s+/g, " ").trim().slice(0, 140) || "Ketuk untuk membaca.";

function splitThink(raw) {
  const s = String(raw || "").replace(/^\s+/, "");
  if (!s.startsWith("<think>")) return { text: String(raw || ""), think: "" };
  const i = s.indexOf("</think>");
  return i < 0 ? { text: "", think: s.slice(7) } : { text: s.slice(i + 8).replace(/^\s+/, ""), think: s.slice(7, i).trim() };
}
const httpErr = async (res) => {
  let msg = "";
  try {
    const t = await res.text();
    try { const j = JSON.parse(t); const e = Array.isArray(j) ? j[0] && j[0].error : j.error; msg = (e && (e.message || e)) || j.message || t; } catch (_) { msg = t; }
  } catch (_) {}
  const e = new Error(String(msg).slice(0, 300)); e.status = res.status; return e;
};

async function callProvider(q, req) {
  if (!/^https:\/\//.test(q.base || "")) { const e = new Error("Alamat API harus https."); e.status = 400; throw e; }
  const base = q.base.replace(/\/+$/, "");
  const signal = AbortSignal.timeout(13 * 60 * 1000);
  const sys = q.sys || req.sys || "";
  if (q.kind === "gemini") {
    const contents = req.turns.map((t) => ({
      role: t.role === "assistant" ? "model" : "user",
      parts: [{ text: t.text }, ...(t.images || []).map((u) => { const m = String(u).match(/^data:([^;]+);base64,(.*)$/); return m ? { inline_data: { mime_type: m[1], data: m[2] } } : null; }).filter(Boolean)],
    }));
    const go = async (think) => {
      const gc = {};
      if (think) { gc.thinkingConfig = { includeThoughts: true }; if (req.eff) gc.thinkingConfig.thinkingBudget = { low: 1024, medium: 8192, high: 24576 }[req.eff]; }
      return fetch(`${base}/models/${encodeURIComponent(q.model)}:generateContent`, {
        method: "POST", signal,
        headers: { "Content-Type": "application/json", "x-goog-api-key": q.key || "" },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: sys }] }, contents, generationConfig: gc }),
      });
    };
    let res = await go(true);
    if (res.status === 400) res = await go(false);
    if (!res.ok) throw await httpErr(res);
    const j = await res.json();
    const parts = (j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || [];
    const text = parts.filter((p) => !p.thought && p.text).map((p) => p.text).join("");
    const think = parts.filter((p) => p.thought && p.text).map((p) => p.text).join("");
    if (!text) { const e = new Error("Gemini tidak mengirim jawaban" + (j.candidates && j.candidates[0] && j.candidates[0].finishReason ? " (" + j.candidates[0].finishReason + ")" : "") + "."); e.status = 422; throw e; }
    return { text, think };
  }
  const msgs = [{ role: "system", content: sys }, ...req.turns.map((t) =>
    t.images && t.images.length
      ? { role: t.role, content: [{ type: "text", text: t.text }, ...t.images.map((u) => ({ type: "image_url", image_url: { url: u } }))] }
      : { role: t.role, content: t.text })];
  const headers = { "Content-Type": "application/json", ...(q.headers || {}) };
  if (q.key) headers.Authorization = "Bearer " + q.key;
  const go = (eff) => fetch(base + "/chat/completions", {
    method: "POST", signal, headers,
    body: JSON.stringify(Object.assign({ model: q.model, messages: msgs, stream: false }, eff ? { reasoning_effort: eff } : {})),
  });
  let res = await go(req.eff);
  if (res.status === 400 && req.eff) res = await go("");
  if (!res.ok) throw await httpErr(res);
  const j = await res.json();
  if (j.error) { const e = new Error(j.error.message || String(j.error)); e.status = 502; throw e; }
  const msg = (j.choices && j.choices[0] && j.choices[0].message) || {};
  const sp = splitThink(msg.content || "");
  const think = msg.reasoning || msg.reasoning_content || sp.think;
  if (!sp.text) { const e = new Error("Penyedia tidak mengirim jawaban."); e.status = 422; throw e; }
  return { text: sp.text, think };
}

/* ---------------- Web Push (RFC 8291 + VAPID RFC 8292) ---------------- */
async function hkdf(salt, ikm, info, len) {
  const k = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, k, len * 8));
}
async function encryptPush(sub, plaintext) {
  const ua = b64u.dec(sub.keys.p256dh);
  const auth = b64u.dec(sub.keys.auth);
  const as = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPub = new Uint8Array(await crypto.subtle.exportKey("raw", as.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", ua, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const secret = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, as.privateKey, 256));
  const ikm = await hkdf(auth, secret, cat(te.encode("WebPush: info\0"), ua, asPub), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, te.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, te.encode("Content-Encoding: nonce\0"), 12);
  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, cat(plaintext, new Uint8Array([2]))));
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096);
  return cat(salt, rs, new Uint8Array([asPub.length]), asPub, ct);
}
async function vapidJWT(aud, v, contact) {
  const part = (o) => b64u.enc(te.encode(JSON.stringify(o)));
  const unsigned = part({ typ: "JWT", alg: "ES256" }) + "." + part({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: contact });
  const key = await crypto.subtle.importKey("jwk", v.jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, te.encode(unsigned));
  return unsigned + "." + b64u.enc(sig);
}
async function sendPush(sub, payload, v, contact) {
  const jwt = await vapidJWT(new URL(sub.endpoint).origin, v, contact);
  const body = await encryptPush(sub, te.encode(payload));
  return fetch(sub.endpoint, {
    method: "POST",
    headers: {
      Authorization: `vapid t=${jwt}, k=${v.pub}`,
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: "86400",
      Urgency: "high",
    },
    body,
  });
}
