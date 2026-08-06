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
  Spinner,
} from '@chakra-ui/react';
import { FiMapPin, FiClock } from 'react-icons/fi';
import { useReports } from '../hooks/useApi';

const MOCK_REPORTS = [
  { 
    id: 'mock-1', 
    type: 'Stagnant Water', 
    reporter: 'John Doe', 
    location: 'Makoko', 
    severity: 'High', 
    time: '15 mins ago',
    image: 'https://images.unsplash.com/photo-1541604193435-22587c32c782?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    description: 'Large pool of standing water after heavy rain. High mosquito activity reported.'
  },
  { 
    id: 'mock-2', 
    type: 'Sick Children', 
    reporter: 'Jane Smith', 
    location: 'Lagos Island', 
    severity: 'Critical', 
    time: '1 hour ago',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    description: '3 children showing cholera symptoms (vomiting/diarrhea) in Sector 4.'
  },
  { 
    id: 'mock-3', 
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
  const { data: dbReports, isLoading } = useReports();

  const reportList = React.useMemo(() => {
    const dbReportsMapped = (dbReports || []).map((r: any) => {
      const typeLabels: Record<string, string> = {
        STAGNANT_WATER: 'Stagnant Water',
        WASTE_BUILDUP: 'Waste Accumulation',
        FLOODING: 'Localized Flooding',
        SICK_CHILD: 'Sick Child Cluster',
        MOSQUITO_BREEDING: 'Mosquito Breeding Site',
      };

      let timeStr = 'Just now';
      if (r.created_at) {
        try {
          const diffMs = Date.now() - new Date(r.created_at).getTime();
          const diffMins = Math.floor(diffMs / 60000);
          if (diffMins < 1) timeStr = 'Just now';
          else if (diffMins < 60) timeStr = `${diffMins} mins ago`;
          else {
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) timeStr = `${diffHours} hours ago`;
            else timeStr = new Date(r.created_at).toLocaleDateString();
          }
        } catch (e) {}
      }

      return {
        id: r.id,
        type: typeLabels[r.type] || r.type,
        reporter: r.reporter_id ? `Officer ${r.reporter_id.slice(0, 4).toUpperCase()}` : 'Field Officer',
        location: r.location?.coordinates 
          ? `GPS: ${r.location.coordinates[1].toFixed(4)}, ${r.location.coordinates[0].toFixed(4)}`
          : 'Nairobi Region',
        severity: r.severity ? r.severity.charAt(0) + r.severity.slice(1).toLowerCase() : 'Moderate',
        time: timeStr,
        image: r.image_url || 'https://images.unsplash.com/photo-1541604193435-22587c32c782?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        description: r.description || 'No description details provided.',
        status: r.status,
      };
    });

    return [...dbReportsMapped, ...MOCK_REPORTS];
  }, [dbReports]);

  const pendingCount = reportList.filter(r => r.status !== 'RESOLVED').length;

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Community Reporting Center</Heading>
        <HStack>
          <Tag size="lg" variant="subtle" colorScheme="orange">{pendingCount} Pending</Tag>
          <Tag size="lg" variant="subtle" colorScheme="green">142 Resolved</Tag>
        </HStack>
      </Flex>
      
      {isLoading ? (
        <Spinner size="lg" color="brand.500" />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {reportList.map(r => <ReportCard key={r.id} report={r} />)}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default Reports;
