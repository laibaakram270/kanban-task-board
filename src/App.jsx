import { useEffect, useRef, useState } from "react";

import { HistoryManager } from "./commands/HistoryManager";
import { CreateTaskCommand } from "./commands/CreateTaskCommand";
import { EditTaskCommand } from "./commands/EditTaskCommand";
import { MoveTaskCommand } from "./commands/MoveTaskCommand";
import { ReorderTaskCommand } from "./commands/ReorderTaskCommand";

import { loadBoard, saveBoard } from "./db";

const initialColumns = [
  {
    id: "todo",
    title: "To Do",
    tasks: [
      {
        id: "task-1",
        title: "Design Kanban Board",
        description: "Create the responsive board layout",
      },
      {
        id: "task-2",
        title: "Add Task Feature",
        description: "Allow users to create new tasks",
      },
    ],
  },
  {
    id: "progress",
    title: "In Progress",
    tasks: [
      {
        id: "task-3",
        title: "Implement Drag & Drop",
        description: "Use the native HTML5 Drag and Drop API",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    tasks: [
      {
        id: "task-4",
        title: "Set Up React Project",
        description: "Initialize the Vite React application",
      },
    ],
  },
];

function App() {
  const [columns, setColumns] = useState(initialColumns);

  const [boardLoaded, setBoardLoaded] = useState(false);

  const historyRef = useRef(new HistoryManager());

  const [draggedTask, setDraggedTask] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  const [addingTo, setAddingTo] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  // ==========================================
  // LOAD BOARD FROM INDEXEDDB
  // ==========================================

  useEffect(() => {
    let mounted = true;

    loadBoard()
      .then((savedColumns) => {
        if (!mounted) {
          return;
        }

        if (savedColumns) {
          setColumns(savedColumns);
        }

        setBoardLoaded(true);
      })
      .catch((error) => {
        console.error("Failed to load board from IndexedDB:", error);

        if (mounted) {
          setBoardLoaded(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================
  // AUTO-SAVE BOARD TO INDEXEDDB
  // ==========================================

  useEffect(() => {
    if (!boardLoaded) {
      return;
    }

    saveBoard(columns)
      .then(() => {
        console.log("Board saved to IndexedDB");
      })
      .catch((error) => {
        console.error("Failed to save board to IndexedDB:", error);
      });
  }, [columns, boardLoaded]);

  // ==========================================
  // DRAG START
  // ==========================================

  const handleDragStart = (event, taskId, columnId) => {
    const data = {
      taskId,
      columnId,
    };

    setDraggedTask(data);

    event.dataTransfer.effectAllowed = "move";

    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify(data)
    );
  };

  // ==========================================
  // DRAG OVER
  // ==========================================

  const handleDragOver = (event, columnId, taskId = null) => {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";

    if (taskId) {
      const rect = event.currentTarget.getBoundingClientRect();

      const middle = rect.top + rect.height / 2;

      setDropTarget({
        columnId,
        taskId,
        position:
          event.clientY < middle
            ? "before"
            : "after",
      });
    } else {
      setDropTarget({
        columnId,
        taskId: null,
        position: "after",
      });
    }
  };

  // ==========================================
  // DROP
  // ==========================================

  const handleDrop = (
    event,
    targetColumnId,
    targetTaskId = null
  ) => {
    event.preventDefault();

    if (!draggedTask) {
      return;
    }

    const sourceColumnId = draggedTask.columnId;
    const taskId = draggedTask.taskId;

    const sourceColumn = columns.find(
      (column) => column.id === sourceColumnId
    );

    const targetColumn = columns.find(
      (column) => column.id === targetColumnId
    );

    if (!sourceColumn || !targetColumn) {
      return;
    }

    const sourceIndex = sourceColumn.tasks.findIndex(
      (task) => task.id === taskId
    );

    if (sourceIndex === -1) {
      return;
    }

    if (
      sourceColumnId === targetColumnId &&
      targetTaskId === taskId
    ) {
      setDraggedTask(null);
      setDropTarget(null);
      return;
    }

    let targetIndex = targetColumn.tasks.length;

    if (targetTaskId) {
      const foundIndex = targetColumn.tasks.findIndex(
        (task) => task.id === targetTaskId
      );

      if (foundIndex !== -1) {
        targetIndex =
          dropTarget?.position === "before"
            ? foundIndex
            : foundIndex + 1;
      }
    }

    // ==========================================
    // MOVE BETWEEN COLUMNS
    // ==========================================

    if (sourceColumnId !== targetColumnId) {
      const task = sourceColumn.tasks[sourceIndex];

      const command = new MoveTaskCommand(
        setColumns,
        task,
        sourceColumnId,
        sourceIndex,
        targetColumnId,
        targetIndex
      );

      historyRef.current.execute(command);
    }

    // ==========================================
    // REORDER INSIDE SAME COLUMN
    // ==========================================

    else {
      if (sourceIndex < targetIndex) {
        targetIndex--;
      }

      if (sourceIndex !== targetIndex) {
        const command = new ReorderTaskCommand(
          setColumns,
          sourceColumnId,
          sourceIndex,
          targetIndex
        );

        historyRef.current.execute(command);
      }
    }

    setDraggedTask(null);
    setDropTarget(null);
  };

  // ==========================================
  // DRAG END
  // ==========================================

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDropTarget(null);
  };

  // ==========================================
  // ADD TASK
  // ==========================================

  const addTask = (columnId) => {
    if (!newTitle.trim()) {
      return;
    }

    const task = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
    };

    const command = new CreateTaskCommand(
      setColumns,
      columnId,
      task
    );

    historyRef.current.execute(command);

    setNewTitle("");
    setNewDescription("");
    setAddingTo(null);
  };

  // ==========================================
  // DELETE TASK
  // ==========================================

  const deleteTask = (columnId, taskId) => {
    setColumns((currentColumns) =>
      currentColumns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              tasks: column.tasks.filter(
                (task) => task.id !== taskId
              ),
            }
          : column
      )
    );
  };

  // ==========================================
  // START EDITING
  // ==========================================

  const startEditing = (task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
  };

  // ==========================================
  // SAVE EDIT
  // ==========================================

  const saveEdit = (columnId, taskId) => {
    if (!editTitle.trim()) {
      return;
    }

    const column = columns.find(
      (item) => item.id === columnId
    );

    if (!column) {
      return;
    }

    const task = column.tasks.find(
      (item) => item.id === taskId
    );

    if (!task) {
      return;
    }

    if (task.title === editTitle.trim()) {
      setEditingTask(null);
      setEditTitle("");
      return;
    }

    const command = new EditTaskCommand(
      setColumns,
      columnId,
      taskId,
      task.title,
      editTitle.trim()
    );

    historyRef.current.execute(command);

    setEditingTask(null);
    setEditTitle("");
  };

  // ==========================================
  // UNDO
  // ==========================================

  const handleUndo = () => {
    if (historyRef.current.canUndo()) {
      historyRef.current.undo();
      setColumns((current) => [...current]);
    }
  };

  // ==========================================
  // REDO
  // ==========================================

  const handleRedo = () => {
    if (historyRef.current.canRedo()) {
      historyRef.current.redo();
      setColumns((current) => [...current]);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">

      {/* HEADER */}

      <header className="bg-slate-900 px-6 py-7 text-white shadow-lg sm:px-10">

        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <h1 className="text-3xl font-bold sm:text-4xl">
                Kanban Task Board
              </h1>

              <p className="mt-2 text-slate-300">
                Interactive task management with native
                HTML5 drag & drop
              </p>

            </div>

            {/* UNDO / REDO */}

            <div className="flex gap-2">

              <button
                onClick={handleUndo}
                disabled={!historyRef.current.canUndo()}
                className="rounded-lg bg-white px-4 py-2 font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Undo last action"
              >
                ↶ Undo
              </button>

              <button
                onClick={handleRedo}
                disabled={!historyRef.current.canRedo()}
                className="rounded-lg bg-white px-4 py-2 font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Redo last action"
              >
                ↷ Redo
              </button>

            </div>

          </div>

        </div>

      </header>

      {/* BOARD */}

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-5 md:p-8 lg:grid-cols-3">

        {columns.map((column) => (

          <section
            key={column.id}
            className="min-h-[500px] rounded-2xl bg-slate-200 p-4 shadow-sm"
            onDragOver={(event) =>
              handleDragOver(event, column.id)
            }
            onDrop={(event) =>
              handleDrop(event, column.id)
            }
            aria-label={`${column.title} column`}
          >

            {/* COLUMN HEADER */}

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-xl font-bold">
                {column.title}
              </h2>

              <span
                className="flex h-8 min-w-8 items-center justify-center rounded-full bg-slate-900 px-2 text-sm font-bold text-white"
                aria-label={`${column.tasks.length} tasks`}
              >
                {column.tasks.length}
              </span>

            </div>

            {/* TASKS */}

            <div className="min-h-[300px]">

              {column.tasks.map((task) => (

                <div key={task.id}>

                  {/* BEFORE DROP INDICATOR */}

                  {dropTarget?.columnId === column.id &&
                    dropTarget?.taskId === task.id &&
                    dropTarget?.position === "before" && (

                    <div className="mb-2 flex h-10 items-center justify-center rounded-lg border-2 border-dashed border-blue-500 bg-blue-100 text-sm font-semibold text-blue-600">
                      Drop task here
                    </div>

                  )}

                  {/* TASK CARD */}

                  <article
                    draggable
                    tabIndex="0"
                    className={`mb-3 rounded-xl bg-white p-4 shadow-md transition ${
                      draggedTask?.taskId === task.id
                        ? "scale-95 opacity-40"
                        : "hover:-translate-y-1 hover:shadow-lg"
                    }`}
                    onDragStart={(event) =>
                      handleDragStart(
                        event,
                        task.id,
                        column.id
                      )
                    }
                    onDragOver={(event) =>
                      handleDragOver(
                        event,
                        column.id,
                        task.id
                      )
                    }
                    onDrop={(event) =>
                      handleDrop(
                        event,
                        column.id,
                        task.id
                      )
                    }
                    onDragEnd={handleDragEnd}
                    aria-label={`Task: ${task.title}`}
                  >

                    {/* EDIT MODE */}

                    {editingTask === task.id ? (

                      <div>

                        <label className="sr-only">
                          Edit task title
                        </label>

                        <input
                          value={editTitle}
                          onChange={(event) =>
                            setEditTitle(event.target.value)
                          }
                          autoFocus
                          className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          onKeyDown={(event) => {

                            if (event.key === "Enter") {
                              saveEdit(
                                column.id,
                                task.id
                              );
                            }

                            if (event.key === "Escape") {
                              setEditingTask(null);
                              setEditTitle("");
                            }

                          }}
                        />

                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              saveEdit(
                                column.id,
                                task.id
                              )
                            }
                            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                          >
                            Save
                          </button>

                          <button
                            onClick={() => {
                              setEditingTask(null);
                              setEditTitle("");
                            }}
                            className="rounded-lg bg-slate-500 px-3 py-2 text-sm font-semibold text-white"
                          >
                            Cancel
                          </button>

                        </div>

                      </div>

                    ) : (

                      <>

                        <h3 className="text-lg font-bold">
                          {task.title}
                        </h3>

                        {task.description && (
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-4 flex gap-2">

                          <button
                            onClick={() =>
                              startEditing(task)
                            }
                            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                            aria-label={`Edit ${task.title}`}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              deleteTask(
                                column.id,
                                task.id
                              )
                            }
                            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                            aria-label={`Delete ${task.title}`}
                          >
                            Delete
                          </button>

                        </div>

                      </>

                    )}

                  </article>

                  {/* AFTER DROP INDICATOR */}

                  {dropTarget?.columnId === column.id &&
                    dropTarget?.taskId === task.id &&
                    dropTarget?.position === "after" && (

                    <div className="mb-2 flex h-10 items-center justify-center rounded-lg border-2 border-dashed border-blue-500 bg-blue-100 text-sm font-semibold text-blue-600">
                      Drop task here
                    </div>

                  )}

                </div>

              ))}

            </div>

            {/* ADD TASK */}

            {addingTo === column.id ? (

              <div className="rounded-xl bg-white p-4 shadow">

                <label className="sr-only">
                  Task title
                </label>

                <input
                  value={newTitle}
                  onChange={(event) =>
                    setNewTitle(event.target.value)
                  }
                  placeholder="Task title"
                  autoFocus
                  className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />

                <label className="sr-only">
                  Task description
                </label>

                <textarea
                  value={newDescription}
                  onChange={(event) =>
                    setNewDescription(
                      event.target.value
                    )
                  }
                  placeholder="Description"
                  className="mb-3 min-h-20 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />

                <div className="flex gap-2">

                  <button
                    onClick={() =>
                      addTask(column.id)
                    }
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Add Task
                  </button>

                  <button
                    onClick={() => {
                      setAddingTo(null);
                      setNewTitle("");
                      setNewDescription("");
                    }}
                    className="rounded-lg bg-slate-500 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Cancel
                  </button>

                </div>

              </div>

            ) : (

              <button
                onClick={() =>
                  setAddingTo(column.id)
                }
                className="w-full rounded-xl border-2 border-dashed border-slate-400 bg-transparent px-4 py-3 font-semibold text-slate-600 transition hover:bg-white"
                aria-label={`Add task to ${column.title}`}
              >
                + Add Task
              </button>

            )}

          </section>

        ))}

      </main>

    </div>
  );
}

export default App;