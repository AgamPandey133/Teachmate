import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";
import AvatarImage from "./AvatarImage";

const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-100 border border-base-300 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
      <div className="card-body p-5">
        {/* USER INFO */}
        <div className="flex items-center gap-4 mb-4">
          <div className="avatar">
            <div className="w-16 rounded-full border border-base-300">
              <AvatarImage profilePic={friend.profilePic} fullName={friend.fullName} />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{friend.fullName}</h3>
            <p className="text-xs text-base-content/60 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success"></span> Online
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2 bg-base-200 p-2 rounded-lg">
             <div className="bg-secondary/10 p-1.5 rounded-md">
                {getLanguageFlag(friend.nativeLanguage)}
             </div>
             <span className="text-sm font-medium">Native <span className="opacity-70 font-normal">{friend.nativeLanguage}</span></span>
          </div>
          <div className="flex items-center gap-2 bg-base-200 p-2 rounded-lg">
             <div className="bg-primary/10 p-1.5 rounded-md">
                {getLanguageFlag(friend.learningLanguage)}
             </div>
             <span className="text-sm font-medium">Learning <span className="opacity-70 font-normal">{friend.learningLanguage}</span></span>
          </div>
        </div>

        <Link to={`/chat/${friend._id}`} className="btn btn-outline btn-block group-hover:btn-primary transition-all duration-300 rounded-xl">
          Message
        </Link>
      </div>
    </div>
  );
};
export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}
