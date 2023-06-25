import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getStorage, getDownloadURL } from 'firebase/storage';

const initialState = {
    isLoading: false,
    error: null,
};

export const createBlog = createAsyncThunk('createBlog/createBlog', async (blogData, { rejectWithValue }) => {
    try {
        const storage = getStorage();
        const storageRef = ref(storage, `images/${blogData.image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, blogData.image);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
            },
            (error) => {
                console.log(error);
            }
        );

        await uploadTask;

        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        blogData.imageUrl = downloadURL;
        delete blogData.image;

        const blogRef = collection(db, 'blogs');
        await addDoc(blogRef, blogData);

        return blogData;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

const createBlogSlice = createSlice({
    name: 'createBlog',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createBlog.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createBlog.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(createBlog.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export default createBlogSlice.reducer;