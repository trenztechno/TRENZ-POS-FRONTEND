import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';

type AdminPinScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AdminPin'>;
};

const CORRECT_PIN = '1234'; // Demo PIN

const AdminPinScreen: React.FC<AdminPinScreenProps> = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;
  const numpadAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance
    Animated.stagger(150, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(dotsAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(numpadAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (pin.length === 4) {
      // Check PIN
      if (pin === CORRECT_PIN) {
        navigation.replace('AdminDashboard');
      } else {
        // Shake animation
        setError(true);
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 500);
        });
      }
    }
  }, [pin]);

  const handleNumberPress = (num: string) => {
    if (pin.length < 4) {
      setPin(pin + num);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderDot = (index: number) => {
    const filled = pin.length > index;
    return (
      <View
        key={index}
        style={[
          styles.dot,
          filled && styles.dotFilled,
          error && styles.dotError,
        ]}
      />
    );
  };

  const renderNumberButton = (num: string) => (
    <TouchableOpacity
      key={num}
      style={styles.numButton}
      onPress={() => handleNumberPress(num)}
      activeOpacity={0.7}
    >
      <Text style={styles.numButtonText}>{num}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Back Button */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Animated.View
          style={{
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          <Text style={styles.title}>Enter Admin PIN</Text>
          <Text style={styles.subtitle}>Enter your 4-digit PIN to continue</Text>
        </Animated.View>

        {/* PIN Dots */}
        <Animated.View
          style={[
            styles.dotsContainer,
            {
              opacity: dotsAnim,
              transform: [
                {
                  scale: dotsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          {[0, 1, 2, 3].map(renderDot)}
        </Animated.View>

        {error && (
          <Animated.Text
            style={[
              styles.errorText,
              {
                opacity: dotsAnim,
              },
            ]}
          >
            Incorrect PIN. Try again.
          </Animated.Text>
        )}

        {/* Number Pad */}
        <Animated.View
          style={[
            styles.numpad,
            {
              opacity: numpadAnim,
              transform: [
                {
                  translateY: numpadAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.numRow}>
            {['1', '2', '3'].map(renderNumberButton)}
          </View>
          <View style={styles.numRow}>
            {['4', '5', '6'].map(renderNumberButton)}
          </View>
          <View style={styles.numRow}>
            {['7', '8', '9'].map(renderNumberButton)}
          </View>
          <View style={styles.numRow}>
            <View style={styles.numButton} />
            {renderNumberButton('0')}
            <TouchableOpacity
              style={styles.numButton}
              onPress={handleBackspace}
              activeOpacity={0.7}
            >
              <Text style={styles.backspaceText}>⌫</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backArrow: {
    fontSize: 20,
    fontWeight: '600',
    color: '#C62828',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C62828',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 60,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  dotFilled: {
    backgroundColor: '#C62828',
    borderColor: '#C62828',
  },
  dotError: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 40,
  },
  numpad: {
    flex: 1,
    justifyContent: 'center',
    maxHeight: 400,
  },
  numRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 20,
  },
  numButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
  },
  backspaceText: {
    fontSize: 24,
    color: '#666666',
  },
});

export default AdminPinScreen;