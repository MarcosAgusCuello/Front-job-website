"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface ChatPreview {
    _id: string;
    applicationId: string;
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    companyId: {
        _id: string;
        name: string;
        email: string;
        logo?: string;
    };
    jobId: {
        _id: string;
        title: string;
    };
    unreadCount: number;
    lastMessage?: {
        content: string;
        timestamp: string;
        isFromCompany: boolean;
    };
    createdAt: string;
    updatedAt: string;
}

export default function UserMessagesPage() {
    const router = useRouter();
    const { isAuthenticated, isCompany, token } = useAuth();

    const [chats, setChats] = useState<ChatPreview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check authentication and redirect if needed - for USER not company
    useEffect(() => {
        if (!loading && (!isAuthenticated || isCompany)) {
            router.push('/auth/login');
            return;
        }
    }, [isAuthenticated, isCompany, loading, router]);

    // Fetch chats for user
    useEffect(() => {
        const fetchChats = async () => {
            if (!isAuthenticated || isCompany || !token) return;

            setLoading(true);
            setError(null);

            try {
                // Use the user-specific endpoint
                const response = await axios.get<ChatPreview[]>(
                    `http://localhost:5000/api/chats/user`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                console.log('User chats response data:', response.data);

                // Validate the response data
                if (!Array.isArray(response.data)) {
                    console.error('Expected an array of chats, but got:', response.data);
                    setChats([]);
                    setError('Invalid data format received from server');
                } else {
                    // Filter out invalid chats
                    const validChats = response.data.filter(chat =>
                        chat && typeof chat === 'object' && chat._id
                    );

                    if (validChats.length !== response.data.length) {
                        console.warn(`Filtered out ${response.data.length - validChats.length} invalid chat objects`);
                    }

                    setChats(validChats);
                }
            } catch (err: any) {
                console.error('Error fetching chats:', err);
                setError(err.response?.data?.message || 'Failed to load conversations');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchChats();
        }
    }, [isAuthenticated, isCompany, token]);

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) {
            // Today, show time
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (diffInDays === 1) {
            // Yesterday
            return 'Yesterday';
        } else if (diffInDays < 7) {
            // This week, show day name
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            // Older, show date
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-10">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h1 className="text-2xl font-bold mb-6">Messages</h1>
                    <div className="bg-white rounded-sm shadow-sm">
                        <div className="animate-pulse p-6 space-y-4">
                            <div className="h-16 bg-gray-200 rounded"></div>
                            <div className="h-16 bg-gray-200 rounded"></div>
                            <div className="h-16 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-2xl font-bold mb-6">Messages</h1>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-sm mb-6">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-sm shadow-sm overflow-hidden">
                    {chats.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500 mb-4">You don't have any conversations yet.</p>
                            <Link
                                href="/user/applications"
                                className="inline-block px-4 py-2 bg-black text-white rounded-sm hover:bg-gray-800"
                            >
                                View My Applications
                            </Link>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {chats.map(chat => {
                                // Skip invalid chats
                                if (!chat || !chat._id) {
                                    return null;
                                }

                                return (
                                    <li key={chat._id}>
                                        <Link
                                            href={`/user/messages/${chat._id}`}
                                            className={`block hover:bg-gray-50 transition-colors ${chat.unreadCount > 0 ? 'bg-gray-50' : ''
                                                }`}
                                        >
                                            <div className="px-6 py-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                                            {chat.companyId?.name?.[0] || '?'}
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className={`text-sm font-medium ${chat.unreadCount > 0 ? 'text-black' : 'text-gray-900'
                                                                }`}>
                                                                {chat.companyId?.name || 'Company'}
                                                            </p>
                                                            {chat.jobId?.title ? (
                                                                <p className="text-xs text-gray-500">
                                                                    Application for: {chat.jobId.title}
                                                                </p>
                                                            ) : (
                                                                <p className="text-xs text-gray-500">
                                                                    Job application
                                                                </p>
                                                            )}
                                                            {chat.lastMessage ? (
                                                                <p className={`text-sm mt-1 truncate max-w-xs ${chat.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'
                                                                    }`}>
                                                                    {chat.lastMessage.isFromCompany ? 'Company: ' : 'You: '}
                                                                    {chat.lastMessage.content}
                                                                </p>
                                                            ) : (
                                                                <p className="text-sm mt-1 text-gray-400 italic">
                                                                    No messages yet
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xs text-gray-500">
                                                            {chat.lastMessage
                                                                ? formatDate(chat.lastMessage.timestamp)
                                                                : formatDate(chat.updatedAt)}
                                                        </span>
                                                        {chat.unreadCount > 0 && (
                                                            <span className="mt-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                                {chat.unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}