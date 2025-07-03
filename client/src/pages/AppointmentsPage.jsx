import { Container, Title, Text, Stack, Card, Group, Button, Badge, Avatar } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconCalendar, IconClock, IconUser, IconPlus, IconMapPin } from '@tabler/icons-react';

/**
 * Appointments Page Component
 * 
 * Page for managing and scheduling healthcare appointments
 */
const AppointmentsPage = () => {
  // Mock data for upcoming appointments
  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Test',
      specialty: 'Test',
      date: 'Test',
      time: 'Test',
      location: 'Test',
      type: 'Test'
    }
  ];

  return (
    <Container size="xl" py={40}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack gap="xl">
          {/* Header */}
          <Group justify="space-between" align="center">
            <div>
              <Title order={1} mb="xs">Appointments</Title>
              <Text c="dimmed" size="lg">
                Schedule and manage your healthcare appointments
              </Text>
            </div>
            <Button 
              leftSection={<IconPlus size={16} />}
              color="green"
              size="md"
            >
              Schedule New Appointment
            </Button>
          </Group>

          {/* Upcoming Appointments */}
          <div>
            <Title order={2} mb="md">Upcoming Appointments</Title>
            <Stack gap="md">
              {upcomingAppointments.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between" align="flex-start">
                      <Group align="flex-start">
                        <Avatar color="blue" radius="xl">
                          <IconUser size={20} />
                        </Avatar>
                        <div>
                          <Text fw={500} size="lg">{appointment.doctor}</Text>
                          <Text c="dimmed" size="sm" mb="xs">{appointment.specialty}</Text>
                          <Group gap="lg">
                            <Group gap="xs">
                              <IconCalendar size={14} color="var(--mantine-color-dimmed)" />
                              <Text size="sm">{appointment.date}</Text>
                            </Group>
                            <Group gap="xs">
                              <IconClock size={14} color="var(--mantine-color-dimmed)" />
                              <Text size="sm">{appointment.time}</Text>
                            </Group>
                            <Group gap="xs">
                              <IconMapPin size={14} color="var(--mantine-color-dimmed)" />
                              <Text size="sm">{appointment.location}</Text>
                            </Group>
                          </Group>
                        </div>
                      </Group>
                      <Badge color="green" variant="light">
                        {appointment.type}
                      </Badge>
                    </Group>
                  </Card>
                </motion.div>
              ))}
            </Stack>
          </div>

          {/* Quick Actions */}
          <div>
            <Title order={2} mb="md">Quick Actions</Title>
            <Group>
              <Button variant="light" color="blue" leftSection={<IconCalendar size={16} />}>
                View Calendar
              </Button>
              <Button variant="light" color="orange" leftSection={<IconClock size={16} />}>
                Reschedule Appointment
              </Button>
              <Button variant="light" color="red">
                Cancel Appointment
              </Button>
            </Group>
          </div>

          {/* Empty State for when no appointments */}
          {upcomingAppointments.length === 0 && (
            <Card shadow="sm" padding="xl" radius="md" withBorder>
              <Stack align="center" gap="md">
                <IconCalendar size={48} color="var(--mantine-color-dimmed)" />
                <div style={{ textAlign: 'center' }}>
                  <Text fw={500} size="lg" mb="xs">No upcoming appointments</Text>
                  <Text c="dimmed" mb="lg">
                    Schedule your first appointment to get started with your healthcare journey.
                  </Text>
                  <Button color="green" leftSection={<IconPlus size={16} />}>
                    Schedule Your First Appointment
                  </Button>
                </div>
              </Stack>
            </Card>
          )}
        </Stack>
      </motion.div>
    </Container>
  );
};

export default AppointmentsPage;
