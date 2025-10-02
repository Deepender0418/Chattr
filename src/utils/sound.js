class SoundManager {
  constructor() {
    this.soundEnabled = true;
    this.notificationSound = null;
    this.isReactNative = typeof navigator === 'undefined' || navigator.product === 'ReactNative';
  }

  async init() {
    if (this.isReactNative) {
      await this.initReactNativeSound();
    } else {
      this.createWebNotificationSound();
    }
  }

  async initReactNativeSound() {
    try {
      // For React Native, we'll use a simple beep using react-native-sound
      // You'll need to install: npm install react-native-sound
      if (this.isReactNative) {
        const Sound = require('react-native-sound');
        Sound.setCategory('Playback');
        
        // Load a simple beep sound
        this.notificationSound = new Sound('beep.wav', Sound.MAIN_BUNDLE, (error) => {
          if (error) {
            console.warn('Failed to load sound', error);
            this.createFallbackSound();
          }
        });
      }
    } catch (error) {
      console.warn('React Native sound initialization failed:', error);
      this.createFallbackSound();
    }
  }

  createWebNotificationSound() {
    try {
      // Create a simple beep sound for web using base64
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
    } catch (error) {
      console.warn('Web Audio API not supported, using fallback:', error);
      this.createFallbackSound();
    }
  }

  createFallbackSound() {
    // Fallback for when audio APIs are not available
    try {
      if (!this.isReactNative && typeof Audio !== 'undefined') {
        this.notificationSound = new Audio();
        // Simple beep sound using base64 encoded WAV
        this.notificationSound.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
      }
    } catch (error) {
      console.warn('Fallback sound creation failed:', error);
    }
  }

  playNotificationSound() {
    if (!this.soundEnabled) return;

    try {
      if (this.isReactNative && this.notificationSound) {
        this.notificationSound.play((success) => {
          if (!success) {
            console.warn('Sound playback failed');
          }
          this.notificationSound.setCurrentTime(0);
        });
      } else if (this.notificationSound instanceof Audio) {
        this.notificationSound.currentTime = 0;
        this.notificationSound.play().catch(e => {
          console.warn('Could not play notification sound:', e);
        });
      } else {
        // Use the web audio API method
        this.createWebNotificationSound();
      }
    } catch (error) {
      console.warn('Error playing notification sound:', error);
    }
  }

  enableSound() {
    this.soundEnabled = true;
  }

  disableSound() {
    this.soundEnabled = false;
  }

  // For mobile push notifications
  scheduleLocalNotification(title, message, data = {}) {
    if (this.isReactNative) {
      // Use react-native-push-notification
      // You'll need to install: npm install react-native-push-notification
      PushNotification.localNotification({
        channelId: "default-channel-id",
        title: title,
        message: message,
        playSound: this.soundEnabled,
        soundName: 'default',
        userInfo: data,
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: data.icon || '/default-avatar.png',
        tag: data.chatId, // Group notifications by chat
        requireInteraction: false,
      });
    }
  }
}

// Create singleton instance
const soundManager = new SoundManager();
export default soundManager;