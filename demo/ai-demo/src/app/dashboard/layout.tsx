import Link from "next/link";
import Image from "next/image";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ProfileDropdown } from "@/components/dashboard/ProfileDropdown";
import { DemoGate } from "@/demo/DemoGate";
import { DemoBadge } from "@/demo/DemoBadge";
import { MobileNav } from "@/demo/MobileNav";

// Demo build: no database, no auth provider. The signed-in user, organisation and
// default agent are fixed sample values (see src/demo/seed.ts).
const hospitalName = process.env.NEXT_PUBLIC_HOSPITAL_NAME || "City Hospital";
const orgName = hospitalName;
const user = { firstName: "Demo", lastName: "Admin", email: "demo@hospitalcart.demo", imageUrl: null as string | null };
const agent = { id: "agent_1", name: "MedAssist" };
const welcomeMsg = `Hello! I'm ${agent.name}, your AI healthcare assistant at ${hospitalName}. How can I help you today?`;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoGate>
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        display: "flex",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <style>{`
        html, body { background: #0a0a0f !important; margin: 0; padding: 0; }
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            right: "5%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      <Sidebar />

      <div
        className="hc-main"
        style={{
          flex: 1,
          marginLeft: "220px",
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            height: "56px",
            background: "rgba(10,10,15,0.85)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            padding: "0 28px",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <MobileNav />
            <Link href="/dashboard/overview" className="hc-logo-mobile" style={{ display: "none", textDecoration: "none", marginRight: "6px" }}>
              <Image src="/logo.png" alt="Logo" width={85} height={21} style={{ height: "21px", width: "auto", objectFit: "contain" }} priority />
            </Link>
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 6px #10b981",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.3)",
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {hospitalName}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
            <span className="hc-demo-hide-sm" style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </span>
            <DemoBadge />
            <ProfileDropdown
              firstName={user.firstName}
              lastName={user.lastName}
              email={user.email}
              imageUrl={user.imageUrl}
              orgName={orgName}
            />
          </div>
        </header>

        <main
          style={{ flex: 1, color: "#fff", minHeight: 0, display: "flex", flexDirection: "column" }}
        >
          {children}
        </main>
      </div>

      {agent && (
        <div style={{ position: "fixed", right: 0, bottom: 0, zIndex: 80 }}>
          <ChatWidget
            agentId={agent.id}
            primaryColor="#6366f1"
            welcomeMessage={welcomeMsg}
            agentName={agent.name}
          />
        </div>
      )}
    </div>
    </DemoGate>
  );
}
