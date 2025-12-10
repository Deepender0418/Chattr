import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, AtSign, Calendar, CheckCircle, Edit, Users } from "lucide-react";

const ProfilePage = () => {
    const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
    const [selectedImg, setSelectedImg] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: authUser?.fullName || "",
        userName: authUser?.userName || ""
    });

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("Image size should be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = async () => {
            const base64Image = reader.result;
            setSelectedImg(base64Image);
            await updateProfile({ profilePic: base64Image });
        };
    };

    const handleSaveProfile = async () => {
        await updateProfile(formData);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setFormData({
            fullName: authUser?.fullName || "",
            userName: authUser?.userName || ""
        });
        setIsEditing(false);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-base-200 pt-20">
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
                        Profile
                    </h1>
                    <p className="text-base-content/70 text-lg">
                        Manage your profile information and preferences
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile Picture & Account Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Picture Card */}
                        <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300 p-6">
                            <div className="flex flex-col items-center">
                                <div className="relative mb-4">
                                    <img
                                        src={selectedImg || authUser?.profilePic || "/avatar.png"}
                                        alt="Profile"
                                        className="size-32 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                                    />
                                    <label
                                        htmlFor="avatar-upload"
                                        className={`
                                            absolute bottom-2 right-2 
                                            bg-primary text-primary-content hover:bg-secondary
                                            p-2 rounded-full cursor-pointer shadow-lg
                                            transition-all duration-300 hover:scale-110
                                            ${isUpdatingProfile ? "animate-pulse pointer-events-none opacity-70" : ""}
                                        `}
                                    >
                                        <Camera className="size-5" />
                                        <input
                                            type="file"
                                            id="avatar-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={isUpdatingProfile}
                                        />
                                    </label>
                                </div>
                                
                                <h2 className="text-xl font-bold text-center">{authUser?.fullName}</h2>
                                <p className="text-base-content/60 flex items-center gap-1">
                                    <AtSign className="size-4" />
                                    {authUser?.userName}
                                </p>
                                
                                <div className="mt-4 w-full">
                                    <div className="flex items-center justify-center gap-2 text-sm text-success bg-success/10 px-3 py-1 rounded-full">
                                        <CheckCircle className="size-4" />
                                        <span>Active Account</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Information Card */}
                        <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300 p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Calendar className="size-5 text-primary" />
                                Account Information
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b border-base-300">
                                    <span className="text-base-content/70">Member Since</span>
                                    <span className="font-medium">{authUser?.createdAt ? formatDate(authUser.createdAt) : 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-base-300">
                                    <span className="text-base-content/70">Last Login</span>
                                    <span className="font-medium">Recently</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-base-content/70">Status</span>
                                    <span className="badge badge-success badge-lg">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Profile Details */}
                    <div className="lg:col-span-2">
                        <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold">Profile Details</h3>
                                <button
                                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                                    className={`btn gap-2 ${isEditing ? 'btn-success' : 'btn-primary'}`}
                                    disabled={isUpdatingProfile}
                                >
                                    {isEditing ? (
                                        <>
                                            <CheckCircle className="size-4" />
                                            Save Changes
                                        </>
                                    ) : (
                                        <>
                                            <Edit className="size-4" />
                                            Edit Profile
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Full Name Field */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold flex items-center gap-2">
                                            <User className="size-4 text-primary" />
                                            Full Name
                                        </span>
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="input input-bordered w-full rounded-lg focus:ring-2 focus:ring-primary/50"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                            placeholder="Enter your full name"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-base-200 rounded-lg border border-base-300">
                                            {authUser?.fullName}
                                        </div>
                                    )}
                                </div>

                                {/* Username Field */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold flex items-center gap-2">
                                            <AtSign className="size-4 text-primary" />
                                            Username
                                        </span>
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="input input-bordered w-full rounded-lg focus:ring-2 focus:ring-primary/50"
                                            value={formData.userName}
                                            onChange={(e) => setFormData({...formData, userName: e.target.value})}
                                            placeholder="Enter your username"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-base-200 rounded-lg border border-base-300">
                                            @{authUser?.userName}
                                        </div>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold flex items-center gap-2">
                                            <Mail className="size-4 text-primary" />
                                            Email Address
                                        </span>
                                    </label>
                                    <div className="px-4 py-3 bg-base-200 rounded-lg border border-base-300">
                                        {authUser?.email}
                                    </div>
                                    <div className="label-text-alt text-base-content/60 mt-1">
                                        Email cannot be changed
                                    </div>
                                </div>

                                {/* Edit Actions */}
                                {isEditing && (
                                    <div className="flex gap-3 pt-4 border-t border-base-300">
                                        <button
                                            onClick={handleSaveProfile}
                                            className="btn btn-success flex-1 gap-2"
                                            disabled={isUpdatingProfile}
                                        >
                                            {isUpdatingProfile ? (
                                                <>
                                                    <div className="loading loading-spinner loading-sm"></div>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="size-4" />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="btn btn-ghost flex-1"
                                            disabled={isUpdatingProfile}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-primary/10 rounded-xl p-4 text-center border border-primary/20">
                                <div className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                                    <Users className="size-5" />
                                    {authUser?.friends?.length ?? 0}
                                </div>
                                <div className="text-sm text-base-content/70">Friends</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
