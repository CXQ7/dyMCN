import { useState, useEffect, Suspense, lazy } from "react";
import { Navigation } from "@/components/Navigation";
import { LoginPage } from "@/pages/LoginPage";
import {
  generateManualReplies,
  generateSystemSettings,
} from "@/utils/mockData";
import { User } from "@/types";
import { useTheme } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { liveRoomMonitor } from "@/dycast/services/liveRoomMonitor";
import { toast } from "sonner";
import { useLiveRooms } from "@/hooks/useLiveRooms";
import { useRealData } from "@/hooks/useRealData";

const DashboardPage = lazy(() =>
  import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const CustomerServicePage = lazy(() =>
  import("@/pages/CustomerServicePage").then((m) => ({
    default: m.CustomerServicePage,
  }))
);
const KnowledgeBasePage = lazy(() =>
  import("@/pages/KnowledgeBasePage").then((m) => ({
    default: m.KnowledgeBasePage,
  }))
);
const SettingsPage = lazy(() =>
  import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage }))
);
const DycastPage = lazy(() =>
  import("@/pages/DycastPage").then((m) => ({ default: m.DycastPage }))
);

function AppInner() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [systemSettings, setSystemSettings] = useState(
    generateSystemSettings()
  );

  const {
    liveRooms,
    loading: liveRoomsLoading,
    onlineCountsLoading,
    realTimeOnlineCounts,
    totalOnlineCount,
    getChartData,
    getYAxisRange,
    getPendingDataStatus,
    error: liveRoomsError,
  } = useLiveRooms();

  const {
    pendingQuestions,
    answeredQuestions,
    transactions,
    roomMetrics,
    loading: dataLoading,
    error: dataError,
  } = useRealData();

  // 显示数据加载错误
  useEffect(() => {
    if (liveRoomsError) {
      toast.error(`直播间数据加载失败: ${liveRoomsError}`);
    }
    if (dataError) {
      toast.error(`业务数据加载失败: ${dataError}`);
    }
  }, [liveRoomsError, dataError]);
  const [manualReplies] = useState(generateManualReplies(8));

  // 检查本地存储的登录状态
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        // 如果是从本地存储恢复登录状态，也启动监控
        startAutoMonitoring();
      } catch (error) {
        localStorage.removeItem("currentUser");
      }
    }
  }, []);

  // 自动启动监控
  const startAutoMonitoring = async () => {
    try {
      await liveRoomMonitor.startMonitoring();
      toast.success("数据库监控已自动启动");
    } catch (error) {
      console.error("自动启动监控失败:", error);
      toast.error("自动启动监控失败");
    }
  };

  // 登录处理
  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
    // 如果用户没有当前页面权限，跳转到有权限的第一个页面
    if (!user.permissions.includes(currentPage as any)) {
      setCurrentPage(user.permissions[0]);
    }

    // 登录后自动启动监控
    await startAutoMonitoring();
  };

  // 登出处理
  const handleLogout = async () => {
    // 登出时停止监控
    try {
      await liveRoomMonitor.stopMonitoring();
      toast.info("数据库监控已停止");
    } catch (error) {
      console.error("停止监控失败:", error);
    }

    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    setCurrentPage("dashboard");
  };

  // 页面切换处理（增加权限检查）
  const handlePageChange = (page: string) => {
    if (currentUser && currentUser.permissions.includes(page as any)) {
      setCurrentPage(page);
    }
  };

  const renderCurrentPage = () => {
    if (!currentUser) {
      return null;
    }

    // 检查用户是否有权限访问当前页面
    if (!currentUser.permissions.includes(currentPage as any)) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <p className="text-muted-foreground">您没有权限访问此页面</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage
            pendingQuestions={pendingQuestions}
            answeredQuestions={answeredQuestions}
            transactions={transactions}
            roomMetrics={roomMetrics}
            liveRooms={liveRooms}
            loading={liveRoomsLoading || dataLoading}
            onlineCountsLoading={onlineCountsLoading}
            realTimeOnlineCounts={realTimeOnlineCounts}
            totalOnlineCount={totalOnlineCount}
            getChartData={getChartData}
            getYAxisRange={getYAxisRange}
          />
        );
      case "customer-service":
        return (
          <CustomerServicePage
            systemSettings={systemSettings}
            onSystemSettingsChange={setSystemSettings}
          />
        );
      case "knowledge-base":
        return <KnowledgeBasePage />;
      case "dycast":
        return <DycastPage />;
      case "settings":
        return (
          <SettingsPage
            systemSettings={systemSettings}
            onSystemSettingsChange={setSystemSettings}
          />
        );
      default:
        return (
          <DashboardPage
            pendingQuestions={pendingQuestions}
            answeredQuestions={answeredQuestions}
            transactions={transactions}
            roomMetrics={roomMetrics}
            liveRooms={liveRooms}
            loading={liveRoomsLoading || dataLoading}
            onlineCountsLoading={onlineCountsLoading}
            realTimeOnlineCounts={realTimeOnlineCounts}
            totalOnlineCount={totalOnlineCount}
            getChartData={getChartData}
            getYAxisRange={getYAxisRange}
          />
        );
    }
  };

  // 如果未登录，显示登录页面
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentPage={currentPage}
        onPageChange={handlePageChange}
        pendingCount={pendingQuestions.length}
        manualReplyCount={manualReplies.length}
        user={currentUser}
        onLogout={handleLogout}
      />
      <Suspense fallback={<div className="p-4">加载中...</div>}>
        {renderCurrentPage()}
      </Suspense>
    </div>
  );
}

export default function App() {
  const { theme } = useTheme();

  return (
    <>
      <AppInner />
      <Toaster theme={theme as any} />
    </>
  );
}
