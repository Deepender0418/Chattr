import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../config/api';

const AddFriendScreen = ({ navigation }) => {
  const [friendCode, setFriendCode] = useState('');
  const [loading, setLoading] = useState(false);

  const sendFriendRequest = async () => {
    if (!friendCode.trim()) {
      Alert.alert('Error', 'Please enter a friend code');
      return;
    }

    setLoading(true);
    try {
      await api.post('/friends/friend-request', { friendCode });
      Alert.alert('Success', 'Friend request sent successfully!');
      setFriendCode('');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Friend</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Ask your friend for their friend code and enter it below to send them a friend request.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter friend code (e.g., A1B2C3D4)"
          value={friendCode}
          onChangeText={setFriendCode}
          autoCapitalize="characters"
          maxLength={8}
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={sendFriendRequest}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Send Friend Request</Text>
          )}
        </TouchableOpacity>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Tips:</Text>
          <Text style={styles.tip}>• Friend codes are 8 characters long</Text>
          <Text style={styles.tip}>• You can find your friend code in your profile</Text>
          <Text style={styles.tip}>• Both users need to accept to become friends</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tips: {
    marginTop: 40,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tip: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default AddFriendScreen;