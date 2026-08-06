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
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiThermometer, FiDroplet, FiWind, FiSun, FiUsers } from 'react-icons/fi';
import { useSchools } from '../hooks/useApi';
import { useAppStore } from '../store/useAppStore';

// Fallback school cards if DB is empty
const MOCK_SCHOOLS = [
  { id: 'sch-1', name: 'Nairobi West Primary School', region: 'Nairobi West', score: 92, temp: 28, humidity: 65, airQuality: 'Good', uv: 'Low' },
  { id: 'sch-2', name: 'Mainland Academy', region: 'Machakos', score: 65, temp: 34, humidity: 80, airQuality: 'Moderate', uv: 'High' },
  { id: 'sch-3', name: 'Coastal Primary', region: 'Mombasa', score: 78, temp: 31, humidity: 72, airQuality: 'Poor', uv: 'Med' },
];

const SchoolCard = ({ school }: any) => {
  const score = school.safety_scores?.[0]?.score ?? school.score ?? 85;
  const level = school.safety_scores?.[0]?.level ?? (score > 80 ? 'SAFE' : score > 60 ? 'MODERATE' : 'HIGH RISK');

  return (
    <Box p={5} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
      <HStack justify="space-between" mb={4}>
        <VStack align="start" spacing={0}>
          <Text fontWeight="bold" fontSize="lg">{school.name}</Text>
          <Text fontSize="xs" color="gray.400">{school.region || 'Kenya Central'}</Text>
          <Badge mt={1} colorScheme={score > 80 ? 'green' : score > 60 ? 'yellow' : 'red'}>
            Safety Score: {Math.round(score)}/100 ({level})
          </Badge>
        </VStack>
        <Icon as={FiUsers} boxSize={5} color="gray.300" />
      </HStack>

      <SimpleGrid columns={2} spacing={4} mb={4}>
        <HStack>
          <Icon as={FiThermometer} color="orange.400" />
          <Text fontSize="sm">{school.temp ?? 29}°C</Text>
        </HStack>
        <HStack>
          <Icon as={FiDroplet} color="blue.400" />
          <Text fontSize="sm">{school.humidity ?? 68}%</Text>
        </HStack>
        <HStack>
          <Icon as={FiWind} color="green.400" />
          <Text fontSize="sm">{school.airQuality ?? 'Good'}</Text>
        </HStack>
        <HStack>
          <Icon as={FiSun} color="yellow.400" />
          <Text fontSize="sm">UV: {school.uv ?? 'Moderate'}</Text>
        </HStack>
      </SimpleGrid>

      <VStack align="start" spacing={2} pt={2} borderTop="1px solid" borderColor="whiteAlpha.50">
        <Text fontSize="xs" fontWeight="bold" color="brand.400">AI RECOMMENDATION:</Text>
        <Text fontSize="xs" fontStyle="italic">
          {score < 70 ? 'Implement hydration breaks and reduce outdoor activities.' : 'Conditions stable, maintain normal school health protocols.'}
        </Text>
      </VStack>
    </Box>
  );
};

const Schools = () => {
  const { data: dbSchools, isLoading, isError } = useSchools();
  const { sensorFeed } = useAppStore();

  // Combine DB locations with fallback mock data
  const schoolList = React.useMemo(() => {
    if (dbSchools && dbSchools.length > 0) {
      return dbSchools.map((s: any) => ({
        ...s,
        score: s.safety_scores?.[0]?.score ?? 85,
      }));
    }
    return MOCK_SCHOOLS;
  }, [dbSchools]);

  return (
    <Box>
      <Heading size="lg" mb={6}>School Monitoring Module</Heading>

      {isError && (
        <Alert status="warning" mb={6} borderRadius="md">
          <AlertIcon />
          Could not fetch school registry from database. Showing default monitored schools.
        </Alert>
      )}

      {isLoading ? (
        <Spinner color="brand.500" size="lg" mb={8} />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
          {schoolList.map((s: any) => (
            <SchoolCard key={s.id} school={s} />
          ))}
        </SimpleGrid>
      )}

      <Box p={6} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
        <Heading size="md" mb={6}>National School Safety Ledger</Heading>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>School Name</Th>
              <Th>Region</Th>
              <Th>Environmental Risk</Th>
              <Th>Children Enrolled</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {schoolList.map((s: any) => {
              const score = s.score ?? 85;
              return (
                <Tr key={s.id}>
                  <Td fontWeight="bold">{s.name}</Td>
                  <Td>{s.region || 'Nairobi'}</Td>
                  <Td>
                    <Badge colorScheme={score > 80 ? 'green' : score > 60 ? 'yellow' : 'red'}>
                      {score > 80 ? 'LOW' : score > 60 ? 'MODERATE' : 'HIGH'}
                    </Badge>
                  </Td>
                  <Td>{s.total_children ?? '450'}</Td>
                  <Td>Active</Td>
                  <Td>
                    <Button size="xs" colorScheme="brand" variant="ghost">View Feed</Button>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default Schools;
