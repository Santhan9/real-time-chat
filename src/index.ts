import { connection, server as WebSocketServer } from "websocket";
import * as http from "http";
import { IncomingMessage, InitMessageType, SupportedMessages, UpvoteMessageType, UserMessageType } from "./messages/incomingMessages";
import { UserManager } from "./UserManager";
import { Store } from "./store/Store";
import { ImMemoryStore } from "./store/ImMemoryStore";
import { OutGoingMessages, SupportedOutGoingMessages } from "./messages/outgoingMessages";

const server = http.createServer((request, response) => {
    console.log(new Date() + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(8080, function() {
    console.log(new Date() + ' Server is listening on port 8080');
});

const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

const userManager = new UserManager();
const store = new ImMemoryStore();

function originIsAllowed(origin: any) {
    return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
        request.reject();
        console.log(new Date() + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    const connection = request.accept('echo-protocol', request.origin);
    console.log(new Date() + ' Connection accepted.');

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            try {
                handleMessage(connection, JSON.parse(message.utf8Data));
            } catch (e) {
                console.error("Error handling message:", e);
            }
        }
    });

    connection.on('close', function(reasonCode, description) {
        console.log(new Date() + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

function handleMessage(ws: connection, message: IncomingMessage) {
    console.log('handle message');

    if (message.type == SupportedMessages.JoinRoom) {
        const payload = message.payload;
        userManager.addUser(payload.name, payload.userId, payload.roomId, ws);
    }

    if (message.type === SupportedMessages.SendMessage) {
        const payload = message.payload;
        const user = userManager.getUser(payload.roomId, payload.userId);
        if (!user) {
            console.error('user not found');
            return;
        }
       const chat = store.addChat(payload.userId, payload.message, user.name, payload.roomId);
        if(!chat){
            return;
        }
        const outGoingMessage: OutGoingMessages = {
            type: SupportedOutGoingMessages.AddChat,
            payload: {
                chatId: chat.id,
                roomId: payload.roomId,
                message: payload.message,
                name: user.name,
                upvotes: 0
            }
        }
        userManager.broadcast(payload.roomId, payload.userId, outGoingMessage)
    }

    if (message.type === SupportedMessages.UpvoteMessage) {
        const payload = message.payload;
        const user = userManager.getUser(payload.roomId, payload.userId);
        if (!user) {
            console.error('user not found');
            return;
        }
        const chat = store.upvote(payload.roomId, payload.chatId, payload.userId);

        if(!chat){
            return
        }

        const outGoingMessage: OutGoingMessages = {
            type: SupportedOutGoingMessages.UpdateChat,
            payload: {
                roomId: payload.roomId,
                name: user.name,
                upvotes: chat.upvotes.length
            }
        }

        userManager.broadcast(payload.roomId, payload.userId, outGoingMessage)
    }
}
