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
  Image,
  Button,
  Avatar,
  Tag,
  Flex,
} from '@chakra-ui/react';
import { FiMapPin, FiClock } from 'react-icons/fi';

const reports = [
  { 
    id: 1, 
    type: 'Stagnant Water', 
    reporter: 'John Doe', 
    location: 'Makoko', 
    severity: 'High', 
    time: '15 mins ago',
    image: 'https://images.unsplash.com/photo-1541604193435-22587c32c782?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    description: 'Large pool of standing water after heavy rain. High mosquito activity reported.'
  },
  { 
    id: 2, 
    type: 'Sick Children', 
    reporter: 'Jane Smith', 
    location: 'Lagos Island', 
    severity: 'Critical', 
    time: '1 hour ago',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    description: '3 children showing cholera symptoms (vomiting/diarrhea) in Sector 4.'
  },
  { 
    id: 3, 
    type: 'Waste Buildup', 
    reporter: 'Ali Musa', 
    location: 'Ikeja', 
    severity: 'Moderate', 
    time: '3 hours ago',
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    description: 'Illegal dumping site near school entrance. Attracting rodents.'
  },
];

const ReportCard = ({ report }: any) => (
  <Box bg="bg.card" borderRadius="xl" overflow="hidden" border="1px solid" borderColor="whiteAlpha.100">
    <Box h="200px" overflow="hidden">
      <Image src={report.image} alt={report.type} w="100%" h="100%" objectFit="cover" />
    </Box>
    <Box p={5}>
      <HStack justify="space-between" mb={3}>
        <Badge colorScheme={report.severity === 'Critical' ? 'red' : report.severity === 'High' ? 'orange' : 'yellow'}>
          {report.severity} Severity
        </Badge>
        <HStack spacing={1} color="gray.300" fontSize="xs">
          <Icon as={FiClock} />
          <Text>{report.time}</Text>
        </HStack>
      </HStack>

      <Heading size="md" mb={2}>{report.type}</Heading>
      <Text fontSize="sm" color="gray.400" mb={4} noOfLines={2}>
        {report.description}
      </Text>

      <VStack align="stretch" spacing={3} mb={4}>
        <HStack>
          <Icon as={FiMapPin} color="brand.500" />
          <Text fontSize="sm">{report.location}</Text>
        </HStack>
        <HStack>
          <Avatar size="xs" name={report.reporter} />
          <Text fontSize="sm">Reported by {report.reporter}</Text>
        </HStack>
      </VStack>

      <HStack spacing={2}>
        <Button size="sm" colorScheme="brand" flex={1}>Escalate</Button>
        <Button size="sm" variant="outline" flex={1}>Resolved</Button>
      </HStack>
    </Box>
  </Box>
);

const Reports = () => {
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Community Reporting Center</Heading>
        <HStack>
          <Tag size="lg" variant="subtle" colorScheme="orange">24 Pending</Tag>
          <Tag size="lg" variant="subtle" colorScheme="green">142 Resolved</Tag>
        </HStack>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {reports.map(r => <ReportCard key={r.id} report={r} />)}
      </SimpleGrid>
    </Box>
  );
};

export default Reports;
