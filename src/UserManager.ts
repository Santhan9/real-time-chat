import { connection } from "websocket";
import { Room, User } from "./store/ImMemoryStore";
import { OutGoingMessages } from "./messages/outgoingMessages";

export class UserManager {
    private rooms: Map<string, Room>;

    constructor() {
        this.rooms = new Map<string, Room>();
    }

    addUser(name: string, userId: string, roomId: string, socket: connection) {
        console.log(new Date()+' request for add User')

        if (!this.rooms.get(roomId)) {
            this.rooms.set(roomId, {
                users: [],
                roomId,
                chats: []
            })
        }

        this.rooms.get(roomId)?.users.push({
            id: userId,
            name,
            conn: socket

        })
        console.log(new Date()+' user added')

    }

    removeUser(roomId: string, userId: string) {
        const users = this.rooms.get(roomId)?.users;

        if (users) {
            users.filter(({ id }) => id !== userId)
        }

    }

    getUser(roomId: string, userId: string): User | null {
        const user = this.rooms.get(roomId)?.users.find(({ id }) => id === userId);
        return user ?? null;
    }

    broadcast(roomId: string, userId: string, message: OutGoingMessages) {
        const user = this.getUser(roomId, userId);
        if (!user) {
            console.error('User not found');
            return
        }
        const room = this.rooms.get(roomId);
        if (!room) {
            console.error('room not found');
            return
        }
        
        room.users.forEach(({ conn }) => {
            conn.sendUTF(message);
        })
    }
}