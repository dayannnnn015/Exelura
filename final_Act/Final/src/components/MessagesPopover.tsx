// MessagesPopover.tsx - Enhanced with sticky headers
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Divider,
  Stack,
  alpha,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  Popover,
  useTheme,
  useMediaQuery,
  Button,
  Chip,
  Fab,
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
  Close as CloseIcon,
  ChatBubbleOutline as ChatBubbleIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';
import { useUserStore } from '../store/userStore';
import { motion, AnimatePresence } from 'framer-motion';

// --- Interface Definitions ---
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
// ----------------------------

interface MessagesPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  unreadCount?: number;
}

// CSS Variables
const CSS_VARS = {
  primaryDark: '#1B1833',
  primaryPurple: '#441752',
  primaryPink: '#AB4459',
  primaryOrange: '#F29F58',
};

// Dummy data
const dummyConversations: Conversation[] = [
  {
    id: 1,
    userId: 101,
    userName: 'Alex Johnson (Seller)',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage: 'Sure, I can arrange that for you. When would be a good time to ship?',
    lastMessageTime: '10:30 AM',
    unreadCount: 3,
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
    unreadCount: 1,
    isSeller: false,
  },
];

const dummyMessages: Message[] = [
  { id: 1, senderId: 101, receiverId: 1, senderName: 'Alex Johnson (Seller)', content: 'Hello! Thanks for your inquiry about the limited edition watch. It is still available.', timestamp: '10:00 AM', read: true },
  { id: 2, senderId: 1, receiverId: 101, senderName: 'Me', content: 'That is great! What is the final price including shipping?', timestamp: '10:05 AM', read: true },
  { id: 3, senderId: 101, receiverId: 1, senderName: 'Alex Johnson (Seller)', content: 'The final price is $450, shipping included. I can also offer express shipping for an extra $20.', timestamp: '10:15 AM', read: false },
  { id: 4, senderId: 101, receiverId: 1, senderName: 'Alex Johnson (Seller)', content: 'Sure, I can arrange that for you. When would be a good time to ship?', timestamp: '10:30 AM', read: false },
];

const MessageBubble: React.FC<{ message: Message, isMe: boolean }> = ({ message, isMe }) => {
  const bubbleBg = isMe 
    ? `linear-gradient(135deg, ${CSS_VARS.primaryPurple} 0%, ${CSS_VARS.primaryPink} 100%)`
    : alpha('#FFFFFF', 0.08);
  
  const bubbleColor = isMe ? '#FFFFFF' : '#FFFFFF';
  const alignSelf = isMe ? 'flex-end' : 'flex-start';
  const borderRadius = isMe ? '16px 16px 0 16px' : '16px 16px 16px 0';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: isMe ? 10 : -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{ 
        maxWidth: '70%', 
        alignSelf: alignSelf, 
        marginBottom: 8,
        width: 'fit-content',
      }}
    >
      <Box 
        sx={{
          background: bubbleBg,
          color: bubbleColor,
          p: 1.5,
          borderRadius: borderRadius,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          border: `1px solid ${isMe ? alpha(CSS_VARS.primaryPink, 0.3) : alpha('#FFFFFF', 0.1)}`,
        }}
      >
        <Typography variant="body2" sx={{ 
          wordWrap: 'break-word',
          fontSize: '0.9rem',
          lineHeight: 1.4,
        }}>
          {message.content}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            mt: 0.5, 
            textAlign: 'right', 
            color: isMe ? alpha('#FFFFFF', 0.8) : alpha('#FFFFFF', 0.6),
            fontSize: '0.75rem',
          }}
        >
          {message.timestamp}
        </Typography>
      </Box>
    </motion.div>
  );
};

