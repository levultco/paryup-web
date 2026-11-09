import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginScreen } from "@/screens/login";
import { LoginArt } from "@/screens/login/LoginArt";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <LoginScreen
        mode="signup"
        art={
          <Suspense fallback={null}>
            <LoginArt />
          </Suspense>
        }
      />
    </Suspense>
  );
}
