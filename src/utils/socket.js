const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

let io;

const initSocket = (server) => {
    io = socketio(server);

    // Middleware to authenticate socket connections via JWT cookies
    io.use(async (socket, next) => {
        try {
            const cookieHeader = socket.handshake.headers.cookie;
            if (!cookieHeader) {
                return next(new Error('Authentication error: No cookies found'));
            }
            
            const cookies = {};
            cookieHeader.split(';').forEach(cookie => {
                const parts = cookie.split('=');
                if (parts.length >= 2) {
                    cookies[parts[0].trim()] = decodeURIComponent(parts.slice(1).join('=')).trim();
                }
            });
            
            const token = cookies.token;
            if (!token) {
                return next(new Error('Authentication error: Token not found'));
            }
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (!user || !user.isActive) {
                return next(new Error('Authentication error: User not found or inactive'));
            }
            
            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    const updateRoomPresence = async (roomName) => {
        try {
            if (!io) return;
            const sockets = await io.in(roomName).fetchSockets();
            let hasAdmin = false;
            let hasUser = false;

            for (const s of sockets) {
                if (s.user) {
                    if (s.user.role === 'admin') {
                        hasAdmin = true;
                    } else {
                        hasUser = true;
                    }
                }
            }

            const isActive = hasAdmin && hasUser;
            io.to(roomName).emit('presenceStatus', { active: isActive });
            console.log(`[Socket Presence] Room ${roomName}: Admin present? ${hasAdmin}, User present? ${hasUser}. Broadcast active: ${isActive}`);
        } catch (err) {
            console.error(`[Socket Presence Error] Failed to update presence for room ${roomName}:`, err);
        }
    };

    const isRoomActive = async (roomName) => {
        try {
            if (!io) return false;
            const sockets = await io.in(roomName).fetchSockets();
            let hasAdmin = false;
            let hasUser = false;
            for (const s of sockets) {
                if (s.user) {
                    if (s.user.role === 'admin') {
                        hasAdmin = true;
                    } else {
                        hasUser = true;
                    }
                }
            }
            return hasAdmin && hasUser;
        } catch (err) {
            console.error(`[Socket Error] Error in isRoomActive:`, err);
            return false;
        }
    };

    io.on('connection', (socket) => {
        console.log(`[Socket Connected] User: ${socket.user.name} (${socket.user.email}) - Socket ID: ${socket.id}`);

        // Handle joining room
        socket.on('joinRoom', async ({ targetUserId }) => {
            // Room is named after the target user's ID
            // Regular user can only join their own room, admin can join any room
            if (socket.user.role === 'admin' || socket.user._id.toString() === targetUserId) {
                socket.join(targetUserId);
                socket.currentRoom = targetUserId;
                console.log(`[Socket Room Join] User ${socket.user.name} joined room ${targetUserId}`);
                await updateRoomPresence(targetUserId);

                const active = await isRoomActive(targetUserId);
                if (active) {
                    const query = {
                        reciever: socket.user._id,
                        isRead: false
                    };
                    if (socket.user.role === 'admin') {
                        query.sender = targetUserId;
                    } else {
                        const adminUser = await User.findOne({ role: 'admin' });
                        if (adminUser) {
                            query.sender = adminUser._id;
                        }
                    }
                    await Message.updateMany(query, { isRead: true });
                    io.to(targetUserId).emit('messagesRead');
                    console.log(`[Socket Presence] Room ${targetUserId} active: Marked messages for ${socket.user.name} as read.`);
                }
            } else {
                console.warn(`[Socket Room Warning] Unauthorized join attempt by ${socket.user.name} to room ${targetUserId}`);
            }
        });

        // Handle sending message
        socket.on('sendMessage', async (data) => {
            try {
                const { targetUserId, message, messageIntent } = data;
                let finalReceiverId;
                let intent = messageIntent || '';

                if (socket.user.role === 'admin') {
                    // Admin must specify receiver
                    if (!targetUserId) {
                        return socket.emit('error', 'Target user ID is required for admin response');
                    }
                    finalReceiverId = targetUserId;
                } else {
                    // Regular user chats with admin
                    const adminUser = await User.findOne({ role: 'admin' });
                    if (!adminUser) {
                        return socket.emit('error', 'Admin user not found');
                    }
                    finalReceiverId = adminUser._id;
                }

                // Determine room to broadcast to
                // Room is always the regular user's ID
                const roomName = socket.user.role === 'admin' ? targetUserId : socket.user._id.toString();
                const readStatus = await isRoomActive(roomName);

                // Save message to database using exact schema keys: sender, reciever, messageIntent, message, isRead
                const newMessage = await Message.create({
                    sender: socket.user._id,
                    reciever: finalReceiverId,
                    messageIntent: intent,
                    message: message,
                    isRead: readStatus
                });

                io.to(roomName).emit('receiveMessage', {
                    _id: newMessage._id,
                    sender: newMessage.sender.toString(),
                    reciever: newMessage.reciever.toString(),
                    messageIntent: newMessage.messageIntent,
                    message: newMessage.message,
                    isRead: newMessage.isRead,
                    createdAt: newMessage.createdAt
                });

                console.log(`[Socket Message] Message saved and broadcasted: From ${socket.user.name} in room ${roomName} (Read: ${newMessage.isRead})`);
            } catch (err) {
                console.error('[Socket Error] Error in sendMessage:', err);
                socket.emit('error', 'Failed to send message');
            }
        });

        socket.on('disconnect', () => {
            console.log(`[Socket Disconnected] Socket ID: ${socket.id}`);
            if (socket.currentRoom) {
                const room = socket.currentRoom;
                setTimeout(() => {
                    updateRoomPresence(room);
                }, 100);
            }
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = {
    initSocket,
    getIo
};
