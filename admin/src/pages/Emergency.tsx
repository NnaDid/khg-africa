import React, { useState } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Badge,
  Icon,
  Button,
  Progress,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiTruck, FiMapPin, FiNavigation, FiCheckSquare, FiPlus } from 'react-icons/fi';
import { useInterventions, useDeployTeam } from '../hooks/useApi';
import { useAlerts } from '../hooks/useApi';
import { format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  DEPLOYED: 'blue',
  ON_SITE: 'orange',
  COMPLETED: 'green',
  RETURNING: 'purple',
};

const Emergency = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: interventions, isLoading: intLoading } = useInterventions();
  const { data: alerts } = useAlerts();
  const { mutate: deployTeam, isPending: deploying } = useDeployTeam();

  const [formData, setFormData] = useState({
    alert_id: '',
    team_name: '',
    action_taken: '',
    lat: -1.2921,
    lng: 36.8219,
  });

  const handleDeploy = () => {
    if (!formData.team_name || !formData.action_taken) {
      toast({ title: 'Fill in all fields', status: 'warning', duration: 3000, isClosable: true });
      return;
    }

    deployTeam(formData, {
      onSuccess: () => {
        toast({ title: 'Team Deployed!', description: `${formData.team_name} has been dispatched.`, status: 'success', duration: 5000, isClosable: true });
        onClose();
        setFormData({ alert_id: '', team_name: '', action_taken: '', lat: -1.2921, lng: 36.8219 });
      },
      onError: () => {
        toast({ title: 'Deployment Failed', description: 'Could not reach backend. Check server status.', status: 'error', duration: 5000, isClosable: true });
      },
    });
  };

  // Intervention stats (live from DB)
  const stats = {
    deployed: (interventions || []).filter((i: any) => i.status === 'DEPLOYED').length,
    onSite: (interventions || []).filter((i: any) => i.status === 'ON_SITE').length,
    completed: (interventions || []).filter((i: any) => i.status === 'COMPLETED').length,
    activeAlerts: (alerts || []).filter((a: any) => !a.is_resolved).length,
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Emergency Response Module</Heading>
        <Button colorScheme="red" leftIcon={<Icon as={FiPlus} />} onClick={onOpen}>
          Deploy Team
        </Button>
      </HStack>

      {/* Stats Row */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
        {[
          { label: 'Active Deployments', value: stats.deployed + stats.onSite, color: 'blue' },
          { label: 'Completed Missions', value: stats.completed, color: 'green' },
          { label: 'Open Alerts', value: stats.activeAlerts, color: 'red' },
          { label: 'Total Interventions', value: (interventions || []).length, color: 'purple' },
        ].map((s) => (
          <Box key={s.label} p={4} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" textAlign="center">
            <Text fontSize="3xl" fontWeight="bold" color={`${s.color}.400`}>{s.value}</Text>
            <Text fontSize="xs" color="gray.300">{s.label}</Text>
          </Box>
        ))}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={8}>
        {/* Live Field Operations */}
        <Box p={6} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Heading size="md" mb={4}>Live Field Operations</Heading>

          {intLoading ? (
            <Spinner color="brand.500" />
          ) : (interventions || []).length === 0 ? (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              No active interventions. Deploy a team to begin.
            </Alert>
          ) : (
            <VStack spacing={6} align="stretch">
              {(interventions || []).slice(0, 5).map((team: any) => (
                <Box key={team.id} p={4} bg="whiteAlpha.50" borderRadius="lg">
                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      <Icon as={FiTruck} color="brand.500" />
                      <Text fontWeight="bold">{team.team_name}</Text>
                    </HStack>
                    <Badge colorScheme={STATUS_COLORS[team.status] || 'gray'}>
                      {(team.status || '').replace(/_/g, ' ')}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.400" mb={3}>{team.action_taken}</Text>
                  {team.created_at && (
                    <Text fontSize="xs" color="gray.500">
                      Deployed: {format(new Date(team.created_at), 'MMM d, HH:mm')}
                    </Text>
                  )}
                  <HStack mt={3} spacing={2}>
                    <Button size="xs" leftIcon={<Icon as={FiNavigation} />} variant="ghost">Track GPS</Button>
                    <Button size="xs" variant="outline">Update Status</Button>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        {/* Intervention Statistics */}
        <Box p={6} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Heading size="md" mb={4}>Intervention Statistics</Heading>
          <SimpleGrid columns={2} spacing={4}>
            <Box p={4} bg="whiteAlpha.50" borderRadius="lg" textAlign="center">
              <Text fontSize="3xl" fontWeight="bold">1,240</Text>
              <Text fontSize="xs" color="gray.300">Nets Distributed</Text>
            </Box>
            <Box p={4} bg="whiteAlpha.50" borderRadius="lg" textAlign="center">
              <Text fontSize="3xl" fontWeight="bold">42</Text>
              <Text fontSize="xs" color="gray.300">Clinics Dispatched</Text>
            </Box>
            <Box p={4} bg="whiteAlpha.50" borderRadius="lg" textAlign="center">
              <Text fontSize="3xl" fontWeight="bold">8.5k</Text>
              <Text fontSize="xs" color="gray.300">Vaccines Administered</Text>
            </Box>
            <Box p={4} bg="whiteAlpha.50" borderRadius="lg" textAlign="center">
              <Text fontSize="3xl" fontWeight="bold">15</Text>
              <Text fontSize="xs" color="gray.300">Active Outbreaks Contained</Text>
            </Box>
          </SimpleGrid>
          <Button mt={8} w="100%" colorScheme="brand" leftIcon={<Icon as={FiCheckSquare} />}>
            Generate Field Report
          </Button>
        </Box>
      </SimpleGrid>

      {/* Deploy Team Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="gray.800" border="1px solid" borderColor="whiteAlpha.100">
          <ModalHeader>Deploy Emergency Response Team</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">Team Name</FormLabel>
                <Input
                  placeholder="e.g. Rapid Response Team Alpha"
                  value={formData.team_name}
                  onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                  bg="whiteAlpha.50"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Mission / Action</FormLabel>
                <Input
                  placeholder="e.g. Malaria net distribution — Kibera"
                  value={formData.action_taken}
                  onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
                  bg="whiteAlpha.50"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Linked Alert (optional)</FormLabel>
                <Select
                  placeholder="Select an active alert"
                  value={formData.alert_id}
                  onChange={(e) => setFormData({ ...formData, alert_id: e.target.value })}
                  bg="whiteAlpha.50"
                >
                  {(alerts || []).slice(0, 10).map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {(a.type || '').replace(/_/g, ' ')} — {a.location_id}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="red" isLoading={deploying} onClick={handleDeploy}>
              Dispatch Team
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Emergency;
