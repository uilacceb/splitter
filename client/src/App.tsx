import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CreateEventPage from "./pages/CreateEventPage";
import AddParticipantsPage from "./pages/AddParticipantsPage";
import EventDetailPage from "./pages/EventDetailPage";
import AddExpensePage from "./pages/AddExpensePage";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import FriendsPage from "./pages/FriendsPage";
import GroupPage from "./pages/GroupPage";
import AccountPage from "./pages/AccountPage";
import AddFriendsPage from "./pages/AddFriendsPage";
import Requests from "./pages/RequestPage";

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
        <Route
          path="/event/:eventId/add-participants"
          element={<AddParticipantsPage />}
        />
        <Route
          path="/event/:eventId/add-expense"
          element={<AddExpensePage />}
        />
        <Route path="/event/:eventId/details" element={<EventDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
