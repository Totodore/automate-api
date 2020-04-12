window.addEventListener("DOMContentLoaded", (event) => {
    const header_user = document.querySelector(".header_user img");
    if (header_user) {
        M.Tooltip.init(header_user);
        const remove_account_modal = M.Modal.init(document.querySelector("#remove_account_modal"));
        header_user.addEventListener("click", () => remove_account_modal.open());
        document.querySelector("#confirm-deco").addEventListener("click", () => {
            fetch("/ajax/deconnectUser").then(res => {
                if (res.status != 200) {
                    console.log(`Erreur : ${res.status} ${res.statusText}`);
                    M.toast({html: "Ouuups ! Une erreur est apparue lors de ta déconnexion"});
                } else {
                    location = "/connect?msg=Tu as bien été déconnecté !";
                }
            });
        });
    }
    const params = new URLSearchParams(location.search.slice(1));
    if (params.get("msg")) {
        M.toast({html: params.get("msg")});
        params.delete("msg");
        history.replaceState(null, "", `${window.location.pathname}?${params}${window.location.hash}`);
    }
});