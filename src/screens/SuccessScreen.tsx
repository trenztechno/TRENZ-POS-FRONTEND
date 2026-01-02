import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Svg, {Path, Circle} from 'react-native-svg';
import AnimatedButton from '../components/AnimatedButton';
import type {RootStackParamList} from '../types/business.types';

type SetupSuccessScreenProps = NativeStackScreenProps<RootStackParamList, 'SetupSuccess'>;

const CheckIcon = () => (
  <Svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <Circle cx="32" cy="32" r="32" fill="#10B981" />
    <Path
      d="M20 32L28 40L44 24"
      stroke="#FFFFFF"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SetupSuccessScreen: React.FC<SetupSuccessScreenProps> = ({navigation}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    navigation.navigate('ModeSelection');
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <View style={styles.iconContainer}>
          <CheckIcon />
        </View>
        
        <Text style={styles.title}>Business Setup Complete!</Text>
        <Text style={styles.subtitle}>
          Your business profile has been created successfully
        </Text>

        <View style={styles.buttonContainer}>
          <AnimatedButton
            title="Continue"
            onPress={handleContinue}
            variant="primary"
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c2c2c',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 24,
  },
  buttonContainer: {
    width: '100%',
  },
});

export default SetupSuccessScreen;