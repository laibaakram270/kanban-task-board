import { Command } from "./Command";

export class MoveTaskCommand extends Command {
  constructor(
    setColumns,
    task,
    sourceColumnId,
    sourceIndex,
    targetColumnId,
    targetIndex
  ) {
    super();

    this.setColumns = setColumns;
    this.task = task;
    this.sourceColumnId = sourceColumnId;
    this.sourceIndex = sourceIndex;
    this.targetColumnId = targetColumnId;
    this.targetIndex = targetIndex;
  }

  execute() {
    this.move(
      this.sourceColumnId,
      this.sourceIndex,
      this.targetColumnId,
      this.targetIndex
    );
  }

  undo() {
    this.move(
      this.targetColumnId,
      this.targetIndex,
      this.sourceColumnId,
      this.sourceIndex
    );
  }

  move(
    fromColumnId,
    fromIndex,
    toColumnId,
    toIndex
  ) {
    this.setColumns((columns) => {
      const updated = columns.map((column) => ({
        ...column,
        tasks: [...column.tasks],
      }));

      const fromColumn = updated.find(
        (column) => column.id === fromColumnId
      );

      const toColumn = updated.find(
        (column) => column.id === toColumnId
      );

      if (!fromColumn || !toColumn) {
        return columns;
      }

      let actualFromIndex = fromIndex;

      // For redo/undo, locate the task if its
      // original index is no longer valid.
      if (
        actualFromIndex < 0 ||
        actualFromIndex >= fromColumn.tasks.length ||
        fromColumn.tasks[actualFromIndex]?.id !== this.task.id
      ) {
        actualFromIndex = fromColumn.tasks.findIndex(
          (task) => task.id === this.task.id
        );
      }

      if (actualFromIndex === -1) {
        return columns;
      }

      const [movedTask] =
        fromColumn.tasks.splice(actualFromIndex, 1);

      let destinationIndex = toIndex;

      // When moving within the same column,
      // removing the task shifts later indexes.
      if (
        fromColumnId === toColumnId &&
        actualFromIndex < destinationIndex
      ) {
        destinationIndex--;
      }

      destinationIndex = Math.max(
        0,
        Math.min(
          destinationIndex,
          toColumn.tasks.length
        )
      );

      toColumn.tasks.splice(
        destinationIndex,
        0,
        movedTask
      );

      return updated;
    });
  }
}