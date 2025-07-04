import ActionLog from '../models/ActionLog.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

export const createActionLog = async (actionType, taskId, performedBy, details = '') => {
  try {
    const actionLog = new ActionLog({
      actionType,
      task: taskId,
      performedBy,
      details
    });
    await actionLog.save();
    return actionLog;
  } catch (error) {
    console.error('Error creating action log:', error);
    throw error;
  }
};

export const getActionLogs = async (req, res) => {
  try {
    const actionLogs = await ActionLog.find()
      .populate('task', 'title status')
      .populate('performedBy', 'username email')
      .sort({ timestamp: -1 })
      .limit(20);

    res.status(200).json({ actionLogs });
  } catch (error) {
    console.error('Error fetching action logs:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

export const getActionLogsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const actionLogs = await ActionLog.find({ task: taskId })
      .populate('performedBy', 'username email')
      .sort({ timestamp: -1 });

    res.status(200).json({ actionLogs });
  } catch (error) {
    console.error('Error fetching task action logs:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
}; 