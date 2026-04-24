export const capitialize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function getAvatar(profilePic, fullName) {
  if (profilePic && !profilePic.includes('avatar.iran.liara.run')) return profilePic;
  const name = fullName || 'User';
  return "https://ui-avatars.com/api/?name=&background=random&color=fff&size=200";
}
