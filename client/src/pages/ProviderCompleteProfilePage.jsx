import { useState } from 'react';
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
  MultiSelect,
  Divider,
  Progress,
  Card,
  NumberInput
} from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconArrowLeft, IconCheck, IconStethoscope } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/AuthContext';
import profileIntegrationService from '../services/profileIntegrationService';

/**
 * Provider Complete Profile Page Component
 * 
 * Form to collect comprehensive provider information
 */
const ProviderCompleteProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    insurance_networks: [],
    location: '',
    specialty: [],
    gender: '',
    experience_years: '',
    education: '',
    focus_groups: [],
    about_me: '',
    languages: [],
    hobbies: '',
    quote: '',
    calendly_url: '',
    headshot_url: ''
  });

  // Form options
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  const specialtyOptions = [
    { value: 'family-medicine', label: 'Family Medicine' },
    { value: 'internal-medicine', label: 'Internal Medicine' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'psychiatry', label: 'Psychiatry' },
    { value: 'emergency-medicine', label: 'Emergency Medicine' },
    { value: 'anesthesiology', label: 'Anesthesiology' },
    { value: 'radiology', label: 'Radiology' },
    { value: 'pathology', label: 'Pathology' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'ob-gyn', label: 'Obstetrics & Gynecology' },
    { value: 'oncology', label: 'Oncology' },
    { value: 'endocrinology', label: 'Endocrinology' }
  ];

  const insuranceNetworkOptions = [
    { value: 'aetna', label: 'Aetna' },
    { value: 'blue-cross', label: 'Blue Cross Blue Shield' },
    { value: 'cigna', label: 'Cigna' },
    { value: 'humana', label: 'Humana' },
    { value: 'united-healthcare', label: 'UnitedHealthcare' },
    { value: 'kaiser', label: 'Kaiser Permanente' },
    { value: 'medicare', label: 'Medicare' },
    { value: 'medicaid', label: 'Medicaid' },
    { value: 'tricare', label: 'TRICARE' },
    { value: 'anthem', label: 'Anthem' }
  ];

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' },
    { value: 'italian', label: 'Italian' },
    { value: 'portuguese', label: 'Portuguese' },
    { value: 'russian', label: 'Russian' },
    { value: 'chinese', label: 'Chinese (Mandarin)' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'korean', label: 'Korean' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'hindi', label: 'Hindi' }
  ];

  const focusGroupOptions = [
    { value: 'children', label: 'Children & Adolescents' },
    { value: 'elderly', label: 'Elderly Care' },
    { value: 'women-health', label: 'Women\'s Health' },
    { value: 'men-health', label: 'Men\'s Health' },
    { value: 'mental-health', label: 'Mental Health' },
    { value: 'chronic-conditions', label: 'Chronic Conditions' },
    { value: 'preventive-care', label: 'Preventive Care' },
    { value: 'sports-medicine', label: 'Sports Medicine' },
    { value: 'pain-management', label: 'Pain Management' },
    { value: 'addiction-recovery', label: 'Addiction & Recovery' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateProgress = () => {
    const requiredFields = ['location', 'specialty', 'gender', 'experience_years', 'education'];
    const filledRequired = requiredFields.filter(field => {
      if (Array.isArray(formData[field])) {
        return formData[field].length > 0;
      }
      return formData[field] && formData[field].toString().trim() !== '';
    }).length;
    
    const optionalFields = [
      'insurance_networks', 
      'focus_groups', 
      'about_me', 
      'languages',
      'hobbies',
      'quote',
      'calendly_url',
      'headshot_url'
    ];
    const filledOptional = optionalFields.filter(field => {
      if (Array.isArray(formData[field])) {
        return formData[field].length > 0;
      }
      return formData[field] && formData[field].trim() !== '';
    }).length;

    const totalFields = requiredFields.length + optionalFields.length;
    const filledFields = filledRequired + filledOptional;
    
    return Math.round((filledFields / totalFields) * 100);
  };

  const isFormValid = () => {
    return formData.location.trim() &&
           formData.specialty.length > 0 && 
           formData.gender && 
           formData.experience_years && 
           formData.education.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      notifications.show({
        title: 'Incomplete Form',
        message: 'Please fill in all required fields',
        color: 'red'
      });
      return;
    }

    if (!user) {
      notifications.show({
        title: 'Authentication Error',
        message: 'You must be logged in to complete your profile',
        color: 'red'
      });
      return;
    }

    setIsLoading(true);

    try {
      

      await profileIntegrationService.completeUserProfile(
        user, // Cognito user data
        formData,
        'provider' // Role
      );
      
      notifications.show({
        title: 'Profile Created Successfully',
        message: 'Your provider profile has been completed!',
        color: 'green',
        icon: <IconCheck size={16} />
      });

      // Redirect to provider dashboard
      navigate('/provider-dashboard');
      
    } catch (error) {
      console.error('Error creating provider profile:', error);
      notifications.show({
        title: 'Profile Creation Failed',
        message: error.response?.data?.error || 'An error occurred while creating your profile',
        color: 'red'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = calculateProgress();

  return (
    <Container size="md" py={40}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper shadow="sm" radius="md" p="xl">
          <Stack gap="lg">
            {/* Header */}
            <div>
              <Group mb="lg">
                <Link to="/providers" style={{ textDecoration: 'none' }}>
                  <Button variant="subtle" leftSection={<IconArrowLeft size={16} />}>
                    Back to Provider Page
                  </Button>
                </Link>
              </Group>
              
              <Group mb="md">
                <IconStethoscope size={24} color="var(--color-primary)" />
                <Title order={2} c="var(--color-primary)">
                  Complete Your Provider Profile
                </Title>
              </Group>
              
              <Text c="dimmed" mb="lg">
                Help patients find the right care by sharing your professional background and expertise.
              </Text>

              <Card withBorder p="md" mb="xl">
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={500}>Profile Completion</Text>
                  <Text size="sm" c="dimmed">{progress}%</Text>
                </Group>
                <Progress value={progress} size="sm" />
              </Card>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Stack gap="lg">
                {/* Basic Information */}
                <Divider label="Basic Information" labelPosition="center" />
                
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Practice Location"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      required
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Select
                      label="Gender"
                      placeholder="Select your gender"
                      data={genderOptions}
                      value={formData.gender}
                      onChange={(value) => handleInputChange('gender', value)}
                      required
                    />
                  </Grid.Col>
                </Grid>

                <MultiSelect
                  label="Medical Specialties"
                  placeholder="Select your specialties"
                  data={specialtyOptions}
                  value={formData.specialty}
                  onChange={(value) => handleInputChange('specialty', value)}
                  required
                />

                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <NumberInput
                      label="Years of Experience"
                      placeholder="Enter years of practice"
                      min={0}
                      max={50}
                      value={formData.experience_years}
                      onChange={(value) => handleInputChange('experience_years', value)}
                      required
                    />
                  </Grid.Col>
                </Grid>

                <Textarea
                  label="Education & Credentials"
                  placeholder="Medical school, residency, board certifications, etc."
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  minRows={3}
                  required
                />

                {/* Professional Details */}
                <Divider label="Professional Details" labelPosition="center" />

                <MultiSelect
                  label="Insurance Networks"
                  placeholder="Select accepted insurance plans"
                  data={insuranceNetworkOptions}
                  value={formData.insurance_networks}
                  onChange={(value) => handleInputChange('insurance_networks', value)}
                />

                <MultiSelect
                  label="Patient Focus Groups"
                  placeholder="Select patient populations you specialize in"
                  data={focusGroupOptions}
                  value={formData.focus_groups}
                  onChange={(value) => handleInputChange('focus_groups', value)}
                />

                <MultiSelect
                  label="Languages Spoken"
                  placeholder="Select languages you speak"
                  data={languageOptions}
                  value={formData.languages}
                  onChange={(value) => handleInputChange('languages', value)}
                />

                {/* Personal Touch */}
                <Divider label="Personal Information" labelPosition="center" />

                <Textarea
                  label="About Me"
                  placeholder="Tell patients about your approach to healthcare and what makes you unique..."
                  value={formData.about_me}
                  onChange={(e) => handleInputChange('about_me', e.target.value)}
                  minRows={4}
                />

                <TextInput
                  label="Professional Quote"
                  placeholder="A personal motto or quote that represents your practice philosophy"
                  value={formData.quote}
                  onChange={(e) => handleInputChange('quote', e.target.value)}
                />

                <TextInput
                  label="Hobbies & Interests"
                  placeholder="What you enjoy outside of medicine"
                  value={formData.hobbies}
                  onChange={(e) => handleInputChange('hobbies', e.target.value)}
                />

                {/* Scheduling */}
                <Divider label="Scheduling" labelPosition="center" />

                <TextInput
                  label="Calendly URL (Optional)"
                  placeholder="https://calendly.com/your-username"
                  value={formData.calendly_url}
                  onChange={(e) => handleInputChange('calendly_url', e.target.value)}
                />

                {/* Profile Photo */}
                <Divider label="Profile Photo" labelPosition="center" />

                <TextInput
                  label="Headshot URL (Optional)"
                  placeholder="https://example.com/your-photo.jpg"
                  value={formData.headshot_url}
                  onChange={(e) => handleInputChange('headshot_url', e.target.value)}
                  description="Link to your professional headshot photo"
                />

                {/* Submit */}
                <Group justify="space-between" mt="xl">
                  <Text size="sm" c="dimmed">
                    All required fields must be completed
                  </Text>
                  <Button
                    type="submit"
                    loading={isLoading}
                    disabled={!isFormValid()}
                    leftSection={<IconCheck size={16} />}
                    size="lg"
                  >
                    Complete Profile
                  </Button>
                </Group>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default ProviderCompleteProfilePage;
