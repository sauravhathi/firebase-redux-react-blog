import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignIn from './components/SignIn';
import BlogList from './components/BlogList';
import CreateBlog from './components/CreateBlog';
import { Provider } from 'react-redux';
import store from './store';
import Container from '@material-ui/core/Container';
import Blog from './blog/Blog';
const App = () => {

  return (
    <Provider store={store}>
      <Container>
        <Router>
          <Routes>
            <Route path="/" element={<BlogList />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/create" element={<CreateBlog />} />
            <Route path="/blog/:id" element={<Blog />} />
          </Routes>
        </Router>
      </Container>
    </Provider>
  );
};

export default App;