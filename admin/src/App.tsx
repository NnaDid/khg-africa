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

import type { User } from '@supabase/supabase-js';

function App() {
  const { setUser, setProfile, setIsLoading, user } = useAppStore();

  useEffect(() => {
    // Check if a demo session is saved in localStorage
    const savedDemo = localStorage.getItem('khg_demo_user');
    if (savedDemo) {
      try {
        const { user: demoUser, profile: demoProfile } = JSON.parse(savedDemo);
        if (demoUser && demoProfile) {
          setUser(demoUser);
          setProfile(demoProfile);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        localStorage.removeItem('khg_demo_user');
      }
    }

    const loadProfile = async (u: User | null) => {
      if (!u) {
        setProfile(null);
        return;
      }
      const demoRoles: Record<string, any> = {
        "gov@khgafrica.org": { role: "government_admin", full_name: "Dr. Adeola Okafor", region: "Lagos Region" },
        "ngo@khgafrica.org": { role: "ngo_admin", full_name: "Samuel Mensah", region: "Sub-Saharan Africa" },
        "school@khgafrica.org": { role: "school_admin", full_name: "John Chukwuma", region: "Epe Division" },
        "clinic@khgafrica.org": { role: "clinic_staff", full_name: "Fatima Bello", region: "Ikorodu District" },
        "worker@khgafrica.org": { role: "community_health_worker", full_name: "Janet Kiprop", region: "Nairobi West" },
        "emergency@khgafrica.org": { role: "emergency_officer", full_name: "Obi Nwosu", region: "National Command" },
      };

      const matched = demoRoles[u.email?.toLowerCase().trim() || ""];

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', u.id)
          .maybeSingle();

        if (data) {
          setProfile({
            id: data.id,
            role: data.role,
            full_name: data.full_name || matched?.full_name || "System Admin",
            region: data.region || matched?.region || "Lagos",
          } as any);
          return;
        }
      } catch (err) {}

      if (matched) {
        setProfile({
          id: u.id,
          role: matched.role,
          full_name: matched.full_name,
          region: matched.region,
        } as any);
      } else {
        setProfile({
          id: u.id,
          role: 'super_admin',
          full_name: 'Super Admin',
          region: 'All',
        } as any);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      loadProfile(currentUser).then(() => setIsLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      loadProfile(currentUser);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setProfile, setIsLoading]);

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
