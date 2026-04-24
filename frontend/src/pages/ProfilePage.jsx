import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile, uploadImage } from "../lib/api";
import { useChatStore } from "../store/useChatStore";
import useAuthUser from "../hooks/useAuthUser";
import { User, Mail, Globe, MapPin, DollarSign, Save, Camera } from "lucide-react";
import toast from "react-hot-toast";
import { getAvatar } from "../lib/utils";

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
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

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
            console.error("Profile update failed:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to update profile");
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let profilePicUrl = formData.profilePic;
        
        if (selectedImage) {
            setIsUploadingImage(true);
            try {
                const res = await uploadImage(selectedImage);
                profilePicUrl = res.imageUrl;
            } catch (error) {
                toast.error("Failed to upload image");
                setIsUploadingImage(false);
                return;
            }
            setIsUploadingImage(false);
        }

        // Remove the massive base64 preview string before sending to backend
        const { profilePicPreview, ...payload } = formData;
        updateProfileMutation({ ...payload, profilePic: profilePicUrl });
        setSelectedImage(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            // Create a preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profilePicPreview: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    if (!authUser) return null;

    return (
        <div className="min-h-screen pt-20 px-4 max-w-2xl mx-auto">
            <div className="bg-base-100 rounded-xl shadow-lg border border-base-300 p-8">
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="avatar">
                            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                <img src={formData.profilePicPreview || getAvatar(authUser.profilePic, authUser.fullName)} alt="Profile" />
                            </div>
                        </div>
                        <label 
                            htmlFor="avatar-upload" 
                            className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full cursor-pointer shadow-sm hover:bg-primary/80 transition-colors"
                        >
                            <Camera size={16} />
                            <input 
                                type="file" 
                                id="avatar-upload" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={isUploadingImage}
                            />
                        </label>
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

                    <button type="submit" className="btn btn-primary w-full mt-6" disabled={isPending || isUploadingImage}>
                        {(isPending || isUploadingImage) ? <span className="loading loading-spinner"></span> : <><Save size={18} /> Save Changes</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
