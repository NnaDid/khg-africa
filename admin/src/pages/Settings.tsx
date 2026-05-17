import React from 'react';
import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Button,
  SimpleGrid,
  Text,
  Divider,
  HStack,
  Select,
} from '@chakra-ui/react';

const SystemSettings = () => {
  return (
    <Box>
      <Heading size="lg" mb={6}>System Configuration</Heading>
      
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <Box p={6} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
           <Heading size="md" mb={4}>Communication Gateways</Heading>
           <VStack spacing={4} align="stretch">
              <FormControl>
                 <FormLabel>SMS Provider</FormLabel>
                 <Select bg="whiteAlpha.50">
                    <option value="termii">Termii (Nigeria)</option>
                    <option value="africastalking">Africa’s Talking</option>
                    <option value="twilio">Twilio</option>
                 </Select>
              </FormControl>
              <FormControl>
                 <FormLabel>API Key (SMS)</FormLabel>
                 <Input type="password" placeholder="••••••••••••••••" bg="whiteAlpha.50" />
              </FormControl>
              <Divider />
              <FormControl>
                 <FormLabel>Email SMTP Host</FormLabel>
                 <Input placeholder="smtp.mailgun.org" bg="whiteAlpha.50" />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                 <FormLabel mb="0">Enable Auto-Alerts</FormLabel>
                 <Switch colorScheme="brand" defaultChecked />
              </FormControl>
           </VStack>
        </Box>

        <Box p={6} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
           <Heading size="md" mb={4}>AI Engine Parameters</Heading>
           <VStack spacing={4} align="stretch">
              <FormControl>
                 <FormLabel>Alert Threshold (%)</FormLabel>
                 <Input type="number" defaultValue={85} bg="whiteAlpha.50" />
                 <Text fontSize="xs" color="gray.500" mt={1}>Risk probability required to trigger automated SMS.</Text>
              </FormControl>
              <FormControl>
                 <FormLabel>Prediction Frequency</FormLabel>
                 <Select bg="whiteAlpha.50">
                    <option value="hourly">Every Hour</option>
                    <option value="6h">Every 6 Hours</option>
                    <option value="daily">Daily</option>
                 </Select>
              </FormControl>
              <FormControl display="flex" alignItems="center">
                 <FormLabel mb="0">Satellite Data Feed</FormLabel>
                 <Switch colorScheme="brand" defaultChecked />
              </FormControl>
           </VStack>
           <Button mt={8} colorScheme="brand" w="100%">Save Configuration</Button>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default SystemSettings;
