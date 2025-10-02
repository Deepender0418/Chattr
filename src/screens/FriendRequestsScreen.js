import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import api from '../config/api';

const FriendRequestsScreen = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const fetchFriendRequests = async () => {
    try {
      const response = await api.get('/friends/friend-requests');
      setRequests(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load friend requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await api.post('/friends/friend-request/accept', { requestId });
      Alert.alert('Success', 'Friend request accepted!');
      fetchFriendRequests(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.post('/friends/friend-request/reject', { requestId });
      Alert.alert('Success', 'Friend request rejected');
      fetchFriendRequests(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to reject friend request');
    }
  };

  const renderRequest = ({ item }) => (
    <View style={styles.requestItem}>
      <Image
        source={{ uri: item.from.avatar || 'https://via.placeholder.com/50' }}
        style={styles.avatar}
      />
      <View style={styles.requestInfo}>
        <Text style={styles.userName}>{item.from.name}</Text>
        <Text style={styles.userEmail}>{item.from.email}</Text>
        <Text style={styles.requestDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAccept(item._id)}
        >
          <Text style={styles.actionButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleReject(item._id)}
        >
          <Text style={styles.actionButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friend Requests</Text>
      </View>

      {requests.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No pending friend requests</Text>
        </View>
      ) : (
        <FlatList
          data={requests.filter(req => req.status === 'pending')}
          keyExtractor={(item) => item._id}
          renderItem={renderRequest}
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
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  requestInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  requestDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default FriendRequestsScreen;