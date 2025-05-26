import React, {useEffect, useState, useCallback, useRef} from 'react';
import {useParams, useLocation} from 'react-router-dom';
import API_BASE_URL from '../config';
import {
    ChatContainer,
    Header,
    Avatar,
    ChatWrapper,
    Messages,
    Message,
    MessageTime,
    InputArea,
    Input,
    SendButton,
    CalendarButton,
} from '../styles/ChatPage.styles';
// Import Supabase client
import {createClient} from '@supabase/supabase-js';

// --- Supabase Initialization ---
// IMPORTANT: Using provided keys directly as requested.
// In a production app, these should ideally come from environment variables.
const supabaseUrl = "https://vbgqetdtomcesxyaijiw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiZ3FldGR0b21jZXN4eWFpaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODQzMzIsImV4cCI6MjA2MDc2MDMzMn0.H9WJXx9V3Gga8IhFhvuo2iBfBSiXC408EpMz4Hz_y2U";

const supabase = createClient(supabaseUrl, supabaseAnonKey);
// ---------------------------------


const ChatPage = () => {
    const {chatRoomId} = useParams();
    const location = useLocation();
    const token = localStorage.getItem('access_token');
    // Get the current user's ID for 'is_from_user' logic
    const currentUserId = localStorage.getItem('user_id');

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const [bookTitle, setBookTitle] = useState('');
    const [lastDetectedTime, setLastDetectedTime] = useState(null);

    const messagesEndRef = useRef(null); // Used for auto-scrolling to the bottom

    // Auto-scroll to bottom whenever messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [messages]);


    useEffect(() => {
        if (location.state?.sellerName && location.state?.bookTitle) {
            const defaultMessage = `היי ${location.state.sellerName}, אני מעוניין בספר שלך "${location.state.bookTitle}".\nמתי ניתן לתאם?`;
            setInput(defaultMessage);
            if (location.state.autoSend) {
                sendInitialMessage(defaultMessage);
            }
        }
    }, [location.state]);


    // Helper to format messages consistently from API or Realtime
    const formatMessage = (msgData, userId) => {
        return {
            id: msgData.id,
            message: msgData.message,
            created_at: msgData.created_at,
            is_read: msgData.is_read,
            is_from_user: msgData.sender_id === userId,
        };
    };

    const sendInitialMessage = async (message) => {
        if (!token || !chatRoomId || !message || !currentUserId) return;

        // Issue 1 Fix: Optimistic UI update.
        // We add a temporary message with a unique client-generated ID.
        // When the real message arrives via Realtime, we'll replace this one.
        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
            id: tempId,
            message: message,
            is_from_user: true,
            created_at: new Date().toISOString(),
            is_read: false,
            is_temp: true // Mark as temporary
        };
        setMessages(prev => [...prev, tempMessage]); // Add to the end for chronological display

        try {
            const res = await fetch(`${API_BASE_URL}/chats/${chatRoomId}/messages`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({message}),
            });

            if (!res.ok) {
                // If sending fails, remove the optimistic update
                setMessages(prev => prev.filter(msg => msg.id !== tempId));
                throw new Error('Failed to send initial message');
            }
            // No need to manually add message from response, Realtime will handle it.
            setInput('');
            detectTimeInText(message);
        } catch (err) {
            console.error('שגיאה בשליחת ההודעה הראשונה', err);
            alert('שגיאה בשליחת ההודעה הראשונה');
        }
    };

    // Main useEffect for data fetching and Realtime subscription
    useEffect(() => {
        if (!token || !currentUserId) {
            // Redirect to login or show error if not authenticated
            // console.warn("User not authenticated or user ID missing. Cannot fetch chat or subscribe to realtime.");
            return;
        }

        async function fetchInitialChatData() {
            try {
                // 1. Fetch historical messages
                const messagesRes = await fetch(`${API_BASE_URL}/chats/${chatRoomId}/messages`, {
                    headers: {Authorization: `Bearer ${token}`},
                });

                if (!messagesRes.ok) throw new Error('Failed to fetch messages');
                const messagesData = await messagesRes.json();

                // Issue 2 Fix: Backend returns messages in descending order (newest first).
                // Reverse them once to get oldest at top, newest at bottom.
                setMessages(messagesData.reverse());

                // 2. Fetch chat room details (other user, book title)
                const chatsRes = await fetch(`${API_BASE_URL}/chats`, {
                    headers: {Authorization: `Bearer ${token}`},
                });
                if (!chatsRes.ok) throw new Error('Failed to fetch chats');
                const chatsData = await chatsRes.json();
                const room = chatsData.find(r => r.id === chatRoomId);
                if (room) {
                    setOtherUser(room.other_user);
                    setBookTitle(room.listing?.book?.title || '');
                }
            } catch (err) {
                console.error("Error fetching initial chat data:", err);
                alert('שגיאה בטעינת נתוני הצ׳אט הראשוניים');
            }
        }

        fetchInitialChatData();

        // 3. Set up Supabase Realtime Subscription
        const chatChannel = supabase
            .channel(`chat_room_${chatRoomId}`) // Use a unique channel name per chat room
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `chat_room_id=eq.${chatRoomId}`
                },
                (payload) => {
                    const newRealtimeMessage = formatMessage(payload.new, currentUserId);
                    setMessages(prev => {
                        // Issue 1 Fix: Check if this Realtime message is a confirmation of an optimistic message.
                        // We look for a temporary message with the same content sent by the current user.
                        // Note: This relies on message content for matching, which is a common heuristic.
                        // A more robust solution might involve passing a client-generated temp_id to the backend.
                        if (newRealtimeMessage.is_from_user) {
                            const optimisticMessageIndex = prev.findIndex(
                                msg => msg.is_temp && msg.message === newRealtimeMessage.message
                            );

                            if (optimisticMessageIndex > -1) {
                                // Found an optimistic message, replace it with the real one
                                const updatedMessages = [...prev];
                                updatedMessages[optimisticMessageIndex] = newRealtimeMessage;
                                return updatedMessages;
                            }
                        }
                        // If not from current user, or no matching optimistic message, just add it.
                        return [...prev, newRealtimeMessage];
                    });

                    detectTimeInText(payload.new.message);
                }
            )
            .subscribe();

        // Cleanup function: Unsubscribe from the channel when the component unmounts
        return () => {
            console.log(`Unsubscribing from chat room ${chatRoomId}`);
            supabase.removeChannel(chatChannel);
        };

    }, [chatRoomId, token, currentUserId]);


    // פונקציה לזיהוי שעה בזמן אמת (existing functionality)
    const detectTimeInText = (text) => {
        const timeRegex = /(\d{1,2})(:\d{2})?/g;
        const match = [...text.matchAll(timeRegex)].find(m => {
            const hour = parseInt(m[1]);
            return hour >= 0 && hour <= 23;
        });

        if (match) {
            const hour = match[1];
            const minutes = match[2] ? match[2].slice(1) : '00';
            setLastDetectedTime(`${hour}:${minutes}`);
        } else {
            setLastDetectedTime(null);
        }
    };

    const handleSend = useCallback(async () => {
        if (!input.trim()) return;

        // Issue 1 Fix: Optimistic UI update.
        // Add a temporary message with a unique client-generated ID before API call.
        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
            id: tempId,
            message: input,
            is_from_user: true,
            created_at: new Date().toISOString(),
            is_read: false,
            is_temp: true // Mark as temporary
        };
        setMessages(prev => [...prev, tempMessage]);

        detectTimeInText(input);

        try {
            const res = await fetch(`${API_BASE_URL}/chats/${chatRoomId}/messages`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({message: input}),
            });

            if (!res.ok) {
                // If sending fails, remove the optimistic message
                setMessages(prev => prev.filter(msg => msg.id !== tempId));
                throw new Error('Failed to send message');
            }

            // Input will be cleared. The message will appear via the Realtime listener.
            setInput('');

        } catch (err) {
            console.error('שגיאה בשליחת הודעה', err);
            alert(`שגיאה בשליחת הודעה: ${err.message}`);
        }
    }, [input, chatRoomId, token]);


    const openGoogleCalendar = () => { // existing functionality
        if (!lastDetectedTime) return;

        const today = new Date();
        const [hourStr, minuteStr] = lastDetectedTime.split(':');
        const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hourStr), parseInt(minuteStr || '0'));
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

        const toISOStringNoSeconds = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

        const dates = `${toISOStringNoSeconds(startDate)}/${toISOStringNoSeconds(endDate)}`;

        const title = `פגישה עם ${otherUser?.full_name || 'המשתמש'}`;

        const url = new URL('https://calendar.google.com/calendar/render?action=TEMPLATE');
        url.searchParams.set('text', title);
        url.searchParams.set('dates', dates);
        url.searchParams.set('details', 'תיאום פגישה דרך אפליקציית הצ׳אט');
        url.searchParams.set('sf', 'true');
        url.searchParams.set('output', 'xml');

        window.open(url.toString(), '_blank');
    };

    const handleKeyPress = (e) => { // existing functionality
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Issue 2 Fix: messages state is now always in chronological order (oldest first).
    // No need for a final reverse here.
    const displayedMessages = messages;

    return (
        <ChatWrapper>

            <ChatContainer>
                <Header>
                    {otherUser && (
                        <>
                            <Avatar src={otherUser.avatar_url} alt="avatar"/>
                            <span>{otherUser.full_name}</span>
                            {bookTitle && <span> | {bookTitle}</span>}
                        </>
                    )}
                </Header>

                {/* Removed messagesContainerRef from here as it's only for auto-scroll logic */}
                {/* Issue 2 Fix: Display messages as they are, from top-to-bottom. */}
                <Messages>
                    {displayedMessages.map(msg => (
                        <Message key={msg.id} isMine={msg.is_from_user}>
                            <div>{msg.message}</div>
                            {msg.created_at && (
                                <MessageTime isMine={msg.is_from_user}>
                                    {new Date(msg.created_at).toLocaleString('he-IL', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                    })}
                                </MessageTime>
                            )}
                        </Message>
                    ))}
                    <div ref={messagesEndRef}/>
                    {/* This element is scrolled into view */}
                </Messages>

                <InputArea>
                    <Input
                        value={input}
                        onKeyPress={handleKeyPress}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="כתוב הודעה..."
                        rows={2}
                    />
                    {lastDetectedTime && (
                        <CalendarButton onClick={openGoogleCalendar}>הוסף ליומן</CalendarButton>
                    )}
                    <SendButton onClick={handleSend}>שלח</SendButton>
                </InputArea>
            </ChatContainer>
        </ChatWrapper>
    );
};

export default ChatPage;