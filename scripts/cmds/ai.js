const axios = require("axios");

const Prefixes = ["ai", "anjara", "ae"];
const RP = "Réponds selon le sujet de la question, ajoute des emojis pertinents et garde un ton adapté.";

const fonts = {
  a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶",
  j: "𝗷", k: "𝗸", l: "𝗹", m: "𝗺", n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿",
  s: "𝘀", t: "𝘁", u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
  A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜",
  J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥",
  S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭"
};

function applyFont(text) {
  return text.split('').map(char => fonts[char] || char).join('');
}

function detectSujet(texte) {
  texte = texte.toLowerCase();
  if (texte.includes("amour") || texte.includes("couple") || texte.includes("coeur")) return "amour";
  if (texte.includes("jeu") || texte.includes("gaming") || texte.includes("ps5") || texte.includes("minecraft")) return "jeux";
  if (texte.includes("science") || texte.includes("physique") || texte.includes("chimie") || texte.includes("univers")) return "science";
  if (texte.includes("cuisine") || texte.includes("recette") || texte.includes("manger")) return "cuisine";
  if (texte.includes("musique") || texte.includes("chanson") || texte.includes("rap")) return "musique";
  return "autre";
}

function styleSujet(sujet) {
  switch (sujet) {
    case "amour": return "💖 Réponds avec douceur et un ton romantique.";
    case "jeux": return "🎮 Réponds comme un gamer cool et enthousiaste.";
    case "science": return "🔬 Réponds de manière claire et instructive.";
    case "cuisine": return "🍳 Donne une réponse gourmande et conviviale.";
    case "musique": return "🎵 Réponds avec un ton artistique et inspirant.";
    default: return "🤖 Réponds normalement avec un ton amical.";
  }
}

module.exports = {
  config: {
    name: "ai",
    aliases: ["ae"],
    version: "3.0",
    author: "messie osango",
    countDown: 2,
    role: 0,
    shortDescription: "🤖 IA intelligente par sujet",
    longDescription: "Répond automatiquement selon le thème de la question, avec un style adapté et du texte stylisé.",
    category: "ai",
    guide: "{pn} <question>"
  },

  onStart: async function ({ message, args }) {
    const input = args.join(" ").trim().toLowerCase();

    if (!input) {
      return message.reply(`╭━━━━━━━━━━━━━━━━╮
┃ 🤖 Salut humain !
┃ Je suis Kakashi Hatake, créé par Octavio 😎
┃ Pose-moi ta question 💬
╰━━━━━━━━━━━━━━━━╯`);
    }

    if (input.includes("qui es-tu")) {
      return message.reply(`╭━━━━━━━━━━━━━━━━╮
┃ 🤖 Je suis Kakashi Hatake.
┃ Mon créateur est Octavio 👑
╰━━━━━━━━━━━━━━━━╯`);
    }

    const sujet = detectSujet(input);
    const style = styleSujet(sujet);

    try {
      const url = `https://haji-mix-api.gleeze.com/api/groq?ask=${encodeURIComponent(input)}&model=llama-3.3-70b-versatile&uid=56666&RP=${encodeURIComponent(style)}&stream=True`;
      const res = await axios.get(url, { timeout: 20000 });
      const raw = res.data?.answer || res.data?.result || res.data?.message || "🤖 Aucune réponse reçue.";
      const styled = applyFont(raw);
      return message.reply(`╭━━━━━━━━━━━━━━━━╮
┃ ${styled}
╰━━━━━━━━━━━━━━━━╯`);
    } catch {
      return message.reply(applyFont("❌ Erreur de réponse IA."));
    }
  }
};
