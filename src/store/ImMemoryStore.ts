import { connection } from "websocket";
import { Chat, Store, UserId } from "./Store";
import { OutGoingMessages } from "../messages/outgoingMessages";

export interface User{
    id: string;
    name: string
    conn: connection
}

export interface Room {
    roomId: string,
    chats: Chat[];
    users: User[];
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
            chats: [],
            users: []
        })
    }

    getChats(roomId: string, limit: number, offset: number) {
        const room = this.store.get(roomId);
        if (!room) {
            return [];
        }
        return room.chats.reverse().slice(0, offset).slice(-1 * limit);
    }

    addChat(userId: UserId, message: string, name: string, roomId: string) {

        const room = this.store.get(roomId);

        if (!room) {
            console.log('no room found')
            return '';
        }

        const chat = {
            id : (this.gobalChatId++).toString(),
            userId,
            name,
            message,
            upvotes: []
        }

        room.chats.push(chat);
        return chat;


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
       return chat;

    }

    addUser(name: string, userId: string, roomId: string, socket: connection) {
        console.log(new Date()+' request for add User')

        if (!this.store.get(roomId)) {
            this.store.set(roomId, {
                users: [],
                roomId,
                chats: []
            })
        }

        this.store.get(roomId)?.users.push({
            id: userId,
            name,
            conn: socket

        })
        console.log(new Date()+' user added '+this.store.get(roomId)?.users.length)

    }

    removeUser(roomId: string, userId: string) {
        const users = this.store.get(roomId)?.users;

        if (users) {
            users.filter(({ id }) => id !== userId)
        }

    }

    getUser(roomId: string, userId: string): User | null {
        const user = this.store.get(roomId)?.users.find(({ id }) => id === userId);
        if(!user){
            console.log('user is empty '+this.store.get(roomId)?.users[0].id+' '+userId)
            return null
        }
        return user;
    }

    broadcast(roomId: string, userId: string, message: OutGoingMessages) {
        console.log('message broadcasting '+message.payload)
        const user = this.getUser(roomId, userId);
        if (!user) {
            console.error('User not found');
            return
        }
        const room = this.store.get(roomId);
        if (!room) {
            console.error('room not found');
            return
        }
        
        room.users.forEach(({ conn }) => {
            console.log('sending message '+JSON.stringify(message))
            conn.send(JSON.stringify(message));
        })
    }

    
}