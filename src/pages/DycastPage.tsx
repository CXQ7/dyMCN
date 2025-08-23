import React from "react";
import { DycastPanel } from "@/dycast/components/DycastPanel";

export function DycastPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="p-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              抖音弹幕监控
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              实时监控抖音直播间弹幕消息，支持多种消息类型
            </p>
          </div>

          <div className="space-y-6">
            <DycastPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
