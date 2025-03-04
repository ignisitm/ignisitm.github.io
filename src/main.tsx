import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App"; // Import your main component

const OpenMaximizedWindow = () => {
	const [newWindow, setNewWindow] = useState<Window | null>(null);

	const openWindow = () => {
		const width = window.screen.availWidth;
		const height = window.screen.availHeight;

		// Open a new blank window
		const win = window.open(
			"",
			"_blank",
			`width=${width},height=${height},top=0,left=0,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
		);

		if (win) {
			setNewWindow(win);

			// Wait for the new window to load, then render the component inside it
			win.document.write("<div id='app-root'></div>");
			win.document.title = "Firelink | IGNIS";
			win.document.close(); // Close writing stream
		}
	};

	React.useEffect(() => {
		if (newWindow && newWindow.document) {
			const root = newWindow.document.getElementById("app-root");
			if (root) {
				createRoot(root).render(<App />);
			}
		}
	}, [newWindow]);

	return <button onClick={openWindow}>Open Maximized</button>;
};

export default OpenMaximizedWindow;
