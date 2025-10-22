const fs = require("fs-extra");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    aliases: ["🌚"],
    version: "3.5",
    author: "messie osango",
    countDown: 5,
    role: 0,
    shortDescription: {
      fr: "Changer le préfixe du bot",
      en: "Change the bot's prefix"
    },
    longDescription: {
      fr: "Change le symbole de commande du bot dans votre discussion ou globalement (admin uniquement)",
      en: "Change the bot's command symbol in your chat or globally (admin only)"
    },
    category: "box chat",
    guide: {
      fr:
        "   {pn} <nouveau préfixe> : changer le préfixe de votre boîte de discussion" +
        "\n   Exemple : {pn} #" +
        "\n\n   {pn} <nouveau préfixe> -g : changer le préfixe global (admin bot uniquement)" +
        "\n   Exemple : {pn} # -g" +
        "\n\n   {pn} reset : réinitialiser le préfixe de votre boîte de discussion",
      en:
        "   {pn} <new prefix> : change the chat prefix" +
        "\n   Example: {pn} #" +
        "\n\n   {pn} <new prefix> -g : change the global prefix (bot admin only)" +
        "\n   Example: {pn} # -g" +
        "\n\n   {pn} reset : reset your chat prefix"
    }
  },

  langs: {
    fr: {
      reset: "✨ Préfixe réinitialisé par défaut : %1",
      onlyAdmin: "⚠️ Seuls les administrateurs peuvent changer le préfixe du système.",
      confirmGlobal: "🌍 Réagissez à ce message pour confirmer le changement de préfixe global.",
      confirmThisThread: "💬 Réagissez à ce message pour confirmer le changement de préfixe dans cette discussion.",
      successGlobal: "✅ Préfixe du système changé avec succès : %1",
      successThisThread: "✅ Préfixe changé avec succès dans cette discussion : %1",
      invalidPrefix: "⚠️ Le préfixe doit contenir entre 1 et 5 caractères !",
      frameTitle: "🤖 OCTAVIO DARK BOT",
      sysPrefix: "⚙️ Préfixe système",
      boxPrefix: "💬 Préfixe salon",
      helpHint: "📚 Utilisez %1help pour voir toutes les commandes.",
      signature: "💀 Merci d’utiliser OCTAVIO DARK BOT — Créé par Octavio Dark."
    },
    en: {
      reset: "✨ Prefix reset to default: %1",
      onlyAdmin: "⚠️ Only bot administrators can change the system prefix.",
      confirmGlobal: "🌍 React to confirm the global prefix change.",
      confirmThisThread: "💬 React to confirm the prefix change in this chat.",
      successGlobal: "✅ System prefix successfully changed to: %1",
      successThisThread: "✅ Prefix successfully changed in this chat: %1",
      invalidPrefix: "⚠️ Prefix must be between 1 and 5 characters!",
      frameTitle: "🤖 OCTAVIO DARK BOT",
      sysPrefix: "⚙️ System Prefix",
      boxPrefix: "💬 Chat Prefix",
      helpHint: "📚 Use %1help to see all commands.",
      signature: "💀 Thanks for using OCTAVIO DARK BOT — Created by Octavio Dark."
    }
  },

  // ─── Fonction utilitaire : encadrer un texte avec signature ──────────────
  makeFrame(text, getLang) {
    const lines = text.split("\n");
    lines.push(""); // Espace
    lines.push(getLang("signature")); // Signature à la fin
    const maxLen = Math.max(...lines.map(l => l.length));
    const top = "╭" + "─".repeat(maxLen + 2) + "╮";
    const bottom = "╰" + "─".repeat(maxLen + 2) + "╯";
    const body = lines.map(l => "│ " + l.padEnd(maxLen) + " │").join("\n");
    return `${top}\n${body}\n${bottom}`;
  },

  // ─── Lancement de la commande ────────────────────────────────
  onStart: async function ({ message, role, args, event, threadsData, getLang }) {
    const { makeFrame } = this;
    if (!args[0]) return message.SyntaxError();

    const newPrefix = args[0];
    const isGlobal = args.includes("-g");

    if (args[0] === "reset") {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(makeFrame(getLang("reset", global.GoatBot.config.prefix), getLang));
    }

    if (newPrefix.length < 1 || newPrefix.length > 5)
      return message.reply(makeFrame(getLang("invalidPrefix"), getLang));

    if (isGlobal) {
      if (role < 2) return message.reply(makeFrame(getLang("onlyAdmin"), getLang));
      return message.reply({
        body: makeFrame(getLang("confirmGlobal"), getLang),
        reaction: { author: event.userID, newPrefix, setGlobal: true }
      });
    }

    return message.reply({
      body: makeFrame(getLang("confirmThisThread"), getLang),
      reaction: { author: event.userID, newPrefix, setGlobal: false }
    });
  },

  // ─── Confirmation via réaction ───────────────────────────────
  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    const { makeFrame } = this;

    if (event.userID !== author) return;

    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      try {
        fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
        return message.reply(makeFrame(getLang("successGlobal", newPrefix), getLang));
      } catch {
        return message.reply(makeFrame("⚠️ Erreur lors de la sauvegarde du fichier de configuration !", getLang));
      }
    }

    await threadsData.set(event.threadID, newPrefix, "data.prefix");
    return message.reply(makeFrame(getLang("successThisThread", newPrefix), getLang));
  },

  // ─── Affichage du préfixe ────────────────────────────────────
  onChat: async function ({ event, message, getLang }) {
    const { makeFrame } = this;
    if (!event.body) return;
    const content = event.body.toLowerCase();

    if (content === "prefix" || content === "🌚") {
      const sysPrefix = global.GoatBot.config.prefix;
      const boxPrefix = await utils.getPrefix(event.threadID);
      const sysText = getLang("sysPrefix");
      const boxText = getLang("boxPrefix");
      const helpHint = getLang("helpHint", boxPrefix);
      const frameTitle = getLang("frameTitle");

      const msg =
        `${frameTitle}\n` +
        `─────────────────────────────\n` +
        `${sysText} : ${sysPrefix}\n` +
        `${boxText} : ${boxPrefix}\n` +
        `─────────────────────────────\n` +
        `${helpHint}`;

      return message.reply(makeFrame(msg, getLang));
    }
  }
};
