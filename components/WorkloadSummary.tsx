import React from 'react';
import type { Assignment, Scholar, Patient } from '../types';
import { analyzeDistribution } from '../services/intelligentDistributionService';

interface WorkloadSummaryProps {
  assignments: Map<string, Assignment>;
  patients?: Patient[];
  scholars?: Scholar[];
}

const StatCard: React.FC<{ icon: string; value: string | number; label: string; color: string }> = ({ icon, value, label, color }) => {
    const colorClasses: Record<string, string> = {
        teal: 'bg-teal-100 text-teal-600',
        blue: 'bg-blue-100 text-blue-600',
        yellow: 'bg-amber-100 text-amber-600',
        purple: 'bg-violet-100 text-violet-600',
    };

    return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
            <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg ${colorClasses[color] || 'bg-gray-100 text-gray-600'}`}>
                <i className={`fas ${icon} text-xl`}></i>
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm font-medium text-gray-500">{label}</p>
            </div>
        </div>
    </div>
    )
};


const WorkloadSummary: React.FC<WorkloadSummaryProps> = ({ assignments, patients = [], scholars = [] }) => {
  const metrics = patients.length > 0 && scholars.length > 0 
    ? analyzeDistribution(assignments, patients, scholars)
    : null;
    const allAssignments = Array.from(assignments.values());
    
    const totalPoints = allAssignments.reduce((sum, a) => sum + a.totalPoints, 0);
    const totalProcedures = allAssignments.reduce((sum, a) => sum + a.procedures.length, 0);
    const assignedScholars = allAssignments.filter(a => a.procedures.length > 0).length;
    const totalPatients = new Set(allAssignments.flatMap(a => a.procedures.map(p => p.patientName))).size;

    if (totalPoints === 0) {
        return null;
    }

  return (
    <div>
        <h2 className="text-xl font-bold text-gray-700 mb-4">Daily Workload Overview</h2>
        <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
           <StatCard icon="fa-star" value={totalPoints} label="Total Workload Points" color="teal" />
           <StatCard icon="fa-user-doctor" value={totalPatients} label="Total Patients" color="blue" />
           <StatCard icon="fa-clipboard-list" value={totalProcedures} label="Total Procedures" color="yellow" />
           <StatCard icon="fa-users" value={assignedScholars} label="Assigned Scholars" color="purple" />
        </div>
    </div>
  );
};

export default WorkloadSummary;