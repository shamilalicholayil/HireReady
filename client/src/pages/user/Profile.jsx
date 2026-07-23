import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProfile, updateProfile, uploadAvatar } from "../../api/profileApi";
import Card from "../../components/common/Card";
import { Camera, FileText } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateUser } from "../../features/auth/authSlice";

const GENDER_OPTIONS = ["male", "female"];

export default function Profile() {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    bio: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        const u = res.data.userData;
        setForm({
          name: u.name || "",
          email: u.email || "",
          age: u.age ?? "",
          gender: u.gender || "",
          bio: u.bio || "",
        });
        setAvatar(u.avatar || null);
        setResumeUrl(u.resumeUrl || null);
        setUpdatedAt(u.updatedAt || null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleAgeChange = (e) => {
    const val = e.target.value;
    if (val === "" || (Number(val) >= 6 && Number(val) <= 100)) {
      setForm((f) => ({ ...f, age: val }));
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setAvatarUploading(true);
    try {
      const res = await uploadAvatar(formData);
      setAvatar(res.data.user.avatar);
      dispatch(updateUser({ avatar: res.data.user.avatar }));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Avatar upload failed");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile({
        name: form.name,
        bio: form.bio,
        age: form.age,
        gender: form.gender,
      });
      setUpdatedAt(res.data.user.updatedAt);
      dispatch(updateUser({ name: res.data.user.name }));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]";
  const labelClass = "block text-[var(--text-secondary)] text-xs mb-1.5";

  const filledCount = [
    form.name,
    form.bio,
    form.age,
    form.gender,
    avatar,
  ].filter(Boolean).length;
  const profileStrength = Math.round((filledCount / 5) * 100);

  const formatLastUpdated = (dateStr) => {
    if (!dateStr) return "";
    const days = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / 86400000,
    );
    if (days === 0) return "Last updated today";
    if (days === 1) return "Last updated 1 day ago";
    return `Last updated ${days} days ago`;
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20 text-[var(--text-secondary)] text-sm">
        Loading profile...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && <p className="text-[var(--error)] text-sm">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Avatar card */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[var(--surface-alt)] border border-[var(--border)] overflow-hidden flex items-center justify-center">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="avatar"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-[var(--text-secondary)]">
                    {form.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center cursor-pointer border-2 border-[var(--surface)]">
                <Camera size={13} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            <h3 className="text-[var(--text-primary)] font-semibold mt-4">
              {form.name || "Your Name"}
            </h3>
            <p className="text-[var(--text-secondary)] text-sm">{form.email}</p>

            <label className="mt-4 w-full text-center text-sm font-medium text-[var(--text-primary)] bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg py-2 cursor-pointer hover:bg-white/5 transition-colors">
              {avatarUploading ? "Uploading..." : "Change Photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={avatarUploading}
              />
            </label>

            <div className="w-full mt-6 pt-4 border-t border-[var(--border)]">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[var(--text-secondary)]">
                  Profile Strength
                </span>
                <span className="text-[var(--primary)] font-semibold">
                  {profileStrength}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--surface-alt)] overflow-hidden">
                <div
                  className="h-full bg-[var(--primary)] transition-all"
                  style={{ width: `${profileStrength}%` }}
                />
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-2 text-left">
                Complete your profile to unlock personalized AI scenarios.
              </p>
            </div>
          </div>
        </Card>

        {/* Right: Account info card */}
        <Card
          className="lg:col-span-2"
          title="Account Information"
          description="Manage your public profile details."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                readOnly
                className={`${inputClass} cursor-not-allowed opacity-50`}
              />
              <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                Email cannot be changed for verified accounts.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label className={labelClass}>Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className={labelClass}>Age</label>
              <input
                type="number"
                name="age"
                min="6"
                max="100"
                value={form.age}
                onChange={handleAgeChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className={labelClass}>Resume / CV</label>
            <div className="flex items-center justify-between bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg px-3 py-2">
              <span className="flex items-center gap-2 text-sm text-[var(--text-primary)] truncate">
                <FileText
                  size={15}
                  className="text-[var(--text-secondary)] shrink-0"
                />
                {resumeUrl ? "Resume uploaded" : "No resume uploaded"}
              </span>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-[var(--primary)]"
                  >
                    View
                  </a>
                )}
                <Link
                  to="/profile/resume"
                  className="text-xs font-medium text-[var(--primary)]"
                >
                  {resumeUrl ? "Replace" : "Upload"}
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border)]">
            <span className="text-xs text-[var(--text-secondary)]">
              {formatLastUpdated(updatedAt)}
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] bg-[var(--surface-alt)] border border-[var(--border)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary)] text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </form>
  );
}
