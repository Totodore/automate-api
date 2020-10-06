import { ConnectionOptions } from "tls";

import * as mysql from "mysql";

export default class BDDManager {
    
    private connection: mysql.Connection;
    
    constructor() {
        this.connection = mysql.createConnection({
            host: process.env.DB_HOST,
        });
    }
}