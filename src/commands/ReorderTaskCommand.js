import { Command } from "./Command";

export class ReorderTaskCommand extends Command {
  constructor(
    setColumns,
    columnId,
    oldIndex,
    newIndex
  ) {
    super();

    this.setColumns = setColumns;
    this.columnId = columnId;
    this.oldIndex = oldIndex;
    this.newIndex = newIndex;
  }

  execute() {
    this.reorder(
      this.oldIndex,
      this.newIndex
    );
  }

  undo() {
    this.reorder(
      this.newIndex,
      this.oldIndex
    );
  }

  reorder(fromIndex, toIndex) {
    this.setColumns((columns) =>
      columns.map((column) => {
        if (column.id !== this.columnId) {
          return column;
        }

        const tasks = [...column.tasks];

        if (
          fromIndex < 0 ||
          fromIndex >= tasks.length
        ) {
          return column;
        }

        const [task] = tasks.splice(fromIndex, 1);

        tasks.splice(toIndex, 0, task);

        return {
          ...column,
          tasks,
        };
      })
    );
  }
}