const axios = require("axios");

const RP = "Réponds selon le sujet de la question, ajoute des emojis pertinents et garde un ton adapté.";

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
    case "amour": return "💖 Réponds avec douceur et un ton romantique. Max 5000 caractères.";
    case "jeux": return "🎮 Réponds comme un gamer cool et enthousiaste. Max 5000 caractères.";
    case "science": return "🔬 Réponds de manière claire et instructive. Max 5000 caractères.";
    case "cuisine": return "🍳 Donne une réponse gourmande et conviviale. Max 5000 caractères.";
    case "musique": return "🎵 Réponds avec un ton artistique et inspirant. Max 5000 caractères.";
    default: return "🤖 Réponds normalement avec un ton amical. Max 5000 caractères.";
  }
}

// Encadré avec signature
function makeFrame(text) {
  const signature = "💀 Merci d’utiliser OCTAVIO DARK BOT — Créé par Octavio Dark.";
  const lines = [...text.split("\n"), "", signature];
  const maxLen = Math.max(...lines.map(l => l.length));
  const top = "╭" + "─".repeat(maxLen + 2) + "╮";
  const bottom = "╰" + "─".repeat(maxLen + 2) + "╯";
  const body = lines.map(l => "│ " + l.padEnd(maxLen) + " │").join("\n");
  return `${top}\n${body}\n${bottom}`;
}

module.exports = {
  config: {
    name: "ai",
    aliases: ["ae", "anjara"],
    version: "3.0",
    author: "messie osango",
    countDown: 2,
    role: 0,
    shortDescription: "🤖 IA intelligente par sujet",
    longDescription: "Répond automatiquement selon le thème de la question, jusqu'à 5000 caractères.",
    category: "ai",
    guide: "{pn} <question>"
  },

  onStart: async function ({ message, args }) {
    const input = args.join(" ").trim();

    if (!input) {
      return message.reply(makeFrame(`🤖 Salut humain !  
Je suis Kakashi Hatake, créé par Octavio 😎  
Pose-moi ta question 💬`));
    }

    if (input.toLowerCase().includes("qui es-tu")) {
      return message.reply(makeFrame(`🤖 Je suis Kakashi Hatake.  
Mon créateur est Octavio 👑`));
    }

    const sujet = detectSujet(input);
    const style = styleSujet(sujet);

    try {
      const url = `https://haji-mix-api.gleeze.com/api/groq?ask=${encodeURIComponent(input)}&model=llama-3.3-70b-versatile&uid=56666&RP=${encodeURIComponent(style)}&max_tokens=5000`;
      const res = await axios.get(url, { timeout: 30000 });
      const raw = res.data?.answer || res.data?.result || res.data?.message || "🤖 Aucune réponse reçue.";

      return message.reply(makeFrame(raw));
    } catch {
      return message.reply(makeFrame("❌ Erreur de réponse IA."));
    }
  }
};
