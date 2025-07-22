/**
 * Complete Profile Integration Service
 * 
 * Handles the integration between OAuth authentication and your backend
 * user profile completion system.
 */

import apiService from './apiService';

class ProfileIntegrationService {
  /**
   * Complete user signup flow by integrating Cognito user with backend profile
   * @param {Object} cognitoUser - User data from Cognito
   * @param {Object} profileData - Additional profile data from forms
   * @param {string} role - User role ('patient' or 'provider')
   * @returns {Promise} - Promise that resolves when profile is complete
   */
  async completeUserProfile(cognitoUser, profileData, role = 'patient') {
    try {
      // Prepare user data from Cognito token
      const user = {
        cognito_sub: cognitoUser.sub,
        email: cognitoUser.email,
        first_name: cognitoUser.given_name,
        last_name: cognitoUser.family_name,
      };

      // Prepare the complete profile payload
      // For patient role, structure the data according to your backend expectations
      if (role === 'patient') {
        const completePayload = {
          role,
          user,
          dob: profileData.dob,
          gender: profileData.gender,
          address: profileData.address,
          phone_number: profileData.phoneNumber,
          insurance: profileData.insurance || null,
          current_medication: profileData.currentMedication || null,
          health_provider_id: profileData.healthProviderId || null,
          password: profileData.password, // This might be handled differently in production
          symptoms: profileData.symptoms || [],
          languages: profileData.languages || [],
          preferences: profileData.preferences || {
            preferredProviderGender: null,
            smsOptIn: false,
            languagePreference: null,
            insuranceRequired: false,
            optInContact: false,
          }
        };

        return await apiService.completeUserProfile(completePayload);
      }

      // For provider role
      if (role === 'provider') {
        const completePayload = {
          role,
          user,
          insurance_networks: profileData.insuranceNetworks || [],
          location: profileData.location,
          specialty: profileData.specialty || [],
          gender: profileData.gender,
          experience_years: profileData.experienceYears,
          education: profileData.education,
          focus_groups: profileData.focusGroups || [],
          about_me: profileData.aboutMe,
          languages: profileData.languages || [],
          hobbies: profileData.hobbies,
          quote: profileData.quote,
          calendly_url: profileData.calendlyUrl,
          headshot_url: profileData.headshotUrl,
          password: profileData.password,
        };

        return await apiService.completeUserProfile(completePayload);
      }

      throw new Error('Invalid role specified');
    } catch (error) {
      console.error('Profile completion error:', error);
      throw error;
    }
  }

  /**
   * Get current user profile from backend
   * Note: With OAuth, user data should be passed as parameters or retrieved from AuthContext
   * @returns {Promise} - Promise that resolves with user profile
   */
  async getCurrentUserProfile() {
    try {
      const backendProfile = await apiService.getUserProfile();
      
      return {
        profile: backendProfile
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Check if user has completed their profile in the backend
   * @returns {Promise<boolean>} - True if profile is complete
   */
  async isProfileComplete() {
    try {
      const profile = await this.getCurrentUserProfile();
      return profile.profile && profile.profile.is_active;
    } catch (error) {
      console.error('Error checking profile status:', error);
      return false;
    }
  }
}

const profileIntegrationService = new ProfileIntegrationService();
export default profileIntegrationService;
