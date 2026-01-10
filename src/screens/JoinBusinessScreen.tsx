import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AnimatedButton from '../components/AnimatedButton';
import type {RootStackParamList} from '../types/business.types';
import { getBusinessSettings, saveBusinessSettings } from '../services/storage';

type JoinBusinessScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'JoinBusiness'>;
};

const JoinBusinessScreen: React.FC<JoinBusinessScreenProps> = ({navigation}) => {
  const [businessCode, setBusinessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(20)).current;
  const inputOpacity = useRef(new Animated.Value(0)).current;
  const inputTranslateY = useRef(new Animated.Value(20)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(new Animated.Value(20)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Title animation
    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(titleTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Subtitle animation
    Animated.sequence([
      Animated.delay(250),
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(subtitleTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Input animation
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(inputOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(inputTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Buttons animation
    Animated.sequence([
      Animated.delay(550),
      Animated.parallel([
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(buttonsTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Footer animation
    Animated.sequence([
      Animated.delay(700),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (errorMessage) {
      errorOpacity.setValue(0);
      Animated.timing(errorOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [errorMessage]);

  const handleJoinBusiness = async () => {
    if (!businessCode.trim()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // TODO: Replace with actual API call to verify business code
      // const response = await fetch(`${API_URL}/business/verify`, {
      //   method: 'POST',
      //   body: JSON.stringify({ code: businessCode }),
      // });
      
      // For now, simulate API validation
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));
      
      // Mock validation - in production, this should verify with your backend
      if (businessCode.length >= 6) {
        // Save business code to local database
        await saveBusinessSettings({
          business_code: businessCode.trim(),
        });

        setIsLoading(false);
        
        // Successfully joined - navigate to mode selection
        navigation.navigate('ModeSelection');
      } else {
        setIsLoading(false);
        setErrorMessage('Invalid Code. Must be at least 6 characters.');
      }
    } catch (error) {
      console.error('Failed to join business:', error);
      setIsLoading(false);
      setErrorMessage('Failed to join business. Please try again.');
    }
  };

  const handleScanQR = () => {
    Alert.alert(
      'QR Scanner',
      'QR code scanning will be implemented in a future update.',
      [{ text: 'OK' }]
    );
    // TODO: Implement QR scanner
    // navigation.navigate('QRScanner');
  };

  const handleCreateNew = () => {
    navigation.navigate('BusinessSetup1');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        {/* Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{translateY: titleTranslateY}],
            },
          ]}>
          <Text style={styles.title}>Join Business</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View
          style={[
            styles.subtitleContainer,
            {
              opacity: subtitleOpacity,
              transform: [{translateY: subtitleTranslateY}],
            },
          ]}>
          <Text style={styles.subtitle}>
            Enter the business code provided by your admin
          </Text>
        </Animated.View>

        {/* Input Field */}
        <Animated.View
          style={[
            styles.inputContainer,
            {
              opacity: inputOpacity,
              transform: [{translateY: inputTranslateY}],
            },
          ]}>
          <Text style={styles.label}>Business Code</Text>
          <TextInput
            style={[
              styles.input,
              errorMessage && styles.inputError,
            ]}
            placeholder="Enter 6+ character code"
            placeholderTextColor="#999"
            value={businessCode}
            onChangeText={(text) => {
              setBusinessCode(text);
              setErrorMessage('');
            }}
            autoCapitalize="characters"
            maxLength={20}
            editable={!isLoading}
          />
          {errorMessage ? (
            <Animated.View style={{opacity: errorOpacity}}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </Animated.View>
          ) : null}
        </Animated.View>

        {/* Buttons */}
        <Animated.View
          style={[
            styles.buttonsContainer,
            {
              opacity: buttonsOpacity,
              transform: [{translateY: buttonsTranslateY}],
            },
          ]}>
          <AnimatedButton
            title={isLoading ? 'Joining...' : 'Join Business'}
            onPress={handleJoinBusiness}
            variant="primary"
            disabled={!businessCode.trim() || isLoading}
            loading={isLoading}
          />

          <Text style={styles.orText}>OR</Text>

          <AnimatedButton
            title="Scan QR Code"
            onPress={handleScanQR}
            variant="secondary"
            disabled={isLoading}
          />
        </Animated.View>
      </View>

      {/* Footer */}
      <Animated.View
        style={[
          styles.footerContainer,
          {opacity: footerOpacity},
        ]}>
        <Text style={styles.footerText}>Don't have a business yet?</Text>
        <TouchableOpacity onPress={handleCreateNew} disabled={isLoading}>
          <Text style={styles.footerLink}>Create New Business</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  titleContainer: {
    marginBottom: 8,
  },
  title: {
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 42,
    letterSpacing: 0.38,
    color: '#333333',
  },
  subtitleContainer: {
    marginBottom: 32,
  },
  subtitle: {
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.31,
    color: '#666666',
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  input: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  buttonsContainer: {
    gap: 16,
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#999999',
    marginVertical: 8,
  },
  footerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C62828',
  },
});

export default JoinBusinessScreen;