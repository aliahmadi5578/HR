import { useState } from "react";

export default function Pagination(props) {
  let totalPages = Math.ceil(props.totalItems / props.itemsPerPage);
  let finalPage = totalPages;
  let pages = [];
  if (totalPages <= 20) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (props.currentPage > 3) {
      pages.push("...");
    }
    let startPage = Math.max(2, props.currentPage - 1);
    let endPage = Math.min(totalPages - 1, props.currentPage + 1);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    if (props.currentPage < totalPages - 2) {
      pages.push("...");
    }
  }
  if (totalPages > 20) {
    pages.push(finalPage);
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-center">
        {pages.map((page) => {
          return (
            <button
              className="btn"
              key={page}
              onClick={() => (page != "..." ? props.onPageChange(page) : null)}
              style={{
                margin: "5px",
                padding: "5px",
                backgroundColor:
                  page === props.currentPage ? "rgb(131 131 131)" : "#cccc",
                color: page === props.currentPage ? "white" : "black",
              }}
            >
              {page}
            </button>
          );
        })}
      </div>
    </>
  );
}
