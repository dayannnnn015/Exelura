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
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  Storefront as StoreIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

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
  unreadCount: number;
  isSeller: boolean;
}

const MessagesPage = () => {
  const navigate = useNavigate();
  const { currentUser, isSeller } = useUserStore();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sample conversations
    const sampleConversations: Conversation[] = [
      {
        id: 1,
        userId: 2,
        userName: 'Luxury Watch Store',
        userAvatar: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=100&h=100&fit=crop',
        lastMessage: 'Your order has been shipped!',
        lastMessageTime: '10:30 AM',
        unreadCount: 2,
        isSeller: true,
      },
      {
        id: 2,
        userId: 3,
        userName: 'Designer Boutique',
        userAvatar: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop',
        lastMessage: 'We have new arrivals in stock',
        lastMessageTime: 'Yesterday',
        unreadCount: 0,
        isSeller: true,
      },
      {
        id: 3,
        userId: 4,
        userName: 'John Doe',
        userAvatar: '',
        lastMessage: 'When will my order arrive?',
        lastMessageTime: '2 days ago',
        unreadCount: 0,
        isSeller: false,
      },
    ];

    setConversations(sampleConversations);
    
    // Sample messages for first conversation
    if (sampleConversations.length > 0 && !activeConversation) {
      setActiveConversation(sampleConversations[0]);
    }
  }, []);

  useEffect(() => {
    if (activeConversation) {
      // Sample messages
      const sampleMessages: Message[] = [
        {
          id: 1,
          senderId: activeConversation.userId,
          receiverId: currentUser?.id || 1,
          senderName: activeConversation.userName,
          senderAvatar: activeConversation.userAvatar,
          content: 'Hello! How can I help you with your order?',
          timestamp: '10:15 AM',
          read: true,
        },
        {
          id: 2,
          senderId: currentUser?.id || 1,
          receiverId: activeConversation.userId,
          senderName: currentUser?.name || 'You',
          content: 'Hi! I wanted to check the status of my order #1001',
          timestamp: '10:20 AM',
          read: true,
        },
        {
          id: 3,
          senderId: activeConversation.userId,
          receiverId: currentUser?.id || 1,
          senderName: activeConversation.userName,
          senderAvatar: activeConversation.userAvatar,
          content: 'Your order has been approved and will be shipped today!',
          timestamp: '10:25 AM',
          read: false,
        },
        {
          id: 4,
          senderId: activeConversation.userId,
          receiverId: currentUser?.id || 1,
          senderName: activeConversation.userName,
          senderAvatar: activeConversation.userAvatar,
          content: 'We\'ve also included a special gift with your purchase',
          timestamp: '10:30 AM',
          read: false,
        },
      ];

      setMessages(sampleMessages);
    }
  }, [activeConversation, currentUser]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation || !currentUser) return;

    const message: Message = {
      id: messages.length + 1,
      senderId: currentUser.id,
      receiverId: activeConversation.userId,
      senderName: currentUser.name,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update conversation last message
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation.id 
        ? { 
            ...conv, 
            lastMessage: newMessage,
            lastMessageTime: 'Just now',
            unreadCount: conv.isSeller ? conv.unreadCount + 1 : 0
          }
        : conv
    ));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, #0A081F 0%, #1A173B 100%)`,
        py: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ height: '80vh' }}>
        <Paper
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: alpha('#0A081F', 0.7),
            border: '1px solid rgba(120, 119, 198, 0.2)',
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(120, 119, 198, 0.2)' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton onClick={handleBackToHome} sx={{ color: '#7877C6' }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5" fontWeight="bold">
                Messages
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Conversations Sidebar */}
            <Box sx={{ width: 300, borderRight: '1px solid rgba(120, 119, 198, 0.2)', display: 'flex', flexDirection: 'column' }}>
              {/* Search */}
              <Box sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: alpha('#ffffff', 0.5) }} />
                      </InputAdornment>
                    ),
                    sx: {
                      background: alpha('#ffffff', 0.05),
                      color: 'white',
                    }
                  }}
                />
              </Box>

              {/* Conversations List */}
              <List sx={{ flex: 1, overflow: 'auto' }}>
                {filteredConversations.map((conversation) => (
                  <ListItem
                    key={conversation.id}
                    button
                    selected={activeConversation?.id === conversation.id}
                    onClick={() => setActiveConversation(conversation)}
                    sx={{
                      '&:hover': { background: alpha('#ffffff', 0.05) },
                      '&.Mui-selected': { background: alpha('#7877C6', 0.2) },
                      borderBottom: '1px solid rgba(120, 119, 198, 0.1)',
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={conversation.unreadCount}
                        color="error"
                        max={9}
                      >
                        <Avatar
                          src={conversation.userAvatar}
                          sx={{
                            bgcolor: conversation.isSeller ? '#4ECDC4' : '#F29F58',
                          }}
                        >
                          {conversation.isSeller ? <StoreIcon /> : <PersonIcon />}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={conversation.unreadCount > 0 ? 'bold' : 'normal'}>
                          {conversation.userName}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7) }} noWrap>
                          {conversation.lastMessage}
                        </Typography>
                      }
                    />
                    <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>
                      {conversation.lastMessageTime}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Chat Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <Box sx={{ p: 2, borderBottom: '1px solid rgba(120, 119, 198, 0.2)' }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        src={activeConversation.userAvatar}
                        sx={{
                          bgcolor: activeConversation.isSeller ? '#4ECDC4' : '#F29F58',
                        }}
                      >
                        {activeConversation.isSeller ? <StoreIcon /> : <PersonIcon />}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {activeConversation.userName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#4ECDC4' }}>
                          {activeConversation.isSeller ? 'Verified Seller' : 'Customer'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Messages Container */}
                  <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                    {messages.map((message) => {
                      const isOwnMessage = message.senderId === currentUser?.id;
                      return (
                        <Box
                          key={message.id}
                          sx={{
                            display: 'flex',
                            justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: '70%',
                              p: 2,
                              borderRadius: 3,
                              background: isOwnMessage
                                ? alpha('#7877C6', 0.3)
                                : alpha('#1A173B', 0.5),
                              border: `1px solid ${
                                isOwnMessage
                                  ? alpha('#7877C6', 0.2)
                                  : alpha('#4ECDC4', 0.2)
                              }`,
                            }}
                          >
                            {!isOwnMessage && (
                              <Typography variant="caption" sx={{ color: '#4ECDC4', fontWeight: 'bold', mb: 0.5, display: 'block' }}>
                                {message.senderName}
                              </Typography>
                            )}
                            <Typography variant="body2" sx={{ color: '#ffffff' }}>
                              {message.content}
                            </Typography>
                            <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5), mt: 1, display: 'block', textAlign: 'right' }}>
                              {message.timestamp}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </Box>

                  {/* Message Input */}
                  <Box sx={{ p: 2, borderTop: '1px solid rgba(120, 119, 198, 0.2)' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <IconButton sx={{ color: '#4ECDC4' }}>
                        <AttachFileIcon />
                      </IconButton>
                      <IconButton sx={{ color: '#4ECDC4' }}>
                        <ImageIcon />
                      </IconButton>
                      <TextField
                        fullWidth
                        multiline
                        maxRows={3}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            background: alpha('#ffffff', 0.05),
                            color: 'white',
                          },
                        }}
                      />
                      <IconButton
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        sx={{
                          color: '#4ECDC4',
                          backgroundColor: alpha('#4ECDC4', 0.1),
                          '&:hover': { backgroundColor: alpha('#4ECDC4', 0.2) },
                          '&:disabled': { opacity: 0.5 },
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
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default MessagesPage;