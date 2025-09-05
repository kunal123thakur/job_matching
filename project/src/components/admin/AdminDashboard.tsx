import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import InternshipsView from './InternshipsView';
import CreateInternshipForm from './CreateInternshipForm';
import ApplicantsView from './ApplicantsView';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/internships" replace />} />
        <Route path="/internships" element={<InternshipsView />} />
        <Route path="/create" element={<CreateInternshipForm />} />
        <Route path="/internships/:id/applicants" element={<ApplicantsView />} />
      </Routes>
    </AdminLayout>
  );
}