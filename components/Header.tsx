
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-6 py-4 flex items-center">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-list-check text-2xl text-teal-600"></i>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Panchkarma Workload Distributor</h1>
            <p className="text-sm text-gray-500">Intelligent Therapy Assignment for PG Scholars</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;