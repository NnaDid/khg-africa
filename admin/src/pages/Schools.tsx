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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
} from '@chakra-ui/react';
import { FiThermometer, FiDroplet, FiWind, FiSun, FiUsers } from 'react-icons/fi';

const schools = [
  { id: 1, name: 'Lagos Model School', temp: 28, humidity: 65, airQuality: 'Good', uv: 'Low', crowding: 0.8, score: 92 },
  { id: 2, name: 'Mainland Academy', temp: 34, humidity: 80, airQuality: 'Moderate', uv: 'High', crowding: 1.2, score: 65 },
  { id: 3, name: 'Coastal Primary', temp: 31, humidity: 72, airQuality: 'Poor', uv: 'Med', crowding: 0.9, score: 78 },
];

const SchoolCard = ({ school }: any) => (
  <Box p={5} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
    <HStack justify="space-between" mb={4}>
      <VStack align="start" spacing={0}>
        <Text fontWeight="bold" fontSize="lg">{school.name}</Text>
        <Badge colorScheme={school.score > 80 ? 'green' : school.score > 60 ? 'yellow' : 'red'}>
           Safety Score: {school.score}/100
        </Badge>
      </VStack>
      <Icon as={FiUsers} boxSize={5} color="gray.300" />
    </HStack>

    <SimpleGrid columns={2} spacing={4} mb={4}>
      <HStack>
        <Icon as={FiThermometer} color="orange.400" />
        <Text fontSize="sm">{school.temp}°C</Text>
      </HStack>
      <HStack>
        <Icon as={FiDroplet} color="blue.400" />
        <Text fontSize="sm">{school.humidity}%</Text>
      </HStack>
      <HStack>
        <Icon as={FiWind} color="green.400" />
        <Text fontSize="sm">{school.airQuality}</Text>
      </HStack>
      <HStack>
        <Icon as={FiSun} color="yellow.400" />
        <Text fontSize="sm">UV: {school.uv}</Text>
      </HStack>
    </SimpleGrid>

    <VStack align="start" spacing={2} pt={2} borderTop="1px solid" borderColor="whiteAlpha.50">
      <Text fontSize="xs" fontWeight="bold" color="brand.400">AI RECOMMENDATION:</Text>
      <Text fontSize="xs" fontStyle="italic">
        {school.temp > 32 ? 'Implement hydration breaks and reduce outdoor activities.' : 'Conditions stable, maintain normal schedules.'}
      </Text>
    </VStack>
  </Box>
);

const Schools = () => {
  return (
    <Box>
      <Heading size="lg" mb={6}>School Monitoring Module</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
        {schools.map(s => <SchoolCard key={s.id} school={s} />)}
      </SimpleGrid>

      <Box p={6} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
        <Heading size="md" mb={6}>National School Safety Ledger</Heading>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>School ID</Th>
              <Th>Region</Th>
              <Th>Environmental Risk</Th>
              <Th>Health Status</Th>
              <Th>Last Sync</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>SCH-001</Td>
              <Td>Epe</Td>
              <Td><Badge colorScheme="green">LOW</Badge></Td>
              <Td>Normal</Td>
              <Td>2 mins ago</Td>
              <Td><Button size="xs" colorScheme="brand" variant="ghost">Details</Button></Td>
            </Tr>
            <Tr>
              <Td>SCH-002</Td>
              <Td>Ikeja</Td>
              <Td><Badge colorScheme="orange">MODERATE</Badge></Td>
              <Td>High Temp</Td>
              <Td>5 mins ago</Td>
              <Td><Button size="xs" colorScheme="brand" variant="ghost">Details</Button></Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default Schools;
