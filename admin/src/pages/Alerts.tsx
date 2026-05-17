import React from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  SimpleGrid,
} from '@chakra-ui/react';
import { FiBell, FiMail, FiMessageSquare, FiAlertTriangle, FiCheck, FiClock } from 'react-icons/fi';

const alerts = [
  { id: 1, type: 'Heatwave', severity: 'Critical', region: 'Ikeja', message: 'Temp expected to exceed 42°C for 3 days.', status: 'Sent', time: '10:00 AM' },
  { id: 2, type: 'Flood Risk', severity: 'High', region: 'Makoko', message: 'Heavy rainfall warning. Evacuation advised for Sector 2.', status: 'Pending', time: '11:30 AM' },
  { id: 3, type: 'Cholera Warning', severity: 'High', region: 'Lagos Island', message: 'Increased diarrheal cases reported. Boilers advised.', status: 'Sent', time: '12:15 PM' },
];

const Alerts = () => {
  return (
    <Box>
      <Heading size="lg" mb={6}>Alert & Notification Center</Heading>
      
      <Box p={6} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" mb={8}>
         <HStack justify="space-between" mb={6}>
            <Heading size="md">Recent Alert Logs</Heading>
            <Button colorScheme="red" leftIcon={<Icon as={FiAlertTriangle} />}>Broadcast Emergency Alert</Button>
         </HStack>
         
         <Table variant="simple" size="sm">
            <Thead>
               <Tr>
                  <Th>ID</Th>
                  <Th>Type</Th>
                  <Th>Severity</Th>
                  <Th>Region</Th>
                  <Th>Status</Th>
                  <Th>Channels</Th>
                  <Th>Action</Th>
               </Tr>
            </Thead>
            <Tbody>
               {alerts.map(a => (
                 <Tr key={a.id}>
                    <Td fontSize="xs">ALRT-{a.id}</Td>
                    <Td fontWeight="bold">{a.type}</Td>
                    <Td><Badge colorScheme={a.severity === 'Critical' ? 'red' : 'orange'}>{a.severity}</Badge></Td>
                    <Td>{a.region}</Td>
                    <Td>
                       <HStack>
                          <Icon as={a.status === 'Sent' ? FiCheck : FiClock} color={a.status === 'Sent' ? 'green.400' : 'orange.400'} />
                          <Text fontSize="xs">{a.status}</Text>
                       </HStack>
                    </Td>
                    <Td>
                       <HStack spacing={2}>
                          <Icon as={FiMail} color="blue.400" />
                          <Icon as={FiMessageSquare} color="green.400" />
                       </HStack>
                    </Td>
                    <Td>
                       <Button size="xs" variant="ghost">Resend</Button>
                    </Td>
                 </Tr>
               ))}
            </Tbody>
         </Table>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
         <Box p={5} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
            <Text fontWeight="bold" mb={2}>SMS Delivery Rate</Text>
            <Text fontSize="2xl">98.4%</Text>
            <Text fontSize="xs" color="gray.300">Last 24 hours via Termii</Text>
         </Box>
         <Box p={5} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
            <Text fontWeight="bold" mb={2}>Email Open Rate</Text>
            <Text fontSize="2xl">64.2%</Text>
            <Text fontSize="xs" color="gray.300">Government/NGO accounts</Text>
         </Box>
         <Box p={5} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
            <Text fontWeight="bold" mb={2}>Avg. Response Time</Text>
            <Text fontSize="2xl">4.2m</Text>
            <Text fontSize="xs" color="gray.300">Time to acknowledge alert</Text>
         </Box>
      </SimpleGrid>
    </Box>
  );
};

export default Alerts;
