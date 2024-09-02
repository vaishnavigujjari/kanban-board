function KanbanBoard() {
  return (
    <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-10">
      <button className="h-15 w-87 min-w-87 cursor-pointer rounded-lg bg-gray-800 border-2 border-gray-600 p-4 ring-rose-500 hover:ring-2">
        Add Column
      </button>
    </div>
  );
}

export default KanbanBoard;
