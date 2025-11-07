import { Layout } from "@stellar/design-system";
import { Outlet } from "react-router-dom";
import AccountManager from "./components/AccountManager";

const App: React.FC = () => (
  <main>
    <Layout.Header projectId="My App" projectTitle="My App" />
    <Outlet />
    <AccountManager />
    <Layout.Footer>
      <span>
        © {new Date().getFullYear()} My App. Licensed under the{" "}
        <a
          href="http://www.apache.org/licenses/LICENSE-2.0"
          target="_blank"
          rel="noopener noreferrer"
        >
          Apache License, Version 2.0
        </a>
        .
      </span>
    </Layout.Footer>
  </main>
);

export default App;
