import { MessagePrimitives } from "./message";

export interface ChatView {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  messages: MessagePrimitives[];
  user: { id: string; firstName: string; familyName: string; imageUrl: string };
  band: { id: string; name: string; imageUrl: string };
  unreadMessagesCount: number;
}
