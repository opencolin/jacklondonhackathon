import { LoginCard } from "@/components/auth/login-card";

export default function CompanyLogin() {
  return (
    <LoginCard
      flavor="company"
      title="Sign in to BuilderShip for sponsors"
      subtitle="Send judges, schedule office hours, see who's building on your stack."
      redirect="/companies/dashboard"
    />
  );
}
