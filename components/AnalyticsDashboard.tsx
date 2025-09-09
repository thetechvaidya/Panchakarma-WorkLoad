import React from 'react';
import type { Assignment, Patient } from '../types';
import { calculateWorkloadAnalytics, generateInsights } from '../services/analyticsService';

interface AnalyticsDashboardProps {
  assignments: Map<string, Assignment>;
  patients: Patient[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ assignments, patients }) => {
  const analytics = calculateWorkloadAnalytics(assignments, patients);
  const insights = generateInsights(analytics);

  const StatCard: React.FC<{ icon: string; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => (
    <div className={`bg-white rounded-xl shadow-lg p-4 border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <i className={`${icon} text-xl text-${color}-600`}></i>
        </div>
      </div>
    </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i className="fas fa-chart-bar text-teal-600 mr-2"></i>
          Scholar Workload Distribution
        </h3>
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
      </div>

      {/* Year Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <i className="fas fa-graduation-cap text-purple-600 mr-2"></i>
            Distribution by Year
          </h3>
          <div className="space-y-2">
            {Object.entries(analytics.yearDistribution).map(([year, count]) => (
              <div key={year} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Year {year}</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <i className="fas fa-venus-mars text-pink-600 mr-2"></i>
            Gender Distribution
          </h3>
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
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl shadow-lg p-6 border border-teal-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i className="fas fa-brain text-teal-600 mr-2"></i>
          AI Insights & Recommendations
        </h3>
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;