const USER_TAG = "@";
const CHANNEL_TAG = "#";
const ROLE_TAG = "@&";
class TagHandler {
    /**
     * Class to handle tags, the user type includes also roles
     * @param {object} options
     * @param {Element} options.textarea
     * @param {Array} options.dataset
     * @param {Array} [options.extentDataset]
     * @param {Element} options.elementWrapper
     * @param {"channel"|"user"} options.type
     */
    constructor(options) {
        this.type = options.type;
        this.wrapper = options.elementWrapper;
        this.data = options.extentDataset ? [...options.dataset, ...options.extentDataset] : options.dataset;
        this.extentData = options.extentDataset;
        this.textarea = options.textarea;

        this.textarea.addEventListener("input", () => this.onInputTextarea(this.textarea.value));
        this.textarea.addEventListener("keydown", event => this.onKeyPressedTextarea(event));
        this.wrapper.querySelectorAll("div").forEach(
            el => el.addEventListener("click", () => this.onElClick(el)));
    }

    /**
     * Method triggered when the user input something in the textarea
     * if a @ or a # is written the tag window will be shown
     * @param {string} data content of the textarea 
     */
    onInputTextarea(data) {
        const lastChar = data.charAt(this.textarea.value.length-1); 
        if ((this.type == "user" && lastChar == USER_TAG) || (this.type == "channel" && lastChar == CHANNEL_TAG)) {
            this.wrapper.classList.remove("scale-out");
            this.wrapper.classList.add("scale-in");
            this.clear();
        } else if ((lastChar == " " || lastChar == "") && this.wrapper.classList.contains("scale-in")) {
            this.wrapper.classList.remove("scale-in");
            this.wrapper.classList.add("scale-out");
            this.clear();
            if (this.wrapper.querySelector(".selected"))
                this.wrapper.querySelector(".selected").classList.remove("selected");
        } else if (this.wrapper.classList.contains("scale-in")) {
            this.filter(data);
            if (this.wrapper.querySelector(".selected"))
                this.wrapper.querySelector(".selected").classList.remove("selected");
        }
    }

    /**
     * 
     * @param {Event} event 
     */
    onKeyPressedTextarea(event) {
        if (!this.wrapper.classList.contains("scale-in")) return;   //Si la fenêtre est pas affiché on fait rien
        //Sinon on fait un déplacement gauche/droite/haut/bas des flêches pour sélectionner les tags
        if (event.keyCode == 40 || event.keyCode == 39) {
            event.preventDefault();
            this.moveTagRight();
        } else if (event.keyCode == 38 || event.keyCode == 37) {
            event.preventDefault();
            this.moveTagLeft();
        } else if (event.keyCode == 13) {
            event.preventDefault();
            this.wrapper.querySelector(".selected").click();
        }
    } 

    /**
     * If a tag element is clicked
     * @param {Element} element element clicked
     */
    onElClick(element) {
        const text = element.innerText;
        this.textarea.value = this.textarea.value.substring(0, this.textarea.value.lastIndexOf(this.type == "user" ? USER_TAG : CHANNEL_TAG)) + text;
        M.textareaAutoResize(this.textarea);
        this.wrapper.classList.remove("scale-in");
        this.wrapper.classList.add("scale-out");
        if (this.wrapper.querySelector(".selected"))
            this.wrapper.querySelector(".selected").classList.remove("selected");
    }
    /**
     * 
     * Method to filter the tag list
     * @param {string} textContent  
     */
    filter(textContent) {
        const query = textContent.substring(textContent.lastIndexOf(this.type == "user" ? USER_TAG : CHANNEL_TAG)+1, textContent.length);
        const elsToHide = this.data.filter(el => {
            const name = el.name || el.nickname || el.username;
            return !name.toLowerCase().includes(query.toLowerCase());
        });
        const elsToShow = this.data.filter(el => {
            const name = el.name || el.nickname || el.username;
            return name.toLowerCase().includes(query.toLowerCase());
        });
        elsToHide.forEach(el => this.wrapper.querySelector('div[data-id="'+el.id+'"]').classList.add("hidden"));
        elsToShow.forEach(el => this.wrapper.querySelector('div[data-id="'+el.id+'"]').classList.remove("hidden"));
    }

    clear() {
        this.wrapper.querySelectorAll(".hidden").forEach(el => el.classList.remove("hidden"));
    }

    moveTagRight() {
        const selected = this.wrapper.querySelector(".selected");
        if (selected) {
            //If there is a element after
            if (selected.nextElementSibling) {
                //We iterate the tag list and we find the next element shown to add the selected class
                for (let i = Array.prototype.indexOf.call(this.wrapper.children, selected)+1; i < this.wrapper.children.length; i++) {
                    const el = this.wrapper.children[i];
                    if (!el.classList.contains("hidden")) {
                        el.classList.add("selected");
                        selected.classList.remove("selected");
                        break;
                    }
                }
            } else {    //If there is no element after we select the first one 
                for (let el of this.wrapper.children) {
                    if (!el.classList.contains("hidden")) {
                        selected.classList.remove("selected");
                        el.classList.add("selected");
                        break;
                    }
                }
            }
        } else {
            //if there is nothing selected we select the first one
            for (let el of this.wrapper.children) {
                if (!el.classList.contains("hidden")) {
                    el.classList.add("selected");
                    break;
                }
            }
        }
    }
    moveTagLeft() {
        const selected = this.wrapper.querySelector(".selected");
        if (selected) {
            if (selected.previousElementSibling) {
                for (let i = Array.prototype.indexOf.call(this.wrapper.children, selected)-1; i >= 0; i--) {
                    const el = this.wrapper.children[i];
                    if (!el.classList.contains("hidden")) {
                        el.classList.add("selected");
                        selected.classList.remove("selected");
                        break;
                    }
                }
            }
        } else {
            for (let i = this.wrapper.children.length-1; i >= 0; i--) {
                const el = this.wrapper.children[i];
                if (!el.classList.contains("hidden")) {
                    el.classList.add("selected");
                    break;
                }
            }
        }
    }

    /**
     * @param {string} textContent
     * @returns {string} converted text
     */
    replaceTag(textContent) {
        for (const el of this.data) {
            if (this.type == "user") {
                if (this.extentData.includes(el))  //If the el is in the extent data we put the roles
                    textContent = textContent.replace(`@${el.nickname || el.username || el.name}`, `<${ROLE_TAG}${el.id}>`);
                else
                    textContent = textContent.replace(`@${el.nickname || el.username || el.name}`, `<${USER_TAG}${el.id}>`);
            }
            else    
                textContent = textContent.replace(`#${el.nickname || el.username || el.name}`, `<${CHANNEL_TAG}${el.id}>`);
        }
        return textContent;
    }
}
export default TagHandler;
