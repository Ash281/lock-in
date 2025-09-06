export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface DBMessage extends Message {
  id: string;
  createdAt: string;
  conversationId: string;
}
