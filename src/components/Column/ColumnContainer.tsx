import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Column, Task, Id } from "../../types"; 
import TaskCard from "../Task/TaskCard";

// 2. Agregamos createTask a la interfaz de Props
interface Props {
  column: Column;
  tasks: Task[];
  createTask: (id: Id) => void;
  deleteTask: (id: Id) => void; 
  updateTask: (id: Id, content: string) => void;
  completeTask: (id: Id) => void;
}

// 3. Recibimos la función en el componente
function ColumnContainer({ column, tasks, createTask, deleteTask, updateTask, completeTask}: Props) {
  
  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div
     ref={setNodeRef}
    className="
      bg-[#161B22] 
      /* Móvil: 85% del ancho para ver un poco de la siguiente columna */
      w-[85vw] 
      /* Tablet: ancho fijo de 320px */
      md:w-[85vw] 
      /* Desktop: ancho fijo de 350px */
      lg:w-[600px] 
      max-h-[60vh] 
      rounded-xl 
      flex 
      flex-col 
      border-2 
      border-[#30363D]
      snap-center
    "
    >
      <div className="p-3 font-bold border-b-2 border-[#30363D] flex items-center justify-between">
        {column.title}
        <span className="bg-[#30363D] px-2 py-1 rounded text-sm text-gray-400">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard 
            key={task.id} 
            task={task} 
            deleteTask={deleteTask} 
            updateTask={updateTask} 
            completeTask={completeTask}
            />
          ))}
        </SortableContext>
      </div>

      {/* 4. Conectamos el botón con la función */}
      <button 
        onClick={() => createTask(column.id)} 
        className="p-4 border-[#30363D] border-t-2 hover:bg-[#0D1117] hover:text-blue-500 transition-colors flex items-center gap-2 justify-center cursor-pointer"
      >
        <span className="text-xl">+</span> Añadir tarea
      </button>
    </div>
  );
}

export default ColumnContainer;