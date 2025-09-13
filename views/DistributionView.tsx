import React, { useState } from 'react';
import ResultsDisplay from '../components/ResultsDisplay';
import WorkloadSummary from '../components/WorkloadSummary';
import RulesDisplay from '../components/RulesDisplay';
import { Patient, Assignment } from '../types';

interface DistributionViewProps {
  patients: Patient[];
  assignments: Map<string, Assignment>;
  isLoading: boolean;
  onDistributeWorkload: () => Promise<void>;
  disabled: boolean;
  isToday: boolean;
}

const DistributionView: React.FC<DistributionViewProps> = ({
  patients,
  assignments,
  isLoading,
  onDistributeWorkload,
  disabled,
  isToday
}) => {
  const [showRules, setShowRules] = useState(false);

  const headerStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  const statsStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '20px'
  };

  const statCardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#7c3aed',
    margin: '0 0 4px 0'
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0
  };

  const actionButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    backgroundColor: disabled ? '#e5e7eb' : '#7c3aed',
    color: disabled ? '#9ca3af' : 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#7c3aed',
    border: '2px solid #7c3aed',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const totalAssignedProcedures = Array.from(assignments.values()).reduce((sum, assignment) => sum + assignment.procedures.length, 0);
  const totalPatients = patients.length;
  const totalProcedures = patients.reduce((sum, patient) => sum + patient.procedures.length, 0);
  const assignedScholars = Array.from(assignments.values()).filter(a => a.procedures.length > 0).length;

  return (
    <div style={{ padding: '0 0 80px 0' }}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <i className="fas fa-share-alt" style={{ fontSize: '24px', color: '#7c3aed' }}></i>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#111827' }}>
            Workload Distribution
          </h1>
        </div>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
          {isToday ? 'Distribute patients among scholars' : 'View historical distribution'}
        </p>
      </div>

      {/* Quick Stats */}
      <div style={statsStyle}>
        <div style={statCardStyle}>
          <p style={statValueStyle}>{totalPatients}</p>
          <p style={statLabelStyle}>Total Patients</p>
        </div>
        <div style={statCardStyle}>
          <p style={statValueStyle}>{totalProcedures}</p>
          <p style={statLabelStyle}>Total Procedures</p>
        </div>
        <div style={statCardStyle}>
          <p style={statValueStyle}>{assignedScholars}</p>
          <p style={statLabelStyle}>Assigned Scholars</p>
        </div>
        <div style={statCardStyle}>
          <p style={statValueStyle}>{totalAssignedProcedures}</p>
          <p style={statLabelStyle}>Distributed</p>
        </div>
      </div>

      {/* Status Message */}
      {!isToday && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="fas fa-info-circle" style={{ color: '#d97706' }}></i>
          <span style={{ fontSize: '14px', color: '#92400e' }}>
            Read-only mode: You're viewing historical distribution
          </span>
        </div>
      )}

      {/* Action Buttons */}
      {isToday && (
        <>
          <button
            onClick={onDistributeWorkload}
            disabled={disabled || isLoading}
            style={actionButtonStyle}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Distributing...
              </>
            ) : (
              <>
                <i className="fas fa-magic"></i>
                Smart Distribution
              </>
            )}
          </button>

          <button
            onClick={() => setShowRules(true)}
            style={secondaryButtonStyle}
          >
            <i className="fas fa-rules"></i>
            View Distribution Rules
          </button>
        </>
      )}

      {/* Results Display */}
      {assignments.size > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <ResultsDisplay assignments={assignments} onExport={() => {}} />
        </div>
      )}

      {/* Workload Summary */}
      {assignments.size > 0 && (
        <WorkloadSummary assignments={assignments} />
      )}

      {/* Rules Modal */}
      {showRules && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            margin: '20px',
            maxHeight: '80vh',
            overflow: 'auto',
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Distribution Rules</h2>
              <button
                onClick={() => setShowRules(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            <RulesDisplay />
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributionView;