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

        <RuleItem title="Rule 3: Equity-First Assignment (New Core Logic)" icon="fa-balance-scale-right">
            <p>
               All remaining patients are assigned using an iterative process that constantly prioritizes fairness within strict gender boundaries:
            </p>
             <ol className="list-decimal list-inside space-y-2">
                <li><strong className="font-semibold text-gray-800">Strict Gender Matching:</strong> To ensure patient comfort and safety, the system now enforces a strict rule: Female patients are <strong className="text-teal-700">only</strong> assigned to female scholars, and male patients are <strong className="text-teal-700">only</strong> assigned to male scholars. There are no exceptions.</li>
                <li><strong className="font-semibold text-gray-800">Find the Neediest Scholar:</strong> Within each gender group, the system identifies the scholar who is currently <strong className="text-teal-700">furthest below their point target</strong>.</li>
                <li><strong className="font-semibold text-gray-800">Find the Best Patient Fit:</strong> It then analyzes all unassigned patients of the same gender to find the single best one for that scholar.</li>
                <li><strong className="font-semibold text-gray-800">Repeat Until Done:</strong> This process repeats for each gender group until all procedures are assigned, ensuring the workload is built up evenly and safely.</li>
            </ol>
        </RuleItem>
        
        <div className="border-t my-4"></div>

        <RuleItem title="Rule 4: High Patient Load Adjustment" icon="fa-arrow-trend-up">
            <p>
                <strong>Disclaimer:</strong> In the event of an unusually high number of patients, the workload points for each PG scholar may be increased by approximately 25% across all years to reflect the increased demand.
            </p>
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