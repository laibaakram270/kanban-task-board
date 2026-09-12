import { Command } from "./Command";

export class CreateTaskCommand extends Command {
  constructor(setColumns, columnId, task) {
    super();

    this.setColumns = setColumns;
    this.columnId = columnId;
    this.task = task;
  }

  execute() {
    this.setColumns((columns) =>
      columns.map((column) =>
        column.id === this.columnId
          ? {
              ...column,
              tasks: [...column.tasks, this.task],
            }
          : column
      )
    );
  }

  undo() {
    this.setColumns((columns) =>
      columns.map((column) =>
        column.id === this.columnId
          ? {
              ...column,
              tasks: column.tasks.filter(
                (task) => task.id !== this.task.id
              ),
            }
          : column
      )
    );
  }
}