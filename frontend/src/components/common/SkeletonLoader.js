import React from 'react';

export const SkeletonCard = () => (
  <div className="card mb-4">
    <div className="card-body">
      <div className="placeholder-glow">
        <span className="placeholder col-6 mb-2"></span>
        <span className="placeholder col-4"></span>
      </div>
      <div className="placeholder-glow mt-3">
        <span className="placeholder col-8"></span>
      </div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 5 }) => (
  <div className="card">
    <div className="card-body">
      <table className="table table-hover mb-0">
        <thead>
          <tr>
            {[...Array(columns)].map((_, i) => (
              <th key={i}>
                <span className="placeholder col-10"></span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, i) => (
            <tr key={i}>
              {[...Array(columns)].map((_, j) => (
                <td key={j}>
                  <span className="placeholder col-8"></span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const SkeletonMetric = () => (
  <div className="card">
    <div className="card-body text-center">
      <div className="placeholder-glow">
        <span className="placeholder col-6 mb-2"></span>
        <h2 className="placeholder col-4">
          <span className="visually-hidden">Loading</span>
        </h2>
        <span className="placeholder col-8"></span>
      </div>
    </div>
  </div>
);

const SkeletonComponents = { SkeletonCard, SkeletonTable, SkeletonMetric };
export default SkeletonComponents;
