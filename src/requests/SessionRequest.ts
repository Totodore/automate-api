import { Request } from "express";

interface SessionRequest extends Request {
    session: {
        userId: string;
    },
    headerData: {
        username: string;
        avatar: string; //Link to the avatar image
    }
}

export default SessionRequest;