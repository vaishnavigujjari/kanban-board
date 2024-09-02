import { useMemo, useState, useEffect } from "react";
import AddIcon from "../icons/AddIcon";
import { Column, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(() => {
    const savedColumns = localStorage.getItem("columns");
    return savedColumns
      ? JSON.parse(savedColumns)
      : [
          { id: 1, title: "To Do" },
          { id: 2, title: "In Progress" },
          { id: 3, title: "Completed" },
        ];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks
      ? JSON.parse(savedTasks)
      : [
          { id: 1, columnId: 1, content: "Apply 50 jobs" },
          { id: 2, columnId: 2, content: "Learn Prometheus" },
          { id: 3, columnId: 3, content: "Call Mark" },
        ];
  });

  useEffect(() => {
    const savedColumns = JSON.parse(localStorage.getItem("columns") || "[]");
    const savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");

    if (savedColumns.length > 0) setColumns(savedColumns);
    if (savedTasks.length > 0) setTasks(savedTasks);
  }, []);

  useEffect(() => {
    localStorage.setItem("columns", JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  return (
    <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-10">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={OnDragEnd}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map((column) => (
                <ColumnContainer
                  key={column.id}
                  column={column}
                  DeleteColumn={DeleteColumn}
                  UpdateColumn={UpdateColumn}
                  CreateTask={CreateTask}
                  tasks={tasks.filter((task) => task.columnId === column.id)}
                  DeleteTask={DeleteTask}
                  UpdateTask={UpdateTask}
                  tasksSize={
                    tasks.filter((task) => task.columnId === column.id).length
                  }
                />
              ))}
            </SortableContext>
          </div>
          <button
            onClick={() => AddColumn()}
            className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-gray-800 border-2 border-gray-600 p-4 flex gap-2 ring-rose-500 hover:ring-2"
          >
            <AddIcon />
            Add Column
          </button>
        </div>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                DeleteColumn={DeleteColumn}
                UpdateColumn={UpdateColumn}
                CreateTask={CreateTask}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
                DeleteTask={DeleteTask}
                UpdateTask={UpdateTask}
                tasksSize={tasks.length}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                DeleteTask={DeleteTask}
                UpdateTask={UpdateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );

  function AddColumn() {
    const columnToAdd: Column = {
      id: generateId(),
      title: "Column Name",
    };
    setColumns([...columns, columnToAdd]);
  }

  function UpdateColumn(id: Id, title: string) {
    const newColumns = columns.map((column) => {
      if (column.id !== id) return column;
      return { ...column, title };
    });
    setColumns(newColumns);
  }

  function DeleteColumn(id: Id) {
    const filteredColumns = columns.filter((col) => col.id !== id);
    setColumns(filteredColumns);
    const newTasks = tasks.filter((task) => task.columnId != id);
    setTasks(newTasks);
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.Column);
      return;
    }
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.Task);
      return;
    }
  }

  function OnDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeColumnId = active.id;
    const overColumnId = over.id;

    if (activeColumnId === overColumnId) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (col) => col.id === activeColumnId
      );
      const overColumnIndex = columns.findIndex(
        (col) => col.id === overColumnId
      );
      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const activeTaskId = active.id;
    const overTaskId = over.id;

    if (activeTaskId === overTaskId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    // Dropping a task over same column's task
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeTaskIndex = tasks.findIndex(
          (col) => col.id === activeTaskId
        );
        const overTaskIndex = tasks.findIndex((col) => col.id === overTaskId);
        tasks[activeTaskIndex].columnId = tasks[overTaskIndex].columnId;
        return arrayMove(tasks, activeTaskIndex, overTaskIndex);
      });
    }

    // Dropping a task over another column's task
    const isOverColumn = over.data.current?.type === "Column";
    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeTaskIndex = tasks.findIndex(
          (col) => col.id === activeTaskId
        );
        tasks[activeTaskIndex].columnId = overTaskId;
        return arrayMove(tasks, activeTaskIndex, activeTaskIndex);
      });
    }
  }

  function CreateTask(columnId: Id) {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: "Add your Task here",
    };
    setTasks([...tasks, newTask]);
  }

  function DeleteTask(id: Id) {
    const filteredTasks = tasks.filter((task) => task.id !== id);
    setTasks(filteredTasks);
  }

  function UpdateTask(id: Id, content: string) {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content };
    });
    setTasks(newTasks);
  }
}

function generateId(): number {
  return Math.floor(Math.random() * 10001);
}

export default KanbanBoard;
