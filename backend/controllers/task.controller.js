import Task from '../models/Task.js';
import User from '../models/User.js';
import { createActionLog } from './actionLog.controller.js';
import { io } from '../server.js';

export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, status, priority, dueDate } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    // Validate title doesn't match column names
    const columnNames = ['Todo', 'In Progress', 'Done'];
    if (columnNames.includes(title)) {
      return res.status(400).json({ message: 'Task title cannot match column names.' });
    }

    // If assignedTo is provided, check if user exists
    let assignedUser = null;
    if (assignedTo) {
      assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(404).json({ message: 'Assigned user not found.' });
      }
    }

    // Create the task
    const task = new Task({
      title,
      description,
      assignedTo: assignedUser ? assignedUser._id : null,
      status,
      priority,
      lastEditedBy: req.user ? req.user.userId : null,
      dueDate: dueDate ? new Date(dueDate) : null
    });

    await task.save();

    // Create action log
    await createActionLog('add', task._id, req.user.userId, `Created task: ${title}`);

    // Populate user details
    await task.populate('assignedTo', 'username email');
    await task.populate('lastEditedBy', 'username email');

    // Emit real-time update
    io.to('board-room').emit('task-created', { task });

    res.status(201).json({ message: 'Task created successfully.', task });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Task title must be unique.' });
    }
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'username email')
      .populate('lastEditedBy', 'username email')
      .sort({ createdAt: -1 });
    res.status(200).json({ tasks });
  } catch (error) {
    console.log("error in get task controller" , error.message)
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assignedTo, status, priority, dueDate, version, forceOverwrite } = req.body;

    // Check if task exists
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Conflict detection - check if version matches (unless force overwrite is requested)
    if (version && existingTask.version !== version && !forceOverwrite) {
      return res.status(409).json({ 
        message: 'Conflict detected. Task has been modified by another user.',
        conflict: true,
        currentVersion: existingTask.version,
        serverTask: existingTask,
        clientVersion: version
      });
    }

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    // Validate title doesn't match column names
    const columnNames = ['Todo', 'In Progress', 'Done'];
    if (columnNames.includes(title)) {
      return res.status(400).json({ message: 'Task title cannot match column names.' });
    }

    // If assignedTo is provided, check if user exists
    let assignedUser = null;
    if (assignedTo) {
      assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(404).json({ message: 'Assigned user not found.' });
      }
    }

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        title,
        description,
        assignedTo: assignedUser ? assignedUser._id : null,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        lastEditedBy: req.user ? req.user.userId : null,
        $inc: { version: 1 }
      },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'username email')
     .populate('lastEditedBy', 'username email');

    // Create action log
    const actionMessage = forceOverwrite 
      ? `Force updated task: ${title} (overwrote conflicting changes)`
      : `Updated task: ${title}`;
    await createActionLog('edit', id, req.user.userId, actionMessage);

    // Emit real-time update
    io.to('board-room').emit('task-updated', { task: updatedTask });

    res.status(200).json({ 
      message: forceOverwrite ? 'Task force updated successfully.' : 'Task updated successfully.', 
      task: updatedTask,
      forceOverwrite: !!forceOverwrite
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Task title must be unique.' });
    }
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Force update a task (overwrite conflicting changes)
export const forceUpdateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assignedTo, status, priority, dueDate } = req.body;

    // Check if task exists
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    // Validate title doesn't match column names
    const columnNames = ['Todo', 'In Progress', 'Done'];
    if (columnNames.includes(title)) {
      return res.status(400).json({ message: 'Task title cannot match column names.' });
    }

    // If assignedTo is provided, check if user exists
    let assignedUser = null;
    if (assignedTo) {
      assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(404).json({ message: 'Assigned user not found.' });
      }
    }

    // Force update the task (ignore version conflicts)
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        title,
        description,
        assignedTo: assignedUser ? assignedUser._id : null,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        lastEditedBy: req.user ? req.user.userId : null,
        $inc: { version: 1 }
      },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'username email')
     .populate('lastEditedBy', 'username email');

    // Create action log
    await createActionLog('edit', id, req.user.userId, `Force updated task: ${title} (overwrote conflicting changes)`);

    // Emit real-time update
    io.to('board-room').emit('task-updated', { task: updatedTask });

    res.status(200).json({ 
      message: 'Task force updated successfully.', 
      task: updatedTask,
      forceOverwrite: true
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Task title must be unique.' });
    }
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if task exists
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Create action log before deletion
    await createActionLog('delete', id, req.user.userId, `Deleted task: ${existingTask.title}`);

    // Delete the task
    await Task.findByIdAndDelete(id);

    // Emit real-time update
    io.to('board-room').emit('task-deleted', { taskId: id });

    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

export const moveTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, version } = req.body;

    // Check if task exists
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Conflict detection - check if version matches
    if (version && existingTask.version !== version) {
      return res.status(409).json({ 
        message: 'Conflict detected. Task has been modified by another user.',
        conflict: true,
        currentVersion: existingTask.version,
        serverTask: existingTask,
        clientVersion: version
      });
    }

    // Validate status
    const validStatuses = ['Todo', 'In Progress', 'Done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    // Update task status
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        status,
        lastEditedBy: req.user ? req.user.userId : null,
        $inc: { version: 1 }
      },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'username email')
     .populate('lastEditedBy', 'username email');

    // Create action log
    await createActionLog('drag-drop', id, req.user.userId, `Moved task "${existingTask.title}" from ${existingTask.status} to ${status}`);

    // Emit real-time update
    io.to('board-room').emit('task-moved', { task: updatedTask });

    res.status(200).json({ message: 'Task moved successfully.', task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

export const assignTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    console.log('Assign task request:', { taskId: id, assignedTo });

    // Check if task exists
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // If assignedTo is provided, check if user exists
    let assignedUser = null;
    if (assignedTo) {
      assignedUser = await User.findById(assignedTo);
      console.log('Found user:', assignedUser);
      if (!assignedUser) {
        return res.status(404).json({ message: 'Assigned user not found.' });
      }
    }

    // Update task assignment
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        assignedTo: assignedUser ? assignedUser._id : null,
        lastEditedBy: req.user ? req.user.userId : null,
        $inc: { version: 1 }
      },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'username email')
     .populate('lastEditedBy', 'username email');

    console.log('Updated task:', updatedTask);

    // Create action log
    const assignmentText = assignedUser ? `Assigned task "${existingTask.title}" to ${assignedUser.username}` : `Unassigned task "${existingTask.title}"`;
    await createActionLog('assign', id, req.user.userId, assignmentText);

    // Emit real-time update
    io.to('board-room').emit('task-updated', { task: updatedTask });

    res.status(200).json({ message: 'Task assigned successfully.', task: updatedTask });
  } catch (error) {
    console.error('Error in assignTask:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

export const smartAssign = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Smart assign request for task:', id);

    // Check if task exists
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Get all users
    const users = await User.find();
    console.log('All users found:', users.map(u => ({ id: u._id, username: u.username })));
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found.' });
    }

    // Get task counts for each user (only active tasks - Todo and In Progress)
    const userTaskCounts = await Task.aggregate([
      {
        $match: {
          assignedTo: { $in: users.map(user => user._id) },
          status: { $in: ['Todo', 'In Progress'] }
        }
      },
      {
        $group: {
          _id: '$assignedTo',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('User task counts from aggregation:', userTaskCounts);

    // Create a map of user ID to task count
    const taskCountMap = {};
    userTaskCounts.forEach(item => {
      taskCountMap[item._id.toString()] = item.count;
    });

    console.log('Task count map:', taskCountMap);

    // Find user with minimum tasks
    let minTasks = Infinity;
    let selectedUser = null;

    users.forEach(user => {
      const taskCount = taskCountMap[user._id.toString()] || 0;
      console.log(`User ${user.username} has ${taskCount} active tasks`);
      if (taskCount < minTasks) {
        minTasks = taskCount;
        selectedUser = user;
      }
    });

    console.log('Selected user:', selectedUser?.username, 'with', minTasks, 'tasks');

    // Update task assignment
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        assignedTo: selectedUser._id,
        lastEditedBy: req.user ? req.user.userId : null,
        $inc: { version: 1 }
      },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'username email')
     .populate('lastEditedBy', 'username email');

    // Create action log
    await createActionLog('assign', id, req.user.userId, `Smart assigned task "${existingTask.title}" to ${selectedUser.username} (${minTasks} active tasks)`);

    // Emit real-time update
    io.to('board-room').emit('task-updated', { task: updatedTask });

    res.status(200).json({ 
      message: 'Task smart assigned successfully.', 
      task: updatedTask,
      assignedTo: selectedUser.username,
      taskCount: minTasks
    });
  } catch (error) {
    console.error('Error in smartAssign:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};
