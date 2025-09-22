import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import Chat from "./Chat";

type AuthState = "login" | "signup" | "authenticated";

const Index = () => {
  const [authState, setAuthState] = useState<AuthState>("login");
  const [isFormToggling, setIsFormToggling] = useState(false);

  const handleLogin = (email: string, password: string) => {
    console.log("Login:", { email, password });
    setAuthState("authenticated");
  };

  const handleSignup = (userData: { email: string; password: string; fullName: string; username: string }) => {
    console.log("Signup:", userData);
    setAuthState("authenticated");
  };

  const handleToggleForm = () => {
    setIsFormToggling(true);
    setTimeout(() => {
      setAuthState(authState === "login" ? "signup" : "login");
      setIsFormToggling(false);
    }, 150);
  };

  if (authState === "authenticated") {
    return <Chat />;
  }

  return (
    <div className={`transition-opacity duration-150 ${isFormToggling ? "opacity-0" : "opacity-100"}`}>
      {authState === "login" ? (
        <LoginForm onToggleForm={handleToggleForm} onLogin={handleLogin} />
      ) : (
        <SignupForm onToggleForm={handleToggleForm} onSignup={handleSignup} />
      )}
    </div>
  );
};

export default Index;
