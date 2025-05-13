import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CreateEventPage from "./pages/CreateEventPage";
import AddParticipantsPage from "./pages/AddParticipantsPage";
import EventDetailPage from "./pages/EventDetailPage";
import AddExpensePage from "./pages/AddExpensePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/create-event" element={<CreateEventPage />} />
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
