import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Skeleton,
} from "@mui/material";
import {
  AccessTime,
  ArrowBack,
  Comment,
  ThumbUp,
  Visibility,
  Delete,
} from "@mui/icons-material";
import Stack from "@mui/material/Stack";
import { motion } from "framer-motion";
import {
  fetchBlogById,
  likeBlog,
  updateBlogViews,
  addCommentToBlog,
  removeCommentFromBlog,
} from "../redux/blogSlice";
import { checkAuthState } from "../redux/authSlice";
import { Timestamp } from "firebase/firestore";

export default function Blog() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [blog, setBlog] = useState(null);
  const {
    blog: fetchedBlog,
    isLoading,
    error,
  } = useSelector((state) => state.blog);
  const { user } = useSelector((state) => state.auth);
  const [comment, setComment] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchBlogById(id));
    dispatch(checkAuthState());
  }, [dispatch, id]);

  useEffect(() => {
    if (fetchedBlog) {
      setBlog(fetchedBlog);
    }
  }, [fetchedBlog]);

  const handleAddComment = (event) => {
    event.preventDefault();
    if (!comment) {
      alert("Please enter a comment");
      return;
    }
    dispatch(
      addCommentToBlog({
        id,
        commentData: {
          author: user,
          body: comment,
          published: Timestamp.fromDate(new Date()),
        },
      })
    );
    setComment("");
  };

  if (isLoading) {
    return (
      <Stack sx={{ maxWidth: "700px", margin: "0 auto" }}>
        <Skeleton variant="rectangular" width="100%" height="300px" />
        <Skeleton variant="text" width="100%" height="50px" />
        <Skeleton variant="text" width="100%" height="50px" />
        <Skeleton variant="text" width="100%" height="50px" />
        <Skeleton variant="text" width="100%" height="50px" />
        <Skeleton variant="text" width="100%" height="50px" />
        <Skeleton variant="text" width="100%" height="50px" />
      </Stack>
    );
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ maxWidth: "700px", margin: "0 auto", padding: "1rem" }}
        onLoad={() => dispatch(updateBlogViews(id))}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight={700}>
            {blog?.title}
          </Typography>
        </Box>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: "1rem" }}
        >
          <Stack direction="row" alignItems="center" gap="0.5rem">
            <Avatar src={blog?.author?.photoUrl} />
            <Typography variant="body2" component="p">
              {blog?.author?.name}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" gap="0.5rem">
            <AccessTime />
            <Typography variant="body2" component="p">
              {blog?.published}
            </Typography>
          </Stack>
        </Stack>
        <Box sx={{ mt: "1rem" }}>
          <img
            src={blog?.imageUrl}
            alt={blog?.title}
            style={{ width: "100%", height: "auto" }}
          />
        </Box>
        <Box sx={{ mt: "1rem" }}>
          <Typography
            dangerouslySetInnerHTML={{ __html: blog?.body }}
            variant="body1"
            component="p"
          />
        </Box>
        <Box sx={{ mt: "1rem" }}>
          {blog?.tags?.split(",").map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              variant="filled"
              sx={{ textTransform: "capitalize", mr: "0.5rem" }}
            />
          ))}
        </Box>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: "1rem" }}
        >
          <Stack direction="row" alignItems="center" gap="0.5rem">
            <IconButton disabled={!user} onClick={() => dispatch(likeBlog(id))}>
              <ThumbUp />
            </IconButton>
            <Typography variant="body2" component="p">
              {blog?.likes === null ? 0 : blog?.likes?.length}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" gap="0.5rem">
            <IconButton>
              <Visibility />
            </IconButton>
            <Typography variant="body2" component="p">
              {blog?.views}
            </Typography>
          </Stack>
        </Stack>
        {user && (
          <>
            <Box sx={{ mt: "1rem" }}>
              <Typography variant="h6" component="h2">
                Comments ({blog?.comments?.length})
              </Typography>
              {blog?.comments?.map((comment, index) => (
                <Box
                  key={index}
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    padding: "1rem",
                    mt: "1rem",
                  }}
                >
                  <Stack direction="row" alignItems="center" gap="0.5rem">
                    <Avatar src={comment?.author?.photoUrl} />
                    <Typography variant="body2" component="p">
                      {comment?.author?.name}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" component="p">
                    {comment?.body}
                  </Typography>
                  {user?.uid === comment?.author?.uid && (
                    <IconButton
                      onClick={() =>
                        dispatch(removeCommentFromBlog({ id, index }))
                      }
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>
            <Box sx={{ mt: "1rem" }}>
              <Typography variant="h6" component="h2">
                Add Comment
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mt: "1rem" }}
              >
                <Stack direction="row" alignItems="center" gap="0.5rem">
                  <Avatar src={user?.photoUrl} />
                  <Typography variant="body2" component="p">
                    {user?.name}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap="0.5rem">
                  <IconButton onClick={handleAddComment} disabled={!user}>
                    <Comment />
                  </IconButton>
                </Stack>
              </Stack>
              <textarea
                name="comment"
                id="comment"
                cols="30"
                rows="10"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ width: "100%", height: "100px", resize: "none" }}
              ></textarea>
            </Box>
          </>
        )}
      </motion.article>
    </>
  );
}
