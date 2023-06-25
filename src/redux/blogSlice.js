import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, getDoc, doc, updateDoc, increment, arrayUnion, arrayRemove, orderBy, limit, query } from 'firebase/firestore';
import { db } from '../firebase';

const initialState = {
  blog: [],
  popularBlogs: [],
  isLoading: true,
  error: null,
};

const serializeTimestamp = (timestamp) => {
  if (!timestamp || !timestamp.toDate || typeof timestamp.toDate !== 'function') {
    return '';
  }

  return timestamp.toDate().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};


export const fetchBlogs = createAsyncThunk('blog/fetchBlogs', async (searchQuery, { dispatch, rejectWithValue }) => {
  try {
    const blogsRef = collection(db, 'blogs');
    const blogsSnapshot = await getDocs(blogsRef);
    const blogs = blogsSnapshot.docs.map((blog) => {
      const blogData = blog.data();
      const { published, updated, ...restData } = blogData;
      return {
        id: blog.id,
        published: serializeTimestamp(published),
        updated: serializeTimestamp(updated),
        ...restData,
      };
    });

    if (searchQuery) {
      const searchQueryLower = searchQuery.toLowerCase();
      const filteredBlogs = blogs.filter((blog) => {
        const { title, body, tags, category } = blog;
        return (
          title.toLowerCase().includes(searchQueryLower) ||
          body.toLowerCase().includes(searchQueryLower) ||
          tags.includes(searchQueryLower) ||
          category.toLowerCase().includes(searchQueryLower)
        );
      });
      return filteredBlogs;
    }

    return blogs;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchBlogById = createAsyncThunk('blog/fetchBlogById', async (id, { dispatch, rejectWithValue }) => {
  try {
    const blogRef = doc(db, 'blogs', id);
    const blogSnapshot = await getDoc(blogRef);
    if (!blogSnapshot.exists()) {
      throw new Error('Blog not found');
    }

    const blogData = blogSnapshot.data();
    const { published, updated, comments, ...restData } = blogData;

    const serializedBlog = {
      id: blogSnapshot.id,
      published: serializeTimestamp(published),
      updated: serializeTimestamp(updated),
      ...restData,
    };

    const serializedComments = comments.map((comment) => ({
      ...comment,
      published: serializeTimestamp(comment.published),
    }));

    serializedBlog.comments = serializedComments;

    return serializedBlog;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchPopularBlogs = createAsyncThunk(
  'blog/fetchPopularBlogs',
  async (_, { rejectWithValue }) => {
    try {
      const blogsRef = collection(db, 'blogs');
      const popularBlogsQuery = query(
        blogsRef,
        orderBy('views', 'desc'),
        limit(3)
      );
      const popularBlogsSnapshot = await getDocs(popularBlogsQuery);
      const popularBlogs = popularBlogsSnapshot.docs.map((blog) => {
        const blogData = blog.data();
        const { published, updated, ...restData } = blogData;
        return {
          id: blog.id,
          published: serializeTimestamp(published),
          updated: serializeTimestamp(updated),
          ...restData,
        };
      });

      return popularBlogs;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const likeBlog = createAsyncThunk('blog/likeBlog', async (id, { dispatch, rejectWithValue, getState }) => {
  try {
    const state = getState();
    const userId = state.auth.user.id;

    const blogRef = doc(db, 'blogs', id);
    const blogSnapshot = await getDoc(blogRef);
    const blogData = blogSnapshot.data();
    const likes = blogData.likes;

    if (likes.includes(userId)) {
      await updateDoc(blogRef, {
        likes: arrayRemove(userId),
      });
      return { id, likes: likes.filter((like) => like !== userId) };
    } else {
      await updateDoc(blogRef, {
        likes: arrayUnion(userId),
      });
      return { id, likes: [...likes, userId] };
    }
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addCommentToBlog = createAsyncThunk(
  'blog/addCommentToBlog',
  async ({ id, commentData }, { dispatch, rejectWithValue }) => {
    try {
      const serializedCommentData = {
        ...commentData,
        published: serializeTimestamp(commentData.published),
      };

      const blogRef = doc(db, 'blogs', id);
      const blogSnapshot = await getDoc(blogRef);
      const blogData = blogSnapshot.data();
      const comments = blogData.comments;

      const updatedComments = [...comments, serializedCommentData];
      await updateDoc(blogRef, { comments: updatedComments });

      return { id, commentData: serializedCommentData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeCommentFromBlog = createAsyncThunk(
  'blog/removeCommentFromBlog',
  async ({ id, index }, { dispatch, rejectWithValue }) => {
    try {
      const blogRef = doc(db, 'blogs', id);
      const blogSnapshot = await getDoc(blogRef);
      const blogData = blogSnapshot.data();
      const comments = blogData.comments;

      const updatedComments = [...comments];
      if (index >= 0 && index < updatedComments.length) {
        updatedComments.splice(index, 1);
      }

      await updateDoc(blogRef, { comments: updatedComments });
      return { id, index };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBlogViews = createAsyncThunk('blog/updateBlogViews', async (id, { dispatch, rejectWithValue }) => {
  try {
    const blogRef = doc(db, 'blogs', id);
    await updateDoc(blogRef, { views: increment(1) });

    return { id };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blog = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchBlogById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blog = action.payload;
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchPopularBlogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPopularBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.popularBlogs = action.payload;
      })
      .addCase(fetchPopularBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(likeBlog.fulfilled, (state, action) => {
        const { id, likes } = action.payload;
        const { blog } = state;
        if (blog && blog.id === id) {
          blog.likes = likes;
        }
      })
      .addCase(addCommentToBlog.fulfilled, (state, action) => {
        const { id, commentData } = action.payload;
        const { blog } = state;
        if (blog && blog.id === id) {
          blog.comments.push(commentData);
        }
      })
      .addCase(removeCommentFromBlog.fulfilled, (state, action) => {
        const { id, index } = action.payload;
        const { blog } = state;
        if (blog && blog.id === id) {
          blog.comments.splice(index, 1);
        }
      })
      .addCase(updateBlogViews.fulfilled, (state, action) => {
        const { id } = action.payload;
        const { blog } = state;
        if (blog && blog.id === id) {
          blog.views++;
        }
      });
  },
});

export default blogSlice.reducer;