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
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MenuItem } from '../types/business.types';
import Icon from 'react-native-vector-icons/Ionicons';
import API from '../services/api';

type ItemManagementScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ItemManagement'>;
};

const ItemManagementScreen: React.FC<ItemManagementScreenProps> = ({ navigation }) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All Items']);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const filtersAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reload data when screen comes into focus (after adding/editing item)
      loadData();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (!isLoading) {
      Animated.stagger(100, [
        Animated.timing(headerAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(searchAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(filtersAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(listAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading]);

  useEffect(() => {
    let filtered = items;

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All Items') {
      filtered = filtered.filter((item) => {
        // Check both category (old) and category_ids (new)
        if (item.category_ids && item.category_ids.length > 0) {
          // Find category name from categories array
          const categoryNames = item.categories?.map(c => c.name) || [];
          return categoryNames.includes(selectedCategory);
        }
        return item.category === selectedCategory;
      });
    }

    setFilteredItems(filtered);
  }, [searchQuery, selectedCategory, items]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      console.log('🌐 Loading items from API (online-only)...');

      // Load from API only
      const [apiItems, apiCategories] = await Promise.all([
        API.items.getAll(),
        API.categories.getAll(),
      ]);

      // Map API items to MenuItem format
      const mappedItems: MenuItem[] = apiItems.map(item => {
        const categoryId = item.category_ids?.[0] || '';
        const category = apiCategories.find(cat => cat.id === categoryId);

        return {
          id: item.id,
          name: item.name,
          price: parseFloat(String(item.price || 0)),
          mrp_price: item.mrp_price ? parseFloat(String(item.mrp_price)) : undefined,
          price_type: item.price_type,
          gst_percentage: item.gst_percentage ? parseFloat(String(item.gst_percentage)) : 0,
          veg_nonveg: item.veg_nonveg,
          additional_discount: item.additional_discount ? parseFloat(String(item.additional_discount)) : 0,
          category: category?.name || 'Uncategorized',
          category_ids: item.category_ids || [],
          categories: item.categories_list,
          image: item.image_url,
          image_url: item.image_url,
          image_path: item.image,
          description: item.description,
          stock_quantity: item.stock_quantity,
          sku: item.sku,
          barcode: item.barcode,
          is_active: item.is_active,
          sort_order: item.sort_order,
        };
      });

      setItems(mappedItems);

      const categoryNames = apiCategories.map(cat => cat.name);
      setCategories(['All Items', ...categoryNames]);

      console.log('✅ Loaded from API:', {
        items: mappedItems.length,
        categories: categoryNames.length,
      });

    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load items and categories. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = (item: MenuItem) => {
    setItemToDelete(item);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);

      // Delete via API
      await API.items.delete(itemToDelete.id);

      // Update local state
      setItems(items.filter((item) => item.id !== itemToDelete.id));

      setDeleteModalVisible(false);
      setItemToDelete(null);

      Alert.alert('Success', 'Item deleted successfully');
    } catch (error) {
      console.error('Failed to delete item:', error);
      Alert.alert('Error', 'Failed to delete item. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const handleEditItem = (item: MenuItem) => {
    navigation.navigate('EditItem', { item });
  };

  const handleAddItem = () => {
    navigation.navigate('AddItem');
  };

  const handleToggleStatus = async (item: MenuItem) => {
    try {
      const newStatus = !item.is_active;
      // Optimistic update
      setItems(items.map(i => i.id === item.id ? { ...i, is_active: newStatus } : i));

      await API.items.updateStatus(item.id, newStatus);
      console.log(`Item ${item.name} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update item status:', error);
      Alert.alert('Error', 'Failed to update status');
      // Revert optimistic update
      setItems(items.map(i => i.id === item.id ? { ...i, is_active: item.is_active } : i));
    }
  };

  const getCategoryDisplay = (item: MenuItem) => {
    if (item.categories && item.categories.length > 0) {
      if (item.categories.length === 1) {
        return item.categories[0].name;
      }
      return `${item.categories[0].name} +${item.categories.length - 1}`;
    }
    return item.category || 'No Category';
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#C62828" />
        <Text style={styles.loadingText}>Loading items...</Text>
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

        <View style={styles.headerText}>
          <Text style={styles.title}>Item Management</Text>
          <Text style={styles.subtitle}>Add, edit, or remove items</Text>
        </View>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View
        style={[
          styles.searchContainer,
          {
            opacity: searchAnim,
            transform: [
              {
                scale: searchAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.searchBar}>
          <Icon name="search-outline" size={20} color="#999999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </Animated.View>

      {/* Category Filters */}
      <Animated.View
        style={[
          {
            opacity: filtersAnim,
            transform: [
              {
                translateY: filtersAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
          style={styles.filters}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterButton,
                selectedCategory === category && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedCategory === category && styles.filterTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Items List */}
      <Animated.View
        style={[
          styles.listContainer,
          {
            opacity: listAnim,
            transform: [
              {
                translateY: listAnim.interpolate({
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
          contentContainerStyle={styles.list}
        >
          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="restaurant-outline" size={64} color="#E0E0E0" />
              <Text style={styles.emptyText}>No items found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery || selectedCategory !== 'All Items'
                  ? 'Try adjusting your filters'
                  : 'Tap "Add Item" to create your first item'}
              </Text>
            </View>
          ) : (
            filteredItems.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemImage}>
                  {item.image_url || item.image_path || item.image ? (
                    <Text style={styles.imagePlaceholder}>IMG</Text>
                  ) : (
                    <Icon name="restaurant-outline" size={32} color="#C62828" />
                  )}
                </View>

                <View style={styles.itemInfo}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.actions}>
                      <TouchableOpacity
                        onPress={() => handleToggleStatus(item)}
                        style={[styles.statusButton, item.is_active ? styles.statusActive : styles.statusInactive]}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.statusDot, !item.is_active && styles.statusDotInactive]} />
                        <Text style={[styles.statusText, !item.is_active && styles.statusTextInactive]}>
                          {item.is_active ? 'Active' : 'Hidden'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleEditItem(item)}
                        activeOpacity={0.7}
                        style={styles.editButton}
                      >
                        <Icon name="pencil-outline" size={20} color="#C62828" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
                  <Text style={styles.itemCategory}>{getCategoryDisplay(item)}</Text>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteItem(item)}
                    activeOpacity={0.7}
                  >
                    <Icon name="trash-outline" size={16} color="#EF5350" />
                    <Text style={styles.deleteText}>Delete Item</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </Animated.View>

      {/* Add Item Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddItem}
          activeOpacity={0.9}
        >
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Delete this item?</Text>
            <Text style={styles.modalItemName}>"{itemToDelete?.name}"</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.deleteConfirmButton, isDeleting && styles.deleteConfirmButtonDisabled]}
                onPress={confirmDelete}
                activeOpacity={0.9}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteConfirmText}>Yes, Delete Item</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelDelete}
                activeOpacity={0.7}
                disabled={isDeleting}
              >
                <Text style={styles.cancelText}>Cancel</Text>
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
  headerText: {},
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  filters: {
    paddingVertical: 8,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#C62828',
    borderColor: '#C62828',
  },
  filterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
  },
  list: {
    padding: 20,
    gap: 16,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#CCCCCC',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    gap: 16,
  },
  itemImage: {
    width: 96,
    height: 96,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '600',
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
  },
  statusActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  statusInactive: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  statusDotInactive: {
    backgroundColor: '#EF5350',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  statusTextInactive: {
    color: '#C62828',
  },
  editButton: {
    padding: 4,
  },
  itemPrice: {
    fontSize: 16,
    color: '#C62828',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 20,
  },
  addButton: {
    backgroundColor: '#C62828',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 353,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    paddingHorizontal: 23,
    gap: 6,
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
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  modalButtons: {
    gap: 12,
    marginTop: 6,
  },
  deleteConfirmButton: {
    backgroundColor: '#C62828',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteConfirmButtonDisabled: {
    opacity: 0.6,
  },
  deleteConfirmText: {
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
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
});

export default ItemManagementScreen;