import React from 'react';

const RuleItem: React.FC<{ title: string; children: React.ReactNode; icon?: string; }> = ({ title, children, icon }) => (
    <div className="mb-4 last:mb-0">
        <h4 className="font-bold text-gray-800 text-md mb-1 flex items-center">
            {icon && <i className={`fas ${icon} mr-2 text-teal-600`}></i>}
            {title}
        </h4>
        <div className="text-gray-600 text-sm leading-relaxed space-y-2 pl-6">{children}</div>
    </div>
);

const RulesDisplay: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <i className="fas fa-sitemap mr-2 text-teal-600"></i>
            How It Works: Distribution Logic
        </h3>
        <p className="text-sm text-gray-700 mb-6">
            The system follows a strict order of rules to ensure continuity of care and fair workload distribution.
        </p>

        <RuleItem title="Rule 1: Patient Continuity (Highest Priority)" icon="fa-user-clock">
            <p>
                If you provide a "Previous Day's List", the system's first action is to assign returning patients to their previously assigned scholar.
            </p>
             <ul className="list-disc list-inside space-y-1">
                <li>This rule is absolute and is performed before any other logic.</li>
                <li>It ensures a patient remains with the same scholar until discharge.</li>
            </ul>
        </RuleItem>
        
        <div className="border-t my-4"></div>

        <RuleItem title="Rule 2: Fairness-First for New Patients" icon="fa-balance-scale-right">
            <p>
                After continuity is handled, all new patients are distributed using the "Fairness-First" algorithm, which balances workload at every step:
            </p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
                <li><strong className="font-semibold text-gray-800">Gender Matching:</strong> It strongly prefers assigning patients to a same-gender scholar.</li>
                <li><strong className="font-semibold text-gray-800">Lowest Workload:</strong> It then <strong className="text-teal-700">always</strong> assigns the patient to the eligible scholar with the lowest current point total.</li>
            </ol>
        </RuleItem>

        <div className="border-t my-4"></div>

        <RuleItem title="Rule 3: Two-Phase Allocation" icon="fa-layer-group">
            <p>
               The fairness logic is applied across two phases to ensure everyone gets work before any scholar gets a heavier load.
            </p>
             <ul className="list-disc list-inside font-semibold">
                <li><strong className="font-semibold text-gray-800">Phase 1 (Base Quota):</strong> Assigns patients until 1st years have 3, 2nd years have 2, and 3rd years have 1.</li>
                <li><strong className="font-semibold text-gray-800">Phase 2 (Max Capacity):</strong> Assigns remaining patients up to the maximums (4, 3, and 2 respectively).</li>
            </ul>
        </RuleItem>
    </div>
  );
};

export default RulesDisplay;