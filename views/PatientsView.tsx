import React, { useState } from 'react';
import PatientInput from '../components/PatientInput';
import { Patient, Assignment } from '../types';

interface PatientsViewProps {
  patients: Patient[];
  assignments: Map<string, Assignment>;
  onAddPatient: (patientData: Omit<Patient, 'id' | 'isAttendant'>) => Promise<void>;
  onDeletePatient: (patientId: string) => Promise<void>;
  onUpdatePatient: (patientId: string, updatedData: Partial<Patient>) => Promise<void>;
  disabled: boolean;
  isToday: boolean;
}

const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  assignments,
  onAddPatient,
  onDeletePatient,
  onUpdatePatient,
  disabled,
  isToday
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'add'>('current');
  const headerStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  const tabStyle: React.CSSProperties = {
    display: 'flex',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    padding: '4px',
    marginBottom: '20px'
  };

  const getTabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '12px',
    backgroundColor: isActive ? 'white' : 'transparent',
    color: isActive ? '#0d9488' : '#6b7280',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  });

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
    color: '#0d9488',
    margin: '0 0 4px 0'
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0
  };

  const totalProcedures = patients.reduce((sum, patient) => sum + patient.procedures.length, 0);
  const malePatients = patients.filter(p => p.gender === 'M').length;
  const femalePatients = patients.filter(p => p.gender === 'F').length;

  // Get previous assignments for display
  const assignmentValues = Array.from(assignments.values());
  const previousAssignments = assignmentValues.filter(a => a.procedures.length > 0);

  return (
    <div style={{ padding: '0 0 80px 0' }}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <i className="fas fa-users" style={{ fontSize: '24px', color: '#0d9488' }}></i>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#111827' }}>
            Patient Management
          </h1>
        </div>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
          {isToday ? 'Manage today\'s patient list and add new admissions' : 'Viewing historical patient data'}
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={tabStyle}>
        <button
          onClick={() => setActiveTab('current')}
          style={getTabButtonStyle(activeTab === 'current')}
        >
          <i className="fas fa-list" style={{ marginRight: '8px' }}></i>
          Current Patients ({patients.length})
        </button>
        <button
          onClick={() => setActiveTab('add')}
          style={getTabButtonStyle(activeTab === 'add')}
          disabled={!isToday}
        >
          <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
          Add New Patient
        </button>
      </div>

      {/* Quick Stats */}
      {activeTab === 'current' && (
        <div style={statsStyle}>
          <div style={statCardStyle}>
            <p style={statValueStyle}>{patients.length}</p>
            <p style={statLabelStyle}>Total Patients</p>
          </div>
          <div style={statCardStyle}>
            <p style={statValueStyle}>{totalProcedures}</p>
            <p style={statLabelStyle}>Procedures</p>
          </div>
          <div style={statCardStyle}>
            <p style={statValueStyle}>{malePatients}</p>
            <p style={statLabelStyle}>Male</p>
          </div>
          <div style={statCardStyle}>
            <p style={statValueStyle}>{femalePatients}</p>
            <p style={statLabelStyle}>Female</p>
          </div>
        </div>
      )}

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
            Read-only mode: You're viewing historical data
          </span>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'current' ? (
        <div>
          {/* Current Patients List with Assignments */}
          {previousAssignments.length > 0 && (
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '20px', 
              marginBottom: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-clipboard-list" style={{ color: '#0d9488' }}></i>
                Previous Day Assignments
              </h3>
              {previousAssignments.map((assignment) => (
                <div key={assignment.scholar.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px',
                  backgroundColor: '#f9fafb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                        {assignment.scholar.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                        Year {assignment.scholar.year} • {assignment.procedures.length} procedures
                      </p>
                    </div>
                    <div style={{ 
                      backgroundColor: '#0d9488', 
                      color: 'white', 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: '600' 
                    }}>
                      {assignment.procedures.reduce((sum, proc) => sum + proc.procedure.points, 0)} pts
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {assignment.procedures.map((proc, procIndex) => (
                      <div key={procIndex} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}>
                        <span>
                          <strong>{proc.patientName}</strong> ({proc.patientGender}) - {proc.procedure.name}
                        </span>
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>
                          {proc.procedure.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Current Patient List */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '20px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-bed" style={{ color: '#0d9488' }}></i>
              Current Patient List
            </h3>
            {patients.length > 0 ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {patients.map((patient) => (
                  <div key={patient.id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#f9fafb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                        {patient.name}
                      </h4>
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#6b7280',
                        backgroundColor: patient.gender === 'M' ? '#dbeafe' : '#fce7f3',
                        padding: '4px 8px',
                        borderRadius: '12px'
                      }}>
                        {patient.gender === 'M' ? 'Male' : 'Female'}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#374151' }}>
                      <strong>Procedures ({patient.procedures.length}):</strong>
                      <div style={{ marginTop: '8px', display: 'grid', gap: '4px' }}>
                        {patient.procedures.map((proc, index) => (
                          <div key={index} style={{ 
                            padding: '6px 12px', 
                            backgroundColor: 'white', 
                            borderRadius: '6px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span>{proc.name}</span>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                              Grade {proc.grade} • {proc.points} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <i className="fas fa-bed" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
                <p style={{ margin: 0, fontSize: '16px' }}>No patients found</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                  {isToday ? 'Add your first patient using the "Add New Patient" tab' : 'No patients were recorded for this date'}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Add New Patient Form */
        <PatientInput
          patients={patients}
          onAddPatient={onAddPatient}
          onDeletePatient={onDeletePatient}
          onUpdatePatient={onUpdatePatient}
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default PatientsView;