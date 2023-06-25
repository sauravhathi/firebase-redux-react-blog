import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export const signInWithGoogle = createAsyncThunk('auth/signInWithGoogle', async (_, { dispatch, rejectWithValue }) => {
  try {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);

    return {
      id: user.uid,
      name: user.displayName,
      email: user.email,
      photoUrl: user.photoURL,
    };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const signOutUserAsync = createAsyncThunk('auth/signOutUserAsync', async (_, { dispatch, rejectWithValue }) => {
  try {
    await signOut(auth);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const checkAuthState = createAsyncThunk('auth/checkAuthState', async (_, { dispatch, rejectWithValue }) => {
  try {
    auth.onAuthStateChanged((user) => {
      if (user) {
        dispatch(
          signInWithGoogle.fulfilled({
            id: user.uid,
            name: user.displayName,
            email: user.email,
            photoUrl: user.photoURL,
          })
        );
      } else {
        dispatch(signOutUserAsync.fulfilled());
      }
    });
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = {
  user: null,
  isLoading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(signOutUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signOutUserAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
      })
      .addCase(signOutUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { setLoading } = authSlice.actions;

export default authSlice.reducer;