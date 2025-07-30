import { useState, useEffect, useRef } from 'react';
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
  NumberInput,
  FileInput,
  Image,
  Center,
  SegmentedControl,
  Box
} from '@mantine/core';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconArrowLeft, IconCheck, IconStethoscope, IconUpload, IconUserCircle, IconCamera, IconPhoto, IconRefresh } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/AuthContext';
import profileIntegrationService from '../services/profileIntegrationService';
import apiClient from '../utils/apiClient';

/**
 * Provider Complete Profile Page Component
 * 
 * Form to collect comprehensive provider information
 */
const ProviderCompleteProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, setAuthStatus } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // Renamed from 'file' to avoid confusion
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
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
    headshot_url: '',
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [captureMode, setCaptureMode] = useState('upload'); // 'upload' or 'camera'
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImageBlob, setCapturedImageBlob] = useState(null);

  useEffect(() => {
    if (location.pathname === '/provider-update-profile') {
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    console.log('ProviderCompleteProfilePage: useEffect triggered. isAuthenticated:', isAuthenticated, 'user:', user, 'isEditMode:', isEditMode);
    if (isAuthenticated && user) {
      const fetchProfile = async () => {
        console.log('ProviderCompleteProfilePage: Attempting to fetch profile for user:', user);
        try {
          const { profile } = await profileIntegrationService.getCurrentUserProfile(user);
          console.log('ProviderCompleteProfilePage: Fetched profile data:', profile);
          if (profile) {
            setFormData({
              first_name: profile.first_name || '',
              last_name: profile.last_name || '',
              insurance_networks: profile.insurance_networks || [],
              location: profile.location || '',
              specialty: profile.specialty || [],
              gender: profile.gender || '',
              experience_years: profile.experience_years || '',
              education: profile.education || '',
              focus_groups: profile.focus_groups || [],
              about_me: profile.about_me || '',
              languages: profile.languages || '',
              hobbies: profile.hobbies || '',
              quote: profile.quote || '',
              headshot_url: profile.headshot_url || '',
            });
            console.log('ProviderCompleteProfilePage: Form data set with fetched profile.');
            console.log('ProviderCompleteProfilePage: headshot_url from fetched profile:', profile.headshot_url);
          } else {
            console.log('ProviderCompleteProfilePage: Profile data was empty or null.');
          }
        } catch (error) {
          console.error('Error fetching provider profile:', error);
          notifications.show({
            title: 'Profile Load Error',
            message: 'Failed to load provider profile data.',
            color: 'red',
          });
        }
      };
      if (isEditMode) {
        fetchProfile();
      }
    } else if (!isAuthenticated) {
      console.log('ProviderCompleteProfilePage: User unauthenticated, navigating to login.');
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate, isEditMode]);

  // Camera logic
  const startCamera = async () => {
    console.log("startCamera function called.");
    setCapturedImageBlob(null);
    setFormData(prev => ({ ...prev, headshot_url: '' })); // Clear preview
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing camera:", err);
      notifications.show({
        title: 'Camera Access Denied',
        message: 'Please grant camera permissions to use this feature.',
        color: 'red',
      });
    }
  };

  // Effect to play video when stream and videoRef are ready
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log("Stream and videoRef ready. Attempting to play video.");
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(playErr => {
        console.error("Error playing video:", playErr);
        notifications.show({
          title: 'Video Playback Error',
          message: 'Could not play camera feed. Check browser settings.',
          color: 'red',
        });
      });
    }
  }, [stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
            if (blob) {
              const fileFromBlob = new File([blob], "headshot.png", { type: "image/png" });
              setSelectedFile(fileFromBlob);
              setCapturedImageBlob(blob);
              setFormData(prev => ({ ...prev, headshot_url: URL.createObjectURL(blob) }));
              stopCamera(); // Stop camera after taking photo
              
            }
          }, 'image/png');
    }
  };

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
    { value: 'women-health', label: "Women's Health" },
    { value: 'men-health', label: "Men's Health" },
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

  const handleFileChange = (fileInput) => {
    setSelectedFile(fileInput);
    if (fileInput) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, headshot_url: reader.result }));
      };
      reader.readAsDataURL(fileInput);
    } else {
      setFormData(prev => ({ ...prev, headshot_url: '' }));
    }
  };

  const uploadHeadshot = async (fileToUpload) => {
    if (!fileToUpload) return;

    setIsLoading(true);
    const formDataPayload = new FormData();
    formDataPayload.append('headshot', fileToUpload);

    try {
      const response = await apiClient.post('/api/headshot/headshot', formDataPayload, {}, true);
      notifications.show({
        title: 'Headshot Uploaded',
        message: 'Your headshot has been successfully uploaded.',
        color: 'green',
      });
      setFormData(prev => ({ ...prev, headshot_url: response.imageUrl }));
      return response.imageUrl; // Return the image URL
    } catch (error) {
      console.error('Error uploading headshot:', error);
      notifications.show({
        title: 'Upload Failed',
        message: error.response?.data?.error || 'An error occurred while uploading headshot.',
        color: 'red',
      });
      throw error; // Re-throw to prevent form submission if upload fails
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = () => {
    const requiredFields = ['first_name', 'last_name', 'location', 'specialty', 'gender', 'experience_years', 'education'];
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
      // 'headshot_url' is handled separately
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
    return formData.first_name.trim() &&
           formData.last_name.trim() &&
           formData.location.trim() &&
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
      // Upload headshot first if a new file is selected
      let newHeadshotUrl = formData.headshot_url; // Keep existing URL by default
      if (selectedFile) {
        newHeadshotUrl = await uploadHeadshot(selectedFile);
      }

      // Update formData with the new headshot URL before submitting the profile
      const finalFormData = { ...formData, headshot_url: newHeadshotUrl };

      if (isEditMode) {
        await profileIntegrationService.updateUserProfile(finalFormData, 'provider');
        notifications.show({
          title: 'Profile Updated Successfully',
          message: 'Your provider profile has been updated!',
          color: 'green',
          icon: <IconCheck size={16} />
        });
      } else {
        await profileIntegrationService.completeUserProfile(
          user, // Cognito user data
          finalFormData,
          'provider' // Role
        );
        notifications.show({
          title: 'Profile Created Successfully',
          message: 'Your provider profile has been completed!',
          color: 'green',
          icon: <IconCheck size={16} />
        });
        setAuthStatus('profile_complete'); // Update auth status
      }

      // Redirect to provider dashboard
      navigate('/provider-dashboard');
      
    } catch (error) {
      console.error('Error submitting provider profile:', error);
      notifications.show({
        title: isEditMode ? 'Profile Update Failed' : 'Profile Creation Failed',
        message: error.response?.data?.error || 'An error occurred while submitting your profile',
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
                  {isEditMode ? 'Update Your Provider Profile' : 'Complete Your Provider Profile'}
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
                      label="First Name"
                      placeholder="Your first name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      required
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Last Name"
                      placeholder="Your last name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      required
                    />
                  </Grid.Col>
                </Grid>

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

                {/* Profile Photo */}
                <Divider label="Profile Photo" labelPosition="center" />

                <Stack align="center" mb="md">
                  {formData.headshot_url ? (
                    <Image
                      src={formData.headshot_url}
                      alt="Headshot Preview"
                      radius="md"
                      h={200}
                      w={200}
                      fit="cover"
                    />
                  ) : (
                    <Center h={200} w={200} bg="gray.1" style={{ borderRadius: '7px' }}>
                      <IconUserCircle size={100} color="gray" />
                    </Center>
                  )}
                </Stack>

                <SegmentedControl
                  value={captureMode}
                  onChange={setCaptureMode}
                  data={[
                    { label: <Group gap="xs"><IconPhoto size={16} /> <Text>Upload File</Text></Group>, value: 'upload' },
                    { label: <Group gap="xs"><IconCamera size={16} /> <Text>Take Photo</Text></Group>, value: 'camera' },
                  ]}
                  fullWidth
                  mb="md"
                />

                {captureMode === 'upload' && (
                  <FileInput
                    label="Upload Headshot"
                    placeholder="Choose file"
                    accept="image/png,image/jpeg"
                    leftSection={<IconUpload size={16} />}
                    value={selectedFile}
                    onChange={handleFileChange}
                    clearable
                  />
                )}

                {captureMode === 'camera' && (
                  <Box>
                    <video 
                      ref={videoRef} 
                      style={{
                        width: '100%', 
                        maxWidth: '300px', 
                        borderRadius: '8px',
                        display: stream && !capturedImageBlob ? 'block' : 'none' 
                      }} 
                      autoPlay 
                      playsInline 
                    />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    {!stream && !capturedImageBlob && (
                      <Button onClick={startCamera} leftSection={<IconCamera size={16} />} fullWidth>
                        Open Camera
                      </Button>
                    )}

                    {stream && !capturedImageBlob && (
                      <Stack align="center" mt="md">
                        <Button onClick={takePhoto} leftSection={<IconCamera size={16} />}>
                          Take Photo
                        </Button>
                        <Button onClick={stopCamera} variant="outline" color="red">
                          Stop Camera
                        </Button>
                      </Stack>
                    )}

                    {capturedImageBlob && (
                      <Stack align="center" mt="md">
                        <Image
                          src={URL.createObjectURL(capturedImageBlob)}
                          alt="Captured Headshot Preview"
                          radius="md"
                          h={200}
                          w={200}
                          fit="cover"
                        />
                        <Button onClick={() => {
                          setCapturedImageBlob(null);
                          setSelectedFile(null);
                          setFormData(prev => ({ ...prev, headshot_url: '' }));
                          startCamera();
                        }} leftSection={<IconRefresh size={16} />}>
                          Retake Photo
                        </Button>
                      </Stack>
                    )}
                  </Box>
                )}

                {/* Submit */}
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
                      navigate('/provider-dashboard');
                    }}
                  >
                    Skip for now
                  </Button>
                  <Button
                    type="submit"
                    loading={isLoading}
                    disabled={!isFormValid()}
                    leftSection={<IconCheck size={16} />}
                    size="lg"
                  >
                    {isEditMode ? 'Update Profile' : 'Complete Profile'}
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