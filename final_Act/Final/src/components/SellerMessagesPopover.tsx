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
  QuestionAnswer as QuestionAnswerIcon,
} from '@mui/icons-material';
import { useUserStore } from '../store/userStore';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  read: boolean;
  productId?: number;
  productName?: string;
}

interface Conversation {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isInquiry: boolean;
  productId?: number;
  productName?: string;
}

interface SellerMessagesPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  unreadCount?: number;
}

const CSS_VARS = {
  primaryDark: '#1B1833',
  primaryPurple: '#441752',
  primaryPink: '#AB4459',
  primaryOrange: '#F29F58',
};

const SellerMessagesPopover: React.FC<SellerMessagesPopoverProps> = ({ anchorEl, open, onClose, unreadCount = 0 }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { currentUser, orders } = useUserStore();
  const currentUserId = currentUser?.id || 2;
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Generate conversations from recent orders
  useEffect(() => {
    if (open && view === 'list') {
      const sellerOrders = orders.filter(order => 
        order.items.some(item => item.sellerId === currentUserId)
      );
      
      const uniqueCustomers = new Map<number, Conversation>();
      
      sellerOrders.forEach(order => {
        if (!uniqueCustomers.has(order.userId)) {
          uniqueCustomers.set(order.userId, {
            id: order.userId,
            userId: order.userId,
            userName: order.customerName,
            userAvatar: `https://i.pravatar.cc/150?img=${order.userId}`,
            lastMessage: 'Order inquiry',
            lastMessageTime: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unreadCount: Math.floor(Math.random() * 3), // Random unread count for demo
            isInquiry: true,
            productId: order.items[0]?.productId,
            productName: order.items[0]?.productName,
          });
        }
      });

      // Add some sample inquiries
      const sampleConversations: Conversation[] = [
        {
          id: 1001,
          userId: 101,
          userName: 'Alex Johnson',
          userAvatar: 'https://i.pravatar.cc/150?img=1',
          lastMessage: 'Is this product available in black?',
          lastMessageTime: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unreadCount: 1,
          isInquiry: true,
          productId: 1,
          productName: 'Premium Watch',
        },
        {
          id: 1002,
          userId: 102,
          userName: 'Maria Garcia',
          userAvatar: 'https://i.pravatar.cc/150?img=4',
          lastMessage: 'Can you provide more photos?',
          lastMessageTime: new Date(Date.now() - 7200000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unreadCount: 0,
          isInquiry: true,
          productId: 2,
          productName: 'Designer Handbag',
        },
      ];

      setConversations([...Array.from(uniqueCustomers.values()), ...sampleConversations]);
    }
  }, [open, view, orders, currentUserId]);

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

  useEffect(() => {
    if (!open) {
      setView('list');
      setSelectedConversation(null);
      setNewMessage('');
    }
  }, [open]);

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.productName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setView('chat');
    
    // Generate conversation messages
    const conversationMessages: Message[] = [
      {
        id: 1,
        senderId: conversation.userId,
        receiverId: currentUserId,
        senderName: conversation.userName,
        senderAvatar: conversation.userAvatar,
        content: conversation.isInquiry ? 
          `Hi, I have a question about ${conversation.productName || 'your product'}` : 
          conversation.lastMessage,
        timestamp: new Date(Date.now() - 7200000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        productId: conversation.productId,
        productName: conversation.productName,
      },
      {
        id: 2,
        senderId: currentUserId,
        receiverId: conversation.userId,
        senderName: 'You',
        content: 'Hello! How can I help you today?',
        timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true,
      },
      {
        id: 3,
        senderId: conversation.userId,
        receiverId: currentUserId,
        senderName: conversation.userName,
        senderAvatar: conversation.userAvatar,
        content: conversation.lastMessage,
        timestamp: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
      },
    ];
    
    setMessages(conversationMessages);
    
    // Mark conversation as read
    setConversations(convs => convs.map(c => 
      c.id === conversation.id ? { ...c, unreadCount: 0 } : c
    ));
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const newMsg: Message = {
        id: Date.now(),
        senderId: currentUserId,
        receiverId: selectedConversation.userId,
        senderName: 'You',
        content: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true,
      };
      
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage('');
      
      setConversations(convs => convs.map(c => 
        c.id === selectedConversation.id ? { ...c, lastMessage: newMsg.content, lastMessageTime: newMsg.timestamp } : c
      ));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedConversation(null);
  };

  const handleMarkAllRead = () => {
    setConversations(convs => convs.map(c => ({ ...c, unreadCount: 0 })));
  };

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
          {!isMe && (
            <Typography variant="caption" sx={{ 
              display: 'block', 
              mb: 0.5, 
              color: alpha('#FFFFFF', 0.7),
              fontWeight: 600,
            }}>
              {message.senderName}
            </Typography>
          )}
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

  const currentUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

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
          width: isMobile ? '95vw' : 500,
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
      {/* Header */}
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
            <QuestionAnswerIcon sx={{ color: CSS_VARS.primaryOrange, fontSize: 24 }} />
          )}
          <Typography variant="h6" fontWeight={700} sx={{ color: '#FFFFFF' }}>
            {view === 'chat' ? selectedConversation?.userName || 'Messages' : 'Seller Messages'}
          </Typography>
          {view === 'list' && (
            <Chip
              label={`${currentUnreadCount} unread`}
              size="small"
              sx={{
                backgroundColor: currentUnreadCount > 0 ? CSS_VARS.primaryPink : alpha('#FFFFFF', 0.1),
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 22,
                ml: 1,
              }}
            />
          )}
        </Stack>
        <Stack direction="row" spacing={0.5}>
          {view === 'list' && currentUnreadCount > 0 && (
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

      {/* Content */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* List View */}
        {view === 'list' && (
          <>
            {/* Search */}
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
                      backgroundColor: conversation.unreadCount > 0 ? 
                        alpha(CSS_VARS.primaryPink, 0.1) : 'transparent',
                      border: conversation.unreadCount > 0 ? 
                        `1px solid ${alpha(CSS_VARS.primaryPink, 0.3)}` : '1px solid transparent',
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
                            bgcolor: CSS_VARS.primaryPurple, 
                            color: '#FFFFFF', 
                            width: 48, 
                            height: 48,
                            fontSize: '1rem',
                          }}
                        >
                          {conversation.userName.charAt(0)}
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
                        <Box>
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
                          {conversation.productName && (
                            <Chip
                              label={conversation.productName}
                              size="small"
                              sx={{
                                backgroundColor: alpha(CSS_VARS.primaryOrange, 0.2),
                                color: CSS_VARS.primaryOrange,
                                fontSize: '0.7rem',
                                height: 20,
                                mt: 1,
                              }}
                            />
                          )}
                        </Box>
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
                    <QuestionAnswerIcon sx={{ color: alpha(CSS_VARS.primaryOrange, 0.3), fontSize: 48, mb: 2 }} />
                    <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.5) }}>
                      {searchQuery ? 'No conversations found' : 'No customer messages yet'}
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
            {/* Chat Header */}
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
                    bgcolor: CSS_VARS.primaryPurple, 
                    color: '#FFFFFF', 
                    width: 40, 
                    height: 40 
                  }}
                >
                  {selectedConversation.userName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight={600} 
                    sx={{ color: '#FFFFFF', fontSize: '0.95rem' }}
                  >
                    {selectedConversation.userName}
                  </Typography>
                  {selectedConversation.productName && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: CSS_VARS.primaryOrange, 
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      Inquiry about: {selectedConversation.productName}
                    </Typography>
                  )}
                </Box>
              </Stack>
              <IconButton sx={{ color: alpha('#FFFFFF', 0.7) }}>
                <MoreVertIcon />
              </IconButton>
            </Box>

            {/* Messages Display */}
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
                      isMe={message.senderName === 'You'}
                    />
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </Box>
            </Box>

            {/* Message Input */}
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
                  placeholder="Type your reply..."
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

export default SellerMessagesPopover;