import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SubmitProject from './pages/SubmitProject';
import EvaluationDetail from './pages/EvaluationDetail';
import GradeEvaluation from './pages/GradeEvaluation';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes (Authentication Required) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submit"
            element={
              <ProtectedRoute>
                <SubmitProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/evaluations/:id"
            element={
              <ProtectedRoute>
                <EvaluationDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/evaluations/:id/grade"
            element={
              <ProtectedRoute>
                <GradeEvaluation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grade/:id"
            element={
              <ProtectedRoute>
                <GradeEvaluation />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
