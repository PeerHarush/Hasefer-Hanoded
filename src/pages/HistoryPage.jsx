import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrapper } from '../styles/History.styles';
import { Table } from 'react-bootstrap';


function History() {

    return (
<Wrapper>
<h1> היסטוריית הפעולות שלי</h1>
<h6> כאן תוכל לראות את הביקורות שלך ואת הספרים שהעלת לאתר</h6>

<Table bordered hover>
  <thead>
    <tr>
      
      <th>תאריך </th>
      <th> תיאור הפעולה</th>
      <th>סטטוס </th>
    </tr>
  </thead>
  <tbody>
  <tr>
        <td></td>
        <td></td>
        <td></td>
      </tr>
  </tbody>
</Table>
</Wrapper>
);
}

export default History;
