import type { Metadata } from "next";
import { SignupContinueScreen } from "@/screens/signup";

export const metadata: Metadata = { title: "Completa tu cuenta" };

export default function SignupContinuePage() {
  return <SignupContinueScreen />;
}
