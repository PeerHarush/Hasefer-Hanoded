import React from 'react';
import { Wrapper } from '../styles/Transaction.styles';
import { Table } from 'react-bootstrap';


function Transaction() {

    return (
<Wrapper>
<h1> היסטוריית העסקאות שלי</h1>
<h6> כאן תוכלו לראות את כל העסקאות שביצעתם- כאלו שמחכות לאישור ועסקאות שהסתיימו.</h6>

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

export default Transaction;
