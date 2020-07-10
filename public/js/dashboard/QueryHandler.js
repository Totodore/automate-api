const rootUrl = window.location.protocol + "//" + window.location.hostname + ":" +window.location.port;
class QueryHandler {
    /**
     * @callback requestCallback
     * @param {Response} response 
     */
    /**
     * Send request to add a cron request 
     * @function addCron
     * @param {object} params
     * @param {string} params.frequency
     * @param {string} params.cron
     * @param {strign} params.content
     * @param {string} params.sys_content
     * @param {string} params.channel_id
     * @param {string} params.guild_id
     * @param {requestCallback} callback
     */
    static addCron(params, callback) {
        const formData = new FormData();
        for (const key of Object.keys(params))
            formData.append(key, params[key]);

        fetch("/ajax/add_schedule", {
            method: "POST",
            body: formData,
        }).then(callback);
    }

    /**
     * @function addTimer
     * @param {object} params 
     * @param {string} params.content
     * @param {string} params.sys_content
     * @param {string} params.timestamp
     * @param {string} params.description
     * @param {string} params.channel_id 
     * @param {string} params.guild_id
     * @param {requestCallback} callback 
     */
    static addTimer(params, callback) {
        const formData = new FormData();
        for (const key in params)
            formData.append(key, params[key]);

        fetch("/ajax/add_timer", {
            method: "POST",
            body: formData,
        }).then(callback);
    }

    /**
     * Update the timezone of the server
     * @function setTimezone
     * @param {object} params 
     * @param {string} params.guild_id
     * @param {string} params.utc_offset 
     * @param {string} params.timezone
     */
    static async setTimezone(params) {
        const urlSearchParams = new URLSearchParams();
        for (const key in params)
            urlSearchParams.append(key, params[key]);
        const url = new URL(`${rootUrl}/ajax/set_timezone`);
        url.search = urlSearchParams.toString();
        return await fetch(url);
    }

    /**
     * Update the desired content of a message
     * @function updateMsg
     * @param {object} params
     * @param {string} params.content
     * @param {string} params.sys_content
     * @param {string} params.msg_id
     * @param {string} params.guild_id
     */
    static async updateMsg(params) {
        const formData = new FormData();
        for (const key in params)
            formData.append(key, params[key]);
        return await fetch("/ajax/set_message", {
            body: formData,
            method: "POST"
        });
    }

    /**
     * Remove the desired message
     * @param {object} params 
     * @param {string} params.id message id to remove
     * @param {string} params.guild_id
     */
    static async removeMsg(params) {
        const urlSearchParams = new URLSearchParams();
        for (const key in params)
            urlSearchParams.append(key, params[key]);
        const url = new URL(`${rootUrl}/ajax/remove_message`);
        url.search = urlSearchParams.toString();
        return await fetch(url);
    }
}

export default QueryHandler;
