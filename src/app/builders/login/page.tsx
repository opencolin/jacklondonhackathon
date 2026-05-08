import { LoginCard } from "@/components/auth/login-card";

export default function BuilderLogin() {
  return (
    <LoginCard
      flavor="builder"
      title="Sign in to BuilderShip"
      subtitle="Submit your project, RSVP for office hours, ship something the judges remember."
      redirect="/builders/dashboard"
    />
  );
}
