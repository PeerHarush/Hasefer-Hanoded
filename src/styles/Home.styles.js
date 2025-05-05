import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import API_BASE_URL from '../config';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 2rem;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  width: 200px;
  padding: 1rem;
  text-align: center;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 8px;
`;

const Title = styled.h3`
  margin-top: 10px;
  color: rgb(144, 83, 8);
  font-size: 1.1rem;
`;

const Author = styled.p`
  color: #555;
  font-size: 0.95rem;
  margin: 4px 0 0;
`;


export const pageWrapper = {
    textAlign: 'center',
    marginTop: '5rem'
  };
  
  export const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '10px',
    backgroundColor: '#daaa84',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    margin: '0.5rem'
  };




