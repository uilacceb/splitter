import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CreateEventPage from "./pages/CreateEventPage";
import AddExpensePage from "./pages/AddExpensePage";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import FriendsPage from "./pages/FriendsPage";
import GroupPage from "./pages/GroupPage";
import AccountPage from "./pages/AccountPage";
import AddFriendsPage from "./pages/AddFriendsPage";
import Requests from "./pages/RequestPage";
import CreateGroupPage from "./pages/CreateGroupPage";
import GroupInfoPage from "./pages/GroupInfoPage";
import EditGroupPage from "./pages/EditGroupPage";
import EventInfoPage from "./pages/EventInfoPage";
import EditExpensePage from "./pages/EditExpensePage";
import EditEventPage from "./pages/EditEventPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <FriendsPage />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-friend"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <AddFriendsPage />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-group"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <CreateGroupPage />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <Requests />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <GroupPage />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <GroupInfoPage />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId/edit"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <EditGroupPage />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId/add-event"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <CreateEventPage />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId/events/:eventId/add-expense"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <AddExpensePage />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/groups/:groupId/events/:eventId"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <EventInfoPage />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/groups/:groupId/events/:eventId/edit-expense/:expenseId"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <EditExpensePage />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId/events/:eventId/edit"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <EditEventPage />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <AccountPage />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-event"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <CreateEventPage />
              </>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
