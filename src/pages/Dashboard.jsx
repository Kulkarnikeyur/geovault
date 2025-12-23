import React from "react";

function Dashboard() {
  try {
    const k = fetch("/api/dashboard", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
  } catch (e) {
    console.log(e);
  }
  return <div></div>;
}

export default Dashboard;
