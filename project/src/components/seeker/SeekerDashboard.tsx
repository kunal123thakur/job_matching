import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SeekerLayout from './SeekerLayout';
import ProfileSetup from './ProfileSetup';
import RecommendedInternships from './RecommendedInternships';
import MyApplications from './MyApplications';

export default function SeekerDashboard() {
  return (
    <SeekerLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/seeker/profile" replace />} />
        <Route path="/profile" element={<ProfileSetup />} />
        <Route path="/recommendations" element={<RecommendedInternships />} />
        <Route path="/applications" element={<MyApplications />} />
      </Routes>
    </SeekerLayout>
  );
}