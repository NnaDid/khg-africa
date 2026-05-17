import React from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  Flex,
  Text,
  Heading,
  VStack,
} from '@chakra-ui/react';
import { FiUsers, FiActivity, FiAlertTriangle, FiShield } from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const data = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 600 },
  { name: 'Thu', value: 800 },
  { name: 'Fri', value: 500 },
  { name: 'Sat', value: 900 },
  { name: 'Sun', value: 1100 },
];

const StatCard = ({ title, value, icon, trend, color }: any) => (
  <Box p={5} shadow="md" borderWidth="1px" borderRadius="xl" bg="bg.card">
    <Flex justifyContent="space-between" alignItems="center">
      <Box>
        <StatLabel fontWeight="medium" color="gray.500">
          {title}
        </StatLabel>
        <StatNumber fontSize="2xl" fontWeight="bold">
          {value}
        </StatNumber>
        <StatHelpText>
          <StatArrow type={trend > 0 ? 'increase' : 'decrease'} />
          {Math.abs(trend)}% from last week
        </StatHelpText>
      </Box>
      <Box
        p={3}
        bg={`${color}.500`}
        borderRadius="full"
        color="white"
        display="flex"
        alignItems="center"
        justifyContent="center">
        <Icon as={icon} boxSize={6} />
      </Box>
    </Flex>
  </Box>
);

const Dashboard = () => {
  return (
    <Box>
      <Heading size="lg" mb={6}>
        Global Overview
      </Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard title="Schools Monitored" value="1,240" icon={FiActivity} trend={12} color="blue" />
        <StatCard title="Active Alerts" value="48" icon={FiAlertTriangle} trend={-5} color="red" />
        <StatCard title="Children Protected" value="245.2k" icon={FiShield} trend={8} color="green" />
        <StatCard title="Communities Tracked" value="892" icon={FiUsers} trend={15} color="purple" />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <Box p={6} borderRadius="xl" bg="bg.card" border="1px solid" borderColor="whiteAlpha.100">
          <Text fontSize="lg" fontWeight="bold" mb={4}>Disease Outbreak Trends</Text>
          <Box h="300px">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00bcd4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                <XAxis dataKey="name" stroke="#A0AEC0" />
                <YAxis stroke="#A0AEC0" />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748' }}
                   itemStyle={{ color: '#E2E8F0' }}
                />
                <Area type="monotone" dataKey="value" stroke="#00bcd4" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        <Box p={6} borderRadius="xl" bg="bg.card" border="1px solid" borderColor="whiteAlpha.100">
          <Text fontSize="lg" fontWeight="bold" mb={4}>System Health</Text>
          <VStack spacing={4} align="stretch">
             {/* Add more stats or a small list of active emergencies */}
             <Flex justify="space-between" align="center" p={3} bg="whiteAlpha.50" borderRadius="md">
                <Text>Malaria Prediction Engine</Text>
                <Box px={2} py={1} bg="green.500" borderRadius="sm" fontSize="xs">ACTIVE</Box>
             </Flex>
             <Flex justify="space-between" align="center" p={3} bg="whiteAlpha.50" borderRadius="md">
                <Text>IoT Sensor Network</Text>
                <Box px={2} py={1} bg="green.500" borderRadius="sm" fontSize="xs">ACTIVE</Box>
             </Flex>
             <Flex justify="space-between" align="center" p={3} bg="whiteAlpha.50" borderRadius="md">
                <Text>SMS Alert Gateway</Text>
                <Box px={2} py={1} bg="orange.500" borderRadius="sm" fontSize="xs">DELAY</Box>
             </Flex>
             <Flex justify="space-between" align="center" p={3} bg="whiteAlpha.50" borderRadius="md">
                <Text>Satellite Imaging Hub</Text>
                <Box px={2} py={1} bg="green.500" borderRadius="sm" fontSize="xs">ACTIVE</Box>
             </Flex>
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;
