import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
  Switch,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';

type InvoiceStructureScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'InvoiceStructure'>;
};

interface StructureOption {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const InvoiceStructureScreen: React.FC<InvoiceStructureScreenProps> = ({ navigation }) => {
  const [options, setOptions] = useState<StructureOption[]>([
    {
      id: 'gst_breakdown',
      title: 'Show GST Breakdown',
      description: 'Display tax breakdown on bill',
      enabled: true,
    },
    {
      id: 'item_tax_split',
      title: 'Show Item Tax Split',
      description: 'Show tax per item',
      enabled: false,
    },
    {
      id: 'total_quantity',
      title: 'Show Total Quantity',
      description: 'Display total item count',
      enabled: true,
    },
    {
      id: 'payment_method',
      title: 'Show Payment Method',
      description: 'Display how customer paid',
      enabled: true,
    },
  ]);

  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

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

  const handleToggle = (id: string) => {
    setOptions(
      options.map((option) =>
        option.id === id ? { ...option, enabled: !option.enabled } : option
      )
    );
    // Reset applied state when settings change
    setIsApplied(false);
  };

  const handleApplyStructure = async () => {
    setIsApplying(true);

    // Simulate API call
    setTimeout(() => {
      setIsApplying(false);
      setIsApplied(true);
      
      // Auto-hide success state after 2 seconds
      setTimeout(() => {
        setIsApplied(false);
      }, 2000);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>Invoice Structure</Text>
            <Text style={styles.subtitle}>Configure bill content and fields</Text>
          </View>
        </Animated.View>

        {/* Options Container */}
        <Animated.View
          style={[
            styles.optionsContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {options.map((option, index) => (
            <View
              key={option.id}
              style={[
                styles.optionRow,
                index < options.length - 1 && styles.optionRowBorder,
              ]}
            >
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>

              <Switch
                value={option.enabled}
                onValueChange={() => handleToggle(option.id)}
                trackColor={{ false: '#E0E0E0', true: '#C62828' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E0E0E0"
              />
            </View>
          ))}
        </Animated.View>

        {/* Apply Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.applyButton,
              isApplying && styles.applyButtonApplying,
              isApplied && styles.applyButtonApplied,
            ]}
            onPress={handleApplyStructure}
            activeOpacity={0.9}
            disabled={isApplying || isApplied}
          >
            <Text
              style={[
                styles.applyButtonText,
                isApplied && styles.applyButtonTextApplied,
              ]}
            >
              {isApplying ? 'Applying...' : isApplied ? 'Applied Successfully' : 'Apply Structure'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 48,
    gap: 24,
  },
  header: {
    gap: 12,
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
  headerText: {},
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
    letterSpacing: 0.38,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  optionsContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 21,
    paddingBottom: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    gap: 16,
  },
  optionRowBorder: {
    borderBottomWidth: 0.6,
    borderBottomColor: '#E0E0E0',
  },
  optionInfo: {
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
  optionDescription: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 8,
  },
  applyButton: {
    backgroundColor: '#C62828',
    height: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonApplying: {
    backgroundColor: '#EF9A9A',
  },
  applyButtonApplied: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  applyButtonTextApplied: {
    color: '#4CAF50',
  },
});

export default InvoiceStructureScreen;