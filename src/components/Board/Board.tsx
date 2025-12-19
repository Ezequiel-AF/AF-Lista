import { useState, useEffect } from "react";
import {
    DndContext,
    type DragEndEvent,
    type DragOverEvent,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { Column, Task, Id } from "../../types";
import ColumnContainer from "../Column/ColumnContainer";

// 1. Definimos los datos iniciales (esto es lo que te faltaba)
const defaultCols: Column[] = [
    { id: "todo", title: "Por hacer" },
    { id: "doing", title: "En progreso" },
    { id: "done", title: "Terminado" },
];

const defaultTasks: Task[] = [
    { id: "1", columnId: "todo", content: "Programa Tareas", createdAt: new Date().toLocaleString() },
    { id: "2", columnId: "doing", content: "Empieza a realizarlas", createdAt: new Date().toLocaleString() },
    { id: "3", columnId: "done", content: "¡Termínalo!", createdAt: new Date().toLocaleString(), completedAt: new Date().toLocaleString() },
];

function Board() {
    const [columns] = useState<Column[]>(defaultCols);
    // Intentamos cargar las tareas guardadas, si no hay, usamos las de defecto
    const [tasks, setTasks] = useState<Task[]>(() => {
        const savedTasks = localStorage.getItem("kanban-tasks");
        return savedTasks ? JSON.parse(savedTasks) : defaultTasks;
    });

    // Sensores para distinguir entre un "clic" y un "arrastre"
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        })
    );
    useEffect(() => {
        localStorage.setItem("kanban-tasks", JSON.stringify(tasks));
    }, [tasks]); // Se ejecuta cada vez que el array 'tasks' cambia

    // --- NUEVA FUNCIÓN: Crear Tarea ---
    function createTask(columnId: Id) {
        const newTask: Task = {
            id: Math.floor(Math.random() * 10001),
            columnId,
            content: "",
            createdAt: new Date().toLocaleString(), // <--- Esto quita el error
        };

        setTasks([...tasks, newTask]);
    }

    // --- NUEVA FUNCIÓN: Borrar Tarea ---
    function deleteTask(id: Id) {
        const filteredTasks = tasks.filter((task) => task.id !== id);
        setTasks(filteredTasks);
    }

    // --- NUEVA FUNCIÓN: Actualizar Contenido ---
    function updateTask(id: Id, content: string) {
        const newTasks = tasks.map((task) => {
            if (task.id !== id) return task;
            return { ...task, content };
        });
        setTasks(newTasks);
    }

    // --- FUNCIÓN: Completar Tarea (CON FECHA AUTOMÁTICA) ---
    function completeTask(id: Id) {
        const task = tasks.find((t) => t.id === id);
        if (!task) return;

        const currentColumnIndex = columns.findIndex((col) => col.id === task.columnId);

        if (currentColumnIndex < columns.length - 1) {
            const nextColumnId = columns[currentColumnIndex + 1].id;
            const isLastColumn = currentColumnIndex + 1 === columns.length - 1;

            const newTasks = tasks.map((t) => {
                if (t.id !== id) return t;
                return { 
                    ...t, 
                    columnId: nextColumnId,
                    // Si llega a la última columna, grabamos fecha, si no, limpiamos
                    completedAt: isLastColumn ? new Date().toLocaleString() : undefined 
                };
            });

            setTasks(newTasks);
        }
    }


    // Función para mover tareas entre columnas
    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveATask = active.data.current?.type === "Task";
        if (!isActiveATask) return;

        setTasks((tasks) => {
            const activeIndex = tasks.findIndex((t) => t.id === activeId);
            const isOverATask = over.data.current?.type === "Task";
            const isOverAColumn = over.data.current?.type === "Column";

            if (isActiveATask && isOverATask) {
                const overIndex = tasks.findIndex((t) => t.id === overId);

                if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
                    tasks[activeIndex].columnId = tasks[overIndex].columnId;
                    
                    // Lógica de fecha al arrastrar sobre otra tarea
                    if (tasks[overIndex].columnId === "done") {
                        tasks[activeIndex].completedAt = new Date().toLocaleString();
                    } else {
                        tasks[activeIndex].completedAt = undefined;
                    }
                    
                    return arrayMove(tasks, activeIndex, overIndex);
                }
            }

            if (isActiveATask && isOverAColumn) {
                tasks[activeIndex].columnId = overId;
                
                // Lógica de fecha al soltar sobre columna vacía
                if (overId === "done") {
                    tasks[activeIndex].completedAt = new Date().toLocaleString();
                } else {
                    tasks[activeIndex].completedAt = undefined;
                }
                
                return arrayMove(tasks, activeIndex, activeIndex);
            }

            return tasks;
        });
    }

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        setTasks((tasks) => {
            const oldIndex = tasks.findIndex((t) => t.id === activeId);
            const newIndex = tasks.findIndex((t) => t.id === overId);
            return arrayMove(tasks, oldIndex, newIndex);
        });
    }

   return (
  <div className="flex flex-col min-h-screen w-full bg-[#0D1117]">
    
    {/* 1. TÍTULO DE LA APP (Fijo arriba) */}
    <header className="flex-shrink-0 py-8 text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-yellow-800 to-yellow-400 bg-clip-text text-transparent tracking-tight">
        AF Lista
      </h1>
      <p className="text-gray-500 mt-2 text-sm md:text-base">
        Gestiona tus tareas de forma eficiente
      </p>
    </header>

    {/* 2. CONTENEDOR DEL BOARD */}
    <DndContext sensors={sensors} onDragOver={onDragOver} onDragEnd={onDragEnd}>
      <div className="
        flex 
        flex-col 
        lg:flex-row 
        flex-grow 
        w-full 
        
        /* CAMBIO CLAVE: items-center para centrar horizontalmente en móvil, 
           pero justify-start para que el scroll empiece desde arriba y no tape el header */
        items-center 
        justify-start 

        /* En escritorio volvemos al centrado vertical/horizontal normal */
        lg:items-start 
        lg:justify-center

        gap-10 
        p-6 
        /* Permitimos scroll vertical en móvil y horizontal en escritorio */
        overflow-y-auto 
        lg:overflow-x-auto 
        lg:overflow-y-hidden
      ">
        {columns.map((col) => (
          <ColumnContainer
            key={col.id}
            column={col}
            tasks={tasks.filter((t) => t.columnId === col.id)}
            createTask={createTask}
            deleteTask={deleteTask}
            updateTask={updateTask}
            completeTask={completeTask}
          />
        ))}
      </div>
    </DndContext>
  </div>
);
}

export default Board;
