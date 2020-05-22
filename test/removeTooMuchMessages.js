const fs = require("fs");

//Supprime des messages si il y en a au dessus de 5 par guild

fs.readdirSync(__dirname+"/../data/guilds/").forEach(guildId => {
    const data = JSON.parse(fs.readFileSync(__dirname + "/../data/guilds/" + guildId + "/data.json"));
    if (data.freq.length > 5) {
        data.freq.splice(5, data.freq.length);
        fs.writeFileSync(__dirname + "/../data/guilds/" + guildId + "/data.json", JSON.stringify(data));
    }
});