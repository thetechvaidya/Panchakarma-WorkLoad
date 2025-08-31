
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-6 py-4 flex items-center">
        <div className="flex items-center space-x-4">
          <i className="fa-solid fa-list-check text-4xl text-teal-500"></i>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Panchkarma Workload Distributor</h1>
            <p className="text-sm text-gray-500">Automated Therapy Assignment for PG Scholars</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;