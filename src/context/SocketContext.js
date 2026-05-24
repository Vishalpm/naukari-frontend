import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user?.token) return;

    // Disconnect any existing socket first
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io(process.env.REACT_APP_BACKEND_URL, {
      auth: { token: user.token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setConnected(false);
    });

    socket.on("connect_error", (e) => {
      console.error("Socket connect error:", e.message);
    });

    socket.on("error", (e) => {
      console.error("Socket error from server:", e);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user?.token]);

  // Expose the raw socket + helpers
  const joinRoom = (conversationId) => {
    if (!socketRef.current?.connected) {
      console.warn("Socket not connected, cannot join room");
      return;
    }
    socketRef.current.emit("join_conversation", { conversationId });
  };

  const sendMessage = (conversationId, content) => {
    if (!socketRef.current?.connected) {
      console.warn("Socket not connected, cannot send message");
      return;
    }
    console.log("📤 Emitting send_message:", { conversationId, content });
    socketRef.current.emit("send_message", { conversationId, content });
  };

  const sendTyping = (conversationId) => {
    socketRef.current?.emit("typing", { conversationId });
  };

  const sendStopTyping = (conversationId) => {
    socketRef.current?.emit("stop_typing", { conversationId });
  };

  const getSocket = () => socketRef.current;

  return (
    <SocketContext.Provider value={{
      connected,
      getSocket,
      joinRoom,
      sendMessage,
      sendTyping,
      sendStopTyping,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);