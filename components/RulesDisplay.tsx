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
            The system follows a new <strong className="text-teal-700">Equity-First</strong> model to ensure continuity and a truly balanced workload.
        </p>

        <RuleItem title="Rule 1: Automatic Patient Continuity (Highest Priority)" icon="fa-user-clock">
            <p>
                The system automatically checks the previous day's assignments. Returning patients are re-assigned to the same scholar to ensure continuity of care, as long as the scholar is posted and the gender match is correct. No manual list is needed.
            </p>
        </RuleItem>

        <div className="border-t my-4"></div>

        <RuleItem title="Rule 2: Workload Targeting" icon="fa-bullseye">
            <p>
                The system uses a weighted point system to create a fair workload target for each scholar based on their year.
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

        <RuleItem title="Rule 3: Gender-Priority Assignment" icon="fa-venus-mars">
            <p>
                The system assigns remaining patients using an iterative, equity-focused process that prioritizes patient comfort while ensuring all work is distributed.
            </p>
             <ol className="list-decimal list-inside space-y-2">
                <li><strong className="font-semibold text-gray-800">Same-Gender Priority:</strong> The system first attempts to assign female patients exclusively to female scholars, and male patients exclusively to male scholars. This is the default and preferred assignment method.</li>
                <li><strong className="font-semibold text-gray-800">Cross-Gender Fallback:</strong> If a patient cannot be assigned to a same-gender scholar (e.g., if no scholars of that gender are posted for the day), the system will then assign the patient to an available scholar of the opposite gender. This ensures all patients receive care.</li>
                <li><strong className="font-semibold text-gray-800">Find the Neediest Scholar:</strong> In every step, the system identifies the scholar who is currently <strong className="text-teal-700">furthest below their point target</strong>.</li>
                <li><strong className="font-semibold text-gray-800">Find the Best Patient Fit:</strong> It then analyzes all available unassigned patients to find the single best one for that scholar to maintain a balanced workload.</li>
            </ol>
        </RuleItem>
        
        <div className="border-t my-4"></div>

        <RuleItem title="Special Note: HOD/Consultant Discretion" icon="fa-user-shield">
             <p>
                The final assignment for any patient deemed 'special' (e.g., VIPs, medically complex cases) remains at the discretion of the HOD/Consultant. These decisions may override the automated distribution.
            </p>
        </RuleItem>
    </div>
  );
};

export default RulesDisplay;