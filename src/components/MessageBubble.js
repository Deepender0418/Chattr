import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const MessageBubble = ({message, isCurrentUser}) => {
  return (
    <View
      style={[
        styles.bubble,
        isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
      ]}>
      <Text style={isCurrentUser ? styles.currentUserText : styles.otherUserText}>
        {message.text}
      </Text>
      <Text style={styles.time}>
        {new Date(message.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginVertical: 2,
  },
  currentUserBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  otherUserBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  currentUserText: {
    color: 'white',
  },
  otherUserText: {
    color: 'black',
  },
  time: {
    fontSize: 10,
    color: 'gray',
    marginTop: 4,
  },
});

export default MessageBubble;