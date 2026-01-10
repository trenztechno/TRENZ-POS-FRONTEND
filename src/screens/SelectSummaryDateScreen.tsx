import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CalenderIcon from '../assets/icons/CalenderIcon.svg';
import { RootStackParamList } from '../types/business.types';
import { getBusinessSettings, saveBusinessSettings } from '../services/storage';

type SelectSummaryDateScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SelectSummaryDate'>;
};

type DateRangeOption = 'today' | 'yesterday' | 'last7days' | 'custom';

const SelectSummaryDateScreen: React.FC<SelectSummaryDateScreenProps> = ({ navigation }) => {
  const [selectedRange, setSelectedRange] = useState<DateRangeOption | null>(null);
  const [customDays, setCustomDays] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadLastPreference();
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

  const loadLastPreference = async () => {
    try {
      setIsLoading(true);
      const settings = await getBusinessSettings();
      
      if (settings) {
        // Load last selected date range preference
        if (settings.last_summary_range) {
          setSelectedRange(settings.last_summary_range as DateRangeOption);
        }
        
        // Load last custom days value
        if (settings.last_summary_custom_days) {
          setCustomDays(settings.last_summary_custom_days.toString());
        }
      }
    } catch (error) {
      console.error('Failed to load summary preferences:', error);
      // Continue with defaults
    } finally {
      setIsLoading(false);
    }
  };

  const handleRangeSelect = (range: DateRangeOption) => {
    setSelectedRange(range);
    if (range !== 'custom') {
      setCustomDays('');
    }
  };

  const handleApply = async () => {
    try {
      setIsSaving(true);

      // Save user's preference to database
      const saveData: {
        last_summary_range: string;
        last_summary_custom_days?: number;
        last_summary_date: string;
      } = {
        last_summary_range: selectedRange || 'today',
        last_summary_date: new Date().toISOString(),
      };

      // Save custom days if applicable
      if (selectedRange === 'custom' && customDays) {
        saveData.last_summary_custom_days = parseInt(customDays, 10);
      }

      await saveBusinessSettings(saveData);

      // Navigate to downloading screen
      navigation.navigate('DownloadingSummary', {
        dateRange: selectedRange || 'today',
        customDays: customDays || undefined,
      });
    } catch (error) {
      console.error('Failed to save summary preferences:', error);
      // Continue with navigation even if save fails
      navigation.navigate('DownloadingSummary', {
        dateRange: selectedRange || 'today',
        customDays: customDays || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isApplyEnabled = selectedRange !== null && (selectedRange !== 'custom' || customDays !== '');

  const getSummaryText = () => {
    if (selectedRange === 'custom' && customDays) {
      return `Summary will include last ${customDays} days`;
    }
    return '';
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#C62828" />
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

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
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.title}>Select Summary Date</Text>
          <Text style={styles.subtitle}>Choose date range for bill summary</Text>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Calendar Icon */}
        <View style={styles.calendarIconContainer}>
          <View style={styles.calendarIcon}>
            <CalenderIcon width={40} height={40} />
          </View>
        </View>

        {/* Date Range Options */}
        <View style={styles.optionsContainer}>
          {/* Today */}
          <TouchableOpacity
            style={[
              styles.optionButton,
              selectedRange === 'today' && styles.optionButtonSelected,
            ]}
            onPress={() => handleRangeSelect('today')}
            activeOpacity={0.9}
            disabled={isSaving}
          >
            <View
              style={[
                styles.radioOuter,
                selectedRange === 'today' && styles.radioOuterSelected,
              ]}
            >
              {selectedRange === 'today' && <View style={styles.radioInner} />}
            </View>

            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, selectedRange === 'today' && styles.optionTitleSelected]}>
                Today
              </Text>
              <Text style={styles.optionSubtitle}>Current day summary</Text>
            </View>

            <Text
              style={[
                styles.arrowIcon,
                selectedRange === 'today' && styles.arrowIconSelected,
              ]}
            >
              ›
            </Text>
          </TouchableOpacity>

          {/* Yesterday */}
          <TouchableOpacity
            style={[
              styles.optionButton,
              selectedRange === 'yesterday' && styles.optionButtonSelected,
            ]}
            onPress={() => handleRangeSelect('yesterday')}
            activeOpacity={0.9}
            disabled={isSaving}
          >
            <View
              style={[
                styles.radioOuter,
                selectedRange === 'yesterday' && styles.radioOuterSelected,
              ]}
            >
              {selectedRange === 'yesterday' && <View style={styles.radioInner} />}
            </View>

            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, selectedRange === 'yesterday' && styles.optionTitleSelected]}>
                Yesterday
              </Text>
              <Text style={styles.optionSubtitle}>Previous day summary</Text>
            </View>

            <Text
              style={[
                styles.arrowIcon,
                selectedRange === 'yesterday' && styles.arrowIconSelected,
              ]}
            >
              ›
            </Text>
          </TouchableOpacity>

          {/* Last 7 Days */}
          <TouchableOpacity
            style={[
              styles.optionButton,
              selectedRange === 'last7days' && styles.optionButtonSelected,
            ]}
            onPress={() => handleRangeSelect('last7days')}
            activeOpacity={0.9}
            disabled={isSaving}
          >
            <View
              style={[
                styles.radioOuter,
                selectedRange === 'last7days' && styles.radioOuterSelected,
              ]}
            >
              {selectedRange === 'last7days' && <View style={styles.radioInner} />}
            </View>

            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, selectedRange === 'last7days' && styles.optionTitleSelected]}>
                Last 7 Days
              </Text>
              <Text style={styles.optionSubtitle}>Weekly summary</Text>
            </View>

            <Text
              style={[
                styles.arrowIcon,
                selectedRange === 'last7days' && styles.arrowIconSelected,
              ]}
            >
              ›
            </Text>
          </TouchableOpacity>

          {/* Custom Range */}
          <TouchableOpacity
            style={[
              styles.optionButton,
              selectedRange === 'custom' && styles.optionButtonSelected,
            ]}
            onPress={() => handleRangeSelect('custom')}
            activeOpacity={0.9}
            disabled={isSaving}
          >
            <View
              style={[
                styles.radioOuter,
                selectedRange === 'custom' && styles.radioOuterSelected,
              ]}
            >
              {selectedRange === 'custom' && <View style={styles.radioInner} />}
            </View>

            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, selectedRange === 'custom' && styles.optionTitleSelected]}>
                Custom Range
              </Text>
              <Text style={styles.optionSubtitle}>Choose number of days</Text>
            </View>

            <Text
              style={[
                styles.arrowIcon,
                selectedRange === 'custom' && styles.arrowIconSelected,
              ]}
            >
              ›
            </Text>
          </TouchableOpacity>

          {/* Custom Input */}
          {selectedRange === 'custom' && (
            <View style={styles.customInputContainer}>
              <Text style={styles.inputLabel}>Enter number of days</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.numberInput}
                  value={customDays}
                  onChangeText={setCustomDays}
                  placeholder="5"
                  placeholderTextColor="rgba(51, 51, 51, 0.5)"
                  keyboardType="numeric"
                  editable={!isSaving}
                />
                <Text style={styles.daysLabel}>Days</Text>
              </View>
              {customDays && (
                <Text style={styles.summaryText}>{getSummaryText()}</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.applyButton,
            (!isApplyEnabled || isSaving) && styles.applyButtonDisabled,
          ]}
          onPress={handleApply}
          disabled={!isApplyEnabled || isSaving}
          activeOpacity={0.9}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.applyButtonText}>Apply</Text>
          )}
        </TouchableOpacity>
      </View>
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 55,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.6,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C62828',
    lineHeight: 21,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: 0.38,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  scrollContent: {
    padding: 0,
    paddingBottom: 100,
    alignItems: 'center',
    gap: 22,
  },
  calendarIconContainer: {
    marginTop: 22,
  },
  calendarIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#FEF2F2',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  calendarTop: {
    position: 'absolute',
    top: 18,
    left: 20,
    right: 20,
    height: 12,
    borderWidth: 3.33,
    borderColor: '#C62828',
    borderBottomWidth: 0,
  },
  calendarBottom: {
    position: 'absolute',
    bottom: 18,
    left: 20,
    right: 20,
    height: 22,
    borderWidth: 3.33,
    borderColor: '#C62828',
  },
  optionsContainer: {
    paddingHorizontal: 16,
    gap: 12,
    width: '100%',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.81,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    gap: 12,
  },
  optionButtonSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#C62828',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.81,
    borderColor: '#999999',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#C62828',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C62828',
  },
  optionTextContainer: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  optionTitleSelected: {
    color: '#C62828',
  },
  optionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
    letterSpacing: -0.15,
    lineHeight: 20,
  },
  arrowIcon: {
    fontSize: 20,
    color: '#999999',
    lineHeight: 20,
  },
  arrowIconSelected: {
    color: '#C62828',
  },
  customInputContainer: {
    backgroundColor: '#F2F2F2',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 21,
    gap: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    letterSpacing: -0.15,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  numberInput: {
    flex: 1,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.81,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
    letterSpacing: -0.31,
  },
  daysLabel: {
    fontSize: 16,
    color: '#666666',
    letterSpacing: -0.31,
  },
  summaryText: {
    fontSize: 15,
    color: '#999999',
    textAlign: 'center',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.6,
    borderTopColor: '#E0E0E0',
    padding: 16,
  },
  applyButton: {
    height: 52,
    backgroundColor: '#C62828',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  applyButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.31,
  },
});

export default SelectSummaryDateScreen;