const MessagesPopover: React.FC<MessagesPopoverProps> = ({ anchorEl, open, onClose, unreadCount = 0 }) => {
  const [conversations, setConversations] = useState<Conversation[]>(dummyConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>(dummyMessages);
  const [newMessage, setNewMessage] = useState('');
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { currentUser } = useUserStore();
  const currentUserId = currentUser?.id || 1;
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    if (view === 'chat') {
      scrollToBottom();
    }
  }, [messages, view]);

  // Reset to list view when popover closes
  useEffect(() => {
    if (!open) {
      setView('list');
      setSelectedConversation(null);
      setNewMessage('');
    }
  }, [open]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Conversation Selection
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setView('chat');
    
    // Simulate fetching messages
    setMessages(conversation.id === 1 ? dummyMessages : [
      { id: 5, senderId: conversation.userId, receiverId: 1, senderName: conversation.userName, content: 'Hey, is this still available?', timestamp: '2:00 PM', read: true },
      { id: 6, senderId: 1, receiverId: conversation.userId, senderName: 'Me', content: 'Yes it is! How can I help you?', timestamp: '2:05 PM', read: true },
    ]);
    
    // Mark conversation as read
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
      
      // Update last message in conversation list
      setConversations(convs => convs.map(c => 
        c.id === selectedConversation.id ? { ...c, lastMessage: newMsg.content, lastMessageTime: newMsg.timestamp } : c
      ));
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle back to list view
  const handleBackToList = () => {
    setView('list');
    setSelectedConversation(null);
  };

  // Handle mark all as read
  const handleMarkAllRead = () => {
    setConversations(convs => convs.map(c => ({ ...c, unreadCount: 0 })));
  };

  return (
    <Popover
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: isMobile ? '95vw' : 450,
          maxWidth: '95vw',
          height: isMobile ? '90vh' : 600,
          maxHeight: '90vh',
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: CSS_VARS.primaryDark,
          border: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`,
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header - Sticky */}
      <Box 
        sx={{ 
          p: 2, 
          borderBottom: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.2)}`,
          backgroundColor: alpha(CSS_VARS.primaryDark, 0.95),
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {view === 'chat' ? (
            <IconButton onClick={handleBackToList} sx={{ 
              color: CSS_VARS.primaryOrange,
              mr: 1,
            }}>
              <ArrowBackIcon />
            </IconButton>
          ) : (
            <ChatBubbleIcon sx={{ color: CSS_VARS.primaryOrange, fontSize: 24 }} />
          )}
          <Typography variant="h6" fontWeight={700} sx={{ color: '#FFFFFF' }}>
            {view === 'chat' ? selectedConversation?.userName || 'Messages' : 'Messages'}
          </Typography>
          {view === 'list' && unreadCount > 0 && (
            <Chip
              label={unreadCount}
              size="small"
              sx={{
                backgroundColor: CSS_VARS.primaryPink,
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.75rem',
                height: 22,
                ml: 1,
              }}
            />
          )}
        </Stack>
        <Stack direction="row" spacing={0.5}>
          {view === 'list' && conversations.some(c => c.unreadCount > 0) && (
            <Button
              size="small"
              onClick={handleMarkAllRead}
              sx={{
                color: CSS_VARS.primaryOrange,
                fontSize: '0.75rem',
                textTransform: 'none',
                mr: 1,
              }}
            >
              Mark all read
            </Button>
          )}
          <IconButton 
            size="small" 
            onClick={onClose}
            sx={{ 
              color: alpha('#FFFFFF', 0.7),
              backgroundColor: alpha('#FF4757', 0.1),
              border: `1px solid ${alpha('#FF4757', 0.3)}`,
              '&:hover': {
                backgroundColor: alpha('#FF4757', 0.2),
                color: '#FFFFFF',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Content Area */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* List View */}
        {view === 'list' && (
          <>
            {/* Search - Sticky */}
            <Box sx={{ 
              p: 2, 
              borderBottom: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.2)}`,
              backgroundColor: alpha(CSS_VARS.primaryDark, 0.95),
              backdropFilter: 'blur(10px)',
              position: 'sticky',
              top: 0,
              zIndex: 9,
            }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: CSS_VARS.primaryOrange }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: alpha('#FFFFFF', 0.05),
                    color: '#FFFFFF',
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: alpha(CSS_VARS.primaryOrange, 0.5),
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: CSS_VARS.primaryOrange,
                    },
                  },
                }}
              />
            </Box>

            {/* Conversations List */}
            <Box sx={{ 
              overflowY: 'auto', 
              flex: 1,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: alpha('#000000', 0.1),
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: alpha(CSS_VARS.primaryOrange, 0.5),
                borderRadius: '4px',
                '&:hover': {
                  background: alpha(CSS_VARS.primaryOrange, 0.7),
                },
              },
            }}>
              <List sx={{ p: 2 }}>
                {filteredConversations.map((conversation) => (
                  <ListItem
                    key={conversation.id}
                    button
                    onClick={() => handleSelectConversation(conversation)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      borderRadius: 2,
                      mb: 1,
                      backgroundColor: 'transparent',
                      border: '1px solid transparent',
                      transition: 'all 0.3s ease-out',
                      '&:hover': {
                        backgroundColor: alpha(CSS_VARS.primaryOrange, 0.1),
                        borderColor: alpha(CSS_VARS.primaryOrange, 0.3),
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
                          sx={{ 
                            bgcolor: conversation.isSeller ? CSS_VARS.primaryOrange : CSS_VARS.primaryPurple, 
                            color: '#FFFFFF', 
                            width: 48, 
                            height: 48,
                            fontSize: '1rem',
                          }}
                        >
                          {conversation.isSeller ? <StoreIcon /> : <PersonIcon />}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      disableTypography
                      primary={
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={conversation.unreadCount > 0 ? 700 : 600}
                            sx={{ 
                              color: '#FFFFFF', 
                              whiteSpace: 'nowrap', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              maxWidth: isMobile ? '50%' : '60%',
                              fontSize: '0.95rem'
                            }}
                          >
                            {conversation.userName}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: conversation.unreadCount > 0 ? CSS_VARS.primaryOrange : alpha('#FFFFFF', 0.5),
                              fontWeight: conversation.unreadCount > 0 ? 600 : 400,
                            }}
                          >
                            {conversation.lastMessageTime}
                          </Typography>
                        </Stack>
                      }
                      secondary={
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: conversation.unreadCount > 0 ? alpha('#FFFFFF', 0.9) : alpha('#FFFFFF', 0.7),
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '0.85rem',
                            mt: 0.5
                          }}
                        >
                          {conversation.lastMessage}
                        </Typography>
                      }
                    />
                    {conversation.unreadCount > 0 && (
                      <Badge
                        badgeContent={conversation.unreadCount}
                        color="error"
                        max={99}
                        sx={{
                          ml: 1,
                          '& .MuiBadge-badge': {
                            backgroundColor: CSS_VARS.primaryPink,
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            height: 20,
                            minWidth: 20,
                          }
                        }}
                      />
                    )}
                  </ListItem>
                ))}
                {filteredConversations.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ChatBubbleIcon sx={{ color: alpha(CSS_VARS.primaryOrange, 0.3), fontSize: 48, mb: 2 }} />
                    <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.5) }}>
                      {searchQuery ? 'No conversations found' : 'No messages yet'}
                    </Typography>
                    {searchQuery && (
                      <Button 
                        size="small" 
                        onClick={() => setSearchQuery('')}
                        sx={{ mt: 2, color: CSS_VARS.primaryOrange }}
                      >
                        Clear search
                      </Button>
                    )}
                  </Box>
                )}
              </List>
            </Box>
          </>
        )}

        {/* Chat View */}
        {view === 'chat' && selectedConversation && (
          <>
            {/* Chat Header - Sticky */}
            <Box 
              sx={{ 
                p: 2, 
                borderBottom: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.2)}`,
                backgroundColor: alpha(CSS_VARS.primaryDark, 0.95),
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar 
                  alt={selectedConversation.userName} 
                  src={selectedConversation.userAvatar} 
                  sx={{ 
                    bgcolor: selectedConversation.isSeller ? CSS_VARS.primaryOrange : CSS_VARS.primaryPurple, 
                    color: '#FFFFFF', 
                    width: 40, 
                    height: 40 
                  }}
                >
                  {selectedConversation.isSeller ? <StoreIcon /> : <PersonIcon />}
                </Avatar>
                <Box>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight={600} 
                    sx={{ color: '#FFFFFF', fontSize: '0.95rem' }}
                  >
                    {selectedConversation.userName}
                  </Typography>
                  {selectedConversation.isSeller && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: CSS_VARS.primaryOrange, 
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      Seller • Online
                    </Typography>
                  )}
                </Box>
              </Stack>
              <IconButton sx={{ color: alpha('#FFFFFF', 0.7) }}>
                <MoreVertIcon />
              </IconButton>
            </Box>

            {/* Messages Display - Scrollable */}
            <Box 
              ref={messagesContainerRef}
              sx={{ 
                flex: 1,
                p: 2, 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: alpha(CSS_VARS.primaryOrange, 0.4),
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: alpha('#000000', 0.1),
                  borderRadius: '10px',
                },
              }}
            >
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <MessageBubble 
                      key={message.id} 
                      message={message} 
                      isMe={message.senderId === currentUserId}
                    />
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </Box>
            </Box>

            {/* Message Input - Sticky */}
            <Box 
              sx={{ 
                p: 2, 
                borderTop: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.2)}`,
                backgroundColor: alpha(CSS_VARS.primaryDark, 0.95),
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                bottom: 0,
                zIndex: 10,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton 
                  sx={{ 
                    color: CSS_VARS.primaryOrange,
                    backgroundColor: alpha(CSS_VARS.primaryOrange, 0.1),
                    border: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`,
                    '&:hover': {
                      backgroundColor: alpha(CSS_VARS.primaryOrange, 0.2),
                    },
                  }}
                  size="small"
                >
                  <AttachFileIcon />
                </IconButton>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  multiline
                  maxRows={4}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: alpha('#FFFFFF', 0.05),
                      color: '#FFFFFF',
                      borderRadius: 2,
                      '&:hover fieldset': { 
                        borderColor: alpha(CSS_VARS.primaryOrange, 0.5) 
                      },
                      '&.Mui-focused fieldset': { 
                        borderColor: CSS_VARS.primaryOrange 
                      },
                      '& textarea': {
                        fontSize: '0.9rem',
                      },
                    },
                  }}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="medium"
                  sx={{
                    color: '#FFFFFF',
                    backgroundColor: newMessage.trim() ? CSS_VARS.primaryOrange : alpha(CSS_VARS.primaryOrange, 0.3),
                    '&:hover': { 
                      backgroundColor: newMessage.trim() ? alpha(CSS_VARS.primaryOrange, 0.8) : alpha(CSS_VARS.primaryOrange, 0.3) 
                    },
                    '&:disabled': { 
                      opacity: 0.5,
                      backgroundColor: alpha(CSS_VARS.primaryOrange, 0.1),
                    },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Stack>
            </Box>
          </>
        )}
      </Box>
    </Popover>
  );
};

export default MessagesPopover;