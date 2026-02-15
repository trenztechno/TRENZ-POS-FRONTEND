import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableWithoutFeedback,
  Animated,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/business.types';
import { saveBusinessSettings } from '../services/storage';

type RestoreSuccessScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RestoreSuccess'>;
  route: RouteProp<RootStackParamList, 'RestoreSuccess'>;
};

const RestoreSuccessScreen: React.FC<RestoreSuccessScreenProps> = ({
  navigation,
  route,
}) => {
  const [isSaving, setIsSaving] = useState(true);
  const [restoreTime, setRestoreTime] = useState<string>('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

  const { fileName } = route.params || {};

  useEffect(() => {
    saveRestoreCompletion();
  }, []);

  useEffect(() => {
    if (!isSaving) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(checkmarkAnim, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSaving]);

  const saveRestoreCompletion = async () => {
    try {
      const timestamp = new Date().toISOString();
      setRestoreTime(formatTime(new Date()));

      // Save restore completion timestamp to database
      await saveBusinessSettings({
        last_restore_date: timestamp,
      });
    } catch (error) {
      console.error('Failed to save restore completion:', error);
      // Continue anyway - don't block user
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const handleTap = () => {
    navigation.navigate('AdminDashboard');
  };

  if (isSaving) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Finalizing restore...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TouchableWithoutFeedback onPress={handleTap}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Restore Data</Text>
            <Text style={styles.subtitle}>Restore from backup file</Text>
          </View>

          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <Animated.View
              style={[
                styles.successCircle,
                {
                  transform: [{ scale: checkmarkAnim }],
                },
              ]}
            >
              <View style={styles.checkmarkIcon}>
                <View style={styles.checkmarkStroke} />
              </View>
            </Animated.View>
          </View>

          {/* Success Messages */}
          <View style={styles.messageContainer}>
            <Text style={styles.successMessage}>Data restored successfully</Text>
            <Text style={styles.successDescription}>
              All data has been recovered from backup
            </Text>
            
            {fileName && (
              <Text style={styles.fileName}>File: {fileName}</Text>
            )}
            
            {restoreTime && (
              <Text style={styles.restoreTime}>Completed at {restoreTime}</Text>
            )}
          </View>

          {/* Tap to Continue Hint */}
          <Text style={styles.tapHint}>Tap anywhere to continue</Text>
        </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  loadingContainer: {
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    alignItems: 'center',
    width: '100%',
    gap: 32,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: 0.38,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    textAlign: 'center',
  },
  iconContainer: {
    width: 128,
    height: 128,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  successCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkIcon: {
    width: 64,
    height: 64,
    position: 'relative',
  },
  checkmarkStroke: {
    position: 'absolute',
    top: 24,
    left: 16,
    width: 32,
    height: 18,
    borderLeftWidth: 5.33,
    borderBottomWidth: 5.33,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
  },
  messageContainer: {
    alignItems: 'center',
    gap: 12,
  },
  successMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    letterSpacing: -0.31,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    textAlign: 'center',
  },
  fileName: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  restoreTime: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  tapHint: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 24,
  },
});

export default RestoreSuccessScreen;