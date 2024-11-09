import { Chat, Store, UserId } from "./Store";


export interface Room {
    roomId: string,
    chats: Chat[];
}

export class ImMemoryStore implements Store {

    private store: Map<string, Room>
    gobalChatId = 0;

    constructor() {
        this.store = new Map<string, Room>();

    }
    initRoom(roomId: string) {
        this.store.set(roomId, {
            roomId,
            chats: []
        })
    }

    getChats(roomId: string, limit: number, offset: number) {
        const room = this.store.get(roomId);
        if (!room) {
            return [];
        }
        return room.chats.reverse().slice(0, offset).slice(-1 * limit);
    }

    addChat(userId: UserId, message: string, name: string, roomId: string, limit: number, offset: number) {

        const room = this.store.get(roomId);

        if (!room) {
            return '';
        }

        return room.chats.push({
            id : (this.gobalChatId++).toString(),
            userId,
            name,
            message,
            upvotes: []
        })


    }

    upvote(roomId: string, chatId: string, userId: UserId) {

       const room =  this.store.get(roomId);
       if(!room){
        return 
       }

       const chat = room.chats.find(({id}) => {
        return id === chatId
       })

       if(chat){
        chat.upvotes.push(userId);
       }

    }
}