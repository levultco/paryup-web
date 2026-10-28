import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginScreen } from "@/screens/login";
import { LoginArt } from "@/screens/login/LoginArt";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={null}>
        <LoginScreen
          art={
            <Suspense fallback={null}>
              <LoginArt />
            </Suspense>
          }
        />
      </Suspense>
    </>
  );
}
