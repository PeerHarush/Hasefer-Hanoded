import styled from "styled-components";

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 0.35rem;
`;

export const GenresContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;

  width: 100%;
  max-height: 200px;
  overflow-y: auto;
`;

export const Label = styled.label`
display: "flex";
alignItems: "center";
  gap: 5px";
`;
