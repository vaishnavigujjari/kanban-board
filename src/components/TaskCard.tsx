import { useState } from "react";
import TrashIcon from "../icons/TrashIcon";
import { Task, Id } from "../types";

interface Props {
  task: Task;
  DeleteTask: (id: Id) => void;
  UpdateTask: (id: Id, content: string) => void;
}
function TaskCard({ task, DeleteTask, UpdateTask }: Props) {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  if (editMode) {
    return (
      <div
        className="bg-mainBackgroundColor p-2.5 h-[75pxs] min-h-[75px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative"
        key={task.id}
      >
        <textarea
          value={task.content}
          autoFocus
          placeholder="Enter your task content here"
          className="h-[90%] w-full resize-none norder-none rounded bg-transparent text-white focus:outline-none"
          onBlur={toggleEditMode}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) toggleEditMode();
          }}
          onChange={(e) => UpdateTask(task.id, e.target.value)}
        ></textarea>
      </div>
    );
  }

  return (
    <div
      className="bg-mainBackgroundColor p-2.5 h-[75pxs] min-h-[75px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative"
      key={task.id}
      onClick={toggleEditMode}
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
    >
      <p className="center h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
        {task.content}
      </p>
      {mouseIsOver && (
        <button
          onClick={() => DeleteTask(task.id)}
          className="stroke-white absolute right-4 top-1/2 -translate-y-1/2 bg-columnBackgroundColor p-2 rounded opacity-60 hover:opacity-100"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
}

export default TaskCard;
