import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';
import Icon from 'react-native-vector-icons/Ionicons';
import { getBusinessSettings, saveBusinessSettings } from '../services/storage';

type InvoiceFormatScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'InvoiceFormat'>;
};

interface InvoiceFormat {
  id: string;
  title: string;
  description: string;
  previewText: string;
}

const INVOICE_FORMATS: InvoiceFormat[] = [
  {
    id: 'classic',
    title: 'Classic',
    description: 'Traditional bill layout with clean spacing',
    previewText: 'Preview',
  },
  {
    id: 'compact',
    title: 'Compact',
    description: 'Space-saving layout for smaller receipts',
    previewText: 'Preview',
  },
  {
    id: 'detailed',
    title: 'Detailed',
    description: 'Comprehensive layout with all information',
    previewText: 'Preview',
  },
  {
    id: 'modern',
    title: 'Modern',
    description: 'Contemporary design with enhanced visuals',
    previewText: 'Preview',
  },
];

const InvoiceFormatScreen: React.FC<InvoiceFormatScreenProps> = ({ navigation }) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('classic');
  const [appliedFormat, setAppliedFormat] = useState<string>('classic');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadInvoiceFormat();
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

  const loadInvoiceFormat = async () => {
    try {
      setIsLoading(true);
      const settings = await getBusinessSettings();
      
      if (settings && settings.invoice_format) {
        setSelectedFormat(settings.invoice_format);
        setAppliedFormat(settings.invoice_format);
      }
    } catch (error) {
      console.error('Failed to load invoice format:', error);
      Alert.alert('Error', 'Failed to load invoice format');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormatSelect = (formatId: string) => {
    setSelectedFormat(formatId);
  };

  const handleApplyFormat = () => {
    setConfirmModalVisible(true);
  };

  const handleConfirmApply = async () => {
    try {
      setIsSaving(true);
      setConfirmModalVisible(false);
      
      // Save to database
      await saveBusinessSettings({
        invoice_format: selectedFormat,
      });

      setAppliedFormat(selectedFormat);

      Alert.alert(
        'Success',
        'Invoice format updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to save invoice format:', error);
      Alert.alert('Error', 'Failed to save invoice format. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelConfirm = () => {
    setConfirmModalVisible(false);
  };

  const isFormatApplied = (formatId: string) => {
    return formatId === appliedFormat;
  };

  const isFormatSelected = (formatId: string) => {
    return formatId === selectedFormat;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#C62828" />
        <Text style={styles.loadingText}>Loading invoice format...</Text>
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
            <Text style={styles.title}>Invoice Format</Text>
            <Text style={styles.subtitle}>Choose bill layout style</Text>
          </View>
        </Animated.View>

        {/* Format Options */}
        <Animated.View
          style={[
            styles.formatList,
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
          {INVOICE_FORMATS.map((format, index) => {
            const selected = isFormatSelected(format.id);
            const applied = isFormatApplied(format.id);
            
            return (
              <Animated.View
                key={format.id}
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
                    styles.formatCard,
                    selected && styles.formatCardSelected,
                    applied && styles.formatCardApplied,
                  ]}
                  onPress={() => !isSaving && handleFormatSelect(format.id)}
                  activeOpacity={0.7}
                  disabled={isSaving}
                >
                  <View style={styles.formatContent}>
                    {/* Preview Box */}
                    <View
                      style={[
                        styles.previewBox,
                        selected && styles.previewBoxSelected,
                        applied && styles.previewBoxApplied,
                      ]}
                    >
                      <Text style={styles.previewText}>{format.previewText}</Text>
                    </View>

                    {/* Format Info */}
                    <View style={styles.formatInfo}>
                      <Text style={styles.formatTitle}>{format.title}</Text>
                      <Text
                        style={[
                          styles.formatDescription,
                          applied && styles.formatDescriptionApplied,
                        ]}
                      >
                        {applied ? 'Applied successfully' : format.description}
                      </Text>
                    </View>

                    {/* Checkmark */}
                    {(selected || applied) && (
                      <View
                        style={[
                          styles.checkmark,
                          applied && styles.checkmarkApplied,
                        ]}
                      >
                        <Icon
                          name="checkmark"
                          size={12}
                          color="#FFFFFF"
                        />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
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
            style={[styles.applyButton, isSaving && styles.applyButtonDisabled]}
            onPress={handleApplyFormat}
            activeOpacity={0.9}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.applyButtonText}>Apply Invoice Format</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={confirmModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelConfirm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Invoice Format</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmApply}
                activeOpacity={0.9}
              >
                <Text style={styles.confirmButtonText}>YES, APPLY</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelConfirm}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  formatList: {
    gap: 16,
  },
  formatCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.81,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  formatCardSelected: {
    borderColor: '#C62828',
  },
  formatCardApplied: {
    borderColor: '#4CAF50',
  },
  formatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  previewBox: {
    width: 64,
    height: 80,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.81,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBoxSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#C62828',
  },
  previewBoxApplied: {
    backgroundColor: '#FFFFFF',
    borderColor: '#4CAF50',
  },
  previewText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999999',
    lineHeight: 16,
  },
  formatInfo: {
    flex: 1,
  },
  formatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
    letterSpacing: -0.44,
    lineHeight: 27,
  },
  formatDescription: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  formatDescriptionApplied: {
    color: '#4CAF50',
  },
  checkmark: {
    width: 24,
    height: 24,
    backgroundColor: '#C62828',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkApplied: {
    backgroundColor: '#4CAF50',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 353,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    letterSpacing: -0.26,
    lineHeight: 33,
    marginBottom: 24,
  },
  modalButtons: {
    gap: 12,
  },
  confirmButton: {
    backgroundColor: '#C62828',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  cancelButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
});

export default InvoiceFormatScreen;