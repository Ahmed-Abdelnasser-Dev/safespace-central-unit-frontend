import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function ProfileHeroCard({ profile, photoUrl, onPhotoUpload }) {
  return (
    <div className="bg-safe-sidebar rounded-xl border border-safe-gray-light p-7">
      <div className="flex items-start justify-between">
        {/* Left: Avatar + Info */}
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-safe-blue-btn text-white flex items-center justify-center font-bold text-3xl flex-shrink-0 overflow-hidden">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={profile.fullName}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <span style={{ display: photoUrl ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">
              {profile.avatar}
            </span>
          </div>

          {/* Info */}
          <div className="pt-1">
            <h2 className="text-2xl font-bold text-safe-text-primary">{profile.fullName}</h2>
            <p className="text-sm text-safe-text-muted mt-0.5">@{profile.username}</p>

            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-sm text-safe-text-muted">
                <FontAwesomeIcon icon="shield" className="text-safe-blue-btn/70 text-xs" />
                {profile.role}
              </span>
              <span className="text-safe-text-muted/40">•</span>
              <span className="flex items-center gap-1.5 text-sm text-safe-text-muted">
                <FontAwesomeIcon icon="map-pin" className="text-safe-text-muted text-xs" />
                {profile.location}
              </span>
            </div>

            <div className="flex items-center gap-5 mt-2.5">
              <span className="flex items-center gap-1.5 text-sm text-safe-text-muted">
                <FontAwesomeIcon icon="envelope" className="text-xs text-safe-text-muted/60" />
                {profile.email}
              </span>
              <span className="text-safe-text-muted/40">•</span>
              <span className="flex items-center gap-1.5 text-sm text-safe-text-muted">
                <FontAwesomeIcon icon="phone" className="text-xs text-safe-text-muted/60" />
                {profile.phone}
              </span>
            </div>

            <p className="flex items-center gap-1.5 text-sm text-safe-text-muted mt-2">
              <FontAwesomeIcon icon="calendar" className="text-xs text-safe-text-muted/60" />
              Member since {profile.memberSince}
            </p>
          </div>
        </div>

        {/* Edit Image Button */}
        <label className="flex items-center gap-2 px-4 py-2 bg-safe-blue-btn text-white text-sm font-medium rounded-lg hover:bg-safe-blue-btn/90 transition-colors cursor-pointer">
          <FontAwesomeIcon icon="pen-to-square" className="text-xs" />
          Edit Image
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={onPhotoUpload}
          />
        </label>
      </div>
    </div>
  );
}

export default ProfileHeroCard;
