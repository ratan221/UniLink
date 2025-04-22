import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import {
  Users,
  MessageSquare,
  Share2,
  Heart,
  Calendar,
  Loader2,
  Download,
} from "lucide-react";
import { fireApi } from "../../utils/useFire";
import Sidebar from "../../components/Sidebar";
import RecommendedUser from "../../components/RecommendedUser";
import { Button } from "@mui/material";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Helper functions for PDF generation
  const calculateEngagementRate = (data) => {
    const totalInteractions = (data.totalLikes || 0) + (data.totalComments || 0) + (data.totalShares || 0);
    const totalPosts = data.totalPosts || 1;
    return ((totalInteractions / totalPosts) * 100).toFixed(2);
  };

  const getPerformanceIndicator = (value, benchmark) => {
    if (value >= benchmark * 1.5) return "Excellent";
    if (value >= benchmark) return "Good";
    if (value >= benchmark * 0.5) return "Average";
    return "Needs Improvement";
  };

  const generatePDF = (reportData) => {
    setGeneratingPDF(true);
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
  
      // Header Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(40, 53, 147);
      doc.text("USER PERFORMANCE REPORT", 105, 20, { align: "center" });
  
      // User Info Section
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
  
      const imageX = 20;
      const imageY = 30;
      const imageWidth = 30;
      const imageHeight = 30;
  
      const textX = 60;
      const initialTextY = imageY;
      const lineHeight = 7;
  
      // Add profile image if available
      if (reportData.user.profilePicture) {
        try {
          doc.addImage(
            reportData.user.profilePicture,
            "JPEG",
            imageX,
            imageY,
            imageWidth,
            imageHeight,
            undefined,
            "FAST"
          );
        } catch (error) {
          console.error("Error adding profile image:", error);
          doc.text("Profile Image Unavailable", imageX, imageY + imageHeight / 2);
        }
      }
  
      // User details
      doc.text(`Name: ${reportData.user.name || "N/A"}`, textX, initialTextY);
      doc.text(`Username: ${reportData.user.username || "N/A"}`, textX, initialTextY + lineHeight);
      doc.text(`Email: ${reportData.user.email || "N/A"}`, textX, initialTextY + lineHeight * 2);
      doc.text(`Role: ${reportData.user.role || "N/A"}`, textX, initialTextY + lineHeight * 3);
      doc.text(`Headline: ${reportData.user.headline || "N/A"}`, textX, initialTextY + lineHeight * 4);
      doc.text(`Location: ${reportData.user.location || "N/A"}`, textX, initialTextY + lineHeight * 5);
  
      // Report date
      const reportDateY = initialTextY + lineHeight * 6;
      doc.text(
        `Report Generated: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        textX,
        reportDateY
      );
  
      // Divider line
      const dividerY = reportDateY + lineHeight;
      doc.setDrawColor(200, 200, 200);
      doc.line(20, dividerY, 277, dividerY);
  
      // Stats Table
      const contentStartY = dividerY + 10;
      const stats = [
        ["Metric", "Count", "Performance"],
        ["Total Posts", reportData.data.totalPosts || 0, getPerformanceIndicator(reportData.data.totalPosts, 125)],
        ["Total Comments", reportData.data.totalComments || 0, getPerformanceIndicator(reportData.data.totalComments, 320)],
        ["Total Shares", reportData.data.totalShares || 0, getPerformanceIndicator(reportData.data.totalShares, 85)],
        ["Total Likes", reportData.data.totalLikes || 0, getPerformanceIndicator(reportData.data.totalLikes, 540)],
        ["Total Events", reportData.data.totalEvents || 0, getPerformanceIndicator(reportData.data.totalEvents, 100)],
        ["Engagement Rate", `${calculateEngagementRate(reportData.data)}%`, getPerformanceIndicator(calculateEngagementRate(reportData.data), 12)],
      ];
  
      autoTable(doc, {
        startY: contentStartY,
        head: [stats[0]],
        body: stats.slice(1),
        theme: "grid",
        headStyles: {
          fillColor: [33, 150, 243],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          halign: "center",
        },
        columnStyles: {
          0: { fontStyle: "bold" },
          2: {
            fontStyle: "bold",
            cellWidth: "auto",
          },
        },
      });
  
      // Experience Section
      const experienceStartY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(16);
      doc.setTextColor(40, 53, 147);
      doc.text("Experience", 20, experienceStartY);
  
      const experienceData = reportData.user.experience.map((exp) => [
        exp.title,
        exp.company,
        new Date(exp.startDate).toLocaleDateString("en-US"),
        exp.endDate ? new Date(exp.endDate).toLocaleDateString("en-US") : "Present",
        exp.description,
      ]);
  
      autoTable(doc, {
        startY: experienceStartY + 5,
        head: [["Title", "Company", "Start Date", "End Date", "Description"]],
        body: experienceData,
        theme: "grid",
      });
  
      // Education Section
      const educationStartY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(16);
      doc.setTextColor(40, 53, 147);
      doc.text("Education", 20, educationStartY);
  
      const educationData = reportData.user.education.map((edu) => [
        edu.school,
        edu.fieldOfStudy,
        edu.startYear,
        edu.endYear || "Present",
      ]);
  
      autoTable(doc, {
        startY: educationStartY + 5,
        head: [["School", "Field of Study", "Start Year", "End Year"]],
        body: educationData,
        theme: "grid",
      });
  
      // Certifications Section
      const certificationsStartY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(16);
      doc.setTextColor(40, 53, 147);
      doc.text("Certifications", 20, certificationsStartY);
  
      const certificationsData = reportData.user.certifications.map((cert) => [
        cert.title,
        cert.institute,
        new Date(cert.startDate).toLocaleDateString("en-US"),
        cert.endDate ? new Date(cert.endDate).toLocaleDateString("en-US") : "Present",
        cert.description,
      ]);
  
      autoTable(doc, {
        startY: certificationsStartY + 5,
        head: [["Title", "Institute", "Start Date", "End Date", "Description"]],
        body: certificationsData,
        theme: "grid",
      });
  
      // Footer
      const pageHeight = doc.internal.pageSize.height;
      const footerY = Math.min(doc.lastAutoTable.finalY + 20, pageHeight - 10);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("© 2025 UniLink - All Rights Reserved", 105, footerY, {
        align: "center",
      });
  
      // Save the PDF
      doc.save(`user-report-${reportData.user.username}.pdf`);
      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate report");
    } finally {
      setGeneratingPDF(false);
    }
  };
  const getAnalytics = async () => {
    try {
      const response = await fireApi("/my-report", "POST");
      setAnalytics(response || null);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getSugestion = async () => {
    try {
      const response = await fireApi("/suggestions", "GET");
      setRecommendedUsers(response);
    } catch (error) {
      console.error("Error in getSugestion:", error);
      toast.error(error.message || "Something went wrong!");
    }
  };

  useEffect(() => {
    getAnalytics();
    getSugestion();
  }, []);

  const StatCard = ({ icon, title, value }) => (
    <div className="bg-white rounded-lg shadow p-4 flex items-center">
      <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="col-span-1 lg:col-span-1">
        <Sidebar />
      </div>
      <div className="col-span-1 lg:col-span-2 order-first lg:order-none">
        <h1 className="text-2xl font-bold mb-6">
          Profile Analytics Of Last 30 Days
        </h1>

        {!analytics ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-6">
              <Users size={64} className="mx-auto text-blue-500" />
            </div>
            <Loader2 className="mx-auto text-blue-500 animate-spin" size={64} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                icon={<MessageSquare size={24} />}
                title="Total Comments"
                value={analytics.data.totalComments || 0}
              />
              <StatCard
                icon={<Share2 size={24} />}
                title="Total Shares"
                value={analytics.data.totalShares || 0}
              />
              <StatCard
                icon={<Heart size={24} />}
                title="Total Likes"
                value={analytics.data.totalLikes || 0}
              />
              <StatCard
                icon={<Calendar size={24} />}
                title="Total Events"
                value={analytics.data.totalEvents || 0}
              />
              <StatCard
                icon={<Users size={24} />}
                title="Total Posts"
                value={analytics.data.totalPosts || 0}
              />
              <StatCard
                icon={<MessageSquare size={24} />}
                title="Event Comments"
                value={analytics.data.totalEventComments || 0}
              />
            </div>
            <p className="text-gray-500 text-sm mt-6">
              If you wanna see the results of your analytics so download the
              below report.
            </p>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Download />}
              onClick={() => generatePDF(analytics)}
              disabled={generatingPDF}
              sx={{ mt: 2, borderRadius: "10px" }}
            >
              {generatingPDF ? "Generating..." : "Download PDF"}
            </Button>
          </>
        )}
      </div>

      {recommendedUsers?.length > 0 && (
        <div className="col-span-1 lg:col-span-1 hidden lg:block">
          <div className="bg-secondary rounded-lg shadow p-4">
            <h2 className="font-semibold mb-4">People you may know</h2>
            {recommendedUsers?.map((user) => (
              <RecommendedUser key={user._id} user={user} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;