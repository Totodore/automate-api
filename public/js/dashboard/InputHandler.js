import TagHandler from "./TagHandler.js";

class InputHandler {
    /**
     * 
     * @param {object} options
     * @param {"edit"|"cron"|timer} options.type
     * @param {M.Modal} options.windowModal
     * @param {Element} options.textarea 
     */
    constructor(options) {
        this.type = options.type;
        const modalEl = options.windowModal.el;
        this.tagHandlers = [...modalEl.querySelectorAll(".tag_wrapper")].map(el => new TagHandler({
            elementWrapper: el,
            dataset: el.classList.contains("channels_wrapper") ? document.channels : document.users,
            textarea: el.parentElement.querySelector("textarea"),
            type: el.classList.contains("channels_wrapper") ? "channel" : "user",
            extentDataset: el.classList.contains("users_wrapper") ? document.roles : undefined,
        }));
    }


    sendRequest() {

    }
}

export default InputHandler;