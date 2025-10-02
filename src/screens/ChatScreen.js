import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
  ActivityIndicator,
  Alert,
  AppState,
  SafeAreaView,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useIsFocused } from '@react-navigation/native';
import io from 'socket.io-client';
import api from '../config/api';
import soundManager from '../utils/sound';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// MessageActions Component
const MessageActions = ({ message, isCurrentUser, onReply, onClose }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, []);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message.content);
    }
    Alert.alert('Copied', 'Message copied to clipboard');
    onClose();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            console.log('Delete message:', message._id);
            onClose();
          }
        },
      ]
    );
  };

  const handleReply = () => {
    onReply(message);
    onClose();
  };

  return (
    <Animated.View 
      style={[
        styles.actionsContainer,
        {
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
            }),
          }],
          opacity: slideAnim,
        },
      ]}
    >
      <View style={styles.actionsHeader}>
        <Text style={styles.actionsTitle}>Message Options</Text>
      </View>
      
      <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
        <Text style={styles.actionIcon}>📋</Text>
        <Text style={styles.actionText}>Copy Text</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton} onPress={handleReply}>
        <Text style={styles.actionIcon}>↩️</Text>
        <Text style={styles.actionText}>Reply</Text>
      </TouchableOpacity>
      
      {isCurrentUser && (
        <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
          <Text style={styles.actionIcon}>🗑️</Text>
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={onClose}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Reply Preview Component
const ReplyPreview = ({ replyTo, onCancel }) => {
  return (
    <View style={styles.replyPreview}>
      <View style={styles.replyPreviewHeader}>
        <Text style={styles.replyPreviewTitle}>Replying to {replyTo.sender.name}</Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeReplyButton}>
          <Text style={styles.closeReplyText}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.replyPreviewScroll}
      >
        <Text style={styles.replyPreviewText} numberOfLines={1}>
          {replyTo.content}
        </Text>
      </ScrollView>
    </View>
  );
};

// Message Bubble Component
const MessageBubble = ({ 
  item, 
  isCurrentUser, 
  isReplyingToThis, 
  onLongPress, 
  renderMessageStatus 
}) => {
  return (
    <TouchableOpacity
      onLongPress={() => onLongPress(item)}
      delayLongPress={500}
      activeOpacity={0.7}
      style={[
        styles.messageWrapper,
        isCurrentUser ? styles.currentUserWrapper : styles.otherUserWrapper,
      ]}
    >
      {isReplyingToThis && (
        <View style={styles.replyIndicator}>
          <View style={styles.replyIndicatorLine} />
          <Text style={styles.replyIndicatorText}>Replying to this message</Text>
        </View>
      )}
      
      <View
        style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
        ]}
      >
        {!isCurrentUser && (
          <Text style={styles.senderName}>{item.sender.name}</Text>
        )}
        
        {/* Scrollable message content */}
        <ScrollView 
          horizontal={false}
          showsVerticalScrollIndicator={false}
          style={styles.messageContentScroll}
          contentContainerStyle={styles.messageContentContainer}
        >
          <Text style={isCurrentUser ? styles.currentUserText : styles.otherUserText}>
            {item.content}
          </Text>
        </ScrollView>
        
        <View style={styles.messageFooter}>
          <Text style={[
            styles.time,
            isCurrentUser ? styles.currentUserTime : styles.otherUserTime
          ]}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {isCurrentUser && renderMessageStatus(item)}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Helper functions
const groupMessagesByDate = (messages) => {
  const groups = [];
  let currentDate = null;

  messages.forEach((message) => {
    const messageDate = new Date(message.timestamp).toDateString();
    
    if (messageDate !== currentDate) {
      groups.push({
        type: 'dateHeader',
        date: messageDate,
        id: `date-${messageDate}`
      });
      currentDate = messageDate;
    }
    
    groups.push({
      ...message,
      type: 'message'
    });
  });

  return groups;
};

const formatDateHeader = (date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }
};

