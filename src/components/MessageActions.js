// src/components/MessageActions.js
import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const MessageActions = ({ message, isCurrentUser, onReply, onClose }) => {
  const { user } = useAuth();
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
    // For web
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message.content);
    }
    // For React Native, you'd use Clipboard from react-native
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
            // Implement delete functionality
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
        styles.container,
        {
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        },
      ]}
    >
      <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
        <Text style={styles.actionText}>Copy</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton} onPress={handleReply}>
        <Text style={styles.actionText}>Reply</Text>
      </TouchableOpacity>
      
      {isCurrentUser && (
        <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity style={styles.actionButton} onPress={onClose}>
        <Text style={styles.actionText}>Cancel</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionText: {
    fontSize: 16,
    color: '#007AFF',
  },
  deleteText: {
    color: '#FF3B30',
  },
});

export default MessageActions;