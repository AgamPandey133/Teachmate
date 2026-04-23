import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../lib/api";
import { useChatStore } from "../store/useChatStore";
import useAuthUser from "../hooks/useAuthUser";
import { User, Mail, Globe, MapPin, DollarSign, Save } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
    const { authUser } = useAuthUser();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        bio: "",
        hourlyRate: 0,
        nativeLanguage: "",
        learningLanguage: "",
        location: ""
    });

    useEffect(() => {
        if (authUser) {
            setFormData({
                bio: authUser.bio || "",
                hourlyRate: authUser.hourlyRate || 0,
                nativeLanguage: authUser.nativeLanguage || "",
                learningLanguage: authUser.learningLanguage || "",
                location: authUser.location || ""
            });
        }
    }, [authUser]);

    const { mutate: updateProfileMutation, isPending } = useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ["authUser"] });
             toast.success("Profile updated successfully");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateProfileMutation(formData);
    };

    if (!authUser) return null;

    return (
        <div className="min-h-screen pt-20 px-4 max-w-2xl mx-auto">
            <div className="bg-base-100 rounded-xl shadow-lg border border-base-300 p-8">
                <div className="text-center mb-8">
                    <div className="avatar mb-4">
                        <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                            <img src={authUser.profilePic || "/avatar.png"} alt="Profile" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold">{authUser.fullName}</h1>
                    <p className="text-sm opacity-70 mb-2">{authUser.email}</p>
                    <div className="badge badge-primary uppercase text-xs">{authUser.role}</div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text flex items-center gap-2">
                                <User size={16} /> Bio
                            </span>
                        </label>
                        <textarea 
                            className="textarea textarea-bordered h-24" 
                            placeholder="Tell us about yourself..."
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="form-control">
                            <label className="label">
                                <span className="label-text flex items-center gap-2">
                                    <Globe size={16} /> Native Language
                                </span>
                            </label>
                            <input 
                                type="text" 
                                className="input input-bordered" 
                                value={formData.nativeLanguage}
                                onChange={(e) => setFormData({...formData, nativeLanguage: e.target.value})}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text flex items-center gap-2">
                                    <Globe size={16} /> Learning Language
                                </span>
                            </label>
                            <input 
                                type="text" 
                                className="input input-bordered" 
                                value={formData.learningLanguage}
                                onChange={(e) => setFormData({...formData, learningLanguage: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text flex items-center gap-2">
                                    <MapPin size={16} /> Location
                                </span>
                            </label>
                            <input 
                                type="text" 
                                className="input input-bordered" 
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                            />
                        </div>
                        
                        {authUser.role === "mentor" && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text flex items-center gap-2 text-primary font-semibold">
                                        <DollarSign size={16} /> Hourly Rate ($)
                                    </span>
                                </label>
                                <input 
                                    type="number" 
                                    className="input input-bordered border-primary" 
                                    value={formData.hourlyRate}
                                    onChange={(e) => setFormData({...formData, hourlyRate: Number(e.target.value)})}
                                />
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-6" disabled={isPending}>
                        {isPending ? <span className="loading loading-spinner"></span> : <><Save size={18} /> Save Changes</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
