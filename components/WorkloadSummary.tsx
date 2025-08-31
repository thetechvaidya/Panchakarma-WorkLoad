import React from 'react';
import type { Assignment } from '../types';

interface WorkloadSummaryProps {
  assignments: Map<string, Assignment>;
}

const StatCard: React.FC<{ icon: string; value: string | number; label: string; color: string }> = ({ icon, value, label, color }) => {
    const colorClasses: Record<string, string> = {
        teal: 'bg-teal-100 text-teal-600',
        blue: 'bg-blue-100 text-blue-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        purple: 'bg-purple-100 text-purple-600',
    };

    return (
    <div className="flex items-center p-4 bg-white rounded-xl shadow-md border border-gray-200">
        <div className={`p-3 mr-4 rounded-full ${colorClasses[color] || 'bg-gray-100 text-gray-600'}`}>
            <i className={`fas ${icon} fa-lg`}></i>
        </div>
        <div>
            <p className="text-3xl font-extrabold text-gray-800">{value}</p>
            <p className="text-sm font-medium text-gray-500">{label}</p>
        </div>
    </div>
    )
};


const WorkloadSummary: React.FC<WorkloadSummaryProps> = ({ assignments }) => {
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