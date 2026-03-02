import { Server, Socket } from 'socket.io';
import { db } from '../config/firebase.js';

export const setupChatGateway = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join a specific chat session room
        socket.on('joinSession', (sessionId: string) => {
            socket.join(sessionId);
            console.log(`Socket ${socket.id} joined session ${sessionId}`);
        });

        // Handle sending message
        socket.on('sendMessage', async (data: { sessionId: string; senderId: string; content: string }) => {
            try {
                const { sessionId, senderId, content } = data;

                const messageData = {
                    sender_id: senderId,
                    content,
                    is_read: false,
                    is_admin_intervention: false,
                    timestamp: new Date()
                };

                // Save to Firestore
                await db.collection('chat_sessions')
                    .doc(sessionId)
                    .collection('messages')
                    .add(messageData);

                // Update session last_updated
                await db.collection('chat_sessions').doc(sessionId).update({
                    last_updated: new Date()
                });

                // Broadcast to everyone in the room (including sender to confirm receipt if desired, or use 'to')
                io.to(sessionId).emit('newMessage', messageData);

            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', 'Failed to send message');
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};
