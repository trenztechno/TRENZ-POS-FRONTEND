import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated, Easing} from 'react-native';

interface ProgressIndicatorProps {
  progress: number;
  size?: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  size = 120,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const progressValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Continuous rotation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    // Animate progress number
    Animated.timing(progressValue, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        {
          width: size, 
          height: size,
          transform: [{scale: scaleValue}],
        }
      ]}>
      <Animated.View style={[styles.spinner, {transform: [{rotate: spin}]}]}>
        <View style={[styles.arc, {width: size, height: size}]} />
      </Animated.View>
      <View style={styles.textContainer}>
        <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  spinner: {
    position: 'absolute',
  },
  arc: {
    borderRadius: 1000,
    borderWidth: 6,
    borderColor: '#ffe0e0',
    borderTopColor: '#c62828',
    borderRightColor: '#c62828',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#c62828',
  },
});

export default ProgressIndicator;