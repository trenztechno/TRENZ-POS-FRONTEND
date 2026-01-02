import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/business.types';

type BillingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Billing'>;
};

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
};

type CartItem = MenuItem & {
  quantity: number;
};

const MEAL_TIMES = ['Morning', 'Lunch', 'Evening', 'Dinner'];
const CATEGORIES = ['All Items', 'Rice & Dosa', 'Chapati & Curry'];

const BillingScreen: React.FC<BillingScreenProps> = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealTime, setSelectedMealTime] = useState('Morning');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;
  const searchOpacity = useRef(new Animated.Value(0)).current;
  const searchTranslateY = useRef(new Animated.Value(20)).current;
  const filtersOpacity = useRef(new Animated.Value(0)).current;
  const filtersTranslateX = useRef(new Animated.Value(-20)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
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
  }, []);

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(
        cart.map(cartItem =>
          cartItem.id === item.id
            ? {...cartItem, quantity: cartItem.quantity + 1}
            : cartItem
        )
      );
    } else {
      setCart([...cart, {...item, quantity: 1}]);
    }
  };

  const removeFromCart = (itemId: string) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(
        cart.map(cartItem =>
          cartItem.id === itemId
            ? {...cartItem, quantity: cartItem.quantity - 1}
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
    navigation.navigate('Checkout', {cart});
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{translateY: headerTranslateY}],
          },
        ]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Billing</Text>
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <Animated.View
          style={[
            styles.searchContainer,
            {
              opacity: searchOpacity,
              transform: [{translateY: searchTranslateY}],
            },
          ]}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search item (e.g., Dosa, Tea)"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Animated.View>

        {/* Meal Time Filters */}
        <Animated.View
          style={[
            styles.filtersContainer,
            {
              opacity: filtersOpacity,
              transform: [{translateX: filtersTranslateX}],
            },
          ]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {MEAL_TIMES.map(time => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.filterButton,
                  selectedMealTime === time && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedMealTime(time)}>
                <Text
                  style={[
                    styles.filterText,
                    selectedMealTime === time && styles.filterTextActive,
                  ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Popular Items Section */}
        <Animated.View
          style={[
            styles.sectionContainer,
            {
              opacity: contentOpacity,
              transform: [{translateY: contentTranslateY}],
            },
          ]}>
          <Text style={styles.sectionTitle}>Popular Items</Text>
          <View style={styles.itemsGrid}>
            {/* Items will be mapped here from state/API */}
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No items available</Text>
              <Text style={styles.emptySubtext}>Add items to your menu</Text>
            </View>
          </View>
        </Animated.View>

        {/* Category Filters */}
        <Animated.View
          style={[
            styles.categoryContainer,
            {opacity: contentOpacity},
          ]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map(category => (
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

        {/* All Items Section */}
        <Animated.View
          style={[
            styles.allItemsContainer,
            {opacity: contentOpacity},
          ]}>
          <View style={styles.itemsGrid}>
            {/* Items will be mapped here from state/API */}
          </View>
        </Animated.View>
      </ScrollView>

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
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
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
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333333',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: '#C62828',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  itemsGrid: {
    gap: 16,
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
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    marginRight: 12,
  },
  categoryButtonActive: {
    backgroundColor: '#C62828',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  allItemsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  cartFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  cartInfo: {
    flex: 1,
  },
  cartItems: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  checkoutButton: {
    backgroundColor: '#C62828',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default BillingScreen;