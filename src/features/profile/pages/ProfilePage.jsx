import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import UserProfileBody from '../components/UserProfileBody';
import { logoutUser } from '@/features/auth/authSlice';

function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/sign-in');
  };

  return (
    <div className="flex flex-col h-full bg-safe-dark overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <UserProfileBody user={user} onLogout={handleLogout} />
      </div>
    </div>
  );
}

export default ProfilePage;
