import type { Patient, Scholar, Assignment } from '../types';
import { distributeWorkload } from './distributionService';
import { YEAR_WEIGHTS } from '../constants';

export interface IntelligentRecommendation {
  type: 'optimization' | 'balance' | 'continuity' | 'specialization';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  impact: number; // 1-5 scale
}

export interface DistributionMetrics {
  balanceScore: number;
  continuityScore: number;
  specializationScore: number;
  overallScore: number;
  recommendations: IntelligentRecommendation[];
}

export const analyzeDistribution = (
  assignments: Map<string, Assignment>,
  patients: Patient[],
  scholars: Scholar[]
): DistributionMetrics => {
  const assignmentArray = Array.from(assignments.values());
  
  // Calculate balance score
  const totalPoints = assignmentArray.reduce((sum, a) => sum + a.totalPoints, 0);
  const avgPoints = totalPoints / Math.max(assignmentArray.length, 1);
  const pointsVariance = assignmentArray.reduce((sum, a) => {
    const diff = a.totalPoints - avgPoints;
    return sum + (diff * diff);
  }, 0) / Math.max(assignmentArray.length, 1);
  const balanceScore = Math.max(0, 100 - Math.sqrt(pointsVariance) * 5);
  
  // Calculate continuity score (placeholder - would need historical data)
  const continuityScore = 85; // Assuming good continuity
  
  // Calculate specialization score
  const procedureSpecialization = new Map<string, Set<string>>();
  assignmentArray.forEach(assignment => {
    assignment.procedures.forEach(proc => {
      const procType = proc.procedure.name;
      if (!procedureSpecialization.has(procType)) {
        procedureSpecialization.set(procType, new Set());
      }
      procedureSpecialization.get(procType)!.add(assignment.scholar.id);
    });
  });
  
  let specializationSum = 0;
  let totalProcs = 0;
  procedureSpecialization.forEach((scholars, procType) => {
    totalProcs++;
    // More specialized = fewer scholars per procedure type
    const specialization = Math.max(0, 100 - (scholars.size * 20));
    specializationSum += specialization;
  });
  const specializationScore = totalProcs > 0 ? specializationSum / totalProcs : 100;
  
  // Overall score
  const overallScore = (balanceScore * 0.4 + continuityScore * 0.3 + specializationScore * 0.3);
  
  // Generate recommendations
  const recommendations: IntelligentRecommendation[] = [];
  
  if (balanceScore < 70) {
    recommendations.push({
      type: 'balance',
      priority: 'high',
      title: 'Improve Workload Balance',
      description: 'Significant workload imbalance detected among scholars',
      action: 'Redistribute high-complexity procedures to less loaded scholars',
      impact: 4
    });
  }
  
  if (specializationScore < 60) {
    recommendations.push({
      type: 'specialization',
      priority: 'medium',
      title: 'Enhance Specialization',
      description: 'Scholars are not specialized in specific procedure types',
      action: 'Assign specific procedure types to dedicated scholars',
      impact: 3
    });
  }
  
  // Check for overloaded scholars
  const overloaded = assignmentArray.filter(a => a.totalPoints > avgPoints * 1.3);
  if (overloaded.length > 0) {
    recommendations.push({
      type: 'optimization',
      priority: 'high',
      title: 'Scholar Overload Alert',
      description: `${overloaded.map(a => a.scholar.name).join(', ')} may be overloaded`,
      action: 'Reduce assignments for overloaded scholars',
      impact: 5
    });
  }
  
  return {
    balanceScore,
    continuityScore,
    specializationScore,
    overallScore,
    recommendations
  };
};

export const suggestOptimalDistribution = (
  patients: Patient[],
  scholars: Scholar[],
  previousAssignments: Map<string, string>
): {
  distribution: Map<string, Assignment>;
  improvements: string[];
  metrics: DistributionMetrics;
} => {
  // Run the standard distribution
  const distribution = distributeWorkload(patients, scholars, previousAssignments);
  
  // Analyze the result
  const metrics = analyzeDistribution(distribution, patients, scholars);
  
  // Generate improvement suggestions
  const improvements: string[] = [];
  
  if (metrics.balanceScore < 80) {
    improvements.push('Consider rotating complex procedures among scholars');
  }
  
  if (metrics.specializationScore < 70) {
    improvements.push('Implement procedure specialization for better expertise');
  }
  
  if (metrics.overallScore > 90) {
    improvements.push('Excellent distribution achieved!');
  } else if (metrics.overallScore > 75) {
    improvements.push('Good distribution with room for minor improvements');
  } else {
    improvements.push('Distribution needs optimization for better balance');
  }
  
  return {
    distribution,
    improvements,
    metrics
  };
};

export const predictWorkloadTrends = (
  currentPatients: Patient[],
  scholars: Scholar[]
): {
  expectedLoad: number;
  peakDays: string[];
  recommendations: string[];
} => {
  const totalPoints = currentPatients.reduce((sum, p) => 
    sum + p.procedures.reduce((pSum, proc) => pSum + proc.points, 0), 0
  );
  
  const activeScholars = scholars.filter(s => s.isPosted).length;
  const expectedLoad = totalPoints / Math.max(activeScholars, 1);
  
  // Simple prediction logic (could be enhanced with ML)
  const peakDays = [];
  const today = new Date().getDay();
  if (today === 1 || today === 2) { // Monday/Tuesday tend to be busy
    peakDays.push('Monday', 'Tuesday');
  }
  
  const recommendations = [];
  if (expectedLoad > 15) {
    recommendations.push('High workload expected - consider additional scholar allocation');
  } else if (expectedLoad < 5) {
    recommendations.push('Light workload - opportunity for training or research');
  } else {
    recommendations.push('Optimal workload expected');
  }
  
  return {
    expectedLoad,
    peakDays,
    recommendations
  };
};