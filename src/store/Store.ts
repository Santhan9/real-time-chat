export type UserId = string;

export interface Chat{
    id: string;
    userId: UserId;
    name: string;
    message: string;
    upvotes: UserId[];
}

export abstract class Store{

    constructor() {

    }
    initRoom(roomId: string){

    }

    getChats(room: string, limit: number, offset: number ){

    }

    addChat(userId: UserId, message: string, name: string, room: string, limit: number, offset: number){

    }

    upvote(room: string, chatId: string, userId: UserId){

    }
}