import React from 'react';
import type { Assignment, Patient } from '../types';
import { calculateWorkloadAnalytics, generateInsights } from '../services/analyticsService';
import Card from './Card';

interface AnalyticsDashboardProps {
  assignments: Map<string, Assignment>;
  patients: Patient[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ assignments, patients }) => {
  const analytics = calculateWorkloadAnalytics(assignments, patients);
  const insights = generateInsights(analytics);

  const StatCard: React.FC<{ icon: string; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => (
    <Card 
      variant="outlined"
      className={`p-4 border-l-4 border-${color}-500`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <i className={`${icon} text-xl text-${color}-600`}></i>
        </div>
      </div>
    </Card>
  );

  const ProgressBar: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
        style={{ width: `${(value / max) * 100}%` }}
      ></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard 
          icon="fas fa-users" 
          title="Total Patients" 
          value={analytics.totalPatients} 
          color="blue" 
        />
        <StatCard 
          icon="fas fa-clipboard-list" 
          title="Total Procedures" 
          value={analytics.totalProcedures} 
          color="green" 
        />
        <StatCard 
          icon="fas fa-star" 
          title="Total Points" 
          value={analytics.totalPoints} 
          color="purple" 
        />
        <StatCard 
          icon="fas fa-balance-scale" 
          title="Balance Score" 
          value={`${Math.round(analytics.workloadBalance)}%`} 
          color="teal" 
        />
      </div>

      {/* Workload Balance Visualization */}
      <Card 
        title="Scholar Workload Distribution"
        icon="chart-bar"
        variant="elevated"
        className="p-6"
      >
        <div className="space-y-3">
          {Array.from(assignments.values()).map((assignment) => (
            <div key={assignment.scholar.id} className="flex items-center space-x-4">
              <div className="w-24 text-sm font-medium text-gray-700">
                {assignment.scholar.name}
              </div>
              <div className="flex-1">
                <ProgressBar 
                  value={assignment.totalPoints} 
                  max={Math.max(...Array.from(assignments.values()).map(a => a.totalPoints))} 
                  color="teal" 
                />
              </div>
              <div className="w-16 text-sm text-gray-600 text-right">
                {assignment.totalPoints} pts
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Year Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card 
          title="Distribution by Year"
          icon="graduation-cap"
          variant="elevated"
          className="p-6"
        >
          <div className="space-y-2">
            {Object.entries(analytics.yearDistribution).map(([year, count]) => (
              <div key={year} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Year {year}</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card 
          title="Gender Distribution"
          icon="venus-mars"
          variant="elevated"
          className="p-6"
        >
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Female Scholars</span>
              <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-lg text-sm font-semibold">{analytics.genderDistribution.F}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Male Scholars</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">{analytics.genderDistribution.M}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Insights */}
      <Card 
        title="AI Insights & Recommendations"
        icon="brain"
        variant="outlined"
        className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 border-teal-200"
      >
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-2">
              <i className="fas fa-lightbulb text-yellow-500 mt-1"></i>
              <p className="text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;