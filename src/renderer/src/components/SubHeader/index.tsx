import React, {  ReactElement, ReactNode }  from 'react';

import { Container } from './styles';

type Props = {
  title: string | ReactElement<HTMLSpanElement> 
  children?: ReactNode
}

const SubHeader: React.FC<Props> = ({title, children}) => {

    return (
        <Container>
          <h3>{title}</h3>
          {children}
        </Container>
    );
}
 
export default SubHeader;


