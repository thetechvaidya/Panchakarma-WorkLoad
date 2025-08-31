
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <i className="fas fa-tasks text-3xl text-teal-600"></i>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Panchkarma Workload Distributor</h1>
            <p className="text-sm text-gray-500">Automated Therapy Assignment for PG Scholars</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
