import { useState } from "react";
import AddIcon from "../icons/AddIcon";
import { Column, Id } from "../types";
import ColumnContainer from "./ColumnContainer";

function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([]);
  function AddColumn() {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };
    setColumns([...columns, columnToAdd]);
  }

  function DeleteColumn(id: Id) {
    const filteredColumns = columns.filter((col) => col.id !== id);
    setColumns(filteredColumns);
  }

  return (
    <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-10">
      <div className="m-auto flex gap-4">
        <div className="flex gap-4">
          {columns.map((column) => (
            <ColumnContainer key={column.id} column={column} DeleteColumn={DeleteColumn} />
          ))}
        </div>
      </div>

      <button
        onClick={() => AddColumn()}
        className="h-15 w-87 min-w-87 cursor-pointer rounded-lg bg-gray-800 border-2 border-gray-600 p-4 flex gap-2 ring-rose-500 hover:ring-2"
      >
        <AddIcon />
        Add Column
      </button>
    </div>
  );
}

function generateId(): number {
  return Math.floor(Math.random() * 10001);
}

export default KanbanBoard;
