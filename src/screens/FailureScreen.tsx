import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Svg, {Path, Circle} from 'react-native-svg';
import AnimatedButton from '../components/AnimatedButton';
import type {RootStackParamList} from '../types/business.types';

type SetupFailureScreenProps = NativeStackScreenProps<RootStackParamList, 'SetupFailure'>;

const ErrorIcon = () => (
  <Svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <Circle cx="32" cy="32" r="32" fill="#EF4444" />
    <Path
      d="M24 24L40 40M40 24L24 40"
      stroke="#FFFFFF"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SetupFailureScreen: React.FC<SetupFailureScreenProps> = ({navigation, route}) => {
  const {error} = route.params;
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

  const handleTryAgain = () => {
    navigation.navigate('BusinessSetup1');
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
          <ErrorIcon />
        </View>
        
        <Text style={styles.title}>Setup Failed</Text>
        <Text style={styles.subtitle}>
          {error || 'Something went wrong. Please try again.'}
        </Text>

        <View style={styles.buttonContainer}>
          <AnimatedButton
            title="Try Again"
            onPress={handleTryAgain}
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

export default SetupFailureScreen;