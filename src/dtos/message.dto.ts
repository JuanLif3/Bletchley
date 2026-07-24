// * Request DTOs
import * as net from "node:net";

export interface SendMessageDto {
    chatId: string;
    content: string;
}

export interface GetMessagesDto{
    chatId: string;
    limit?: number;
    offset?: number;
}

// * Response DTOs
export interface MessageResponseDto {
    id: string;
    chatId: string;
    senderId: string;
    senderUsername: string;
    content: string;
    createdAt: Date;
}

export interface SendMessageResponseDTO {
    id: string;
    chatId: string;
    senderId: string;
    content: string;
    createdAt: Date;
    message: string;
}