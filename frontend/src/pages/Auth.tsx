
import React, { useState } from "react";
import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

const Auth = () => {
  const [activeTab, setActiveTab] = useState<string>("login");

  const handleRegisterSuccess = () => {
    setActiveTab("login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-navy">
            <GraduationCap size={40} className="text-teal" />
            <span className="text-2xl font-bold">UniApply</span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            {activeTab === "login" ? "Welcome Back" : "Create Your Account"}
          </h1>
          <p className="mt-2 text-gray-600">
            {activeTab === "login"
              ? "Sign in to access your university applications"
              : "Join thousands of students finding their perfect university match"}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm />
              <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setActiveTab("register")}
                    className="text-teal font-medium hover:underline"
                  >
                    Register
                  </button>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm onSuccess={handleRegisterSuccess} />
              <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <button
                    onClick={() => setActiveTab("login")}
                    className="text-teal font-medium hover:underline"
                  >
                    Log In
                  </button>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>By continuing, you agree to UniApply's</p>
          <p className="mt-1">
            <Link to="/terms" className="text-teal hover:underline">Terms of Service</Link>
            {" & "}
            <Link to="/privacy" className="text-teal hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
