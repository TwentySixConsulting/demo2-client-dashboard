import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginPage } from "@/components/LoginPage";

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, tempUser, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: "hsl(40 27% 95%)" }}
      >
        <Loader2
          className="w-6 h-6 animate-spin"
          style={{ color: "hsl(42 53% 45%)" }}
        />
      </div>
    );
  }

  if (!user && !tempUser) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
