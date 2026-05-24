import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/layout/Layout";
import { Input } from "../../components/ui/Input";
import { getConversationsApi } from "../../api/chat";
import "./Chat.css";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "Just now";
}

export function ChatInbox() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConversationsApi()
      .then(r => { setConversations(r.data.data); setFiltered(r.data.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(conversations.filter(c =>
      c.otherParty.name.toLowerCase().includes(q) ||
      c.job.title.toLowerCase().includes(q) ||
      (c.lastMessage?.content || "").toLowerCase().includes(q)
    ));
  }, [search, conversations]);

  return (
    <Layout>
      <div className="inbox-page fade-up">
        <div className="inbox-header">
          <div>
            <h1 className="inbox-title">Messages</h1>
            <p className="inbox-sub">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="inbox-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
        </div>

        <div className="inbox-search">
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="inbox-loading">
            {[1,2,3].map(i => <div key={i} className="conv-skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="inbox-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p>No conversations yet</p>
            <span>Start a chat from a job post or a seeker's profile</span>
          </div>
        ) : (
          <div className="conv-list">
            {filtered.map(conv => {
              const ts = conv.lastMessage?.timestamp || conv.createdAt;
              return (
                <button
                  key={conv.conversationId}
                  className="conv-item"
                  onClick={() => navigate(`/chat/${conv.conversationId}`)}
                >
                  <div className="conv-avatar">
                    {conv.otherParty.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="conv-body">
                    <div className="conv-top">
                      <span className={`conv-name ${conv.unreadCount > 0 ? "unread" : ""}`}>
                        {conv.otherParty.name}
                      </span>
                      <div className="conv-meta">
                        {conv.unreadCount > 0 && (
                          <span className="conv-badge">{conv.unreadCount > 9 ? "9+" : conv.unreadCount}</span>
                        )}
                        <span className="conv-time">{timeAgo(ts)}</span>
                      </div>
                    </div>
                    <p className="conv-job">{conv.otherParty.companyName ? `${conv.otherParty.companyName} · ` : ""}{conv.otherParty.designation}</p>
                    <p className={`conv-preview ${conv.unreadCount > 0 ? "unread" : ""}`}>
                      {conv.lastMessage
                        ? `${conv.lastMessage.sentByMe ? "You: " : ""}${conv.lastMessage.content}`
                        : "Conversation started"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}