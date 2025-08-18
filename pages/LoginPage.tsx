import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { LogIn, Shield, AlertCircle, Eye, EyeOff } from "lucide-react";
import { authenticateUser, getUserRoleLabel } from "../utils/mockData";
import { User as UserType } from "../types";

interface LoginPageProps {
  onLogin: (user: UserType) => Promise<void>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 模拟网络延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const user = authenticateUser(username, password);
      if (user) {
        await onLogin(user);
      } else {
        setError("用户名或密码错误，请重试");
      }
    } catch (err) {
      setError("登录失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="size-12 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="size-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">直播互动运营工具</h1>
          <p className="text-muted-foreground">请登录您的账号以继续</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="size-4" />
              用户登录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="请输入用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-3" />
                    ) : (
                      <Eye className="size-3" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "登录中..." : "登录"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          <p>© 2025 直播互动运营工具. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
