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
    ReadIndicator,
    CalendarButton,
} from '../styles/ChatPage.styles';
import {createClient} from '@supabase/supabase-js';


const supabaseUrl = "https://vbgqetdtomcesxyaijiw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiZ3FldGR0b21jZXN4eWFpaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODQzMzIsImV4cCI6MjA2MDc2MDMzMn0.H9WJXx9V3Gga8IhFhvuo2iBfBSiXC408EpMz4Hz_y2U";

const supabase = createClient(supabaseUrl, supabaseAnonKey);


const ChatPage = () => {
    const {chatRoomId} = useParams();
    const location = useLocation();
    const token = localStorage.getItem('access_token');
    const currentUserId = localStorage.getItem('user_id');
    const [detectedDate, setDetectedDate] = useState(null);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const [bookTitle, setBookTitle] = useState('');
    const [lastDetectedTime, setLastDetectedTime] = useState(null);
    const [detectedForTomorrow, setDetectedForTomorrow] = useState(false);

    const messagesEndRef = useRef(null); // Used for auto-scrolling to the bottom

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [messages]);


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

               
                setMessages(messagesData.reverse());

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
                        if (newRealtimeMessage.is_from_user) {
                            const optimisticMessageIndex = prev.findIndex(
                                msg => msg.is_temp && msg.message === newRealtimeMessage.message
                            );

                            if (optimisticMessageIndex > -1) {
                                const updatedMessages = [...prev];
                                updatedMessages[optimisticMessageIndex] = newRealtimeMessage;
                                return updatedMessages;
                            }
                        }
                        return [...prev, newRealtimeMessage];
                    });

                    detectTimeInText(payload.new.message);
                }
            )
            .subscribe();

        return () => {
            console.log(`Unsubscribing from chat room ${chatRoomId}`);
            supabase.removeChannel(chatChannel);
        };

    }, [chatRoomId, token, currentUserId]);

const formatForGoogleCalendar = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    '00'
  );
};

const detectTimeInText = (text) => {
  const timeRegex = /(?:ב-)?(\d{1,2})(?::(\d{2}))?/; // שעה: ב-13:30
  const dateRegex = /(?:ב-)?(\d{1,2})[./](\d{1,2})/; // תאריך: 7.6 או 7/6
  const weekDayRegex = /(?:ביום |יום )?(ראשון|שני|שלישי|רביעי|חמישי|שישי|שבת)/;

  // שעה
  const timeMatch = text.match(timeRegex);
  if (timeMatch) {
    const hour = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2] || '0', 10);
    setLastDetectedTime(`${hour}:${String(minutes).padStart(2, '0')}`);
  } else {
    setLastDetectedTime(null);
  }

  // תאריך מדויק
  const dateMatch = text.match(dateRegex);
  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10);
    const year = new Date().getFullYear();
    const date = new Date(year, month - 1, day);
    setDetectedDate(date);
    setDetectedForTomorrow(false);
    return;
  }

  // מחר
  if (text.includes('מחר')) {
    setDetectedForTomorrow(true);
    setDetectedDate(null);
    return;
  }

  // יום בשבוע
  const dayNames = {
    ראשון: 0,
    שני: 1,
    שלישי: 2,
    רביעי: 3,
    חמישי: 4,
    שישי: 5,
    שבת: 6,
  };
  const weekDayMatch = text.match(weekDayRegex);
  if (weekDayMatch) {
    const targetDay = dayNames[weekDayMatch[1]];
    const today = new Date();
    const todayDay = today.getDay();
    let daysUntil = targetDay - todayDay;
    if (daysUntil <= 0) daysUntil += 7; // אם עבר כבר השבוע, קח את הבא
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + daysUntil);
    setDetectedDate(targetDate);
    setDetectedForTomorrow(false);
    return;
  }

  // ברירת מחדל: לא זוהה תאריך
  setDetectedDate(null);
  setDetectedForTomorrow(false);
};




    const handleSend = useCallback(async () => {
        if (!input.trim()) return;

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
                setMessages(prev => prev.filter(msg => msg.id !== tempId));
                throw new Error('Failed to send message');
            }

            setInput('');

        } catch (err) {
            console.error('שגיאה בשליחת הודעה', err);
            alert(`שגיאה בשליחת הודעה: ${err.message}`);
        }
    }, [input, chatRoomId, token]);


 const openGoogleCalendar = () => {
  const title = `פגישה עם ${otherUser?.full_name || 'המשתמש'}`;
  const url = new URL('https://calendar.google.com/calendar/render?action=TEMPLATE');
  url.searchParams.set('text', title);
  url.searchParams.set('details', 'תיאום פגישה דרך אפליקציית הצ׳אט');
  url.searchParams.set('sf', 'true');
  url.searchParams.set('output', 'xml');

  if (lastDetectedTime) {
    const baseDate = detectedDate
      ? new Date(detectedDate)
      : (() => {
          const today = new Date();
          if (detectedForTomorrow) {
            today.setDate(today.getDate() + 1);
          }
          return today;
        })();

    const [hourStr, minuteStr] = lastDetectedTime.split(':');
    const startDate = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      parseInt(hourStr),
      parseInt(minuteStr || '0')
    );

    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const toISOStringNoSeconds = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const dates = `${toISOStringNoSeconds(startDate)}/${toISOStringNoSeconds(endDate)}`;

    url.searchParams.set('dates', dates);
  }

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
                            {msg.is_from_user && (
                            <ReadIndicator isRead={msg.is_read}>
                                {msg.is_read ? '✔✔' : '✔'}
                            </ReadIndicator>
                            )}
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
                  
                    
<CalendarButton onClick={openGoogleCalendar}>הוסף ליומן</CalendarButton>

                    <SendButton onClick={handleSend}>שלח</SendButton>
                </InputArea>
            </ChatContainer>
        </ChatWrapper>
    );
};

export default ChatPage;