import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';
import Icon from 'react-native-vector-icons/Ionicons';

type BillFormatScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BillFormat'>;
};

interface BillFormatOption {
  id: string;
  title: string;
  subtitle: string;
  route?: 'BusinessDetails' | 'InvoiceFormat' | 'InvoiceStructure' | 'LogoUpload' | 'FooterNote' | 'BillNumbering';
  multiline?: boolean;
}

const BILL_FORMAT_OPTIONS: BillFormatOption[] = [
  {
    id: '1',
    title: 'Business Details',
    subtitle: 'Edit shop name, address, and contact details shown on the bill',
    route: 'BusinessDetails',
    multiline: true,
  },
  {
    id: '2',
    title: 'Invoice Format',
    subtitle: 'Choose how the bill layout looks',
    route: 'InvoiceFormat',
  },
  {
    id: '3',
    title: 'Invoice Structure',
    subtitle: 'Configure bill content order and fields',
    route: 'InvoiceStructure',
  },
  {
    id: '4',
    title: 'Logo Upload',
    subtitle: 'Add or change logos used in app and bill',
    route: 'LogoUpload',
    multiline: true,
  },
  {
    id: '5',
    title: 'Footer Note',
    subtitle: 'Add a thank-you message on the bill',
    route: 'FooterNote',
  },
  {
    id: '6',
    title: 'Bill Numbering',
    subtitle: 'Configure invoice number format',
    route: 'BillNumbering',
  },
];

const BillFormatScreen: React.FC<BillFormatScreenProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleOptionPress = (route?: BillFormatOption['route']) => {
    if (route) {
      // Handle each route explicitly
      switch (route) {
        case 'BusinessDetails':
          navigation.navigate('BusinessDetails');
          break;
        case 'InvoiceFormat':
          navigation.navigate('InvoiceFormat');
          break;
        case 'InvoiceStructure':
          navigation.navigate('InvoiceStructure');
          break;
        case 'LogoUpload':
          navigation.navigate('LogoUpload');
          break;
        case 'FooterNote':
          navigation.navigate('FooterNote');
          break;
        case 'BillNumbering':
          navigation.navigate('BillNumbering');
          break;
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.title}>Bill Format</Text>
          <Text style={styles.subtitle}>Configure bill layout and appearance</Text>
        </View>
      </View>

      {/* Options List */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {BILL_FORMAT_OPTIONS.map((option, index) => (
            <Animated.View
              key={option.id}
              style={[
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20 * (index + 1), 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  option.multiline && styles.optionCardMultiline,
                ]}
                onPress={() => handleOptionPress(option.route)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text
                      style={styles.optionSubtitle}
                      numberOfLines={option.multiline ? 2 : 1}
                    >
                      {option.subtitle}
                    </Text>
                  </View>

                  <Icon name="chevron-forward" size={20} color="#999999" />
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
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
  headerText: {},
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
    letterSpacing: 0.38,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 21,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 21,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 93,
    justifyContent: 'center',
  },
  optionCardMultiline: {
    minHeight: 117,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
    letterSpacing: -0.44,
    lineHeight: 27,
  },
  optionSubtitle: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
});

export default BillFormatScreen;