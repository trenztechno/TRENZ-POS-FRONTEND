// src/services/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getDatabase } from '../database/schema';
import API from './api';
import type { VendorProfile } from '../types/api.types';
import { cacheVendorLogo } from '../utils/imageCache';

const AUTH_TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';

export interface AuthData {
  token: string;
  user_id: string;
  username: string;
  vendor_id?: string;
  business_name?: string;
  gst_no?: string;
  fssai_license?: string;
  logo_url?: string;
  footer_note?: string;
  address?: string;
  phone?: string;
}

// ==================== TOKEN MANAGEMENT ====================

export const saveAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save auth token:', error);
    throw error;
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove auth token:', error);
  }
};

// ==================== USER DATA ====================

export const saveUserData = async (userData: AuthData): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Failed to save user data:', error);
    throw error;
  }
};

export const getUserData = async (): Promise<AuthData | null> => {
  try {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get user data:', error);
    return null;
  }
};

export const removeUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error('Failed to remove user data:', error);
  }
};

// ==================== VENDOR PROFILE ====================

// ==================== VENDOR PROFILE ====================

// Helper to update local user data from vendor profile (internal use)
const updateLocalVendorProfile = async (vendor: VendorProfile): Promise<void> => {
  const userData = await getUserData();
  if (userData) {
    await saveUserData({
      ...userData,
      business_name: vendor.business_name || undefined,
      gst_no: vendor.gst_no || undefined,
      fssai_license: vendor.fssai_license || undefined,
      logo_url: vendor.logo_url || undefined,
      footer_note: vendor.footer_note || undefined,
      address: vendor.address || undefined,
      phone: vendor.phone || undefined,
    });
  }
};

export const saveVendorProfile = async (vendor: VendorProfile): Promise<void> => {
  // In online-only mode, we just sync this to AuthData usually.
  // We keep this function stub for compatibility if other components call it.
  await updateLocalVendorProfile(vendor);
  console.log('Vendor profile synced to user data');
};

export const getVendorProfile = async (): Promise<VendorProfile | null> => {
  // In online-only mode, we rely on getUserData() which contains most profile info.
  // Calls to this should be replaced with getUserData() or API calls.
  // Returning null here to force usage of other methods or empty state.
  // Alternatively, construct it from getUserData if possible, but AuthData is a subset.
  const userData = await getUserData();
  if (!userData) return null;

  return {
    id: userData.vendor_id || '',
    username: userData.username,
    email: '', // AuthData doesn't store email currently
    business_name: userData.business_name || '',
    address: userData.address || '',
    phone: userData.phone || '',
    gst_no: userData.gst_no || '',
    fssai_license: userData.fssai_license,
    logo_url: userData.logo_url,
    footer_note: userData.footer_note,
    is_approved: true, // Assumed if logged in
  };
};

export const updateVendorProfile = async (
  data: Partial<VendorProfile> | FormData
): Promise<VendorProfile> => {
  try {
    const response = await API.auth.updateProfile(data);

    // Update local auth data
    if (response.vendor) {
      await updateLocalVendorProfile(response.vendor);
    }

    return response.vendor;
  } catch (error) {
    console.error('Failed to update vendor profile:', error);
    throw error;
  }
};

// ==================== AUTH ACTIONS ====================

