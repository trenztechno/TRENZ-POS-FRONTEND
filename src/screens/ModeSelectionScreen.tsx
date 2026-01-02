import React, { useEffect, useRef } from 'react';
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

type ModeSelectionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ModeSelection'>;
};

const ModeSelectionScreen: React.FC<ModeSelectionScreenProps> = ({
  navigation,
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const card1Scale = useRef(new Animated.Value(0.9)).current;
  const card2Scale = useRef(new Animated.Value(0.9)).current;
  const card3Scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Staggered animation for cards
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered scale animations
    Animated.stagger(150, [
      Animated.spring(card1Scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(card2Scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(card3Scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBillingMode = () => {
    navigation.navigate('Billing');
  };

  const handleAdminMode = () => {
    navigation.navigate('AdminPin');
  };

  const handleDashboardMode = () => {
    console.log('Dashboard Mode - Coming soon');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#C62828" />

      {/* Header */}
      <View style={styles.header}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={styles.businessName}>Saravaan's Tiffen Centre</Text>
          <Text style={styles.subtitle}>Select your mode to continue</Text>
        </Animated.View>
      </View>

      {/* Mode Cards */}
      <View style={styles.cardsContainer}>
        {/* Billing Mode */}
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: card1Scale }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.card, styles.billingCard]}
            onPress={handleBillingMode}
            activeOpacity={0.9}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.iconText}>💳</Text>
            </View>
            <Text style={styles.cardTitle}>Billing Mode</Text>
            <Text style={styles.cardDescription}>
              Quick checkout and bill generation
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Admin Mode */}
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: card2Scale }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.card, styles.adminCard]}
            onPress={handleAdminMode}
            activeOpacity={0.9}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.iconText}>⚙️</Text>
            </View>
            <Text style={styles.cardTitle}>Admin Mode</Text>
            <Text style={styles.cardDescription}>
              Manage items, settings, and reports
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Dashboard Mode */}
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: card3Scale }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.card, styles.dashboardCard]}
            onPress={handleDashboardMode}
            activeOpacity={0.9}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.iconText}>📊</Text>
            </View>
            <Text style={styles.cardTitle}>Dashboard</Text>
            <Text style={styles.cardDescription}>
              View sales analytics and insights
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Footer */}
      <Animated.View
        style={[
          styles.footer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.footerText}>Powered by TrenzTechnologies</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#C62828',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  businessName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 16,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  billingCard: {
    backgroundColor: '#4CAF50',
  },
  adminCard: {
    backgroundColor: '#2196F3',
  },
  dashboardCard: {
    backgroundColor: '#FF9800',
  },
  cardIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 36,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 22,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999999',
  },
});

export default ModeSelectionScreen;