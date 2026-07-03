import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
  roomId: string;
  nickname: string;
  text: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    roomId: {
      type: String,
      required: true,
      default: 'main',
      index: true,
    },
    nickname: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  }
);

// Compound index for fast ordered retrieval of room chat history
MessageSchema.index({ roomId: 1, createdAt: 1 });

export const Message = model<IMessage>('Message', MessageSchema);
