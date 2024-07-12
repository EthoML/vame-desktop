import React, {  ReactElement, ReactNode }  from 'react';

import { Container } from './styles';

type Props = {
  title: string | ReactElement<HTMLSpanElement> 
  children?: ReactNode
}

const Header: React.FC<Props> = ({title, children}) => {

    return (
        <Container>
          <h2>{title}</h2>
          {children}
        </Container>
    );
}
 
export default Header;


