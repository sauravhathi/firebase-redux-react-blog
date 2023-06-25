import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchBlogs, fetchPopularBlogs } from "../redux/blogSlice";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Chip,
  Stack,
  TextField,
  Box,
  AppBar,
  Toolbar,
  Skeleton,
} from "@mui/material";
import { makeStyles } from "@material-ui/core";
import {
  Person,
  Category,
  AccessTime,
  Visibility,
  Chat,
} from "@mui/icons-material";

const useStyles = makeStyles(() => ({
  tagsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    "& > *": {
      whiteSpace: "nowrap",
    },
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "1rem",
  },
  searchInput: {
    marginRight: "1rem",
  },
  errorContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "200px",
    color: "red",
  },
}));

const BlogCard = ({ blog }) => {
  const classes = useStyles();
  return (
    <Card sx={{ height: "100%" }}>
      <Link
        to={`/blog/${blog.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <CardMedia
          component="img"
          height="200"
          image={blog.imageUrl}
          alt={blog.title}
          sx={{ objectFit: "fill" }}
        />
      </Link>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {blog?.title.slice(0, 50)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {blog?.body.slice(0, 200).concat("...")}
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          mt={2}
          className={classes.tagsContainer}
        >
          <Chip
            icon={<Person />}
            label={blog?.author ? blog.author.displayName : "Anonymous"}
          />
          <Chip icon={<Category />} label={blog?.category} />
          {blog?.tags?.split(",").map((tag, index) => (
            <Chip label={tag} key={index} />
          ))}
        </Stack>
      </CardContent>
      <CardActions>
        <Typography variant="body2" color="text.secondary">
          <AccessTime style={{ verticalAlign: "middle" }} /> {blog?.published}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <Visibility style={{ verticalAlign: "middle" }} /> {blog?.views}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <Chat style={{ verticalAlign: "middle" }} /> {blog?.comments.length}
        </Typography>
        <Button size="small" sx={{ ml: "auto" }}>
          <Link
            to={`/blog/${blog.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Read More
          </Link>
        </Button>
      </CardActions>
    </Card>
  );
};

const BlogList = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const blogs = useSelector((state) => state.blog.blog);
  const popularBlogs = useSelector((state) => state.blog.popularBlogs);
  const isLoading = useSelector((state) => state.blog.isLoading);
  const error = useSelector((state) => state.blog.error);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPopularBlogs());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box sx={{ margin: "0 auto", maxWidth: "1200px" }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Blogs
            </Typography>
            <Stack direction="row" spacing={1}>
              <Skeleton
                variant="rectangular"
                width={150}
                height={40}
                animation="wave"
              />
              <Skeleton
                variant="rectangular"
                width={80}
                height={40}
                animation="wave"
              />
            </Stack>
          </Toolbar>
        </AppBar>
        <Skeleton
            variant="rectangular"
            width="20%"
            height={40}
            animation="wave"
          />
        <Grid container mt={2} spacing={1}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} lg={4} key={index}>
              <Card sx={{ height: "100%" }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton height={40} animation="wave" />
                  <Skeleton height={20} width="80%" animation="wave" />
                  <Skeleton height={20} width="50%" animation="wave" />
                  <Skeleton height={20} width="70%" animation="wave" />
                </CardContent>
                <CardActions>
                  <Skeleton
                    variant="rectangular"
                    width={100}
                    height={30}
                    animation="wave"
                  />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={classes.errorContainer}>
        <Typography variant="subtitle1" component="h1">
          Error fetching blogs. Please try again.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "1200px" }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Blogs
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              variant="outlined"
              label="Search"
              size="small"
              className={classes.searchInput}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => dispatch(fetchBlogs(searchQuery))}
              size="small"
            >
              Search
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Grid container mt={2} gap={2}>
        {popularBlogs.length > 0 && (
          <Typography variant="h4" component="h2" borderBottom={1} >
            Popular Blogs
          </Typography>
        )}
        <Grid item xs={12} mt={2}>
          <Grid container spacing={1}>
            {popularBlogs.map((blog, index) => (
              <Grid item xs={12} sm={6} md={3} lg={4} key={index} sx={{ padding: "0rem" }}>
                <BlogCard blog={blog} />
              </Grid>
            ))}
          </Grid>
        </Grid>
        {blogs.length > 0 && (
          <Typography variant="h4" component="h2" borderBottom={1}>
            All Blogs
          </Typography>
        )}
        <Grid item xs={12} sx={{ mt: "1rem" }}>
          <Grid container spacing={1}>
            {blogs.map((blog, index) => (
              <Grid item xs={12} sm={6} md={3} lg={4} key={index}>
                <BlogCard blog={blog} />
              </Grid>
            ))}
          </Grid>
        </Grid>
        {searchQuery && blogs.length === 0 && (
            <Typography variant="subtitle1" component="h1">
              {`No Blogs Found :( Try Searching for something else or `}
              <Link to="/create">Create a new blog</Link>
            </Typography>
        )}
      </Grid>
    </Box>
  );
};

export default BlogList;
