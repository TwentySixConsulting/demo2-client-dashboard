// The standard page chrome: canvas, the fixed Shell, the content column, the
// footer. Home, Account and YourOrganisation each carry their own copy of this
// today; rather than make a fourth and fifth copy for Trends and Methodology,
// they render through here.
//
// Not refactoring the three existing pages onto it in the same change: they are
// large files (YourOrganisation is ~53k) and there is nothing to gain from the
// churn. They can migrate whenever one of them is next opened for other reasons.
//
// `paddingTop: 60` clears the fixed 60px Shell. That number is duplicated in
// Shell.tsx's own height and in the static shells' `body { padding-top: 60px }`;
// if it changes, it changes in all three.
import { Shell } from "@/components/Shell";
import { useAuth } from "@/contexts/AuthContext";
import { clientConfig, clientNameToEmail } from "@/config/clientConfig";
import { C } from "@/lib/theme";

type Active = React.ComponentProps<typeof Shell>["active"];

export function PageFrame({
  active,
  children,
}: {
  active: Active;
  children: React.ReactNode;
}) {
  const { user, tempUser, signOut } = useAuth();
  // Same precedence as Home.tsx, so the name in the Shell pill does not change
  // as the user moves between pages.
  const username =
    (user?.email && user.email.split("@")[0]) ??
    tempUser?.username ??
    clientConfig.clientName.toLowerCase();
  const email = user?.email ?? clientNameToEmail(username);

  return (
    <div className="min-h-screen w-full flex flex-col ts-canvas ts-sans" style={{ color: C.ink }}>
      <Shell
        username={username}
        email={email}
        active={active}
        onSignOut={() => {
          void signOut();
        }}
      />

      <main className="flex-1 w-full px-6 lg:px-10 pb-16" style={{ paddingTop: 60 }}>
        <div className="max-w-[1180px] mx-auto pt-9 lg:pt-11 space-y-7 ts-anim-fade-up">
          {children}
        </div>
      </main>

      <footer
        className="ts-print-hide w-full px-6 lg:px-10 py-6 flex flex-wrap items-center justify-between gap-2"
        style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}
      >
        <div className="text-[11px] tracking-wide" style={{ color: C.inkMuted }}>
          Powered by{" "}
          <a
            href="https://www.twentysixconsulting.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline"
            style={{ color: C.brassDeep }}
          >
            TwentySix Consulting
          </a>
        </div>
        <div className="text-[11px]" style={{ color: C.inkSubtle }}>
          © {new Date().getFullYear()} · {clientConfig.clientName}
        </div>
      </footer>
    </div>
  );
}
