import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, MenuItem } from '../types/business.types';

type AddEditItemScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddEditItem'>;
  route: RouteProp<RootStackParamList, 'AddEditItem'>;
};

const CATEGORIES = ['Rice & Dosa', 'Chapati & Curry', 'Tea & Coffee', 'Ice Cream'];

const AddEditItemScreen: React.FC<AddEditItemScreenProps> = ({ navigation, route }) => {
  const editItem = route.params?.item;
  const isEditing = !!editItem;

  const [itemName, setItemName] = useState(editItem?.name || '');
  const [price, setPrice] = useState(editItem?.price?.toString() || '');
  const [category, setCategory] = useState(editItem?.category || CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState(editItem?.image || '');
  const [useGlobalGST, setUseGlobalGST] = useState(true);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSave = () => {
    if (!itemName.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Error', 'Please enter valid price');
      return;
    }

    // Save logic here
    console.log('Saving item:', { itemName, price, category, imageUrl, useGlobalGST });
    
    Alert.alert(
      'Success',
      `Item ${isEditing ? 'updated' : 'added'} successfully!`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleImageUpload = () => {
    Alert.alert(
      'Upload Image',
      'Choose upload method',
      [
        { text: 'Camera', onPress: () => console.log('Open camera') },
        { text: 'Gallery', onPress: () => console.log('Open gallery') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
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

        <Text style={styles.title}>{isEditing ? 'Edit Item' : 'Add Item'}</Text>
      </Animated.View>

      {/* Form */}
      <Animated.View
        style={[
          styles.formContainer,
          {
            opacity: formAnim,
            transform: [
              {
                translateY: formAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
        >
          {/* Image Upload */}
          <View style={styles.field}>
            <Text style={styles.label}>Item Image</Text>
            <TouchableOpacity
              style={styles.imageUpload}
              onPress={handleImageUpload}
              activeOpacity={0.7}
            >
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.uploadedImage} />
              ) : (
                <>
                  <View style={styles.uploadIcon}>
                    <Text style={styles.uploadIconText}>📷</Text>
                  </View>
                  <Text style={styles.uploadText}>Upload Item Image</Text>
                  <Text style={styles.uploadSubtext}>Tap to browse files</Text>
                </>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.urlInput}
              placeholder="Or paste image URL"
              placeholderTextColor="#999999"
              value={imageUrl}
              onChangeText={setImageUrl}
            />
          </View>

          {/* Item Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Item Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Idli"
              placeholderTextColor="#999999"
              value={itemName}
              onChangeText={setItemName}
            />
          </View>

          {/* Price */}
          <View style={styles.field}>
            <Text style={styles.label}>Price</Text>
            <View style={styles.priceInput}>
              <Text style={styles.rupeeSymbol}>₹</Text>
              <TextInput
                style={styles.priceField}
                placeholder="40"
                placeholderTextColor="#999999"
                keyboardType="decimal-pad"
                value={price}
                onChangeText={setPrice}
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownText}>{category}</Text>
              <Text style={styles.dropdownArrow}>{showCategoryDropdown ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {showCategoryDropdown && (
              <View style={styles.dropdownMenu}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dropdownItemText}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* GST Settings */}
          <View style={styles.field}>
            <Text style={styles.label}>GST Settings</Text>

            <TouchableOpacity
              style={[
                styles.gstOption,
                useGlobalGST && styles.gstOptionActive,
              ]}
              onPress={() => setUseGlobalGST(true)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.radio,
                useGlobalGST && styles.radioActive,
              ]}>
                {useGlobalGST && <View style={styles.radioDot} />}
              </View>
              <View style={styles.gstText}>
                <Text style={styles.gstTitle}>Use Global GST</Text>
                <Text style={styles.gstSubtitle}>Apply business-wide GST rate</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.gstOption,
                !useGlobalGST && styles.gstOptionActive,
              ]}
              onPress={() => setUseGlobalGST(false)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.radio,
                !useGlobalGST && styles.radioActive,
              ]}>
                {!useGlobalGST && <View style={styles.radioDot} />}
              </View>
              <View style={styles.gstText}>
                <Text style={styles.gstTitle}>Set Item-level GST</Text>
                <Text style={styles.gstSubtitle}>Custom GST for this item only</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.9}
        >
          <Text style={styles.saveButtonText}>Save Item</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
  },
  formContainer: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 12,
  },
  imageUpload: {
    height: 192,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadIconText: {
    fontSize: 32,
  },
  uploadText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 16,
    color: '#999999',
  },
  urlInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rupeeSymbol: {
    fontSize: 16,
    color: '#333333',
    marginRight: 8,
  },
  priceField: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333333',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#999999',
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333333',
  },
  gstOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 12,
    gap: 12,
  },
  gstOptionActive: {
    backgroundColor: '#FFF5F5',
    borderColor: '#C62828',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: '#C62828',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C62828',
  },
  gstText: {
    flex: 1,
  },
  gstTitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 2,
  },
  gstSubtitle: {
    fontSize: 16,
    color: '#999999',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 20,
  },
  saveButton: {
    backgroundColor: '#C62828',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AddEditItemScreen;