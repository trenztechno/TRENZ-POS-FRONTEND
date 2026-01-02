import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import AnimatedButton from '../components/AnimatedButton';
import StepIndicator from '../components/StepIndicator';
import type {RootStackParamList} from '../types/business.types';

type BusinessSetupStep3Props = NativeStackScreenProps<RootStackParamList, 'BusinessSetupStep3'>;

const InfoRow: React.FC<{label: string; value: string}> = ({
  label,
  value,
}) => {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

const BusinessSetupStep3: React.FC<BusinessSetupStep3Props> = ({
  navigation,
  route,
}) => {
  const {businessData} = route.params;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCreateBusiness = () => {
    navigation.navigate('CreatingBusiness', {
      businessData,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Business Setup</Text>
            <StepIndicator currentStep={3} totalSteps={3} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Review Your Information</Text>

            <View style={styles.infoContainer}>
              <InfoRow
                label="Business Name"
                value={businessData.businessName || ''}
              />
              <InfoRow
                label="GST Number"
                value={businessData.gstNumber || ''}
              />
              <InfoRow
                label="GST Type"
                value={businessData.gstType || ''}
              />
              <InfoRow
                label="Phone"
                value={businessData.phoneNumber || ''}
              />
              <InfoRow
                label="Email"
                value={businessData.emailAddress || ''}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonsContainer}>
        <View style={styles.buttonRow}>
          <View style={styles.buttonHalf}>
            <AnimatedButton
              title="Back"
              onPress={handleBack}
              variant="secondary"
            />
          </View>
          <View style={styles.buttonHalf}>
            <AnimatedButton
              title="Create Business"
              onPress={handleCreateBusiness}
              variant="primary"
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c2c2c',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c2c2c',
    marginBottom: 24,
  },
  infoContainer: {
    gap: 20,
  },
  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c2c2c',
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonHalf: {
    flex: 1,
  },
});

export default BusinessSetupStep3;