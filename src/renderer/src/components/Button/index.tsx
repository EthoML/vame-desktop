import React  from 'react';

import { Container } from './styles';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>

const Button: React.FC<Props> = ({children,...props}) => {

    return (
        <Container {...props}>
          {children}
        </Container>
    );
}

export default Button;


