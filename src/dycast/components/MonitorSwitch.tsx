import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface MonitorSwitchProps {
  isMonitoring: boolean;
  activeRoomsCount: number;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export const MonitorSwitch: React.FC<MonitorSwitchProps> = ({
  isMonitoring,
  activeRoomsCount,
  onToggle,
  disabled = false,
}) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center space-x-2">
        <Switch
          id="monitor-switch"
          checked={isMonitoring}
          onCheckedChange={onToggle}
          disabled={disabled}
        />
        <Label htmlFor="monitor-switch" className="font-medium">
          直播间监控
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Badge variant={isMonitoring ? "default" : "secondary"}>
          {isMonitoring ? "运行中" : "已停止"}
        </Badge>
        {isMonitoring && activeRoomsCount > 0 && (
          <Badge variant="outline">{activeRoomsCount} 个房间</Badge>
        )}
      </div>
    </div>
  );
};
