import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { FiInfo, FiTrendingUp, FiCloudRain, FiThermometer } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';

const predictions = [
  { region: 'Lagos Island', disease: 'Malaria', probability: 87, level: 'High', factors: ['Rainfall', 'Humidity', 'Stagnant Water'], forecast: '+12% next week' },
  { region: 'Victoria Island', disease: 'Cholera', probability: 42, level: 'Moderate', factors: ['Flooding', 'Water Quality'], forecast: '-5% next week' },
  { region: 'Ikeja', disease: 'Dengue', probability: 15, level: 'Low', factors: ['Mosquito Activity'], forecast: 'Stable' },
  { region: 'Apapa', disease: 'Heat Stress', probability: 92, level: 'Critical', factors: ['UV Index', 'Temp > 38°C'], forecast: '+15% next week' },
];

const AIPredictions = () => {
  return (
    <Box>
      <VStack align="start" spacing={1} mb={8}>
        <Heading size="lg">AI Disease Outbreak Dashboard</Heading>
        <Text color="gray.500">FastAPI ML Engine predictions based on real-time climate data</Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={6} mb={8}>
        {predictions.map((p) => (
          <Box key={`${p.region}-${p.disease}`} p={5} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
            <HStack justify="space-between" mb={4}>
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" color="gray.500">{p.region}</Text>
                <Text fontSize="xl" fontWeight="bold">{p.disease}</Text>
              </VStack>
              <Badge colorScheme={p.level === 'Critical' ? 'red' : p.level === 'High' ? 'orange' : 'yellow'} p={2} borderRadius="md">
                {p.level} RISK
              </Badge>
            </HStack>
            
            <VStack align="stretch" spacing={3}>
              <Box>
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="xs">Outbreak Probability</Text>
                  <Text fontSize="xs" fontWeight="bold">{p.probability}%</Text>
                </HStack>
                <Progress value={p.probability} colorScheme={p.probability > 70 ? 'red' : p.probability > 40 ? 'orange' : 'green'} size="sm" borderRadius="full" />
              </Box>

              <Box>
                <Text fontSize="xs" color="gray.500" mb={2}>Contributing Drivers:</Text>
                <HStack spacing={2} flexWrap="wrap">
                  {p.factors.map(f => (
                    <Badge key={f} variant="outline" fontSize="2xs" colorScheme="blue">{f}</Badge>
                  ))}
                </HStack>
              </Box>

              <HStack color="cyan.400" fontSize="sm">
                <Icon as={FiTrendingUp} />
                <Text>{p.forecast}</Text>
              </HStack>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>

      <Box p={6} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
        <Heading size="md" mb={6}>Regional Risk Comparison</Heading>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Region</Th>
              <Th>Disease Type</Th>
              <Th>Risk Score</Th>
              <Th>Confidence</Th>
              <Th>Primary Driver</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td fontWeight="bold">Badagry</Td>
              <Td>Cholera</Td>
              <Td><Badge colorScheme="red">94%</Badge></Td>
              <Td>High (0.92)</Td>
              <Td><Icon as={FiCloudRain} mr={2} />Flooding</Td>
              <Td><Text color="brand.500" cursor="pointer" fontSize="xs">DISPATCH TEAM</Text></Td>
            </Tr>
            <Tr>
              <Td fontWeight="bold">Epe</Td>
              <Td>Malaria</Td>
              <Td><Badge colorScheme="orange">68%</Badge></Td>
              <Td>Med (0.75)</Td>
              <Td><Icon as={FiCloudRain} mr={2} />Rainfall</Td>
              <Td><Text color="brand.500" cursor="pointer" fontSize="xs">VIEW DETAILS</Text></Td>
            </Tr>
            <Tr>
              <Td fontWeight="bold">Ikorodu</Td>
              <Td>Heat Stress</Td>
              <Td><Badge colorScheme="red">81%</Badge></Td>
              <Td>High (0.88)</Td>
              <Td><Icon as={FiThermometer} mr={2} />High UV</Td>
              <Td><Text color="brand.500" cursor="pointer" fontSize="xs">ISSUE ALERT</Text></Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default AIPredictions;
