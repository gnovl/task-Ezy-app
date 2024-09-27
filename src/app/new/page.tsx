"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import SidebarLayout from "../_components/SidebarLayout";

interface Task {
  id: string;
  title: string;
  createdAt: string;
  dueDate: string | null;
  priority: string | null;
  status: string;
  tags: string | null;
}

export default function Dashboard() {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [tags, setTags] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const { data: session } = useSession();

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchTasks();
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const updateDateTime = () => {
    const now = new Date();
    setCurrentDateTime(now.toLocaleString());
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        console.error("Failed to fetch tasks");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskTitle.trim()) {
      setToast({ type: "error", message: "Task title is required" });
      return;
    }

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          dueDate,
          priority,
          status,
          tags: tags.trim(),
        }),
      });

      if (response.ok) {
        resetForm();
        setToast({ type: "success", message: "Task added successfully!" });
        fetchTasks();
      } else {
        const errorData = await response.json();
        setToast({
          type: "error",
          message: errorData.message || "Failed to add task",
        });
      }
    } catch (error) {
      console.error("Error adding task:", error);
      setToast({ type: "error", message: "Error adding task" });
    }
  };

  const resetForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setDueDate("");
    setPriority("");
    setStatus("Not Started");
    setTags("");
  };

  return (
    <SidebarLayout tasks={tasks} isAddTaskPage={true}>
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Welcome, {session?.user?.name || "to Your Dashboard"}
          </h1>
          <div className="text-sm text-gray-600">{currentDateTime}</div>
        </div>

        {toast && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-md shadow-md animate-fade-in-out ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white`}
          >
            {toast.message}
          </div>
        )}

        <div className="bg-white shadow-md rounded p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label
                htmlFor="taskTitle"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Task Title
              </label>
              <input
                type="text"
                id="taskTitle"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="taskDescription"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="taskDescription"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={2}
              />
            </div>
            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>

        <p className="text-gray-600 text-sm">
          Add new tasks using the form above. Select a task from the sidebar to
          view details.
        </p>
      </div>
    </SidebarLayout>
  );
}