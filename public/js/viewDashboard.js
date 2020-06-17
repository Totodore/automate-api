class VueDashboard {
    constructor() {
        this.months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];
		this.addTimerModal = M.Modal.init(document.querySelector("#addTimer"));
		this.formTimer = document.forms.namedItem("addTimerForm");
        this.addTimer_modalConfirm = document.querySelector("#addTimer .modal-confirm");

        this.addCronModal = M.Modal.init(document.querySelector("#add_cron"));
		this.form = document.forms.namedItem("addForm");
        this.timePickerWrapper = document.querySelector(".timeSelect-wrapper");
        this.daySelectWrapper = document.querySelector(".daySelect-wrapper");
        this.eachSelect = this.form.elements.namedItem("each");
		this.addCron_modalConfirm = document.querySelector("#add_cron .modal-confirm");

        this.removeCron_modalConfirm = document.querySelector("#remove_modal .modal-confirm");
        this.removeCronModal = M.Modal.init(document.querySelector("#remove_modal"));

        this.optionsModal = M.Modal.init(document.querySelector("#options_modal"));
        this.editMessageModal = M.Modal.init(document.querySelector("#editMessage"));

		this.tableLines = document.querySelectorAll("tbody tr");
        this.guild_id = new URLSearchParams(location.search).get("id");

        this.timezoneModal = M.Modal.init(document.querySelector("#setTimezone"));
        this.addTimezone = document.querySelector("#setTimezone .modal-confirm");
        let data = {};
        for(const key of Object.keys(document.timezone_data))
            data[key] = null;
        this.timezoneSelector = M.Autocomplete.init(document.querySelector(".autocomplete"), {data: data});

		let self = this;
        this.timePicker = M.Timepicker.init(document.querySelector("#timeSelect"), {
            container: "body",
            twelveHour: false,
            onOpenEnd: () => {
                if (self.form.elements.namedItem("each").value == "hour")
                    self.timePicker.showView("minutes");
            },
			defaultTime: 'now'
		});
		this.timePickerTimer = M.Timepicker.init(document.querySelector("#timeSelectTimer"), {
			container: "body",
			twelveHour: false,
			defaultTime: 'now'
		});
    
        this.datePicker = M.Datepicker.init(document.querySelectorAll(".datepicker"), {
            container: "body",
            firstDay: 1,
            format: "On dddd the d on mmmm yyyy",
            minDate: new Date(),
            setDefaultDate: true,
            yearRange: 1,
            defaultDate: new Date(),
        });
        M.FormSelect.init(document.querySelectorAll("select")); 
        this.addEventListener();
    }

    addEventListener() {
		this.tableLines = document.querySelectorAll("tbody tr");
        document.querySelector(".schedule-add-btn").addEventListener("click", () => this.addCronModal.open());
        document.querySelector(".timer-add-btn").addEventListener("click", () => this.addTimerModal.open());
        document.querySelector(".guild-timezone").addEventListener("click", () => this.timezoneModal.open());
        document.querySelectorAll("textarea").forEach(el => {
            el.addEventListener("input", () => this.onInputTextarea(el));
            el.addEventListener("keydown", (event) => this.onKeyPressedTextarea(event, el));
        });
        document.querySelector(".autocomplete").addEventListener("change", (e) => this.onInputAutoComplete(e));
        document.querySelectorAll(".user_el").forEach(el => el.addEventListener("click", () => this.onUserClick(el)));
        document.querySelectorAll(".channel_el").forEach(el => el.addEventListener("click", () => this.onChannelClick(el)));
        document.querySelector("#setTimezone .modal-confirm").addEventListener("click", () => this.onConfirmSetTimer());
        document.querySelector("#options_modal .delete").addEventListener("click", () => this.onRemoveEl());
        document.querySelector("#options_modal .edit").addEventListener("click", () => this.onOpenEdit());
        document.querySelector("#editMessage .modal-confirm").addEventListener("click", () => this.onConfirmUpdateMessage());
        this.eachSelect.addEventListener("change", () => this.onChangeEachSelect());
		this.addCron_modalConfirm.addEventListener("click", () => this.onConfirmAddCron());
        this.addTimer_modalConfirm.addEventListener("click", () => this.onConfirmAddTimer());
		
        this.tableLines.forEach(el => {
            el.addEventListener("click", () => this.onElClick(el)); 
            el.querySelector(".edit").addEventListener("click", () => this.onOpenEdit(el));
            el.querySelector(".delete").addEventListener("click", () => this.onRemoveEl(el));
        });
        this.removeCron_modalConfirm.addEventListener("click", () => this.onConfirmRemoveCron());
    }

    onInputTextarea(element) {
        const data = element.value;
        const channels_wrapper = element.parentNode.querySelector(".channels_wrapper");
        const users_wrapper = element.parentNode.querySelector(".users_wrapper");
        if (data.charAt(data.length-1) == "@") {
            users_wrapper.classList.remove("scale-out");
            users_wrapper.classList.add("scale-in");
            this.sortUsers(element, true);
        } else if (data.charAt(data.length-1) == "#") { 
            channels_wrapper.classList.remove("scale-out");
            channels_wrapper.classList.add("scale-in");
            this.sortUsers(element, true);
        } else if ((data.charAt(data.length-1) == " " || data == "") && channels_wrapper.classList.contains("scale-in")) {
            channels_wrapper.classList.remove("scale-in");
            channels_wrapper.classList.add("scale-out");
            this.sortUsers(element, true);
        } else if ((data.charAt(data.length-1) == " " || data == "") && users_wrapper.classList.contains("scale-in")) {
            users_wrapper.classList.remove("scale-in");
            users_wrapper.classList.add("scale-out");
            this.sortUsers(element, true);
            if (users_wrapper.querySelector(".selected"))
                users_wrapper.querySelector(".selected").classList.remove("selected");
        } else if (channels_wrapper.classList.contains("scale-in")) {
            this.sortChannels(element);
        } else if (users_wrapper.classList.contains("scale-in")) {
            this.sortUsers(element);
            if (channels_wrapper.querySelector(".selected"))
                channels_wrapper.querySelector(".selected").classList.remove("selected");
        }
    }
    onInputAutoComplete(e) {
        if (e.target.value in this.timezoneSelector.options.data)
            this.addTimezone.classList.remove("disabled");
        else 
            this.addTimezone.classList.add("disabled");
    }

    onUserClick(element) {
        const user = element.innerText;
        const textarea = element.parentNode.parentNode.querySelector("textarea");
        const users_wrapper = element.parentNode.parentNode.querySelector(".users_wrapper");
        textarea.value = textarea.value.substring(0, textarea.value.lastIndexOf("@")) + user;
        for (let el of document.users) {
            const nickname = el.nickname || el.username;
            if ("@"+nickname == user) {
                document.users.push(el);
                break;
            }
        }
        M.textareaAutoResize(textarea);
        users_wrapper.classList.remove("scale-in");
        users_wrapper.classList.add("scale-out");
        if (users_wrapper.querySelector(".selected"))
            users_wrapper.querySelector(".selected").classList.remove("selected");
    }
    onChannelClick(element) {
        const channel = element.innerText;
        const textarea = element.parentNode.parentNode.querySelector("textarea");
        const channels_wrapper = element.parentNode.parentNode.querySelector(".channels_wrapper");
        textarea.value = textarea.value.substring(0, textarea.value.lastIndexOf("#")) + channel;
        M.textareaAutoResize(textarea);
        channels_wrapper.classList.remove("scale-in");
        channels_wrapper.classList.add("scale-out");
        if (channels_wrapper.querySelector(".selected")) 
            channels_wrapper.querySelector(".selected").classList.remove("selected");
    }

    sortChannels(element, clear) {
        const data = element.value;
        const wrapper = element.parentNode.querySelector(".channels_wrapper");
        const keyword = data.substring(data.lastIndexOf("#")+1, data.length);
        if (!clear) {
            const elsToHide = document.channels.filter(el => !el.name.toLowerCase().includes(keyword.toLowerCase()));
            const elsToShow = document.channels.filter(el => el.name.toLowerCase().includes(keyword.toLowerCase()));
            elsToHide.forEach(el => wrapper.querySelector('div[data-id="'+el.id+'"]').classList.add("hidden"));
            elsToShow.forEach(el => wrapper.querySelector('div[data-id="'+el.id+'"]').classList.remove("hidden"));
        } else {
            wrapper.querySelectorAll(".hidden").forEach(el => el.classList.remove("hidden"));
        }
    }
    sortUsers(element, clear) {
        const data = element.value;
        const wrapper = element.parentNode.querySelector(".users_wrapper");
        const keyword = data.substring(data.lastIndexOf("@")+1, data.length);
        if (!clear) {
            const elsToHide = document.users.filter(el => el.nickname ? !el.nickname.toLowerCase().includes(keyword.toLowerCase()) : !el.username.toLowerCase().includes(keyword.toLowerCase()));
            const elsToShow = document.users.filter(el => el.nickname ? el.nickname.toLowerCase().includes(keyword.toLowerCase()) : el.username.toLowerCase().includes(keyword.toLowerCase()));
            elsToHide.forEach(el => wrapper.querySelector('div[data-id="'+el.id+'"]').classList.add("hidden"));
            elsToShow.forEach(el => wrapper.querySelector('div[data-id="'+el.id+'"]').classList.remove("hidden"));
        } else {
            wrapper.querySelectorAll(".hidden").forEach(el => el.classList.remove("hidden"));
        }
    }

    onKeyPressedTextarea(event, element) {
        const tag_wrapper = element.parentNode.querySelector(".scale-in");
        if (!tag_wrapper) return;   //Si la fenêtre est pas affiché on fait rien
        //Sinon on fait un déplacement gauche/droite/haut/bas des flêches pour sélectionner les tags
        if (event.keyCode == 40 || event.keyCode == 39) {
            event.preventDefault();
            this.moveTagRight(tag_wrapper);
        } else if (event.keyCode == 38 || event.keyCode == 37) {
            event.preventDefault();
            this.moveTagLeft(tag_wrapper);
        } else if (event.keyCode == 13) {
            event.preventDefault();
            tag_wrapper.querySelector(".selected").click();
        }
    } 

    moveTagRight(tag_wrapper) {
        const selected = tag_wrapper.querySelector(".selected");
        if (selected) {
            if (selected.nextElementSibling) {
                for (let i = Array.prototype.indexOf.call(tag_wrapper.children, selected)+1; i < tag_wrapper.children.length; i++) {
                    const el = tag_wrapper.children[i];
                    if (!el.classList.contains("hidden")) {
                        el.classList.add("selected");
                        selected.classList.remove("selected");
                        break;
                    }
                }
            } else {
                for (let el of tag_wrapper.children) {
                    if (!el.classList.contains("hidden")) {
                        selected.classList.remove("selected");
                        el.classList.add("selected");
                        break;
                    }
                }
            }
        } else {
            //Si jamais l'utilisateur n'a pas encore appuyé sur une flèche alors le premier élément sera celui sans hidden
            for (let el of tag_wrapper.children) {
                if (!el.classList.contains("hidden")) {
                    el.classList.add("selected");
                    break;
                }
            }
        }
    }
    moveTagLeft(tag_wrapper) {
        const selected = tag_wrapper.querySelector(".selected");
        if (selected) {
            if (selected.previousElementSibling) {
                for (let i = Array.prototype.indexOf.call(tag_wrapper.children, selected)-1; i >= 0; i--) {
                    const el = tag_wrapper.children[i];
                    if (!el.classList.contains("hidden")) {
                        el.classList.add("selected");
                        selected.classList.remove("selected");
                        break;
                    }
                }
            }
        } else {
            for (let i = tag_wrapper.children.length-1; i >= 0; i--) {
                const el = tag_wrapper.children[i];
                if (!el.classList.contains("hidden")) {
                    el.classList.add("selected");
                    break;
                }
            }
        }
    }

    onChangeEachSelect() {
        if (this.eachSelect.value == "week") {
            this.timePickerWrapper.style.display = "block";
            this.daySelectWrapper.style.display = "block";
        } else if (this.eachSelect.value == "day") {
            this.timePickerWrapper.style.display = "block";
            this.daySelectWrapper.style.display = "none";
        } else if (this.eachSelect.value == "hour") {
            this.timePickerWrapper.style.display = "block";
            this.daySelectWrapper.style.display = "none";
        } else if (this.eachSelect.value == "minute") {
            this.timePickerWrapper.style.display = "none";
            this.daySelectWrapper.style.display = "none";
        }
    }

    onConfirmAddCron() {
		if (!this.form.checkValidity()) {
			M.toast({html: "You message has to be more thicc!"});
			return;
		}
        const eachVal = this.eachSelect.value;
        let desc = "Every " + eachVal;
        let cron = ["*", "*", "*", "*", "*"];
        if (eachVal == "week") {
            let selectedDays = [];
            //Pour chaque element selectionné (on a juste le nom)
            this.daySelectWrapper.querySelectorAll(".selected").forEach((el) => {
                //Pour chaque element proposé (nom + valeur)
                console.log(el);
                document.querySelectorAll("#daySelect option").forEach((inputEl) => {
                    console.log(inputEl);
                    if (el.textContent == inputEl.textContent)
                        selectedDays[inputEl.value] = inputEl.textContent;
                });
            });
            console.log(selectedDays);
            if (selectedDays.length > 0) {
                desc += " on " + Object.values(selectedDays).join(", ");
                cron[4] = Object.keys(selectedDays).join(",");
            }
            else {
                desc += " on monday";
                cron[4] = "1";
            }
            if (this.timePicker.time) {
                desc += " at " +  this.timePicker.time.replace(":", "h");
                cron[0] =  this.timePicker.time.substring(3,5);
                cron[1] =  this.timePicker.time.substring(0, 2);
            }
            else {
                desc += " at 00h00";
                cron[0] = "00";
                cron[1] = "00"; 
            }
        } else if (eachVal == "day") {
            if (this.timePicker.time) {
                desc += " at " +  this.timePicker.time.replace(":", "h");
                cron[0] =  this.timePicker.time.substring(3,5);
                cron[1] =  this.timePicker.time.substring(0, 2);
            }
            else {
                desc += " at " + "00h00";
                cron[0] = "00";
                cron[1] = "00";
            }
        } else if (eachVal == "hour") {
            if (this.timePicker.time) {
                if (this.timePicker.time.substring(4, 5) == "1")
                    desc += " at the " +  this.timePicker.time.substring(3, 5) + "st minute";
                else if (this.timePicker.time.substring(4, 5) == "2")
                    desc += " at the " +  this.timePicker.time.substring(3, 5) + "nd minute";
                else if (this.timePicker.time.substring(4, 5) == "3")
                    desc += " at the " +  this.timePicker.time.substring(3, 5) + "rd minute";
                else
                    desc += " at the " +  this.timePicker.time.substring(3, 5) + "th minute";
                cron[0] =  this.timePicker.time.substring(3,5);
            }
            else {
                desc += " at the first minute";
                cron[0] = "00";
            }
		}
		
        const channel_id = this.form.elements.namedItem("channelSelect").value;
        const formData = new FormData();
        const content = this.form.elements.namedItem("content").value;
        let sysContent = content;
        document.channels.forEach(el => {
            sysContent = sysContent.replace("#"+el.name, "<#"+el.id+">");
        });
        document.users.forEach(el => {
            const name = el.nickname || el.username;
            sysContent = sysContent.replace("@"+name, "<@"+el.id+">");
        });
        document.roles.forEach(el => {
            sysContent = sysContent.replace("@"+el.username, "<@&"+el.id+">");
        });
        formData.append("frequency", desc);
        formData.append("cron", cron.join(" "));
        formData.append("content", content);
        formData.append("sys_content", sysContent);
        formData.append("channel_id", channel_id);
        formData.append("guild_id", this.guild_id);
        
        
        var self = this;
        fetch("/ajax/add_schedule", {
            method: "POST",
			body: formData,
        }).then(response => {
            if (response.status != 200 && response.status != 403) {
                M.toast({html: "Error : This message could not be set"}, 5000);
                console.log("Error ", response.status, " : ", response.statusText);
            } else if (response.status == 403) {
                M.toast({html: "Reccuring messages are limited to 5 per server"}, 5000);
            } else response.text().then((responseText) => {
				let name;
				document.channels.forEach(element => {if(element.id == channel_id) name = element.name;});
                    document.querySelector("tbody").insertAdjacentHTML("afterbegin", `
                    <tr id="${responseText}" channel_id="${channel_id}">
                        <td>${desc}</td>
                        <td>#${name}</td>
                        <td class="message">
                            <div>
                                <p class="description">${content}</p>
                                <div class="options">
                                    <i class="material-icons waves-effect edit">edit</i>
                                    <span class="divider"></span>
                                    <i class="material-icons waves-effect delete">delete</i>
                                </div>
                            </div>
                        </td>
                    </tr>`);
                this.addEventListener();
				this.form.reset();
                M.toast({html: "This message has successfully been set"}, 5000);
            });
            this.addCronModal.close();
        });
	}
	
	onConfirmAddTimer() {
		if (!this.formTimer.checkValidity()) {
			M.toast({html: "You message has to be more thicc!"});
			return;
		}
		const formData = new FormData();
		const content = this.formTimer.elements.namedItem("contentTimer").value;
		const date_string = this.datePicker.toString().split(" ");
		const time_string = !this.timePickerTimer.time || this.timePickerTimer.time == "00:00" ? [new Date().getHours().toString(), String(new Date().getMinutes()+2)] : this.timePickerTimer.time.split(":");
        const date = new Date();
		date.setFullYear(date_string[6], this.months.indexOf(date_string[5]), date_string[3]);
		date.setHours(time_string[0], time_string[1]);
        const timestamp = Math.floor((date.getTime()/1000)/60);	//timestamp en minutes
        if (timestamp < Math.floor((Date.now()/1000)/60)) {
            M.toast({html: "We haven't found a way to send messages in past yet, we are waiting for Marty and Doc to come back !"});
            return;
        }
		const desc = `${this.datePicker.toString()} at ${time_string.join(":")}`;
        const channel_id = this.formTimer.elements.namedItem("channelSelectTimer").value;

        let sysContent = content;
        document.channels.forEach(el => {
            sysContent = sysContent.replace("#"+el.name, "<#"+el.id+">");
        });
        document.users.forEach(el => {
            const name = el.nickname || el.username;
            sysContent = sysContent.replace("@"+name, "<@"+el.id+">");
        });
        document.roles.forEach(el => {
            sysContent = sysContent.replace("@"+el.username, "<@&"+el.id+">");
        });
        formData.append("content", content);
        formData.append("sys_content", sysContent);
		formData.append("timestamp", timestamp);
		formData.append("description", desc);
		formData.append("channel_id", channel_id);
        formData.append("guild_id", this.guild_id);
        
        var self = this;
		fetch("/ajax/add_timer", {
			method: "POST",
			body: formData,
		}).then(response => {
			if (response.status != 200) {
                M.toast({html: "Error : This message could not be set"}, 5000);
                console.log("Error ", response.status, " : ", response.statusText);
            } else response.text().then((responseText) => {
				let name;
				document.channels.forEach(element => {if(element.id == channel_id) name = element.name;});
                document.querySelector("tbody").insertAdjacentHTML("afterbegin", `
                <tr id="${responseText}" channel_id="${channel_id}">
                    <td>${desc}</td>
                    <td>#${name}</td>
                    <td class="message">
                        <div>
                            <p class="description">${content}</p>
                            <div class="options">
                                <i class="material-icons waves-effect edit">edit</i>
                                <span class="divider"></span>
                                <i class="material-icons waves-effect delete">delete</i>
                            </div>
                        </div>
                    </td>
                </tr>`);
                this.addEventListener();
                //Suppression du message automatiquement si la date est dépassée.
                setTimeout(() => {document.getElementById(responseText).remove();}, timestamp*60*1000 - Date.now());
				this.formTimer.reset();
                M.toast({html: "This message has successfully been set"}, 5000);
			});
			this.addTimerModal.close();
        });
    }
    onRemoveEl(el) {
        if (el)
            this.idToRemove = el.getAttribute("id");
        this.optionsModal.close();
        this.removeCronModal.open();
    }
    onElClick(el) {
        if (window.innerWidth < 1000) {
            this.idToRemove = el.getAttribute("id"); 
            this.optionsModal.open();
        }
    }
    onOpenEdit(el) {
        if (el)
            this.idToRemove = el.getAttribute("id");
        document.querySelector("#contentEdit").textContent = document.getElementById(this.idToRemove).querySelector(".description").innerText;
        M.textareaAutoResize(document.querySelector("#contentEdit"));
        M.updateTextFields();
        this.optionsModal.close();
        this.editMessageModal.open();
    }
    onConfirmRemoveCron() {
        fetch(`/ajax/remove_message?id=${this.idToRemove}&guild_id=${this.guild_id}`).then((response) => {
            if (response.status != 200) {
                console.log("Error : ", response.status, " ", responseText);
                M.toast({html: "Error : This message could not be deleted"}, 5000);
            } else response.text().then((responseText) => {
                M.toast({html: responseText}, 5000);
                document.getElementById(this.idToRemove).remove();
                this.removeCronModal.close();
            });
        });
    }
    async onConfirmSetTimer() {
        const timezone = document.querySelector(".autocomplete").value;
        const offset = timezone.split("UTC")[1];
        const response = await fetch(`/ajax/set_timezone?guild_id=${this.guild_id}&utc_offset=${offset}&timezone=${timezone}`);
        if (response.status != 200) {
            console.log("Error : ", response.status, " ", response.statusText);
            M.toast({html: "Error : Impossible to set this timezone"}, 5000);
            return;
        }
        M.toast({html: "The timezone has been succesfully set !"}, 5000);
        document.querySelector(".guild-timezone h5").textContent = "Timezone : " + timezone;
        this.timezoneModal.close();
    }
    async onConfirmUpdateMessage() {
        const message = document.querySelector("#contentEdit").value;
        const formData = new FormData();

        let sysContent = message;
        document.channels.forEach(el => {
            sysContent = sysContent.replace("#"+el.name, "<#"+el.id+">");
        });
        document.users.forEach(el => {
            const name = el.nickname || el.username;
            sysContent = sysContent.replace("@"+name, "<@"+el.id+">");
        });
        document.roles.forEach(el => {
            sysContent = sysContent.replace("@"+el.username, "<@&"+el.id+">");
        });

        formData.append("content", message);
        formData.append("msg_id", this.idToRemove);
        formData.append("guild_id", this.guild_id);
        formData.append("sys_content", sysContent);
        const req = await fetch("/ajax/set_message", {
            body: formData,
            method: "POST"
        });
        if (req.status != 200) {
            console.log("Error : ", req.status, " ", req.statusText);
            M.toast({html: "Error : Impossible to set this message"}, 5000);
            return;
        }
        this.editMessageModal.close();
        M.toast({html: "Message updated !"});
        document.getElementById(this.idToRemove).querySelector(".description").textContent = message;
    }
}

window.addEventListener("DOMContentLoaded", e => new VueDashboard());