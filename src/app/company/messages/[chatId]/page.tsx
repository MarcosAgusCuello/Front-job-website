"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface Message {
    _id: string;
    sender: string;
    content: string;
    createdAt: string;
    isRead: boolean;
    isFromCompany: boolean;
}

interface Participant {
    _id: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    profileImage?: string;
}

interface Chat {
    _id: string;
    applicationId: string;
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    companyId: string;
    jobId: {
        _id: string;
        title: string;
    };
    messages: Message[];
    createdAt: string;
    updatedAt: string;
}

export default function ChatPage() {
    const params = useParams();
    // Extract and validate the chatId parameter
    const chatIdParam = params?.chatId;
    const chatId = typeof chatIdParam === 'string'
        ? chatIdParam
        : Array.isArray(chatIdParam)
            ? chatIdParam[0]
            : undefined;
    const router = useRouter();
    const { isAuthenticated, isCompany, token } = useAuth();
    const [chat, setChat] = useState<Chat | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Check authentication and redirect if needed
    useEffect(() => {
        if (!loading && (!isAuthenticated || !isCompany)) {
            router.push('/auth/login');
            return;
        }
    }, [isAuthenticated, isCompany, loading, router]);

    // Fetch chat data
    useEffect(() => {
        const fetchChatDetails = async () => {
            if (!isAuthenticated || !isCompany || !token) return;

            // Validate chatId before making the API call
            if (!chatId || chatId === 'undefined') {
                setError("Invalid chat ID. Please try again.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Try the company-specific endpoint first
                const response = await axios.get(
                    `http://localhost:5000/api/chats/${chatId}/company`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                setChat(response.data as Chat);

                // Mark messages as read
                await axios.put(
                    `http://localhost:5000/api/chats/${chatId}/read`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );

            } catch (err: any) {
                console.error('Error fetching chat details:', err);

            } finally {
                setLoading(false);
            }
        };

        // Only fetch if we have a valid chatId
        if (chatId && chatId !== 'undefined' && token && isAuthenticated) {
            fetchChatDetails();
        } else if (chatId === undefined || chatId === 'undefined') {
            setError('Invalid conversation ID');
            setLoading(false);
        }
    }, [chatId, isAuthenticated, isCompany, token]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat?.messages]);

    // Send message function
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate chatId before sending message
        if (!message.trim() || !chatId || chatId === 'undefined' || !token || sending) {
            console.error("Cannot send message: invalid inputs", {
                hasMessage: !!message.trim(),
                chatId,
                hasToken: !!token,
                sending
            });
            return;
        }

        setSending(true);

        try {
            // Use the company-specific messages endpoint
            const response = await axios.post<{ _id: string; content: string; createdAt: string }>(
                `http://localhost:5000/api/chats/${chatId}/messages`,
                { content: message },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state with new message
            setChat(prevChat => {
                if (!prevChat) return null;

                // Ensure all required Message fields are present and typed correctly
                const newMessage: Message = {
                    _id: response.data._id ?? Math.random().toString(36).substr(2, 9),
                    sender: chat?.companyId || '',
                    content: response.data.content ?? message,
                    createdAt: response.data.createdAt ?? new Date().toISOString(),
                    isRead: false,
                    isFromCompany: true
                };

                return {
                    ...prevChat,
                    messages: [...prevChat.messages, newMessage]
                };
            });

            setMessage('');
        } catch (err: any) {
            console.error('Error sending message:', err);
            console.error('Response data:', err.response?.data);

            if (err.response?.status === 403) {
                setError("You no longer have permission to send messages in this chat");
            } else {
                alert('Failed to send message. Please try again.');
            }
        } finally {
            setSending(false);
        }
    };

    // Format date
    const formatMessageDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }) + ' · ' + date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-10">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-white rounded-sm shadow-sm p-8">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="space-y-2">
                                <div className="h-10 bg-gray-200 rounded"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !chat) {
        return (
            <div className="min-h-screen bg-gray-50 py-10">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-white rounded-sm shadow-sm p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {error || 'Chat not found'}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {error?.includes("permission")
                                ? "You don't have access to this conversation. It may belong to another company."
                                : "We couldn't find the conversation you're looking for."}
                        </p>
                        <div className="space-x-4">
                            <button
                                onClick={() => router.push('/company/messages')}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                            >
                                View All Messages
                            </button>

                            <button
                                onClick={() => router.back()}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-sm shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center text-gray-700 hover:text-black mb-6"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back
                </button>

                <div className="bg-white rounded-sm shadow-sm overflow-hidden">
                    {/* Chat Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                {chat.userId?.firstName?.[0] || '?'}
                            </div>
                            <div className="ml-3">
                                <h2 className="text-lg font-semibold">
                                    {chat.userId
                                        ? `${chat.userId.firstName} ${chat.userId.lastName}`
                                        : 'Candidate'}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {chat.jobId?.title
                                        ? `Application for: ${chat.jobId.title}`
                                        : 'Job application'}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Conversation started {new Date(chat.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="p-6 h-96 overflow-y-auto bg-gray-50">
                        {chat.messages.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-gray-500">
                                    No messages yet. Start the conversation by sending a message below.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {chat.messages.map(msg => {
                                    const isCompanyMessage = isCompany && msg.sender === chat.companyId;

                                    return (
                                        <div
                                            key={msg._id}
                                            className={`flex ${isCompanyMessage ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${isCompanyMessage
                                                    ? 'bg-black text-white rounded-br-none'
                                                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                                    }`}
                                            >
                                                <p>{msg.content}</p>
                                                <p className={`text-xs mt-1 ${isCompanyMessage ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    {formatMessageDate(msg.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Message Input */}
                    <div className="px-6 py-4 border-t border-gray-200">
                        <form onSubmit={sendMessage} className="flex items-center">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-grow px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={!message.trim() || sending}
                                className="ml-2 px-4 py-2 bg-black text-white rounded-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                            >
                                {sending ? 'Sending...' : 'Send'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}