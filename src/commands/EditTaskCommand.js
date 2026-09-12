import { Command } from "./Command";

export class EditTaskCommand extends Command {
  constructor(
    setColumns,
    columnId,
    taskId,
    oldTitle,
    newTitle
  ) {
    super();

    this.setColumns = setColumns;
    this.columnId = columnId;
    this.taskId = taskId;
    this.oldTitle = oldTitle;
    this.newTitle = newTitle;
  }

  execute() {
    this.setTitle(this.newTitle);
  }

  undo() {
    this.setTitle(this.oldTitle);
  }

  setTitle(title) {
    this.setColumns((columns) =>
      columns.map((column) =>
        column.id === this.columnId
          ? {
              ...column,
              tasks: column.tasks.map((task) =>
                task.id === this.taskId
                  ? { ...task, title }
                  : task
              ),
            }
          : column
      )
    );
  }
}