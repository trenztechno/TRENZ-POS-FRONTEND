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
  Image,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

type LogoUploadScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LogoUpload'>;
};

const LogoUploadScreen: React.FC<LogoUploadScreenProps> = ({ navigation }) => {
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);

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

  const handleChangeLogo = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 1,
      });

      if (result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        if (selectedImage.uri) {
          setLogoUri(selectedImage.uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleRemoveLogo = () => {
    setRemoveModalVisible(true);
  };

  const confirmRemoveLogo = () => {
    setLogoUri(null);
    setRemoveModalVisible(false);
  };

  const cancelRemoveLogo = () => {
    setRemoveModalVisible(false);
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
            <Text style={styles.title}>Logo Upload</Text>
            <Text style={styles.subtitle}>Add or change logos</Text>
          </View>
        </Animated.View>

        {/* Logo Card */}
        <Animated.View
          style={[
            styles.logoCard,
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
          <Text style={styles.cardTitle}>Bill Logo</Text>

          {/* Logo Preview Box */}
          <View style={styles.logoPreviewContainer}>
            {logoUri ? (
              // Show uploaded logo
              <Image source={{ uri: logoUri }} style={styles.logoImage} />
            ) : (
              // Show placeholder icon
              <View style={styles.placeholderIcon}>
                <Icon name="image-outline" size={48} color="#999999" />
              </View>
            )}
          </View>

          <Text style={[styles.logoStatus, logoUri && styles.logoStatusSelected]}>
            {logoUri ? 'Logo Selected' : 'No logo'}
          </Text>

          {/* Change Logo Button */}
          <TouchableOpacity
            style={[styles.changeButton, logoUri && styles.changeButtonFilled]}
            onPress={handleChangeLogo}
            activeOpacity={0.9}
          >
            <Icon
              name="image-outline"
              size={20}
              color={logoUri ? '#FFFFFF' : '#C62828'}
              style={styles.buttonIcon}
            />
            <Text style={[styles.changeButtonText, logoUri && styles.changeButtonTextFilled]}>
              Change Bill Logo
            </Text>
          </TouchableOpacity>

          {/* Remove Logo Button (only show if logo exists) */}
          {logoUri && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemoveLogo}
              activeOpacity={0.9}
            >
              <Text style={styles.removeButtonText}>Remove the Logo</Text>
            </TouchableOpacity>
          )}

          {/* Helper Text (only show if no logo) */}
          {!logoUri && <Text style={styles.helperText}>Appears on printed bill</Text>}
        </Animated.View>
      </ScrollView>

      {/* Remove Confirmation Modal */}
      <Modal
        visible={removeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelRemoveLogo}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Remove the logo</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmRemoveLogo}
                activeOpacity={0.9}
              >
                <Text style={styles.confirmButtonText}>YES, REMOVE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelRemoveLogo}
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
  scrollContent: {
    padding: 20,
    paddingTop: 48,
    gap: 24,
    flexGrow: 1,
    justifyContent: 'center',
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
  logoCard: {
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
    alignItems: 'center',
    gap: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: -0.44,
    lineHeight: 27,
    alignSelf: 'flex-start',
  },
  logoPreviewContainer: {
    width: 128,
    height: 128,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.81,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholderIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoStatus: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  logoStatusSelected: {
    color: '#999999',
  },
  changeButton: {
    width: '100%',
    height: 48,
    borderWidth: 1.81,
    borderColor: '#C62828',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  changeButtonFilled: {
    backgroundColor: '#C62828',
    borderColor: '#C62828',
  },
  buttonIcon: {
    marginTop: -2,
  },
  changeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C62828',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  changeButtonTextFilled: {
    color: '#FFFFFF',
  },
  removeButton: {
    width: '100%',
    height: 48,
    borderWidth: 1.81,
    borderColor: '#C62828',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C62828',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  helperText: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(51, 51, 51, 0.5)',
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
    gap: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    letterSpacing: -0.26,
    lineHeight: 33,
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

export default LogoUploadScreen;