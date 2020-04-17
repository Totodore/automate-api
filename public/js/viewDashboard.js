class VueDashboard {
    constructor() {
        const i18n = {
            cancel: "Annuler",
            done: "Confirmer",
            months: [
                "Janvier",
                "Février",
                "Mars",
                "Avril",
                "Mai",
                "Juin",
                "Juillet",
                "Aout",
                "Septembre",
                "Octobre",
                "Novembre",
                "Décembre"
            ],
            monthsShort: [
                 "Jan",
                 "Fév",
                 "Mar",
                 "Avr",
                 "Mai",
                 "Juin",
                 "Juil",
                 "Aout",
                 "Sept",
                 "Oct",
                 "Nov",
                 "Déc"
            ],
            weekdays: [
                "Dimanche",
                "Lundi",
                "Mardi",
                "Mercredi",
                "Jeudi",
                "Vendredi",
                "Samedi",
                "Dimanche"
            ],
            weekdaysShort: [
                "Dim",
                "Lun",
                "Mar",
                "Mer",
                "Jeu",
                "Ven",
                "Sam",
                "Dim"
            ],
            weekdaysAbbrev: ["D", "L", "M", "M", "J", "V", "S", "D"]
        };
        this.addCronModal = M.Modal.init(document.querySelector("#add_cron"));
        this.removeCronModal = M.Modal.init(document.querySelector("#remove_modal"));
        this.addTimerModal = M.Modal.init(document.querySelector("#timer_add_modal"));
        this.form = document.forms.namedItem("addForm");
        this.timePickerWrapper = document.querySelector(".timeSelect-wrapper");
        this.daySelectWrapper = document.querySelector(".daySelect-wrapper");
        this.addCron_modalConfirm = document.querySelector("#add_cron .modal-confirm");
        this.removeCron_modalConfirm = document.querySelector("#remove_modal .modal-confirm");
        this.tableLines = document.querySelectorAll("tbody tr");
        this.eachSelect = this.form.elements.namedItem("each");
        this.guild_id = new URLSearchParams(location.search).get("id");
        this.timePicker = M.Timepicker.init(document.querySelectorAll(".timepicker"), {
            container: "body",
            twelveHour: false,
            onOpenEnd: () => {
                if (this.form.elements.namedItem("each").value == "heure" && this.addCronModal.isOpen)
                    timePicker.showView("minutes");
            },
            i18n: i18n
        });
    
        this.datePicker = M.Datepicker.init(document.querySelectorAll(".datepicker"), {
           container: "body",
           firstDay: 1,
           format: "dddd d mmmm yyyy",
           minDate: new Date(),
           setDefaultDate: true,
           yearRange: 1,
           defaultDate: new Date(),
           i18n: i18n
        });
        M.FormSelect.init(this.eachSelect);
        M.FormSelect.init(this.form.elements.namedItem("daySelect"));   
        M.FormSelect.init(document.querySelectorAll("select")); 
        this.updateEventListener();
    }

    updateEventListener() {
        document.querySelector(".schedule-add-btn").addEventListener("click", () => this.addCronModal.open());
        document.querySelector(".timer-add-btn").addEventListener("click", () => this.addTimerModal.open());
        this.eachSelect.addEventListener("change", () => this.onChangeEachSelect());
        this.addCron_modalConfirm.addEventListener("click", () => this.onConfirmAddCron());
        this.tableLines.forEach(el => el.addEventListener("click", () => this.onTableLineCLick(el)));
        this.removeCron_modalConfirm.addEventListener("click", () => this.onConfirmRemoveCron());
    }

    onChangeEachSelect() {
        if (this.eachSelect.value == "semaine") {
            this.timePickerWrapper.style.display = "block";
            this.daySelectWrapper.style.display = "block";
        } else if (this.eachSelect.value == "jour") {
            this.timePickerWrapper.style.display = "block";
            this.daySelectWrapper.style.display = "none";
        } else if (this.eachSelect.value == "heure") {
            this.timePickerWrapper.style.display = "block";
            this.daySelectWrapper.style.display = "none";
        } else if (this.eachSelect.value == "minute") {
            this.timePickerWrapper.style.display = "none";
            this.daySelectWrapper.style.display = "none";
        }
    }

    onConfirmAddCron() {
        const eachVal = this.value;
        let desc = "Chaque " + eachVal;
        let cron = ["*", "*", "*", "*", "*"];
        if (eachVal == "semaine") {
            const dayValues = daySelectWrapper.querySelectorAll(".selected");
            let selectedDays = {};
            //Pour chaque element selectionné (on a juste le nom)
            daySelectWrapper.querySelectorAll(".selected").forEach((el) => {
                //Pour chaque element proposé (nom + valeur)
                document.querySelectorAll("#daySelect option").forEach((inputEl) => {
                    if (el.textContent == inputEl.textContent)
                        selectedDays[inputEl.value] = inputEl.textContent;
                });
            });
            if (dayValues) {
                desc += " le " + Object.values(selectedDays).join(", ");
                cron[4] = Object.keys(selectedDays).join(",");
            }
            else {
                desc += " le Lundi";
                cron[4] = "1";
            }
            if (timePicker.time) {
                desc += " à " + timePicker.time.replace(":", "h");
                cron[0] = timePicker.time.substring(3,5);
                cron[1] = timePicker.time.substring(0, 2);
            }
            else {
                desc += " à 00h00";
                cron[0] = "00";
                cron[1] = "00"; 
            }
        } else if (eachVal == "jour") {
            if (timePicker.time) {
                desc += " à " + timePicker.time.replace(":", "h");
                cron[0] = timePicker.time.substring(3,5);
                cron[1] = timePicker.time.substring(0, 2);
            }
            else {
                desc += " à " + "00h00";
                cron[0] = "00";
                cron[1] = "00";
            }
        } else if (eachVal == "heure") {
            if (timePicker.time) {
                desc += " à la " + timePicker.time.substring(3,5) + "ème minute";
                cron[0] = timePicker.time.substring(3,5);
            }
            else {
                desc += " à la 1ère minute";
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
		
        fetch("/ajax/add_schedule", {
            method: "POST",
            body: formData
        }).then((response) => {
            if (response.status != 200) {
                M.toast({html: "Erreur lors de l'ajout du message"}, 5000);
                console.log("Error ", response.status, " : ", response.statusText);
            } else response.text().then((responseText) => {
				let name;
				document.channels.forEach(element => {if(element.id == channel_id) name = element.name;});
                document.querySelector("tbody").insertAdjacentHTML("afterbegin", `
                    <tr id="${responseText}" channel_id=${channel_id}>
                        <td>${desc}</td>
                        <td>${name}</td>
                        <td>${content}</td>
                    </tr>
				`);
				const self = this;
                document.querySelector("tbody tr").addEventListener("click", function() {
                    self.idToRemove = this.getAttribute("id");
                    removeModal.open();
                });
                M.toast({html: "Votre message à bien été ajouté"}, 5000);
            });
            this.addCronModal.close();
        });
    }
    onTableLineCLick(el) {   
        this.idToRemove = el.getAttribute("id");
        this.removeCronModal.open();
    }
    onConfirmRemoveCron() {
        fetch(`/ajax/remove_schedule?id=${this.idToRemove}&guild_id=${this.guild_id}`).then((response) => {
            if (response.status != 200) {
                console.log("Erreur : ", response.status, " ", responseText);
                M.toast({html: "Erreur lors de la suppression du message"}, 5000);
            } else response.text().then((responseText) => {
                M.toast({html: responseText}, 5000);
                document.getElementById(this.idToRemove).remove();
                this.removeCronModal.close();
            });
        });
    }
}

window.addEventListener("DOMContentLoaded", e => new VueDashboard());