import React from 'react';
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
} from '@chakra-ui/react';
import { FiTruck, FiMapPin, FiNavigation, FiCheckSquare } from 'react-icons/fi';

const teams = [
  { id: 1, name: 'Rapid Response Team A', task: 'Vaccine Distribution', location: 'Makoko', status: 'In Transit', progress: 65 },
  { id: 2, name: 'Mobile Clinic Unit 4', task: 'Disease Screening', location: 'Lagos Island', status: 'On Site', progress: 40 },
  { id: 3, name: 'Sanitation Squad', task: 'Waste Clearance', location: 'Ikeja', status: 'Completed', progress: 100 },
];

const Emergency = () => {
  return (
    <Box>
      <Heading size="lg" mb={6}>Emergency Response Module</Heading>
      
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={8}>
        <Box p={6} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
           <Heading size="md" mb={4}>Live Field Operations</Heading>
           <VStack spacing={6} align="stretch">
              {teams.map(team => (
                <Box key={team.id} p={4} bg="whiteAlpha.50" borderRadius="lg">
                   <HStack justify="space-between" mb={2}>
                      <HStack>
                         <Icon as={FiTruck} color="brand.500" />
                         <Text fontWeight="bold">{team.name}</Text>
                      </HStack>
                      <Badge colorScheme={team.status === 'Completed' ? 'green' : team.status === 'In Transit' ? 'blue' : 'orange'}>
                         {team.status}
                      </Badge>
                   </HStack>
                   <Text fontSize="sm" color="gray.400" mb={3}>{team.task} @ {team.location}</Text>
                   <Box>
                      <HStack justify="space-between" mb={1}>
                         <Text fontSize="xs">Task Progress</Text>
                         <Text fontSize="xs">{team.progress}%</Text>
                      </HStack>
                      <Progress value={team.progress} size="xs" colorScheme="brand" borderRadius="full" />
                   </Box>
                   <HStack mt={4} spacing={2}>
                      <Button size="xs" leftIcon={<Icon as={FiNavigation} />}>Track GPS</Button>
                      <Button size="xs" variant="outline">Assign Task</Button>
                   </HStack>
                </Box>
              ))}
           </VStack>
        </Box>

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
    </Box>
  );
};

export default Emergency;
