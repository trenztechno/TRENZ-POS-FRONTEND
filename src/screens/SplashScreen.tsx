import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet, Animated, Text} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import StoreIcon from '../assets/icons/store.svg';
import type {RootStackParamList} from '../types/business.types';
import { getBusinessSettings, saveBusinessSettings } from '../services/storage';

type SplashScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

const LoadingDot: React.FC<{delay: number}> = ({delay}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          transform: [{scale: scaleAnim}],
          opacity: opacityAnim,
        },
      ]}
    />
  );
};

const SplashScreen: React.FC<SplashScreenProps> = ({navigation}) => {
  const [businessName, setBusinessName] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  const iconScale = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const businessNameOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkBusinessSetup();
    startAnimations();
  }, []);

  useEffect(() => {
    if (isReady) {
      scheduleNavigation();
    }
  }, [isReady]);

  const checkBusinessSetup = async () => {
    try {
      const settings = await getBusinessSettings();
      
      // Track app launch
      const launchCount = (settings?.app_launch_count || 0) + 1;
      const timestamp = new Date().toISOString();
      
      await saveBusinessSettings({
        app_launch_count: launchCount,
        last_app_launch: timestamp,
      });

      // Get business name if set up
      if (settings?.business_name) {
        setBusinessName(settings.business_name);
        
        // Animate business name
        setTimeout(() => {
          Animated.timing(businessNameOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        }, 1200);
      }

      setIsReady(true);
    } catch (error) {
      console.error('Failed to check business setup:', error);
      // Continue anyway
      setIsReady(true);
    }
  };

  const startAnimations = () => {
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(800),
      Animated.timing(dotsOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const scheduleNavigation = () => {
    const navigationTimeout = setTimeout(async () => {
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        navigateToAppropriateScreen();
      });
    }, 3000);

    return () => clearTimeout(navigationTimeout);
  };

  const navigateToAppropriateScreen = async () => {
    try {
      const settings = await getBusinessSettings();
      
      // Check if business is set up
      const isBusinessSetup = settings?.business_name && settings.business_name.length > 0;
      
      if (isBusinessSetup) {
        // Business is set up - go to mode selection
        navigation.replace('ModeSelection');
      } else {
        // Business not set up - go to welcome/onboarding
        navigation.replace('Welcome');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Default to welcome screen
      navigation.replace('Welcome');
    }
  };

  return (
    <Animated.View style={[styles.container, {opacity: fadeOut}]}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: iconOpacity,
              transform: [{scale: iconScale}],
            },
          ]}>
          <View style={styles.iconShadow}>
            <StoreIcon width={96} height={96} />
          </View>
        </Animated.View>

        {businessName ? (
          <Animated.View style={[styles.businessNameContainer, {opacity: businessNameOpacity}]}>
            <Text style={styles.businessName}>{businessName}</Text>
          </Animated.View>
        ) : null}

        <Animated.View style={[styles.dotsContainer, {opacity: dotsOpacity}]}>
          <LoadingDot delay={0} />
          <LoadingDot delay={200} />
          <LoadingDot delay={400} />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  businessNameContainer: {
    marginBottom: 24,
  },
  businessName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: -0.3,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C62828',
  },
});

export default SplashScreen;