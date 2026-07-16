import { DashboardPageHeader } from "@/components/dashboard";
import { ProfileForm } from "@/components/profile/profile-form";
import { requireSession } from "@/lib/auth/require-session";

export default async function ProfilePage() {
  const session = await requireSession();
  return (
    <div className="max-w-xl">
      <DashboardPageHeader
        title="Perfil"
        subtitle="Gerencie suas informações pessoais."
      />
      <ProfileForm name={session.user.name} email={session.user.email} />
    </div>
  );
}
