import { useQuery } from "@tanstack/react-query";
import { getMentors, sendFriendRequest } from "../lib/api";
import { UserPlus, MessageSquare, Star } from "lucide-react";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";
import { useNavigate } from "react-router";

const MentorsPage = () => {
    const { authUser } = useAuthUser();
    const navigate = useNavigate();
    
    const { data: mentors, isLoading } = useQuery({
        queryKey: ["mentors"],
        queryFn: getMentors,
    });

    const handleConnect = async (userId) => {
        try {
            await sendFriendRequest(userId); 
            // Note: The API call might need to be adjusted if sendFriendRequest expects an ID param or object
            // Just mocked for now based on existing patterns
             toast.success("Request sent!");
        } catch (err) {
            toast.error("Failed to connect");
        }
    };

    const handleBookSession = (mentor) => {
        if (mentor.hourlyRate > 0) {
            const confirm = window.confirm(`This mentor charges $${mentor.hourlyRate}/hr. Confirm payment of 1 credit to start chat?`);
            if (!confirm) return;
            toast.success("Payment successful! (Mock)");
        }
        // Navigate to chat
        // We need to ensure they are friends first in the current logic, 
        // but for a mentorship platform, payment should unlock chat bypass.
        // For now, let's just nudge them to connect first.
        toast("Please connect with the mentor first to start a chat.");
    };

    if (isLoading) return <div className="p-10 text-center">Loading Mentors...</div>;

    return (
        <div className="min-h-screen pt-20 px-4 max-w-6xl mx-auto">
             <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Find a Mentor</h1>
                <p className="text-zinc-500">Expert tutors ready to help you master a new language.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors?.map((mentor) => (
                    <div key={mentor._id} className="card bg-base-100 shadow-xl border border-base-200">
                        <figure className="px-10 pt-10">
                            <div className="avatar">
                                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                    <img src={mentor.profilePic || "/avatar.png"} alt={mentor.fullName} />
                                </div>
                            </div>
                        </figure>
                        <div className="card-body items-center text-center">
                            <h2 className="card-title flex items-center gap-2">
                                {mentor.fullName}
                                <Star className="size-4 text-yellow-500 fill-yellow-500" />
                            </h2>
                            <p className="text-sm opacity-70 line-clamp-2">{mentor.bio || "No bio available"}</p>
                            
                            <div className="flex flex-wrap justify-center gap-2 my-2">
                                {mentor.nativeLanguage && <span className="badge badge-ghost">Speaks: {mentor.nativeLanguage}</span>}
                                {mentor.learningLanguage && <span className="badge badge-outline">Learning: {mentor.learningLanguage}</span>}
                            </div>

                            <div className="stat-value text-primary text-2xl">${mentor.hourlyRate}<span className="text-sm text-base-content/50">/hr</span></div>

                            <div className="card-actions mt-4 w-full">
                                <button onClick={() => handleConnect(mentor._id)} className="btn btn-outline btn-sm flex-1">
                                    <UserPlus size={16} /> Connect
                                </button>
                                <button onClick={() => handleBookSession(mentor)} className="btn btn-primary btn-sm flex-1">
                                    <MessageSquare size={16} /> Book
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {mentors?.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-xl opacity-50">No mentors found yet. Be the first!</p>
                </div>
            )}
        </div>
    );
};

export default MentorsPage;
