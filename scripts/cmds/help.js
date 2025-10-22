const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

function roleTextToString(role) {
  switch (role) {
    case 0: return "All users";
    case 1: return "Group admins";
    case 2: return "Bot admins";
    default: return "Unknown";
  }
}

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
    name: "help",
    version: "2.0",
    author: "messie osango",
    countDown: 5,
    role: 0,
    shortDescription: "View commands list & info",
    longDescription: "Displays all commands and detailed info per command",
    category: "info",
    guide: "{pn} [command_name]",
    priority: 1
  },

  onStart: async function ({ message, args, event, role }) {
    const prefix = await getPrefix(event.threadID);

    // HELP SANS ARGUMENT → LISTE DES COMMANDES
    if (!args[0]) {
      const categories = {};
      let msg = "╭━[ OCTAVIO BOT DARK ]━━╮\n";

      for (const [name, cmd] of commands) {
        if (cmd.config.role > role) continue;
        const cat = cmd.config.category || "NO CATEGORY";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(name);
      }

      Object.keys(categories).sort().forEach(cat => {
        msg += `╭━[ ${cat.toUpperCase()} ]━━╮\n`;
        categories[cat].sort().forEach(cmdName => {
          msg += `┃ ✦ ${cmdName}\n`;
        });
        msg += "╰━━━━━━━━━━━━━━━━╯\n";
      });

      msg += `╭━[ INFO ]━━╮\n`;
      msg += `┃ TOTAL COMMANDS: ${commands.size}\n`;
      msg += `┃ PREFIX: ${prefix}\n`;
      msg += `┃ Type ${prefix}help cmd_name for detailed info\n`;
      msg += "╰━━━━━━━━━━━━━━━━╯";

      return await message.reply(makeFrame(msg));
    }

    // HELP AVEC ARGUMENT → INFO SUR UNE COMMANDE
    const input = args[0].toLowerCase();
    const cmd = commands.get(input) || commands.get(aliases.get(input));
    if (!cmd) {
      return await message.reply(makeFrame("Command not found ❌"));
    }

    const c = cmd.config;
    const usage = (c.guide?.en || "No guide").replace(/{p}/g, prefix).replace(/{n}/g, c.name);

    const infoMsg = 
`╭━[ COMMAND INFO ]━━╮
┃
┃ NAME: ${c.name}
┃ VERSION: ${c.version || "1.0"}
┃ AUTHOR: ${c.author || "Unknown"}
┃
┃ DESCRIPTION:
┃ ${c.longDescription?.en || "No description"}
┃
┃ USAGE:
┃ ${usage}
┃
┃ ALIASES: ${c.aliases ? c.aliases.join(", ") : "None"}
┃ ROLE: ${roleTextToString(c.role)}
┃ COOLDOWN: ${c.countDown || 2}s
╰━━━━━━━━━━━━━━━━╯`;

    return await message.reply(makeFrame(infoMsg));
  }
};
