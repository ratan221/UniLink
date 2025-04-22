import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import toast from "react-hot-toast";
import { fireApi } from "../../utils/useFire";
import { useEffect, useState } from "react";
import { PictureAsPdf } from "@mui/icons-material";
import Button from "@mui/material/Button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const Home = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const getUsers = async () => {
    try {
      setLoading(true);
      const res = await fireApi("/admin/all-users", "GET");
      const formatedData = res?.data?.map((user, index) => ({
        id: user._id || index + 1,
        name: user.name || "N/A",
        username: user.username || "N/A",
        age: user.age || "N/A",
        email: user.email || "N/A",
        role: user.role || "N/A",
        about: user.about || "N/A",
      }));
      setRows(formatedData);
    } catch (error) {
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "username", headerName: "Username", width: 150 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "role", headerName: "Role", width: 80 },
    { field: "about", headerName: "About User", width: 150 },
    {
      field: "action",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<PictureAsPdf />}
          onClick={() => generateUserReport(params.row)}
        >
          Report
        </Button>
      ),
    },
  ];

  const calculateEngagementRate = (data) => {
    const totalInteractions =
      (data.totalComments || 0) +
      (data.totalLikes || 0) +
      (data.totalShares || 0);
    const engagementRate = data.totalPosts
      ? (totalInteractions / data.totalPosts) * 100
      : 0;
    return engagementRate.toFixed(2);
  };

  const getPerformanceIndicator = (value, avg) => {
    if (value > avg * 1.2) return "Excellent";
    if (value > avg) return "Good";
    if (value > avg * 0.8) return "Average";
    return "Needs Improvement";
  };

  const generateUserReport = async (user) => {
    try {
      setLoading(true);
      const res = await fireApi(`/admin/user-report/${user.id}`, "GET");
      const { user: userData, data } = res;

      const doc = new jsPDF("landscape", "mm", "a4");

      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 53, 147);
      doc.setFontSize(22);
      doc.text("USER PERFORMANCE REPORT", 105, 20, { align: "left" });

      const imageX = 20;
      const imageY = 30;
      const imageWidth = 30;
      const imageHeight = 30;

      if (userData.profilePicture) {
        try {
          doc.addImage(
            userData.profilePicture,
            "JPEG",
            imageX,
            imageY,
            imageWidth,
            imageHeight
          );
        } catch (err) {
          doc.setFontSize(10);
          doc.setTextColor(150);
          doc.text("Profile image unavailable", imageX, imageY + 20);
        }
      }

      const textX = 60;
      let y = imageY;

      const addTextLine = (label, value) => {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`${label}: ${value || "N/A"}`, textX, y);
        y += 7;
      };

      addTextLine("Name", userData.name);
      addTextLine("Username", userData.username);
      addTextLine("Email", userData.email);
      addTextLine("Role", userData.role);
      addTextLine("Headline", userData.headline);
      addTextLine("Location", userData.location);

      doc.setTextColor(0);
      doc.text(
        `Report Generated: ${new Date().toLocaleString()}`,
        textX,
        y
      );
      y += 10;

      doc.setDrawColor(200);
      doc.line(20, y, 277, y);
      y += 10;

      // Performance Stats Table
      const stats = [
        ["Metric", "Count", "Performance"],
        [
          "Total Posts",
          data.totalPosts || 0,
          getPerformanceIndicator(data.totalPosts, 125),
        ],
        [
          "Total Comments",
          data.totalComments || 0,
          getPerformanceIndicator(data.totalComments, 320),
        ],
        [
          "Total Shares",
          data.totalShares || 0,
          getPerformanceIndicator(data.totalShares, 85),
        ],
        [
          "Total Likes",
          data.totalLikes || 0,
          getPerformanceIndicator(data.totalLikes, 540),
        ],
        [
          "Total Events",
          data.totalEvents || 0,
          getPerformanceIndicator(data.totalEvents, 100),
        ],
        [
          "Engagement Rate",
          `${calculateEngagementRate(data)}%`,
          getPerformanceIndicator(calculateEngagementRate(data), 12),
        ],
      ];

      autoTable(doc, {
        startY: y,
        head: [stats[0]],
        body: stats.slice(1),
        theme: "grid",
        headStyles: {
          fillColor: [33, 150, 243],
          textColor: 255,
          fontStyle: "bold",
        },
        bodyStyles: { halign: "center" },
      });

      y = doc.lastAutoTable?.finalY + 15 || y + 15;

      // Experience Section
      doc.setFontSize(16);
      doc.setTextColor(40, 53, 147);
      doc.text("Work Experience", 20, y);
      y += 5;

      if (userData.experience?.length > 0) {
        const expData = userData.experience.map((exp) => [
          exp.company || "N/A",
          exp.title || "N/A",
          `${new Date(exp.startDate).toLocaleDateString()} - ${
            exp.endDate
              ? new Date(exp.endDate).toLocaleDateString()
              : "Present"
          }`,
          exp.description || "",
        ]);
        autoTable(doc, {
          startY: y + 5,
          head: [["Company", "Position", "Duration", "Description"]],
          body: expData,
          styles: { fontSize: 10, cellPadding: 3 },
        });
        y = doc.lastAutoTable.finalY + 10;
      } else {
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text("No professional experience listed.", 25, y + 10);
        y += 20;
      }

      // Education Section
      doc.setFontSize(16);
      doc.setTextColor(40, 53, 147);
      doc.text("Education", 20, y);
      y += 5;

      if (userData.education?.length > 0) {
        const eduData = userData.education.map((edu) => [
          edu.school || "N/A",
          edu.fieldOfStudy || "N/A",
          `${edu.startYear} - ${edu.endYear || "Present"}`,
        ]);
        autoTable(doc, {
          startY: y + 5,
          head: [["Institution", "Field of Study", "Years"]],
          body: eduData,
          styles: { fontSize: 10, cellPadding: 3 },
        });
        y = doc.lastAutoTable.finalY + 10;
      } else {
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text("No education records found.", 25, y + 10);
      }

      // Footer
      const pageHeight = doc.internal.pageSize.height;
      const footerHeight = 15; // Height reserved for footer
      const minSpacing = 20; // Minimum spacing between content and footer

      // Calculate footer position
      let footerY = pageHeight - footerHeight;

      // Add a page if content is too close to footer
      if (doc.lastAutoTable?.finalY && doc.lastAutoTable.finalY > pageHeight - (footerHeight + minSpacing)) {
          doc.addPage();
          footerY = pageHeight - footerHeight;
      }

      // Add footer line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(20, footerY - 5, 277, footerY - 5);

      // Add footer text
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text("© 2024 UniLink - All Rights Reserved", 148, footerY, {
          align: "center"
      });

      // Save the document
      doc.save(`user-report-${userData.username}.pdf`);
      toast.success("Report generated successfully");
    } catch (err) {
      toast.error("Error generating report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <Box sx={{ height: "auto", width: "100%" }}>
      <h1 className="text-2xl font-semibold mb-4 px-4">Users List</h1>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default Home;
