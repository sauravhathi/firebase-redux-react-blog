import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  signInWithGoogle,
  signOutUserAsync,
  checkAuthState,
} from "../redux/authSlice";
import {
  Skeleton,
  Stack,
  Box,
  Avatar,
  Typography,
  IconButton,
} from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthState());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box
        sx={{
          maxWidth: "700px",
          margin: "auto auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Stack
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            padding: "20px",
          }}
        >
          <Skeleton
            variant="circular"
            width={100}
            height={100}
            animation="wave"
          />
          <Skeleton
            variant="text"
            width={200}
            height={40}
            animation="wave"
            sx={{ my: 2 }}
          />
          <Skeleton
            variant="text"
            width={200}
            height={20}
            animation="wave"
            sx={{ mb: 2 }}
          />
          <Skeleton
            variant="rectangular"
            width={200}
            height={40}
            animation="wave"
          />
          <Skeleton
            variant="rectangular"
            width={200}
            height={40}
            animation="wave"
            sx={{ mt: 1 }}
          />
        </Stack>
      </Box>
    );
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!user) {
    return (
      <Box
        sx={{
          maxWidth: "700px",
          margin: "auto auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Stack
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            padding: "20px",
          }}
        >
          <Typography variant="h4" component="h1" sx={{ textAlign: "center" }}>
            Sign in with Google
          </Typography>
          <IconButton onClick={() => dispatch(signInWithGoogle())}>
            <GoogleIcon sx={{ fontSize: "3rem" }} />
          </IconButton>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: "700px",
        margin: "auto auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Stack
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "20px",
        }}
      >
        <Avatar
          src={user.photoUrl}
          alt={user.name}
          sx={{ width: "100px", height: "100px" }}
        />

        <Typography variant="h4" component="h1" sx={{ textAlign: "center" }}>
          Welcome {user.name}
        </Typography>
        <Typography variant="h6" component="h2" sx={{ textAlign: "center" }}>
          {user.email}
        </Typography>
        <IconButton onClick={() => dispatch(signOutUserAsync())}>
          <Typography variant="h6" component="h2" sx={{ textAlign: "center" }}>
            Sign out
          </Typography>
        </IconButton>
        <IconButton onClick={() => navigate("/blog")}>
          <Typography variant="h6" component="h2" sx={{ textAlign: "center" }}>
            Go to Blog
          </Typography>
        </IconButton>
        <IconButton onClick={() => navigate("/create")}>
          <Typography variant="h6" component="h2" sx={{ textAlign: "center" }}>
            Create Blog
          </Typography>
        </IconButton>
      </Stack>
    </Box>
  );
};

export default SignIn;
