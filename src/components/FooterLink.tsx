import React from 'react';
import { FilterType } from '../App';
import classNames from 'classnames';

type Props = {
  name: FilterType;
  selectedFilter: FilterType;
  showFilteredTodos: (filterType: FilterType) => void;
};

export const FooterLink: React.FC<Props> = ({
  name,
  selectedFilter,
  showFilteredTodos,
}) => {
  return (
    <a
      href={`#/${name}`}
      className={classNames('filter__link', {
        selected: selectedFilter === name,
      })}
      data-cy={`FilterLink${name.charAt(0).toUpperCase() + name.slice(1)}`}
      onClick={() => showFilteredTodos(name)}
    >
      {name.charAt(0).toUpperCase() + name.slice(1)}
    </a>
  );
};
