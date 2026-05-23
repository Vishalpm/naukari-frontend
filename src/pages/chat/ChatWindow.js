import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { getMessagesApi, getConversationsApi } from "../../api/chat";
import "./Chat.css";

const fmt     = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fmtDate = (d) => new Date(d).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

export function ChatWindow() {
  const { conversationId } = useParams();
  const { user }           = useAuth();
  const { connected, getSocket, joinRoom, sendMessage, sendTyping, sendStopTyping } = useSocket();
  const navigate           = useNavigate();

  const [messages, setMessages] = useState([]);
  const [conv, setConv]         = useState(null);
  const [text, setText]         = useState("");
  const [loading, setLoading]   = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [joined, setJoined]     = useState(false);

  const bottomRef    = useRef(null);
  const typingTimer  = useRef(null);
  const messagesRef  = useRef(messages); // keep ref in sync for closure access
  messagesRef.current = messages;

  // ── Load REST data once ──────────────────────────────────
  useEffect(() => {
    if (!conversationId) return;
    Promise.all([
      getMessagesApi(conversationId),
      getConversationsApi(),
    ]).then(([msgRes, convRes]) => {
      setMessages(msgRes.data.data.messages || []);
      const found = convRes.data.data.find(c => c.conversationId === conversationId);
      setConv(found || null);
    }).catch(err => {
      console.error("Failed to load chat:", err);
    }).finally(() => setLoading(false));
  }, [conversationId]);

  // ── Join room + attach listeners when socket connects ────
  useEffect(() => {
    if (!connected || !conversationId) return;

    const socket = getSocket();
    if (!socket) return;

    console.log("🚪 Joining room:", conversationId);
    joinRoom(conversationId);

    // ── new_message ──────────────────────────────────────
    const handleNewMessage = (msg) => {
      console.log("📨 new_message received:", msg);
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    // ── join confirmation ────────────────────────────────
    const handleJoined = (data) => {
      console.log("✅ Joined room:", data);
      setJoined(true);
    };

    // ── typing ───────────────────────────────────────────
    const handleTyping = (data) => {
      if (data.userId !== user?.id) {
        setIsTyping(true);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setIsTyping(false), 3000);
      }
    };

    const handleStopTyping = () => {
      setIsTyping(false);
      clearTimeout(typingTimer.current);
    };

    // ── server errors ────────────────────────────────────
    const handleError = (err) => {
      console.error("Socket server error:", err);
    };

    socket.on("new_message",       handleNewMessage);
    socket.on("joined",            handleJoined);
    socket.on("user_typing",       handleTyping);
    socket.on("user_stop_typing",  handleStopTyping);
    socket.on("error",             handleError);

    // Cleanup listeners when leaving or socket changes
    return () => {
      socket.off("new_message",      handleNewMessage);
      socket.off("joined",           handleJoined);
      socket.off("user_typing",      handleTyping);
      socket.off("user_stop_typing", handleStopTyping);
      socket.off("error",            handleError);
      setJoined(false);
    };
  }, [connected, conversationId, user?.id]);

  // ── Auto scroll ──────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Send message ─────────────────────────────────────────
  const handleSend = () => {
    if (!text.trim()) return;
    if (!connected) {
      alert("Not connected to chat server. Please refresh.");
      return;
    }
    console.log("📤 Sending message:", text.trim());
    sendMessage(conversationId, text.trim());
    setText("");
  };

  // ── Typing indicator ─────────────────────────────────────
  const handleTextChange = (e) => {
    setText(e.target.value);
    sendTyping(conversationId);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => sendStopTyping(conversationId), 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Loading state ────────────────────────────────────────
  if (loading) return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
        <div className="spinner" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="chat-page fade-up">

        {/* Header */}
        <div className="chat-header">
          <button className="chat-back" onClick={() => navigate("/chat")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div className="chat-avatar">
            {conv?.otherParty?.name?.charAt(0).toUpperCase() || "?"}
          </div>

          <div className="chat-header-info">
            <p className="chat-other-name">{conv?.otherParty?.name || "Chat"}</p>
            <p className="chat-job-label">
              {conv?.job?.title}
              {conv?.otherParty?.companyName ? ` · ${conv.otherParty.companyName}` : ""}
            </p>
          </div>

          {/* Connection indicator */}
          <div className="chat-conn-dot" title={connected ? "Connected" : "Connecting..."}>
            <span className={connected ? "dot-green" : "dot-amber"} />
            <span>{connected ? (joined ? "Connected" : "Joining...") : "Connecting..."}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 && (
            <p className="chat-empty">No messages yet. Say hello! 👋</p>
          )}

          {messages.map((msg, i) => {
            console.log("*****", msg);
            console.log("88888user", user)
            const mine     = msg.sender?.id === user?.id;
            const showDate = i === 0 ||
              fmtDate(msg.createdAt) !== fmtDate(messages[i - 1].createdAt);

            return (
              <React.Fragment key={msg.id}>
                {showDate && (
                  <div className="chat-date-divider">
                    <span>{fmtDate(msg.createdAt)}</span>
                  </div>
                )}
                <div className={`msg-row ${mine ? "mine" : "theirs"} slide-in`}>
                  <div className={`msg-bubble ${mine ? "bubble-mine" : "bubble-theirs"}`}>
                    {msg.content}
                  </div>
                  <span className="msg-time">
                    {fmt(msg.createdAt)}
                    {mine && (
                      <span style={{ marginLeft: 4 }}>
                        {msg.isRead ? "· Read" : "· Sent"}
                      </span>
                    )}
                  </span>
                </div>
              </React.Fragment>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="msg-row theirs slide-in">
              <div className="bubble-theirs typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="chat-input-bar">
          {!connected && (
            <div className="chat-offline-bar">
              Reconnecting to chat...
            </div>
          )}
          <textarea
            className="chat-textarea"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={connected ? "Type a message… (Enter to send)" : "Connecting..."}
            rows={1}
            disabled={!connected}
          />
          <button
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!text.trim() || !connected}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

      </div>
    </Layout>
  );
}