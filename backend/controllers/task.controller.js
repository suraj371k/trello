import Task from '../models/Task.js';
import User from '../models/User.js';

export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, status, priority } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
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
      lastEditedBy: req.user ? req.user.userId : null
    });

    await task.save();

    await task.populate('assignedTo' , 'username email')

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
    const { title, description, assignedTo, status, priority } = req.body;

    // Check if task exists
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
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
        lastEditedBy: req.user ? req.user.userId : null,
        $inc: { version: 1 }
      },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'username email')
     .populate('lastEditedBy', 'username email');

    res.status(200).json({ message: 'Task updated successfully.', task: updatedTask });
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

    // Delete the task
    await Task.findByIdAndDelete(id);

    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};
