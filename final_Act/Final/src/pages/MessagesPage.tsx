import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Divider,
  Stack,
  alpha,
  Button,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  // Hidden,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  Storefront as StoreIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { motion, AnimatePresence } from 'framer-motion';

// --- Interface Definitions (Preserved) ---
interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: string[];
}

interface Conversation {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number; // ADDED: Unread count for messages
  isSeller: boolean;
}
// ----------------------------------------

// Dummy data for demonstration
const dummyConversations: Conversation[] = [
    {
        id: 1,
        userId: 101,
        userName: 'Alex Johnson (Seller)',
        userAvatar: 'https://i.pravatar.cc/150?img=1',
        lastMessage: 'Sure, I can arrange that for you. When would be a good time to ship?',
        lastMessageTime: '10:30 AM',
        unreadCount: 3, // New messages
        isSeller: true,
    },
    {
        id: 2,
        userId: 102,
        userName: 'Maria Garcia',
        userAvatar: 'https://i.pravatar.cc/150?img=4',
        lastMessage: 'Thanks! I received the product today. Everything looks great.',
        lastMessageTime: 'Yesterday',
        unreadCount: 0,
        isSeller: false,
    },
    {
        id: 3,
        userId: 103,
        userName: 'Tech Support',
        userAvatar: '',
        lastMessage: 'Your issue has been resolved. Please check your settings.',
        lastMessageTime: 'Mon',
        unreadCount: 1, // New message
        isSeller: false,
    },
];

const dummyMessages: Message[] = [
    { id: 1, senderId: 101, receiverId: 1, senderName: 'Alex Johnson (Seller)', content: 'Hello! Thanks for your inquiry about the limited edition watch. It is still available.', timestamp: '10:00 AM', read: true },
    { id: 2, senderId: 1, receiverId: 101, senderName: 'Me', content: 'That is great! What is the final price including shipping?', timestamp: '10:05 AM', read: true },
    { id: 3, senderId: 101, receiverId: 1, senderName: 'Alex Johnson (Seller)', content: 'The final price is $450, shipping included. I can also offer express shipping for an extra $20.', timestamp: '10:15 AM', read: false },
    { id: 4, senderId: 101, receiverId: 1, senderName: 'Alex Johnson (Seller)', content: 'Sure, I can arrange that for you. When would be a good time to ship?', timestamp: '10:30 AM', read: false },
];

