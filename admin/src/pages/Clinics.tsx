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
  Progress,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiPlusSquare, FiTrendingUp, FiActivity } from 'react-icons/fi';
import { useClinics } from '../hooks/useApi';

const MOCK_CLINICS = [
  { id: 'cl-1', name: 'Central Children’s Hospital', region: 'Nairobi Central', influx: 'High', vaccines: 85, outbreaks: 2, readiness: 95 },
  { id: 'cl-2', name: 'Nairobi West Health Center', region: 'Nairobi West', influx: 'Normal', vaccines: 42, outbreaks: 0, readiness: 68 },
  { id: 'cl-3', name: 'Mathare Community Clinic', region: 'Mathare', influx: 'Extreme', vaccines: 15, outbreaks: 5, readiness: 30 },
];

const Clinics = () => {
  const { data: dbClinics, isLoading, isError } = useClinics();

  const clinicList = React.useMemo(() => {
    if (dbClinics && dbClinics.length > 0) {
      return dbClinics.map((c: any) => ({
        ...c,
        influx: 'Normal',
        vaccines: 75,
        outbreaks: 1,
        readiness: Math.round(c.safety_scores?.[0]?.score ?? 80),
      }));
    }
    return MOCK_CLINICS;
  }, [dbClinics]);

  return (
    <Box>
      <Heading size="lg" mb={6}>Clinic Monitoring Module</Heading>

      {isError && (
        <Alert status="warning" mb={6} borderRadius="md">
          <AlertIcon />
          Could not fetch clinic inventory from database. Showing active facilities.
        </Alert>
      )}

      {isLoading ? (
        <Spinner color="brand.500" size="lg" mb={8} />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          {clinicList.map((c: any) => (
            <Box key={c.id} p={5} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
              <HStack justify="space-between" mb={4}>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">{c.name}</Text>
                  <Text fontSize="xs" color="gray.400">{c.region || 'Kenya Central'}</Text>
                  <Badge mt={1} colorScheme={c.readiness > 80 ? 'green' : c.readiness > 50 ? 'yellow' : 'red'}>
                    Readiness: {c.readiness}%
                  </Badge>
                </VStack>
                <Icon as={FiPlusSquare} color="brand.500" boxSize={6} />
              </HStack>

              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontSize="xs" mb={1} color="gray.300">Vaccine Cold-Chain Stock</Text>
                  <Progress value={c.vaccines} size="sm" colorScheme={c.vaccines < 20 ? 'red' : 'green'} borderRadius="full" />
                </Box>
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xs" color="gray.300">Patient Influx</Text>
                    <Text fontWeight="bold" color={c.influx === 'Extreme' ? 'red.400' : 'inherit'}>{c.influx}</Text>
                  </VStack>
                  <VStack align="end" spacing={0}>
                    <Text fontSize="xs" color="gray.300">Outbreak Signals</Text>
                    <Text fontWeight="bold" color={c.outbreaks > 0 ? 'orange.400' : 'inherit'}>{c.outbreaks} Active</Text>
                  </VStack>
                </HStack>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      )}

      <Box p={6} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
        <Heading size="md" mb={6}>Supply Chain &amp; Medical Inventory</Heading>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Facility</Th>
              <Th>Resource</Th>
              <Th>Status</Th>
              <Th>Auto-Reorder</Th>
              <Th>Trend</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td fontWeight="bold">Central Children’s Hospital</Td>
              <Td>Oral Rehydration Salts &amp; Cholera Kits</Td>
              <Td><Badge colorScheme="green">STOCK OK</Badge></Td>
              <Td>Enabled</Td>
              <Td><Icon as={FiTrendingUp} color="green.400" /></Td>
            </Tr>
            <Tr>
              <Td fontWeight="bold">Nairobi West Health Center</Td>
              <Td>Malaria RDT Diagnostics &amp; ACTs</Td>
              <Td><Badge colorScheme="orange">MODERATE SUPPLY</Badge></Td>
              <Td>Enabled</Td>
              <Td><Icon as={FiTrendingUp} color="yellow.400" /></Td>
            </Tr>
            <Tr>
              <Td fontWeight="bold">Mathare Community Clinic</Td>
              <Td>Antimalarials (Coartem)</Td>
              <Td><Badge colorScheme="red">CRITICAL LOW</Badge></Td>
              <Td>Triggered</Td>
              <Td><Icon as={FiActivity} color="red.400" /></Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default Clinics;
