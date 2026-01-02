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
import { RootStackParamList, MenuItem } from '../types/business.types';

type ItemManagementScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ItemManagement'>;
};

// Demo menu items
const DEMO_ITEMS: MenuItem[] = [
  { id: '1', name: 'Idli', price: 40, category: 'Rice & Dosa', image: '' },
  { id: '2', name: 'Plain Dosa', price: 60, category: 'Rice & Dosa', image: '' },
  { id: '3', name: 'Masala Dosa', price: 80, category: 'Rice & Dosa', image: '' },
  { id: '4', name: 'Onion Dosa', price: 70, category: 'Rice & Dosa', image: '' },
  { id: '5', name: 'Ghee Roast', price: 90, category: 'Rice & Dosa', image: '' },
  { id: '6', name: 'Vada', price: 35, category: 'Rice & Dosa', image: '' },
  { id: '7', name: 'Poori Masala', price: 60, category: 'Rice & Dosa', image: '' },
  { id: '8', name: 'Curd Rice', price: 70, category: 'Rice & Dosa', image: '' },
  { id: '9', name: 'Sambar Rice', price: 90, category: 'Rice & Dosa', image: '' },
  { id: '10', name: 'Vegetable Biryani', price: 150, category: 'Rice & Dosa', image: '' },
  { id: '11', name: 'Veg Meals', price: 120, category: 'Rice & Dosa', image: '' },
  { id: '12', name: 'Chicken Biryani', price: 200, category: 'Rice & Dosa', image: '' },
  { id: '13', name: 'Mutton Biryani', price: 280, category: 'Rice & Dosa', image: '' },
  { id: '14', name: 'Chapati', price: 30, category: 'Chapati & Curry', image: '' },
  { id: '15', name: 'Naan', price: 40, category: 'Chapati & Curry', image: '' },
  { id: '16', name: 'Butter Naan', price: 50, category: 'Chapati & Curry', image: '' },
  { id: '17', name: 'Parotta', price: 35, category: 'Chapati & Curry', image: '' },
  { id: '18', name: 'Kothu Parotta', price: 80, category: 'Chapati & Curry', image: '' },
  { id: '19', name: 'Paneer Butter Masala', price: 180, category: 'Chapati & Curry', image: '' },
  { id: '20', name: 'Veg Kurma', price: 120, category: 'Chapati & Curry', image: '' },
  { id: '21', name: 'Egg Curry', price: 100, category: 'Chapati & Curry', image: '' },
  { id: '22', name: 'Chicken Gravy', price: 180, category: 'Chapati & Curry', image: '' },
  { id: '23', name: 'Chicken Butter Masala', price: 200, category: 'Chapati & Curry', image: '' },
  { id: '24', name: 'Chicken Chettinad', price: 220, category: 'Chapati & Curry', image: '' },
  { id: '25', name: 'Tea', price: 20, category: 'Tea & Coffee', image: '' },
  { id: '26', name: 'Coffee', price: 25, category: 'Tea & Coffee', image: '' },
  { id: '27', name: 'Filter Coffee', price: 30, category: 'Tea & Coffee', image: '' },
  { id: '28', name: 'Masala Tea', price: 25, category: 'Tea & Coffee', image: '' },
  { id: '29', name: 'Vanilla Ice Cream', price: 60, category: 'Ice Cream', image: '' },
  { id: '30', name: 'Chocolate Ice Cream', price: 70, category: 'Ice Cream', image: '' },
  { id: '31', name: 'Strawberry Ice Cream', price: 70, category: 'Ice Cream', image: '' },
  { id: '32', name: 'Butterscotch Ice Cream', price: 75, category: 'Ice Cream', image: '' },
  { id: '33', name: 'Kulfi', price: 50, category: 'Ice Cream', image: '' },
];

const CATEGORIES = ['All Items', 'Rice & Dosa', 'Chapati & Curry', 'Tea & Coffee', 'Ice Cream'];

const ItemManagementScreen: React.FC<ItemManagementScreenProps> = ({ navigation }) => {
  const [items, setItems] = useState<MenuItem[]>(DEMO_ITEMS);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>(DEMO_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const filtersAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, selectedCategory, items]);

  const filterItems = () => {
    let filtered = items;

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All Items') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setItems(items.filter((item) => item.id !== itemId));
          },
        },
      ]
    );
  };

  const handleEditItem = (item: MenuItem) => {
    navigation.navigate('AddEditItem', { item });
  };

  const handleAddItem = () => {
    navigation.navigate('AddEditItem', {});
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
          <Text style={styles.searchIcon}>🔍</Text>
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
          {CATEGORIES.map((category) => (
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
          {filteredItems.map((item, index) => (
            <View
              key={item.id}
              style={styles.itemCard}
            >
              <View style={styles.itemImage}>
                <Text style={styles.imagePlaceholder}>🍽️</Text>
              </View>

              <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <TouchableOpacity
                    onPress={() => handleEditItem(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.editIcon}>✏️</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.itemPrice}>₹{item.price}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteItem(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                  <Text style={styles.deleteText}>Delete Item</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
    fontSize: 18,
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
    fontSize: 32,
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
  editIcon: {
    fontSize: 18,
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
  deleteIcon: {
    fontSize: 16,
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
});

export default ItemManagementScreen;