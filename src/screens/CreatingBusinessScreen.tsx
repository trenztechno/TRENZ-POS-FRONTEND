import React, {useEffect, useState, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import ProgressIndicator from '../components/ProgressIndicator';
import type {RootStackParamList} from '../types/business.types';

type CreatingBusinessScreenProps = NativeStackScreenProps<RootStackParamList, 'CreatingBusiness'>;

const CreatingBusinessScreen: React.FC<CreatingBusinessScreenProps> = ({
  navigation,
  route,
}) => {
  const {businessData} = route.params;
  const [progress, setProgress] = useState(0);
  
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;
  const progressScale = useRef(new Animated.Value(0.8)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    // Title animation
    Animated.sequence([
      Animated.delay(200),
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

    // Progress indicator animation
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(progressOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(progressScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Subtitle animation
    Animated.sequence([
      Animated.delay(600),
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

    // Simulate business creation progress
    const intervals = [
      {delay: 0, progress: 15},
      {delay: 500, progress: 35},
      {delay: 1000, progress: 55},
      {delay: 1500, progress: 75},
      {delay: 2000, progress: 90},
      {delay: 2500, progress: 100},
    ];

    intervals.forEach(({delay, progress: prog}) => {
      setTimeout(() => {
        setProgress(prog);
      }, delay);
    });

    // Navigate to success screen after completion
    const completeTimeout = setTimeout(() => {
      console.log('Business created:', businessData);
      navigation.replace('Success', {
        businessName: businessData.businessName,
      });
    }, 3500);

    return () => {
      clearTimeout(completeTimeout);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{translateY: titleTranslateY}],
          }}>
          <Text style={styles.title}>Creating Business</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.progressContainer,
            {
              opacity: progressOpacity,
              transform: [{scale: progressScale}],
            },
          ]}>
          <ProgressIndicator progress={progress} size={140} />
        </Animated.View>

        <Animated.View
          style={{
            opacity: subtitleOpacity,
            transform: [{translateY: subtitleTranslateY}],
          }}>
          <Text style={styles.subtitle}>Preparing your workspace...</Text>
          <Text style={styles.description}>This may take a few seconds</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c2c2c',
    marginBottom: 60,
  },
  progressContainer: {
    marginBottom: 60,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c2c2c',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default CreatingBusinessScreen;