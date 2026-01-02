import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useForm, Controller} from 'react-hook-form';
import AnimatedButton from '../components/AnimatedButton';
import StepIndicator from '../components/StepIndicator';
import type {RootStackParamList} from '../types/business.types';

type BusinessSetupStep1Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BusinessSetup1'>;
};

type FormData = {
  businessName: string;
  gstNumber: string;
  gstType: 'Inclusive' | 'Exclusive';
};

const BusinessSetupStep1: React.FC<BusinessSetupStep1Props> = ({navigation}) => {
  const {control, handleSubmit, watch, setValue} = useForm<FormData>({
    defaultValues: {
      businessName: '',
      gstNumber: '',
      gstType: 'Inclusive',
    },
  });

  const gstType = watch('gstType');

  const onSubmit = (data: FormData) => {
    navigation.navigate('BusinessSetupStep2', {
      businessData: data,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Business Setup</Text>
            <StepIndicator currentStep={1} totalSteps={3} />
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Business Name <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="businessName"
                rules={{required: true}}
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your business name"
                    placeholderTextColor="#999"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                GST Number <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="gstNumber"
                rules={{required: true}}
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 22AAAAA0000A1Z5"
                    placeholderTextColor="#999"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="characters"
                    maxLength={15}
                  />
                )}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>GST Type</Text>
              <View style={styles.gstTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.gstTypeButton,
                    gstType === 'Inclusive' && styles.gstTypeButtonActive,
                  ]}
                  onPress={() => setValue('gstType', 'Inclusive')}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.gstTypeText,
                      gstType === 'Inclusive' && styles.gstTypeTextActive,
                    ]}>
                    Inclusive
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.gstTypeButton,
                    gstType === 'Exclusive' && styles.gstTypeButtonActive,
                  ]}
                  onPress={() => setValue('gstType', 'Exclusive')}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.gstTypeText,
                      gstType === 'Exclusive' && styles.gstTypeTextActive,
                    ]}>
                    Exclusive
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <AnimatedButton
              title="Continue"
              onPress={handleSubmit(onSubmit)}
              variant="primary"
              disabled={!watch('businessName') || !watch('gstNumber')}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c2c2c',
    marginBottom: 12,
  },
  required: {
    color: '#c62828',
  },
  input: {
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2c2c2c',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  gstTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  gstTypeButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  gstTypeButtonActive: {
    backgroundColor: '#c62828',
    borderColor: '#c62828',
  },
  gstTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  gstTypeTextActive: {
    color: '#ffffff',
  },
  buttonContainer: {
    paddingBottom: 24,
  },
});

export default BusinessSetupStep1;