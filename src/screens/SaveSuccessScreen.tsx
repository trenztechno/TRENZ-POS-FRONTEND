import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableWithoutFeedback,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import DocIconGreen from '../assets/icons/DocIconGreen.svg';
import CheckWhite from '../assets/icons/CheckWhite.svg';
import { RootStackParamList } from '../types/business.types';
import { saveBusinessSettings } from '../services/storage';

type SaveSuccessScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SaveSuccess'>;
  route: RouteProp<RootStackParamList, 'SaveSuccess'>;
};

const SaveSuccessScreen: React.FC<SaveSuccessScreenProps> = ({ navigation, route }) => {
  const [isSaving, setIsSaving] = useState(true);
  const [saveTime, setSaveTime] = useState<string>('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

  const params = route.params as { fileName?: string; fileSize?: number; fileFormat?: string } | undefined;
  const { fileName, fileSize, fileFormat } = params || {
    fileName: undefined,
    fileSize: undefined,
    fileFormat: undefined,
  };

  useEffect(() => {
    savePdfExportInfo();
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

  const savePdfExportInfo = async () => {
    try {
      const timestamp = new Date().toISOString();
      setSaveTime(formatTime(new Date()));

      // Save PDF export timestamp to database
      await saveBusinessSettings({
        last_pdf_export_date: timestamp,
      });
    } catch (error) {
      console.error('Failed to save PDF export info:', error);
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

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleTap = () => {
    navigation.navigate('Dashboard');
  };

  if (isSaving) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Finalizing save...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.documentIconBackground}>
              <DocIconGreen width={64} height={64} />
            </View>

            <Animated.View
              style={[
                styles.checkmarkBadge,
                {
                  transform: [{ scale: checkmarkAnim }],
                },
              ]}
            >
              <CheckWhite width={24} height={24} />
            </Animated.View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Saved Successfully</Text>
          <Text style={styles.subtitle}>Bill summary saved as PDF</Text>

          {/* File Details Card */}
          <View style={styles.fileDetailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>File Name:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {fileName || 'bill-summary.pdf'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>File Size:</Text>
              <Text style={styles.detailValue}>
                {formatFileSize(fileSize)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Format:</Text>
              <Text style={styles.detailValue}>
                {fileFormat || 'PDF Document'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Saved At:</Text>
              <Text style={styles.detailValue}>
                {saveTime || 'Just now'}
              </Text>
            </View>
          </View>

          {/* Success Banner */}
          <View style={styles.successBanner}>
            <View style={styles.successIconContainer}>
              <CheckWhite width={24} height={24} />
            </View>

            <View style={styles.successTextContainer}>
              <Text style={styles.successTitle}>File saved to device</Text>
              <Text style={styles.successSubtitle}>Ready to share or print</Text>
            </View>
          </View>

          {/* Bottom Text */}
          <Text style={styles.bottomText}>Tap anywhere to continue</Text>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 128,
    height: 128,
    marginBottom: 16,
    position: 'relative',
  },
  documentIconBackground: {
    width: 112,
    height: 112,
    backgroundColor: '#F2F2F2',
    borderWidth: 1.81,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentIcon: {
    width: 64,
    height: 64,
    position: 'relative',
  },
  documentTop: {
    position: 'absolute',
    top: 5,
    left: 11,
    right: 11,
    height: 15,
    borderWidth: 4,
    borderColor: '#4CAF50',
    borderBottomWidth: 0,
  },
  documentCorner: {
    position: 'absolute',
    top: 5,
    right: 11,
    width: 16,
    height: 16,
    borderWidth: 4,
    borderColor: '#4CAF50',
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  documentLine1: {
    position: 'absolute',
    bottom: 12,
    left: 24,
    right: 24,
    height: 10,
    borderWidth: 4,
    borderColor: '#4CAF50',
    borderTopWidth: 0,
  },
  checkmarkBadge: {
    position: 'absolute',
    right: 0,
    top: -8,
    width: 40,
    height: 40,
    backgroundColor: '#4CAF50',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  checkmarkIcon: {
    width: 40,
    height: 40,
    position: 'relative',
  },
  checkmarkStroke: {
    position: 'absolute',
    top: 16,
    left: 6,
    width: 12,
    height: 6,
    borderLeftWidth: 4.17,
    borderBottomWidth: 4.17,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: -0.26,
    lineHeight: 33,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    letterSpacing: -0.31,
    lineHeight: 24,
    marginBottom: 24,
  },
  fileDetailsCard: {
    width: '100%',
    backgroundColor: '#E8F5E9',
    borderWidth: 0.6,
    borderColor: '#81C784',
    borderRadius: 16,
    padding: 21,
    gap: 12,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#2E7D32',
    letterSpacing: -0.15,
  },
  detailValue: {
    fontSize: 14,
    color: '#1B5E20',
    letterSpacing: -0.15,
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  successBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.81,
    borderColor: '#4CAF50',
    borderRadius: 16,
    padding: 18,
    gap: 12,
    marginBottom: 160,
  },
  successIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCheckmark: {
    width: 24,
    height: 24,
    position: 'relative',
  },
  successCheckmarkStroke: {
    position: 'absolute',
    top: 10,
    left: 4,
    width: 8,
    height: 4,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
  },
  successTextContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: 16,
    color: '#2E7D32',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#66BB6A',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  bottomText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    letterSpacing: -0.31,
    position: 'absolute',
    bottom: -120,
  },
});

export default SaveSuccessScreen;