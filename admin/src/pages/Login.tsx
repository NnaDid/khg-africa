import React, { useState } from 'react';
import {
  Box,
  Flex,
  Stack,
  Heading,
  Text,
  Input,
  Button,
  useToast,
  VStack,
  HStack,
  Icon,
  InputGroup,
  InputLeftElement,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiMail, FiShield, FiGlobe, FiAlertCircle } from 'react-icons/fi';
import { authService } from '../services/supabase';
import loginBg from '../assets/images/login-bg.png';

const MotionBox = motion(Box);
const MotionStack = motion(Stack);

const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await authService.signIn(email);
      if (error) throw error;
      
      toast({
        title: 'Authentication Link Sent',
        description: 'Please check your inbox for the secure access link.',
        status: 'success',
        duration: 7000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Access Denied',
        description: error.message || 'Verification failed. Please contact the system administrator.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" direction={{ base: 'column', md: 'row' }} overflow="hidden">
      {/* Left Side: Brand & Mission */}
      <Flex
        flex={1.2}
        position="relative"
        bg="bg.dark"
        display={{ base: 'none', lg: 'flex' }}
        alignItems="center"
        justifyContent="center"
        p={12}
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgImage={`url(${loginBg})`}
          bgSize="cover"
          bgPosition="center"
          opacity={0.4}
          filter="grayscale(20%) brightness(0.6)"
        />
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-br, brand.900, transparent)"
          opacity={0.8}
        />
        
        <VStack
          spacing={8}
          align="start"
          zIndex={1}
          maxW="600px"
          as={MotionBox}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          // transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <HStack spacing={4}>
            <Box p={3} bg="brand.500" borderRadius="xl" shadow="0 0 20px rgba(0, 188, 212, 0.4)">
              <Icon as={FiShield} color="white" boxSize={8} />
            </Box>
            <Heading color="white" size="2xl" letterSpacing="tight">
              KHG AFRICA
            </Heading>
          </HStack>
          
          <VStack align="start" spacing={4}>
            <Heading color="white" size="lg" fontWeight="light">
              Protecting Africa's Future Through <Text as="span" color="brand.400" fontWeight="bold">AI Intelligence</Text>.
            </Heading>
            <Text color="whiteAlpha.800" fontSize="lg" lineHeight="tall">
              Kid-Health-Guard (KHG Africa) is the continent's leading climate-health early warning system. 
              Monitor real-time risks, deploy emergency responses, and safeguard the next generation.
            </Text>
          </VStack>

          <HStack spacing={6} pt={4}>
            <VStack align="start" spacing={0}>
              <Text color="brand.400" fontWeight="bold" fontSize="2xl">1.2k+</Text>
              <Text color="whiteAlpha.600" fontSize="xs" textTransform="uppercase">Schools Monitored</Text>
            </VStack>
            <Box h="40px" w="1px" bg="whiteAlpha.300" />
            <VStack align="start" spacing={0}>
              <Text color="brand.400" fontWeight="bold" fontSize="2xl">245k</Text>
              <Text color="whiteAlpha.600" fontSize="xs" textTransform="uppercase">Children Protected</Text>
            </VStack>
            <Box h="40px" w="1px" bg="whiteAlpha.300" />
            <VStack align="start" spacing={0}>
              <Text color="brand.400" fontWeight="bold" fontSize="2xl">Lagos</Text>
              <Text color="whiteAlpha.600" fontSize="xs" textTransform="uppercase">Command HQ</Text>
            </VStack>
          </HStack>
        </VStack>
      </Flex>

      {/* Right Side: Login Form */}
      <Flex
        flex={1}
        bg="bg.dark"
        align="center"
        justify="center"
        p={{ base: 6, md: 12 }}
        position="relative"
      >
        <Box
          position="absolute"
          top={0}
          right={0}
          w="300px"
          h="300px"
          bg="brand.500"
          filter="blur(150px)"
          opacity={0.1}
          zIndex={0}
        />

        <MotionStack
          spacing={8}
          w="full"
          maxW="md"
          zIndex={1}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <VStack align={{ base: 'center', lg: 'start' }} spacing={2}>
            <Heading size="xl" fontWeight="bold">Admin Access</Heading>
            <Text color="gray.500">Secure portal for authorized personnel</Text>
          </VStack>

          <Box
            bg="bg.card"
            p={8}
            borderRadius="2xl"
            border="1px solid"
            borderColor="whiteAlpha.100"
            shadow="2xl"
          >
            <form onSubmit={handleLogin}>
              <VStack spacing={6}>
                <FormControl id="email" isRequired>
                  <FormLabel fontSize="sm" color="gray.400">Official Admin Email</FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiMail} color="brand.500" />
                    </InputLeftElement>
                    <Input
                      type="email"
                      placeholder="e.g. admin@khgafrica.org"
                      bg="whiteAlpha.50"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      _hover={{ borderColor: 'brand.500' }}
                      _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #00bcd4' }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </InputGroup>
                </FormControl>

                <Button
                  w="full"
                  size="lg"
                  bg="brand.500"
                  color="white"
                  isLoading={loading}
                  type="submit"
                  _hover={{ bg: 'brand.600', transform: 'translateY(-2px)' }}
                  _active={{ bg: 'brand.700' }}
                  transition="all 0.2s"
                  leftIcon={<Icon as={FiGlobe} />}
                >
                  Send Security Link
                </Button>
              </VStack>
            </form>
          </Box>

          <VStack spacing={4} pt={2}>
            <HStack color="orange.400" fontSize="xs" bg="rgba(237, 137, 54, 0.1)" p={2} borderRadius="md" w="full" justify="center" border="1px solid" borderColor="rgba(237, 137, 54, 0.3)">
              <Icon as={FiAlertCircle} />
              <Text fontWeight="bold">RESTRICTED ACCESS AREA</Text>
            </HStack>
            <Text fontSize="xs" color="gray.500" textAlign="center" px={4}>
              By proceeding, you acknowledge that all activities are logged and monitored for national security and public health integrity.
            </Text>
          </VStack>
        </MotionStack>
      </Flex>
    </Flex>
  );
};

export default Login;
