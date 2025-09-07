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
            The system follows a strict order of rules to ensure continuity of care and a balanced workload distribution.
        </p>

        <RuleItem title="Rule 1: Patient Continuity (Highest Priority)" icon="fa-user-clock">
            <p>
                If you provide a "Previous Day's List", the system's first action is to assign returning patients to their previously assigned scholar. This ensures a patient remains with the same doctor.
            </p>
        </RuleItem>
        
        <div className="border-t my-4"></div>

        <RuleItem title="Rule 2: Intelligent Workload Targeting" icon="fa-bullseye">
            <p>
                Instead of a fixed patient count, the system uses a weighted point system to create a fair workload target for each scholar based on their year.
            </p>
            <ul className="list-disc list-inside space-y-1 font-semibold text-gray-700">
                <li>1st Year Weight: <span className="font-extrabold text-sky-600">21 points</span></li>
                <li>2nd Year Weight: <span className="font-extrabold text-indigo-600">15 points</span></li>
                <li>3rd Year Weight: <span className="font-extrabold text-emerald-600">7 points</span></li>
            </ul>
            <p className="mt-2">
                These weights are used to calculate a dynamic point target for each scholar relative to the total points of all procedures for the day.
            </p>
        </RuleItem>

        <div className="border-t my-4"></div>

        <RuleItem title="Rule 3: Optimal Patient Assignment" icon="fa-puzzle-piece">
            <p>
               After handling continuity, new patients are assigned one by one to achieve the fairest distribution:
            </p>
             <ol className="list-decimal list-inside space-y-2">
                <li><strong className="font-semibold text-gray-800">Biggest Patient First:</strong> Patients with the highest total procedure points are assigned first. This makes it easier to balance the remaining smaller workloads.</li>
                <li><strong className="font-semibold text-gray-800">Closest to Target:</strong> Each patient is assigned to the available scholar who will be <strong className="text-teal-700">closest to their point target</strong> after receiving the patient.</li>
                <li><strong className="font-semibold text-gray-800">Gender Priority:</strong> The system heavily prioritizes assigning patients to scholars of the same gender.</li>
                <li><strong className="font-semibold text-gray-800">Patient Integrity:</strong> The system aims to assign all procedures for a single patient to one scholar to maintain clarity.</li>
            </ol>
        </RuleItem>
    </div>
  );
};

export default RulesDisplay;