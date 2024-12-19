/* eslint-disable jsx-a11y/label-has-associated-control */
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { Todo } from '../types/Todo';

type Props = {
  todo: Todo;
  selectedTodo: number | null;
  clearCompleted: boolean;
  handleDeleteTodo: (todoId: number) => void;
  handleChangeStatus: (todoId: number) => void;
  handleEditTodo: (todoId: number, newTitle: string) => void;
};

export const TodoItem: React.FC<Props> = ({
  todo,
  selectedTodo,
  clearCompleted,
  handleDeleteTodo,
  handleChangeStatus,
  handleEditTodo,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = async () => {
    const trimmedNewTitle = newTitle.trim();

    try {
      if (trimmedNewTitle === '') {
        await handleDeleteTodo(todo.id);
      } else if (trimmedNewTitle !== todo.title) {
        await handleEditTodo(todo.id, trimmedNewTitle);
      }
    } catch (error) {
      setIsEditing(true);

      throw error;
    } finally {
      setIsEditing(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleBlur();
  };

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', { completed: todo.completed })}
      onDoubleClick={() => setIsEditing(true)}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={() => handleChangeStatus(todo.id)}
        />
      </label>

      {isEditing ? (
        <form onSubmit={event => handleSubmit(event)}>
          <input
            data-cy="TodoTitleField"
            type="text"
            className="todoapp__new-todo"
            ref={inputRef}
            value={newTitle}
            onChange={event => setNewTitle(event.target.value)}
            onBlur={handleBlur}
            onKeyUp={event => {
              if (event.key === 'Escape') {
                setNewTitle(todo.title);
                setIsEditing(false);
              }
            }}
          />
        </form>
      ) : (
        <>
          <span data-cy="TodoTitle" className="todo__title">
            {todo.title}
          </span>
          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => handleDeleteTodo(todo.id)}
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={classNames('modal', 'overlay', {
          'is-active':
            selectedTodo === todo.id || (clearCompleted && todo.completed),
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
