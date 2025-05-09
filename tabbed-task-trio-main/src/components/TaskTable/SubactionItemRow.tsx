import { SubactionItem, User } from "@/types/task";
import { AssigneeCell } from "./AssigneeCell";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CommentsCell } from "./CommentsCell";
import { DueDateCell } from "./DueDateCell";
import { EstimatedTimeCell } from "./EstimatedTimeCell";
import { PriorityCell } from "./PriorityCell";
import { RowActions } from "./RowActions";
import { StatusCell } from "./StatusCell";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pencil } from "lucide-react";
import { useState } from "react";

interface SubactionItemRowProps {
  subactionItem: SubactionItem;
  taskId: string;
  subtaskId: string;
  actionItemId: string;
  isActiveTimer: boolean;
  users: User[];
  selectedProjectId: string;
  hoveredRowId: string | null;
  setHoveredRowId: (id: string | null) => void;
  editingItem: {
    id: string;
    type: 'task' | 'subtask' | 'actionItem' | 'subactionItem';
    name: string;
  } | null;
  setEditingItem: (item: {
    id: string;
    type: 'task' | 'subtask' | 'actionItem' | 'subactionItem';
    name: string;
  } | null) => void;
  updateSubactionItem: (projectId: string, taskId: string, subtaskId: string, actionItemId: string, subactionItemId: string, updates: Partial<SubactionItem>) => void;
  handleSaveEdit: () => void;
  handleDeleteItem: (id: string, type: 'task' | 'subtask' | 'actionItem' | 'subactionItem') => void;
  startTimer: (projectId: string, actionItemId: string) => void;
  stopTimer: () => void;
}

export function SubactionItemRow({
  subactionItem,
  taskId,
  subtaskId,
  actionItemId,
  isActiveTimer,
  users,
  selectedProjectId,
  hoveredRowId,
  setHoveredRowId,
  editingItem,
  setEditingItem,
  updateSubactionItem,
  handleSaveEdit,
  handleDeleteItem,
  startTimer,
  stopTimer
}: SubactionItemRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleUpdateTime = (estimatedTime: { days?: number; hours: number; minutes: number } | null) => {
    updateSubactionItem(selectedProjectId, taskId, subtaskId, actionItemId, subactionItem.id, { estimatedTime });
  };

  const handleTimerToggle = () => {
    if (isActiveTimer) {
      stopTimer();
    } else {
      startTimer(selectedProjectId, actionItemId);
    }
  };

  const handleEditName = () => {
    setEditingItem({
      id: subactionItem.id,
      type: 'subactionItem',
      name: subactionItem.name
    });
  };

  return (
    <tr
      className={cn("task-row group", isActiveTimer ? "bg-primary/5" : "")}
      onMouseEnter={() => setHoveredRowId(subactionItem.id)}
      onMouseLeave={() => setHoveredRowId(null)}
    >
      <td className="name-cell">
        <div className="flex items-center pl-16 w-full overflow-hidden">
          
          <div className="flex-shrink-0 mr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-0 bg-transparent border-none hover:scale-105 transition-transform" style={{ width: "16px", height: "16px" }}>
                  <svg viewBox="-3 -3 106 106" style={{ width: "100%", height: "100%" }}>
                    <circle
                      cx="50"
                      cy="50"
                      r="50"
                      fill="transparent"
                      className="stroke-black dark:stroke-white"
                      strokeWidth={5}
                      strokeDasharray={`calc((2 * 3.14 * 45) / 8 - 20), 20`}
                    />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[120px]">
                {[
                  { value: "todo", label: "To Do", icon: "⏳" },
                  { value: "inprogress", label: "In Progress", icon: "🔄" },
                  { value: "done", label: "Done", icon: "✅" }
                ].map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => updateSubactionItem(selectedProjectId, taskId, subtaskId, actionItemId, subactionItem.id, { status: option.value as any })}
                    className="flex items-center gap-2"
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span>{option.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Name and buttons */}
          <div className="flex items-center justify-between w-full gap-2 min-w-0">
            {/* Truncating name or input */}
            {editingItem && editingItem.id === subactionItem.id ? (
              <Input
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                onBlur={handleSaveEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') setEditingItem(null);
                }}
                autoFocus
                className="inline-edit w-full"
              />
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    "truncate block min-w-0 max-w-full",
                    isActiveTimer && "font-medium text-primary"
                  )}>
                    {subactionItem.name}
                    {isActiveTimer && " (Timer Active)"}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{subactionItem.name}</TooltipContent>
              </Tooltip>
            )}

            {/* Edit and Add buttons */}
            <div className="flex items-center gap-1 flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditName}
                className="h-6 w-6 p-0 flex-shrink-0"
              >
                <Pencil size={12} />
              </Button>
            </div>
          </div>
        </div>
      </td>

      <td>
        <AssigneeCell
          users={users}
          assigneeId={subactionItem.assignee}
          onChange={(assignee) => updateSubactionItem(selectedProjectId, taskId, subtaskId, actionItemId, subactionItem.id, { assignee })}
        />
      </td>
      <td>
        <DueDateCell
          dueDate={subactionItem.dueDate}
          onChange={(dueDate) => updateSubactionItem(selectedProjectId, taskId, subtaskId, actionItemId, subactionItem.id, { dueDate })}
        />
      </td>
      <td>
        <PriorityCell
          priority={subactionItem.priority}
          onChange={(priority) => updateSubactionItem(selectedProjectId, taskId, subtaskId, actionItemId, subactionItem.id, { priority })}
        />
      </td>
      <td>
        <StatusCell
          status={subactionItem.status}
          onChange={(status) => updateSubactionItem(selectedProjectId, taskId, subtaskId, actionItemId, subactionItem.id, { status })}
        />
      </td>
      <td>
        <CommentsCell
          comments={subactionItem.comments}
          onChange={(comments) => updateSubactionItem(selectedProjectId, taskId, subtaskId, actionItemId, subactionItem.id, { comments })}
        />
      </td>
      <td>
        <EstimatedTimeCell
          estimatedTime={subactionItem.estimatedTime}
          onChange={handleUpdateTime}
          timeSpent={subactionItem.timeSpent}
        />
      </td>
      <td>
        <RowActions 
          onDelete={() => handleDeleteItem(subactionItem.id, 'subactionItem')}
          onStartTimer={handleTimerToggle}
          isTimerActive={isActiveTimer}
        />
      </td>
    </tr>
  );
}
