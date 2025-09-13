import React from 'react';
import { Patient, Assignment, Scholar } from '../types';

interface HomeViewProps {
  patients: Patient[];
  assignments: Map<string, Assignment>;
  scholars: Scholar[];
  isToday: boolean;
  selectedDate: Date;
}

const HomeView: React.FC<HomeViewProps> = ({
  patients,
  assignments,
  scholars,
  isToday,
  selectedDate
}) => {
  const welcomeStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #059669, #0d9488)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    color: 'white',
    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
  };

  const statsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '20px'
  };

  const statCardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'relative',
    overflow: 'hidden'
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    background: 'linear-gradient(135deg, #059669, #0d9488)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: '600',
    margin: 0
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const scholarRankStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '8px',
    border: '1px solid #e5e7eb'
  };

  const topScholarStyle: React.CSSProperties = {
    ...scholarRankStyle,
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    boxShadow: '0 2px 4px rgba(245, 158, 11, 0.1)'
  };

  // Calculate statistics
  const totalPatients = patients.length;
  const totalProcedures = patients.reduce((sum, patient) => sum + patient.procedures.length, 0);
  const assignmentValues = Array.from(assignments.values());
  const totalDistributedProcedures = assignmentValues.reduce((sum, assignment) => sum + assignment.procedures.length, 0);
  const activeScholars = scholars.filter(s => s.isPosted).length;

  // Calculate scholar points for ranking
  const scholarPoints = assignmentValues.map(assignment => ({
    scholar: assignment.scholar,
    totalPoints: assignment.procedures.reduce((sum, proc) => sum + proc.procedure.points, 0),
    procedureCount: assignment.procedures.length
  })).sort((a, b) => b.totalPoints - a.totalPoints);

  const distributionPercentage = totalProcedures > 0 ? Math.round((totalDistributedProcedures / totalProcedures) * 100) : 0;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{ padding: '0 0 80px 0' }}>
      {/* Welcome Header */}
      <div style={welcomeStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <i className="fas fa-home" style={{ fontSize: '28px' }}></i>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
              Panchakarma WLD
            </h1>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
              {formatDate(selectedDate)}
            </p>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '16px', opacity: 0.95 }}>
          {isToday ? 'Welcome to today\'s workload management' : 'Viewing historical data'}
        </p>
      </div>

      {/* Key Statistics */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
            <i className="fas fa-users" style={{ fontSize: '20px', color: '#d1fae5' }}></i>
          </div>
          <p style={statValueStyle}>{totalPatients}</p>
          <p style={statLabelStyle}>Total Patients</p>
          {isToday && (
            <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px' }}>
              <i className="fas fa-plus"></i> Today
            </div>
          )}
        </div>

        <div style={statCardStyle}>
          <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
            <i className="fas fa-tasks" style={{ fontSize: '20px', color: '#d1fae5' }}></i>
          </div>
          <p style={statValueStyle}>{totalProcedures}</p>
          <p style={statLabelStyle}>Total Procedures</p>
          <div style={{ fontSize: '11px', color: distributionPercentage === 100 ? '#059669' : '#f59e0b', marginTop: '4px' }}>
            {distributionPercentage}% Distributed
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
            <i className="fas fa-graduation-cap" style={{ fontSize: '20px', color: '#d1fae5' }}></i>
          </div>
          <p style={statValueStyle}>{activeScholars}</p>
          <p style={statLabelStyle}>Active Scholars</p>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
            of {scholars.length} total
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
            <i className="fas fa-chart-line" style={{ fontSize: '20px', color: '#d1fae5' }}></i>
          </div>
          <p style={statValueStyle}>{totalDistributedProcedures}</p>
          <p style={statLabelStyle}>Assigned</p>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
            Procedures
          </div>
        </div>
      </div>

      {/* Weekly PG Scholar Summary */}
      {scholarPoints.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            <i className="fas fa-trophy" style={{ color: '#f59e0b' }}></i>
            Scholar Performance Ranking
          </h2>
          {scholarPoints.slice(0, 5).map((scholar, index) => (
            <div key={scholar.scholar.id} style={index === 0 ? topScholarStyle : scholarRankStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: index === 0 ? '#f59e0b' : '#0d9488',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '700'
                }}>
                  {index + 1}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>
                    {scholar.scholar.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {scholar.procedureCount} procedures • Year {scholar.scholar.year}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontWeight: '700', 
                  fontSize: '16px',
                  color: index === 0 ? '#d97706' : '#059669'
                }}>
                  {scholar.totalPoints}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  points
                </div>
              </div>
            </div>
          ))}
          {scholarPoints.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
              <i className="fas fa-info-circle" style={{ fontSize: '24px', marginBottom: '8px' }}></i>
              <p>No distributions completed yet</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Status Overview */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <i className="fas fa-info-circle" style={{ color: '#3b82f6' }}></i>
          System Status
        </h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: '14px', color: '#374151' }}>Distribution Status:</span>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '600',
              color: distributionPercentage === 100 ? '#059669' : '#f59e0b'
            }}>
              {distributionPercentage === 100 ? 'Complete' : 'Pending'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: '14px', color: '#374151' }}>Posted Scholars:</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
              {activeScholars}/{scholars.length}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <span style={{ fontSize: '14px', color: '#374151' }}>Data Mode:</span>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '600',
              color: isToday ? '#059669' : '#6b7280'
            }}>
              {isToday ? 'Live' : 'Historical'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;