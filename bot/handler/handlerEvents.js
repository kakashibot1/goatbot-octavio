async function onStart() {
    // —————————————— CHECK USE BOT —————————————— //
    if (!body || !body.startsWith(prefix)) return;

    const dateNow = Date.now();
    const args = body.slice(prefix.length).trim().split(/ +/);

    // ————————————  CHECK HAS COMMAND ——————————— //
    let commandName = args.shift().toLowerCase();
    let command = GoatBot.commands.get(commandName) || GoatBot.commands.get(GoatBot.aliases.get(commandName));

    // ———————— CHECK ALIASES SET BY GROUP ———————— //
    const aliasesData = threadData.data.aliases || {};
    for (const cmdName in aliasesData) {
        if (aliasesData[cmdName].includes(commandName)) {
            command = GoatBot.commands.get(cmdName);
            break;
        }
    }

    // ————————————— SET COMMAND NAME ————————————— //
    if (command) commandName = command.config.name;

    // —————  CHECK BANNED OR ONLY ADMIN BOX  ————— //
    if (isBannedOrOnlyAdmin(userData, threadData, senderID, threadID, isGroup, commandName, message, langCode))
        return;

    // ————————————— COMMAND NOT FOUND ——————————— //
    if (!command) {
        if (!hideNotiMessage.commandNotFound) {
            const text = commandName
                ? utils.getText({ lang: langCode, head: "handlerEvents" }, "commandNotFound", commandName, prefix)
                : utils.getText({ lang: langCode, head: "handlerEvents" }, "commandNotFound2", prefix);

            return await message.reply(text);
        } else return true;
    }

    // ————————————— CHECK PERMISSION ———————————— //
    const roleConfig = getRoleConfig(utils, command, isGroup, threadData, commandName);
    const needRole = roleConfig.onStart;

    if (needRole > role) {
        if (!hideNotiMessage.needRoleToUseCmd) {
            if (needRole == 1)
                return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "onlyAdmin", commandName));
            else if (needRole == 2)
                return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "onlyAdminBot2", commandName));
        } else return true;
    }

    // ———————————————— countDown ———————————————— //
    if (!client.countDown[commandName]) client.countDown[commandName] = {};
    const timestamps = client.countDown[commandName];
    let getCoolDown = command.config.countDown;
    if (!getCoolDown && getCoolDown != 0 || isNaN(getCoolDown)) getCoolDown = 1;
    const cooldownCommand = getCoolDown * 1000;

    if (timestamps[senderID]) {
        const expirationTime = timestamps[senderID] + cooldownCommand;
        if (dateNow < expirationTime)
            return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "waitingForCommand", ((expirationTime - dateNow) / 1000).toString().slice(0, 3)));
    }

    // ——————————————— RUN COMMAND ——————————————— //
    const time = getTime("DD/MM/YYYY HH:mm:ss");
    isUserCallCommand = true;

    try {
        // analytics command call
        (async () => {
            const analytics = await globalData.get("analytics", "data", {});
            if (!analytics[commandName]) analytics[commandName] = 0;
            analytics[commandName]++;
            await globalData.set("analytics", analytics, "data");
        })();

        createMessageSyntaxError(commandName);
        const getText2 = createGetText2(langCode, `${process.cwd()}/languages/cmds/${langCode}.js`, prefix, command);
        await command.onStart({
            ...parameters,
            args,
            commandName,
            getLang: getText2,
            removeCommandNameFromBody: parameters.removeCommandNameFromBody
        });
        timestamps[senderID] = dateNow;

        log.info("CALL COMMAND", `${commandName} | ${userData.name} | ${senderID} | ${threadID} | ${args.join(" ")}`);
    } catch (err) {
        log.err("CALL COMMAND", `An error occurred when calling the command ${commandName}`, err);
        return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "errorOccurred", time, commandName, removeHomeDir(err.stack ? err.stack.split("\n").slice(0, 5).join("\n") : JSON.stringify(err, null, 2))));
    }
			}
