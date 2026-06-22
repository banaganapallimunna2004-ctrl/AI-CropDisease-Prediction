import { useLocation } from "react-router-dom";

const classForRoute = (pathname) => {
  // Disease / surveillance theme (topic C)
  if (["/scan"].includes(pathname)) return "bg-topic-disease-scan";

  if (["/admin"].includes(pathname)) return "bg-topic-disease-admin";

  if (["/analytics", "/dashboard", "/chatbot", "/crop-prediction", "/weather"].includes(pathname)) {
    return "bg-topic-disease-telemetry";
  }

  // Auth / onboarding
  if (["/", "/login", "/home", "/register"].includes(pathname)) return "bg-topic-disease-auth";
  if (["/verify", "/forgot-password", "/reset-password"].includes(pathname)) return "bg-topic-disease-verify";

  return "bg-topic-disease-auth";
};

export default function BackgroundByRoute({ children }) {
  const location = useLocation();
  const bgClass = classForRoute(location.pathname);

  return (
    <div className={`relative min-h-screen ${bgClass}`}>
      {/* overlays */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="bg-noise" />
        <div className="topic-grid" />
        <div className="topic-vignette" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

