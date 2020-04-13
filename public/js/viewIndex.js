window.addEventListener("DOMContentLoaded", (event) => {
    document.querySelectorAll(".guild").forEach(guild => guild.addEventListener("click", (e) => {
        window.open("https://discordapp.com/api/oauth2/authorize?client_id=697112502378561586&permissions=55296&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2FoauthBot&scope=bot&guild_id="+guild.id, "Autorisez moi à venir !", "height=750, width=450");
    }));
});