// Main ChatScreen Component
const ChatScreen = ({ route, navigation }) => {
  const { otherUser, chatId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  
  const flatListRef = useRef();
  const textInputRef = useRef();
  const typingTimeoutRef = useRef();
  const isFocused = useIsFocused();
  const appState = useRef(AppState.currentState);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: otherUser.name,
      headerStyle: {
        backgroundColor: '#6366F1',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: '600',
      },
    });
  }, [navigation, otherUser]);

  useEffect(() => {
    soundManager.init();
    loadMessageHistory();
    setupSocket();
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      subscription.remove();
    };
  }, [chatId]);

  useEffect(() => {
    if (isFocused && socket) {
      markMessagesAsRead();
    }
  }, [isFocused, messages, socket]);

  const handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      if (isFocused) {
        markMessagesAsRead();
      }
    }
    appState.current = nextAppState;
  };

  const loadMessageHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/messages/${chatId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading message history:', error);
      Alert.alert('Error', 'Failed to load message history');
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket']
    });
    
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('user_online', user.id);
    });

    newSocket.emit('join_chat', { chatId, userId: user.id });

    newSocket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
      
      if (message.sender._id !== user.id && !isFocused) {
        soundManager.playNotificationSound();
        
        if (Platform.OS === 'web') {
          if (Notification.permission === 'granted') {
            new Notification(`${message.sender.name}`, {
              body: message.content,
              icon: message.sender.avatar || '/default-avatar.png'
            });
          }
        }
      }
      
      if (message.receiver._id === user.id && !message.delivered) {
        newSocket.emit('mark_messages_delivered', {
          chatId,
          userId: user.id,
          senderId: message.sender._id,
          messageIds: [message._id]
        });
      }
    });

    newSocket.on('messages_delivered', (data) => {
      setMessages(prev => prev.map(msg => 
        data.messageIds.includes(msg._id) ? { ...msg, delivered: true } : msg
      ));
    });

    newSocket.on('messages_read', (data) => {
      setMessages(prev => prev.map(msg => 
        data.messageIds.includes(msg._id) ? { ...msg, read: true } : msg
      ));
    });

    newSocket.on('new_message_notification', (data) => {
      if (!isFocused) {
        soundManager.playNotificationSound();
        
        if (Platform.OS === 'web' && Notification.permission === 'granted') {
          new Notification(`New message from ${data.message.sender.name}`, {
            body: data.message.content,
            icon: data.message.sender.avatar || '/default-avatar.png'
          });
        }
      }
    });

    newSocket.on('user_typing', (data) => {
      if (data.userId !== user.id) {
        setTypingUser(data.userName);
        setIsTyping(true);
      }
    });

    newSocket.on('user_stop_typing', (data) => {
      if (data.userId !== user.id) {
        setIsTyping(false);
        setTypingUser('');
      }
    });

    newSocket.on('message_error', (data) => {
      Alert.alert('Error', data.error);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  };

  const markMessagesAsRead = () => {
    if (!socket) return;
    
    const unreadMessages = messages.filter(
      msg => msg.sender._id !== user.id && !msg.read
    );
    
    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(msg => msg._id);
      
      socket.emit('mark_messages_read', {
        chatId,
        userId: user.id,
        senderId: otherUser._id,
        messageIds
      });
    }
  };

  const handleMessageLongPress = (message) => {
    setSelectedMessage(message);
    setShowMessageActions(true);
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setInputText('');
    textInputRef.current?.focus();
  };

  const clearReply = () => {
    setReplyingTo(null);
  };

  const sendMessage = () => {
    if (inputText.trim().length === 0 || !socket) return;

    let messageContent = inputText.trim();
    
    // Add reply context if replying to a message
    if (replyingTo) {
      messageContent = `Replying to "${replyingTo.content.substring(0, 50)}${replyingTo.content.length > 50 ? '...' : ''}": ${messageContent}`;
    }

    const messageData = {
      senderId: user.id,
      receiverId: otherUser._id,
      content: messageContent,
      chatId: chatId
    };

    socket.emit('send_message', messageData);
    socket.emit('stop_typing', { chatId, userId: user.id });
    
    setInputText('');
    setReplyingTo(null);
  };

  const handleInputChange = (text) => {
    setInputText(text);
    
    if (socket) {
      socket.emit('typing', { 
        chatId, 
        userId: user.id, 
        userName: user.name 
      });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { chatId, userId: user.id });
      }, 1000);
    }
  };

  const renderMessageStatus = (message) => {
    if (message.sender._id !== user.id) return null;

    let statusIcon = '✓';
    let statusColor = '#9CA3AF';

    if (message.read) {
      statusIcon = '✓✓';
      statusColor = '#10B981';
    } else if (message.delivered) {
      statusIcon = '✓✓';
      statusColor = '#9CA3AF';
    }

    return (
      <Text style={[styles.messageStatus, { color: statusColor }]}>
        {statusIcon}
      </Text>
    );
  };

  const renderDateHeader = (date) => (
    <View style={styles.dateHeader}>
      <View style={styles.dateLine} />
      <Text style={styles.dateHeaderText}>
        {formatDateHeader(new Date(date))}
      </Text>
      <View style={styles.dateLine} />
    </View>
  );

  const renderMessage = ({ item }) => {
    if (item.type === 'dateHeader') {
      return renderDateHeader(item.date);
    }

    const isCurrentUser = item.sender._id === user.id;
    const isReplyingToThis = replyingTo && replyingTo._id === item._id;

    return (
      <MessageBubble
        item={item}
        isCurrentUser={isCurrentUser}
        isReplyingToThis={isReplyingToThis}
        onLongPress={handleMessageLongPress}
        renderMessageStatus={renderMessageStatus}
      />
    );
  };

  useEffect(() => {
    if (Platform.OS === 'web' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Messages Area - This will scroll independently */}
        <View style={styles.messagesContainer}>
          <FlatList
            ref={flatListRef}
            data={groupedMessages}
            renderItem={renderMessage}
            keyExtractor={item => item._id || item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            showsVerticalScrollIndicator={true}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>💬</Text>
                <Text style={styles.emptyStateText}>No messages yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Start the conversation by sending a message!
                </Text>
              </View>
            }
          />
        </View>

        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingDots}>
              <View style={[styles.typingDot, styles.typingDot1]} />
              <View style={[styles.typingDot, styles.typingDot2]} />
              <View style={[styles.typingDot, styles.typingDot3]} />
            </View>
            <Text style={styles.typingText}>
              {typingUser} is typing...
            </Text>
          </View>
        )}

        {/* Fixed Bottom Area with Keyboard Avoiding */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          style={styles.keyboardAvoidingView}
        >
          {/* Reply Preview */}
          {replyingTo && (
            <ReplyPreview 
              replyTo={replyingTo} 
              onCancel={clearReply}
            />
          )}

          {/* Input Area - Always fixed at bottom */}
          <View style={styles.inputArea}>
            <View style={styles.inputContainer}>
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                value={inputText}
                onChangeText={handleInputChange}
                placeholder="Type a message..."
                onSubmitEditing={sendMessage}
                multiline
                maxLength={1000}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity 
                style={[
                  styles.sendButton, 
                  inputText.trim().length === 0 && styles.sendButtonDisabled
                ]} 
                onPress={sendMessage}
                disabled={inputText.trim().length === 0}
              >
                <Text style={styles.sendButtonIcon}>↑</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Message Actions Overlay */}
        {showMessageActions && selectedMessage && (
          <TouchableOpacity 
            style={styles.actionsOverlay}
            onPress={() => setShowMessageActions(false)}
            activeOpacity={1}
          >
            <MessageActions
              message={selectedMessage}
              isCurrentUser={selectedMessage.sender._id === user.id}
              onReply={handleReply}
              onClose={() => setShowMessageActions(false)}
            />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // Messages container takes most space but leaves room for input
  messagesContainer: {
    flex: 1,
  },
  keyboardAvoidingView: {
    // Only wraps the bottom fixed elements
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 16, // Extra padding at bottom for better scroll
  },
  messageWrapper: {
    marginVertical: 4,
  },
  currentUserWrapper: {
    alignItems: 'flex-end',
  },
  otherUserWrapper: {
    alignItems: 'flex-start',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dateHeaderText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  currentUserBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageContentScroll: {
    maxHeight: 200, // Maximum height before scrolling
    minHeight: 20, // Minimum height for single line
  },
  messageContentContainer: {
    flexGrow: 1,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 4,
  },
  currentUserText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  otherUserText: {
    color: '#1F2937',
    fontSize: 16,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 6,
  },
  time: {
    fontSize: 11,
    fontWeight: '500',
  },
  currentUserTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherUserTime: {
    color: '#9CA3AF',
  },
  messageStatus: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  replyIndicatorLine: {
    width: 3,
    height: 20,
    backgroundColor: '#6366F1',
    borderRadius: 2,
    marginRight: 8,
  },
  replyIndicatorText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
  },
  replyPreview: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  replyPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  replyPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  closeReplyButton: {
    padding: 4,
  },
  closeReplyText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  replyPreviewScroll: {
    flex: 1,
  },
  replyPreviewText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 18,
  },
  inputArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '100%',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#F9FAFB',
    marginRight: 8,
    minHeight: 44,
    maxWidth: '100%',
  },
  sendButton: {
    backgroundColor: '#6366F1',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    flexShrink: 0,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
    marginHorizontal: 1,
  },
  typingDot1: {
    animation: 'bounce 1s infinite',
  },
  typingDot2: {
    animation: 'bounce 1s infinite 0.2s',
  },
  typingDot3: {
    animation: 'bounce 1s infinite 0.4s',
  },
  typingText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  actionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 1000,
  },
  actionsContainer: {
    backgroundColor: '#FFFFFF',
    width: '90%',
    borderRadius: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  actionsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  deleteText: {
    color: '#EF4444',
  },
  cancelButton: {
    justifyContent: 'center',
    borderBottomWidth: 0,
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ChatScreen;