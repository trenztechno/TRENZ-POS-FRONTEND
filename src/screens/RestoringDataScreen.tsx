import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/business.types';
import RNFS from 'react-native-fs';
import {
  createCategory,
  createItem,
  createBill,
  saveBusinessSettings,
} from '../services/storage';

type RestoringDataScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RestoringData'>;
  route: RouteProp<RootStackParamList, 'RestoringData'>;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RestoringDataScreen: React.FC<RestoringDataScreenProps> = ({
  navigation,
  route,
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing restore...');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const { fileName } = route.params;

  const radius = 64;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Start actual restore process
    performRestore();
  }, []);

  // Animate progress circle
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const performRestore = async () => {
    try {
      // Step 1: Read backup file (10%)
      setStatusText('Reading backup file...');
      setProgress(10);

      const filePath = fileName.startsWith('/')
        ? fileName
        : `${RNFS.DocumentDirectoryPath}/${fileName}`;

      const fileContent = await RNFS.readFile(filePath, 'utf8');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

      // Step 2: Parse and validate (20%)
      setStatusText('Validating backup data...');
      setProgress(20);

      const backupData = JSON.parse(fileContent);

      if (!backupData.version || !backupData.data) {
        throw new Error('Invalid backup file format');
      }
      await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

      const { categories = [], items = [], bills = [], settings = {} } = backupData.data;

      // Step 3: Restore categories (40%)
      setStatusText('Restoring categories...');
      setProgress(30);

      if (categories.length > 0) {
        for (let i = 0; i < categories.length; i++) {
          const category = categories[i];
          try {
            await createCategory({
              name: category.name,
              description: category.description,
              sort_order: category.sort_order || 0,
            });
          } catch (error) {
            console.error('Failed to restore category:', category.name, error);
          }

          // Update progress incrementally
          const categoryProgress = 30 + (10 * (i + 1) / categories.length);
          setProgress(Math.floor(categoryProgress));
        }
      }
      setProgress(40);
      await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

      // Step 4: Restore items (60%)
      setStatusText('Restoring items...');

      if (items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          try {
            await createItem({
              name: item.name,
              description: item.description,
              price: item.price,
              stock_quantity: item.stock_quantity || 0,
              sku: item.sku,
              barcode: item.barcode,
              category_ids: item.category_ids || [],
              image_path: item.image_path,
              image_url: item.image_url,
              sort_order: item.sort_order || 0,
            });
          } catch (error) {
            console.error('Failed to restore item:', item.name, error);
          }

          // Update progress incrementally
          const itemProgress = 40 + (20 * (i + 1) / items.length);
          setProgress(Math.floor(itemProgress));
        }
      }
      setProgress(60);
      await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

      // Step 5: Restore bills (80%)
      setStatusText('Restoring bills...');

      if (bills.length > 0) {
        for (let i = 0; i < bills.length; i++) {
          const bill = bills[i];
          try {
            await createBill({
              invoice_number: bill.invoice_number || `INV-${Date.now()}-${i}`,
              bill_number: bill.bill_number,
              billing_mode: bill.billing_mode || 'non_gst',
              restaurant_name: bill.restaurant_name || 'Restored',
              address: bill.address || '',
              bill_date: bill.bill_date || new Date().toISOString(),
              items: bill.items || [],
              subtotal: bill.subtotal,
              total_tax: bill.tax_amount || bill.total_tax || 0,
              discount_amount: bill.discount_amount,
              total_amount: bill.total_amount,
              payment_mode: bill.payment_mode || bill.payment_method || 'cash',
              amount_paid: bill.amount_paid || bill.total_amount,
              customer_name: bill.customer_name,
              customer_phone: bill.customer_phone,
              notes: bill.notes,
              device_id: bill.device_id || 'restored',
            });
          } catch (error) {
            console.error('Failed to restore bill:', bill.bill_number, error);
          }

          // Update progress incrementally
          const billProgress = 60 + (20 * (i + 1) / bills.length);
          setProgress(Math.floor(billProgress));
        }
      }
      setProgress(80);
      await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

      // Step 6: Restore settings (90%)
      setStatusText('Restoring settings...');
      setProgress(90);

      if (Object.keys(settings).length > 0) {
        try {
          await saveBusinessSettings(settings);
        } catch (error) {
          console.error('Failed to restore settings:', error);
        }
      }
      await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

      // Step 7: Complete (100%)
      setStatusText('Finalizing restore...');
      setProgress(100);
      await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

      // Navigate to success screen
      navigation.replace('RestoreSuccess', { fileName });

    } catch (error) {
      console.error('Restore failed:', error);

      Alert.alert(
        'Restore Failed',
        `Failed to restore data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [
          {
            text: 'Go Back',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Restore Data</Text>
          <Text style={styles.subtitle}>Restore from backup file</Text>
        </View>

        {/* Progress Circle */}
        <View style={styles.progressContainer}>
          <Svg width={140} height={140}>
            {/* Background circle */}
            <Circle
              cx={70}
              cy={70}
              r={radius}
              stroke="#E0E0E0"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress circle */}
            <AnimatedCircle
              cx={70}
              cy={70}
              r={radius}
              stroke="#C62828"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 70 70)`}
            />
          </Svg>
          <View style={styles.progressTextContainer}>
            <Text style={styles.percentage}>{progress}%</Text>
          </View>
        </View>

        {/* Status Text */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>{statusText}</Text>
          <Text style={styles.statusSubtext}>Please wait, this may take a moment</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    gap: 48,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: 0.38,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    textAlign: 'center',
  },
  progressContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 32,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: 0.07,
  },
  statusContainer: {
    alignItems: 'center',
    gap: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#333333',
    letterSpacing: -0.44,
    textAlign: 'center',
  },
  statusSubtext: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    textAlign: 'center',
  },
});

export default RestoringDataScreen;