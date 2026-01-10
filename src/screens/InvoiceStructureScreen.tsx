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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';
import { getBusinessSettings, saveBusinessSettings } from '../services/storage';

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

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadInvoiceStructure();
  }, []);

  useEffect(() => {
    if (!isLoading) {
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
    }
  }, [isLoading]);

  const loadInvoiceStructure = async () => {
    try {
      setIsLoading(true);
      const settings = await getBusinessSettings();
      
      if (settings) {
        setOptions(prevOptions =>
          prevOptions.map(option => ({
            ...option,
            enabled: settings[option.id] !== undefined ? settings[option.id] === 1 : option.enabled,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load invoice structure:', error);
      Alert.alert('Error', 'Failed to load invoice structure settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (id: string) => {
    setOptions(
      options.map((option) =>
        option.id === id ? { ...option, enabled: !option.enabled } : option
      )
    );
  };

  const handleApplyStructure = async () => {
    try {
      setIsSaving(true);

      // Convert options to database format
      const settingsData: any = {};
      options.forEach(option => {
        settingsData[option.id] = option.enabled ? 1 : 0;
      });

      // Save to database
      await saveBusinessSettings(settingsData);

      Alert.alert(
        'Success',
        'Invoice structure updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to save invoice structure:', error);
      Alert.alert('Error', 'Failed to save invoice structure. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#C62828" />
        <Text style={styles.loadingText}>Loading invoice structure...</Text>
      </View>
    );
  }

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
                disabled={isSaving}
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
              isSaving && styles.applyButtonDisabled,
            ]}
            onPress={handleApplyStructure}
            activeOpacity={0.9}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.applyButtonText}>Apply Structure</Text>
            )}
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
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
  applyButtonDisabled: {
    opacity: 0.6,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
});

export default InvoiceStructureScreen;