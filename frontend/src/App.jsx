import DashboardPage from "./features/dashboard/DashboardPage.jsx";

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