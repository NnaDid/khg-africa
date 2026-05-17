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
} from '@chakra-ui/react';
import { FiPlusSquare, FiTrendingUp, FiActivity, FiPackage } from 'react-icons/fi';

const clinics = [
  { id: 1, name: 'Central Children’s Hospital', influx: 'High', vaccines: 85, outbreaks: 2, readiness: 95 },
  { id: 2, name: 'Lekki General Clinic', influx: 'Normal', vaccines: 42, outbreaks: 0, readiness: 68 },
  { id: 3, name: 'Mainland Community Health', influx: 'Extreme', vaccines: 15, outbreaks: 5, readiness: 30 },
];

const Clinics = () => {
  return (
    <Box>
      <Heading size="lg" mb={6}>Clinic Monitoring Module</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        {clinics.map(c => (
          <Box key={c.id} p={5} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
            <HStack justify="space-between" mb={4}>
               <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">{c.name}</Text>
                  <Badge colorScheme={c.readiness > 80 ? 'green' : c.readiness > 50 ? 'yellow' : 'red'}>
                    Readiness: {c.readiness}%
                  </Badge>
               </VStack>
               <Icon as={FiPlusSquare} color="brand.500" />
            </HStack>

            <VStack align="stretch" spacing={4}>
               <Box>
                  <Text fontSize="xs" mb={1}>Vaccine Stock Levels</Text>
                  <Progress value={c.vaccines} size="sm" colorScheme={c.vaccines < 20 ? 'red' : 'green'} borderRadius="full" />
               </Box>
               <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                     <Text fontSize="xs" color="gray.500">Patient Influx</Text>
                     <Text fontWeight="bold" color={c.influx === 'Extreme' ? 'red.400' : 'inherit'}>{c.influx}</Text>
                  </VStack>
                  <VStack align="end" spacing={0}>
                     <Text fontSize="xs" color="gray.500">Outbreak Signals</Text>
                     <Text fontWeight="bold" color={c.outbreaks > 0 ? 'orange.400' : 'inherit'}>{c.outbreaks} Active</Text>
                  </VStack>
               </HStack>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>

      <Box p={6} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
         <Heading size="md" mb={6}>Supply Chain & Medical Inventory</Heading>
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
                  <Td fontWeight="bold">Central Children’s</Td>
                  <Td>Oral Rehydration Salts</Td>
                  <Td><Badge colorScheme="green">STOCK OK</Badge></Td>
                  <Td>Enabled</Td>
                  <Td><Icon as={FiTrendingUp} color="green.400" /></Td>
               </Tr>
               <Tr>
                  <Td fontWeight="bold">Mainland Community</Td>
                  <Td>Antimalarials (ACTs)</Td>
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
