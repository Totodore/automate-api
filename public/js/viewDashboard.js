class VueDashboard {
    constructor() {
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

		this.tableLines = document.querySelectorAll("tbody tr");
		this.guild_id = new URLSearchParams(location.search).get("id");

		let self = this;
        this.timePicker = M.Timepicker.init(document.querySelector("#timeSelect"), {
            container: "body",
            twelveHour: false,
            onOpenEnd: () => {
                if (self.form.elements.namedItem("each").value == "heure")
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
           format: "dddd d mmmm yyyy",
           minDate: new Date(),
           setDefaultDate: true,
           yearRange: 1,
           defaultDate: new Date(),
           i18n: this.i18n
        });
        M.FormSelect.init(document.querySelectorAll("select")); 
        this.addEventListener();
    }

    addEventListener() {
        document.querySelector(".schedule-add-btn").addEventListener("click", () => this.addCronModal.open());
        document.querySelector(".timer-add-btn").addEventListener("click", () => this.addTimerModal.open());
        this.eachSelect.addEventListener("change", () => this.onChangeEachSelect());
		this.addCron_modalConfirm.addEventListener("click", () => this.onConfirmAddCron());
		this.addTimer_modalConfirm.addEventListener("click", () => this.onConfirmAddTimer());
		
        this.tableLines.forEach(el => el.addEventListener("click", () => this.onTableLineCLick(el)));
        this.removeCron_modalConfirm.addEventListener("click", () => this.onConfirmRemoveCron());
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
            let selectedDays = {};
            //Pour chaque element selectionné (on a juste le nom)
        	this.daySelectWrapper.querySelectorAll(".selected").forEach((el) => {
                //Pour chaque element proposé (nom + valeur)
                document.querySelectorAll("#daySelect option").forEach((inputEl) => {
                    if (el.textContent == inputEl.textContent)
                        selectedDays[inputEl.value] = inputEl.textContent;
                });
            });
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
                if (this.timePicker.time == "01")
                    desc += " at the " +  this.timePicker.time.substring + "st minute";
                else if (this.timePicker.time == "02")
                    desc += " at the " +  this.timePicker.time.substring + "nd minute";
                else if (this.timePicker.time == "03")
                    desc += " at the " +  this.timePicker.time.substring + "rd minute";
                else
                    desc += " at the " +  this.timePicker.time.substring + "th minute";
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
        formData.append("frequency", desc);
        formData.append("cron", cron.join(" "));
        formData.append("content", content);
        formData.append("channel_id", channel_id);
        formData.append("guild_id", this.guild_id);
        
        var self = this;
        fetch("/ajax/add_schedule", {
            method: "POST",
			body: formData,
        }).then(response => {
            if (response.status != 200) {
                M.toast({html: "Error : This message could not be set"}, 5000);
                console.log("Error ", response.status, " : ", response.statusText);
            } else response.text().then((responseText) => {
				let name;
				document.channels.forEach(element => {if(element.id == channel_id) name = element.name;});
                document.querySelector("tbody").insertAdjacentHTML("afterbegin", '<tr id="'+responseText+'" channel_id="'+channel_id+'"><td>'+desc+'</td><td>#'+name+'</td><td>'+content+'<i class="material-icons">delete</i></td></tr>');
                document.getElementById(responseText).addEventListener("click", () => {
                    self.removeCronModal.open();
                    self.idToRemove = responseText;
                });
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
		date.setFullYear(date_string[3], this.i18n.months.indexOf(date_string[2]), date_string[1]);
		date.setHours(time_string[0], time_string[1]);
        const timestamp = Math.floor((date.getTime()/1000)/60);	//timestamp en minutes
        if (timestamp < Math.floor((Date.now()/1000)/60)) {
            M.toast({html: "We haven't found a way to send messages in past yet, we are waiting for Marty and Doc to come back !"});
            return;
        }
		const desc = `${this.datePicker.toString()} à ${time_string.join(":")}`;
        const channel_id = this.formTimer.elements.namedItem("channelSelectTimer").value;

		formData.append("content", content);
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
                document.querySelector("tbody").insertAdjacentHTML("afterbegin", '<tr id="'+responseText+'" channel_id="'+channel_id+'"><td>'+desc+'</td><td>#'+name+'</td><td>'+content+'<i class="material-icons">delete</i></td></tr>');
                document.getElementById(responseText).addEventListener("click", () => {
                    self.removeCronModal.open();
                    self.idToRemove = responseText;
                });
                //Suppression du message automatiquement si la date est dépassée.
                setTimeout(() => {document.getElementById(responseText).remove();}, timestamp*60*1000 - Date.now());
				this.formTimer.reset();
                M.toast({html: "This message has successfully been set"}, 5000);
			});
			this.addTimerModal.close();
		});
	}

    onTableLineCLick(el) {   
        this.idToRemove = el.getAttribute("id");
        this.removeCronModal.open();
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
}

window.addEventListener("DOMContentLoaded", e => new VueDashboard());