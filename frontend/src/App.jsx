import DashboardPage from "./features/dashboard/DashBoardPage.jsx";

function App() {
  return (
    <DashboardPage
      onHome={() => {
        window.location.href = "/";
      }}
      onLogout={() => {
        window.location.href = "/login";
      }}
    />
  );
}

export default App;