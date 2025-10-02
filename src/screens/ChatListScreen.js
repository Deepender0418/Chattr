import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

const ChatListScreen = ({ navigation }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchFriends();
  }, []);

const fetchFriends = async () => {
  try {
    const response = await api.get('/friends/profile');
    const friendsWithLastMessages = await Promise.all(
      (response.data.friends || []).map(async (friend) => {
        try {
          const chatId = generateChatId(user.id, friend._id);
          const messagesResponse = await api.get(`/messages/${chatId}?limit=1`);
          const lastMessage = messagesResponse.data[0];
          
          // Get unread count
          const unreadResponse = await api.get(`/messages/${chatId}`);
          const unreadCount = unreadResponse.data.filter(
            msg => msg.sender._id !== user.id && !msg.read
          ).length;
          
          return {
            ...friend,
            lastMessage: lastMessage ? {
              content: lastMessage.content,
              timestamp: lastMessage.timestamp,
              isCurrentUser: lastMessage.sender._id === user.id
            } : null,
            unreadCount
          };
        } catch (error) {
          console.error('Error fetching last message for friend:', friend.name, error);
          return { ...friend, lastMessage: null, unreadCount: 0 };
        }
      })
    );
    setFriends(friendsWithLastMessages);
  } catch (error) {
    Alert.alert('Error', 'Failed to load friends');
  } finally {
    setLoading(false);
  }
};
  const fetchUnreadCounts = async () => {
    try {
        const response = await api.get('/messages/unread/count');
        // You might want to store this in context or state
        return response.data.count;
    } catch (error) {
        console.error('Error fetching unread counts:', error);
        return 0;
    }
  };

  const startChat = (friend) => {
    navigation.navigate('Chat', { 
      otherUser: friend,
      chatId: generateChatId(user.id, friend._id)
    });
  };

  const generateChatId = (userId1, userId2) => {
    return [userId1, userId2].sort().join('_');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading friends...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileButtonText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {friends.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No friends yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Add friends using friend codes to start chatting!
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddFriend')}
          >
            <Text style={styles.addButtonText}>Add Your First Friend</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.userItem}
              onPress={() => startChat(item)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
                {item.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>
                      {item.unreadCount > 99 ? '99+' : item.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name || 'Unknown User'}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                {item.lastMessage && (
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage.isCurrentUser ? 'You: ' : ''}{item.lastMessage.content}
                  </Text>
                )}
              </View>
              <View style={styles.chatMeta}>
                {item.lastMessage && (
                  <Text style={styles.lastMessageTime}>
                    {new Date(item.lastMessage.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                )}
                <View style={[
                  styles.status, 
                  { backgroundColor: item.online ? '#4CAF50' : '#9E9E9E' }
                ]} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutText: {
    color: '#007AFF',
    fontSize: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: 'white',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  status: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    marginRight: 15,
  },
  profileButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  unreadBadge: {
  position: 'absolute',
  top: -5,
  right: -5,
  backgroundColor: '#FF3B30',
  borderRadius: 10,
  minWidth: 20,
  height: 20,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 2,
  borderColor: 'white',
},
unreadCount: {
  color: 'white',
  fontSize: 10,
  fontWeight: 'bold',
},
lastMessage: {
  fontSize: 14,
  color: '#666',
  marginTop: 2,
},
chatMeta: {
  alignItems: 'flex-end',
},
lastMessageTime: {
  fontSize: 12,
  color: '#999',
  marginBottom: 5,
},
});

export default ChatListScreen;