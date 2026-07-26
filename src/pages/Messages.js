import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  subscribeToConversations,
  getOrCreateConversation,
  sendMessage,
  subscribeToMessages,
  markMessagesRead,
} from "../../firebase/messages";
import { MessageSquare, Send, ArrowLeft, User, Loader2 } from "lucide-react";

const Messages = () => {
  const { currentUser, userProfile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToConversations(currentUser.uid, (convs) => {
      setConversations(convs);
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  useEffect(() => {
    if (!activeConvId) return;
    const unsub = subscribeToMessages(activeConvId, (msgs) => {
      setMessages(msgs);
      markMessagesRead(activeConvId);
    });
    return unsub;
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(activeConvId, currentUser.uid, newMessage.trim(), userProfile?.name || "User");
      setNewMessage("");
    } catch (error) {
      console.error("Send error:", error);
    }
    setSending(false);
  };

  const getOtherName = (conv) => {
    const otherId = conv.participants?.find(p => p !== currentUser.uid);
    return conv.participantNames?.[otherId] || "Unknown User";
  };

  const activeConv = conversations.find(c => c.id === activeConvId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Messages</h1>
        <p className="text-sm text-gray-500">Chat with the Lost & Found office</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden" style={{ height: "600px" }}>
        <div className="flex h-full">
          {/* Conversation List */}
          <div className={`${activeConvId ? "hidden md:block" : ""} w-full md:w-80 border-r border-gray-200 flex flex-col`}>
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-primary-500" />
                <h3 className="font-bold text-gray-900 text-sm">Conversations</h3>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-gray-400" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageSquare size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-500">No conversations yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start a chat from an item detail page</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      activeConvId === conv.id ? "bg-primary-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                        <User size={16} className="text-primary-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{getOtherName(conv)}</p>
                        <p className="text-xs text-gray-400 truncate">{conv.lastMessage || "No messages yet"}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${activeConvId ? "" : "hidden md:flex"} flex-1 flex flex-col`}>
            {activeConvId ? (
              <>
                {/* Chat Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                  <button onClick={() => setActiveConvId(null)} className="md:hidden text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                    <User size={14} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{activeConv && getOtherName(activeConv)}</p>
                    <p className="text-xs text-gray-400">Online</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === currentUser.uid ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        msg.senderId === currentUser.uid
                          ? "bg-primary-600 text-white rounded-br-md"
                          : "bg-gray-100 text-gray-900 rounded-bl-md"
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors"
                    >
                      {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center px-4">
                <div>
                  <MessageSquare size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 font-medium">Select a conversation</p>
                  <p className="text-sm text-gray-400 mt-1">or start a new one from an item page</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
