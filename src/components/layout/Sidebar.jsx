import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { API_BASE_URL } from '@/lib/apiConfig';
import logoSrc from '@/assets/icons/logo.svg';

function Sidebar({ navItems = [] }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const photoUrl = user?.profilePhotoUrl
    ? user.profilePhotoUrl.startsWith('http')
      ? user.profilePhotoUrl
      : `${API_BASE_URL}${user.profilePhotoUrl}`
    : null;

  return (
    <aside className="w-[74px] min-h-screen bg-safe-sidebar flex flex-col items-center py-6 gap-6 flex-shrink-0">
      {/* Logo */}
      <div className="w-12 h-12 bg-safe-blue-btn rounded-xl flex items-center justify-center mb-4">
        <img src={logoSrc} alt="SafeSpace" className="w-16 h-16 object-contain" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col items-center gap-4 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={item.label}
            className={({ isActive }) =>
              `w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                isActive
                  ? 'bg-safe-blue-btn text-white'
                  : 'text-gray-400 hover:bg-safe-gray hover:text-white'
              }`
            }
          >
            <FontAwesomeIcon icon={item.icon} className="text-lg" />
          </NavLink>
        ))}
      </nav>

      {/* Profile Avatar */}
        <button type="button"
        onClick={() => navigate('/profile')}
        className="w-12 h-12 rounded-xl bg-safe-gray flex items-center justify-center text-gray-300 hover:bg-safe-gray-light transition-colors overflow-hidden"
        title="Profile"
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Profile"
            className="w-full h-full object-cover rounded-xl"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <span
          style={{ display: photoUrl ? 'none' : 'flex' }}
          className="w-full h-full items-center justify-center"
        >
          <FontAwesomeIcon icon="circle-user" className="text-2xl" />
        </span>
      </button>
    </aside>
  );
}

export default Sidebar;
