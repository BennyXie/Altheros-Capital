import { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Paper, 
  Stack, 
  TextInput, 
  Select, 
  Textarea, 
  Button, 
  Group, 
  Grid, 
  Checkbox, 
  MultiSelect,
  Divider,
  Progress,
  Card,
  Loader
} from '@mantine/core';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/AuthContext';
import profileIntegrationService from '../services/profileIntegrationService';
import apiClient from '../utils/apiClient';

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [formData, setFormData] = useState({
    dob: '',
    gender: '',
    address: '',
    phoneNumber: '',
    preferences: {
      preferredProviderGender: '',
      smsOptIn: false,
      languagePreference: '',
      insuranceRequired: false,
      optInContact: false
    },
    insurance: '',
    currentMedication: '',
    symptoms: [],
    languages: []
  });

  console.log('DEBUG: isFetching at render:', isFetching);

  useEffect(() => {
    if (location.pathname === '/update-profile') {
      setIsUpdateMode(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isUpdateMode && user) {
      setIsFetching(true);
      const fetchProfileData = async () => {
        try {
          const { profile } = await profileIntegrationService.getCurrentUserProfile(user, 'patient');
          console.log('Full Patient Profile DB Output:', profile);

          if (profile) {
            setFormData(prevData => {
              const fetchedData = profile || {}; 
              const fetchedPreferences = fetchedData.preferences || {};

            const formattedPhoneNumber = fetchedData.phone_number ? formatPhoneNumberInput(fetchedData.phone_number) : '';
            console.log('DEBUG: formattedPhoneNumber in setFormData:', formattedPhoneNumber);

            const mappedSymptoms = Array.isArray(fetchedData.symptoms) ? fetchedData.symptoms.map(s => s).filter(Boolean) : [];
            const mappedLanguages = Array.isArray(fetchedData.languages) ? fetchedData.languages.map(l => l).filter(Boolean) : [];

            return {
              ...prevData,
              dob: fetchedData.dob || '',
              gender: fetchedData.gender || '',
              address: fetchedData.address || '',
              phoneNumber: formattedPhoneNumber,
              insurance: fetchedData.insurance || '',
              currentMedication: fetchedData.currentMedication || '',
              symptoms: mappedSymptoms,
              languages: mappedLanguages,
              preferences: {
                preferredProviderGender: fetchedPreferences.preferredProviderGender || '',
                smsOptIn: fetchedPreferences.smsOptIn || false,
                languagePreference: fetchedPreferences.languagePreference || '',
                insuranceRequired: fetchedPreferences.insuranceRequired || false,
                optInContact: fetchedPreferences.optInContact || false,
              },
            };
            });
          } else {
            console.log('UserCompleteProfilePage: Profile data was empty or null.');
          }
        } catch (error) {
          notifications.show({
            title: 'Fetch Error',
            message: 'Failed to fetch profile data.',
            color: 'red'
          });
        } finally {
          setIsFetching(false);
        }
      };
      fetchProfileData();
    }
  }, [isUpdateMode, user]);

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
    { value: 'other', label: 'Other' }
  ];

  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Italian', label: 'Italian' },
    { value: 'Portuguese', label: 'Portuguese' },
    { value: 'Chinese', label: 'Chinese' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Korean', label: 'Korean' },
    { value: 'Arabic', label: 'Arabic' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Russian', label: 'Russian' }
  ];

  const symptomOptions = [
    { value: 'fever', label: 'Fever' },
    { value: 'headache', label: 'Headache' },
    { value: 'cough', label: 'Cough' },
    { value: 'fatigue', label: 'Fatigue' },
    { value: 'nausea', label: 'Nausea' },
    { value: 'dizziness', label: 'Dizziness' },
    { value: 'chest-pain', label: 'Chest Pain' },
    { value: 'shortness-of-breath', label: 'Shortness of Breath' },
    { value: 'abdominal-pain', label: 'Abdominal Pain' },
    { value: 'joint-pain', label: 'Joint Pain' },
    { value: 'muscle-pain', label: 'Muscle Pain' },
    { value: 'skin-issues', label: 'Skin Issues' },
    { value: 'sleep-issues', label: 'Sleep Issues' },
    { value: 'anxiety', label: 'Anxiety' },
    { value: 'depression', label: 'Depression' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (field, value) => {
    console.log(`handleInputChange: field=${field}, value=${value}`);
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const calculateProgress = () => {
    const requiredFields = ['dob', 'gender', 'address', 'phoneNumber'];
    const filledRequired = requiredFields.filter(field => {
      return formData[field] && formData[field].toString().trim() !== '';
    }).length;
    
    const optionalFields = [
      'insurance', 
      'currentMedication', 
      'symptoms', 
      'languages',
      'preferences.preferredProviderGender',
      'preferences.languagePreference'
    ];
    const filledOptional = optionalFields.filter(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return formData[parent][child] && formData[parent][child] !== '';
      }
      return formData[field] && (Array.isArray(formData[field]) ? formData[field].length > 0 : formData[field].trim() !== '');
    }).length;

    const totalFields = requiredFields.length + optionalFields.length;
    const filledFields = filledRequired + filledOptional;
    
    return Math.round((filledFields / totalFields) * 100);
  };

  const formatDateInput = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 4) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    } else {
      return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    }
  };

  const handleDateChange = (value) => {
    const formatted = formatDateInput(value);
    handleInputChange('dob', formatted);
  };

  const formatPhoneNumberInput = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');

    // Apply formatting (e.g., (XXX) XXX-XXXX)
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length <= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else {
      // For more than 10 digits, just return the first 10 formatted
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handlePhoneNumberChange = (value) => {
    const formatted = formatPhoneNumberInput(value);
    handleInputChange('phoneNumber', formatted);
  };

  const isValidDate = (dateString) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;
    const [year, month, day] = dateString.split('-').map(num => parseInt(num));
    if (year < 1900 || year > new Date().getFullYear()) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  const isFormValid = () => {
    // Add defensive checks to prevent calling .trim() on undefined values
    const addressValid = typeof formData.address === 'string' && formData.address.trim() !== '';
    const phoneNumberValid = typeof formData.phoneNumber === 'string' && formData.phoneNumber.trim() !== '';

    return isValidDate(formData.dob) &&
           formData.gender && 
           addressValid && 
           phoneNumberValid;
  };

  

  console.log('Submitting formData:', formData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      notifications.show({
        title: 'Incomplete Form',
        message: 'Please fill in all required fields and ensure date is valid (YYYY-MM-DD format)',
        color: 'red'
      });
      return;
    }

    if (!user) {
      notifications.show({
        title: 'Authentication Error',
        message: 'User session not found. Please log in again.',
        color: 'red'
      });
      navigate('/login');
      return;
    }

    setIsLoading(true);

    try {
      if (isUpdateMode) {
        await profileIntegrationService.updateUserProfile(formData, 'patient');
        notifications.show({
          title: 'Profile Updated!',
          message: 'Your profile has been successfully updated.',
          color: 'green',
          icon: <IconCheck size={16} />
        });
      } else {
        await profileIntegrationService.completeUserProfile(user, formData, 'patient');
        notifications.show({
          title: 'Profile Completed!',
          message: 'Your profile has been successfully saved.',
          color: 'green',
          icon: <IconCheck size={16} />
        });
      }

      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (error) {
      console.error('Profile submission error:', error);
      notifications.show({
        title: isUpdateMode ? 'Update Failed' : 'Save Failed',
        message: error.message || 'An error occurred. Please try again.',
        color: 'red'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <Container size="md" py={40}><Loader /></Container>;
  }

  if (isFetching) {
    return <Container size="md" py={40}><Loader /></Container>;
  }

  return (
    <Container size="md" py={40}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <div>
              <Group align="center" gap="sm">
                <Button
                  component={Link}
                  to="/dashboard"
                  variant="subtle"
                  leftSection={<IconArrowLeft size={16} />}
                  size="sm"
                >
                  Back to Dashboard
                </Button>
              </Group>
              <Title order={1} mt="sm">{isUpdateMode ? 'Update Your Profile' : 'Complete Your Profile'}</Title>
              <Text c="dimmed" size="lg" mt={5}>
                {isUpdateMode ? 'Keep your information up to date.' : 'Help us provide you with personalized healthcare services'}
              </Text>
            </div>
          </Group>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" align="center" mb="xs">
              <Text fw={500}>Profile Completion</Text>
              <Text size="sm" c="dimmed">{calculateProgress()}%</Text>
            </Group>
            <Progress value={calculateProgress()} color="blue" size="lg" />
          </Card>

          <Paper shadow="md" p={30} radius="md" withBorder>
            <form onSubmit={handleSubmit}>
              <Stack gap="lg">
                <div>
                  <Title order={3} mb="sm">Basic Information</Title>
                  <Text size="sm" c="dimmed" mb="lg">Required fields are marked with *</Text>
                  
                  <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <TextInput
                        label="Date of Birth *"
                        placeholder="YYYY-MM-DD"
                        value={formData.dob}
                        onChange={(e) => handleDateChange(e.target.value)}
                        maxLength={10}
                        required
                        error={formData.dob && !isValidDate(formData.dob) ? 'Please enter a valid date in YYYY-MM-DD format' : null}
                      />
                      <Text size="xs" c="dimmed" mt={4}>
                        Enter your birth date in YYYY-MM-DD format (e.g., 1990-12-25)
                      </Text>
                    </Grid.Col>
                    
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Select
                        label="Gender *"
                        placeholder="Select your gender"
                        data={genderOptions}
                        value={formData.gender}
                        onChange={(value) => handleInputChange('gender', value)}
                        required
                      />
                      <Text size="xs" c="dimmed" mt={4} style={{ opacity: 0 }}>
                        Placeholder text for alignment
                      </Text>
                    </Grid.Col>
                    
                    <Grid.Col span={12}>
                      <TextInput
                        label="Mailing Address *"
                        placeholder="123 Main St, City, State, ZIP"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required
                      />
                    </Grid.Col>
                    
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <TextInput
                        label="Phone Number *"
                        placeholder="(555) 123-4567"
                        value={formData.phoneNumber || ''}
                        onChange={(e) => handlePhoneNumberChange(e.target.value)} // Use new handler
                        required
                      />
                    </Grid.Col>
                  </Grid>
                </div>

                <Divider />

                <div>
                  <Title order={3} mb="sm">Healthcare Preferences</Title>
                  <Text size="sm" c="dimmed" mb="lg">Help us match you with the right providers</Text>
                  
                  <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Select
                        label="Preferred Provider Gender"
                        placeholder="Any preference?"
                        data={[
                          { value: 'male', label: 'Male' },
                          { value: 'female', label: 'Female' },
                          { value: 'no-preference', label: 'No Preference' }
                        ]}
                        value={formData.preferences.preferredProviderGender}
                        onChange={(value) => handleInputChange('preferences.preferredProviderGender', value)}
                      />
                    </Grid.Col>
                    
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Select
                        label="Preferred Communication Language"
                        placeholder="Select language"
                        data={languageOptions}
                        value={formData.preferences.languagePreference}
                        onChange={(value) => handleInputChange('preferences.languagePreference', value)}
                        searchable
                      />
                    </Grid.Col>
                  </Grid>
                  
                  <Stack gap="md" mt="md">
                    <Checkbox
                      label="I consent to receive SMS messages for appointment reminders and health updates"
                      checked={formData.preferences.smsOptIn}
                      onChange={(e) => handleInputChange('preferences.smsOptIn', e.target.checked)}
                    />
                    
                    <Checkbox
                      label="I require providers who accept my insurance"
                      checked={formData.preferences.insuranceRequired}
                      onChange={(e) => handleInputChange('preferences.insuranceRequired', e.target.checked)}
                    />
                    
                    <Checkbox
                      label="I consent to be contacted directly by healthcare providers"
                      checked={formData.preferences.optInContact || false}
                      onChange={(e) => handleInputChange('preferences.optInContact', e.target.checked)}
                    />
                  </Stack>
                </div>

                <Divider />

                <div>
                  <Title order={3} mb="sm">Medical Information</Title>
                  <Text size="sm" c="dimmed" mb="lg">Optional - Help us understand your health needs better</Text>
                  
                  <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <TextInput
                        label="Insurance Provider"
                        placeholder="e.g., Blue Cross Blue Shield"
                        value={formData.insurance}
                        onChange={(e) => handleInputChange('insurance', e.target.value)}
                      />
                    </Grid.Col>
                    
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <MultiSelect
                        label="Languages You Speak"
                        placeholder="Select languages"
                        data={languageOptions}
                        value={formData.languages}
                        onChange={(value) => handleInputChange('languages', value)}
                        searchable
                      />
                    </Grid.Col>
                    
                    <Grid.Col span={12}>
                      <Textarea
                        label="Current Medications"
                        placeholder="List any medications you're currently taking..."
                        value={formData.currentMedication}
                        onChange={(e) => handleInputChange('currentMedication', e.target.value)}
                        rows={3}
                      />
                    </Grid.Col>
                    
                    <Grid.Col span={12}>
                      <MultiSelect
                        label="Current Symptoms (if any)"
                        placeholder="Select any symptoms you're experiencing"
                        data={symptomOptions}
                        value={formData.symptoms || []}
                        onChange={(value) => handleInputChange('symptoms', value)}
                        searchable
                      />
                    </Grid.Col>
                  </Grid>
                </div>

                <Group justify="space-between" mt="xl">
                  <Button 
                    variant="outline"
                    color="gray"
                    onClick={() => {
                      notifications.show({
                        title: 'Profile Incomplete',
                        message: 'You can complete your profile later from your dashboard.',
                        color: 'blue',
                      });
                      navigate('/user-dashboard');
                    }}
                  >
                    Skip for now
                  </Button>
                  
                  <Button 
                    type="submit"
                    disabled={!isFormValid()}
                    loading={isLoading}
                    leftSection={<IconCheck size={16} />}
                  >
                    {isUpdateMode ? 'Update Profile' : 'Complete Profile'}
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        </Stack>
      </motion.div>
    </Container>
  );
};

export default CompleteProfilePage;
