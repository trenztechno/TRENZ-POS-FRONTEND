import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useForm, Controller} from 'react-hook-form';
import AnimatedButton from '../components/AnimatedButton';
import StepIndicator from '../components/StepIndicator';
import type {RootStackParamList} from '../types/business.types';

type BusinessSetupStep2Props = NativeStackScreenProps<RootStackParamList, 'BusinessSetupStep2'>;

type FormData = {
  phoneNumber: string;
  emailAddress: string;
};

const BusinessSetupStep2: React.FC<BusinessSetupStep2Props> = ({
  navigation,
  route,
}) => {
  const {businessData} = route.params;

  const {control, handleSubmit, watch} = useForm<FormData>({
    defaultValues: {
      phoneNumber: '',
      emailAddress: '',
    },
  });

  const onSubmit = (data: FormData) => {
    navigation.navigate('BusinessSetupStep3', {
      businessData: {
        ...businessData,
        ...data,
      },
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
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
            <StepIndicator currentStep={2} totalSteps={3} />
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Phone Number <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="phoneNumber"
                rules={{
                  required: true,
                  validate: validatePhone,
                }}
                render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
                  <>
                    <TextInput
                      style={[styles.input, error && styles.inputError]}
                      placeholder="1234567890"
                      placeholderTextColor="#999"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                    {error && (
                      <Text style={styles.errorText}>
                        Please enter a valid 10-digit phone number
                      </Text>
                    )}
                  </>
                )}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email Address <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="emailAddress"
                rules={{
                  required: true,
                  validate: validateEmail,
                }}
                render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
                  <>
                    <TextInput
                      style={[styles.input, error && styles.inputError]}
                      placeholder="business@example.com"
                      placeholderTextColor="#999"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {error && (
                      <Text style={styles.errorText}>
                        Please enter a valid email address
                      </Text>
                    )}
                  </>
                )}
              />
            </View>
          </View>

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
                  title="Continue"
                  onPress={handleSubmit(onSubmit)}
                  variant="primary"
                  disabled={
                    !watch('phoneNumber') ||
                    !watch('emailAddress') ||
                    !validatePhone(watch('phoneNumber')) ||
                    !validateEmail(watch('emailAddress'))
                  }
                />
              </View>
            </View>
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
  inputError: {
    borderColor: '#c62828',
  },
  errorText: {
    color: '#c62828',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  buttonsContainer: {
    paddingBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonHalf: {
    flex: 1,
  },
});

export default BusinessSetupStep2;