export enum SupportedOutGoingMessages {
    AddChat = 'ADD_CHAT',
    UpdateChat = 'UPDATE_CHAT',
}

type MessagePayload = {
    roomId: string,
    message: string,
    name: string,
    upvotes: number,
    chatId ?: string
}

export type OutGoingMessages = {
    type: SupportedOutGoingMessages.AddChat,
    payload: MessagePayload
} | {
    type: SupportedOutGoingMessages.UpdateChat,
    payload: Partial<MessagePayload>
}