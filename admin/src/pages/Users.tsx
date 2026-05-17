import React from 'react';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Avatar,
  HStack,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  VStack,
} from '@chakra-ui/react';
import { FiMoreVertical, FiUserPlus, FiShield, FiActivity } from 'react-icons/fi';

const users = [
  { id: 1, name: 'Dr. Adeola Okafor', email: 'adeola@gov.ng', role: 'Government Admin', status: 'Active', region: 'Lagos' },
  { id: 2, name: 'Samuel Mensah', email: 'samuel@unicef.org', role: 'NGO Admin', status: 'Active', region: 'All' },
  { id: 3, name: 'Fatima Bello', email: 'fatima@clinic.org', role: 'Clinic Staff', status: 'Inactive', region: 'Ikorodu' },
  { id: 4, name: 'John Chukwuma', email: 'john@school.edu.ng', role: 'School Admin', status: 'Active', region: 'Epe' },
];

const Users = () => {
  return (
    <Box>
      <HStack justify="space-between" mb={6}>
         <VStack align="start" spacing={0}>
            <Heading size="lg">User & Role Management</Heading>
            <Text color="gray.500">Manage administrative access and regional permissions</Text>
         </VStack>
         <Button colorScheme="brand" leftIcon={<FiUserPlus />}>Add User</Button>
      </HStack>

      <Box p={6} bg="bg.card" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
         <Table variant="simple">
            <Thead>
               <Tr>
                  <Th>User</Th>
                  <Th>Role</Th>
                  <Th>Region</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
               </Tr>
            </Thead>
            <Tbody>
               {users.map(u => (
                 <Tr key={u.id}>
                    <Td>
                       <HStack>
                          <Avatar size="sm" name={u.name} />
                          <VStack align="start" spacing={0}>
                             <Text fontWeight="bold" fontSize="sm">{u.name}</Text>
                             <Text fontSize="xs" color="gray.500">{u.email}</Text>
                          </VStack>
                       </HStack>
                    </Td>
                    <Td>
                       <HStack fontSize="xs">
                          <Icon as={FiShield} color="brand.500" />
                          <Text>{u.role}</Text>
                       </HStack>
                    </Td>
                    <Td fontSize="sm">{u.region}</Td>
                    <Td>
                       <Badge colorScheme={u.status === 'Active' ? 'green' : 'gray'}>{u.status}</Badge>
                    </Td>
                    <Td>
                       <Menu>
                          <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                          <MenuList bg="bg.card">
                             <MenuItem>Edit Permissions</MenuItem>
                             <MenuItem>Reset Credentials</MenuItem>
                             <MenuItem color="red.400">Deactivate</MenuItem>
                          </MenuList>
                       </Menu>
                    </Td>
                 </Tr>
               ))}
            </Tbody>
         </Table>
      </Box>
    </Box>
  );
};

export default Users;
