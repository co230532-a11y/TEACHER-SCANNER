import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./components/SideBar";
import Header from "./components/Header";
import "./styles/Attendees.css";

// PDF & Excel libraries
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Attendees = () => {
  const [attendees, setAttendees] = useState([]);
  const navigate = useNavigate();

  // Load attendees from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("attendees")) || [];
    setAttendees(saved);
  }, []);

  // Navigate to map
  const viewMap = (lat, lng, name) => {
    navigate("/map", { state: { lat, lng, name } });
  };

  // Delete single attendee
  const deleteAttendee = (index) => {
    const updated = attendees.filter((_, i) => i !== index);
    setAttendees(updated);
    localStorage.setItem("attendees", JSON.stringify(updated));
  };

  // Clear all attendees
  const clearAttendees = () => {
    localStorage.removeItem("attendees");
    setAttendees([]);
  };

  // Export to PDF
  const exportPDF = () => {
    if (attendees.length === 0) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Attendee Records", 14, 22);

    const tableColumn = ["Name", "ID", "Date", "Time"];
    const tableRows = attendees.map((a) => [a.name, a.id, a.date, a.time]);

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [22, 160, 133], textColor: 255 },
      alternateRowStyles: { fillColor: [238, 238, 238] },
    });

    doc.save("attendees.pdf");
  };

  // Export to Excel
  const exportExcel = () => {
    if (attendees.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(attendees);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendees");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "attendees.xlsx");
  };

  return (
    <div className="AttendeesPage">
      <NavBar />

      <div className="attendees-container">
        <Header />
        <div className="top">
          {" "}
          <h2 className="attendees-header">👥 Attendee Records</h2>
        </div>

        {attendees.length === 0 ? (
          <p className="no-attendees">No attendees recorded yet.</p>
        ) : (
          <>
            <table className="attendees-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Actions</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((a, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{a.name}</td>
                    <td>{a.id}</td>
                    <td>{a.date}</td>
                    <td>{a.time}</td>
                    <td>
                      <button
                        className="view-map-btn"
                        onClick={() => viewMap(a.lat, a.lng, a.name)}
                      >
                        View Map
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteAttendee(idx)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <br></br>
        <p className="exprt-note">Export Attendance</p>
        <div className="export-buttons">
          <button className="export-btn" onClick={exportPDF}>
            PDF
          </button>
          <button className="export-btn" onClick={exportExcel}>
            Excel
          </button>
        </div>
        <p className="note">This will delete Attendees from localStorage</p>
        {attendees.length > 0 && (
          <button className="clear-btn" onClick={clearAttendees}>
            CLEAR RECORDS
          </button>
        )}
      </div>
    </div>
  );
};

export default Attendees;
