import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function FilterTabs({ activeTab = 'call-emergency' }) {
  const otherTabs = [
    { id: 'camera', icon: 'video', label: 'Camera View' },
    { id: 'traffic', icon: 'traffic-light', label: 'Traffic Lights' },
    { id: 'intersections', icon: 'location-crosshairs', label: 'Intersections' },
    { id: 'smart-units', icon: 'microchip', label: 'Smart Units' },
    { id: 'traffic-rate', icon: 'chart-simple', label: 'Traffic Rate' },
  ];

  return (
   
    <div className="bg-white rounded-xl  mx-4 mt-4"> 
      
  
      <div className="flex items-center justify-between gap-4 px-4 py-3.5"> 

        {/* Call Emergency Button */}
        <button
          className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 text-white shadow-sm bg-safe-blue"
        >
          <FontAwesomeIcon icon="phone" className="text-sm" />
          <span>Call Emergency</span>
          <span className="ml-0.5 min-w-[22px] h-[22px] px-1.5 flex items-center justify-center bg-white/20 rounded-full text-[10px] font-bold">
            8
          </span>
        </button>

        {/* Other Filter Tabs */}

        
        <div className='flex gap-6 '>

          {otherTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap bg-gray-100 ${
                isActive ? 'text-safe-text-dark' : 'text-safe-text-gray'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="text-sm" />
              <span>{tab.label}</span>
            </button>
          );
        })}
        </div>


      </div>
    </div>
  );
}

export default FilterTabs;