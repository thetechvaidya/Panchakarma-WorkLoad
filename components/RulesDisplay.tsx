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

        <RuleItem title="Rule 1: Patient Continuity (Highest Priority)" icon="fa-user-clock">
            <p>
                If you provide a "Continuity List", the system's first action is to assign returning patients to their previously assigned scholar. This is a clinical priority.
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
               All remaining patients are assigned using an iterative process that constantly prioritizes fairness:
            </p>
             <ol className="list-decimal list-inside space-y-2">
                <li><strong className="font-semibold text-gray-800">Find the Neediest Scholar:</strong> In each step, the system identifies the scholar who is currently <strong className="text-teal-700">furthest below their point target</strong>.</li>
                <li><strong className="font-semibold text-gray-800">Find the Best Patient Fit:</strong> It then analyzes all unassigned patients to find the single best one for that specific scholar—one that gets them closer to their target.</li>
                <li><strong className="font-semibold text-gray-800">Flexible Gender Priority:</strong> The system prefers matching patient and scholar gender, but <strong className="text-orange-600">it will allow a mismatch</strong> if necessary to create a more balanced and fair point distribution.</li>
                <li><strong className="font-semibold text-gray-800">Repeat Until Done:</strong> This process repeats—find the neediest scholar, give them the best-fitting patient—until all procedures are assigned. This ensures the workload is built up evenly for everyone.</li>
            </ol>
        </RuleItem>
    </div>
  );
};

export default RulesDisplay;