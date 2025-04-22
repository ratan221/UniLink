import { Box, Chip, Button, Paper, Typography, Modal } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fireApi } from "../../utils/useFire";

const CertificatesApproval = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const getUsers = async () => {
    try {
      setLoading(true);
      const res = await fireApi("/admin/certifications/pending", "GET");

      const formattedData = res?.users?.flatMap(
        (user) =>
          user.certifications?.map((cert) => ({
            id: `${user._id}-${cert._id}`,
            userId: user._id,
            certificationId: cert._id,
            name: user.name || "N/A",
            email: user.email || "N/A",
            certificationTitle: cert.title || "N/A",
            institute: cert.institute || "N/A",
            duration: `${new Date(cert.startDate).getFullYear()} - ${
              cert.endDate ? new Date(cert.endDate).getFullYear() : "Present"
            }`,
            description: cert.description || "",
            status: cert.status,
            file: cert.file || null,
          })) || []
      );

      setRows(formattedData);
    } catch (error) {
      toast.error(error.message || "Failed to fetch certifications");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId, certificationId) => {
    try {
      const res = await fireApi(
        `/admin/certifications/approve/${userId}/${certificationId}`,
        "PUT"
      );
      toast.success(res.message || "Certification verified successfully");
      getUsers();
    } catch (error) {
      toast.error(error.message || "Failed to verify certification");
    }
  };

  const handleReject = async (certificationId) => {
    try {
      const res = await fireApi(
        `/admin/certifications/reject/${certificationId}`,
        "DELETE"
      );
      toast.success(res.message || "Certification rejected");
      getUsers();
    } catch (error) {
      toast.error(error.message || "Failed to reject certification");
    }
  };

  const handleOpenImage = (imageUrl) => {
    setSelectedImage(imageUrl);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedImage(null);
  };

  const columns = [
    // { field: "id", headerName: "ID", width: 90 },
    {
      field: "name",
      headerName: "Name",
      width: 100,
    },
    {
      field: "email",
      headerName: "Email",
      width: 180,
    },
    {
      field: "certificationTitle",
      headerName: "Certification",
      width: 200,
    },
    {
      field: "institute",
      headerName: "Institute",
      width: 200,
    },
    {
      field: "file",
      headerName: "File",
      width: 170,
      renderCell: (params) =>
        params.value ? (
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleOpenImage(params.value)}
          >
            View Certificate
          </Button>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No file attached
          </Typography>
        ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        const status = params.value; // Assuming params.value is one of the "pending", "accepted", or "rejected"

        return (
          <Chip
            label={status}
            color={
              status === "pending"
                ? "warning"
                : status === "approved"
                ? "success"
                : "error"
            }
            size="small"
          />
        );
      },
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params?.row?.status === "pending" ? (
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() =>
                handleVerify(params.row.userId, params.row.certificationId)
              }
              // disabled={params.row.status}
              sx={{ minWidth: 80, fontSize: "0.75rem", py: 0.5 }}
            >
              Verify
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleReject(params.row.certificationId)}
              sx={{ minWidth: 80, fontSize: "0.75rem", py: 0.5 }}
            >
              Reject
            </Button>
          </Box>
        ) : (
          <p className="text-gray-500">User is {params?.row?.status}</p>
        ),
    },
  ];

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Paper elevation={0} sx={{ px: 3, mb: 2 }}>
        <h1 className="text-2xl font-semibold">Pending Certifications</h1>
        <p className="text-gray-600">Review and approve user certifications</p>
      </Paper>

      <Paper
        elevation={0}
        sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}
      >
        {rows.length === 0 && !loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h6" color="textSecondary">
              No pending certificates available
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={getUsers}
              sx={{ mt: 2 }}
            >
              Refresh
            </Button>
          </Box>
        ) : (
          <Box sx={{ width: "100%", flex: 1 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
                },
              }}
              pageSizeOptions={[5, 10, 25]}
              checkboxSelection={false}
              disableRowSelectionOnClick
            />
          </Box>
        )}
      </Paper>

      {/* Image Preview Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="image-preview-modal"
        aria-describedby="image-preview-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 2,
            outline: "none",
            maxWidth: "90%",
            maxHeight: "90%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 3,
          }}
        >
          <img
            src={selectedImage}
            alt="Certificate Preview"
            style={{ maxWidth: "100%", maxHeight: "80vh" }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCloseModal}
            sx={{ mt: 2 }}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default CertificatesApproval;
