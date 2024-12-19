/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { Todo } from './types/Todo';
import * as todoService from './api/todos';
import { UserWarning } from './UserWarning';
import { USER_ID } from './api/todos';
import classNames from 'classnames';
import { Header } from './components/Header';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';

export enum FilterType {
  All = 'all',
  Completed = 'completed',
  Active = 'active',
}

export const App: React.FC = () => {
  // #region state
  const [todos, setTodos] = useState<Todo[]>([]);
  const [titleValue, setTitleValue] = useState('');
  const [selectedTodo, setSelectedTodo] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(
    FilterType.All,
  );

  const [inputLoading, setInputLoading] = useState(false);
  const [clearCompleted, setClearCompleted] = useState(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // #endregion
  // #region DONE render

  useEffect(() => {
    setErrorMessage('');

    todoService
      .getTodos()
      .then(setTodos)
      .catch(error => {
        setErrorMessage('Unable to load todos');
        throw error;
      });
  }, []);

  useEffect(() => {
    if (!inputLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputLoading]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // #endregion
  // #region DONE change status
  const handleChangeStatus = (todoId: number) => {
    setErrorMessage('');
    setSelectedTodo(todoId);
    setInputLoading(true);

    const todoForUpdate = todos.find(todo => todo.id === todoId);

    if (!todoForUpdate) {
      setErrorMessage('Unable to update a todo');
      setInputLoading(false);
      setSelectedTodo(null);

      return;
    }

    const updatedTodo = {
      ...todoForUpdate,
      completed: !todoForUpdate.completed,
    };

    todoService
      .updateTodo(updatedTodo)
      .then(updated => {
        setTodos(currentTodos =>
          currentTodos.map(todo => (todo.id === updated.id ? updated : todo)),
        );
      })
      .catch(error => {
        setErrorMessage('Unable to update a todo');
        throw error;
      })
      .finally(() => {
        setSelectedTodo(null);
        setInputLoading(false);
      });
  };

  const handleChangeStatusAll = async () => {
    setErrorMessage('');
    setClearCompleted(true);

    try {
      const hasIncompleteTodos = todos.some(todo => !todo.completed);

      const updatePromises = todos.map(todo => {
        if (hasIncompleteTodos && !todo.completed) {
          return todoService.updateTodo({
            ...todo,
            completed: true,
          });
        }

        if (!hasIncompleteTodos && todo.completed) {
          return todoService.updateTodo({
            ...todo,
            completed: false,
          });
        }

        return Promise.resolve(todo);
      });

      const results = await Promise.allSettled(updatePromises);

      const anyFailed = results.some(result => result.status === 'rejected');

      if (anyFailed) {
        setErrorMessage('Unable to update a todo');
      }

      setTodos(currentTodos => {
        return currentTodos.map((todo, index) => {
          const result = results[index];

          if (result.status === 'fulfilled') {
            return result.value;
          }

          return todo;
        });
      });
    } catch (error) {
      setErrorMessage('Unable to update a todo');
    } finally {
      setClearCompleted(false);
    }
  };
  // #endregion
  // #region DONE delete todo

  const handleDeleteTodo = (todoId: number) => {
    setErrorMessage('');
    setSelectedTodo(todoId);
    todoService
      .deleteTodo(todoId)
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );
        if (inputRef.current) {
          inputRef.current.focus();
        }
      })
      .catch(error => {
        setErrorMessage('Unable to delete a todo');
        throw error;
      })
      .finally(() => {
        setSelectedTodo(null);
      });
  };

  const handleDeleteAllCompleted = async () => {
    setErrorMessage('');
    setClearCompleted(true);

    const completedTodos = todos.filter(todo => todo.completed);

    const deletePromises = completedTodos.map(todo =>
      todoService.deleteTodo(todo.id).then(
        () => ({ id: todo.id, success: true }),
        () => ({ id: todo.id, success: false }),
      ),
    );

    try {
      const results = await Promise.all(deletePromises);

      const successfullyDeletedIds = results
        .filter(result => result.success)
        .map(result => result.id);

      const anyFailed = results.some(result => !result.success);

      if (anyFailed) {
        setErrorMessage('Unable to delete a todo');
      }

      setTodos(currentTodos =>
        currentTodos.filter(todo => !successfullyDeletedIds.includes(todo.id)),
      );

      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      setErrorMessage('Unable to delete a todo');
    } finally {
      setClearCompleted(false);
    }
  };

  // #endregion
  // #region edit todo
  const handleEditTodo = (todoId: number, newTitle: string) => {
    setErrorMessage('');
    setSelectedTodo(todoId);
    setInputLoading(true);

    const todoForUpdate = todos.find(todo => todo.id === todoId);

    if (!todoForUpdate) {
      setErrorMessage('Unable to update a todo');
      setInputLoading(false);
      setSelectedTodo(null);

      return;
    }

    const updatedTodo = {
      ...todoForUpdate,
      title: newTitle,
    };

    todoService
      .updateTodo(updatedTodo)
      .then(updated => {
        setTodos(currentTodos =>
          currentTodos.map(todo => (todo.id === updated.id ? updated : todo)),
        );
      })
      .catch(error => {
        setErrorMessage('Unable to update a todo');
        throw error;
      })
      .finally(() => {
        setSelectedTodo(null);
        setInputLoading(false);
      });
  };
  // #endregion
  // #region DONE add todo

  const handleAddTodo = (title: string) => {
    const trimmedTitle = title.trim();

    setErrorMessage('');
    setInputLoading(true);

    if (!trimmedTitle) {
      setErrorMessage('Title should not be empty');
      setInputLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }

      return;
    }

    const createTempTodo: Todo = {
      id: 0,
      userId: USER_ID,
      title: trimmedTitle,
      completed: false,
    };

    setTempTodo(createTempTodo);

    todoService
      .createTodo({ title: trimmedTitle, userId: USER_ID, completed: false })
      .then(newTodo => {
        setSelectedTodo(newTodo.id);
        setTodos(currentTodos => [...currentTodos, newTodo]);
        setTitleValue('');
        setTempTodo(null);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      })
      .catch(error => {
        setErrorMessage('Unable to add a todo');
        setTitleValue(trimmedTitle);
        throw error;
      })
      .finally(() => {
        setTempTodo(null);
        setSelectedTodo(null);
        setInputLoading(false);
      });
  };
  // #endregion
  // #region DONE filter

  const showFilteredTodos = (filterType: FilterType) => {
    setSelectedFilter(filterType);
  };

  const filteredTodos = todos.filter(todo => {
    switch (selectedFilter) {
      case FilterType.Completed:
        return todo.completed;
      case FilterType.Active:
        return !todo.completed;
      default:
        return true;
    }
  });
  // #endregion

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todos={todos}
          inputLoading={inputLoading}
          inputValue={titleValue}
          refForInput={inputRef}
          handleChangeValue={value => setTitleValue(value)}
          handleAddTodo={someText => handleAddTodo(someText)}
          handleChangeStatusAll={handleChangeStatusAll}
        />

        <TodoList
          filteredTodos={filteredTodos}
          selectedTodo={selectedTodo}
          clearCompleted={clearCompleted}
          tempTodo={tempTodo}
          deleteTodo={handleDeleteTodo}
          changeStatus={handleChangeStatus}
          editTodo={handleEditTodo}
        />

        {todos.length > 0 && (
          <Footer
            todos={todos}
            selectedFilter={selectedFilter}
            deleteAllCompleted={handleDeleteAllCompleted}
            showFilteredTodos={showFilteredTodos}
          />
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification',
          'is-danger',
          'is-light',
          'has-text-weight-normal',
          {
            hidden: !errorMessage,
          },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage('')}
        />
        {errorMessage}
      </div>
    </div>
  );
};
