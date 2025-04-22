import { Box, Chip, Button, Paper, Typography, Modal } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fireApi } from "../../utils/useFire";

const SkillsApproval = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const getUsers = async () => {
    try {
      setLoading(true);
      const res = await fireApi("/admin/skills/pending", "GET");
  
      const formattedData = res?.users?.flatMap(
        (user) =>
          user.skills?.map((skill) => ({
            id: `${user._id}-${skill._id}`,
            userId: user._id,
            skillId: skill._id,
            name: user.name || "N/A",
            email: user.email || "N/A",
            skillName: skill.name || "N/A",
            description: skill.description || "N/A",
            status: skill.skillStatus || "pending",
            image: skill.image || null,
            isVerified: skill.isSkillVerified || false
          })) || []
      );
  
      setRows(formattedData);
    } catch (error) {
      toast.error(error.message || "Failed to fetch skills");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId, skillId) => {
    try {
      const res = await fireApi(
        `/admin/skills/approve/${userId}/${skillId}`,
        "PUT"
      );
      toast.success(res.message || "Certification verified successfully");
      getUsers();
    } catch (error) {
      toast.error(error.message || "Failed to verify certification");
    }
  };

  const handleReject = async (userId, skillId) => {
    try {
      const res = await fireApi(
        `/admin/skills/reject/${userId}/${skillId}`,
        "PUT"
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
      field: "skillName",
      headerName: "Skill",
      width: 200,
    },
    {
      field: "description",
      headerName: "Description",
      width: 250,
    },
    {
      field: "image",
      headerName: "Image",
      width: 170,
      renderCell: (params) =>
        params.value ? (
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleOpenImage(params.value)}
          >
            View Image
          </Button>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No image attached
          </Typography>
        ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        const status = params.value;
  
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
                handleVerify(params.row.userId, params.row.skillId)
              }
              sx={{ minWidth: 80, fontSize: "0.75rem", py: 0.5 }}
            >
              Verify
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleReject(params.row.userId, params.row.skillId)}
              sx={{ minWidth: 80, fontSize: "0.75rem", py: 0.5 }}
            >
              Reject
            </Button>
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Skill is {params?.row?.status}
          </Typography>
        ),
    },
  ];
  useEffect(() => {
    getUsers();
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Paper elevation={0} sx={{ px: 3, mb: 2 }}>
        <h1 className="text-2xl font-semibold">Pending Skills</h1>
        <p className="text-gray-600">Review and approve user skills</p>
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

export default SkillsApproval;
