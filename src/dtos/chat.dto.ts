// * Request DTOs
export interface CreateChatDto {
    participantId: string;  // ! ID del otro usuario (chat 1 a 1)
}

export interface GetChatsResponseDto {
    id: string;
    name: string | null;
    isGroup: boolean;
    lastMessageAt: Date;
    otherParticipant?: {
        id: string;
        username: string;
    };
    lastMessage?: {
        content: string;
        createdAt: Date;
    };
}

export interface ChatDetailResponseDto {
    id: string;
    name: string | null;
    isGroup: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    participants: {
        id: string;
        userId: string;
        username: string;
        joinedAt: Date;
    }[];
    messages: {
        id: string;
        senderId: string;
        senderUsername: string;
        content: string;
        createdAt: Date;
    }[];
}

export interface DeleteChatResponseDto {
    success: boolean;
    message: string;
}