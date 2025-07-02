import mongoose from 'mongoose';

const actionLogSchema = new mongoose.Schema({
  actionType: {
    type: String,
    required: true,
    enum: ['add', 'edit', 'delete', 'assign', 'drag-drop']
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  details: {
    type: String,
    default: ''
  }
}, { timestamps: { createdAt: 'timestamp', updatedAt: false } });

const ActionLog = mongoose.model('ActionLog', actionLogSchema);
export default ActionLog; 