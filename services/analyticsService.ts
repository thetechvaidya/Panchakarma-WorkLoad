import type { Assignment, Scholar, Patient } from '../types';

export interface WorkloadAnalytics {
  totalPatients: number;
  totalProcedures: number;
  totalPoints: number;
  averagePointsPerScholar: number;
  workloadBalance: number; // 0-100, higher = more balanced
  procedureDistribution: Record<string, number>;
  yearDistribution: Record<number, number>;
  genderDistribution: Record<string, number>;
  scholarEfficiency: Array<{
    scholar: Scholar;
    efficiency: number; // points per procedure
    utilization: number; // actual vs target points ratio
  }>;
}

export interface TrendData {
  date: string;
  totalPatients: number;
  totalPoints: number;
  averageBalance: number;
}

export const calculateWorkloadAnalytics = (
  assignments: Map<string, Assignment>,
  allPatients: Patient[]
): WorkloadAnalytics => {
  const assignmentArray = Array.from(assignments.values());
  
  const totalPatients = allPatients.length;
  const totalProcedures = assignmentArray.reduce((sum, a) => sum + a.procedures.length, 0);
  const totalPoints = assignmentArray.reduce((sum, a) => sum + a.totalPoints, 0);
  const averagePointsPerScholar = totalPoints / Math.max(assignmentArray.length, 1);
  
  // Calculate workload balance (lower variance = better balance)
  const pointsArray = assignmentArray.map(a => a.totalPoints);
  const variance = pointsArray.reduce((sum, points) => {
    const diff = points - averagePointsPerScholar;
    return sum + (diff * diff);
  }, 0) / Math.max(pointsArray.length, 1);
  
  const workloadBalance = Math.max(0, 100 - Math.sqrt(variance) * 10);
  
  // Procedure distribution
  const procedureDistribution: Record<string, number> = {};
  assignmentArray.forEach(assignment => {
    assignment.procedures.forEach(proc => {
      const key = proc.procedure.name;
      procedureDistribution[key] = (procedureDistribution[key] || 0) + 1;
    });
  });
  
  // Year distribution
  const yearDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  assignmentArray.forEach(assignment => {
    yearDistribution[assignment.scholar.year]++;
  });
  
  // Gender distribution  
  const genderDistribution: Record<string, number> = { M: 0, F: 0 };
  assignmentArray.forEach(assignment => {
    genderDistribution[assignment.scholar.gender]++;
  });
  
  // Scholar efficiency
  const scholarEfficiency = assignmentArray.map(assignment => ({
    scholar: assignment.scholar,
    efficiency: assignment.procedures.length > 0 ? assignment.totalPoints / assignment.procedures.length : 0,
    utilization: assignment.targetPoints > 0 ? assignment.totalPoints / assignment.targetPoints : 0
  }));
  
  return {
    totalPatients,
    totalProcedures,
    totalPoints,
    averagePointsPerScholar,
    workloadBalance,
    procedureDistribution,
    yearDistribution,
    genderDistribution,
    scholarEfficiency
  };
};

export const generateInsights = (analytics: WorkloadAnalytics): string[] => {
  const insights: string[] = [];
  
  if (analytics.workloadBalance > 80) {
    insights.push("🎯 Excellent workload balance achieved across scholars");
  } else if (analytics.workloadBalance > 60) {
    insights.push("⚖️ Good workload distribution with minor imbalances");
  } else {
    insights.push("⚠️ Workload imbalance detected - consider redistributing assignments");
  }
  
  // High efficiency scholars
  const highEfficiency = analytics.scholarEfficiency.filter(s => s.efficiency > analytics.averagePointsPerScholar * 1.2);
  if (highEfficiency.length > 0) {
    insights.push(`💪 High-performing scholars: ${highEfficiency.map(s => s.scholar.name).join(', ')}`);
  }
  
  // Underutilized scholars
  const underutilized = analytics.scholarEfficiency.filter(s => s.utilization < 0.8);
  if (underutilized.length > 0) {
    insights.push(`📈 Consider assigning more cases to: ${underutilized.map(s => s.scholar.name).join(', ')}`);
  }
  
  // Most common procedures
  const procedures = Object.entries(analytics.procedureDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
  if (procedures.length > 0) {
    insights.push(`🔝 Most common procedures: ${procedures.map(([name, count]) => `${name} (${count})`).join(', ')}`);
  }
  
  return insights;
};