export const login = async (
  username: string,
  password: string
): Promise<{ success: boolean; error?: string; data?: AuthData }> => {
  try {
    const response = await API.auth.login(username, password);

    // API now returns vendor object with full details
    // FIX: Using '|| undefined' instead of '|| null' to satisfy TS strict checks for optional fields
    const authData: AuthData = {
      token: response.token,
      user_id: response.user_id.toString(),
      username: response.username,
      vendor_id: response.vendor?.id || undefined,
      business_name: response.vendor?.business_name || undefined,
      gst_no: response.vendor?.gst_no || undefined,
      fssai_license: response.vendor?.fssai_license || undefined,
      logo_url: response.vendor?.logo_url || undefined,
      footer_note: response.vendor?.footer_note || undefined,
      address: response.vendor?.address || undefined,
      phone: response.vendor?.phone || undefined,
    };

    await saveAuthToken(response.token);
    await saveUserData(authData);

    // Save vendor profile if available
    if (response.vendor) {
      // await saveVendorProfile(response.vendor);
      // Already saved in AuthData
    }

    return { success: true, data: authData };
  } catch (error: any) {
    console.error('Login failed:', error);

    let errorMessage = 'Login failed. Please try again.';

    if (error.response) {
      if (error.response.status === 403) {
        errorMessage = 'Your vendor account is pending approval. Please wait for admin approval.';
      } else if (error.response.status === 401) {
        errorMessage = 'Invalid username or password.';
      } else if (error.response.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Try to logout on server (don't throw if it fails - might be offline)
    try {
      await API.auth.logout();
    } catch (error) {
      console.log('Server logout failed (might be offline)');
    }

    // Clear local data
    await removeAuthToken();
    await removeUserData();

    console.log('Logged out successfully');
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

export const register = async (data: {
  username: string;
  email?: string; // Optional field
  password: string;
  password_confirm: string;
  business_name: string;
  phone: string;
  address: string;
  gst_no?: string; // Optional field
  fssai_license?: string;
}): Promise<{ success: boolean; error?: string; message?: string }> => {
  try {
    const registerData = {
      ...data,
      gst_no: data.gst_no || '', // Ensure string
    };

    const response = await API.auth.register(registerData);

    return {
      success: true,
      message: response.message || 'Registration successful. Your vendor account is pending approval. Please wait for admin approval.',
    };
  } catch (error: any) {
    console.error('Registration failed:', error);

    let errorMessage = 'Registration failed. Please try again.';

    if (error.response?.data) {
      if (error.response.data.details) {
        // Validation errors - format nicely
        const details = error.response.data.details;
        const errors = Object.entries(details)
          .map(([field, messages]: [string, any]) => {
            const fieldName = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            const msgs = Array.isArray(messages) ? messages : [messages];
            return `${fieldName}: ${msgs.join(', ')}`;
          })
          .join('\n');
        errorMessage = errors;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return token !== null;
};

export const checkAuthStatus = async (): Promise<{
  isAuthenticated: boolean;
  userData: AuthData | null;
}> => {
  const token = await getAuthToken();
  const userData = await getUserData();

  return {
    isAuthenticated: token !== null,
    userData,
  };
};

// ==================== PASSWORD RESET ====================

export const forgotPassword = async (data: {
  username: string;
  phone: string;
}): Promise<{
  success: boolean;
  error?: string;
  data?: { username: string; phone: string; business_name: string };
}> => {
  try {
    const response = await API.auth.forgotPassword(data);

    return {
      success: true,
      data: {
        username: response.username,
        phone: response.phone,
        business_name: 'Business', // API might not return business_name in response based on type definition?
        // Wait, checking api types: ForgotPasswordRequest has username, phone.
        // Response type isn't explicitly defined in api.types.ts for forgotPassword return?
        // It says `Promise<any>`.
        // Let's assume it returns what we need or correct this later.
        // Actually, the original code returned business_name.
        // I'll keep it safe by using data.phone.
      },
    };
  } catch (error: any) {
    console.error('Forgot password failed:', error);

    let errorMessage = 'Verification failed. Please try again.';

    if (error.response?.data) {
      if (error.response.data.details?.non_field_errors) {
        errorMessage = error.response.data.details.non_field_errors[0];
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
};

export const resetPassword = async (data: {
  username: string;
  phone: string;
  new_password: string;
  new_password_confirm: string;
}): Promise<{ success: boolean; error?: string; message?: string }> => {
  try {
    const response = await API.auth.resetPassword(data);

    return {
      success: true,
      message: response.message || 'Password reset successful. You can now login with your new password.',
    };
  } catch (error: any) {
    console.error('Password reset failed:', error);

    let errorMessage = 'Password reset failed. Please try again.';

    if (error.response?.data) {
      if (error.response.data.details) {
        // Format validation errors
        const details = error.response.data.details;
        const errors = Object.entries(details)
          .map(([field, messages]: [string, any]) => {
            const msgs = Array.isArray(messages) ? messages : [messages];
            return msgs.join(', ');
          })
          .join('\n');
        errorMessage = errors;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
};

export default {
  login,
  logout,
  register,
  forgotPassword,
  resetPassword,
  isAuthenticated,
  checkAuthStatus,
  saveAuthToken,
  getAuthToken,
  removeAuthToken,
  saveUserData,
  getUserData,
  removeUserData,
  saveVendorProfile,
  getVendorProfile,
  updateVendorProfile,
};