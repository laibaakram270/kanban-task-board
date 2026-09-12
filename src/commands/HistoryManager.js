export class HistoryManager {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
  }

  execute(command) {
    command.execute();

    this.undoStack.push(command);

    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length === 0) {
      return false;
    }

    const command = this.undoStack.pop();

    command.undo();

    this.redoStack.push(command);

    return true;
  }

  redo() {
    if (this.redoStack.length === 0) {
      return false;
    }

    const command = this.redoStack.pop();

    command.execute();

    this.undoStack.push(command);

    return true;
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}