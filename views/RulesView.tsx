import React, { useState } from 'react';
import RulesDisplay from '../components/RulesDisplay';
import ProcedureGradeTable from '../components/ProcedureGradeTable';

interface RulesViewProps {
  isToday: boolean;
}

const RulesView: React.FC<RulesViewProps> = ({ isToday }) => {
  const [activeSection, setActiveSection] = useState<'rules' | 'grades' | 'algorithm'>('rules');

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
    padding: '10px 8px',
    backgroundColor: isActive ? 'white' : 'transparent',
    color: isActive ? '#f59e0b' : '#6b7280',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center'
  });

  const sectionStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  const principleStyle: React.CSSProperties = {
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  };

  const algorithmStepStyle: React.CSSProperties = {
    backgroundColor: '#f0f9ff',
    border: '1px solid #0ea5e9',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px'
  };

  return (
    <div style={{ padding: '0 0 80px 0' }}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <i className="fas fa-gavel" style={{ fontSize: '24px', color: '#f59e0b' }}></i>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#111827' }}>
            Rules & Points System
          </h1>
        </div>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
          Complete transparency in our distribution algorithm - No bias, fair distribution
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={tabStyle}>
        <button
          onClick={() => setActiveSection('rules')}
          style={getTabButtonStyle(activeSection === 'rules')}
        >
          <i className="fas fa-balance-scale" style={{ marginRight: '4px' }}></i>
          Distribution Rules
        </button>
        <button
          onClick={() => setActiveSection('grades')}
          style={getTabButtonStyle(activeSection === 'grades')}
        >
          <i className="fas fa-star" style={{ marginRight: '4px' }}></i>
          Procedure Grades
        </button>
        <button
          onClick={() => setActiveSection('algorithm')}
          style={getTabButtonStyle(activeSection === 'algorithm')}
        >
          <i className="fas fa-code" style={{ marginRight: '4px' }}></i>
          Algorithm Logic
        </button>
      </div>

      {/* Content based on active section */}
      {activeSection === 'rules' && (
        <div>
          {/* Core Principles */}
          <div style={sectionStyle}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-heart" style={{ color: '#ef4444' }}></i>
              Core Principles
            </h2>
            
            <div style={principleStyle}>
              <i className="fas fa-balance-scale" style={{ fontSize: '20px', color: '#f59e0b', marginTop: '2px' }}></i>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#92400e' }}>
                  Fair Distribution
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.5' }}>
                  Every PG scholar gets equal opportunities based on their year and skill level. No manual bias or favoritism.
                </p>
              </div>
            </div>

            <div style={principleStyle}>
              <i className="fas fa-eye" style={{ fontSize: '20px', color: '#f59e0b', marginTop: '2px' }}></i>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#92400e' }}>
                  Complete Transparency
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.5' }}>
                  All distribution logic is open and automated. Every assignment can be traced back to specific rules.
                </p>
              </div>
            </div>

            <div style={principleStyle}>
              <i className="fas fa-chart-line" style={{ fontSize: '20px', color: '#f59e0b', marginTop: '2px' }}></i>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#92400e' }}>
                  Skill-Based Growth
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.5' }}>
                  Higher year students get complex procedures, ensuring progressive learning and fair workload.
                </p>
              </div>
            </div>
          </div>

          {/* Rules Display Component */}
          <div style={sectionStyle}>
            <RulesDisplay />
          </div>
        </div>
      )}

      {activeSection === 'grades' && (
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-award" style={{ color: '#f59e0b' }}></i>
            Procedure Grading System
          </h2>
          <ProcedureGradeTable />
        </div>
      )}

      {activeSection === 'algorithm' && (
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-cogs" style={{ color: '#f59e0b' }}></i>
            Algorithm Logic Flow
          </h2>

          <div style={algorithmStepStyle}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                backgroundColor: '#0ea5e9', 
                color: 'white', 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '12px', 
                fontWeight: '700' 
              }}>1</span>
              Scholar Filtering
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#164e63', lineHeight: '1.5' }}>
              System identifies all posted scholars available for duty. Only active scholars are considered for distribution.
            </p>
          </div>

          <div style={algorithmStepStyle}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                backgroundColor: '#0ea5e9', 
                color: 'white', 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '12px', 
                fontWeight: '700' 
              }}>2</span>
              Procedure Prioritization
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#164e63', lineHeight: '1.5' }}>
              Procedures are sorted by grade (3→2→1) and points (highest first). Complex procedures get priority assignment.
            </p>
          </div>

          <div style={algorithmStepStyle}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                backgroundColor: '#0ea5e9', 
                color: 'white', 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '12px', 
                fontWeight: '700' 
              }}>3</span>
              Gender Matching
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#164e63', lineHeight: '1.5' }}>
              For optimal learning and comfort, male scholars are preferentially assigned to male patients, and female scholars to female patients.
            </p>
          </div>

          <div style={algorithmStepStyle}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                backgroundColor: '#0ea5e9', 
                color: 'white', 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '12px', 
                fontWeight: '700' 
              }}>4</span>
              Skill-Based Assignment
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#164e63', lineHeight: '1.5' }}>
              Procedures are assigned based on scholar year: Grade 3 procedures → 3rd years first, Grade 2 → 2nd/3rd years, Grade 1 → All years.
            </p>
          </div>

          <div style={algorithmStepStyle}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                backgroundColor: '#0ea5e9', 
                color: 'white', 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '12px', 
                fontWeight: '700' 
              }}>5</span>
              Workload Balancing
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#164e63', lineHeight: '1.5' }}>
              System automatically balances workload by assigning to scholars with the least current points, ensuring fair distribution.
            </p>
          </div>

          <div style={algorithmStepStyle}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                backgroundColor: '#0ea5e9', 
                color: 'white', 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '12px', 
                fontWeight: '700' 
              }}>6</span>
              Historical Continuity
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#164e63', lineHeight: '1.5' }}>
              System considers previous day's assignments to maintain continuity and prevent over-assignment to any scholar.
            </p>
          </div>

          <div style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #16a34a',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '20px'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#15803d', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-check-circle" style={{ color: '#16a34a' }}></i>
              Result: 100% Automated, 0% Bias
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#166534', lineHeight: '1.5' }}>
              The final assignment is purely algorithmic, ensuring every scholar gets fair opportunities based on their skills and availability. No human intervention means no favoritism.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RulesView;