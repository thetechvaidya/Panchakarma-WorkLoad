import React, { useState } from 'react';
import type { Assignment, Scholar, Patient } from '../types';
import { calculateWorkloadAnalytics, generateInsights } from '../services/analyticsService';

interface IntelligentInsightsProps {
  assignments: Map<string, Assignment>;
  patients: Patient[];
  scholars: Scholar[];
}

const IntelligentInsights: React.FC<IntelligentInsightsProps> = ({ assignments, patients, scholars }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'optimization'>('overview');
  const analytics = calculateWorkloadAnalytics(assignments, patients);
  
  const getPredictiveInsights = () => {
    const insights = [];
    
    // Predict bottlenecks
    const overloadedScholars = analytics.scholarEfficiency.filter(s => s.utilization > 1.2);
    if (overloadedScholars.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Potential Bottleneck Alert',
        description: `${overloadedScholars.map(s => s.scholar.name).join(', ')} may be overloaded. Consider redistribution.`,
        action: 'Redistribute high-complexity procedures to less loaded scholars.'
      });
    }
    
    // Suggest optimal assignments
    const underutilized = analytics.scholarEfficiency.filter(s => s.utilization < 0.7);
    if (underutilized.length > 0) {
      insights.push({
        type: 'success',
        title: 'Capacity Available',
        description: `${underutilized.map(s => s.scholar.name).join(', ')} have additional capacity.`,
        action: 'These scholars can handle more complex or additional procedures.'
      });
    }
    
    // Procedure specialization insights
    const mostCommonProc = Object.entries(analytics.procedureDistribution)
      .sort(([,a], [,b]) => b - a)[0];
    if (mostCommonProc) {
      insights.push({
        type: 'info',
        title: 'Procedure Focus',
        description: `${mostCommonProc[0]} is the most common procedure (${mostCommonProc[1]} cases).`,
        action: 'Consider specialized training or dedicated assignment for this procedure.'
      });
    }
    
    return insights;
  };
  
  const getOptimizationSuggestions = () => {
    const suggestions = [];
    
    // Balance improvement
    if (analytics.workloadBalance < 70) {
      suggestions.push({
        priority: 'high',
        title: 'Improve Workload Balance',
        description: 'Current balance score is below optimal.',
        steps: [
          'Move high-point procedures from overloaded to underutilized scholars',
          'Consider patient continuity when redistributing',
          'Focus on gender-appropriate assignments'
        ]
      });
    }
    
    // Year-wise optimization
    const year1Count = analytics.yearDistribution[1];
    const year3Count = analytics.yearDistribution[3];
    if (year1Count > 0 && year3Count > 0 && year1Count < year3Count) {
      suggestions.push({
        priority: 'medium',
        title: 'Experience-Based Optimization',
        description: '1st year scholars should handle more cases than 3rd year.',
        steps: [
          'Increase assignments for 1st year scholars',
          'Move complex procedures to senior scholars',
          'Ensure proper mentoring structure'
        ]
      });
    }
    
    // Gender balance
    const femaleRatio = analytics.genderDistribution.F / (analytics.genderDistribution.F + analytics.genderDistribution.M);
    if (femaleRatio > 0.8 || femaleRatio < 0.2) {
      suggestions.push({
        priority: 'low',
        title: 'Gender Distribution Consideration',
        description: 'Consider gender balance for diverse learning experiences.',
        steps: [
          'Review cross-gender assignment policies',
          'Ensure appropriate supervision',
          'Maintain cultural sensitivity'
        ]
      });
    }
    
    return suggestions;
  };
  
  const predictiveInsights = getPredictiveInsights();
  const optimizationSuggestions = getOptimizationSuggestions();
  
  const TabButton: React.FC<{ tab: string; active: boolean; onClick: () => void; icon: string }> = ({ tab, active, onClick, icon }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        active 
          ? 'bg-teal-600 text-white shadow-md' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <i className={`${icon} mr-2`}></i>
      {tab}
    </button>
  );
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <i className="fas fa-lightbulb mr-2"></i>
          Intelligent Workload Insights
        </h2>
        <p className="text-teal-100 text-sm mt-1">AI-powered analysis and optimization recommendations</p>
      </div>
      
      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          <TabButton 
            tab="Overview" 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
            icon="fas fa-chart-pie"
          />
          <TabButton 
            tab="Predictions" 
            active={activeTab === 'predictions'} 
            onClick={() => setActiveTab('predictions')}
            icon="fas fa-crystal-ball"
          />
          <TabButton 
            tab="Optimization" 
            active={activeTab === 'optimization'} 
            onClick={() => setActiveTab('optimization')}
            icon="fas fa-cogs"
          />
        </div>
        
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-3">Key Performance Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{Math.round(analytics.workloadBalance)}%</div>
                <div className="text-sm text-blue-700">Balance Score</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analytics.totalProcedures}</div>
                <div className="text-sm text-green-700">Total Procedures</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{Math.round(analytics.averagePointsPerScholar)}</div>
                <div className="text-sm text-purple-700">Avg Points/Scholar</div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'predictions' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-3">Predictive Analysis</h3>
            {predictiveInsights.length > 0 ? (
              predictiveInsights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  insight.type === 'success' ? 'bg-green-50 border-green-400' :
                  'bg-blue-50 border-blue-400'
                }`}>
                  <h4 className="font-semibold text-gray-800">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                  <p className="text-sm font-medium text-gray-700 mt-2">
                    💡 Recommendation: {insight.action}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-check-circle text-4xl text-green-500 mb-2"></i>
                <p>All systems operating optimally!</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'optimization' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-3">Optimization Recommendations</h3>
            {optimizationSuggestions.length > 0 ? (
              optimizationSuggestions.map((suggestion, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{suggestion.title}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                      suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {suggestion.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">Action Steps:</p>
                    {suggestion.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-600">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-trophy text-4xl text-gold-500 mb-2"></i>
                <p>Perfect optimization achieved!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IntelligentInsights;