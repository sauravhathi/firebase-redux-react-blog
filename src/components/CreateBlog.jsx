import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createBlog } from "../redux/createBlogSlice";
import { Timestamp } from "firebase/firestore";
import { checkAuthState } from "../redux/authSlice";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  makeStyles,
  TextField,
  Button,
  Typography,
  FormControl,
  Select,
  MenuItem,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  createBlog: {
    maxWidth: 700,
    margin: "auto auto",
    padding: "1rem",
  },
  heading: {
    textAlign: "center",
    marginBottom: "1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "0.5rem",
    borderRadius: 5,
    border: "1px solid #ccc",
  },
  fileInput: {
    padding: 0,
    border: "none",
  },
  fileUploadButton: {
    padding: "0.5rem",
    borderRadius: 5,
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#eee",
    },
    "&:active": {
      backgroundColor: "#ddd",
    },
    "&:focus": {
      outline: "none",
      borderColor: "#333",
    },
  },
  submitButton: {
    padding: "0.5rem",
    borderRadius: 5,
    border: "none",
    backgroundColor: "#333",
    color: "#fff",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#444",
    },
    "&:active": {
      backgroundColor: "#222",
    },
    "&:focus": {
      outline: "none",
    },
  },
}));

const CreateBlog = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.createBlog.isLoading);
  const error = useSelector((state) => state.createBlog.error);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthState());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login to create a blog");
      navigate("/signin");
      return;
    }

    if (!title || !body || !tags || !category) {
      alert("Please fill in all fields");
      return;
    }

    const blogData = {
      title,
      body,
      image: image ? image : null,
      author: user,
      tags,
      category,
      likes: [],
      views: 0,
      comments: [],
      published: Timestamp.fromDate(new Date()),
      updated: Timestamp.fromDate(new Date()),
    };
    dispatch(createBlog(blogData));
    alert("Blog Published Successfully 🚀, Redirecting to Home Page");
    navigate("/blog");
    setTitle("");
    setBody("");
    setImage(null);
    setTags("");
    setCategory("");
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const categoryOptions = [
    "Technology",
    "Programming",
    "Web Development",
    "React",
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "Blockchain",
  ];

  return (
    <div className={classes.createBlog}>
      <Typography variant="h2" className={classes.heading}>
        Create a new blog
      </Typography>
      <ReactQuill
        theme="snow"
        value={body}
        onChange={setBody}
        resize="vertical"
        style={{ height: "200px", marginBottom: "4rem" }}
      />
      <form className={classes.form} onSubmit={handleSubmit}>
        <FormControl>
          <TextField
            label="Blog Title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            variant="outlined"
            className={classes.input}
          />
        </FormControl>
        <FormControl>
          <TextField
            label="Blog Tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            variant="outlined"
            className={classes.input}
          />
        </FormControl>
        <FormControl>
          <Select
            label="Blog Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            variant="outlined"
            className={classes.input}
          >
            <MenuItem value="">Select a category</MenuItem>
            {categoryOptions.map((category, index) => (
              <MenuItem value={category} key={index}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <Button
            variant="outlined"
            component="label"
            className={classes.fileUploadButton}
          >
            Upload Image
            <input
              type="file"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
              className={classes.fileInput}
            />
          </Button>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.submitButton}
        >
          Create Blog
        </Button>
      </form>
    </div>
  );
};

export default CreateBlog;