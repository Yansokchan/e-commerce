"use client";
import React from "react";
import styled from "styled-components";

const LiquidGlassWrapper = ({ children, className }) => {
  return (
    <StyledWrapper className={className}>
      <div className="container">
        <div className="card">{children}</div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  position: relative;
  width: 100%;

  .container {
    position: relative;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 0;
    /* Removed solid background to blend with page */
  }

  /* Blobs removed as per user request */

  .card {
    width: 100%;
    height: 100%;
    border: 1px solid #ffffff56;
    border-radius: 12px; /* Matches xl slightly */
    backdrop-filter: blur(10.5px);
    /* Padding is handled by the children/parent usage, but we keep some basics or rely on parent */
    position: relative;
    box-shadow: inset 2px 1px 6px #ffffff45;
    overflow: hidden;
    z-index: 0;
  }

  .card::after {
    z-index: -1;
    content: " ";
    position: absolute;
    width: 150%;
    top: 0;
    left: 0;
    height: 10px;
    background: #ffffff;
    transform: rotateZ(50deg);
    filter: blur(30px);
    animation: shine 10s ease infinite;
  }

  @keyframes ani {
    0% {
      transform: translateX(0%) scale(1);
    }
    50% {
      transform: translateX(50%) scale(0.8); /* Adjusted movement */
    }
    100% {
      transform: translateX(0%) scale(1);
    }
  }

  @keyframes shine {
    0% {
      top: 100%;
      left: -100%;
    }
    50%,
    100% {
      top: 0%;
      left: 70%;
    }
  }
`;

export default LiquidGlassWrapper;
