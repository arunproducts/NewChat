import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Loader2, LogIn, UserPlus, Zap } from "lucide-react";

interface LoginFormData {
  username: string;
  password: string;
}

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login: authLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginData, setLoginData] = useState<LoginFormData>({
    username: "demo",
    password: "demo123",
  });

  // Register state
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        // Use AuthContext login to update global state
        authLogin(data.token, data.user);

        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.username}!`,
        });

        // Redirect to home
        setTimeout(() => setLocation("/"), 500);
      } else {
        toast({
          title: "Login Failed",
          description: data.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      toast({
        title: "Error",
        description: "Failed to login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        // Use AuthContext login to update global state
        authLogin(data.token, data.user);

        toast({
          title: "Registration Successful",
          description: `Welcome, ${data.user.username}!`,
        });

        setTimeout(() => setLocation("/"), 500);
      } else {
        toast({
          title: "Registration Failed",
          description: data.error || "Unable to register",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Register error:", err);
      toast({
        title: "Error",
        description: "Failed to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-white" />
            <h1 className="text-4xl font-bold text-white">xelo</h1>
          </div>
          <p className="text-white/80 text-lg">AI Platform</p>
          <p className="text-white/60 text-sm mt-2">Advanced AI Features & Industry Solutions</p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Login to your account or create a new one to access all features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Register</span>
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Username</label>
                    <Input
                      type="text"
                      placeholder="Enter your username"
                      value={loginData.username}
                      onChange={(e) =>
                        setLoginData((prev) => ({ ...prev, username: e.target.value }))
                      }
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Try: demo</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Password</label>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Try: demo123</p>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading} size="lg">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Login
                      </>
                    )}
                  </Button>

                  {/* Demo Info */}
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                      📝 Demo Account:
                    </p>
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      Username: <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">demo</code>
                    </p>
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      Password: <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">demo123</code>
                    </p>
                  </div>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Username</label>
                    <Input
                      type="text"
                      placeholder="Choose a username"
                      value={registerData.username}
                      onChange={(e) =>
                        setRegisterData((prev) => ({ ...prev, username: e.target.value }))
                      }
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Password</label>
                    <Input
                      type="password"
                      placeholder="Create a password"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Confirm Password</label>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        setRegisterData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                      }
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading} size="lg">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>

                  {/* Requirements */}
                  <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">
                      Requirements:
                    </p>
                    <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-0.5">
                      <li>✓ Username must be unique</li>
                      <li>✓ Password must be 6+ characters</li>
                      <li>✓ Valid email address required</li>
                    </ul>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/80 text-sm">
            Advanced AI Platform with Vision, Identity, Edge & Industry Solutions
          </p>
        </div>
      </div>
    </div>
  );
}
