import React, { useState } from 'react';
import { Box, Heading, Flex, Badge, Text, VStack, HStack, Select, Button } from '@chakra-ui/react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const locations = [
  { id: 1, name: 'Lagos Island School', type: 'School', risk: 'High', lat: 6.4549, lng: 3.3887, value: 85 },
  { id: 2, name: 'Victoria Clinic', type: 'Clinic', risk: 'Critical', lat: 6.4281, lng: 3.4219, value: 92 },
  { id: 3, name: 'Makoko Community', type: 'Community', risk: 'Moderate', lat: 6.4950, lng: 3.3930, value: 45 },
  { id: 4, name: 'Ikeja Health Hub', type: 'Clinic', risk: 'Safe', lat: 6.5965, lng: 3.3421, value: 10 },
];

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'Critical': return 'red';
    case 'High': return 'orange';
    case 'Moderate': return 'yellow';
    case 'Safe': return 'green';
    default: return 'gray';
  }
};

const RiskMap = () => {
  const [filter, setFilter] = useState('All');

  return (
    <Box h="calc(100vh - 120px)">
      <Flex justify="space-between" align="center" mb={4}>
        <VStack align="start" spacing={0}>
          <Heading size="lg">Live Climate-Health Risk Map</Heading>
          <Text color="gray.300">Real-time geospatial surveillance for Lagos, Nigeria</Text>
        </VStack>
        <HStack spacing={4}>
          <Select placeholder="Filter by Type" w="200px" bg="bg.card" onChange={(e) => setFilter(e.target.value)}>
             <option value="School">Schools</option>
             <option value="Clinic">Clinics</option>
             <option value="Community">Communities</option>
          </Select>
          <Button colorScheme="brand" leftIcon={<Text>📡</Text>}>Live Sync</Button>
        </HStack>
      </Flex>

      <Box h="full" borderRadius="xl" overflow="hidden" border="1px solid" borderColor="whiteAlpha.100">
        <MapContainer center={[6.4549, 3.3887]} zoom={12} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map(loc => (
            <React.Fragment key={loc.id}>
              <Marker position={[loc.lat, loc.lng]}>
                <Popup>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">{loc.name}</Text>
                    <HStack>
                       <Badge colorScheme={getRiskColor(loc.risk)}>{loc.risk} Risk</Badge>
                       <Text fontSize="xs">{loc.type}</Text>
                    </HStack>
                    <Text fontSize="xs">Outbreak Prob: {loc.value}%</Text>
                  </VStack>
                </Popup>
              </Marker>
              <Circle 
                center={[loc.lat, loc.lng]}
                radius={1000}
                pathOptions={{ 
                    fillColor: getRiskColor(loc.risk), 
                    color: getRiskColor(loc.risk),
                    fillOpacity: 0.2
                }}
              />
            </React.Fragment>
          ))}
        </MapContainer>
      </Box>
    </Box>
  );
};

export default RiskMap;
