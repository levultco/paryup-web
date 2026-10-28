import localFont from "next/font/local";

// En la v1 toda la web, incluida la lista de espera, va en Montserrat.
const montserrat = localFont({
  src: "../assets/fonts/Montserrat-Variable.ttf",
  variable: "--font-montserrat",
});

export default function WaitlistLayout({ children }: LayoutProps<"/waitlist">) {
  return <div className={montserrat.className}>{children}</div>;
}
