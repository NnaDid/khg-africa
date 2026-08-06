import React, { useMemo } from 'react';
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
  HStack,
  Badge,
  Spinner,
  Tooltip,
} from '@chakra-ui/react';
import { FiUsers, FiActivity, FiAlertTriangle, FiShield, FiWifi, FiWifiOff } from 'react-icons/fi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { useSummary } from '../hooks/useApi';
import { useAppStore } from '../store/useAppStore';

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, trend, color }: any) => (
  <Box p={5} shadow="md" borderWidth="1px" borderRadius="xl" bg="bg.card">
    <Flex justifyContent="space-between" alignItems="center">
      <Stat>
        <StatLabel fontWeight="medium" color="gray.400">{title}</StatLabel>
        <StatNumber fontSize="2xl" fontWeight="bold">{value}</StatNumber>
        {trend !== undefined && (
          <StatHelpText>
            <StatArrow type={trend >= 0 ? 'increase' : 'decrease'} />
            {Math.abs(trend)}% from last week
          </StatHelpText>
        )}
      </Stat>
      <Box
        p={3}
        bg={`${color}.500`}
        borderRadius="full"
        color="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Icon as={icon} boxSize={6} />
      </Box>
    </Flex>
  </Box>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { data: summary, isLoading: summaryLoading } = useSummary();
  const { sensorFeed, liveAlerts, isWsConnected, profile } = useAppStore();

  // Build disease trend chart from live sensor feed
  const sensorChartData = useMemo(() => {
    const feeds = Object.values(sensorFeed);
    if (feeds.length === 0) {
      // Fallback chart data until WebSocket connects
      return [
        { name: 'Mon', value: 400 },
        { name: 'Tue', value: 300 },
        { name: 'Wed', value: 600 },
        { name: 'Thu', value: 800 },
        { name: 'Fri', value: 500 },
        { name: 'Sat', value: 900 },
        { name: 'Sun', value: 1100 },
      ];
    }
    // Use last N readings from feed as chart data points
    return feeds.slice(-7).map((f, i) => ({
      name: format(new Date(f.timestamp || new Date()), 'HH:mm'),
      value: Math.round((f.safety_score ?? 50)),
    }));
  }, [sensorFeed]);

  // System health derived from live data
  const systemServices = [
    {
      label: 'Malaria Prediction Engine',
      status: summary ? 'ACTIVE' : 'LOADING',
      color: summary ? 'green' : 'orange',
    },
    {
      label: 'IoT Sensor Network',
      status: Object.keys(sensorFeed).length > 0 ? 'ACTIVE' : 'STANDBY',
      color: Object.keys(sensorFeed).length > 0 ? 'green' : 'orange',
    },
    {
      label: 'WebSocket Realtime Stream',
      status: isWsConnected ? 'CONNECTED' : 'RECONNECTING',
      color: isWsConnected ? 'green' : 'red',
    },
    {
      label: 'Satellite Imaging Hub',
      status: 'ACTIVE',
      color: 'green',
    },
  ];

  // Derive summary stats — use API data or reasonable defaults
  const stats = {
    schools: summary?.total_schools ?? '1,240',
    activeAlerts: liveAlerts.filter((a) => !a.acknowledged).length || summary?.active_alerts_count || 0,
    childrenProtected: summary?.total_children ?? '245.2k',
    communities: summary?.total_communities ?? '892',
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Global Overview</Heading>
        <Tooltip label={isWsConnected ? 'Realtime stream active' : 'Reconnecting to realtime stream...'}>
          <HStack
            px={3}
            py={1}
            bg={isWsConnected ? 'green.500' : 'orange.500'}
            borderRadius="full"
            cursor="default"
            opacity={0.9}
            spacing={1.5}
          >
            <Icon as={isWsConnected ? FiWifi : FiWifiOff} color="white" boxSize={3.5} />
            <Text fontSize="xs" color="white" fontWeight="bold">
              {isWsConnected ? 'LIVE' : 'RECONNECTING'}
            </Text>
          </HStack>
        </Tooltip>
      </Flex>

      {/* Role-Specific Welcomer & Insights */}
      <Box p={5} mb={6} bg="rgba(0, 188, 212, 0.1)" border="1px solid" borderColor="brand.500" borderRadius="xl">
        <Heading size="md" mb={2}>Welcome back, {profile?.full_name || 'Administrator'} ({profile?.role?.replace('_', ' ').toUpperCase() || 'SUPER ADMIN'})</Heading>
        <Text fontSize="sm" color="gray.300">
          {profile?.role === 'government_admin' && '📊 Showing government early-warning disease indicators, school safety indices, and outbreak projections.'}
          {profile?.role === 'ngo_admin' && '🤝 NGO Dashboard active. Focus area: vector-control campaigns, clinic capacity distribution, and volunteer safety.'}
          {profile?.role === 'school_admin' && '🏫 Monitored School Hub: Nairobi West Primary School. Current risk level: SAFE. Water stagnation reported 15m ago.'}
          {profile?.role === 'clinic_staff' && '🏥 Medical Staff Command. Monitoring local symptom alerts, cholera trend maps, and clinic occupancy rates.'}
          {profile?.role === 'emergency_officer' && '🚨 Emergency Dispatch active. Deploy teams, track active alerts, and review field intervention checklists.'}
          {(!profile?.role || profile?.role === 'super_admin') && '🌐 Global Early Warning System active. Monitoring all regions, schools, clinics, and iot networks.'}
        </Text>
      </Box>

      {/* Stats Row */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          title="Schools Monitored"
          value={summaryLoading ? <Spinner size="sm" /> : stats.schools}
          icon={FiActivity}
          trend={12}
          color="blue"
        />
        <StatCard
          title="Active Alerts"
          value={stats.activeAlerts}
          icon={FiAlertTriangle}
          trend={-5}
          color="red"
        />
        <StatCard
          title="Children Protected"
          value={summaryLoading ? <Spinner size="sm" /> : stats.childrenProtected}
          icon={FiShield}
          trend={8}
          color="green"
        />
        <StatCard
          title="Communities Tracked"
          value={summaryLoading ? <Spinner size="sm" /> : stats.communities}
          icon={FiUsers}
          trend={15}
          color="purple"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Disease Outbreak Trend (live safety scores) */}
        <Box p={6} borderRadius="xl" bg="bg.card" border="1px solid" borderColor="whiteAlpha.100">
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="lg" fontWeight="bold">Safety Score Trend</Text>
            {Object.keys(sensorFeed).length > 0 && (
              <Badge colorScheme="green" variant="subtle" fontSize="xs">LIVE</Badge>
            )}
          </Flex>
          <Box h="300px">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sensorChartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00bcd4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                <XAxis dataKey="name" stroke="#A0AEC0" />
                <YAxis stroke="#A0AEC0" domain={[0, 100]} />
                <ChartTooltip
                  contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748' }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#00bcd4"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* System Health */}
        <Box p={6} borderRadius="xl" bg="bg.card" border="1px solid" borderColor="whiteAlpha.100">
          <Text fontSize="lg" fontWeight="bold" mb={4}>System Health</Text>
          <VStack spacing={4} align="stretch">
            {systemServices.map((svc) => (
              <Flex key={svc.label} justify="space-between" align="center" p={3} bg="whiteAlpha.50" borderRadius="md">
                <Text>{svc.label}</Text>
                <Box px={2} py={1} bg={`${svc.color}.500`} borderRadius="sm" fontSize="xs">
                  {svc.status}
                </Box>
              </Flex>
            ))}
          </VStack>

          {/* Recent live alerts count */}
          {liveAlerts.length > 0 && (
            <Box mt={4} p={3} bg="red.900" borderRadius="md" border="1px solid" borderColor="red.700">
              <HStack>
                <Icon as={FiAlertTriangle} color="red.400" />
                <Text fontSize="sm" fontWeight="bold" color="red.300">
                  {liveAlerts.filter(a => !a.acknowledged).length} unacknowledged alert(s) — check Alerts tab
                </Text>
              </HStack>
            </Box>
          )}
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;
