import React from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Select,
  Button,
  Flex,
} from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const diseaseData = [
  { name: 'Malaria', current: 400, predicted: 450 },
  { name: 'Cholera', current: 120, predicted: 300 },
  { name: 'Dengue', current: 80, predicted: 100 },
  { name: 'Heat Stress', current: 600, predicted: 850 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Analytics = () => {
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">National Health & Climate Analytics</Heading>
        <HStack>
           <Select defaultValue="Lagos" bg="bg.card" w="150px">
              <option value="Lagos">Lagos State</option>
              <option value="Kano">Kano State</option>
              <option value="Rivers">Rivers State</option>
           </Select>
           <Button colorScheme="brand">Export PDF</Button>
        </HStack>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <Box p={6} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
           <Text fontSize="lg" fontWeight="bold" mb={4}>Disease Prevalence: Current vs Predicted</Text>
           <Box h="350px">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={diseaseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                    <XAxis dataKey="name" stroke="#A0AEC0" />
                    <YAxis stroke="#A0AEC0" />
                    <Tooltip contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748' }} />
                    <Legend />
                    <Bar dataKey="current" fill="#8884d8" name="Current Cases" />
                    <Bar dataKey="predicted" fill="#00bcd4" name="Predicted (AI)" />
                 </BarChart>
              </ResponsiveContainer>
           </Box>
        </Box>

        <Box p={6} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
           <Text fontSize="lg" fontWeight="bold" mb={4}>Risk Zone Distribution</Text>
           <Box h="350px">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={[
                          { name: 'Critical', value: 15 },
                          { name: 'High', value: 25 },
                          { name: 'Moderate', value: 40 },
                          { name: 'Safe', value: 20 },
                       ]}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                    >
                       {diseaseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748' }} />
                    <Legend />
                 </PieChart>
              </ResponsiveContainer>
           </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default Analytics;
