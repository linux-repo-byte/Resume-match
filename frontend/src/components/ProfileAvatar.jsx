import { useEffect, useState } from 'react';
import { getProfilePicture } from '../api/profileApi';

export default function ProfileAvatar({ user, className = 'h-9 w-9', textClassName = 'text-sm' }) {
  const [imageUrl, setImageUrl] = useState('');
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || '?';

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    if (!user?.profilePictureUpdatedAt) {
      setImageUrl('');
      return () => { active = false; };
    }

    getProfilePicture()
      .then(({ data }) => {
        objectUrl = URL.createObjectURL(data);
        if (active) setImageUrl(objectUrl);
      })
      .catch(() => {
        if (active) setImageUrl('');
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [user?.profilePictureUpdatedAt]);

  return imageUrl ? (
    <img src={imageUrl} alt={`${user.name}'s profile`} className={`${className} shrink-0 rounded-full object-cover`} />
  ) : (
    <span className={`${className} ${textClassName} grid shrink-0 place-items-center rounded-full bg-brand-100 font-bold text-brand-700`} aria-label={`${user?.name || 'User'} profile picture`}>
      {initial}
    </span>
  );
}
