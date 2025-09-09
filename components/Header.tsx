
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <i className="fa-solid fa-list-check text-lg sm:text-2xl text-white"></i>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight truncate">
                Panchkarma Workload Distributor
              </h1>
              <p className="text-teal-100 font-medium text-xs sm:text-sm hidden sm:block">
                Intelligent Therapy Assignment for PG Scholars
              </p>
              <p className="text-teal-100 font-medium text-xs block sm:hidden">
                Smart Assignment System
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center space-x-6 flex-shrink-0">
            <div className="text-right">
              <p className="text-white font-semibold text-sm">Department of Panchkarma</p>
              <p className="text-teal-100 text-xs">Ayurvedic & Unani Tibbia College</p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
              <i className="fas fa-hospital text-white text-xl"></i>
            </div>
          </div>
          {/* Mobile info button */}
          <div className="flex lg:hidden items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <i className="fas fa-hospital text-white text-sm"></i>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;