const MessageBubble: React.FC<{ message: Message, isMe: boolean, theme: any }> = ({ message, isMe, theme }) => {
    // Determine background color and text alignment
    const bubbleBg = isMe 
        ? 'linear-gradient(135deg, #7877C6 0%, #4ECDC4 100%)' // Sender (Me)
        : alpha(theme.palette.common.white, 0.08); // Receiver (Them)
    
    const bubbleColor = isMe ? 'white' : theme.palette.common.white;
    const alignSelf = isMe ? 'flex-end' : 'flex-start';
    const borderRadius = isMe ? '16px 16px 0 16px' : '16px 16px 16px 0';
    
    return (
        <motion.div
            initial={{ opacity: 0, y: isMe ? 5 : -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{ 
                maxWidth: '70%', 
                alignSelf: alignSelf, 
                marginBottom: theme.spacing(1.5),
            }}
        >
            <Box 
                sx={{
                    background: bubbleBg,
                    color: bubbleColor,
                    p: 1.5,
                    borderRadius: borderRadius,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
            >
                <Typography variant="body2" sx={{ wordWrap: 'break-word' }}>
                    {message.content}
                </Typography>
                <Typography 
                    variant="caption" 
                    sx={{ 
                        display: 'block', 
                        mt: 0.5, 
                        textAlign: 'right', 
                        color: isMe ? alpha(theme.palette.common.white, 0.8) : alpha(theme.palette.common.white, 0.6) 
                    }}
                >
                    {message.timestamp}
                </Typography>
            </Box>
        </motion.div>
    );
};


const MessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>(dummyConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(dummyConversations[0]);
  const [messages, setMessages] = useState<Message[]>(dummyMessages);
  const [newMessage, setNewMessage] = useState('');
  
  const navigate = useNavigate();
  const { user } = useUserStore(); // Assume user object has 'id'
  const currentUserId = user?.id || 1; // Default to 1 for dummy data sender
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State to manage mobile view (true for conversation list, false for message thread)
  const [isListVisible, setIsListVisible] = useState(true);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConversation]);

  // Handle Conversation Selection
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Simulate fetching messages for the new conversation (resetting dummy data)
    setMessages(conversation.id === 1 ? dummyMessages : [
        { id: 5, senderId: conversation.userId, receiverId: 1, senderName: conversation.userName, content: 'Hey, is this still available?', timestamp: '2:00 PM', read: true },
        { id: 6, senderId: 1, receiverId: conversation.userId, senderName: 'Me', content: 'Yes it is! How can I help you?', timestamp: '2:05 PM', read: true },
    ]);
    
    // On mobile, hide the list and show the chat thread
    if (isMobile) {
        setIsListVisible(false);
    }
    
    // Simulate marking as read
    setConversations(convs => convs.map(c => 
        c.id === conversation.id ? { ...c, unreadCount: 0 } : c
    ));
  };
  
  // Handle sending a new message
  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const newMsg: Message = {
        id: Date.now(),
        senderId: currentUserId,
        receiverId: selectedConversation.userId,
        senderName: 'Me',
        content: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true,
      };
      
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage('');
      
      // Simulate updating last message in conversation list
      setConversations(convs => convs.map(c => 
        c.id === selectedConversation.id ? { ...c, lastMessage: newMsg.content, lastMessageTime: newMsg.timestamp } : c
      ));
    }
  };
  
  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Render the conversation list item (PROFESSIONALLY DESIGNED)
  const renderConversationItem = (conversation: Conversation) => (
    <ListItem
      key={conversation.id}
      button
      onClick={() => handleSelectConversation(conversation)}
      sx={{
        py: 1.5,
        px: 2,
        borderRadius: 2,
        mb: 1,
        // Active/Unread Styling
        backgroundColor: selectedConversation?.id === conversation.id 
          ? alpha(theme.palette.primary.main, 0.15) 
          : conversation.unreadCount > 0 
            ? alpha(theme.palette.common.white, 0.05) 
            : 'transparent',
        border: selectedConversation?.id === conversation.id ? '1px solid #7877C6' : '1px solid transparent',
        transition: 'all 0.3s ease-out',
        '&:hover': {
          backgroundColor: alpha(theme.palette.common.white, 0.1),
        },
        cursor: 'pointer',
      }}
    >
      <ListItemAvatar>
        <Badge
            color="secondary"
            variant="dot"
            invisible={conversation.unreadCount === 0}
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Avatar 
            alt={conversation.userName} 
            src={conversation.userAvatar} 
            sx={{ bgcolor: '#7877C6', color: 'white' }}
          >
            {conversation.isSeller && <StoreIcon />}
            {!conversation.isSeller && !conversation.userAvatar && <PersonIcon />}
          </Avatar>
        </Badge>
      </ListItemAvatar>
      <ListItemText
        disableTypography
        primary={
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography 
              variant="subtitle1" 
              fontWeight={conversation.unreadCount > 0 ? 700 : 600} // Bolder for unread
              sx={{ 
                color: 'white', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                maxWidth: '70%',
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              {conversation.userName}
            </Typography>
            {/* UNREAD COUNT BADGE FIX */}
            {conversation.unreadCount > 0 ? (
                <Badge
                    badgeContent={conversation.unreadCount}
                    color="error" // Red color for attention
                    max={99}
                    sx={{
                        '& .MuiBadge-badge': {
                            backgroundColor: '#FF6B95', // Use a custom attention color
                            color: 'white',
                            fontWeight: 700,
                            boxShadow: '0 0 8px rgba(255, 107, 149, 0.5)',
                            fontSize: '0.75rem',
                            height: 20,
                            minWidth: 20,
                            padding: '0 4px',
                        }
                    }}
                />
            ) : (
                <Typography 
                    variant="caption" 
                    sx={{ 
                        color: alpha(theme.palette.common.white, 0.5), 
                        fontSize: { xs: '0.65rem', sm: '0.75rem' } 
                    }}
                >
                    {conversation.lastMessageTime}
                </Typography>
            )}
          </Stack>
        }
        secondary={
          <Typography 
            variant="body2" 
            sx={{ 
              color: conversation.unreadCount > 0 ? alpha(theme.palette.common.white, 0.9) : alpha(theme.palette.common.white, 0.7),
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              mt: 0.5
            }}
          >
            {conversation.lastMessage}
          </Typography>
        }
      />
    </ListItem>
  );

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: '#1A173B' }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h4" 
          fontWeight={800} 
          mb={4} 
          sx={{ 
            color: 'white', 
            textShadow: '0 4px 10px rgba(0,0,0,0.3)',
            display: isMobile && !isListVisible ? 'none' : 'block' // Hide title in mobile chat view
          }}
        >
          Messages
        </Typography>
        <Paper
          elevation={5}
          sx={{
            display: 'flex',
            height: { xs: '80vh', md: '75vh' }, // Taller chat window
            minHeight: { xs: 500, md: 600 },
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: alpha('#1A173B', 0.95), // Slightly lighter background for the content box
            border: '1px solid rgba(120, 119, 198, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(20px)',
          }}
        >
          
          {/* Conversation List (Left Panel) */}
          <Box 
            sx={{ 
              width: { xs: '100%', sm: 360, md: 400 }, 
              flexShrink: 0,
              display: isMobile ? (isListVisible ? 'block' : 'none') : 'block', // Mobile visibility toggle
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
              background: alpha('#1A173B', 0.95),
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search conversations..."
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: alpha('#ffffff', 0.5) }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: alpha('#ffffff', 0.05),
                    color: 'white',
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
            <Box sx={{ overflowY: 'auto', height: 'calc(100% - 70px)', p: 2 }}>
              <List sx={{ p: 0 }}>
                {conversations.map(renderConversationItem)}
              </List>
            </Box>
          </Box>
          
          {/* Message Thread (Right Panel) */}
          <Box 
            sx={{ 
              flexGrow: 1, 
              display: isMobile ? (isListVisible ? 'none' : 'flex') : 'flex', // Mobile visibility toggle
              flexDirection: 'column',
              background: alpha('#24243E', 0.95), // Distinct background for chat thread
            }}
          >
            {selectedConversation ? (
              <>
                {/* Header (User/Seller Info) */}
                <Box 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: alpha('#1A173B', 0.9),
                    flexShrink: 0,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {isMobile && (
                        <IconButton onClick={() => setIsListVisible(true)} sx={{ color: 'white' }}>
                            <ArrowBackIcon />
                        </IconButton>
                    )}
                    <Avatar 
                      alt={selectedConversation.userName} 
                      src={selectedConversation.userAvatar} 
                      sx={{ bgcolor: '#7877C6', color: 'white', width: 40, height: 40 }}
                    >
                      {selectedConversation.isSeller && <StoreIcon />}
                      {!selectedConversation.isSeller && !selectedConversation.userAvatar && <PersonIcon />}
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight={600} 
                        sx={{ color: 'white', fontSize: { xs: '0.9rem', sm: '1rem' } }}
                      >
                        {selectedConversation.userName}
                      </Typography>
                      {selectedConversation.isSeller && (
                        <Typography 
                          variant="caption" 
                          sx={{ color: '#4ECDC4', fontSize: { xs: '0.75rem', sm: '0.8rem' } }}
                        >
                          Seller
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                  <IconButton sx={{ color: alpha('white', 0.7) }}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                
                {/* Message Display Area (With Animation Fix) */}
                <Box 
                  sx={{ 
                    flexGrow: 1, 
                    p: 3, 
                    overflowY: 'auto', 
                    display: 'flex', 
                    flexDirection: 'column',
                    // Custom Scrollbar Styling (Webkit only)
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: alpha('#7877C6', 0.4),
                        borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: 'transparent',
                    },
                  }}
                >
                  <AnimatePresence initial={false}>
                      {messages.map((message) => (
                          <MessageBubble 
                              key={message.id} 
                              message={message} 
                              isMe={message.senderId === currentUserId} 
                              theme={theme}
                          />
                      ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </Box>
                
                {/* Message Input Area */}
                <Box 
                  sx={{ 
                    p: 2, 
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: alpha('#1A173B', 0.9),
                    flexShrink: 0,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton 
                      sx={{ 
                        color: alpha('#FFFFFF', 0.7),
                        '&:hover': { color: '#FF6B95' }
                      }}
                      size="medium"
                    >
                      <AttachFileIcon />
                    </IconButton>
                    <IconButton 
                      sx={{ 
                        color: alpha('#FFFFFF', 0.7),
                        '&:hover': { color: '#4ECDC4' }
                      }}
                      size="medium"
                    >
                      <ImageIcon />
                    </IconButton>
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          background: alpha('#ffffff', 0.05),
                          color: 'white',
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: alpha('#7877C6', 0.8) },
                          '&.Mui-focused fieldset': { borderColor: '#7877C6' },
                          '& fieldset': { borderColor: alpha('#ffffff', 0.15) }
                        },
                        '& .MuiInputBase-input::placeholder': {
                            color: alpha('#ffffff', 0.4),
                        }
                      }}
                    />
                    <IconButton
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="large"
                      sx={{
                        color: 'white',
                        backgroundColor: '#4ECDC4',
                        '&:hover': { 
                            backgroundColor: alpha('#4ECDC4', 0.8),
                            transform: 'scale(1.05)'
                        },
                        '&:disabled': { opacity: 0.5, backgroundColor: alpha('#4ECDC4', 0.5) },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  </Stack>
                </Box>
              </>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" sx={{ color: alpha('#ffffff', 0.5) }}>
                  Select a conversation to start messaging
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default MessagesPage;