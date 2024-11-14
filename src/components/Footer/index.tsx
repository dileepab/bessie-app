import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      links={[
        {
          key: 'BESSIE',
          title: 'BESSIE',
          href: 'https://bessie.com',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
