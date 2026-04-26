import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function AccidentDialogHeader({ incident, timeString }) {
  return (
    <div className="bg-gradient-to-r from-[#d63e4d] to-[#b82c3a] text-white px-[16px] sm:px-[20px] py-[14px] sm:py-[16px] flex items-center gap-[12px] shadow-lg flex-shrink-0">
      <FontAwesomeIcon icon="exclamation-triangle" className="text-[20px] sm:text-[24px]" />
      <div className="flex-1 min-w-0">
        <h2 className="font-bold text-[16px] sm:text-[18px] leading-[24px]">Accident Detected</h2>
        <div className="text-[12px] sm:text-[13px] opacity-90 tracking-[0.3px]">
          {incident?.locationName} • {timeString}
        </div>
      </div>
      <span className="px-[10px] py-[4px] rounded-[4px] bg-white/25 text-[11px] sm:text-[12px] font-bold uppercase flex-shrink-0">
        {incident?.severity || 'MODERATE'}
      </span>
    </div>
  );
}

export default AccidentDialogHeader;
