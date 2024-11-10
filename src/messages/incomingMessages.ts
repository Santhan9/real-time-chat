import * as z from "zod";


export enum SupportedMessages {
    JoinRoom = 'JOIN_ROOM',
    SendMessage = 'SEND_MESSAGE',
    UpvoteMessage = 'UPVOTE_MESSAGE'
}

export type IncomingMessage = {
    type: SupportedMessages.JoinRoom,
    payload: InitMessageType
} | {
    type: SupportedMessages.SendMessage,
    payload: UserMessageType
} | {
    type: SupportedMessages.UpvoteMessage,
    payload: UpvoteMessageType
}

const InitMessage = z.object({
    name: z.string(),
    userId: z.string(),
    roomId: z.string()
})

const UserMessage = z.object({
    userId: z.string(),
    roomId: z.string(),
    message: z.string()
})

const UpvoteMessage = z.object({
    userId: z.string(),
    roomId: z.string(),
    chatId: z.string()
})

export type InitMessageType = z.infer<typeof InitMessage>;
export type UserMessageType = z.infer<typeof UserMessage>;
export type UpvoteMessageType = z.infer<typeof UpvoteMessage>;