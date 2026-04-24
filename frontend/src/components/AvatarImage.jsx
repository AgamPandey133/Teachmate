export default function AvatarImage({ profilePic, fullName }) {
  const isValid = profilePic && !profilePic.includes('avatar.iran.liara.run');

  if (isValid) {
    return <img src={profilePic} alt={fullName || 'User'} className="w-full h-full object-cover" />;
  }

  const name = fullName || 'User';
  const parts = name.trim().split(' ');
  const initials = parts.length >= 2 
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();

  return (
    <div className="w-full h-full bg-primary text-primary-content flex items-center justify-center font-bold text-lg">
      {initials}
    </div>
  );
}
