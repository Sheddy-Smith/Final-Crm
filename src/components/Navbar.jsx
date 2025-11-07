import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu, Database } from 'lucide-react';
import useUiStore from '@/store/uiStore';
import useJobsStore from '@/store/jobsStore';
import ThemeToggle from './ThemeToggle';
import VehicleSearchModal from './VehicleSearchModal';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const location = useLocation();
  const toggleSidebar = useUiStore(state => state.toggleSidebar);
  const jobs = useJobsStore(state => state.jobs);
  const pageTitle = location.pathname.split('/').filter(Boolean).pop()?.replace('-', ' ') || 'Dashboard';
  const formattedTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (searchTerm.trim()) {
      const jobsArray = Object.values(jobs);
      const filtered = jobsArray.filter(job =>
        job.vehicleNo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchTerm, jobs]);

  const handleVehicleClick = (job) => {
    setSelectedVehicle(job);
    setIsModalOpen(true);
    setShowResults(false);
    setSearchTerm('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/70 dark:bg-dark-card/50 backdrop-blur-lg border-b dark:border-gray-700 flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Menu className="h-6 w-6 text-gray-600 dark:text-dark-text-secondary" />
        </button>
        <motion.div initial={{ opacity:0, x: -10}} animate={{opacity: 1, x: 0}} key={formattedTitle} className="ml-4">
            <h1 className="text-xl font-bold text-brand-dark dark:text-dark-text">{formattedTitle}</h1>
        </motion.div>
      </div>
      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Vehicle Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm && setShowResults(true)}
            className="pl-10 pr-4 py-2 w-64 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-80 bg-white dark:bg-dark-card border dark:border-gray-700 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50">
              {searchResults.map((job) => (
                <button
                  key={job.id}
                  onClick={() => handleVehicleClick(job)}
                  className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800 border-b dark:border-gray-700 last:border-b-0 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-brand-red text-lg">{job.vehicleNo}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{job.ownerName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Created: {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      job.status === 'Invoice' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      job.status === 'Challan' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      job.status === 'JobSheet' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      job.status === 'Estimate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
          {showResults && searchResults.length === 0 && searchTerm && (
            <div className="absolute top-full mt-2 w-80 bg-white dark:bg-dark-card border dark:border-gray-700 rounded-lg shadow-2xl p-4 z-50">
              <p className="text-gray-500 dark:text-gray-400 text-center">No vehicles found for "{searchTerm}"</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30" title="Local Database - All data stored on this device">
          <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Local DB</span>
        </div>
        <ThemeToggle />
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative">
          <Bell className="h-6 w-6 text-gray-600 dark:text-dark-text-secondary" />
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-brand-red ring-2 ring-white dark:ring-dark-card" />
        </button>
      </div>
      <VehicleSearchModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        vehicleData={selectedVehicle}
      />
    </header>
  );
};

export default Navbar;
