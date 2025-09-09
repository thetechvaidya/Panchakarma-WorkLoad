
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 shadow-lg">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-list-check text-2xl text-white"></i>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Panchkarma Workload Distributor
              </h1>
              <p className="text-teal-100 font-medium">
                Intelligent Therapy Assignment for PG Scholars
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-right">
              <p className="text-white font-semibold">Department of Panchkarma</p>
              <p className="text-teal-100 text-sm">Ayurvedic & Unani Tibbia College</p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
              <i className="fas fa-hospital text-white text-xl"></i>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;