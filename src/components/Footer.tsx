import React from 'react';
import { Todo } from '../types/Todo';
import { FilterType } from '../App';
import { FooterLink } from './FooterLink';

type Props = {
  todos: Todo[];
  selectedFilter: FilterType;
  deleteAllCompleted: () => Promise<void>;
  showFilteredTodos: (filterType: FilterType) => void;
};

export const Footer: React.FC<Props> = ({
  todos,
  selectedFilter,
  deleteAllCompleted,
  showFilteredTodos,
}) => {
  const links = Object.values(FilterType);

  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {`${todos.filter(todo => !todo.completed).length} items left`}
      </span>

      <nav className="filter" data-cy="Filter">
        {links.map(link => (
          <FooterLink
            key={link}
            name={link}
            selectedFilter={selectedFilter}
            showFilteredTodos={showFilteredTodos}
          />
        ))}
      </nav>

      <button
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
        disabled={!todos.some(todo => todo.completed)}
        onClick={() => deleteAllCompleted()}
      >
        Clear completed
      </button>
    </footer>
  );
};
