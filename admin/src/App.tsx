import React, { useEffect } from 'react';
import { ChakraProvider, Box, Heading, Text } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import RiskMap from './pages/RiskMap';
import AIPredictions from './pages/AIPredictions';
import Schools from './pages/Schools';
import Clinics from './pages/Clinics';
import Reports from './pages/Reports';
import Emergency from './pages/Emergency';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { supabase } from './services/supabase';
import { useAppStore } from './store/useAppStore';
import { useWebSocket } from './hooks/useWebSocket';

// Placeholder components for remaining routes
const Placeholder = ({ name }: { name: string }) => (
  <Box p={8} textAlign="center">
    <Heading size="lg" mb={4}>{name} Module</Heading>
    <Text color="gray.500">This module is currently being synchronized with the national database.</Text>
  </Box>
);

// React Query client with sensible defaults for a live data dashboard
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});

// ─── WebSocket Initializer ────────────────────────────────────────────────────
// Separate component so the hook only runs when the user is authenticated
function RealtimeStream() {
  useWebSocket();
  return null;
}

function App() {
  const { setUser, setIsLoading, user } = useAppStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setIsLoading]);

  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Router>
          {/* Initialize WebSocket only when authenticated */}
          {user && <RealtimeStream />}

          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />

            <Route element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/map" element={<RiskMap />} />
              <Route path="/ai-predictions" element={<AIPredictions />} />
              <Route path="/schools" element={<Schools />} />
              <Route path="/clinics" element={<Clinics />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default App;
