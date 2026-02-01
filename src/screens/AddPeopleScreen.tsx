import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';
import Icon from 'react-native-vector-icons/Ionicons';
import API from '../services/api';

type AddPeopleScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddPeople'>;
};

type StaffUser = {
  id: number;
  username: string;
  email: string;
  role: 'owner' | 'staff';
  created_at: string;
};

const AddPeopleScreen: React.FC<AddPeopleScreenProps> = ({ navigation }) => {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add Staff Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Remove Staff State
  const [userToRemove, setUserToRemove] = useState<StaffUser | null>(null);
  const [showRemovePinModal, setShowRemovePinModal] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [isRemovingUser, setIsRemovingUser] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      if (!isRefreshing) setIsLoading(true);
      const data = await API.auth.staff.list();
      setUsers(data.users);

      // Animate in
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
    } catch (error) {
      console.error('Failed to fetch users:', error);
      Alert.alert('Error', 'Failed to load staff list');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUsers();
  };

  const handleAddStaff = async () => {
    if (!newUsername || !newPassword || !newPin) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    if (newPin.length < 4) {
      Alert.alert('Invalid PIN', 'Security PIN must be at least 4 digits');
      return;
    }

    // Basic username validation
    if (newUsername.length < 3) {
      Alert.alert('Invalid Username', 'Username must be at least 3 characters');
      return;
    }

    setIsAddingUser(true);
    try {
      await API.auth.staff.create({
        username: newUsername,
        password: newPassword,
        security_pin: newPin,
      });

      Alert.alert('Success', 'Staff member added successfully');
      setShowAddModal(false);
      resetAddForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to add staff:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create staff account';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsAddingUser(false);
    }
  };

  const resetAddForm = () => {
    setNewUsername('');
    setNewPassword('');
    setNewPin('');
  };

  const initiateRemoveUser = (user: StaffUser) => {
    setUserToRemove(user);
    setAdminPin('');
    setShowRemovePinModal(true);
  };

  const handleRemoveStaff = async () => {
    if (!userToRemove || !adminPin) return;

    setIsRemovingUser(true);
    try {
      await API.auth.staff.remove(userToRemove.id, adminPin);
      Alert.alert('Success', 'Staff member removed successfully');
      setShowRemovePinModal(false);
      setUserToRemove(null);
      setAdminPin('');
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to remove staff:', error);
      const errorMessage = error.response?.data?.message || 'Failed to remove staff member. Check your PIN.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsRemovingUser(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#C62828" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Management</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#C62828']} />
        }
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Team</Text>
          <Text style={styles.sectionSubtitle}>Manage access for your business</Text>
        </View>

        {isLoading && !isRefreshing ? (
          <ActivityIndicator size="large" color="#C62828" style={{ marginTop: 40 }} />
        ) : (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Owner Section - Always First */}
            {users.filter(u => u.role === 'owner').map(user => (
              <View key={user.id} style={[styles.userCard, styles.ownerCard]}>
                <View style={styles.userIconContainer}>
                  <Text style={styles.userInitial}>{user.username.charAt(0).toUpperCase()}</Text>
                  <View style={styles.ownerBadge}>
                    <Icon name="star" size={10} color="#FFF" />
                  </View>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.username}</Text>
                  <Text style={styles.userRole}>Owner (You)</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
              </View>
            ))}

            {/* Staff Section */}
            {users.filter(u => u.role !== 'owner').length > 0 ? (
              users
                .filter(u => u.role !== 'owner')
                .map(user => (
                  <View key={user.id} style={styles.userCard}>
                    <View style={[styles.userIconContainer, styles.staffIcon]}>
                      <Text style={[styles.userInitial, styles.staffInitial]}>
                        {user.username.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{user.username}</Text>
                      <Text style={styles.userRole}>Staff</Text>
                      <Text style={styles.joinedData}>Added on {new Date(user.created_at).toLocaleDateString()}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => initiateRemoveUser(user)}
                    >
                      <Icon name="trash-outline" size={20} color="#C62828" />
                    </TouchableOpacity>
                  </View>
                ))
            ) : (
              <View style={styles.emptyState}>
                <Icon name="people-outline" size={48} color="#CCC" />
                <Text style={styles.emptyText}>No staff members added yet</Text>
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      >
        <Icon name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add Staff Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Staff</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter username"
                value={newUsername}
                onChangeText={setNewUsername}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />

              <Text style={styles.inputLabel}>Security PIN (for Login)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 4-6 digit PIN"
                value={newPin}
                onChangeText={setNewPin}
                keyboardType="numeric"
                maxLength={6}
                secureTextEntry
              />

              <View style={styles.infoBox}>
                <Icon name="information-circle-outline" size={20} color="#666" />
                <Text style={styles.infoText}>
                  Staff will use this username and password to log in. The PIN is used for quick access.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddStaff}
              disabled={isAddingUser}
            >
              {isAddingUser ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Remove User Confirmation Modal */}
      <Modal
        visible={showRemovePinModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRemovePinModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.smallModal]}>
            <Text style={styles.modalTitle}>Confirm Removal</Text>
            <Text style={styles.modalSubtitle}>
              Enter your Admin PIN to remove {userToRemove?.username}
            </Text>

            <TextInput
              style={styles.pinInput}
              value={adminPin}
              onChangeText={setAdminPin}
              placeholder="Enter Admin PIN"
              keyboardType="numeric"
              maxLength={6}
              secureTextEntry
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalActionBtn, styles.cancelBtn]}
                onPress={() => setShowRemovePinModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionBtn, styles.deleteBtn]}
                onPress={handleRemoveStaff}
                disabled={isRemovingUser}
              >
                {isRemovingUser ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.deleteBtnText}>Remove</Text>
                )}
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  ownerCard: {
    borderColor: '#C62828',
    borderWidth: 1,
    backgroundColor: '#FFF5F5',
  },
  userIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#C62828',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  staffIcon: {
    backgroundColor: '#F5F5F5',
  },
  userInitial: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  staffInitial: {
    color: '#666',
  },
  ownerBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFD700',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#C62828',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
  },
  joinedData: {
    fontSize: 12,
    color: '#999',
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    opacity: 0.6,
  },
  emptyText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#C62828',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  smallModal: {
    width: '85%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  pinInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 24,
    color: '#333',
    textAlign: 'center',
    letterSpacing: 8,
    backgroundColor: '#FAFAFA',
    marginBottom: 24,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F7FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 8,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: '#C62828',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F5F5F5',
  },
  deleteBtn: {
    backgroundColor: '#C62828',
  },
  cancelBtnText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AddPeopleScreen;