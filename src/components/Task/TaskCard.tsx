import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, Id } from "../../types";
import { useState } from "react";

interface Props {
  task: Task;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
  completeTask: (id: Id) => void;
}

function TaskCard({ task, deleteTask, updateTask, completeTask }: Props) {
  const [mouseIsOver, setMouseIsOver] = useState(false);

  // Si la tarea está vacía, entra en modo edición automáticamente
  const [editMode, setEditMode] = useState(task.content === "");

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    // Desactivamos el arrastre si estamos editando para que se pueda seleccionar texto
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  // VISTA DE ARRASTRE (Placeholder)
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-[#0D1117] p-4 h-[100px] min-h-[100px] items-center flex text-left rounded-xl border-2 border-blue-500 cursor-grab relative"
      />
    );
  }

  // VISTA DE EDICIÓN (Cuando creas la tarea o haces clic en ella)
  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-[#0D1117] p-4 h-[100px] min-h-[100px] items-center flex text-left rounded-xl border-2 border-blue-500 relative"
      >
        <textarea
          className="h-[90%] w-full resize-none border-none rounded bg-transparent text-white focus:outline-none"
          value={task.content}
          autoFocus
          placeholder="Escribe el nombre de la tarea..."
          onBlur={toggleEditMode}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) toggleEditMode();
          }}
          onChange={(e) => updateTask(task.id, e.target.value)}
        />
      </div>
    );
  }

  // VISTA NORMAL
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={toggleEditMode} // Al hacer clic, entramos en modo edición
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
      className={`
      bg-[#0D1117] p-4 h-[100px] min-h-[100px] items-center flex text-left rounded-xl shadow-md cursor-grab relative group border-2
      ${task.columnId === "done"
          ? "border-green-500 shadow-green-900/20"
          : "border-[#30363D] hover:ring-2 hover:ring-blue-500"}
    `}
    >
      <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
        {task.content || <span className="text-gray-500 italic">Tarea vacía...</span>}
      </p>
      <div className="mt-2 flex flex-col gap-1">
        <div className="text-[10px] text-gray-500">
          📅 Inicio: {task.createdAt}
        </div>
        {task.completedAt && (
          <div className="text-[10px] text-green-500 font-bold">
            ✅ Fin: {task.completedAt}
          </div>
        )}
      </div>

      {mouseIsOver && (
  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
    
    {/* BOTÓN DE TILDE (CHECK) */}
    {task.columnId !== "done" && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          completeTask(task.id);
        }}
        className="
          stroke-gray-400 
          bg-[#161B22] 
          p-2 
          rounded-lg 
          opacity-90 
          hover:opacity-100 
          hover:stroke-green-500 
          hover:bg-green-500/10 
          transition-all 
          duration-300
          cursor-pointer
        "
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>
    )}

    {/* BOTÓN DE BORRAR (PAPELERA) */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        deleteTask(task.id);
      }}
      className="
        stroke-gray-400 
        bg-[#161B22] 
        p-2 
        rounded-lg 
        opacity-90 
        hover:opacity-100 
        hover:stroke-red-500 
        hover:bg-red-500/10 
        transition-all 
        duration-300
        cursor-pointer
      "
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
      </svg>
    </button>
  </div>
)}
    </div>
  );
}

export default TaskCard;