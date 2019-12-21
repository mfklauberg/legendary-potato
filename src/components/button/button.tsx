import React, { FC } from 'react';

import './button.css';

interface Props {
  onClick?: Function
  value: string;
}

const Button: FC<Props> = (props) => {
  const { onClick, value } = props;

  const handleClick = () => {
    if (onClick && typeof onClick === 'function') {
      onClick();
    }
  };

  return (
    <button className="c-button" onClick={handleClick}>
      <span className="c-button__text">{value}</span>
    </button>
  )
}

export default Button;