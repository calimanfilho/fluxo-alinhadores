import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientFormPage } from './pages/PatientFormPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { CasesPage } from './pages/CasesPage';
import { CaseFormPage } from './pages/CaseFormPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { CaseFilesPage } from './pages/CaseFilesPage';
import { CaseHistoryPage } from './pages/CaseHistoryPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { useAuthenticator } from '@aws-amplify/ui-react';

export default function App() {
  const { user } = useAuthenticator((context) => [context.user]);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/new" element={<PatientFormPage />} />
          <Route path="/patients/:patientId" element={<PatientDetailPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/cases/new" element={<CaseFormPage />} />
          <Route path="/cases/:caseId" element={<CaseDetailPage />} />
          <Route path="/cases/:caseId/uploads" element={<CaseFilesPage />} />
          <Route path="/cases/:caseId/history" element={<CaseHistoryPage />} />
        </Route>
      </Route>

      <Route path="*" element={user ? <NotFoundPage /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}
