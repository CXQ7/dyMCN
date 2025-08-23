import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  BarChart3,
  Headphones,
  BookOpen,
  Settings,
  Home,
  LogOut,
  User as UserIcon,
  Radio,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { User, Permission } from "../types";
import { getUserRoleLabel } from "../utils/mockData";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun, Monitor } from "lucide-react";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  pendingCount?: number;
  manualReplyCount?: number;
  user: User;
  onLogout: () => void;
}

export function Navigation({
  currentPage,
  onPageChange,
  pendingCount = 0,
  manualReplyCount = 0,
  user,
  onLogout,
}: NavigationProps) {
  const allNavItems = [
    {
      id: "dashboard" as Permission,
      label: "运营看板",
      icon: BarChart3,
      badge: null,
      description: "数据监控与分析",
    },
    {
      id: "customer-service" as Permission,
      label: "客服坐席",
      icon: Headphones,
      badge: manualReplyCount > 0 ? manualReplyCount : null,
      description: "人工服务与干预",
    },
    {
      id: "knowledge-base" as Permission,
      label: "知识库",
      icon: BookOpen,
      badge: null,
      description: "文档与Q&A管理",
    },
    {
      id: "dycast" as Permission,
      label: "弹幕监控",
      icon: Radio,
      badge: null,
      description: "抖音直播弹幕实时监控",
    },
    {
      id: "settings" as Permission,
      label: "设置",
      icon: Settings,
      badge: null,
      description: "系统配置管理",
    },
  ];

  // 根据用户权限过滤菜单项
  const navItems = allNavItems.filter((item) =>
    user.permissions.includes(item.id)
  );
  const { theme, setTheme } = useTheme();

  return (
    <div className="border-b bg-card">
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Home className="size-6 text-primary" />
              <h1 className="text-xl font-semibold">直播互动运营系统</h1>
            </div>

            <nav className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => onPageChange(item.id)}
                    className="relative gap-2 h-9"
                  >
                    <Icon className="size-4" />
                    {item.label}
                    {item.badge && (
                      <Badge
                        variant="destructive"
                        className="ml-1 h-5 px-1.5 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {pendingCount > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>待应答:</span>
                <Badge variant="destructive">{pendingCount}</Badge>
              </div>
            )}

            {/* 主题切换 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 h-9"
                  aria-label="切换主题"
                >
                  {theme === "dark" ? (
                    <Moon className="size-4" />
                  ) : theme === "light" ? (
                    <Sun className="size-4" />
                  ) : (
                    <Monitor className="size-4" />
                  )}
                  <span className="hidden sm:inline">
                    {theme === "system"
                      ? "跟随系统"
                      : theme === "dark"
                      ? "深色"
                      : "浅色"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setTheme("light")}
                  className="gap-2"
                >
                  <Sun className="size-3" /> 浅色
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("dark")}
                  className="gap-2"
                >
                  <Moon className="size-3" /> 深色
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("system")}
                  className="gap-2"
                >
                  <Monitor className="size-3" /> 跟随系统
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 用户信息下拉菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 h-9">
                  <UserIcon className="size-4" />
                  {user.username}
                  <Badge variant="secondary" className="text-xs">
                    {getUserRoleLabel(user.role)}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{user.username}</div>
                  <div className="text-muted-foreground text-xs">
                    {getUserRoleLabel(user.role)}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  权限范围：
                </div>
                <div className="px-2 pb-2 space-y-1">
                  {user.permissions.map((permission) => (
                    <div
                      key={permission}
                      className="text-xs text-muted-foreground"
                    >
                      •{" "}
                      {
                        allNavItems.find((item) => item.id === permission)
                          ?.label
                      }
                    </div>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="gap-2">
                  <LogOut className="size-3" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
