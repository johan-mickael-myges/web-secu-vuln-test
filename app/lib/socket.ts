"use client";

import { io } from "socket.io-client";

export const socket = io({
    path: '/api/socketio',
    addTrailingSlash: false,
}); 