'use client';

import { useState } from 'react';
import { User, Loader2 } from 'lucide-react';
import { updateProfileAction } from '@/app/actions/profile';
import { useToast } from '@/components/Toast';

type Props = {
  username: string | null;
  displayName: string | null;
  bio: string | null;
  defaultPublic: boolean;
};

export function ProfileForm({ username, displayName, bio, defaultPublic }: Props) {
  const toast = useToast();
  const [profileUsername, setProfileUsername] = useState(username || '');
  const [profileDisplayName, setProfileDisplayName] = useState(displayName || '');
  const [profileBio, setProfileBio] = useState(bio || '');
  const [profileDefaultPublic, setProfileDefaultPublic] = useState(defaultPublic);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profileUsername.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    setIsSavingProfile(true);
    try {
      const res = await updateProfileAction({
        username: profileUsername.trim() || null,
        display_name: profileDisplayName.trim() || null,
        bio: profileBio.trim() || null,
        default_public: profileDefaultPublic,
      });
      if (res.ok) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(res.error || 'Failed to update profile');
      }
    } catch {
      toast.error('An unexpected error occurred while updating profile.');
    } finally {
      setIsSavingProfile(false);
    }
  }

  return (
    <section className="card space-y-5 p-6">
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-primary">
        <User size={14} className="text-gold" />
        Public Profile Settings
      </h2>

      <form onSubmit={handleSaveProfile} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="profile-username"
              className="block text-xs uppercase tracking-[0.18em] text-text-secondary"
            >
              Username
            </label>
            <input
              id="profile-username"
              type="text"
              required
              pattern="[a-z0-9_]{3,24}"
              title="3-24 characters, lowercase, numbers, or underscore"
              value={profileUsername}
              onChange={(e) => setProfileUsername(e.target.value.toLowerCase())}
              className="input text-sm"
              placeholder="username"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-display-name"
              className="block text-xs uppercase tracking-[0.18em] text-text-secondary"
            >
              Display Name
            </label>
            <input
              id="profile-display-name"
              type="text"
              value={profileDisplayName}
              onChange={(e) => setProfileDisplayName(e.target.value)}
              className="input text-sm"
              placeholder="Your Name"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="profile-bio"
            className="block text-xs uppercase tracking-[0.18em] text-text-secondary"
          >
            Bio
          </label>
          <textarea
            id="profile-bio"
            value={profileBio}
            onChange={(e) => setProfileBio(e.target.value)}
            className="textarea text-sm"
            rows={3}
            placeholder="Tell others about yourself..."
          />
        </div>

        <label className="flex cursor-pointer select-none items-start gap-3 pt-2">
          <input
            type="checkbox"
            checked={profileDefaultPublic}
            onChange={(e) => setProfileDefaultPublic(e.target.checked)}
            className="mt-1 rounded border-border accent-gold"
          />
          <div>
            <span className="text-sm font-medium text-text-primary">
              Make new insights public by default
            </span>
            <p className="mt-0.5 text-xs text-text-secondary">
              If enabled, new notes and reflections will be shared publicly on your profile page by
              default.
            </p>
          </div>
        </label>

        <button
          type="submit"
          disabled={isSavingProfile}
          className="btn btn-primary flex items-center gap-1.5 px-4 py-2 text-xs"
        >
          {isSavingProfile && <Loader2 size={13} className="animate-spin" />}
          Save Profile
        </button>
      </form>
    </section>
  );
}
