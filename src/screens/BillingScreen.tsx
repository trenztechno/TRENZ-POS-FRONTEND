import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, MenuItem, CartItem } from '../types/business.types';
import Icon from 'react-native-vector-icons/Ionicons';
import API from '../services/api';

type BillingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Billing'>;
};

const BillingScreen: React.FC<BillingScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [outOfStockItems, setOutOfStockItems] = useState<Set<string>>(new Set());

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;
  const searchOpacity = useRef(new Animated.Value(0)).current;
  const searchTranslateY = useRef(new Animated.Value(20)).current;
  const filtersOpacity = useRef(new Animated.Value(0)).current;
  const filtersTranslateX = useRef(new Animated.Value(-20)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      startAnimations();
    }
  }, [isLoading]);

  const loadData = async () => {
    try {
      console.log('🌐 Loading billing data from API (online-only)...');

      // Load from API only
      const [apiCategories, apiItems] = await Promise.all([
        API.categories.getAll(),
        API.items.getAll({ is_active: true }),
      ]);

      setCategories(apiCategories);

      console.log('✅ Loaded from API:', {
        categories: apiCategories.length,
        items: apiItems.length,
      });

      // Map items with ALL fields including GST-related fields
      const mappedItems: MenuItem[] = apiItems.map(item => {
        // Get category name from first category (for display)
        const categoryId = item.category_ids?.[0] || '';
        const category = apiCategories.find(cat => cat.id === categoryId);

        // Parse strings to numbers to prevent .toFixed crashes
        const parsedPrice = parseFloat(String(item.price || 0));
        const parsedMrp = item.mrp_price ? parseFloat(String(item.mrp_price)) : parsedPrice;
        const parsedGst = item.gst_percentage ? parseFloat(String(item.gst_percentage)) : 0;
        const parsedDiscount = item.additional_discount ? parseFloat(String(item.additional_discount)) : 0;

        return {
          id: item.id,
          name: item.name,
          price: parsedPrice,
          mrp_price: parsedMrp,
          price_type: (item.price_type as 'exclusive' | 'inclusive') || 'exclusive',
          gst_percentage: parsedGst,
          veg_nonveg: item.veg_nonveg as 'veg' | 'nonveg' | undefined,
          additional_discount: parsedDiscount,
          category: category?.name || 'Uncategorized',
          category_ids: item.category_ids || [categoryId],
          image: item.image_url,
          image_url: item.image_url,
          local_image_path: item.local_image_path,
          description: item.description,
          stock_quantity: item.stock_quantity,
          sku: item.sku,
          barcode: item.barcode,
          is_active: item.is_active,
          sort_order: item.sort_order,
        };
      });

      setMenuItems(mappedItems);
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load billing data. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startAnimations = () => {
    // Header animation
    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(headerTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Search animation
    Animated.sequence([
      Animated.delay(250),
      Animated.parallel([
        Animated.timing(searchOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(searchTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Filters animation
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(filtersOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(filtersTranslateX, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Content animation
    Animated.sequence([
      Animated.delay(550),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(contentTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(
        cart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(
        cart.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      );
    } else {
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    }
  };

  const getItemQuantity = (itemId: string) => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout', { cart });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleMarkOutOfStock = async (itemId: string) => {
    const newOutOfStock = new Set(outOfStockItems);
    if (newOutOfStock.has(itemId)) {
      newOutOfStock.delete(itemId);
      Alert.alert('Success', 'Item marked as available');
    } else {
      newOutOfStock.add(itemId);
      Alert.alert('Success', 'Item marked as out of stock');
    }
    setOutOfStockItems(newOutOfStock);
  };

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);

  const handleEditItem = async (item: MenuItem) => {
    try {
      console.log('🔧 Edit button clicked for item:', item.name);

      // Check if admin PIN is set via API
      const status = await API.auth.securityPin.status();
      console.log('📌 PIN status:', status);

      if (!status.has_pin) {
        console.log('⚠️ No PIN set, showing alert');
        Alert.alert(
          'Admin PIN Not Set',
          'Please set an admin PIN in Admin Dashboard first before editing items.',
          [
            {
              text: 'Go to Admin',
              onPress: () => navigation.navigate('AdminDashboard'),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
        return;
      }

      console.log('✅ PIN is set, showing PIN input modal');
      // Store item and show PIN modal
      setItemToEdit(item);
      setPinInput('');
      setShowPinModal(true);
    } catch (error) {
      console.error('❌ Failed to check admin PIN status:', error);
      Alert.alert('Error', 'Failed to verify admin PIN. Please try again.');
    }
  };

  const handlePinSubmit = async () => {
    if (!pinInput || pinInput.trim() === '') {
      Alert.alert('Error', 'Please enter a PIN');
      return;
    }

    if (!itemToEdit) {
      Alert.alert('Error', 'No item selected');
      setShowPinModal(false);
      return;
    }

    try {
      console.log('🔑 Verifying PIN...');
      // Verify PIN via API
      const result = await API.auth.securityPin.verify(pinInput);
      console.log('🔐 PIN verification result:', result);

      if (result.verified) {
        console.log('✅ PIN verified, navigating to EditItem screen');
        console.log('📦 Item data being passed:', itemToEdit);
        setShowPinModal(false);
        setPinInput('');
        navigation.navigate('EditItem', { item: itemToEdit });
        setItemToEdit(null);
      } else {
        console.log('❌ Incorrect PIN');
        Alert.alert('Error', 'Incorrect admin PIN');
        setPinInput('');
      }
    } catch (error) {
      console.error('❌ PIN verification failed:', error);
      Alert.alert('Error', 'Failed to verify PIN. Please try again.');
      setPinInput('');
    }
  };

  // Get unique category names for filter buttons
  const getCategoryFilters = () => {
    const uniqueCategories = Array.from(new Set(menuItems.map(item => item.category)));
    return ['All Items', ...uniqueCategories];
  };

  // Filter items based on search and category
  const getFilteredItems = () => {
    return menuItems
      .filter(item =>
        selectedCategory === 'All Items' || item.category === selectedCategory
      )
      .filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#C62828" />
      </View>
    );
  }

  const filteredItems = getFilteredItems();
  const categoryFilters = getCategoryFilters();

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Billing</Text>
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Dishes */}
        <Animated.View
          style={[
            styles.searchContainer,
            {
              opacity: searchOpacity,
              transform: [{ translateY: searchTranslateY }],
            },
          ]}>
          <View style={styles.searchInputContainer}>
            <Icon name="search-outline" size={20} color="#999999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search dishes (e.g., Idli, Tea, Biryani)"
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </Animated.View>

        {/* Category Filters - Horizontal Scroll */}
        <Animated.View
          style={[
            styles.categoryContainer,
            {
              opacity: filtersOpacity,
              transform: [{ translateX: filtersTranslateX }],
            },
          ]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}>
            {categoryFilters.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category)}>
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextActive,
                  ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* All Items Section - VERTICAL LAYOUT */}
        <Animated.View
          style={[
            styles.allItemsContainer,
            { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] },
          ]}>
          <Text style={styles.sectionTitle}>Food Items</Text>
          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No items found</Text>
              <Text style={styles.emptySubtext}>Try a different search or category</Text>
            </View>
          ) : (
            <View style={styles.verticalItemsList}>
              {filteredItems.map((item, index) => {
                const quantity = getItemQuantity(item.id);
                const isOutOfStock = outOfStockItems.has(item.id);
                return (
                  <Animated.View
                    key={item.id}
                    style={[
                      styles.verticalItemCard,
                      isOutOfStock && styles.outOfStockCard,
                      {
                        opacity: contentOpacity,
                      },
                    ]}>

                    {/* Stock Toggle - Top Right Overlay */}
                    <TouchableOpacity
                      style={styles.stockToggleButton}
                      onPress={() => handleMarkOutOfStock(item.id)}>
                      <Icon
                        name={isOutOfStock ? "close-circle" : "checkmark-circle"}
                        size={28}
                        color={isOutOfStock ? "#EF5350" : "#4CAF50"}
                      />
                    </TouchableOpacity>

                    {/* Item Info Section */}
                    <View style={styles.itemInfoSection}>
                      <View style={styles.itemImageSmall}>
                        <Icon name="restaurant-outline" size={32} color={isOutOfStock ? "#CCCCCC" : "#C62828"} />
                      </View>

                      <View style={styles.itemDetails}>
                        <View style={styles.itemNameRow}>
                          <Text style={[styles.verticalItemName, isOutOfStock && styles.outOfStockText]} numberOfLines={2}>
                            {item.name}
                          </Text>
                          {item.veg_nonveg && (
                            <View style={[styles.vegBadge, item.veg_nonveg === 'nonveg' && styles.nonVegBadge]}>
                              <View style={[styles.vegDot, item.veg_nonveg === 'nonveg' && styles.nonVegDot]} />
                            </View>
                          )}
                        </View>
                        <Text style={styles.itemCategory}>{item.category}</Text>
                        <Text style={[styles.verticalItemPrice, isOutOfStock && styles.outOfStockText]}>
                          ₹{item.price.toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {/* Action Buttons Section */}
                    <View style={styles.itemActionsSection}>
                      {/* Edit Button */}
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditItem(item)}>
                        <Icon name="create-outline" size={20} color="#C62828" />
                      </TouchableOpacity>

                      {/* Add / Quantity Control */}
                      {!isOutOfStock ? (
                        quantity === 0 ? (
                          <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => addToCart(item)}>
                            <Text style={styles.addButtonText}>ADD</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.quantityControl}>
                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() => removeFromCart(item.id)}>
                              <Text style={styles.quantityButtonText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() => addToCart(item)}>
                              <Text style={styles.quantityButtonText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        )
                      ) : (
                        <View style={[styles.addButton, { backgroundColor: '#F5F5F5' }]}>
                          <Text style={[styles.addButtonText, { color: '#AAAAAA' }]}>UNAVAILABLE</Text>
                        </View>
                      )}
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* PIN Input Modal */}
      <Modal
        visible={showPinModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowPinModal(false);
          setPinInput('');
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Admin PIN Required</Text>
            <Text style={styles.modalSubtitle}>Enter admin PIN to edit this item</Text>

            <TextInput
              style={styles.pinInput}
              value={pinInput}
              onChangeText={setPinInput}
              placeholder="Enter PIN"
              placeholderTextColor="#999"
              keyboardType="numeric"
              secureTextEntry
              autoFocus
              maxLength={6}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowPinModal(false);
                  setPinInput('');
                  setItemToEdit(null);
                }}>
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSubmit]}
                onPress={handlePinSubmit}>
                <Text style={styles.modalButtonTextSubmit}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cart Footer */}
      {cart.length > 0 && (
        <Animated.View style={styles.cartFooter}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartItems}>Items: {getTotalItems()}</Text>
            <Text style={styles.cartTotal}>Total: ₹{getTotalAmount().toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>Checkout</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
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
  header: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#C62828',
    fontWeight: '600',
    letterSpacing: -0.31,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: 0.38,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 16.4,
    paddingHorizontal: 16,
    borderWidth: 1.8,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333333',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
    letterSpacing: -0.26,
    paddingHorizontal: 4,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.8,
    borderColor: '#E0E0E0',
    minWidth: 100,
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#C62828',
    borderColor: '#C62828',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: -0.31,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  allItemsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Space for checkout footer
  },
  verticalItemsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  verticalItemCard: {
    width: '48%', // Flexible enough for 2 columns with gap
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 12,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative', // For absolute positioning stock button
  },
  outOfStockCard: {
    backgroundColor: '#FAFAFA',
    opacity: 0.85,
    borderColor: '#EEEEEE',
  },

  // Stock Toggle (Top Right Overlay)
  stockToggleButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 4,
  },

  itemInfoSection: {
    marginTop: 12, // Space from top for stock toggle
    alignItems: 'center', // Center content vertically
    marginBottom: 12,
  },
  itemImageSmall: {
    width: 64,
    height: 64,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8, // Stack image top
  },
  itemDetails: {
    width: '100%',
    alignItems: 'flex-start',
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  verticalItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    flex: 1,
    marginRight: 4,
  },
  vegBadge: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nonVegBadge: {
    borderColor: '#D32F2F',
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  nonVegDot: {
    backgroundColor: '#D32F2F',
  },
  itemCategory: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 6,
    fontWeight: '500',
  },
  verticalItemPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: '#CC2B2B', // Dark red
  },
  outOfStockText: {
    color: '#AAAAAA',
  },

  // Bottom Action Row (Edit + Add/Qty)
  itemActionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto', // Push to bottom
  },
  editButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FEF2F2', // Light red bg
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flex: 1, // Fill remaining space
    height: 40,
    backgroundColor: '#C62828',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quantityControl: {
    flex: 1, // Fill remaining space
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    height: 40,
    paddingHorizontal: 2,
  },
  quantityButton: {
    width: 32,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#C62828',
    marginTop: -2, // Optical alignment
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },

  // Footer
  cartFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 20,
  },
  cartInfo: {
    flex: 1,
  },
  cartItems: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 2,
  },
  cartTotal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333333',
  },
  checkoutButton: {
    backgroundColor: '#C62828',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#C62828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  pinInput: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalButtonSubmit: {
    backgroundColor: '#C62828',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalButtonTextSubmit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default BillingScreen;