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
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Button,
} from '@chakra-ui/react';
import { FiTrendingUp, FiCloudRain, FiThermometer, FiSend } from 'react-icons/fi';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip } from 'recharts';
import { useAIPredictions } from '../hooks/useApi';
import { useDeployTeam } from '../hooks/useApi';
import { useAppStore } from '../store/useAppStore';

const RISK_COLORS: Record<string, string> = {
  CRITICAL: 'red',
  HIGH: 'orange',
  MODERATE: 'yellow',
  LOW: 'green',
  SAFE: 'green',
};

const AIPredictions = () => {
  const toast = useToast();
  const { data: predictions, isLoading, isError } = useAIPredictions();
  const { mutate: deployTeam, isPending: deploying } = useDeployTeam();
  const { sensorFeed } = useAppStore();

  const handleDispatch = (locationId: string, disease: string) => {
    deployTeam(
      {
        alert_id: `auto-${Date.now()}`,
        team_name: 'Rapid Response Team',
        action_taken: `Deployed for ${disease} outbreak response in ${locationId}`,
        lat: -1.2921,
        lng: 36.8219,
      },
      {
        onSuccess: () => {
          toast({ title: 'Team Dispatched', description: `Response unit deployed to ${locationId}`, status: 'success', duration: 4000, isClosable: true });
        },
        onError: () => {
          toast({ title: 'Dispatch Failed', status: 'error', duration: 4000, isClosable: true });
        },
      }
    );
  };

  // Build summary cards from unique disease/location pairs
  const summaryCards = React.useMemo(() => {
    if (!predictions?.length) return [];
    const groups: Record<string, any> = {};
    predictions.forEach((p: any) => {
      const key = `${p.disease_type}-${p.location_id}`;
      if (!groups[key] || new Date(p.timestamp) > new Date(groups[key].timestamp)) {
        groups[key] = p;
      }
    });
    return Object.values(groups).slice(0, 6);
  }, [predictions]);

  // Build trend chart from live sensor feed safety scores
  const trendData = Object.values(sensorFeed).slice(-10).map((f, i) => ({
    time: new Date(f.timestamp || new Date()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    score: Math.round(f.safety_score ?? 50),
  }));

  return (
    <Box>
      <VStack align="start" spacing={1} mb={8}>
        <Heading size="lg">AI Disease Outbreak Dashboard</Heading>
        <Text color="gray.400">FastAPI AI Engine predictions based on real-time KHG Smart Box sensor data</Text>
      </VStack>

      {isError && (
        <Alert status="warning" mb={6} borderRadius="md">
          <AlertIcon />
          Could not load predictions from database. Ensure the backend is running and simulation is active.
        </Alert>
      )}

      {isLoading ? (
        <Spinner color="brand.500" size="lg" />
      ) : summaryCards.length === 0 ? (
        <Alert status="info" mb={6} borderRadius="md">
          <AlertIcon />
          No predictions yet. Start the backend simulation engine or connect a KHG Smart Box device.
        </Alert>
      ) : (
        <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={6} mb={8}>
          {summaryCards.map((p: any) => {
            const level = p.risk_level || 'LOW';
            const score = Math.round((p.risk_score || 0) * 100);

            return (
              <Box key={`${p.disease_type}-${p.location_id}`} p={5} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
                <HStack justify="space-between" mb={4}>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="gray.300">{p.locations?.name || p.location_id || 'Unknown Location'}</Text>
                    <Text fontSize="xl" fontWeight="bold" textTransform="capitalize">
                      {(p.disease_type || 'Unknown').replace(/_/g, ' ')}
                    </Text>
                  </VStack>
                  <Badge colorScheme={RISK_COLORS[level] || 'gray'} p={2} borderRadius="md">
                    {level} RISK
                  </Badge>
                </HStack>

                <VStack align="stretch" spacing={3}>
                  <Box>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="xs" color="gray.300">Outbreak Probability</Text>
                      <Text fontSize="xs" fontWeight="bold">{score}%</Text>
                    </HStack>
                    <Progress
                      value={score}
                      colorScheme={score > 70 ? 'red' : score > 40 ? 'orange' : 'green'}
                      size="sm"
                      borderRadius="full"
                    />
                  </Box>

                  {p.recommendation && (
                    <Text fontSize="xs" color="gray.300" noOfLines={2}>{p.recommendation}</Text>
                  )}

                  {(level === 'HIGH' || level === 'CRITICAL') && (
                    <Button
                      size="xs"
                      colorScheme="red"
                      leftIcon={<Icon as={FiSend} />}
                      isLoading={deploying}
                      onClick={() => handleDispatch(p.location_id, p.disease_type)}
                    >
                      Dispatch Response Team
                    </Button>
                  )}
                </VStack>
              </Box>
            );
          })}
        </SimpleGrid>
      )}

      {/* Live Safety Score Chart */}
      {trendData.length > 0 && (
        <Box p={6} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" mb={8}>
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Live Safety Score Trend</Heading>
            <Badge colorScheme="cyan">REALTIME</Badge>
          </HStack>
          <Box h="250px">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00bcd4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                <XAxis dataKey="time" stroke="#A0AEC0" />
                <YAxis stroke="#A0AEC0" domain={[0, 100]} />
                <ChartTooltip
                  contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748' }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
                <Area type="monotone" dataKey="score" stroke="#00bcd4" fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      )}

      {/* Full Predictions Table */}
      <Box p={6} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
        <Heading size="md" mb={6}>All Predictions</Heading>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Location</Th>
              <Th>Disease Type</Th>
              <Th>Risk Score</Th>
              <Th>Level</Th>
              <Th>Recommendation</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {(predictions || []).slice(0, 20).map((p: any, i: number) => (
              <Tr key={`${p.id || i}`}>
                <Td fontWeight="bold">{p.locations?.name || p.location_id || '—'}</Td>
                <Td textTransform="capitalize">{(p.disease_type || '').replace(/_/g, ' ')}</Td>
                <Td>
                  <Badge colorScheme={RISK_COLORS[(p.risk_level || 'LOW')] || 'gray'}>
                    {Math.round((p.risk_score || 0) * 100)}%
                  </Badge>
                </Td>
                <Td>{p.risk_level || '—'}</Td>
                <Td maxW="200px" noOfLines={1} fontSize="xs" title={p.recommendation || ''}>
                  {p.recommendation || '—'}
                </Td>
                <Td>
                  {(p.risk_level === 'HIGH' || p.risk_level === 'CRITICAL') && (
                    <Text
                      color="brand.500"
                      cursor="pointer"
                      fontSize="xs"
                      fontWeight="bold"
                      onClick={() => handleDispatch(p.location_id, p.disease_type)}
                    >
                      DISPATCH TEAM
                    </Text>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default AIPredictions;
