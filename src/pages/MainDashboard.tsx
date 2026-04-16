import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import CalendarPanel from '../components/CalendarPanel';
import TodoPanel from '../components/TodoPanel';
import InboxPanel from '../components/InboxPanel';
import PomodoroPanel from '../components/PomodoroPanel';

function PanelCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden h-full">
      {children}
    </div>
  );
}

export default function MainDashboard() {
  return (
    <div className="h-full p-4">
      <div className="mb-3">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Wednesday, October 16, 2024</p>
      </div>

      <div style={{ height: 'calc(100% - 56px)' }}>
        <PanelGroup direction="horizontal" className="h-full gap-3">
          {/* Left column: Calendar + Pomodoro */}
          <Panel defaultSize={28} minSize={20}>
            <PanelGroup direction="vertical" className="h-full gap-3">
              <Panel defaultSize={65} minSize={30}>
                <PanelCard>
                  <CalendarPanel />
                </PanelCard>
              </Panel>
              <PanelResizeHandle className="h-1 bg-gray-200 hover:bg-indigo-400 rounded cursor-row-resize transition-colors" />
              <Panel defaultSize={35} minSize={20}>
                <PanelCard>
                  <PomodoroPanel />
                </PanelCard>
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-indigo-400 rounded cursor-col-resize transition-colors mx-1" />

          {/* Center: To-do list */}
          <Panel defaultSize={35} minSize={25}>
            <PanelCard>
              <TodoPanel />
            </PanelCard>
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-indigo-400 rounded cursor-col-resize transition-colors mx-1" />

          {/* Right: Inbox */}
          <Panel defaultSize={37} minSize={25}>
            <PanelCard>
              <InboxPanel />
            </PanelCard>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
