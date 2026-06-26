"use client";

import { useEffect, useState } from "react";
import { Camera, MailWarning, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { isApiError } from "@/lib/api-error";
import { disconnectRealtime } from "@/lib/realtime/socket.client";

import {
  useChangePassword,
  useLogout,
  useResendVerificationEmail,
  useUpdateProfile,
  useVerifyEmailCode,
} from "@/features/auth/hooks";
import {
  changePasswordSchema,
  updateProfileSchema,
  verifyEmailCodeSchema,
} from "@/features/auth/schema";

import { useAuthStore } from "@/store/auth-store";
import { useToastStore } from "@/store/toast-store";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const showToast = useToastStore((state) => state.showToast);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.avatarUrl ?? null,
  );
  const [verificationCode, setVerificationCode] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const updateProfile = useUpdateProfile(token);
  const changePassword = useChangePassword(token);
  const resendVerification = useResendVerificationEmail(token);
  const verifyEmail = useVerifyEmailCode(token);
  const logout = useLogout(token);

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setAvatarUrl(user?.avatarUrl ?? null);
  }, [user?.avatarUrl, user?.email, user?.name]);

  async function submitProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = updateProfileSchema.safeParse({ name, avatarUrl });

    if (!parsed.success) {
      showToast({
        title: "Profile validation failed",
        description: parsed.error.issues[0]?.message,
        tone: "error",
      });
      return;
    }

    try {
      const updatedUser = await updateProfile.mutateAsync(parsed.data);
      if (token) {
        setSession(token, updatedUser);
      }
      showToast({ title: "Profile updated", tone: "success" });
    } catch (error) {
      showToast({
        title: "Profile update failed",
        description: isApiError(error) ? error.message : "Please try again.",
        tone: "error",
      });
    }
  }

  async function submitPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!parsed.success) {
      showToast({
        title: "Password validation failed",
        description: parsed.error.issues[0]?.message,
        tone: "error",
      });
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      });
      showToast({
        title: "Password updated",
        description: "Please log in again with the new password.",
        tone: "success",
      });
      clearLocalSession();
    } catch (error) {
      showToast({
        title: "Password update failed",
        description: isApiError(error) ? error.message : "Please try again.",
        tone: "error",
      });
    }
  }

  async function resendEmail() {
    try {
      await resendVerification.mutateAsync();
      showToast({
        title: "Verification email sent",
        description: "Check your inbox for the latest verification link.",
        tone: "success",
      });
    } catch (error) {
      showToast({
        title: "Could not send email",
        description: isApiError(error) ? error.message : "Please try again.",
        tone: "error",
      });
    }
  }

  async function submitVerificationCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = verifyEmailCodeSchema.safeParse({ code: verificationCode });

    if (!parsed.success) {
      showToast({
        title: "Verification failed",
        description: parsed.error.issues[0]?.message,
        tone: "error",
      });
      return;
    }

    try {
      const updatedUser = await verifyEmail.mutateAsync(parsed.data);
      if (token) {
        setSession(token, updatedUser);
      }
      setVerificationCode("");
      showToast({ title: "Email verified", tone: "success" });
    } catch (error) {
      showToast({
        title: "Verification failed",
        description: isApiError(error) ? error.message : "Please try again.",
        tone: "error",
      });
    }
  }

  function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      showToast({
        title: "Image upload failed",
        description: "Use a PNG, JPG, or WEBP image.",
        tone: "error",
      });
      return;
    }

    if (file.size > 350_000) {
      showToast({
        title: "Image upload failed",
        description: "Use an image smaller than 350KB.",
        tone: "error",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleLogout() {
    try {
      if (token) {
        await logout.mutateAsync();
      }
    } catch {
      // Local logout still clears an unusable or expired session.
    } finally {
      clearLocalSession();
    }
  }

  function clearLocalSession() {
    disconnectRealtime();
    clearSession();
    queryClient.clear();
    router.replace("/login");
  }

  const initial = user?.name.slice(0, 1).toUpperCase() ?? "U";

  return (
    <AppShell title="Profile" subtitle="Manage account details and security.">
      <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card className="p-6 text-center">
            <label className="group relative mx-auto block size-24 cursor-pointer">
              {avatarUrl ? (
                <img
                  alt="Profile"
                  className="size-24 rounded-full object-cover ring-2 ring-white/10"
                  height={96}
                  src={avatarUrl}
                  width={96}
                />
              ) : (
                <span className="grid size-24 place-items-center rounded-full bg-gradient-to-br from-pink-300 to-violet-600 text-3xl font-bold">
                  {initial}
                </span>
              )}
              <span className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full border border-white/10 bg-[#111217] text-white">
                <Camera className="size-4" />
              </span>
              <input
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={handleAvatarUpload}
                type="file"
              />
            </label>
            <h2 className="mt-4 text-xl font-bold">{user?.name ?? "Trader"}</h2>
            <p className="mt-1 text-sm text-zinc-400">{user?.email}</p>
            <div className="mt-4 flex justify-center gap-2">
              <Badge>{user?.role ?? "USER"}</Badge>
              <Badge
                className={
                  user?.emailVerified
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-amber-500/15 text-amber-300"
                }
              >
                {user?.emailVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </Card>

          {!user?.emailVerified ? (
            <Card className="p-5">
              <div className="flex gap-3">
                <MailWarning className="mt-0.5 size-5 shrink-0 text-amber-300" />
                <div>
                  <h2 className="font-semibold text-white">Verify your email</h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    Trading is disabled until your email address is verified.
                  </p>
                  <form
                    className="mt-4 flex flex-col gap-3 sm:flex-row"
                    onSubmit={submitVerificationCode}
                  >
                    <Input
                      inputMode="numeric"
                      maxLength={6}
                      onChange={(event) =>
                        setVerificationCode(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder="6-digit code"
                      value={verificationCode}
                    />
                    <Button
                      disabled={verifyEmail.isPending}
                      type="submit"
                      size="sm"
                    >
                      {verifyEmail.isPending ? "Checking..." : "Verify"}
                    </Button>
                  </form>
                  <Button
                    className="mt-4"
                    disabled={resendVerification.isPending}
                    onClick={() => {
                      void resendEmail();
                    }}
                    size="sm"
                  >
                    {resendVerification.isPending ? "Sending..." : "Resend Email"}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-5">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-300" />
                <div>
                  <h2 className="font-semibold text-white">Email verified</h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    Your account is enabled for trading.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold text-white">Account Details</h2>
            <form className="mt-5 space-y-4" onSubmit={submitProfile}>
              <label className="block text-sm text-zinc-300">
                Name
                <Input
                  className="mt-2"
                  onChange={(event) => setName(event.target.value)}
                  value={name}
                />
              </label>

              <label className="block text-sm text-zinc-300">
                Email
                <Input
                  className="mt-2"
                  disabled
                  onChange={(event) => setEmail(event.target.value)}
                  value={email}
                />
                <span className="mt-2 block text-xs text-zinc-500">
                  To change your email, contact support.
                </span>
              </label>

                <Button disabled={updateProfile.isPending} type="submit">
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-white">Security</h2>
            <form className="mt-5 space-y-4" onSubmit={submitPassword}>
              <label className="block text-sm text-zinc-300">
                Current password
                <Input
                  className="mt-2"
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  type="password"
                  value={currentPassword}
                />
              </label>

              <label className="block text-sm text-zinc-300">
                New password
                <Input
                  className="mt-2"
                  onChange={(event) => setNewPassword(event.target.value)}
                  type="password"
                  value={newPassword}
                />
              </label>

              <label className="block text-sm text-zinc-300">
                Confirm password
                <Input
                  className="mt-2"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  type="password"
                  value={confirmPassword}
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <Button disabled={changePassword.isPending} type="submit">
                  {changePassword.isPending ? "Updating..." : "Update Password"}
                </Button>
                <Button
                  disabled={logout.isPending}
                  onClick={() => {
                    void handleLogout();
                  }}
                  type="button"
                  variant="outline"
                >
                  {logout.isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
